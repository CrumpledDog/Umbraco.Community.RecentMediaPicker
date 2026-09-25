import { UMB_WORKSPACE_CONDITION_ALIAS as o } from "@umbraco-cms/backoffice/workspace";
import { UMB_MEDIA_TREE_ALIAS as n, UMB_BULK_MOVE_MEDIA_REPOSITORY_ALIAS as c, UMB_MEDIA_REFERENCE_REPOSITORY_ALIAS as m, UMB_MEDIA_RECYCLE_BIN_REPOSITORY_ALIAS as r, UMB_MEDIA_ITEM_REPOSITORY_ALIAS as l } from "@umbraco-cms/backoffice/media";
import { UMB_ENTITY_BULK_ACTION_TRASH_WITH_RELATION_KIND as d } from "@umbraco-cms/backoffice/relations";
import { UMB_COLLECTION_ALIAS_CONDITION as a } from "@umbraco-cms/backoffice/collection";
const s = [
  {
    name: "Entrypoint",
    alias: "Umbraco.Community.RecentMediaPicker.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-T560zMlW.js")
  }
], p = [
  {
    name: "Dashboard",
    alias: "Umbraco.Community.RecentMediaPicker.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element-DdGc11vG.js"),
    meta: {
      label: "Example Dashboard",
      pathname: "example-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  }
], R = [
  {
    type: "propertyEditorUi",
    alias: "Umbraco.Community.RecentMediaPicker.PropertyEditorUi.RecentMediaPicker",
    name: "Recent Media Picker Property Editor UI",
    element: () => import("./recent-media-picker-property-editor.element-B5XPpJzz.js"),
    meta: {
      label: "Media Picker (Recent-first)",
      propertyEditorSchemaAlias: "Umbraco.MediaPicker3",
      icon: "icon-time",
      group: "media",
      supportsReadOnly: !0
    }
  },
  {
    type: "modal",
    alias: "Umbraco.Community.RecentMediaPicker.Modal.RecentMediaPicker",
    name: "Recent Media Picker Modal",
    js: () => import("./recent-media-picker-modal.element-C3NIlroe.js")
  }
], i = "Umbraco.Community.RecentMediaPicker.RecentMedia.Root", y = [
  {
    type: "menuItem",
    alias: "Umbraco.Community.RecentMediaPicker.MenuItem.RecentMedia",
    name: "Recently Added Menu Item",
    weight: 90,
    // just below the real Media tree (weight 100) and Recycle Bin (weight 100)
    meta: {
      label: "Recently added",
      icon: "icon-time",
      entityType: i,
      menus: ["Umb.Menu.Media"]
      // core's Media section menu - stable alias, not publicly exported as a constant
    }
  }
], e = "Umbraco.Community.RecentMediaPicker.Collection.RecentMedia", t = "Umbraco.Community.RecentMediaPicker.Workspace.RecentMedia.Root", M = [
  {
    type: "workspace",
    kind: "default",
    alias: t,
    name: "Recently Added Root Workspace",
    meta: { entityType: i, headline: "Recently added" }
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
      collectionAlias: e
    },
    conditions: [{ alias: o, match: t }]
  },
  {
    type: "workspaceFooterApp",
    alias: "Umbraco.Community.RecentMediaPicker.WorkspaceFooterApp.RecentMedia.Breadcrumb",
    name: "Recently Added Footer Breadcrumb Workspace Footer App",
    element: () => import("./recent-media-footer-breadcrumb.element-Bbauq4Al.js"),
    conditions: [{ alias: o, match: t }]
  }
], A = [
  {
    type: "collection",
    kind: "default",
    alias: e,
    name: "Recently Added Collection",
    // Overrides just the element (keeping the kind's own default api/UmbDefaultCollectionContext)
    // so the toolbar can add the "by me"/"by everyone" tabs - see recent-media-collection.element.ts.
    element: () => import("./recent-media-collection.element-J-q1fT0s.js"),
    meta: { repositoryAlias: "Umbraco.Community.RecentMediaPicker.Repository.RecentMedia.Collection" }
  },
  {
    type: "repository",
    alias: "Umbraco.Community.RecentMediaPicker.Repository.RecentMedia.Collection",
    name: "Recently Added Collection Repository",
    api: () => import("./recent-media-collection.repository-D7bG9E9W.js")
  }
], C = [
  {
    type: "collectionView",
    alias: "Umbraco.Community.RecentMediaPicker.CollectionView.RecentMedia.Grid",
    name: "Recently Added Grid Collection View",
    // Reuses the existing element unchanged - it was already visually equivalent to core's "Grid" view.
    element: () => import("./recent-media-collection-view.element-BK7-8iW1.js"),
    weight: 300,
    // matches core Media's own Grid weight
    meta: { label: "Grid", icon: "icon-grid", pathName: "grid" },
    conditions: [{ alias: "Umb.Condition.CollectionAlias", match: e }]
  }
], k = [
  {
    type: "collectionView",
    alias: "Umbraco.Community.RecentMediaPicker.CollectionView.RecentMedia.Table",
    name: "Recently Added Table Collection View",
    element: () => import("./recent-media-table-collection-view.element-DqphcF4b.js"),
    weight: 200,
    // matches core Media's own Table weight
    meta: { label: "Table", icon: "icon-table", pathName: "table" },
    conditions: [{ alias: "Umb.Condition.CollectionAlias", match: e }]
  }
], E = [
  {
    type: "entityBulkAction",
    kind: "moveTo",
    alias: "Umbraco.Community.RecentMediaPicker.EntityBulkAction.RecentMedia.MoveTo",
    name: "Recently Added Move Media Bulk Action",
    weight: 20,
    forEntityTypes: [i],
    meta: { bulkMoveRepositoryAlias: c, treeAlias: n },
    conditions: [{ alias: a, match: e }]
  },
  {
    type: "entityBulkAction",
    kind: d,
    alias: "Umbraco.Community.RecentMediaPicker.EntityBulkAction.RecentMedia.Trash",
    name: "Recently Added Trash Media Bulk Action",
    // Declaring the kind (for its shared meta.icon/meta.label defaults - a manifest with no kind at
    // all never gets those merged in, and silently fails to render) while still overriding `api` with
    // our own disableDeleteWhenReferenced-aware subclass instead of the kind's default action class.
    api: () => import("./recent-media-bulk-trash.action-026HDcL0.js"),
    weight: 10,
    forEntityTypes: [i],
    meta: {
      itemRepositoryAlias: l,
      recycleBinRepositoryAlias: r,
      referenceRepositoryAlias: m
    },
    conditions: [{ alias: a, match: e }]
  }
], U = [
  ...s,
  ...p,
  ...R,
  ...y,
  ...M,
  ...A,
  ...C,
  ...k,
  ...E
];
export {
  i as R,
  U as m
};
//# sourceMappingURL=bundle.manifests-C2z9g3fr.js.map
