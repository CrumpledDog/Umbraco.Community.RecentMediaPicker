import { U as H } from "./sdk.gen-B-I-Do8j.js";
import { nothing as f, html as r, repeat as _, ifDefined as Fe, css as Se, state as d, query as K, customElement as Me } from "@umbraco-cms/backoffice/external/lit";
import { UmbPickerModalBaseElement as Re, UmbPickerContext as ze } from "@umbraco-cms/backoffice/picker";
import { UmbMediaTreeRepository as Ce, UmbMediaSearchProvider as Le, UmbMediaDetailRepository as Pe, UMB_MEDIA_ROOT_ENTITY_TYPE as De } from "@umbraco-cms/backoffice/media";
import { UmbMediaTypeStructureRepository as Ie } from "@umbraco-cms/backoffice/media-type";
import { UMB_PROPERTY_TYPE_BASED_PROPERTY_CONTEXT as Oe } from "@umbraco-cms/backoffice/content";
import { UmbFileDropzoneItemStatus as Ue } from "@umbraco-cms/backoffice/dropzone";
import { debounce as Ee } from "@umbraco-cms/backoffice/utils";
import { UmbId as Ne } from "@umbraco-cms/backoffice/id";
import "@umbraco-cms/backoffice/imaging";
import { g as Ae } from "./date-grouping-xnEeQMkX.js";
var We = Object.defineProperty, Be = Object.getOwnPropertyDescriptor, X = (e) => {
  throw TypeError(e);
}, c = (e, n, a, o) => {
  for (var l = o > 1 ? void 0 : o ? Be(n, a) : n, m = e.length - 1, h; m >= 0; m--)
    (h = e[m]) && (l = (o ? h(n, a, l) : h(l)) || l);
  return o && l && We(n, a, l), l;
}, U = (e, n, a) => n.has(e) || X("Cannot " + a), u = (e, n, a) => (U(e, n, "read from private field"), a ? a.call(e) : n.get(e)), p = (e, n, a) => n.has(e) ? X("Cannot add the same private member more than once") : n instanceof WeakSet ? n.add(e) : n.set(e, a), k = (e, n, a, o) => (U(e, n, "write to private field"), n.set(e, a), a), i = (e, n, a) => (U(e, n, "access private method"), a), F = (e, n, a, o) => ({
  set _(l) {
    k(e, n, l);
  },
  get _() {
    return u(e, n, o);
  }
}), S, E, x, T, w, M, R, g, y, t, N, Z, z, C, L, $, j, A, J, ee, te, P, ie, ne, W, q, I, b, ae, re, se, oe, le, B, ue, ce, Q, D, O, de, he, pe, me, fe, _e, ye, be, V, ge, ve, we, $e, qe, xe, Te, Y;
function ke(e) {
  return {
    unique: e.unique,
    entityType: e.entityType,
    name: e.name,
    mediaType: { unique: e.mediaType?.unique ?? null }
  };
}
function Qe(e) {
  const n = Math.round((new Date(e).getTime() - Date.now()) / 6e4);
  if (Math.abs(n) < 60) return { value: n, unit: "minute" };
  const a = Math.round(n / 60);
  return Math.abs(a) < 24 ? { value: a, unit: "hour" } : { value: Math.round(a / 24), unit: "day" };
}
const v = { unique: null, entityType: De, name: "Media", mediaType: { unique: null } }, Ve = 6;
let s = class extends Re {
  constructor() {
    super(), p(this, t), this._pickerContext = new ze(this), p(this, S, new Ce(this)), p(this, E, new Le(this)), p(this, x, new Ie(this)), p(this, T, new Pe(this)), p(this, w), p(this, M, "UmbMediaItemPickerLocation"), p(this, R, "RecentMediaPickerLastSeen"), this._view = "location", this._mineOnly = !0, this._loadingRecent = !1, this._isPartial = !1, this._recentItems = [], this._landingLocation = v, this._currentFolder = v, this._breadcrumb = [v], this._hasNavigated = !1, this._returnTo = null, this._children = [], this._searchQuery = "", this._searching = !1, this._searchResult = [], this._newSinceLastSeen = 0, this._typingNewFolder = !1, this._allowedFolderTypes = [], this._selectingFolderType = !1, p(this, g), p(this, y, 0), p(this, A, Ee(() => i(this, t, j).call(this), 500)), this.consumeContext(Oe, (e) => {
      this.observe(e?.dataType, (n) => k(this, w, n), "_observeDataType");
    });
  }
  async firstUpdated(e) {
    super.firstUpdated(e), await i(this, t, ee).call(this), i(this, t, W).call(this);
  }
  render() {
    return r`
      <umb-body-layout headline="Choose media">
        ${this._view === "recent" ? i(this, t, $e).call(this) : i(this, t, _e).call(this)}
        ${this._view === "location" ? i(this, t, de).call(this) : f}
        <div slot="footer-info" id="footer-info">
          ${i(this, t, he).call(this)}
          <div id="footer-divider"></div>
          ${this._view === "recent" ? i(this, t, fe).call(this) : i(this, t, pe).call(this)}
        </div>
        <div slot="actions">
          <uui-button label="Close" @click=${this._rejectModal}></uui-button>
          <uui-button label="Choose" look="primary" color="positive" @click=${this._submitModal}></uui-button>
        </div>
      </umb-body-layout>
    `;
  }
};
S = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
x = /* @__PURE__ */ new WeakMap();
T = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
M = /* @__PURE__ */ new WeakMap();
R = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
t = /* @__PURE__ */ new WeakSet();
N = function() {
  return this.data?.multiple ?? !1;
};
Z = function() {
  return this._view === "location" && !this._hasNavigated && this._landingLocation.unique === null && this._currentFolder.unique === this._landingLocation.unique && !this._searchQuery;
};
z = function(e) {
  return this.value?.selection?.includes(e) ?? !1;
};
C = function(e) {
  const n = u(this, t, N) ? [...this.value?.selection ?? [], e] : [e];
  this.modalContext?.setValue({ selection: n });
};
L = function(e) {
  const n = (this.value?.selection ?? []).filter((a) => a !== e);
  this.modalContext?.setValue({ selection: n });
};
$ = function() {
  this._searchQuery = "", this._searchResult = [];
};
j = async function() {
  if (!this._searchQuery) {
    i(this, t, $).call(this), this._searching = !1;
    return;
  }
  const { data: e } = await u(this, E).search({
    query: this._searchQuery,
    allowedContentTypes: this.data?.acceptedMediaTypes,
    dataTypeUnique: u(this, w)?.unique
  });
  this._searchResult = e?.items ?? [], this._searching = !1;
};
A = /* @__PURE__ */ new WeakMap();
J = function(e) {
  this._searchQuery = e.target.value.toLocaleLowerCase(), this._searching = !0, u(this, A).call(this);
};
ee = async function() {
  const e = i(this, t, te).call(this);
  if (e?.unique) {
    const { data: n } = await u(this, S).requestTreeItemAncestors({
      treeItem: { unique: e.unique, entityType: e.entityType }
    }), a = (n ?? []).map((o) => ke(o));
    a.length > 0 && (this._breadcrumb = [v, ...a], this._currentFolder = a[a.length - 1]);
  }
  this._landingLocation = this._currentFolder, this._hasNavigated = !1, await i(this, t, b).call(this), this._currentFolder.unique === null && await i(this, t, q).call(this);
};
te = function() {
  return this._pickerContext.interactionMemory.getMemory(u(this, M))?.value?.location;
};
P = function() {
  const e = {
    unique: u(this, M),
    value: { location: this._currentFolder }
  };
  this._pickerContext.interactionMemory.setMemory(e);
};
ie = function() {
  return this._pickerContext.interactionMemory.getMemory(u(this, R))?.value?.lastSeen;
};
ne = function() {
  const e = {
    unique: u(this, R),
    value: { lastSeen: (/* @__PURE__ */ new Date()).toISOString() }
  };
  this._pickerContext.interactionMemory.setMemory(e), this._newSinceLastSeen = 0;
};
W = async function() {
  const e = i(this, t, ie).call(this);
  if (!e) {
    this._newSinceLastSeen = 0;
    return;
  }
  const { data: n } = await H.recent({ query: { take: 60, mine: !1 } });
  if (!n) return;
  const a = new Date(e).getTime();
  this._newSinceLastSeen = n.items.filter((o) => new Date(o.createDate).getTime() > a).length;
};
q = async function() {
  this._loadingRecent = !0;
  const { data: e, error: n } = await H.recent({
    query: { take: 60, mine: this._mineOnly }
  });
  this._loadingRecent = !1, !(n || !e) && (this._isPartial = e.isPartial, this._recentItems = e.items.map(
    (a) => ({
      unique: a.id,
      name: a.name,
      icon: a.icon ?? void 0,
      createDate: a.createDate
    })
  ));
};
I = function(e) {
  this._mineOnly !== e && (this._mineOnly = e, i(this, t, q).call(this));
};
b = async function() {
  const { data: e } = await u(this, S).requestTreeItemsOf({
    parent: { unique: this._currentFolder.unique, entityType: this._currentFolder.entityType },
    dataType: u(this, w),
    skip: 0,
    take: 100
  });
  this._children = e?.items ?? [], await i(this, t, se).call(this);
};
ae = function(e) {
  i(this, t, $).call(this), this._currentFolder = ke(e), this._breadcrumb = [...this._breadcrumb, this._currentFolder], this._hasNavigated = !0, F(this, y)._++, i(this, t, P).call(this), i(this, t, b).call(this);
};
re = function(e) {
  i(this, t, $).call(this), this._breadcrumb = this._breadcrumb.slice(0, e + 1), this._currentFolder = this._breadcrumb[this._breadcrumb.length - 1], this._hasNavigated = this._currentFolder.unique !== this._landingLocation.unique, F(this, y)._++, i(this, t, P).call(this), i(this, t, b).call(this);
};
se = async function() {
  const e = this._currentFolder.mediaType?.unique ?? null, n = this._currentFolder.unique, { data: a } = await u(this, x).requestAllowedChildrenOf(
    e,
    n
  ), o = a?.items ?? [], l = await u(this, x).requestMediaTypesOfFolders(), m = new Set(o.map((h) => h.unique));
  this._allowedFolderTypes = l.filter((h) => m.has(h.unique));
};
oe = function() {
  this._allowedFolderTypes.length === 1 ? (k(this, g, this._allowedFolderTypes[0]), i(this, t, B).call(this)) : this._allowedFolderTypes.length > 1 && (this._selectingFolderType = !0);
};
le = function() {
  this._selectingFolderType = !1;
};
B = function(e) {
  e && k(this, g, e), this._selectingFolderType = !1, this._typingNewFolder = !0, requestAnimationFrame(() => this._newFolderInput?.focus());
};
ue = function(e) {
  e.key === "Enter" && requestAnimationFrame(() => this._newFolderInput?.blur());
};
ce = async function(e) {
  e.stopPropagation();
  const n = e.target.value;
  if (this._typingNewFolder = !1, !n || !u(this, g)?.unique) return;
  const a = this._currentFolder.unique, o = u(this, g).unique, l = {
    unique: Ne.new(),
    mediaType: { unique: o, collection: null },
    variants: [{ culture: null, segment: null, name: n, createDate: null, updateDate: null, flags: [] }]
  }, { data: m } = await u(this, T).createScaffold(l);
  if (!m) return;
  const { data: h } = await u(this, T).create(m, a);
  if (!h) return;
  const G = {
    unique: h.unique,
    entityType: h.entityType,
    name: h.variants[0].name,
    mediaType: { unique: o }
  };
  this._breadcrumb = [...this._breadcrumb, G], this._currentFolder = G, this._hasNavigated = !0, F(this, y)._++, i(this, t, P).call(this), await i(this, t, b).call(this);
};
Q = async function() {
  i(this, t, $).call(this), this._returnTo = this._currentFolder, this._view = "recent", this._recentItems.length === 0 && await i(this, t, q).call(this), i(this, t, ne).call(this);
};
D = async function() {
  const e = this._returnTo ?? v;
  this._currentFolder = e, this._hasNavigated = e.unique !== this._landingLocation.unique, this._returnTo = null, this._view = "location", F(this, y)._++, await i(this, t, b).call(this);
};
O = async function(e) {
  const a = e.target.value?.filter((l) => l.status === Ue.COMPLETE) ?? [];
  if (a.length === 0) return;
  await Promise.all([i(this, t, b).call(this), i(this, t, q).call(this)]), i(this, t, W).call(this);
  const o = a.map((l) => l.unique);
  if (u(this, t, N)) {
    const l = [.../* @__PURE__ */ new Set([...this.value?.selection ?? [], ...o])];
    this.modalContext?.setValue({ selection: l });
  } else
    this.modalContext?.setValue({ selection: [o[0]] });
};
de = function() {
  return u(this, y) % 2 === 0 ? r`<umb-dropzone-media
          id="dropzone"
          data-epoch="even"
          multiple
          @change=${i(this, t, O)}
          .parentUnique=${this._currentFolder.unique}>
        </umb-dropzone-media>` : r`<umb-dropzone-media
          id="dropzone"
          data-epoch="odd"
          multiple
          @change=${i(this, t, O)}
          .parentUnique=${this._currentFolder.unique}>
        </umb-dropzone-media>`;
};
he = function() {
  const e = this._view === "recent", n = e ? this._returnTo?.name ?? "Media" : "Recently added", a = e ? "icon-arrow-left" : "icon-time", o = !e && this._newSinceLastSeen > 0, l = this._newSinceLastSeen > 9 ? "9+" : `${this._newSinceLastSeen}`, m = o ? `Recently added, ${this._newSinceLastSeen} new` : n;
  return r`
      <button
        type="button"
        class="footer-pill"
        aria-label=${m}
        @click=${() => e ? i(this, t, D).call(this) : i(this, t, Q).call(this)}>
        <span class="pill-visual">
          <umb-icon name=${a}></umb-icon>
          <span class="pill-label">${n}</span>
          ${o ? r`<span class="pill-badge">${l} new</span>` : f}
        </span>
      </button>
    `;
};
pe = function() {
  return r`
      <uui-breadcrumbs>
        ${_(
    this._breadcrumb,
    (e) => e.unique ?? "root",
    (e, n) => r`
            <uui-breadcrumb-item
              @click=${e.unique !== this._currentFolder.unique ? () => i(this, t, re).call(this, n) : void 0}
              ?last-item=${e.unique === this._currentFolder.unique}>
              ${e.name}
            </uui-breadcrumb-item>
          `
  )}
      </uui-breadcrumbs>
      ${i(this, t, me).call(this)}
    `;
};
me = function() {
  return this._typingNewFolder ? r`<uui-input
        id="new-folder"
        label="Enter a folder name"
        placeholder="Enter a folder name"
        @blur=${i(this, t, ce)}
        @keypress=${(e) => i(this, t, ue).call(this, e)}></uui-input>` : this._selectingFolderType ? r`
        <div id="folder-type-selection">
          ${_(
    this._allowedFolderTypes,
    (e) => e.unique,
    (e) => r`
              <uui-button compact look="outline" .label=${e.name} @click=${() => i(this, t, B).call(this, e)}>
                ${e.icon ? r`<umb-icon name=${e.icon}></umb-icon>` : f} ${e.name}
              </uui-button>
            `
  )}
          <uui-button compact label="Cancel" @click=${() => i(this, t, le).call(this)}>
            <uui-icon name="icon-wrong"></uui-icon>
          </uui-button>
        </div>
      ` : this._allowedFolderTypes.length === 0 ? f : r`
      <uui-button id="add-folder-button" label="Create new folder" compact @click=${() => i(this, t, oe).call(this)}>
        <uui-icon name="icon-add"></uui-icon>
      </uui-button>
    `;
};
fe = function() {
  return r`
      <uui-breadcrumbs>
        <uui-breadcrumb-item @click=${() => i(this, t, D).call(this)}>Media</uui-breadcrumb-item>
        <uui-breadcrumb-item last-item>Recently added</uui-breadcrumb-item>
      </uui-breadcrumbs>
    `;
};
_e = function() {
  return r`
      <div id="toolbar">
        <div id="search">
          <uui-input
            label=${this.localize.term("general_search")}
            placeholder=${this.localize.term("placeholders_search")}
            @input=${i(this, t, J)}
            value=${this._searchQuery}>
            <div slot="prepend">
              ${this._searching ? r`<uui-loader-circle id="searching-indicator"></uui-loader-circle>` : r`<uui-icon name="search"></uui-icon>`}
            </div>
          </uui-input>
        </div>
        <uui-button label="Upload" look="outline" color="default" @click=${() => this._dropzone?.browse()}></uui-button>
      </div>
      ${this._searchQuery ? i(this, t, be).call(this) : i(this, t, ye).call(this)}
    `;
};
ye = function() {
  return r`
      ${u(this, t, Z) ? r`
            ${i(this, t, ge).call(this)}
            <div id="folders-label">Folders</div>
          ` : f}
      ${this._children.length === 0 ? r`<div class="empty-state">This folder is empty.</div>` : r`<div id="browse-grid">
            ${_(
    this._children,
    (e) => e.unique,
    (e) => i(this, t, Y).call(this, e)
  )}
          </div>`}
    `;
};
be = function() {
  return !this._searchResult.length && !this._searching ? r`<div class="empty-state">No results found.</div>` : r`<div id="browse-grid">
      ${_(
    this._searchResult,
    (e) => e.unique,
    (e) => i(this, t, Y).call(this, e)
  )}
    </div>`;
};
V = function() {
  return r`
      <uui-tab-group>
        <uui-tab label="by me" ?active=${this._mineOnly} @click=${() => i(this, t, I).call(this, !0)}></uui-tab>
        <uui-tab label="by everyone" ?active=${!this._mineOnly} @click=${() => i(this, t, I).call(this, !1)}></uui-tab>
      </uui-tab-group>
    `;
};
ge = function() {
  const e = this._recentItems.slice(0, Ve);
  return r`
      <div id="strip">
        <div id="strip-header">
          <span id="strip-label">Recently added</span>
          ${i(this, t, V).call(this)}
          ${this._recentItems.length > 0 ? r`
                <uui-button
                  id="see-all"
                  compact
                  look="text"
                  label="See all ${this._recentItems.length}"
                  @click=${() => i(this, t, Q).call(this)}>
                  See all ${this._recentItems.length} <uui-icon name="icon-arrow-right"></uui-icon>
                </uui-button>
              ` : f}
        </div>
        ${this._isPartial ? r`<div class="partial-note">
              Some older items may be missing from this list - the scan stopped early after checking a
              large number of restricted items.
            </div>` : f}
        ${this._loadingRecent ? r`<uui-loader></uui-loader>` : e.length === 0 ? i(this, t, ve).call(this) : r`<div id="strip-row">
                ${_(
    e,
    (n) => n.unique,
    (n) => i(this, t, we).call(this, n)
  )}
              </div>`}
      </div>
    `;
};
ve = function() {
  const e = this._mineOnly ? "You haven't uploaded anything recently." : "No media has been uploaded yet.";
  return r`
      <div id="strip-empty">
        <uui-icon name="icon-time"></uui-icon>
        <span>${e}</span>
      </div>
    `;
};
we = function(e) {
  const { value: n, unit: a } = Qe(e.createDate);
  return r`
      <div class="strip-item">
        <uui-card-media
          class="strip-card"
          name=${e.name}
          title=${this.localize.date(e.createDate, { dateStyle: "short", timeStyle: "medium" })}
          data-mark="media:${e.unique}"
          selectable
          select-only
          ?selected=${i(this, t, z).call(this, e.unique)}
          @selected=${() => i(this, t, C).call(this, e.unique)}
          @deselected=${() => i(this, t, L).call(this, e.unique)}>
          <umb-imaging-thumbnail unique=${e.unique} alt=${e.name} icon=${e.icon ?? f}></umb-imaging-thumbnail>
        </uui-card-media>
        <div class="strip-card-time">${this.localize.relativeTime(n, a)}</div>
      </div>
    `;
};
$e = function() {
  return r`
      <div id="toolbar">
        <div id="recent-view-label-group">
          <span id="recent-view-label">Recently added</span>
          ${i(this, t, V).call(this)}
        </div>
        <uui-button id="recent-back-link" look="text" compact @click=${() => i(this, t, D).call(this)}>
          <uui-icon name="icon-arrow-left"></uui-icon>
          ${this._returnTo?.name ?? "Media"}
        </uui-button>
      </div>
      ${this._isPartial ? r`<div class="partial-note">
            Some older items may be missing from this list - the scan stopped early after checking a
            large number of restricted items.
          </div>` : f}
      ${this._loadingRecent ? r`<uui-loader></uui-loader>` : this._recentItems.length === 0 ? i(this, t, qe).call(this) : i(this, t, xe).call(this)}
    `;
};
qe = function() {
  const e = this._mineOnly ? "You haven't uploaded anything recently." : "No media has been uploaded yet.";
  return r`<div class="empty-state">${e}</div>`;
};
xe = function() {
  const e = Ae(this._recentItems);
  return r`
      ${_(
    e,
    (n) => n.group,
    (n) => r`
          <div class="date-divider">${n.label}</div>
          <div class="date-group-grid">
            ${_(
      n.items,
      (a) => a.unique,
      (a) => i(this, t, Te).call(this, a)
    )}
          </div>
        `
  )}
    `;
};
Te = function(e) {
  return r`
      <uui-card-media
        name=${e.name}
        title=${this.localize.date(e.createDate, { dateStyle: "short", timeStyle: "medium" })}
        data-mark="media:${e.unique}"
        selectable
        select-only
        ?selected=${i(this, t, z).call(this, e.unique)}
        @selected=${() => i(this, t, C).call(this, e.unique)}
        @deselected=${() => i(this, t, L).call(this, e.unique)}>
        <umb-imaging-thumbnail unique=${e.unique} alt=${e.name} icon=${e.icon ?? f}></umb-imaging-thumbnail>
      </uui-card-media>
    `;
};
Y = function(e) {
  const n = e.hasChildren, a = n ? !1 : this.data?.pickableFilter?.(e) ?? !0;
  return r`
      <uui-card-media
        name=${e.name}
        data-mark="${e.entityType}:${e.unique}"
        ?selectable=${a}
        ?select-only=${a}
        ?selected=${i(this, t, z).call(this, e.unique)}
        @open=${() => n ? i(this, t, ae).call(this, e) : void 0}
        @selected=${() => i(this, t, C).call(this, e.unique)}
        @deselected=${() => i(this, t, L).call(this, e.unique)}>
        <umb-imaging-thumbnail
          unique=${e.unique}
          alt=${e.name}
          icon=${Fe(e.mediaType?.icon)}></umb-imaging-thumbnail>
      </uui-card-media>
    `;
};
s.styles = [
  Se`
      #toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--uui-size-6);
        margin-bottom: var(--uui-size-space-4);
      }

      #search {
        flex: 1;
      }

      #search uui-input {
        width: 100%;
      }

      /* Location D's toolbar: "Recently added by me / by everyone" reads as one sentence, with the
         back-link (duplicating the footer pill's active-state action) pushed to the far right. */
      #recent-view-label-group {
        display: flex;
        align-items: center;
        gap: var(--uui-size-3);
      }

      #recent-view-label {
        font-size: 13px;
        font-weight: 700;
        color: var(--uui-color-text);
      }

      #recent-back-link {
        flex: 0 0 auto;
      }

      #dropzone {
        display: contents;
      }

      /* Footer: pill, divider, breadcrumb - left to right, matching core's footer-info slot. */
      #footer-info {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-2);
        min-width: 0;
        overflow: hidden;
        flex: 1 1 auto;
        /* umb-footer-layout only gives its "actions" slot a margin (var(--uui-size-layout-1) on
           each side) - the default/footer-info slot gets none, which left the pill flush against
           the modal edge. Match the actions side's spacing here for symmetry. */
        margin-left: var(--uui-size-layout-1);
      }

      #footer-divider {
        flex: 0 0 auto;
        width: 1px;
        height: 16px;
        background: var(--uui-color-divider);
      }

      uui-breadcrumbs {
        overflow: hidden;
        min-width: 0;
        flex: 1 1 auto;
      }

      uui-breadcrumbs uui-breadcrumb-item:not([last-item]) {
        cursor: pointer;
      }

      /* Add-folder-from-breadcrumb - sits after the breadcrumbs in the same footer-info row, never
         shrinking (breadcrumbs already absorb overflow via flex:1 1 auto + overflow:hidden above). */
      #add-folder-button,
      #new-folder,
      #folder-type-selection {
        flex: 0 0 auto;
      }

      #new-folder {
        max-width: 180px;
      }

      #folder-type-selection {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-2);
      }

      /* The one genuinely new visual element - see the design handoff's "New element" section. */
      .footer-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        height: 44px;
        padding: 0;
        margin: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        font: inherit;
      }

      .footer-pill:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: 2px;
        border-radius: 14px;
      }

      .pill-visual {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        height: 28px;
        padding: 0 11px;
        box-sizing: border-box;
        border: 1px solid var(--uui-color-border-standalone);
        border-radius: 14px;
        background: var(--uui-color-surface);
        color: var(--uui-color-interactive);
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
      }

      .pill-visual umb-icon {
        font-size: 14px;
      }

      .pill-badge {
        display: inline-flex;
        align-items: center;
        height: 18px;
        padding: 0 7px;
        border-radius: 9px;
        background: var(--uui-color-selected);
        color: var(--uui-color-selected-contrast);
        font-family: monospace;
        font-size: 10px;
        font-weight: 700;
      }

      /* Recently added strip (Location A only). */
      #strip {
        flex: 0 0 auto;
        margin-bottom: var(--uui-size-6);
      }

      #strip-header {
        display: flex;
        align-items: center;
        /* Small gap so the label and the scope toggle read as one cluster; #see-all's own
           margin-left:auto overrides this and still pushes it hard right regardless. */
        gap: var(--uui-size-3);
        margin-bottom: var(--uui-size-space-3);
      }

      #strip-label {
        font-size: 13px;
        font-weight: 700;
        color: var(--uui-color-text);
      }

      #see-all {
        margin-left: auto;
        font-size: 13px;
        font-weight: 700;
      }

      #strip-row {
        display: flex;
        gap: var(--uui-size-space-4);
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        /* A clipped card reads as broken at any width; no fixed count avoids it since it depends on
           the modal's actual rendered width, not the number of cards. A soft fade at the trailing
           edge keeps the same "there's more" affordance without an abrupt hard cut, and works the
           same regardless of how many cards happen to fit. */
        mask-image: linear-gradient(to right, black calc(100% - 40px), transparent 100%);
        -webkit-mask-image: linear-gradient(to right, black calc(100% - 40px), transparent 100%);
      }

      #strip-row::-webkit-scrollbar {
        display: none;
      }

      .strip-item {
        display: flex;
        flex-direction: column;
        flex: 0 0 auto;
      }

      .strip-card {
        width: 130px;
        height: 96px;
      }

      .strip-card-time {
        font-size: 10px;
        font-family: monospace;
        color: var(--uui-color-text-alt);
        text-align: center;
        margin-top: 2px;
      }

      #strip-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--uui-size-space-3);
        height: 126px;
        border: 1px dashed var(--uui-color-border);
        background: var(--uui-color-surface);
        color: var(--uui-color-text-alt);
        padding: 0 var(--uui-size-6);
      }

      #folders-label {
        font-size: 13px;
        font-weight: 700;
        color: var(--uui-color-text-alt);
        border-top: 1px solid var(--uui-color-divider);
        padding-top: var(--uui-size-space-4);
        margin-bottom: var(--uui-size-space-3);
      }

      .partial-note,
      .empty-state {
        color: var(--uui-color-text-alt);
        margin-bottom: var(--uui-size-space-4);
      }

      .date-divider {
        font-weight: bold;
        color: var(--uui-color-text-alt);
        margin: var(--uui-size-space-4) 0 var(--uui-size-space-3);
      }

      .date-divider:first-of-type {
        margin-top: 0;
      }

      .date-group-grid,
      #browse-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        grid-auto-rows: 160px;
        gap: var(--uui-size-space-5);
      }

      .date-group-grid {
        margin-bottom: var(--uui-size-space-4);
      }
    `
];
c([
  d()
], s.prototype, "_view", 2);
c([
  d()
], s.prototype, "_mineOnly", 2);
c([
  d()
], s.prototype, "_loadingRecent", 2);
c([
  d()
], s.prototype, "_isPartial", 2);
c([
  d()
], s.prototype, "_recentItems", 2);
c([
  d()
], s.prototype, "_landingLocation", 2);
c([
  d()
], s.prototype, "_currentFolder", 2);
c([
  d()
], s.prototype, "_breadcrumb", 2);
c([
  d()
], s.prototype, "_hasNavigated", 2);
c([
  d()
], s.prototype, "_returnTo", 2);
c([
  d()
], s.prototype, "_children", 2);
c([
  d()
], s.prototype, "_searchQuery", 2);
c([
  d()
], s.prototype, "_searching", 2);
c([
  d()
], s.prototype, "_searchResult", 2);
c([
  d()
], s.prototype, "_newSinceLastSeen", 2);
c([
  K("#dropzone")
], s.prototype, "_dropzone", 2);
c([
  K("#new-folder")
], s.prototype, "_newFolderInput", 2);
c([
  d()
], s.prototype, "_typingNewFolder", 2);
c([
  d()
], s.prototype, "_allowedFolderTypes", 2);
c([
  d()
], s.prototype, "_selectingFolderType", 2);
s = c([
  Me("recent-media-picker-modal")
], s);
const nt = s;
export {
  s as RecentMediaPickerModalElement,
  nt as default
};
//# sourceMappingURL=recent-media-picker-modal.element-C3NIlroe.js.map
