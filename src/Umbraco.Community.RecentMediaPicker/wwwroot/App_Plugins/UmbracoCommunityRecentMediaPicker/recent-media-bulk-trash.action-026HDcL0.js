import { UmbTrashEntityBulkAction as i } from "@umbraco-cms/backoffice/recycle-bin";
import { UMB_BULK_TRASH_WITH_RELATION_CONFIRM_MODAL as t } from "@umbraco-cms/backoffice/relations";
import { umbOpenModal as a } from "@umbraco-cms/backoffice/modal";
import { MediaService as s } from "@umbraco-cms/backoffice/external/backend-api";
class c extends i {
  async _confirmTrash() {
    const { data: e } = await s.getMediaConfiguration();
    await a(this, t, {
      data: {
        uniques: this.selection,
        itemRepositoryAlias: this.args.meta.itemRepositoryAlias,
        referenceRepositoryAlias: this.args.meta.referenceRepositoryAlias,
        disableDeleteWhenReferenced: e?.disableDeleteWhenReferenced ?? !1
      }
    });
  }
}
export {
  c as RecentMediaBulkTrashEntityAction,
  c as api,
  c as default
};
//# sourceMappingURL=recent-media-bulk-trash.action-026HDcL0.js.map
