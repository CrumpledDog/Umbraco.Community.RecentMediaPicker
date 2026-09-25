using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;
using Direction = Umbraco.Cms.Core.Direction;
using UmbracoConstants = Umbraco.Cms.Core.Constants;

namespace Umbraco.Community.RecentMediaPicker.Controllers.RecentMedia
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "Umbraco.Community.RecentMediaPicker")]
    public class RecentMediaController : RecentMediaControllerBase
    {
        // Umbraco's built-in Folder media type - excluded so "recent" only ever shows actual uploaded files.
        private const string FolderMediaTypeAlias = "Folder";

        // Safety cap on how many candidates we'll scan looking for enough authorized, non-folder items,
        // so a heavily start-node-restricted user on a large site can't trigger an unbounded scan.
        private const int MaxCandidatesScanned = 1000;
        private const int ScanBatchSize = 100;

        private readonly IMediaService _mediaService;
        private readonly IEntityService _entityService;
        private readonly AppCaches _appCaches;
        private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
        private readonly IUserService _userService;

        public RecentMediaController(
            IMediaService mediaService,
            IEntityService entityService,
            AppCaches appCaches,
            IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
            IUserService userService)
        {
            _mediaService = mediaService;
            _entityService = entityService;
            _appCaches = appCaches;
            _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
            _userService = userService;
        }

        /// <summary>
        /// Gets the most recently uploaded media files (folders excluded) from anywhere in the media
        /// tree, regardless of nesting depth, respecting the current user's media start-node permissions.
        /// Pass <paramref name="mine"/> to restrict results to files uploaded by the current user.
        /// </summary>
        [HttpGet("media/recent")]
        [ProducesResponseType(typeof(RecentMediaResponseModel), StatusCodes.Status200OK)]
        public Task<IActionResult> Recent(int take = 50, bool mine = false)
        {
            IUser? user = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;
            if (user is null)
            {
                return Task.FromResult<IActionResult>(Unauthorized());
            }

            int[]? startNodeIds = user.CalculateMediaStartNodeIds(_entityService, _appCaches);

            var accumulated = new List<IMedia>();
            var pageIndex = 0;
            var totalScanned = 0;
            var isPartial = false;
            Ordering ordering = Ordering.By("createDate", Direction.Descending);

            while (accumulated.Count < take)
            {
                if (totalScanned >= MaxCandidatesScanned)
                {
                    isPartial = true;
                    break;
                }

                IEnumerable<IMedia> batch = _mediaService.GetPagedDescendants(
                    UmbracoConstants.System.Root,
                    pageIndex,
                    ScanBatchSize,
                    out long totalRecords,
                    ordering: ordering);

                List<IMedia> batchList = batch.ToList();
                if (batchList.Count == 0)
                {
                    break;
                }

                totalScanned += batchList.Count;

                IEnumerable<IMedia> authorized = batchList
                    .Where(m => !string.Equals(m.ContentType.Alias, FolderMediaTypeAlias, StringComparison.Ordinal))
                    .Where(m => !mine || m.CreatorId == user.Id)
                    .Where(m => ContentPermissions.HasPathAccess(m.Path, startNodeIds, UmbracoConstants.System.RecycleBinMedia));

                accumulated.AddRange(authorized);

                pageIndex++;
                if (pageIndex * (long)ScanBatchSize >= totalRecords)
                {
                    break;
                }
            }

            List<IMedia> finalItems = accumulated.Take(take).ToList();

            // Batch-resolve every writer's display name in one call, mirroring core's own
            // ContentCollectionPresentationFactory.ResolveUserNames - not a per-item DB round-trip.
            int[] writerIds = finalItems.Select(m => m.WriterId).Where(id => id != 0).Distinct().ToArray();
            Dictionary<int, string?> userNames = writerIds.Length > 0
                ? _userService.GetUsersById(writerIds).ToDictionary(u => u.Id, u => u.Name)
                : new Dictionary<int, string?>();

            List<RecentMediaItemResponseModel> items = finalItems
                .Select(m => new RecentMediaItemResponseModel
                {
                    Id = m.Key,
                    Name = m.Name ?? string.Empty,
                    Icon = m.ContentType.Icon,
                    CreateDate = m.CreateDate,
                    UpdateDate = m.UpdateDate,
                    UpdatedByName = userNames.GetValueOrDefault(m.WriterId),
                })
                .ToList();

            var result = new RecentMediaResponseModel
            {
                Items = items,
                IsPartial = isPartial,
            };

            return Task.FromResult<IActionResult>(Ok(result));
        }
    }
}
