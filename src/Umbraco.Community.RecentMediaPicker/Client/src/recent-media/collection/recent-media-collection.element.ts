import { customElement, html, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbCollectionDefaultElement } from "@umbraco-cms/backoffice/collection";
import { RecentMediaScopeContext } from "./scope.context.js";

/**
 * Overrides the default collection shell's toolbar to add the "by me"/"by everyone" scope tabs on
 * the same row as the Grid/Table view switcher (left-aligned, switcher stays pinned right via
 * `<umb-collection-toolbar>`'s own layout - see its `#slot { flex: 1 }` in core). Otherwise
 * identical to `kind: "default"`'s own `umb-collection-default` (registered here as an `element`
 * override on top of that same kind, not a rewrite).
 */
@customElement("recent-media-collection")
export class RecentMediaCollectionElement extends UmbCollectionDefaultElement {
  #scopeContext = new RecentMediaScopeContext(this);

  @state()
  private _mineOnly = true;

  constructor() {
    super();
    this.observe(this.#scopeContext.mineOnly, (value) => (this._mineOnly = value), "_observeMineOnly");
  }

  #setMineOnly(value: boolean) {
    this.#scopeContext.setMineOnly(value);
  }

  protected override renderToolbar() {
    return html`
      <umb-collection-toolbar slot="header">
        <uui-tab-group>
          <uui-tab label="by me" ?active=${this._mineOnly} @click=${() => this.#setMineOnly(true)}></uui-tab>
          <uui-tab label="by everyone" ?active=${!this._mineOnly} @click=${() => this.#setMineOnly(false)}></uui-tab>
        </uui-tab-group>
      </umb-collection-toolbar>
    `;
  }
}

export default RecentMediaCollectionElement;

declare global {
  interface HTMLElementTagNameMap {
    "recent-media-collection": RecentMediaCollectionElement;
  }
}
