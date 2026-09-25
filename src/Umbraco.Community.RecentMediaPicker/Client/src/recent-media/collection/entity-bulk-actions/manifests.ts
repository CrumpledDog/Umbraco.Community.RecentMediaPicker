import {
  UMB_BULK_MOVE_MEDIA_REPOSITORY_ALIAS,
  UMB_MEDIA_TREE_ALIAS,
  UMB_MEDIA_ITEM_REPOSITORY_ALIAS,
  UMB_MEDIA_RECYCLE_BIN_REPOSITORY_ALIAS,
  UMB_MEDIA_REFERENCE_REPOSITORY_ALIAS,
} from "@umbraco-cms/backoffice/media";
import { UMB_ENTITY_BULK_ACTION_TRASH_WITH_RELATION_KIND } from "@umbraco-cms/backoffice/relations";
import { UMB_COLLECTION_ALIAS_CONDITION } from "@umbraco-cms/backoffice/collection";
import { RECENT_MEDIA_COLLECTION_ALIAS } from "../constants.js";
import { RECENT_MEDIA_ROOT_ENTITY_TYPE } from "../../entity.js";

// Core's own Media "Move to" and "Trash" bulk actions are hard-wired to condition on
// Umb.Collection.Media specifically (bulk actions are declared per-collection, not per-entity-type),
// so they never fire here. These reuse the exact same generic, public kinds/repositories core's own
// actions use - only the manifest registration (and, for Trash, the same small subclass media itself
// needs - see recent-media-bulk-trash.action.ts) is new.
//
// `forEntityTypes` here is NOT the entity type of the individual selected items (still real media
// items either way) - `<umb-collection-selection-actions>` derives its filter entityType from the
// ambient UMB_ENTITY_CONTEXT of whatever hosts the collection (confirmed by reading the actual
// runtime source), which for our synthetic "Recently added" workspace is our own synthetic entity
// type, not "media". Matching against `UMB_MEDIA_ENTITY_TYPE` here would just mean the actions never
// appear. The move/trash REST calls themselves are entirely driven by the repository aliases in
// `meta` below (real media repositories, unaffected by this value) - not by `forEntityTypes`.
export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "entityBulkAction",
    kind: "moveTo",
    alias: "Umbraco.Community.RecentMediaPicker.EntityBulkAction.RecentMedia.MoveTo",
    name: "Recently Added Move Media Bulk Action",
    weight: 20,
    forEntityTypes: [RECENT_MEDIA_ROOT_ENTITY_TYPE],
    meta: { bulkMoveRepositoryAlias: UMB_BULK_MOVE_MEDIA_REPOSITORY_ALIAS, treeAlias: UMB_MEDIA_TREE_ALIAS },
    conditions: [{ alias: UMB_COLLECTION_ALIAS_CONDITION, match: RECENT_MEDIA_COLLECTION_ALIAS }],
  },
  {
    type: "entityBulkAction",
    kind: UMB_ENTITY_BULK_ACTION_TRASH_WITH_RELATION_KIND,
    alias: "Umbraco.Community.RecentMediaPicker.EntityBulkAction.RecentMedia.Trash",
    name: "Recently Added Trash Media Bulk Action",
    // Declaring the kind (for its shared meta.icon/meta.label defaults - a manifest with no kind at
    // all never gets those merged in, and silently fails to render) while still overriding `api` with
    // our own disableDeleteWhenReferenced-aware subclass instead of the kind's default action class.
    api: () => import("./recent-media-bulk-trash.action.js"),
    weight: 10,
    forEntityTypes: [RECENT_MEDIA_ROOT_ENTITY_TYPE],
    meta: {
      itemRepositoryAlias: UMB_MEDIA_ITEM_REPOSITORY_ALIAS,
      recycleBinRepositoryAlias: UMB_MEDIA_RECYCLE_BIN_REPOSITORY_ALIAS,
      referenceRepositoryAlias: UMB_MEDIA_REFERENCE_REPOSITORY_ALIAS,
    },
    conditions: [{ alias: UMB_COLLECTION_ALIAS_CONDITION, match: RECENT_MEDIA_COLLECTION_ALIAS }],
  },
];
