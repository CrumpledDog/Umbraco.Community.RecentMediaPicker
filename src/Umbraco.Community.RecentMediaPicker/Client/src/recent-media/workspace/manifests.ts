import { RECENT_MEDIA_ROOT_ENTITY_TYPE } from "../entity.js";
import { RECENT_MEDIA_COLLECTION_ALIAS } from "../collection/constants.js";
import { UMB_WORKSPACE_CONDITION_ALIAS } from "@umbraco-cms/backoffice/workspace";

const workspaceAlias = "Umbraco.Community.RecentMediaPicker.Workspace.RecentMedia.Root";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "workspace",
    kind: "default",
    alias: workspaceAlias,
    name: "Recently Added Root Workspace",
    meta: { entityType: RECENT_MEDIA_ROOT_ENTITY_TYPE, headline: "Recently added" },
  },
  {
    type: "workspaceView",
    kind: "collection",
    alias: "Umbraco.Community.RecentMediaPicker.WorkspaceView.RecentMedia.Root.Collection",
    name: "Recently Added Collection Workspace View",
    meta: {
      label: "Recently added",
      pathname: "collection",
      icon: "icon-time",
      collectionAlias: RECENT_MEDIA_COLLECTION_ALIAS,
    },
    conditions: [{ alias: UMB_WORKSPACE_CONDITION_ALIAS, match: workspaceAlias }],
  },
  {
    type: "workspaceFooterApp",
    alias: "Umbraco.Community.RecentMediaPicker.WorkspaceFooterApp.RecentMedia.Breadcrumb",
    name: "Recently Added Footer Breadcrumb Workspace Footer App",
    element: () => import("./recent-media-footer-breadcrumb.element.js"),
    conditions: [{ alias: UMB_WORKSPACE_CONDITION_ALIAS, match: workspaceAlias }],
  },
];
