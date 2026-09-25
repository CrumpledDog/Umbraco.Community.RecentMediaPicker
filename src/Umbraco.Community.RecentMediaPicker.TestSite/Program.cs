using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.OperationStatus;
using Direction = Umbraco.Cms.Core.Direction;
using UmbracoConstants = Umbraco.Cms.Core.Constants;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .Build();

WebApplication app = builder.Build();

await app.BootUmbracoAsync();


app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();

        // Dev-only seeding endpoint for manually demoing the Recent Media picker's "by me"/"by everyone"
        // split with real data: creates a couple of extra backoffice users (if they don't already exist)
        // and reassigns a handful of existing media items to them with staggered CreateDates, so the two
        // scopes actually return different results. Not part of the Umbraco.Community.RecentMediaPicker package itself -
        // a TestSite-only dev fixture. Trigger with: curl -X POST https://localhost:44333/dev/seed-recent-media-demo
        u.EndpointRouteBuilder.MapPost("/dev/seed-recent-media-demo", async (
            IUserService userService,
            IUserGroupService userGroupService,
            IMediaService mediaService,
            IWebHostEnvironment env) =>
        {
            if (!env.IsDevelopment())
            {
                return Results.NotFound();
            }

            (string Name, string Email)[] demoUsers =
            [
                ("Ella Editor", "ella.editor@example.com"),
                ("Sam Support", "sam.support@example.com"),
            ];

            IUserGroup? editorGroup = await userGroupService.GetAsync(UmbracoConstants.Security.EditorGroupKey);
            if (editorGroup is null)
            {
                return Results.Problem("Could not resolve the built-in Editor user group.");
            }

            var createdUsers = new List<string>();
            var users = new List<IUser>();

            foreach ((string name, string email) in demoUsers)
            {
                IUser? existing = userService.GetByEmail(email);
                if (existing is not null)
                {
                    users.Add(existing);
                    continue;
                }

                var model = new UserCreateModel
                {
                    UserName = email,
                    Email = email,
                    Name = name,
                    UserGroupKeys = new HashSet<Guid> { editorGroup.Key },
                    Kind = UserKind.Default,
                };

                Attempt<UserCreationResult, UserOperationStatus> result =
                    await userService.CreateAsync(UmbracoConstants.Security.SuperUserKey, model, approveUser: true);

                if (!result.Success || result.Result.CreatedUser is null)
                {
                    return Results.Problem($"Failed to create demo user {email}: {result.Status}");
                }

                users.Add(result.Result.CreatedUser);
                createdUsers.Add($"{name} ({email}) - password: {result.Result.InitialPassword}");
            }

            // Reassign a handful of existing (non-folder) media items across the demo users with staggered
            // CreateDates, so "by me" (whichever user you're logged in as) vs "by everyone" has real,
            // visible differences to demo - today/yesterday/this-week spread, not all identical.
            List<IMedia> candidates = mediaService
                .GetPagedDescendants(UmbracoConstants.System.Root, 0, 60, out _, ordering: Ordering.By("createDate", Direction.Descending))
                .Where(m => !string.Equals(m.ContentType.Alias, "Folder", StringComparison.Ordinal))
                .ToList();

            int[] hoursAgo = [1, 5, 26, 30, 70, 96];
            var reassignedMedia = new List<string>();

            for (var i = 0; i < hoursAgo.Length && i < candidates.Count; i++)
            {
                IMedia media = candidates[i];
                IUser targetUser = users[i % users.Count];

                media.CreatorId = targetUser.Id;
                media.CreateDate = DateTime.UtcNow.AddHours(-hoursAgo[i]);
                // Passing targetUser.Id here (instead of the default Save(media) overload, which
                // defaults to Constants.Security.SuperUserId) also sets WriterId to the same demo
                // user - IMediaService.Save always does `media.WriterId = userId` unconditionally,
                // regardless of whether the item already had an identity. Without this, every
                // item's "Updated by" would show Administrator (whoever called Save), even though
                // CreatorId ("by me"/"by everyone") was varied.
                mediaService.Save(media, targetUser.Id);

                reassignedMedia.Add($"{media.Name} -> {targetUser.Name} ({media.CreateDate:u})");
            }

            return Results.Ok(new { createdUsers, reassignedMedia });
        });
    });

await app.RunAsync();
