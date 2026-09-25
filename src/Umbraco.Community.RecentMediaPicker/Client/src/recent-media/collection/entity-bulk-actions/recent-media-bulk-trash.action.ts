import { UmbTrashEntityBulkAction, type MetaEntityBulkActionTrashKind } from "@umbraco-cms/backoffice/recycle-bin";
import { UMB_BULK_TRASH_WITH_RELATION_CONFIRM_MODAL } from "@umbraco-cms/backoffice/relations";
import { umbOpenModal } from "@umbraco-cms/backoffice/modal";
import { MediaService } from "@umbraco-cms/backoffice/external/backend-api";

/**
 * Identical in effect to core's own UmbMediaBulkTrashWithRelationEntityAction (media/recycle-bin/
 * entity-action/bulk-trash/media-bulk-trash-with-relation.action.ts, not publicly exported) - the
 * generic `trashWithRelation` kind doesn't know to check the "disable delete when referenced" media
 * site setting, so media needs this same small override regardless of which collection hosts the
 * action.
 *
 * Can't subclass `UmbBulkTrashWithRelationEntityAction` itself (from @umbraco-cms/backoffice/relations)
 * or read `UMB_MEDIA_CONFIGURATION_CONTEXT` (from @umbraco-cms/backoffice/media) - both compile fine
 * against the npm package's newer types but aren't actually exported by this environment's pinned
 * runtime bundle (confirmed live). Reimplements the same ~5 lines on top of the base
 * `UmbTrashEntityBulkAction` (genuinely exported by both), and reads the media configuration via the
 * shared Management API client directly (`MediaService.getMediaConfiguration`) instead of the
 * missing context - same underlying REST endpoint the context would have called anyway.
 */
interface MetaRecentMediaBulkTrash extends MetaEntityBulkActionTrashKind {
  referenceRepositoryAlias: string;
}

export class RecentMediaBulkTrashEntityAction extends UmbTrashEntityBulkAction<MetaRecentMediaBulkTrash> {
  protected override async _confirmTrash() {
    const { data: config } = await MediaService.getMediaConfiguration();

    await umbOpenModal(this, UMB_BULK_TRASH_WITH_RELATION_CONFIRM_MODAL, {
      data: {
        uniques: this.selection,
        itemRepositoryAlias: this.args.meta.itemRepositoryAlias,
        referenceRepositoryAlias: this.args.meta.referenceRepositoryAlias,
        disableDeleteWhenReferenced: config?.disableDeleteWhenReferenced ?? false,
      },
    });
  }
}

export { RecentMediaBulkTrashEntityAction as api };
export default RecentMediaBulkTrashEntityAction;
