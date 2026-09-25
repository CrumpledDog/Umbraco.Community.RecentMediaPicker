import { UmbracoCommunityRecentMediaPickerService } from "../../api/index.js";

export interface RecentMediaItem {
  unique: string;
  entityType: string;
  name?: string;
  icon?: string;
  createDate: string;
  updateDate: string;
  updatedByName?: string;
}

export interface RecentMediaFetchResult {
  items: Array<RecentMediaItem>;
  isPartial: boolean;
}

/**
 * Shared by both the Grid and Table "Recently added" collection views: fetches the most recently
 * uploaded media (across all folders) and maps it to the shape both views render. Deliberately NOT
 * routed through UMB_COLLECTION_CONTEXT's generic `.items` pipeline - that pipeline has no concept
 * of an "isPartial" (scan-truncated) flag, which the /media/recent endpoint needs to surface.
 *
 * `mine` threads straight into the already-server-side-filtered `mine` query param - it's not a
 * client-side filter over a fixed fetch.
 */
export async function fetchRecentMedia(take = 50, mine = false): Promise<RecentMediaFetchResult> {
  const { data, error } = await UmbracoCommunityRecentMediaPickerService.recent({ query: { take, mine } });
  if (error || !data) {
    return { items: [], isPartial: false };
  }

  return {
    isPartial: data.isPartial ?? false,
    items: data.items.map((item): RecentMediaItem => ({
      unique: item.id,
      entityType: "media",
      icon: item.icon ?? undefined,
      name: item.name,
      createDate: item.createDate,
      updateDate: item.updateDate,
      updatedByName: item.updatedByName ?? undefined,
    })),
  };
}
