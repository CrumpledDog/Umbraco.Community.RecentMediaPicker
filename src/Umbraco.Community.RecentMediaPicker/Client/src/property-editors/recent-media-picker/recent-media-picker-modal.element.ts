import type {
  UmbRecentMediaPickerModalData,
  UmbRecentMediaPickerModalValue,
} from "./recent-media-picker-modal.token.js";
import { UmbracoCommunityRecentMediaPickerService } from "../../api/index.js";
import {
  css,
  customElement,
  html,
  ifDefined,
  nothing,
  repeat,
  state,
  query,
  type PropertyValues,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbPickerContext, UmbPickerModalBaseElement } from "@umbraco-cms/backoffice/picker";
import type { UmbPickerContext as UmbPickerContextType } from "@umbraco-cms/backoffice/picker";
import type { UmbInteractionMemoryModel } from "@umbraco-cms/backoffice/interaction-memory";
import { UMB_MEDIA_ROOT_ENTITY_TYPE, UmbMediaDetailRepository, UmbMediaSearchProvider, UmbMediaTreeRepository } from "@umbraco-cms/backoffice/media";
import type {
  UmbMediaDetailModel,
  UmbMediaSearchItemModel,
  UmbMediaTreeItemModel,
  UmbDropzoneMediaElement,
} from "@umbraco-cms/backoffice/media";
import { UmbMediaTypeStructureRepository } from "@umbraco-cms/backoffice/media-type";
import type { UmbAllowedMediaTypeModel } from "@umbraco-cms/backoffice/media-type";
import { UMB_PROPERTY_TYPE_BASED_PROPERTY_CONTEXT } from "@umbraco-cms/backoffice/content";
import { UmbFileDropzoneItemStatus } from "@umbraco-cms/backoffice/dropzone";
import type { UmbDropzoneChangeEvent } from "@umbraco-cms/backoffice/dropzone";
import { debounce } from "@umbraco-cms/backoffice/utils";
import { UmbId } from "@umbraco-cms/backoffice/id";
import type { UUIInputElement, UUIInputEvent } from "@umbraco-cms/backoffice/external/uui";
import "@umbraco-cms/backoffice/imaging";
import "@umbraco-cms/backoffice/media";
import { groupItemsByDate } from "../../recent-media/date-grouping.js";

interface RecentModeItem {
  unique: string;
  name: string;
  icon?: string;
  createDate: string;
}

interface FolderRef {
  unique: string | null;
  entityType: string;
  name: string;
  /** The folder's own media type - needed to look up which child types (incl. folder types) it allows. */
  mediaType?: { unique: string | null };
}

/** Builds a `FolderRef` from any tree/search/ancestor item that carries a `mediaType.unique`. */
function toFolderRef(item: { unique: string; entityType: string; name: string; mediaType?: { unique?: string } }): FolderRef {
  return {
    unique: item.unique,
    entityType: item.entityType,
    name: item.name,
    mediaType: { unique: item.mediaType?.unique ?? null },
  };
}

/** Picks the largest whole unit (minute/hour/day) an ISO date can be expressed in, for `localize.relativeTime`. */
function relativeTimeParts(dateIso: string): { value: number; unit: "minute" | "hour" | "day" } {
  const diffMinutes = Math.round((new Date(dateIso).getTime() - Date.now()) / 60000);
  if (Math.abs(diffMinutes) < 60) return { value: diffMinutes, unit: "minute" };
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return { value: diffHours, unit: "hour" };
  return { value: Math.round(diffHours / 24), unit: "day" };
}

const ROOT_FOLDER: FolderRef = { unique: null, entityType: UMB_MEDIA_ROOT_ENTITY_TYPE, name: "Media", mediaType: { unique: null } };

/** How many of the newest recent items are shown in the "Recently added" strip at Media root. */
const STRIP_SIZE = 6;

