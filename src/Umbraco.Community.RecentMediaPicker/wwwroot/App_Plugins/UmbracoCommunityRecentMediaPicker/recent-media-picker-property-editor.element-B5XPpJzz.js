import { UmbModalToken as x } from "@umbraco-cms/backoffice/modal";
import { UMB_MEDIA_ITEM_REPOSITORY_ALIAS as w, UMB_IMAGE_CROPPER_EDITOR_MODAL as A } from "@umbraco-cms/backoffice/media";
import { UmbPickerInputContext as B } from "@umbraco-cms/backoffice/picker-input";
import { nothing as _, repeat as C, html as h, css as R, property as v, state as c, customElement as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent as P } from "@umbraco-cms/backoffice/event";
import { UmbId as U } from "@umbraco-cms/backoffice/id";
import { UmbLitElement as $ } from "@umbraco-cms/backoffice/lit-element";
import { UmbFormControlMixin as q, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as K } from "@umbraco-cms/backoffice/validation";
import { UMB_MEDIA_TYPE_ENTITY_TYPE as S } from "@umbraco-cms/backoffice/media-type";
import { UmbModalRouteRegistrationController as V } from "@umbraco-cms/backoffice/router";
import "@umbraco-cms/backoffice/imaging";
const D = new x("Umbraco.Community.RecentMediaPicker.Modal.RecentMediaPicker", {
  modal: {
    type: "sidebar",
    size: "medium"
  }
});
class L extends B {
  constructor(t) {
    super(t, w, D);
  }
}
var F = Object.defineProperty, Y = Object.getOwnPropertyDescriptor, E = (e) => {
  throw TypeError(e);
}, r = (e, t, i, o) => {
  for (var s = o > 1 ? void 0 : o ? Y(t, i) : t, m = e.length - 1, a; m >= 0; m--)
    (a = e[m]) && (s = (o ? a(t, i, s) : a(s)) || s);
  return o && s && F(t, i, s), s;
}, k = (e, t, i) => t.has(e) || E("Cannot " + i), u = (e, t, i) => (k(e, t, "read from private field"), i ? i.call(e) : t.get(e)), y = (e, t, i) => t.has(e) ? E("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), p = (e, t, i) => (k(e, t, "access private method"), i), l, d, f, g, M, b, T;
let n = class extends q(
  $,
  void 0
) {
  constructor() {
    super(), y(this, d), this.mandatoryMessage = K, this.readonly = !1, this._multiple = !1, this._min = 0, this._max = 1 / 0, this._cards = [], this._focalPointEnabled = !1, this._preselectedCrops = [], y(this, l, new L(this)), y(this, M, (e) => !this._allowedMediaTypes?.length || this._allowedMediaTypes.includes(e.mediaType.unique)), this.observe(u(this, l).selection, (e) => p(this, d, g).call(this, e)), this.observe(u(this, l).selectedItems, () => p(this, d, f).call(this)), this.addValidator(
      "valueMissing",
      () => this.mandatoryMessage,
      () => !this.readonly && !!this.mandatory && (!this.value || this.value.length === 0)
    ), this.addValidator(
      "rangeUnderflow",
      () => `This field needs at least ${this._min} item(s)`,
      () => !this.readonly && !!this._min && (this.value?.length ?? 0) < this._min
    ), this.addValidator(
      "rangeOverflow",
      () => `This field exceeds the allowed amount of ${this._max} item(s)`,
      () => !this.readonly && this._max !== 1 / 0 && (this.value?.length ?? 0) > this._max
    ), new V(this, A).addAdditionalPath(":key").onSetup((e) => {
      const t = e.key;
      if (!t) return !1;
      const i = this.value?.find((o) => o.key === t);
      return i ? {
        data: {
          key: t,
          unique: i.mediaKey,
          hideFocalPoint: !this._focalPointEnabled,
          cropOptions: this._preselectedCrops
        },
        value: {
          key: t,
          unique: i.mediaKey,
          crops: i.crops ?? [],
          focalPoint: i.focalPoint ?? { left: 0.5, top: 0.5 }
        }
      } : !1;
    }).onSubmit((e) => {
      this.value = this.value?.map((t) => t.key !== e.key ? t : {
        ...t,
        crops: e.crops,
        focalPoint: this._focalPointEnabled ? e.focalPoint : null
      }), this.dispatchEvent(new P());
    }).observeRouteBuilder((e) => {
      this._routeBuilder = e;
    });
  }
  set config(e) {
    if (!e) return;
    this._multiple = !!e.getValueByAlias("multiple");
    const t = e.getValueByAlias("validationLimit");
    this._min = t?.min ?? 0, this._max = t?.max ?? 1 / 0, this._allowedMediaTypes = e.getValueByAlias("filter")?.split(",").filter(Boolean) ?? void 0, this._focalPointEnabled = !!e.getValueByAlias("enableLocalFocalPoint"), this._preselectedCrops = e.getValueByAlias("crops") ?? [];
  }
  set value(e) {
    super.value = e, u(this, l).setSelection(e?.map((t) => t.mediaKey) ?? []), p(this, d, f).call(this);
  }
  get value() {
    return super.value;
  }
  getFormElement() {
  }
  render() {
    return h`
      <div id="cards">
        ${C(
      this._cards,
      (e) => e.key,
      (e) => h`
            <uui-card-media
              name=${e.name}
              data-mark="media:${e.unique}"
              .href=${this.readonly ? void 0 : this._routeBuilder?.({ key: e.key })}>
              <umb-imaging-thumbnail unique=${e.unique} alt=${e.name} icon=${e.icon ?? _}></umb-imaging-thumbnail>
              ${this.readonly ? _ : h`
                    <uui-action-bar slot="actions">
                      <uui-button label="Remove" @click=${() => p(this, d, T).call(this, e.unique)}>
                        <uui-icon name="icon-trash"></uui-icon>
                      </uui-button>
                    </uui-action-bar>
                  `}
            </uui-card-media>
          `
    )}
        ${!this.readonly && (this._multiple || this._cards.length === 0) ? h`
              <uui-button id="add-button" look="placeholder" @click=${() => p(this, d, b).call(this)}>
                <uui-icon name="icon-add"></uui-icon>
                ${this.localize.term("general_choose")}
              </uui-button>
            ` : _}
      </div>
    `;
  }
};
l = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakSet();
f = function() {
  const e = u(this, l).getSelectedItems();
  this._cards = (this.value ?? []).map((t) => {
    const i = e.find((o) => o.unique === t.mediaKey);
    return {
      key: t.key,
      unique: t.mediaKey,
      name: i?.name ?? "",
      icon: i?.mediaType?.icon,
      mediaTypeUnique: i?.mediaType?.unique
    };
  });
};
g = function(e) {
  const t = e.filter((a) => a !== null), i = (this.value ?? []).filter((a) => t.includes(a.mediaKey)), o = new Set(i.map((a) => a.mediaKey)), s = t.filter((a) => !o.has(a)).map((a) => ({ key: U.new(), mediaKey: a, mediaTypeAlias: "", focalPoint: null, crops: [] })), m = [...i, ...s].sort((a, I) => t.indexOf(a.mediaKey) - t.indexOf(I.mediaKey));
  this.value = m, this.dispatchEvent(new P());
};
M = /* @__PURE__ */ new WeakMap();
b = function() {
  u(this, l).openPicker({
    multiple: this._multiple,
    pickableFilter: u(this, M),
    acceptedMediaTypes: this._allowedMediaTypes?.map((e) => ({ unique: e, entityType: S }))
  });
};
T = function(e) {
  u(this, l).requestRemoveItem(e);
};
n.styles = [
  R`
      #cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        grid-auto-rows: 160px;
        gap: var(--uui-size-space-4);
      }

      #add-button {
        height: 100%;
      }
    `
];
r([
  v({ type: Boolean })
], n.prototype, "mandatory", 2);
r([
  v({ type: String })
], n.prototype, "mandatoryMessage", 2);
r([
  v({ type: Boolean, reflect: !0 })
], n.prototype, "readonly", 2);
r([
  c()
], n.prototype, "_multiple", 2);
r([
  c()
], n.prototype, "_min", 2);
r([
  c()
], n.prototype, "_max", 2);
r([
  c()
], n.prototype, "_cards", 2);
r([
  c()
], n.prototype, "_routeBuilder", 2);
n = r([
  O("recent-media-picker")
], n);
const te = n;
export {
  n as RecentMediaPickerPropertyEditorElement,
  te as default
};
//# sourceMappingURL=recent-media-picker-property-editor.element-B5XPpJzz.js.map
