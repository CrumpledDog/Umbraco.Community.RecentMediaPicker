import { UmbRepositoryBase as e } from "@umbraco-cms/backoffice/repository";
import { f as o } from "./fetch-recent-media-B3LwYWik.js";
class c extends e {
  constructor(t) {
    super(t);
  }
  async requestCollection() {
    const { items: t } = await o();
    return { data: { items: t, total: t.length } };
  }
}
export {
  c as RecentMediaCollectionRepository,
  c as default
};
//# sourceMappingURL=recent-media-collection.repository-2Ny2hacl.js.map
