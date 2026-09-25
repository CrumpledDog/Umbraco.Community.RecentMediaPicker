export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Entrypoint",
    alias: "Umbraco.Community.RecentMediaPicker.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
