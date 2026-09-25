import { UMB_EDIT_MEDIA_WORKSPACE_PATH_PATTERN } from "@umbraco-cms/backoffice/media";

/** The URL that navigates to a media item's real edit workspace - same pattern core's own Grid/Table use. */
export function buildMediaEditHref(unique: string): string {
  return UMB_EDIT_MEDIA_WORKSPACE_PATH_PATTERN.generateAbsolute({ unique });
}