/**
 * A Media Picker modal that treats "recently uploaded media" as a *place*, not a mode:
 *
 * - The picker opens exactly where core opens it (Media root, or the folder restored from
 *   interaction memory).
 * - At Media root, and only there, a "Recently added" strip of the newest uploads sits above the
 *   folder grid. Navigating into a folder is a deliberate act, so the strip disappears.
 * - A "Recently added" pill is permanently docked in the footer, left of the breadcrumb - one click
 *   from anywhere, zero vertical cost - carrying an `N new` badge for uploads since this editor last
 *   looked. Clicking it makes "Recently added" the current location; the pill flips to
 *   `<- <previous folder>` so the round trip never loses their place.
 *
 * Not a full port of core's media-picker-modal.element.ts - it now matches search, Accepted Types,
 * and crop/focal-point editing (Phase 2b), but deliberately never honors the Data Type's Start Node:
 * this picker's own "mine"/"everyone" recent view is already correctly scoped to the current user's
 * real account permissions (see RecentMediaController.Recent), so a Start Node would only add a
 * client-side landing-location convenience with no real access-control purpose - and if an editor
 * genuinely wants a picker constrained to one small fixed folder, recency isn't a useful feature for
 * that anyway; core's own Media Picker is the right tool there.
 */
@customElement("recent-media-picker-modal")
export class RecentMediaPickerModalElement extends UmbPickerModalBaseElement<
  UmbMediaTreeItemModel,
  UmbRecentMediaPickerModalData,
  UmbRecentMediaPickerModalValue
