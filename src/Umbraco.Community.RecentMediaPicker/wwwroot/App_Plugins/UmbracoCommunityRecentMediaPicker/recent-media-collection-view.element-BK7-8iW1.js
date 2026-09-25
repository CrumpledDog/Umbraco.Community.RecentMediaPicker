import { repeat as C, html as E, nothing as P, ifDefined as O, css as x, state as T, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as L } from "@umbraco-cms/backoffice/style";
import { UmbLitElement as N } from "@umbraco-cms/backoffice/lit-element";
import { UMB_COLLECTION_CONTEXT as Y } from "@umbraco-cms/backoffice/collection";
import { UMB_ACTION_EVENT_CONTEXT as D } from "@umbraco-cms/backoffice/action";
import { UmbRequestReloadStructureForEntityEvent as v, UmbRequestReloadChildrenOfEntityEvent as f } from "@umbraco-cms/backoffice/entity-action";
import { f as I } from "./fetch-recent-media-CKUQJb76.js";
import { b as U } from "./edit-media-href-BmH951Ug.js";
import { g as V } from "./date-grouping-xnEeQMkX.js";
import { R as W } from "./bundle.manifests-C2z9g3fr.js";
import { a as k } from "./scope.context-BYlSvIJe.js";
import "@umbraco-cms/backoffice/imaging";
var z = Object.defineProperty, A = Object.getOwnPropertyDescriptor, M = (e) => {
  throw TypeError(e);
}, m = (e, t, i, u) => {
  for (var a = u > 1 ? void 0 : u ? A(t, i) : t, p = e.length - 1, _; p >= 0; p--)
    (_ = e[p]) && (a = (u ? _(t, i, a) : _(a)) || a);
  return u && a && z(t, i, a), a;
}, g = (e, t, i) => t.has(e) || M("Cannot " + i), s = (e, t, i) => (g(e, t, "read from private field"), t.get(e)), h = (e, t, i) => t.has(e) ? M("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), w = (e, t, i, u) => (g(e, t, "write to private field"), t.set(e, i), i), c = (e, t, i) => (g(e, t, "access private method"), i), d, o, n, r, y, R, b, $, q;
let l = class extends N {
  constructor() {
    super(), h(this, r), this._items = [], this._mineOnly = !0, this._selection = [], h(this, d), h(this, o), h(this, n, (e) => {
      e.getEntityType() === W && c(this, r, y).call(this);
    }), this.consumeContext(Y, (e) => {
      w(this, d, e), e?.setupView(this), this.observe(
        e?.selection.selection,
        (t) => this._selection = t ?? [],
        "_observeSelection"
      );
    }), this.consumeContext(k, (e) => {
      this.observe(
        e?.mineOnly,
        (t) => {
          this._mineOnly = t ?? !0, c(this, r, y).call(this);
        },
        "_observeMineOnly"
      );
    }), this.consumeContext(D, (e) => {
      s(this, o)?.removeEventListener(v.TYPE, s(this, n)), s(this, o)?.removeEventListener(f.TYPE, s(this, n)), w(this, o, e), e?.addEventListener(v.TYPE, s(this, n)), e?.addEventListener(f.TYPE, s(this, n));
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), s(this, o)?.removeEventListener(v.TYPE, s(this, n)), s(this, o)?.removeEventListener(f.TYPE, s(this, n));
  }
  render() {
    const e = V(this._items);
    return E`
      ${C(
      e,
      (t) => t.group,
      (t) => E`
          <div class="date-divider">${t.label}</div>
          <div class="date-group-grid">
            ${C(
        t.items,
        (i) => i.unique,
        (i) => c(this, r, q).call(this, i)
      )}
          </div>
        `
    )}
    `;
  }
};
d = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
y = async function() {
  const { items: e } = await I(50, this._mineOnly);
  this._items = e;
};
R = function(e) {
  s(this, d)?.selection.select(e.unique);
};
b = function(e) {
  s(this, d)?.selection.deselect(e.unique);
};
$ = function(e) {
  return s(this, d)?.selection.isSelected(e.unique) ?? !1;
};
q = function(e) {
  return E`
      <uui-card-media
        name=${O(e.name)}
        href=${U(e.unique)}
        data-mark="${e.entityType}:${e.unique}"
        selectable
        ?select-only=${this._selection.length > 0}
        ?selected=${c(this, r, $).call(this, e)}
        @selected=${() => c(this, r, R).call(this, e)}
        @deselected=${() => c(this, r, b).call(this, e)}>
        <umb-imaging-thumbnail
          .unique=${e.unique}
          alt=${O(e.name)}
          icon=${e.icon ?? P}></umb-imaging-thumbnail>
      </uui-card-media>
    `;
};
l.styles = [
  L,
  x`
      :host {
        display: flex;
        flex-direction: column;
      }

      .date-divider {
        font-weight: bold;
        color: var(--uui-color-text-alt);
        margin: var(--uui-size-space-4) 0 var(--uui-size-space-3);
      }

      .date-divider:first-of-type {
        margin-top: 0;
      }

      .date-group-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        grid-auto-rows: 200px;
        gap: var(--uui-size-space-5);
        margin-bottom: var(--uui-size-space-4);
      }
    `
];
m([
  T()
], l.prototype, "_items", 2);
m([
  T()
], l.prototype, "_mineOnly", 2);
m([
  T()
], l.prototype, "_selection", 2);
l = m([
  S("recent-media-collection-view")
], l);
const ie = l;
export {
  l as RecentMediaCollectionViewElement,
  ie as default
};
//# sourceMappingURL=recent-media-collection-view.element-BK7-8iW1.js.map
