import { RECENT_MEDIA_COLLECTION_ALIAS } from "../../constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "collectionView",
    alias: "Umbraco.Community.RecentMediaPicker.CollectionView.RecentMedia.Grid",
    name: "Recently Added Grid Collection View",
    // Reuses the existing element unchanged - it was already visually equivalent to core's "Grid" view.
    element: () => import("../../../../collection-views/recent-media-collection-view.element.js"),
    weight: 300, // matches core Media's own Grid weight
    meta: { label: "Grid", icon: "icon-grid", pathName: "grid" },
    conditions: [{ alias: "Umb.Condition.CollectionAlias", match: RECENT_MEDIA_COLLECTION_ALIAS }],
  },
];
