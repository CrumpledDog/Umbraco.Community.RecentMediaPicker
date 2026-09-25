import { manifests as entrypoints } from "./entrypoints/manifest.js";
import { manifests as dashboards } from "./dashboards/manifest.js";
import { manifests as recentMediaPicker } from "./property-editors/recent-media-picker/manifests.js";
import { manifests as recentMediaMenuItem } from "./recent-media/menu-item/manifests.js";
import { manifests as recentMediaWorkspace } from "./recent-media/workspace/manifests.js";
import { manifests as recentMediaCollection } from "./recent-media/collection/manifests.js";
import { manifests as recentMediaGridView } from "./recent-media/collection/views/grid/manifests.js";
import { manifests as recentMediaTableView } from "./recent-media/collection/views/table/manifests.js";
import { manifests as recentMediaBulkActions } from "./recent-media/collection/entity-bulk-actions/manifests.js";

// Job of the bundle is to collate all the manifests from different parts of the extension and load other manifests
// We load this bundle from umbraco-package.json
export const manifests: Array<UmbExtensionManifest> = [
  ...entrypoints,
  ...dashboards,
  ...recentMediaPicker,
  ...recentMediaMenuItem,
  ...recentMediaWorkspace,
  ...recentMediaCollection,
  ...recentMediaGridView,
  ...recentMediaTableView,
  ...recentMediaBulkActions,
];
