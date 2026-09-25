import type { UmbCollectionRepository } from "@umbraco-cms/backoffice/collection";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbRepositoryBase } from "@umbraco-cms/backoffice/repository";
import { fetchRecentMedia } from "../fetch-recent-media.js";

/**
 * Required by the `collection` manifest's `repositoryAlias`. Neither the Grid nor the Table view
 * actually renders from this repository's data - both self-fetch via fetch-recent-media.ts (see
 * manifests.ts for why: the generic collection pipeline has no concept of the /media/recent
 * endpoint's "isPartial" flag). BUT the reported `total` still matters: core's `umb-collection-default`
 * shell (kind: 'default') only shows its router-slot (where the actual collectionView renders) once
 * it has observed a non-zero total from this repository - otherwise it renders its "No items"
 * empty-state and hides the router-slot via CSS, no matter what the collectionView itself renders.
 * So this has to report the real count, even though its `items` are otherwise unused.
 */
export class RecentMediaCollectionRepository extends UmbRepositoryBase implements UmbCollectionRepository {
  constructor(host: UmbControllerHost) {
    super(host);
  }

  async requestCollection() {
    const { items } = await fetchRecentMedia();
    return { data: { items, total: items.length } };
  }
}

export default RecentMediaCollectionRepository;
