import type { UmbCropModel, UmbFocalPointModel } from "@umbraco-cms/backoffice/media";

// Matches Umbraco's own Umbraco.MediaPicker3 value entry shape (see
// packages/media/media/property-editors/types.ts in Umbraco-CMS) so a Data Type can be switched between
// core's Media Picker UI and this one without a data migration. `mediaTypeAlias` is always overwritten
// server-side on save by MediaPicker3PropertyEditor.UpdateMediaTypeAliases(), so it's safe to send ''
// here - core's own umb-input-rich-media does exactly the same when adding a newly picked item.
// `focalPoint`/`crops` now carry real data (Phase 2b: focal point/crop editing) instead of always
// being saved empty.
export interface RecentMediaPickerValueEntry {
  key: string;
  mediaKey: string;
  mediaTypeAlias: string;
  focalPoint: UmbFocalPointModel | null;
  crops: Array<UmbCropModel>;
}
