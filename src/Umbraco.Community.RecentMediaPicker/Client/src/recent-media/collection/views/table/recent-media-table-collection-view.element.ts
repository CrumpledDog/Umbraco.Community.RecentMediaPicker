import { css, customElement, html, repeat, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_COLLECTION_CONTEXT } from "@umbraco-cms/backoffice/collection";
import { UMB_ACTION_EVENT_CONTEXT } from "@umbraco-cms/backoffice/action";
import { UmbRequestReloadChildrenOfEntityEvent, UmbRequestReloadStructureForEntityEvent } from "@umbraco-cms/backoffice/entity-action";
import type {
  UmbTableColumn,
  UmbTableConfig,
  UmbTableDeselectedEvent,
  UmbTableElement,
  UmbTableItem,
  UmbTableSelectedEvent,
} from "@umbraco-cms/backoffice/components";
import { fetchRecentMedia, type RecentMediaItem } from "../../fetch-recent-media.js";
import { buildMediaEditHref } from "../../edit-media-href.js";
import { groupItemsByDate, type DateGroupBucket } from "../../../date-grouping.js";
import { RECENT_MEDIA_ROOT_ENTITY_TYPE } from "../../../entity.js";
import { RECENT_MEDIA_SCOPE_CONTEXT } from "../../scope.context.js";

// The "Table"/List option alongside Grid (see ../grid/manifests.ts) for the "Recently added" tree
// node's collection view switcher - same shared fetch helper as Grid, rendered as rows via core's
// <umb-table> instead of a card grid. Mirrors the general column shape of core's own
// media-table-collection-view.element.ts (name + date columns) - not reused directly, since that
// element isn't publicly exported and is wired to the per-folder Umb.Collection.Media context.
@customElement("recent-media-table-collection-view")
export class RecentMediaTableCollectionViewElement extends UmbLitElement {
  @state()
  private _mineOnly = true;

  @state()
  private _groups: Array<DateGroupBucket<RecentMediaItem>> = [];

  // allowSelectAll is disabled - with one <umb-table> per date bucket sharing one selection array,
  // "select all" would overwrite the *entire* shared selection with only that bucket's own item
  // ids (see UmbTableElement#_selectAllRows), silently dropping selections made in other buckets.
  // Single-row select/deselect doesn't have this problem (it only ever adds/removes its own id).
  @state()
  private _tableConfig: UmbTableConfig = { allowSelection: true, allowSelectAll: false };

  @state()
  private _tableColumns: Array<UmbTableColumn> = [
    { name: this.localize.term("general_name"), alias: "name" },
    { name: "Last Edited", alias: "updateDate" },
    { name: "Updated by", alias: "updatedByName" },
    { name: "Date Created", alias: "createDate" },
  ];

  @state()
  private _selection: Array<string> = [];

  #collectionContext?: typeof UMB_COLLECTION_CONTEXT.TYPE;
  #actionEventContext?: typeof UMB_ACTION_EVENT_CONTEXT.TYPE;

  constructor() {
    super();

    this.consumeContext(UMB_COLLECTION_CONTEXT, (collectionContext) => {
      this.#collectionContext = collectionContext;
      collectionContext?.setupView(this);

      this.observe(
        collectionContext?.selection.selection,
        (selection) => (this._selection = (selection ?? []).filter((value): value is string => value !== null)),
        "_observeSelection",
      );
    });

    // See the Grid view's identical comment - our own fetch bypasses the ambient collection's
    // items pipeline, so a successful bulk action needs an explicit nudge to re-fetch.
    this.consumeContext(UMB_ACTION_EVENT_CONTEXT, (context) => {
      this.#actionEventContext?.removeEventListener(UmbRequestReloadStructureForEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
      this.#actionEventContext?.removeEventListener(UmbRequestReloadChildrenOfEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
      this.#actionEventContext = context;
      context?.addEventListener(UmbRequestReloadStructureForEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
      context?.addEventListener(UmbRequestReloadChildrenOfEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
    });

    // "by me"/"by everyone" lives in the shared scope context (provided by the custom collection
    // element hosting the toolbar - see recent-media/collection/recent-media-collection.element.ts)
    // so the tabs can render once, on the same row as the Grid/Table switcher, instead of once per view.
    this.consumeContext(RECENT_MEDIA_SCOPE_CONTEXT, (scopeContext) => {
      this.observe(
        scopeContext?.mineOnly,
        (value) => {
          this._mineOnly = value ?? true;
          this.#requestRecentMedia();
        },
        "_observeMineOnly",
      );
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#actionEventContext?.removeEventListener(UmbRequestReloadStructureForEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
    this.#actionEventContext?.removeEventListener(UmbRequestReloadChildrenOfEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
  }

  #onReloadRequest = (event: UmbRequestReloadStructureForEntityEvent | UmbRequestReloadChildrenOfEntityEvent) => {
    if (event.getEntityType() !== RECENT_MEDIA_ROOT_ENTITY_TYPE) return;
    this.#requestRecentMedia();
  };

  async #requestRecentMedia() {
    const { items } = await fetchRecentMedia(50, this._mineOnly);
    this._groups = groupItemsByDate(items);
  }

  #toTableItem(item: RecentMediaItem): UmbTableItem {
    return {
      id: item.unique,
      icon: item.icon,
      entityType: item.entityType,
      data: [
        {
          columnAlias: "name",
          value: html`<uui-button
            compact
            href=${buildMediaEditHref(item.unique)}
            label=${item.name ?? ""}
            @click=${(e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              window.history.pushState(null, "", (e.target as HTMLAnchorElement).href);
            }}></uui-button>`,
        },
        { columnAlias: "updateDate", value: this.localize.date(item.updateDate, { dateStyle: "short", timeStyle: "medium" }) },
        { columnAlias: "updatedByName", value: item.updatedByName ?? "—" },
        { columnAlias: "createDate", value: this.localize.date(item.createDate, { dateStyle: "short", timeStyle: "medium" }) },
      ],
    };
  }

  #handleSelect(event: UmbTableSelectedEvent) {
    event.stopPropagation();
    const table = event.target as UmbTableElement;
    this.#collectionContext?.selection.setSelection(table.selection);
  }

  #handleDeselect(event: UmbTableDeselectedEvent) {
    event.stopPropagation();
    const table = event.target as UmbTableElement;
    this.#collectionContext?.selection.setSelection(table.selection);
  }

  override render() {
    return html`
      ${repeat(
        this._groups,
        (g) => g.group,
        (g) => html`
          <div class="date-divider">${g.label}</div>
          <umb-table
            .config=${this._tableConfig}
            .columns=${this._tableColumns}
            .items=${g.items.map((item) => this.#toTableItem(item))}
            .selection=${this._selection}
            @selected=${this.#handleSelect}
            @deselected=${this.#handleDeselect}></umb-table>
        `,
      )}
    `;
  }

  static override styles = [
    UmbTextStyles,
    css`
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
    `,
  ];
}

export default RecentMediaTableCollectionViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "recent-media-table-collection-view": RecentMediaTableCollectionViewElement;
  }
}
