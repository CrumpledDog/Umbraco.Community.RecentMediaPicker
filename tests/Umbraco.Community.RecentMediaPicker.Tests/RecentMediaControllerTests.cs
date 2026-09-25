using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Entities;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Persistence.Querying;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Tests.Common.Builders;
using Umbraco.Cms.Tests.Common.Builders.Extensions;
using Umbraco.Community.RecentMediaPicker.Controllers.RecentMedia;
using UmbracoConstants = Umbraco.Cms.Core.Constants;

namespace Umbraco.Community.RecentMediaPicker.Tests;

// Unit tests for RecentMediaController.Recent(...) - the one piece of real, testable logic in this
// package. Follows the same idiom as Umbraco's own MediaPermissionsTests (mock the service interfaces,
// use AppCaches.Disabled directly rather than mocking it, use UserBuilder for test IUsers) - no full
// Umbraco CMS bootstrap or the Umbraco-CMS source tree required, only the Umbraco.Cms.Tests package.
//
// Important permission-semantics detail (confirmed directly against UserExtensions.CalculateMediaStartNodeIds /
// ContentPermissions.HasPathAccess): an empty start-node array means NO access, not unrestricted access -
// genuine root-level access requires the start-node array to explicitly contain Constants.System.Root (-1).
// A user with no configured start media nodes at all would see nothing via this code path.
[TestFixture]
public class RecentMediaControllerTests
{
    private const int ScanBatchSize = 100; // must match RecentMediaController's own private const

    private Mock<IMediaService> _mediaServiceMock = null!;
    private Mock<IEntityService> _entityServiceMock = null!;
    private Mock<IBackOfficeSecurityAccessor> _backOfficeSecurityAccessorMock = null!;
    private Mock<IBackOfficeSecurity> _backOfficeSecurityMock = null!;
    private Mock<IUserService> _userServiceMock = null!;

    [SetUp]
    public void SetUp()
    {
        _mediaServiceMock = new Mock<IMediaService>();
        _entityServiceMock = new Mock<IEntityService>();
        _backOfficeSecurityAccessorMock = new Mock<IBackOfficeSecurityAccessor>();
        _backOfficeSecurityMock = new Mock<IBackOfficeSecurity>();
        _userServiceMock = new Mock<IUserService>();

        _backOfficeSecurityAccessorMock.Setup(x => x.BackOfficeSecurity).Returns(_backOfficeSecurityMock.Object);
        _userServiceMock.Setup(x => x.GetUsersById(It.IsAny<int[]>())).Returns(new List<IUser>());
    }

    private RecentMediaController CreateController() => new(
        _mediaServiceMock.Object,
        _entityServiceMock.Object,
        AppCaches.Disabled,
        _backOfficeSecurityAccessorMock.Object,
        _userServiceMock.Object);

    /// <summary>A user with genuine root-level media access (start node explicitly at Constants.System.Root).</summary>
    private IUser CreateUnrestrictedUser()
    {
        IUser user = new UserBuilder().WithId(1).WithName("Alice").WithStartMediaIds(new[] { UmbracoConstants.System.Root }).Build();
        _entityServiceMock.Setup(x => x.GetAllPaths(UmbracoObjectTypes.Media, It.IsAny<int[]>())).Returns(new List<TreeEntityPath>());
        return user;
    }

    /// <summary>A user restricted to start node <paramref name="startNodeId"/>, whose path is <paramref name="startNodePath"/>.</summary>
    private IUser CreateRestrictedUser(int startNodeId, string startNodePath)
    {
        IUser user = new UserBuilder().WithId(1).WithName("Restricted").WithStartMediaIds(new[] { startNodeId }).Build();
        _entityServiceMock.Setup(x => x.GetAllPaths(UmbracoObjectTypes.Media, It.IsAny<int[]>()))
            .Returns(new List<TreeEntityPath> { new TreeEntityPath { Id = startNodeId, Path = startNodePath } });
        return user;
    }

    private static Mock<IMedia> CreateMediaMock(string name, string path, int creatorId, string contentTypeAlias = "Image")
    {
        var contentTypeMock = new Mock<ISimpleContentType>();
        contentTypeMock.Setup(c => c.Alias).Returns(contentTypeAlias);
        contentTypeMock.Setup(c => c.Icon).Returns("icon-picture");

        var mediaMock = new Mock<IMedia>();
        mediaMock.Setup(m => m.Name).Returns(name);
        mediaMock.Setup(m => m.Path).Returns(path);
        mediaMock.Setup(m => m.CreatorId).Returns(creatorId);
        mediaMock.Setup(m => m.WriterId).Returns(creatorId);
        mediaMock.Setup(m => m.ContentType).Returns(contentTypeMock.Object);
        return mediaMock;
    }

