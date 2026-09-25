import { RECENT_MEDIA_ROOT_ENTITY_TYPE } from "../entity.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "menuItem",
    alias: "Umbraco.Community.RecentMediaPicker.MenuItem.RecentMedia",
    name: "Recently Added Menu Item",
    weight: 90, // just below the real Media tree (weight 100) and Recycle Bin (weight 100)
    meta: {
      label: "Recently added",
      icon: "icon-time",
      entityType: RECENT_MEDIA_ROOT_ENTITY_TYPE,
      menus: ["Umb.Menu.Media"], // core's Media section menu - stable alias, not publicly exported as a constant
    },
  },
];
