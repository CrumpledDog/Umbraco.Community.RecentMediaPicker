import { UmbRepositoryBase as e } from "@umbraco-cms/backoffice/repository";
import { f as o } from "./fetch-recent-media-CKUQJb76.js";
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
//# sourceMappingURL=recent-media-collection.repository-D7bG9E9W.js.map
