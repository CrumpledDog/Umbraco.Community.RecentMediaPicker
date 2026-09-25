import type { UmbMediaSearchItemModel, UmbMediaTreeItemModel } from "@umbraco-cms/backoffice/media";
import type { UmbPickerModalData, UmbPickerModalValue } from "@umbraco-cms/backoffice/modal";
import { UmbModalToken } from "@umbraco-cms/backoffice/modal";
import type { UmbMediaTypeEntityType } from "@umbraco-cms/backoffice/media-type";

export interface UmbRecentMediaPickerModalData extends UmbPickerModalData<UmbMediaTreeItemModel> {
  // No `startNode` field - this picker deliberately doesn't honor the Data Type's Start Node, see
  // the property editor element's `config` setter for why.
  /** Accepted Types (config alias `filter`) - greys out (doesn't hide) ineligible non-folder items. */
  pickableFilter?: (item: UmbMediaTreeItemModel | UmbMediaSearchItemModel) => boolean;
  /** Same Accepted Types list, in the shape the search endpoint needs for its own server-side filter. */
  acceptedMediaTypes?: Array<{ unique: string; entityType: UmbMediaTypeEntityType }>;
}

export type UmbRecentMediaPickerModalValue = UmbPickerModalValue;

export const UMB_RECENT_MEDIA_PICKER_MODAL = new UmbModalToken<
  UmbRecentMediaPickerModalData,
  UmbRecentMediaPickerModalValue
>("Umbraco.Community.RecentMediaPicker.Modal.RecentMediaPicker", {
  modal: {
    type: "sidebar",
    size: "medium",
  },
});
