import { RECENT_MEDIA_COLLECTION_ALIAS } from "./constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "collection",
    kind: "default",
    alias: RECENT_MEDIA_COLLECTION_ALIAS,
    name: "Recently Added Collection",
    // Overrides just the element (keeping the kind's own default api/UmbDefaultCollectionContext)
    // so the toolbar can add the "by me"/"by everyone" tabs - see recent-media-collection.element.ts.
    element: () => import("./recent-media-collection.element.js"),
    meta: { repositoryAlias: "Umbraco.Community.RecentMediaPicker.Repository.RecentMedia.Collection" },
  },
  {
    type: "repository",
    alias: "Umbraco.Community.RecentMediaPicker.Repository.RecentMedia.Collection",
    name: "Recently Added Collection Repository",
    api: () => import("./repository/recent-media-collection.repository.js"),
  },
];
