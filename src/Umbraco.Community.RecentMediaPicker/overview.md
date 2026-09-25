# Umbraco.Community.RecentMediaPicker — "Recent Media" for Umbraco

An Umbraco CMS package that solves the long-standing (2019) community request: let editors find
recently-uploaded media without needing to remember which folder it landed in.

Built during development under an earlier working name, later renamed to
`Umbraco.Community.RecentMediaPicker` ahead of the first real release: descriptive and searchable, and
"Community" is meant here as an invitation to collaborate rather than a claim of official endorsement.
Now maintained as a Crumpled Dog package. See [Package identity](#package-identity) for the full
reasoning.

Built as a real, working proof-of-concept package (not just a design doc) to (a) give editors something
usable today, and (b) provide evidence for a future scoped Umbraco core RFC (see Phase 4).

---

## Status summary

| Phase | What | Status |
|---|---|---|
| **1** | "Recent" layout in the Media section (collection view + custom recursive backend endpoint) | ✅ **Done, verified working live** |
| **2** | Alternative Media Picker property editor UI with a Recent-first picker modal | ✅ **Done, verified live** - all known UX parity issues resolved (see [Known issues](#known-issues-history)); Phase 2b added Accepted Types, focal point/crop editing, and add-folder-from-breadcrumb; Data Type-level Start Node field deliberately not honored (user-level Start Node permissions still are) (see [Package identity](#package-identity)) |
| **3** | `creatorId`/"Mine" filter | ✅ **Achieved, via a different route than originally planned** — see note below |
| **4** | Scoped core RFC | ⬜ Not started — no longer blocked on Phase 2 polish, just not prioritized yet |

**Note on Phase 3**: the original plan scoped this as extending *core's* `ByKeyMediaCollectionController`
with a `creatorId` param. In practice, once Phase 2 required a **dedicated custom backend endpoint**
anyway (core's collection endpoint turned out to be non-recursive — see
[Research summary](#research-summary)), the "Mine" filter was simply added as a `mine` bool query param
directly on our own `RecentMediaController`. Simpler than the original plan, no core endpoint touched.

### Remaining work
1. Persist the "by me"/"by everyone" toggle choice via interaction memory (currently resets to "by me"
   on every picker open) - the folder *location* already persists this way, the scope toggle doesn't.
2. Phase 4 - open a scoped core RFC (see [Steps / phases](#steps--phases)).
3. Decide whether to keep the manual TestSite scaffolding as permanent test fixtures (see
   [Further considerations](#further-considerations)).
4. Package release assets still needed from the maintainer directly (not something to generate
   automatically): a real package icon image, and a final editorial pass on the README/marketplace
   description copy.

---

## Package identity

- **Name**: `Umbraco.Community.RecentMediaPicker` - descriptive (searchable on NuGet/the Marketplace/
  Google, memorable enough to recommend in conversation or type into `dotnet add package`) and
  self-effacing about maintenance: "Community" reads here as "here's a thing I built, come help/take
  it further" rather than a claim of collective endorsement or official blessing. Confirmed via the
  actual Marketplace listing rules that this prefix is not gatekept or reserved - it's a branding
  choice, not a technical one.
- Earlier in development this package was built under a different, harder-to-say working name. Renamed
  before the first real release specifically because a name nobody can say or spell doesn't get
  recommended or remembered. The package is now maintained as part of Crumpled Dog's Umbraco package
  set, following the same engineering conventions as the rest of that set (see `.github/CONTRIBUTING.md`
  and `.github/copilot-instructions.md`) - the picker remains genuinely fragile to changes in core's own
  Media Picker internals, which is worth bearing in mind for anyone extending it.
- The package name is purely a developer/NuGet-id/namespace identifier — **never** surfaced to editors in
  the backoffice UI (the property editor's own label is "Media Picker (Recent-first)").
- **Manifest/alias convention**: `Umbraco.Community.RecentMediaPicker.<ExtensionType>.<Name>`, e.g.
  `Umbraco.Community.RecentMediaPicker.CollectionView.Media.Recent`,
  `Umbraco.Community.RecentMediaPicker.PropertyEditorUi.RecentMediaPicker`,
  `Umbraco.Community.RecentMediaPicker.Modal.RecentMediaPicker`, `Umbraco.Community.RecentMediaPicker.Bundle`
  - kept at full length deliberately, since aliases are global across the whole backoffice and long
  aliases are normal in Umbraco. Custom element tag names and their entity-type constant use a shorter
  `recent-media-picker-*` / `RecentMediaPicker.*` form instead, since DOM tag verbosity is more visible
  to devtools users and the term is narrow/specific enough that collision risk is low.
  C# namespace: `Umbraco.Community.RecentMediaPicker`.
- **NuGet PackageId**: `Umbraco.Community.RecentMediaPicker` - same as the C# namespace/repo name, no
  separate marketplace-convention prefix layered on top (unlike the package's original working name,
  which prefixed `Umbraco.Community.` onto the PackageId only, keeping a different name for the
  repo/namespace).
- **User-level/user-group Start Node permissions ARE honored - only the Data Type-level "Start node" and
  "Ignore User Start Nodes" fields are deliberately not.** Those two fields still show on the Data Type's
  Settings screen (inherited from the shared `Umbraco.MediaPicker3` config schema, kept so a Data Type
  can switch to core's own Media Picker UI without a migration), but this picker doesn't read either one.
  Confirmed directly against `RecentMediaController.Recent(...)`: `user.CalculateMediaStartNodeIds(...)`
  is computed from the current user (the real, account-level permission) and `ContentPermissions.HasPathAccess`
  is applied to every item unconditionally, regardless of the `mine` flag - so real per-user media
  permissions already correctly scope both "by me" and "by everyone", with no Data Type-level config
  needed or consulted. A Data Type-level Start Node would only ever add a client-side landing-location
  convenience on top of that, with no additional access-control purpose - and if an editor genuinely
  wants a picker constrained to one small fixed folder regardless of who's using it, recency isn't a
  useful feature for that case anyway; core's own Media Picker (which does honor both fields) is the
  right tool there. See the root [README](../../README.md) for the user-facing version of this note.

---

## Research summary (confirmed against the Umbraco-CMS source)

**Frontend**
- Core's `UmbMediaPickerModalElement` (media picker modal) is a **closed, self-contained component** —
  not built on the extensible `collectionView`/`collectionAction` manifest system the Media *section*
  browser uses, and almost everything on it is a true JS `#private` field/method. It **cannot be
  subclassed** — only fully reimplemented. There's also no `overwrites`/alias-replace mechanism for
  swapping out a registered `modal` manifest by alias.
- **Supported, safe extension path**: register a brand-new `propertyEditorUi` manifest targeting the same
  schema (`propertyEditorSchemaAlias: 'Umbraco.MediaPicker3'`) — exactly what this package does. A custom
  modal for it can reuse *public* exports rather than forking: `UmbPickerModalBaseElement`,
  `UmbMediaTreeRepository`, `UmbMediaItemRepository`, `UmbMediaSearchProvider`, `UmbDropzoneMediaElement`,
  `UmbPickerInputContext` (all confirmed present in the real v17.6.2 runtime bundle, not just the npm
  devDependency types — see the version-skew note below).
- **Version-skew trap** (hit repeatedly during this build): the npm `@umbraco-cms/backoffice`
  devDependency used to compile this package can be a *newer* version than the actual `Umbraco.Cms` NuGet
  package pinned in the TestSite. Some APIs the devDependency's types claim exist (e.g.
  `UmbCollectionViewElementBase`, `authContext.configureClient()`) do **not** actually exist in the older
  runtime bundle, causing silent runtime crashes with clean compiles. Always verify real availability by
  inspecting the actual installed static web assets bundle
  (`%USERPROFILE%\.nuget\packages\umbraco.cms.staticassets\<version>\staticwebassets\umbraco\backoffice\packages\...`)
  directly, not just the TypeScript types.
- **Core's Media collection endpoint is not recursive.** `GET /media/collection/{id}` returns only direct
  children, ordered by `createDate` — great for a single folder, useless for a genuine cross-tree "recent"
  view. Confirmed via live testing: a file 3 folders deep (`camping.jpg`) never appeared via this endpoint,
  regardless of ordering params. This is *why* Phase 1/2 both needed a dedicated custom backend endpoint
  rather than reusing the existing one.

**Backend**
- No new tracking infrastructure needed — `CreateDate`/`CreatorId` already exist on every media item and
  are indexed. `IMediaService.GetPagedDescendants(Constants.System.Root, ..., ordering: Ordering.By("createDate", Direction.Descending))`
  already returns all media (not scoped to one folder) ordered by creation date — this is what our custom
  endpoint is built on.
- `IMediaPermissionService.FilterAuthorizedAccessAsync` (used by core's collection endpoint for
  permission filtering) did **not exist** in Umbraco.Cms 17.0.0, the version originally pinned here —
  confirmed via a C# compiler error when first attempted (not re-verified against the 17.6.2 floor this
  package now targets). Used the older, still-present primitives instead:
  `user.CalculateMediaStartNodeIds(entityService, appCaches)` + `ContentPermissions.HasPathAccess(path, startNodeIds, recycleBinId)`.
  Same underlying logic, older API surface — **the version-skew problem isn't just a frontend risk, it
  hits backend C# too**, just caught immediately by the compiler instead of silently at runtime.
- **Permission semantics, confirmed while writing unit tests**: an empty (or null) start-node array means
  *no* access, not unrestricted access - genuine root-level access requires the array to explicitly
  contain `Constants.System.Root` (-1). A user with no configured start media nodes at all sees nothing
  via `ContentPermissions.HasPathAccess`. Real admin/superuser "sees everything" behaviour comes from
  their start node actually being Root, not from an absence of restriction.

---

## Permissions / start-node safety (critical constraint, followed throughout)

Umbraco media permissions are **start-node based**: a user can only see the subtree(s) under their
group's/their own configured start node(s) (`CalculateMediaStartNodeIds()`).

**Mandatory rule enforced in `RecentMediaController`**: never return media outside a restricted user's
start nodes. The controller:
1. Resolves the current user's effective start node IDs.
2. Pages through `IMediaService.GetPagedDescendants(Root, ..., ordering: createDate desc)` in batches.
3. Filters out folders and anything failing `ContentPermissions.HasPathAccess(...)`.
4. Accumulates authorized items until either `take` is satisfied or a **hard scan cap**
   (`MaxCandidatesScanned = 1000`) is hit — at which point it honestly reports `isPartial: true` rather
   than silently under-filling the page. This cap exists specifically so a heavily-restricted user on a
   large, noisy site can't trigger an unbounded scan (a genuine resource-consumption/availability concern,
   not just a performance nicety).

Covered by `Umbraco.Community.RecentMediaPicker.Tests/RecentMediaControllerTests.cs` - see
[Testing strategy](#testing-strategy).

### Considered and rejected: redacted/placeholder tiles for inaccessible recent uploads
Considered padding pages with greyed-out "you can't see this" placeholder tiles instead of the
fetch-filter-accumulate loop above. **Rejected**: even a content-free placeholder leaks the *existence*,
approximate *volume*, and *upload timing* of a folder the user can't access — a real information
disclosure concern for genuinely sensitive folders (HR, legal hold, embargoed material). The
`isPartial` flag (a single boolean, no per-item metadata) is the accepted middle ground.

### Known edge case
Permission filtering happens *after* paging candidates from the DB (same accepted limitation as core's
own `ContentListViewServiceBase`). For a single-folder browse this rarely matters; for a genuinely
cross-tree "recent" view it's more likely to under-fill a page for restricted users — mitigated by the
scan-and-accumulate loop + `isPartial` signal above, not by trying to guarantee exact page sizes.

---

## Key design decisions

1. **Package + core RFC, package first.** Ship a working package today using fully-supported extension
   points; use it as evidence for a narrow, scoped core RFC later (Phase 4) — not "please build recent
   media" but "make the picker's toolbar/result-source genuinely extensible, the way the Media section's
   collection view already is."
2. **Query-based, no new tracking infra.** `CreateDate`/`CreatorId` already exist on every media item —
   no new database tables, no session tracking.
3. **UX mechanism: recency is woven into normal folder browsing, not a separate mode.** The picker opens
   exactly where core opens it; a "Recently added" strip sits above the folder grid only at the landing
   location, and a permanently-docked footer pill gives one-click access to a full "Recently added" view
   from anywhere. Not folded into the cards/table layout switcher (that control is about *presentation*,
   "Recent" is a *data filter/scope* — conflating them would confuse both).
4. **"Recent" = sort order, not a hard time window.** A pure `createDate desc` sorted, paginated list
   degrades gracefully (always shows *something*); a hard cutoff (e.g. "last 3 days") risks confusing
   empty states on quiet sites. Client-side-only date-group headers (Today/Yesterday/This week/This
   month/Older) plus an explicit divider at the "Older" transition ("— that's everything recently
   uploaded, older items below —") keep the "Recent" label honest without a hard filter.
5. **`CreateDate` only, never `UpdateDate`.** The goal is finding *newly added* assets to avoid duplicate
   re-uploads — driving this off `UpdateDate` would let a trivial metadata edit on an old asset jump it to
   the top of "Recent", actively working against the feature's purpose.
6. **"All" vs "Mine" is a runtime toggle, not an admin/Data-Type-level lock**, defaulting to **"Mine"**:
   - Both "what did I just upload" and "what did a teammate just upload" are real, named use cases from
     the original ask — a fixed admin setting can't serve both.
   - Defaulting to "Mine" also has a performance benefit: an editor can only ever upload into folders they
     already have access to, so "Mine" mostly sidesteps the expensive permission-filtered scan loop, which
     then only runs when a user *deliberately* opts into "All".
   - Required, not optional: an honest empty-state message + one-click switch to "All" when "Mine" returns
     zero results (never a silent behind-the-scenes substitution).
7. **Data Type-level Start Node field is not honored, by design (user-level Start Node permissions still are)** (Phase 2b) — see [Package identity](#package-identity) for
   the full reasoning. Accepted Types, focal point/crop editing, and add-folder-from-breadcrumb *are*
   honored, matching core exactly.

---

## Known issues (history)

Four UX parity issues were raised via hands-on comparison against core's real Media Picker modal during
early Phase 2 testing. All four are now resolved or superseded - kept here as a record, not a live
task list:

1. **Button label "Add" → "+ Choose"** - fixed; the property editor uses core's own `general_choose`
   localization term.
2. **Card selection functionally broken whenever the picker's selection was empty** - the most subtle
   of the four: `select-only` on the picker's cards was gated on "is anything already selected" instead
   of being unconditionally true for any non-navigable item (matching core's own
   `?select-only=${this._isSelectionMode || canNavigate === false}` pattern). Only manifested on the
   *first* click into an empty selection, which is why it went unnoticed through most manual testing -
   caught via a user report during Phase 2b browser testing, confirmed to reproduce identically on the
   plain unfiltered picker too (so unrelated to Phase 2b's own Accepted Types/Start Node work), and
   fixed by making `select-only` unconditional across all three card renderers.
3. **Browse-mode folder navigation and search** - superseded by Phase 2b's redesign: the current
   architecture doesn't have separate "Recent"/"Browse" tabs at all (that whole model was replaced by
   recency-woven-into-browsing, see [Key design decisions](#key-design-decisions) #3) - folder click
   correctly navigates in, and a persistent search box is always present.
4. **Search/Upload discoverability** - resolved by the same redesign: search and Upload are always
   visible in the toolbar the moment the picker opens, with no tab to find first.

---

## Implementation notes / gotchas for maintainers

- **uSync + custom `EditorUIAlias`**: a brand-new Data Type defined via a uSync XML config file with a
  custom `EditorUIAlias` did **not** apply correctly on initial import — it silently fell back to core's
  default UI for the schema. Fixed by opening the Data Type in the backoffice UI once, manually
  re-selecting the correct property editor UI via "Change", and saving — after that, uSync re-exports the
  correct alias correctly. If creating more Data Types this way, expect to need this one-time manual
  fix-up per Data Type.
- **Static web assets caching**: a plain `dotnet run` resolves static assets once at startup — rebuilding
  the Client project alone does **not** get picked up without a full process restart.
- **Windows long-path limits during the rename**: renaming the project folders hit `MAX_PATH` failures
  partway through `Client/node_modules` (nested `@umbraco-cms/backoffice` type declaration paths are
  already close to the limit) - `node_modules` isn't something to move/rename at all; delete it (via a
  `robocopy /MIR` against an empty folder if a plain delete also hits the same long-path error) and
  `npm install` fresh in the new location instead.
- **Response contract**: `RecentMediaController`'s `/media/recent` endpoint returns
  `{ items: RecentMediaItemResponseModel[], isPartial: boolean }` (not a bare array) — both the Phase 1
  collection view and the Phase 2 picker modal consume this same shape.
- **Value shape compatibility**: the custom property editor writes the exact same value shape as core's
  `Umbraco.MediaPicker3` (`key`/`mediaKey`/`mediaTypeAlias`/`focalPoint`/`crops`), with `mediaTypeAlias`
  always sent empty (core's own server-side `MediaPicker3PropertyEditor.UpdateMediaTypeAliases` corrects
  it on save regardless — same trick core's own `umb-input-rich-media` uses). This means a Data Type can
  be switched between core's Media Picker UI and this one with **no data migration**.

---

## Steps / phases

**Phase 1 — "Recent" layout for the Media section** *(done)*
1. `collectionView` manifest (`Umbraco.Community.RecentMediaPicker.CollectionView.Media.Recent`),
   conditioned on `Umb.Condition.CollectionAlias = Umb.Collection.Media`.
2. Backed by a dedicated recursive, permission-safe backend endpoint (`RecentMediaController`) rather than
   the existing collection endpoint, since that endpoint is not recursive.
3. Solves "help me find where media was recently uploaded" in the Media section browser.

**Phase 2 — Alternative Media Picker property editor UI with a "Recent" toggle** *(done, see
[Known issues](#known-issues-history))*
4. `propertyEditorUi` manifest (`Umbraco.Community.RecentMediaPicker.PropertyEditorUi.RecentMediaPicker`),
   targeting `propertyEditorSchemaAlias: 'Umbraco.MediaPicker3'`.
5. Custom modal (`Umbraco.Community.RecentMediaPicker.Modal.RecentMediaPicker`) composing public core
   exports: `UmbPickerModalBaseElement`, `UmbMediaTreeRepository`, `UmbMediaItemRepository`,
   `UmbDropzoneMediaElement`, `UmbPickerInputContext`.
6. "Recent" mode calls the dedicated backend endpoint (not the core collection endpoint) — bounded
   fetch-filter-accumulate loop, hard scan cap, honest `isPartial` signal. ✅ done.
   - 6a. Client-side date-group headers + "Older" divider. ✅ done.
   - 6b. All/Mine toggle, defaulting to Mine, backed by the `mine` query param. ✅ done.
7. Persist the "by me"/"by everyone" toggle state via interaction memory. ⬜ not yet done.
8. Package write-up / positioning referencing the original 2019 issue. ✅ done (root README + this doc).
   - 8a. Automated test coverage (see [Testing strategy](#testing-strategy)). ✅ done, as unit tests.

**Phase 2b — core parity** *(done)* Accepted Types, focal point/crop editing, add-folder-from-breadcrumb.
Data Type-level Start Node field deliberately not honored (user-level Start Node permissions still are) - see [Package identity](#package-identity).

**Phase 3 — `creatorId`/"Mine" filter** *(done, via the custom endpoint's own `mine` param — see status
note above; the originally-planned core-endpoint extension was not needed)*

**Phase 4 — Scoped core RFC** *(not started)*
9. Open a comment on the original 2019 issue with the working package, a link to its repo, and a narrow
   technical ask: make the Media Picker modal's toolbar/result-source genuinely extensible (manifest-driven,
   like the Media section's collection view already is).

---

## Testing strategy

`Umbraco.Community.RecentMediaPicker.Tests` covers `RecentMediaController.Recent(...)` with NUnit + Moq,
referencing Umbraco's own public `Umbraco.Cms.Tests` package (`UserBuilder` etc.) rather than any
internal-only Umbraco-CMS test infrastructure - the same setup any third-party package can use, no
Umbraco-CMS source tree required. Cases covered:
1. **Unrestricted (root-access) user** — folders excluded, authorized items returned.
2. **Mine vs everyone** — `mine=true` only returns the current user's own uploads.
3. **Start-node-restricted user** — `ContentPermissions.HasPathAccess` correctly filters, applied
   regardless of the `mine` flag.
4. **Scan cap** — `IsPartial` is honestly set true when `MaxCandidatesScanned` is hit before `take` is
   satisfied.

No integration-test-style coverage against a real running Umbraco instance exists (or is realistically
available to a third-party package - `Umbraco.Tests.Integration`'s infrastructure isn't published as a
consumable NuGet package). The manual TestSite (see [Further considerations](#further-considerations))
remains the way to validate real end-to-end behavior (date grouping, empty states, permission isolation,
crop/focal-point editing) by hand in the backoffice.

---

## Reference: key files

- `Controllers/RecentMedia/RecentMediaController.cs` — the recursive, permission-safe backend endpoint.
- `Controllers/RecentMedia/RecentMediaResponseModel.cs` / `RecentMediaItemResponseModel.cs` — response DTOs.
- `Client/src/collection-views/recent-media-collection-view.element.ts` — Phase 1's "Recent" layout.
- `Client/src/property-editors/recent-media-picker/` — Phase 2's alternative property editor + modal:
  - `manifests.ts` — registers the `propertyEditorUi` and `modal` extensions.
  - `types.ts` — the `Umbraco.MediaPicker3`-compatible value shape.
  - `recent-media-picker-modal.token.ts` — the modal token.
  - `recent-media-picker-input.context.ts` — picker input context (selection state, opens our modal).
  - `recent-media-picker-modal.element.ts` — the modal itself (folder-location view + "Recently added" view).
  - `recent-media-picker-property-editor.element.ts` — the visible "chosen items" property editor UI.
- `Client/src/bundle.manifests.ts` — aggregates all manifests for the package's extension bundle.
- `../Umbraco.Community.RecentMediaPicker.Tests/RecentMediaControllerTests.cs` — unit tests for the
  backend endpoint's permission/pagination logic.

Core Umbraco-CMS source referenced throughout (for study, not forked):
- `src/Umbraco.Web.UI.Client/src/packages/media/media/modals/media-picker/media-picker-modal.element.ts`
- `src/Umbraco.Web.UI.Client/src/packages/media/media/property-editors/media-picker/manifests.ts`
- `src/Umbraco.Core/Services/IMediaService.cs` / `MediaService.cs`
- `src/Umbraco.Cms.Api.Management/Controllers/Media/Collection/ByKeyMediaCollectionController.cs`

---

## Further considerations

- Whether to keep the manual TestSite scaffolding (`RecentMediaPicker.config` Data Type, its test content
  node) as permanent test fixtures, or remove it once satisfied — not yet decided. It's excluded from
  the packed NuGet package either way (`IsPackable=false`), so this only affects repo tidiness, not what
  ships.
