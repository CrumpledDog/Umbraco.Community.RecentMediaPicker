import { html as f, state as y, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbCollectionDefaultElement as O } from "@umbraco-cms/backoffice/collection";
import { R as C } from "./scope.context-BYlSvIJe.js";
var M = Object.defineProperty, E = Object.getOwnPropertyDescriptor, p = (e) => {
  throw TypeError(e);
}, v = (e, t, n, i) => {
  for (var a = i > 1 ? void 0 : i ? E(t, n) : t, s = e.length - 1, c; s >= 0; s--)
    (c = e[s]) && (a = (i ? c(t, n, a) : c(a)) || a);
  return i && a && M(t, n, a), a;
}, m = (e, t, n) => t.has(e) || p("Cannot " + n), d = (e, t, n) => (m(e, t, "read from private field"), n ? n.call(e) : t.get(e)), _ = (e, t, n) => t.has(e) ? p("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), h = (e, t, n) => (m(e, t, "access private method"), n), r, l, u;
let o = class extends O {
  constructor() {
    super(), _(this, l), _(this, r, new C(this)), this._mineOnly = !0, this.observe(d(this, r).mineOnly, (e) => this._mineOnly = e, "_observeMineOnly");
  }
  renderToolbar() {
    return f`
      <umb-collection-toolbar slot="header">
        <uui-tab-group>
          <uui-tab label="by me" ?active=${this._mineOnly} @click=${() => h(this, l, u).call(this, !0)}></uui-tab>
          <uui-tab label="by everyone" ?active=${!this._mineOnly} @click=${() => h(this, l, u).call(this, !1)}></uui-tab>
        </uui-tab-group>
      </umb-collection-toolbar>
    `;
  }
};
r = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
u = function(e) {
  d(this, r).setMineOnly(e);
};
v([
  y()
], o.prototype, "_mineOnly", 2);
o = v([
  b("recent-media-collection")
], o);
const P = o;
export {
  o as RecentMediaCollectionElement,
  P as default
};
//# sourceMappingURL=recent-media-collection.element-J-q1fT0s.js.map
