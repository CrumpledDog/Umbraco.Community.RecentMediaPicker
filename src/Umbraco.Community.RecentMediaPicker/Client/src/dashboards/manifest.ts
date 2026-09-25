export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Dashboard",
    alias: "Umbraco.Community.RecentMediaPicker.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element.js"),
    meta: {
      label: "Example Dashboard",
      pathname: "example-dashboard",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content",
      },
    ],
  },
];
