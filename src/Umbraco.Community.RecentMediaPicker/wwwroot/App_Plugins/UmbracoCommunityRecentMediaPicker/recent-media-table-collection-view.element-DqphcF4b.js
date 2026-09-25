import { repeat as M, html as y, css as P, state as p, customElement as R } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as D } from "@umbraco-cms/backoffice/style";
import { UmbLitElement as N } from "@umbraco-cms/backoffice/lit-element";
import { UMB_COLLECTION_CONTEXT as $ } from "@umbraco-cms/backoffice/collection";
import { UMB_ACTION_EVENT_CONTEXT as L } from "@umbraco-cms/backoffice/action";
import { UmbRequestReloadStructureForEntityEvent as f, UmbRequestReloadChildrenOfEntityEvent as E } from "@umbraco-cms/backoffice/entity-action";
import { f as A } from "./fetch-recent-media-CKUQJb76.js";
import { b as Y } from "./edit-media-href-BmH951Ug.js";
import { g as x } from "./date-grouping-xnEeQMkX.js";
import { R as I } from "./bundle.manifests-C2z9g3fr.js";
import { a as U } from "./scope.context-BYlSvIJe.js";
var q = Object.defineProperty, z = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, c = (e, t, i, u) => {
  for (var o = u > 1 ? void 0 : u ? z(t, i) : t, _ = e.length - 1, v; _ >= 0; _--)
    (v = e[_]) && (o = (u ? v(t, i, o) : v(o)) || o);
  return u && o && q(t, i, o), o;
}, T = (e, t, i) => t.has(e) || g("Cannot " + i), a = (e, t, i) => (T(e, t, "read from private field"), t.get(e)), h = (e, t, i) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), C = (e, t, i, u) => (T(e, t, "write to private field"), t.set(e, i), i), d = (e, t, i) => (T(e, t, "access private method"), i), m, l, n, r, b, O, w, S;
let s = class extends N {
  constructor() {
    super(), h(this, r), this._mineOnly = !0, this._groups = [], this._tableConfig = { allowSelection: !0, allowSelectAll: !1 }, this._tableColumns = [
      { name: this.localize.term("general_name"), alias: "name" },
      { name: "Last Edited", alias: "updateDate" },
      { name: "Updated by", alias: "updatedByName" },
      { name: "Date Created", alias: "createDate" }
    ], this._selection = [], h(this, m), h(this, l), h(this, n, (e) => {
      e.getEntityType() === I && d(this, r, b).call(this);
    }), this.consumeContext($, (e) => {
      C(this, m, e), e?.setupView(this), this.observe(
        e?.selection.selection,
        (t) => this._selection = (t ?? []).filter((i) => i !== null),
        "_observeSelection"
      );
    }), this.consumeContext(L, (e) => {
      a(this, l)?.removeEventListener(f.TYPE, a(this, n)), a(this, l)?.removeEventListener(E.TYPE, a(this, n)), C(this, l, e), e?.addEventListener(f.TYPE, a(this, n)), e?.addEventListener(E.TYPE, a(this, n));
    }), this.consumeContext(U, (e) => {
      this.observe(
        e?.mineOnly,
        (t) => {
          this._mineOnly = t ?? !0, d(this, r, b).call(this);
        },
        "_observeMineOnly"
      );
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), a(this, l)?.removeEventListener(f.TYPE, a(this, n)), a(this, l)?.removeEventListener(E.TYPE, a(this, n));
  }
  render() {
    return y`
      ${M(
      this._groups,
      (e) => e.group,
      (e) => y`
          <div class="date-divider">${e.label}</div>
          <umb-table
            .config=${this._tableConfig}
            .columns=${this._tableColumns}
            .items=${e.items.map((t) => d(this, r, O).call(this, t))}
            .selection=${this._selection}
            @selected=${d(this, r, w)}
            @deselected=${d(this, r, S)}></umb-table>
        `
    )}
    `;
  }
};
m = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
b = async function() {
  const { items: e } = await A(50, this._mineOnly);
  this._groups = x(e);
};
O = function(e) {
  return {
    id: e.unique,
    icon: e.icon,
    entityType: e.entityType,
    data: [
      {
        columnAlias: "name",
        value: y`<uui-button
            compact
            href=${Y(e.unique)}
            label=${e.name ?? ""}
            @click=${(t) => {
          t.preventDefault(), t.stopPropagation(), window.history.pushState(null, "", t.target.href);
        }}></uui-button>`
      },
      { columnAlias: "updateDate", value: this.localize.date(e.updateDate, { dateStyle: "short", timeStyle: "medium" }) },
      { columnAlias: "updatedByName", value: e.updatedByName ?? "—" },
      { columnAlias: "createDate", value: this.localize.date(e.createDate, { dateStyle: "short", timeStyle: "medium" }) }
    ]
  };
};
w = function(e) {
  e.stopPropagation();
  const t = e.target;
  a(this, m)?.selection.setSelection(t.selection);
};
S = function(e) {
  e.stopPropagation();
  const t = e.target;
  a(this, m)?.selection.setSelection(t.selection);
};
s.styles = [
  D,
  P`
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

      umb-table {
        margin-bottom: var(--uui-size-space-4);
      }
    `
];
c([
  p()
], s.prototype, "_mineOnly", 2);
c([
  p()
], s.prototype, "_groups", 2);
c([
  p()
], s.prototype, "_tableConfig", 2);
c([
  p()
], s.prototype, "_tableColumns", 2);
c([
  p()
], s.prototype, "_selection", 2);
s = c([
  R("recent-media-table-collection-view")
], s);
const Z = s;
export {
  s as RecentMediaTableCollectionViewElement,
  Z as default
};
//# sourceMappingURL=recent-media-table-collection-view.element-DqphcF4b.js.map