    /// <summary>Sets up a single-page GetPagedDescendants call returning exactly <paramref name="items"/>.</summary>
    private void SetUpSinglePage(IReadOnlyList<IMedia> items)
    {
        long totalRecords = items.Count;
        _mediaServiceMock
            .Setup(m => m.GetPagedDescendants(
                It.IsAny<int>(),
                It.IsAny<long>(),
                It.IsAny<int>(),
                out totalRecords,
                It.IsAny<IQuery<IMedia>>(),
                It.IsAny<Ordering>()))
            .Returns(items);
    }

    [Test]
    public async Task Unrestricted_user_excludes_folders_and_returns_authorized_items()
    {
        _backOfficeSecurityMock.Setup(x => x.CurrentUser).Returns(CreateUnrestrictedUser());

        Mock<IMedia> folder = CreateMediaMock("A Folder", "-1,1", 1, "Folder");
        Mock<IMedia> image = CreateMediaMock("image.jpg", "-1,2", 1, "Image");
        SetUpSinglePage(new[] { folder.Object, image.Object });

        RecentMediaController controller = CreateController();
        var result = (OkObjectResult)(await controller.Recent())!;
        var response = (RecentMediaResponseModel)result.Value!;

        Assert.That(response.Items.Select(i => i.Name), Is.EqualTo(new[] { "image.jpg" }));
        Assert.That(response.IsPartial, Is.False);
    }

    [Test]
    public async Task Mine_true_only_returns_the_current_users_own_uploads()
    {
        _backOfficeSecurityMock.Setup(x => x.CurrentUser).Returns(CreateUnrestrictedUser());

        Mock<IMedia> mine = CreateMediaMock("mine.jpg", "-1,2", creatorId: 1);
        Mock<IMedia> someoneElses = CreateMediaMock("theirs.jpg", "-1,3", creatorId: 2);
        SetUpSinglePage(new[] { mine.Object, someoneElses.Object });

        RecentMediaController controller = CreateController();
        var result = (OkObjectResult)(await controller.Recent(mine: true))!;
        var response = (RecentMediaResponseModel)result.Value!;

        Assert.That(response.Items.Select(i => i.Name), Is.EqualTo(new[] { "mine.jpg" }));
    }

    [Test]
    public async Task Start_node_restricted_user_is_filtered_regardless_of_mine_flag()
    {
        // User can only see paths under -1,5. Both items below are "everyone" uploads (creator id 2,
        // not the current user 1) - so this is purely testing the path filter, not the mine filter.
        _backOfficeSecurityMock.Setup(x => x.CurrentUser).Returns(CreateRestrictedUser(5, "-1,5"));

        Mock<IMedia> accessible = CreateMediaMock("visible.jpg", "-1,5,10", creatorId: 2);
        Mock<IMedia> inaccessible = CreateMediaMock("hidden.jpg", "-1,999,11", creatorId: 2);
        SetUpSinglePage(new[] { accessible.Object, inaccessible.Object });

        RecentMediaController controller = CreateController();
        var result = (OkObjectResult)(await controller.Recent(mine: false))!;
        var response = (RecentMediaResponseModel)result.Value!;

        Assert.That(response.Items.Select(i => i.Name), Is.EqualTo(new[] { "visible.jpg" }));
    }

    [Test]
    public async Task Scan_cap_hit_before_take_satisfied_sets_IsPartial_true()
    {
        // Restricted to start node 5 - every scanned item lives outside it, so it's never authorized,
        // `take` is never satisfied, and the scan must keep paging until MaxCandidatesScanned (1000) is hit.
        _backOfficeSecurityMock.Setup(x => x.CurrentUser).Returns(CreateRestrictedUser(5, "-1,5"));

        Mock<IMedia> neverAuthorized = CreateMediaMock("hidden.jpg", "-1,999", creatorId: 2);
        var fullBatch = Enumerable.Repeat(neverAuthorized.Object, ScanBatchSize).ToList();

        long totalRecords = 5000; // large enough that the loop never stops early on totalRecords
        _mediaServiceMock
            .Setup(m => m.GetPagedDescendants(
                It.IsAny<int>(),
                It.IsAny<long>(),
                It.IsAny<int>(),
                out totalRecords,
                It.IsAny<IQuery<IMedia>>(),
                It.IsAny<Ordering>()))
            .Returns(fullBatch);

        RecentMediaController controller = CreateController();
        var result = (OkObjectResult)(await controller.Recent())!;
        var response = (RecentMediaResponseModel)result.Value!;

        Assert.That(response.Items, Is.Empty);
        Assert.That(response.IsPartial, Is.True);
    }
}
