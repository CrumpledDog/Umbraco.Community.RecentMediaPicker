import { css, customElement, html, ifDefined, nothing, repeat, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_COLLECTION_CONTEXT } from "@umbraco-cms/backoffice/collection";
import { UMB_ACTION_EVENT_CONTEXT } from "@umbraco-cms/backoffice/action";
import { UmbRequestReloadChildrenOfEntityEvent, UmbRequestReloadStructureForEntityEvent } from "@umbraco-cms/backoffice/entity-action";
import { fetchRecentMedia, type RecentMediaItem } from "../recent-media/collection/fetch-recent-media.js";
import { buildMediaEditHref } from "../recent-media/collection/edit-media-href.js";
import { groupItemsByDate } from "../recent-media/date-grouping.js";
import { RECENT_MEDIA_ROOT_ENTITY_TYPE } from "../recent-media/entity.js";
import { RECENT_MEDIA_SCOPE_CONTEXT } from "../recent-media/collection/scope.context.js";
import "@umbraco-cms/backoffice/imaging";

// Registered as the "Grid" option of the "Recently added" tree node's collection view switcher (see
// recent-media/collection/views/grid/manifests.ts) - this element itself has no idea it's no longer
// hosted inside Umb.Collection.Media, since it only consumes the ambient UMB_COLLECTION_CONTEXT for
// setupView/selection and does its own independent data fetch (see
// ../recent-media/collection/fetch-recent-media.ts, shared with the Table view).
//
// Deliberately avoids UmbCollectionViewElementBase and <umb-entity-collection-item-card> - neither is
// exported/registered by the pinned Umbraco.Cms 17.0.0 runtime (added in a later backoffice version).
// Mirrors the pattern the installed version's own Grid collection view actually uses instead.
//
// This view intentionally does NOT reuse the ambient (per-folder-scoped) collection context for data -
// "recent" is a global, cross-folder question, not a different presentation of the current folder's
// children. The existing Management API media/collection endpoint can't answer that question (it only
// returns direct children, not deep descendants), so this calls a small custom backend endpoint
// (Umbraco.Community.RecentMediaPicker's own RecentMediaController) that queries recursively via IMediaService and
// applies the same start-node permission check as core, always regardless of which folder is currently
// being browsed.
@customElement("recent-media-collection-view")
export class RecentMediaCollectionViewElement extends UmbLitElement {
  @state()
  private _items: Array<RecentMediaItem> = [];

  @state()
  private _mineOnly = true;

  @state()
  private _selection: Array<string | null> = [];

  #collectionContext?: typeof UMB_COLLECTION_CONTEXT.TYPE;
  #actionEventContext?: typeof UMB_ACTION_EVENT_CONTEXT.TYPE;

  constructor() {
    super();

    this.consumeContext(UMB_COLLECTION_CONTEXT, (collectionContext) => {
      this.#collectionContext = collectionContext;
      collectionContext?.setupView(this);

      this.observe(
        collectionContext?.selection.selection,
        (selection) => (this._selection = selection ?? []),
        "_observeSelection",
      );
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

    // Bulk actions (Move to/Trash) work against the real media repositories, so they succeed
    // regardless of who hosts the selection bar - but since this view self-fetches instead of
    // consuming the ambient collection's own repository-driven `.items`, nothing tells it to
    // refresh afterwards unless it listens for the same reload signal core's own collection
    // context listens for. That signal carries *our* workspace's synthetic entity identity (see
    // recent-media/entity.ts), not "media" - filter on that, not on entityType "media".
    this.consumeContext(UMB_ACTION_EVENT_CONTEXT, (context) => {
      this.#actionEventContext?.removeEventListener(UmbRequestReloadStructureForEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
      this.#actionEventContext?.removeEventListener(UmbRequestReloadChildrenOfEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
      this.#actionEventContext = context;
      context?.addEventListener(UmbRequestReloadStructureForEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
      context?.addEventListener(UmbRequestReloadChildrenOfEntityEvent.TYPE, this.#onReloadRequest as unknown as EventListener);
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
    this._items = items;
  }

  #onSelect(item: RecentMediaItem) {
    this.#collectionContext?.selection.select(item.unique);
  }

  #onDeselect(item: RecentMediaItem) {
    this.#collectionContext?.selection.deselect(item.unique);
  }

  #isSelected(item: RecentMediaItem) {
    return this.#collectionContext?.selection.isSelected(item.unique) ?? false;
  }

  override render() {
    const groups = groupItemsByDate(this._items);
    return html`
      ${repeat(
        groups,
        (g) => g.group,
        (g) => html`
          <div class="date-divider">${g.label}</div>
          <div class="date-group-grid">
            ${repeat(
              g.items,
              (item) => item.unique,
              (item) => this.#renderItem(item),
            )}
          </div>
        `,
      )}
    `;
  }

  #renderItem(item: RecentMediaItem) {
    return html`
      <uui-card-media
        name=${ifDefined(item.name)}
        href=${buildMediaEditHref(item.unique)}
        data-mark="${item.entityType}:${item.unique}"
        selectable
        ?select-only=${this._selection.length > 0}
        ?selected=${this.#isSelected(item)}
        @selected=${() => this.#onSelect(item)}
        @deselected=${() => this.#onDeselect(item)}>
        <umb-imaging-thumbnail
          .unique=${item.unique}
          alt=${ifDefined(item.name)}
          icon=${item.icon ?? nothing}></umb-imaging-thumbnail>
      </uui-card-media>
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

      .date-group-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        grid-auto-rows: 200px;
        gap: var(--uui-size-space-5);
        margin-bottom: var(--uui-size-space-4);
      }
    `,
  ];
}

export default RecentMediaCollectionViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "recent-media-collection-view": RecentMediaCollectionViewElement;
  }
}
