import { UmbContextToken as t } from "@umbraco-cms/backoffice/context-api";
import { UmbContextBase as n } from "@umbraco-cms/backoffice/class-api";
import { UmbBooleanState as o } from "@umbraco-cms/backoffice/observable-api";
const s = new t("RecentMediaScopeContext");
class l extends n {
  constructor(e) {
    super(e, s), this.#e = new o(!0), this.mineOnly = this.#e.asObservable();
  }
  #e;
  getMineOnly() {
    return this.#e.getValue();
  }
  setMineOnly(e) {
    this.#e.setValue(e);
  }
}
export {
  l as R,
  s as a
};
//# sourceMappingURL=scope.context-BYlSvIJe.js.map
