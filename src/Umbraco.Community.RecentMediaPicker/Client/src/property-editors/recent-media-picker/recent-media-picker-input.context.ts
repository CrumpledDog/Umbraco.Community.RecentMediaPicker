import { UMB_RECENT_MEDIA_PICKER_MODAL } from "./recent-media-picker-modal.token.js";
import type {
  UmbRecentMediaPickerModalData,
  UmbRecentMediaPickerModalValue,
} from "./recent-media-picker-modal.token.js";
import { UMB_MEDIA_ITEM_REPOSITORY_ALIAS } from "@umbraco-cms/backoffice/media";
import type { UmbMediaItemModel, UmbMediaTreeItemModel } from "@umbraco-cms/backoffice/media";
import { UmbPickerInputContext } from "@umbraco-cms/backoffice/picker-input";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

/**
 * Same shape as core's UmbMediaPickerInputContext, but opens our own "Recent"-first picker modal
 * instead of core's UMB_MEDIA_PICKER_MODAL. Reuses core's UMB_MEDIA_ITEM_REPOSITORY_ALIAS so the
 * chosen-items list still gets real names/thumbnails for arbitrary selected media.
 */
export class UmbRecentMediaPickerInputContext extends UmbPickerInputContext<
  UmbMediaItemModel,
  UmbMediaTreeItemModel,
  UmbRecentMediaPickerModalData,
  UmbRecentMediaPickerModalValue
> {
  constructor(host: UmbControllerHost) {
    super(host, UMB_MEDIA_ITEM_REPOSITORY_ALIAS, UMB_RECENT_MEDIA_PICKER_MODAL);
  }
}