> {
  protected override _pickerContext: UmbPickerContextType = new UmbPickerContext(this);

  #mediaTreeRepository = new UmbMediaTreeRepository(this);
  #mediaSearchProvider = new UmbMediaSearchProvider(this);
  #mediaTypeStructureRepository = new UmbMediaTypeStructureRepository(this);
  #mediaDetailRepository = new UmbMediaDetailRepository(this);

  /** The property's own Data Type unique - threaded into every tree/search request so the server can
   *  resolve "Ignore User Start Nodes" from that Data Type's stored config (core does the same). */
  #dataType?: { unique: string };

  // Interaction-memory keys. Reusing core's own `UmbMediaItemPickerLocation` key name is safe - this
  // package's _pickerContext carries its own separate UmbInteractionMemoryManager instance, so there's
  // no collision with core's actual media picker, just a shared naming convention.
  #locationMemoryUnique = "UmbMediaItemPickerLocation";
  #lastSeenMemoryUnique = "RecentMediaPickerLastSeen";

  /** 'location' = normal folder browsing (Locations A/B/C). 'recent' = the "Recently added" place (Location D). */
  @state()
  private _view: "location" | "recent" = "location";

  @state()
  private _mineOnly = true;

  @state()
  private _loadingRecent = false;

  @state()
  private _isPartial = false;

  @state()
  private _recentItems: Array<RecentModeItem> = [];

  /** Where the modal opened - Media root, or the folder restored from interaction memory. Gates the strip. */
  @state()
  private _landingLocation: FolderRef = ROOT_FOLDER;

  @state()
  private _currentFolder: FolderRef = ROOT_FOLDER;

  @state()
  private _breadcrumb: Array<FolderRef> = [ROOT_FOLDER];

  /** True once the user has deliberately changed location away from where they landed. Gates the strip. */
  @state()
  private _hasNavigated = false;

  /** Where the footer pill sends them back to, once "Recently added" (Location D) is entered. */
  @state()
  private _returnTo: FolderRef | null = null;

  @state()
  private _children: Array<UmbMediaTreeItemModel> = [];

  @state()
  private _searchQuery = "";

  @state()
  private _searching = false;

  @state()
  private _searchResult: Array<UmbMediaSearchItemModel> = [];

  /** Badge count of everyone's uploads since this editor last looked at "Recently added". Capped at 9 for display. */
  @state()
  private _newSinceLastSeen = 0;

  @query("#dropzone")
  private _dropzone?: UmbDropzoneMediaElement;

  @query("#new-folder")
  private _newFolderInput?: UUIInputElement;

  /** Add-folder-from-breadcrumb state (Location view only - mirrors core's media-picker-folder-path.element.ts). */
  @state()
  private _typingNewFolder = false;

  @state()
  private _allowedFolderTypes: Array<UmbAllowedMediaTypeModel> = [];

  @state()
  private _selectingFolderType = false;

  #selectedFolderType?: UmbAllowedMediaTypeModel;

  // Bumped every time _currentFolder changes while returning to Location view - see #renderDropzone.
  #dropzoneEpoch = 0;

  constructor() {
    super();
    // Same timing as core's own media-picker-modal.element.ts - not awaited before the initial
    // folder load, so the very first fetch may go out without a dataType; subsequent navigations
    // always have it once the context resolves.
    this.consumeContext(UMB_PROPERTY_TYPE_BASED_PROPERTY_CONTEXT, (context) => {
      this.observe(context?.dataType, (dataType) => (this.#dataType = dataType), "_observeDataType");
    });
  }

  protected override async firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    await this.#restoreLandingLocation();
    this.#refreshBadge();
  }

  get #multiple() {
    return this.data?.multiple ?? false;
  }

  get #stripVisible() {
    return (
      this._view === "location" &&
      !this._hasNavigated &&
      this._landingLocation.unique === null &&
      this._currentFolder.unique === this._landingLocation.unique &&
      !this._searchQuery
    );
  }

  #isSelected(unique: string) {
    return this.value?.selection?.includes(unique) ?? false;
  }

  #onSelect(unique: string) {
    const selection = this.#multiple ? [...(this.value?.selection ?? []), unique] : [unique];
    this.modalContext?.setValue({ selection });
  }

  #onDeselect(unique: string) {
    const selection = (this.value?.selection ?? []).filter((value) => value !== unique);
    this.modalContext?.setValue({ selection });
  }

  #clearSearch() {
    this._searchQuery = "";
    this._searchResult = [];
  }

  async #searchMedia() {
    if (!this._searchQuery) {
      this.#clearSearch();
      this._searching = false;
      return;
    }

    const { data } = await this.#mediaSearchProvider.search({
      query: this._searchQuery,
      allowedContentTypes: this.data?.acceptedMediaTypes,
      dataTypeUnique: this.#dataType?.unique,
    });
    this._searchResult = data?.items ?? [];
    this._searching = false;
  }

  #debouncedSearch = debounce(() => this.#searchMedia(), 500);

  #onSearch(e: UUIInputEvent) {
    this._searchQuery = (e.target.value as string).toLocaleLowerCase();
    this._searching = true;
    this.#debouncedSearch();
  }

  async #restoreLandingLocation() {
    const locationFromMemory = this.#getLocationFromMemory();

    // Start Node is deliberately not honored by this picker (see the property editor element's
    // `config` setter for why) - landing location is always either wherever interaction memory
    // last left off, or Media root, exactly like before Phase 2b.
    if (locationFromMemory?.unique) {
      const { data: ancestors } = await this.#mediaTreeRepository.requestTreeItemAncestors({
        treeItem: { unique: locationFromMemory.unique, entityType: locationFromMemory.entityType },
      });
      const path: Array<FolderRef> = (ancestors ?? []).map((item) => toFolderRef(item));

      if (path.length > 0) {
        this._breadcrumb = [ROOT_FOLDER, ...path];
        this._currentFolder = path[path.length - 1];
      }
    }

    this._landingLocation = this._currentFolder;
    this._hasNavigated = false;

    // The folder grid is always shown in Location view (root or a real folder); the strip is an
    // addition on top of it at root, not a replacement for it.
    await this.#loadFolder();
    if (this._currentFolder.unique === null) {
      await this.#loadRecent();
    }
  }

  #getLocationFromMemory(): FolderRef | undefined {
    const memory = this._pickerContext.interactionMemory.getMemory(this.#locationMemoryUnique);
    return memory?.value?.location;
  }

  #setLocationInMemory() {
    const memory: UmbInteractionMemoryModel = {
      unique: this.#locationMemoryUnique,
      value: { location: this._currentFolder },
    };
    this._pickerContext.interactionMemory.setMemory(memory);
  }

  #getLastSeen(): string | undefined {
    return this._pickerContext.interactionMemory.getMemory(this.#lastSeenMemoryUnique)?.value?.lastSeen;
  }

  #setLastSeenNow() {
    const memory: UmbInteractionMemoryModel = {
      unique: this.#lastSeenMemoryUnique,
      value: { lastSeen: new Date().toISOString() },
    };
    this._pickerContext.interactionMemory.setMemory(memory);
    this._newSinceLastSeen = 0;
  }

  async #refreshBadge() {
    const lastSeen = this.#getLastSeen();
    if (!lastSeen) {
      this._newSinceLastSeen = 0;
      return;
    }

    const { data } = await UmbracoCommunityRecentMediaPickerService.recent({ query: { take: 60, mine: false } });
    if (!data) return;

    const lastSeenTime = new Date(lastSeen).getTime();
    this._newSinceLastSeen = data.items.filter((item) => new Date(item.createDate).getTime() > lastSeenTime).length;
  }

  async #loadRecent() {
    this._loadingRecent = true;
    const { data, error } = await UmbracoCommunityRecentMediaPickerService.recent({
      query: { take: 60, mine: this._mineOnly },
    });
    this._loadingRecent = false;

    if (error || !data) return;

    this._isPartial = data.isPartial;
    this._recentItems = data.items.map(
      (item): RecentModeItem => ({
        unique: item.id,
        name: item.name,
        icon: item.icon ?? undefined,
        createDate: item.createDate,
      }),
    );
  }

  #setMineOnly(value: boolean) {
    if (this._mineOnly === value) return;
    this._mineOnly = value;
    this.#loadRecent();
  }

  async #loadFolder() {
    const { data } = await this.#mediaTreeRepository.requestTreeItemsOf({
      parent: { unique: this._currentFolder.unique, entityType: this._currentFolder.entityType },
      dataType: this.#dataType,
      skip: 0,
      take: 100,
    });
    this._children = data?.items ?? [];
    // Recomputed on every navigation, same as core's own #loadPath - which folder types (if any)
    // are allowed as children here decides whether the add-folder button shows at all.
    await this.#updateAllowedFolderTypes();
  }

  #navigateInto(item: UmbMediaTreeItemModel | UmbMediaSearchItemModel) {
    this.#clearSearch();
    this._currentFolder = toFolderRef(item);
    this._breadcrumb = [...this._breadcrumb, this._currentFolder];
    this._hasNavigated = true;
    this.#dropzoneEpoch++;
    this.#setLocationInMemory();
    this.#loadFolder();
  }

  #navigateToBreadcrumb(index: number) {
    this.#clearSearch();
    this._breadcrumb = this._breadcrumb.slice(0, index + 1);
    this._currentFolder = this._breadcrumb[this._breadcrumb.length - 1];
    this._hasNavigated = this._currentFolder.unique !== this._landingLocation.unique;
    this.#dropzoneEpoch++;
    this.#setLocationInMemory();
    this.#loadFolder();
  }

  /**
   * Add-folder-from-breadcrumb (mirrors core's media-picker-folder-path.element.ts, folded directly
   * into this modal instead of a separate child component - no UmbChangeEvent round-trip needed
   * since there's no parent to report back to).
   */
  async #updateAllowedFolderTypes() {
    const mediaTypeUnique = this._currentFolder.mediaType?.unique ?? null;
    const parentUnique = this._currentFolder.unique;

    const { data: allowedChildrenData } = await this.#mediaTypeStructureRepository.requestAllowedChildrenOf(
      mediaTypeUnique,
      parentUnique,
    );
    const allowedChildren = allowedChildrenData?.items ?? [];
    const allFolderTypes = await this.#mediaTypeStructureRepository.requestMediaTypesOfFolders();

    const allowedFolderTypeUniques = new Set(allowedChildren.map((c) => c.unique));
    this._allowedFolderTypes = allFolderTypes.filter((ft) => allowedFolderTypeUniques.has(ft.unique));
  }

  #onAddFolderClick() {
    if (this._allowedFolderTypes.length === 1) {
      this.#selectedFolderType = this._allowedFolderTypes[0];
      this.#focusFolderInput();
    } else if (this._allowedFolderTypes.length > 1) {
      this._selectingFolderType = true;
    }
  }

  #cancelFolderTypeSelection() {
    this._selectingFolderType = false;
  }

  #focusFolderInput(folderType?: UmbAllowedMediaTypeModel) {
    if (folderType) {
      this.#selectedFolderType = folderType;
    }
    this._selectingFolderType = false;
    this._typingNewFolder = true;
    requestAnimationFrame(() => this._newFolderInput?.focus());
  }

  #onFolderNameKeypress(e: KeyboardEvent) {
    if (e.key === "Enter") {
      requestAnimationFrame(() => this._newFolderInput?.blur());
    }
  }

  async #addFolder(e: UUIInputEvent) {
    e.stopPropagation();

    const newName = e.target.value as string;
    this._typingNewFolder = false;
    if (!newName || !this.#selectedFolderType?.unique) return;

    const parentUnique = this._currentFolder.unique;
    const folderTypeUnique = this.#selectedFolderType.unique;

    const preset: Partial<UmbMediaDetailModel> = {
      unique: UmbId.new(),
      mediaType: { unique: folderTypeUnique, collection: null },
      variants: [{ culture: null, segment: null, name: newName, createDate: null, updateDate: null, flags: [] }],
    };
    const { data: scaffold } = await this.#mediaDetailRepository.createScaffold(preset);
    if (!scaffold) return;

    const { data } = await this.#mediaDetailRepository.create(scaffold, parentUnique);
    if (!data) return;

    const newFolder: FolderRef = {
      unique: data.unique,
      entityType: data.entityType,
      name: data.variants[0].name,
      mediaType: { unique: folderTypeUnique },
    };

    this._breadcrumb = [...this._breadcrumb, newFolder];
    this._currentFolder = newFolder;
    this._hasNavigated = true;
    this.#dropzoneEpoch++;
    this.#setLocationInMemory();
    await this.#loadFolder();
  }

  async #openRecentlyAdded() {
    this.#clearSearch();
    this._returnTo = this._currentFolder;
    this._view = "recent";
    if (this._recentItems.length === 0) {
      await this.#loadRecent();
    }
    this.#setLastSeenNow();
  }

  async #closeRecentlyAdded() {
    const target = this._returnTo ?? ROOT_FOLDER;
    this._currentFolder = target;
    this._hasNavigated = target.unique !== this._landingLocation.unique;
    this._returnTo = null;
    this._view = "location";
    this.#dropzoneEpoch++;
    await this.#loadFolder();
  }

  async #onDropzoneChange(event: UmbDropzoneChangeEvent) {
    const target = event.target as UmbDropzoneMediaElement;
    const completed = target.value?.filter((item) => item.status === UmbFileDropzoneItemStatus.COMPLETE) ?? [];
    if (completed.length === 0) return;

    await Promise.all([this.#loadFolder(), this.#loadRecent()]);
    this.#refreshBadge();

    const uniques = completed.map((item) => item.unique);
    if (this.#multiple) {
      const selection = [...new Set([...(this.value?.selection ?? []), ...uniques])];
      this.modalContext?.setValue({ selection });
    } else {
      this.modalContext?.setValue({ selection: [uniques[0]] });
    }
  }

  override render() {
    return html`
      <umb-body-layout headline="Choose media">
        ${this._view === "recent" ? this.#renderRecentlyAddedView() : this.#renderLocationView()}
        ${this._view === "location" ? this.#renderDropzone() : nothing}
        <div slot="footer-info" id="footer-info">
          ${this.#renderFooterPill()}
          <div id="footer-divider"></div>
          ${this._view === "recent" ? this.#renderRecentBreadcrumb() : this.#renderLocationBreadcrumb()}
        </div>
        <div slot="actions">
          <uui-button label="Close" @click=${this._rejectModal}></uui-button>
          <uui-button label="Choose" look="primary" color="positive" @click=${this._submitModal}></uui-button>
        </div>
      </umb-body-layout>
    `;
  }

  /**
   * `<umb-dropzone-media>`'s upload-progress overlay (the "Clear file(s)" widget) is driven by
   * fully private internal state with no public reset method, so simply re-binding `.parentUnique`
   * on the *same* element leaves a completed upload's overlay stuck visible after navigating to a
   * different folder. Forcing Lit to discard and recreate the element on every folder change - via
   * two textually-distinct (but otherwise identical) `html` tagged templates, picked by parity of
   * `#dropzoneEpoch` - clears that internal state as a side effect, since it's a genuinely new
   * element each time. (Lit's `keyed()` directive would be the tidier way to express this, but
   * this environment's actual served backoffice bundle doesn't export it - confirmed at runtime.)
   */
  #renderDropzone() {
    // The two branches must be textually distinct source, not just logically equivalent - if
    // they were byte-identical, an optimizing build could dedupe the two `html` tagged-template
    // string arrays back into one shared identity, which would silently defeat this whole trick
    // (confirmed happening in practice: identical branches still resolved to the same DOM node).
    // The literal (unbound) data-epoch value, not any interpolated expression, is what keeps them
    // apart.
    return this.#dropzoneEpoch % 2 === 0
      ? html`<umb-dropzone-media
          id="dropzone"
          data-epoch="even"
          multiple
          @change=${this.#onDropzoneChange}
          .parentUnique=${this._currentFolder.unique}>
        </umb-dropzone-media>`
      : html`<umb-dropzone-media
          id="dropzone"
          data-epoch="odd"
          multiple
          @change=${this.#onDropzoneChange}
          .parentUnique=${this._currentFolder.unique}>
        </umb-dropzone-media>`;
  }

  #renderFooterPill() {
    const isActive = this._view === "recent";
    const label = isActive ? (this._returnTo?.name ?? "Media") : "Recently added";
    const icon = isActive ? "icon-arrow-left" : "icon-time";
    const showBadge = !isActive && this._newSinceLastSeen > 0;
    const badgeText = this._newSinceLastSeen > 9 ? "9+" : `${this._newSinceLastSeen}`;
    const ariaLabel = showBadge ? `Recently added, ${this._newSinceLastSeen} new` : label;

    return html`
      <button
        type="button"
        class="footer-pill"
        aria-label=${ariaLabel}
        @click=${() => (isActive ? this.#closeRecentlyAdded() : this.#openRecentlyAdded())}>
        <span class="pill-visual">
          <umb-icon name=${icon}></umb-icon>
          <span class="pill-label">${label}</span>
          ${showBadge ? html`<span class="pill-badge">${badgeText} new</span>` : nothing}
        </span>
      </button>
    `;
  }

  #renderLocationBreadcrumb() {
    return html`
      <uui-breadcrumbs>
        ${repeat(
          this._breadcrumb,
          (folder) => folder.unique ?? "root",
          (folder, index) => html`
            <uui-breadcrumb-item
              @click=${folder.unique !== this._currentFolder.unique ? () => this.#navigateToBreadcrumb(index) : undefined}
              ?last-item=${folder.unique === this._currentFolder.unique}>
              ${folder.name}
            </uui-breadcrumb-item>
          `,
        )}
      </uui-breadcrumbs>
      ${this.#renderFolderCreation()}
    `;
  }

  #renderFolderCreation() {
    if (this._typingNewFolder) {
      return html`<uui-input
        id="new-folder"
        label="Enter a folder name"
        placeholder="Enter a folder name"
        @blur=${this.#addFolder}
        @keypress=${(e: KeyboardEvent) => this.#onFolderNameKeypress(e)}></uui-input>`;
    }

    if (this._selectingFolderType) {
      return html`
        <div id="folder-type-selection">
          ${repeat(
            this._allowedFolderTypes,
            (ft) => ft.unique,
            (ft) => html`
              <uui-button compact look="outline" .label=${ft.name} @click=${() => this.#focusFolderInput(ft)}>
                ${ft.icon ? html`<umb-icon name=${ft.icon}></umb-icon>` : nothing} ${ft.name}
              </uui-button>
            `,
          )}
          <uui-button compact label="Cancel" @click=${() => this.#cancelFolderTypeSelection()}>
            <uui-icon name="icon-wrong"></uui-icon>
          </uui-button>
        </div>
      `;
    }

    if (this._allowedFolderTypes.length === 0) return nothing;

    return html`
      <uui-button id="add-folder-button" label="Create new folder" compact @click=${() => this.#onAddFolderClick()}>
        <uui-icon name="icon-add"></uui-icon>
      </uui-button>
    `;
  }

  #renderRecentBreadcrumb() {
    return html`
      <uui-breadcrumbs>
        <uui-breadcrumb-item @click=${() => this.#closeRecentlyAdded()}>Media</uui-breadcrumb-item>
        <uui-breadcrumb-item last-item>Recently added</uui-breadcrumb-item>
      </uui-breadcrumbs>
    `;
  }

  #renderLocationView() {
    return html`
      <div id="toolbar">
        <div id="search">
          <uui-input
            label=${this.localize.term("general_search")}
            placeholder=${this.localize.term("placeholders_search")}
            @input=${this.#onSearch}
            value=${this._searchQuery}>
            <div slot="prepend">
              ${this._searching
                ? html`<uui-loader-circle id="searching-indicator"></uui-loader-circle>`
                : html`<uui-icon name="search"></uui-icon>`}
            </div>
          </uui-input>
        </div>
        <uui-button label="Upload" look="outline" color="default" @click=${() => this._dropzone?.browse()}></uui-button>
      </div>
      ${this._searchQuery ? this.#renderSearchResult() : this.#renderLocationContent()}
    `;
  }

  #renderLocationContent() {
    return html`
      ${this.#stripVisible
        ? html`
            ${this.#renderRecentStrip()}
            <div id="folders-label">Folders</div>
          `
        : nothing}
      ${this._children.length === 0
        ? html`<div class="empty-state">This folder is empty.</div>`
        : html`<div id="browse-grid">
            ${repeat(
              this._children,
              (item) => item.unique,
              (item) => this.#renderBrowseCard(item),
            )}
          </div>`}
    `;
  }

  #renderSearchResult() {
    if (!this._searchResult.length && !this._searching) {
      return html`<div class="empty-state">No results found.</div>`;
    }
    return html`<div id="browse-grid">
      ${repeat(
        this._searchResult,
        (item) => item.unique,
        (item) => this.#renderBrowseCard(item),
      )}
    </div>`;
  }

  /** Reads as a continuation of whatever label precedes it - "Recently added by me / by everyone". */
  #renderScopeTabs() {
    return html`
      <uui-tab-group>
        <uui-tab label="by me" ?active=${this._mineOnly} @click=${() => this.#setMineOnly(true)}></uui-tab>
        <uui-tab label="by everyone" ?active=${!this._mineOnly} @click=${() => this.#setMineOnly(false)}></uui-tab>
      </uui-tab-group>
    `;
  }

  #renderRecentStrip() {
    const items = this._recentItems.slice(0, STRIP_SIZE);
    return html`
      <div id="strip">
        <div id="strip-header">
          <span id="strip-label">Recently added</span>
          ${this.#renderScopeTabs()}
          ${this._recentItems.length > 0
            ? html`
                <uui-button
                  id="see-all"
                  compact
                  look="text"
                  label="See all ${this._recentItems.length}"
                  @click=${() => this.#openRecentlyAdded()}>
                  See all ${this._recentItems.length} <uui-icon name="icon-arrow-right"></uui-icon>
                </uui-button>
              `
            : nothing}
        </div>
        ${this._isPartial
          ? html`<div class="partial-note">
              Some older items may be missing from this list - the scan stopped early after checking a
              large number of restricted items.
            </div>`
          : nothing}
        ${this._loadingRecent
          ? html`<uui-loader></uui-loader>`
          : items.length === 0
            ? this.#renderStripEmptyState()
            : html`<div id="strip-row">
                ${repeat(
                  items,
                  (item) => item.unique,
                  (item) => this.#renderStripCard(item),
                )}
              </div>`}
      </div>
    `;
  }

  #renderStripEmptyState() {
    const message = this._mineOnly
      ? "You haven't uploaded anything recently."
      : "No media has been uploaded yet.";
    return html`
      <div id="strip-empty">
        <uui-icon name="icon-time"></uui-icon>
        <span>${message}</span>
      </div>
    `;
  }

  #renderStripCard(item: RecentModeItem) {
    const { value, unit } = relativeTimeParts(item.createDate);
    return html`
      <div class="strip-item">
        <uui-card-media
          class="strip-card"
          name=${item.name}
          title=${this.localize.date(item.createDate, { dateStyle: "short", timeStyle: "medium" })}
          data-mark="media:${item.unique}"
          selectable
          select-only
          ?selected=${this.#isSelected(item.unique)}
          @selected=${() => this.#onSelect(item.unique)}
          @deselected=${() => this.#onDeselect(item.unique)}>
          <umb-imaging-thumbnail unique=${item.unique} alt=${item.name} icon=${item.icon ?? nothing}></umb-imaging-thumbnail>
        </uui-card-media>
        <div class="strip-card-time">${this.localize.relativeTime(value, unit)}</div>
      </div>
    `;
  }

  #renderRecentlyAddedView() {
    // Deliberate deviation from the design handoff's literal "toolbar unchanged" instruction for
    // this view: no Upload here (which folder would it target isn't obvious from this screen),
    // and the scope control is the same tab-toggle the strip uses rather than a plain checkbox,
    // for visual consistency. The footer pill still offers the same "back to <folder>" action too
    // - the duplication is intentional, not an oversight.
    return html`
      <div id="toolbar">
        <div id="recent-view-label-group">
          <span id="recent-view-label">Recently added</span>
          ${this.#renderScopeTabs()}
        </div>
        <uui-button id="recent-back-link" look="text" compact @click=${() => this.#closeRecentlyAdded()}>
          <uui-icon name="icon-arrow-left"></uui-icon>
          ${this._returnTo?.name ?? "Media"}
        </uui-button>
      </div>
      ${this._isPartial
        ? html`<div class="partial-note">
            Some older items may be missing from this list - the scan stopped early after checking a
            large number of restricted items.
          </div>`
        : nothing}
      ${this._loadingRecent
        ? html`<uui-loader></uui-loader>`
        : this._recentItems.length === 0
          ? this.#renderRecentEmptyState()
          : this.#renderRecentGrid()}
    `;
  }

  #renderRecentEmptyState() {
    const message = this._mineOnly
      ? "You haven't uploaded anything recently."
      : "No media has been uploaded yet.";
    return html`<div class="empty-state">${message}</div>`;
  }

  #renderRecentGrid() {
    // Each date bucket gets its own heading *and its own grid* - not one continuous grid with
    // inline dividers mixed in, which would force a divider's row to reserve a full card-height
    // grid track (via #recent-grid's shared grid-auto-rows) despite its short text content.
    const groups = groupItemsByDate(this._recentItems);

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
              (item) => this.#renderRecentCard(item),
            )}
          </div>
        `,
      )}
    `;
  }

  #renderRecentCard(item: RecentModeItem) {
    return html`
      <uui-card-media
        name=${item.name}
        title=${this.localize.date(item.createDate, { dateStyle: "short", timeStyle: "medium" })}
        data-mark="media:${item.unique}"
        selectable
        select-only
        ?selected=${this.#isSelected(item.unique)}
        @selected=${() => this.#onSelect(item.unique)}
        @deselected=${() => this.#onDeselect(item.unique)}>
        <umb-imaging-thumbnail unique=${item.unique} alt=${item.name} icon=${item.icon ?? nothing}></umb-imaging-thumbnail>
      </uui-card-media>
    `;
  }

  #renderBrowseCard(item: UmbMediaTreeItemModel | UmbMediaSearchItemModel) {
    // `item.isFolder` is hardcoded `false` by core's own media tree data source for every real
    // item (see media-tree.server.data-source.ts) - it only distinguishes the synthetic root node.
    // `hasChildren` is the reliable "this is navigable" signal, matching core's own
    // media-picker-modal.element.ts#allowNavigateToMedia.
    const isFolder = item.hasChildren;
    // Accepted Types (config alias `filter`) greys out ineligible non-folder items rather than
    // hiding them - matches core's own #allowNavigateToMedia/selectable split. Folders stay
    // navigable regardless of the filter.
    const selectable = isFolder ? false : (this.data?.pickableFilter?.(item) ?? true);
    // `select-only` mirrors core's own `?select-only=${this._isSelectionMode || canNavigate === false}`
    // (see media-picker-modal.element.ts#renderCard): unconditionally true whenever the item itself
    // can't be navigated into, regardless of whether anything else is currently selected. Gating it on
    // "is anything already selected" (as this used to) meant a click on the very first item, in an
    // otherwise-empty selection, was interpreted as an "open" gesture rather than "select" - a real,
    // click-anywhere-on-the-card no-op bug (a plain focus/hover outline with no actual selection),
    // masked in most manual testing because there was usually already a prior selection making
    // select-only true by the time a second item got clicked.
    return html`
      <uui-card-media
        name=${item.name}
        data-mark="${item.entityType}:${item.unique}"
        ?selectable=${selectable}
        ?select-only=${selectable}
        ?selected=${this.#isSelected(item.unique)}
        @open=${() => (isFolder ? this.#navigateInto(item) : undefined)}
        @selected=${() => this.#onSelect(item.unique)}
        @deselected=${() => this.#onDeselect(item.unique)}>
        <umb-imaging-thumbnail
          unique=${item.unique}
          alt=${item.name}
          icon=${ifDefined(item.mediaType?.icon)}></umb-imaging-thumbnail>
      </uui-card-media>
    `;
  }

  static override styles = [
    css`
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
    `,
  ];
}

export default RecentMediaPickerModalElement;

declare global {
  interface HTMLElementTagNameMap {
    "recent-media-picker-modal": RecentMediaPickerModalElement;
  }
}
