export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "propertyEditorUi",
    alias: "Umbraco.Community.RecentMediaPicker.PropertyEditorUi.RecentMediaPicker",
    name: "Recent Media Picker Property Editor UI",
    element: () => import("./recent-media-picker-property-editor.element.js"),
    meta: {
      label: "Media Picker (Recent-first)",
      propertyEditorSchemaAlias: "Umbraco.MediaPicker3",
      icon: "icon-time",
      group: "media",
      supportsReadOnly: true,
    },
  },
  {
    type: "modal",
    alias: "Umbraco.Community.RecentMediaPicker.Modal.RecentMediaPicker",
    name: "Recent Media Picker Modal",
    js: () => import("./recent-media-picker-modal.element.js"),
  },
];
