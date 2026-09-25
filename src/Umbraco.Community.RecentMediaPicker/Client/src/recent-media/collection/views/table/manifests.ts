import { RECENT_MEDIA_COLLECTION_ALIAS } from "../../constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "collectionView",
    alias: "Umbraco.Community.RecentMediaPicker.CollectionView.RecentMedia.Table",
    name: "Recently Added Table Collection View",
    element: () => import("./recent-media-table-collection-view.element.js"),
    weight: 200, // matches core Media's own Table weight
    meta: { label: "Table", icon: "icon-table", pathName: "table" },
    conditions: [{ alias: "Umb.Condition.CollectionAlias", match: RECENT_MEDIA_COLLECTION_ALIAS }],
  },
];
