import { UmbRecentMediaPickerInputContext } from "./recent-media-picker-input.context.js";
import type { RecentMediaPickerValueEntry } from "./types.js";
import { css, customElement, html, nothing, property, repeat, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UmbId } from "@umbraco-cms/backoffice/id";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VALIDATION_EMPTY_LOCALIZATION_KEY, UmbFormControlMixin } from "@umbraco-cms/backoffice/validation";
import type {
  UmbPropertyEditorConfigCollection,
  UmbPropertyEditorUiElement,
} from "@umbraco-cms/backoffice/property-editor";
import type { UmbNumberRangeValueType } from "@umbraco-cms/backoffice/models";
import { UMB_IMAGE_CROPPER_EDITOR_MODAL } from "@umbraco-cms/backoffice/media";
import type { UmbCropModel } from "@umbraco-cms/backoffice/media";
import { UMB_MEDIA_TYPE_ENTITY_TYPE } from "@umbraco-cms/backoffice/media-type";
import { UmbModalRouteRegistrationController } from "@umbraco-cms/backoffice/router";
import "@umbraco-cms/backoffice/imaging";

interface ChosenCard {
  key: string;
  unique: string;
  name: string;
  icon?: string;
  mediaTypeUnique?: string;
}

/**
 * Alternative UI for the Umbraco.MediaPicker3 schema. Now at core parity for Accepted Types and
 * focal point/crop editing (Phase 2b) - the "Recent"/"Mine" picker experience is still this
 * package's whole point, and everything else now matches core's own umb-input-rich-media, except
 * Start Node: deliberately NOT honored (see the `config` setter for why). Produces the same value
 * shape as core's Media Picker (see ./types.ts), so a Data Type can be switched back to core's own
 * UI without a data migration.
 */
@customElement("recent-media-picker")
export class RecentMediaPickerPropertyEditorElement
  extends UmbFormControlMixin<Array<RecentMediaPickerValueEntry> | undefined, typeof UmbLitElement, undefined>(
    UmbLitElement,
    undefined,
  )
  implements UmbPropertyEditorUiElement
{
  public set config(config: UmbPropertyEditorConfigCollection | undefined) {
    if (!config) return;
    this._multiple = Boolean(config.getValueByAlias("multiple"));
    const minMax = config.getValueByAlias<UmbNumberRangeValueType>("validationLimit");
    this._min = minMax?.min ?? 0;
    this._max = minMax?.max ?? Infinity;

    this._allowedMediaTypes = config.getValueByAlias<string>("filter")?.split(",").filter(Boolean) ?? undefined;
    this._focalPointEnabled = Boolean(config.getValueByAlias("enableLocalFocalPoint"));
    this._preselectedCrops = config.getValueByAlias<Array<UmbCropModel>>("crops") ?? [];

    // `startNodeId` (and `ignoreUserStartNodes`, which only matters in combination with it) is
    // deliberately never read here - this picker's own "mine"/"everyone" recent view is already
    // correctly scoped to whatever the current user's real account permissions allow (see
    // RecentMediaController.Recent, which applies ContentPermissions.HasPathAccess unconditionally
    // to every item regardless of the `mine` flag), so a Data Type-level Start Node would only ever
    // add a client-side landing-location convenience with no real access-control purpose. If an
    // editor genuinely wants a picker constrained to one small fixed folder, recency isn't a useful
    // feature for that anyway - core's own Media Picker (which does honor Start Node) is the right
    // tool. The field still appears in the Data Type's Settings screen (inherited from the shared
    // Umbraco.MediaPicker3 config schema, kept so a Data Type can switch to core's Media Picker UI
    // without a migration) - it's just silently unused by this picker.
  }

  @property({ type: Boolean })
  mandatory?: boolean;

  @property({ type: String })
  mandatoryMessage = UMB_VALIDATION_EMPTY_LOCALIZATION_KEY;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @state()
  private _multiple = false;

  @state()
  private _min = 0;

  @state()
  private _max = Infinity;

  @state()
  private _cards: Array<ChosenCard> = [];

  private _allowedMediaTypes?: Array<string>;
  private _focalPointEnabled = false;
  private _preselectedCrops: Array<UmbCropModel> = [];

  @state()
  private _routeBuilder?: (params: { key: string }) => string;

  #pickerInputContext = new UmbRecentMediaPickerInputContext(this);

  public override set value(value: Array<RecentMediaPickerValueEntry> | undefined) {
    super.value = value;
    this.#pickerInputContext.setSelection(value?.map((item) => item.mediaKey) ?? []);
    this.#populateCards();
  }
  public override get value(): Array<RecentMediaPickerValueEntry> | undefined {
    return super.value;
  }

  constructor() {
    super();

    this.observe(this.#pickerInputContext.selection, (selection) => this.#syncSelectionToValue(selection));
    this.observe(this.#pickerInputContext.selectedItems, () => this.#populateCards());

    this.addValidator(
      "valueMissing",
      () => this.mandatoryMessage,
      () => !this.readonly && !!this.mandatory && (!this.value || this.value.length === 0),
    );
    this.addValidator(
      "rangeUnderflow",
      () => `This field needs at least ${this._min} item(s)`,
      () => !this.readonly && !!this._min && (this.value?.length ?? 0) < this._min,
    );
    this.addValidator(
      "rangeOverflow",
      () => `This field exceeds the allowed amount of ${this._max} item(s)`,
      () => !this.readonly && this._max !== Infinity && (this.value?.length ?? 0) > this._max,
    );

    // Focal point/crop editing - mirrors core's umb-input-rich-media exactly: a modal-route
    // registration so each chosen card's whole thumbnail (via its own `.href`) opens
    // UMB_IMAGE_CROPPER_EDITOR_MODAL, seeded from this card's existing crops/focalPoint plus the
    // Data Type's configured crop slots, merging the result back into the matching value entry.
    new UmbModalRouteRegistrationController(this, UMB_IMAGE_CROPPER_EDITOR_MODAL)
      .addAdditionalPath(":key")
      .onSetup((params) => {
        const key = params.key;
        if (!key) return false;
        const item = this.value?.find((entry) => entry.key === key);
        if (!item) return false;
        return {
          data: {
            key,
            unique: item.mediaKey,
            hideFocalPoint: !this._focalPointEnabled,
            cropOptions: this._preselectedCrops,
          },
          value: {
            key,
            unique: item.mediaKey,
            crops: item.crops ?? [],
            focalPoint: item.focalPoint ?? { left: 0.5, top: 0.5 },
          },
        };
      })
      .onSubmit((value) => {
        this.value = this.value?.map((item) => {
          if (item.key !== value.key) return item;
          return {
            ...item,
            crops: value.crops,
            focalPoint: this._focalPointEnabled ? value.focalPoint : null,
          };
        });
        this.dispatchEvent(new UmbChangeEvent());
      })
      .observeRouteBuilder((routeBuilder) => {
        this._routeBuilder = routeBuilder;
      });
  }

  protected override getFormElement() {
    return undefined;
  }

  #populateCards() {
    const mediaItems = this.#pickerInputContext.getSelectedItems();
    this._cards = (this.value ?? []).map((item) => {
      const media = mediaItems.find((x) => x.unique === item.mediaKey);
      return {
        key: item.key,
        unique: item.mediaKey,
        name: media?.name ?? "",
        icon: media?.mediaType?.icon,
        mediaTypeUnique: media?.mediaType?.unique,
      };
    });
  }

  #syncSelectionToValue(selection: Array<string | null>) {
    const uniques = selection.filter((value): value is string => value !== null);
    const kept = (this.value ?? []).filter((item) => uniques.includes(item.mediaKey));
    const existing = new Set(kept.map((item) => item.mediaKey));

    const additions: Array<RecentMediaPickerValueEntry> = uniques
      .filter((unique) => !existing.has(unique))
      .map((unique) => ({ key: UmbId.new(), mediaKey: unique, mediaTypeAlias: "", focalPoint: null, crops: [] }));

    const next = [...kept, ...additions].sort((a, b) => uniques.indexOf(a.mediaKey) - uniques.indexOf(b.mediaKey));

    this.value = next;
    this.dispatchEvent(new UmbChangeEvent());
  }

  #pickableFilter = (item: { mediaType: { unique: string } }) =>
    !this._allowedMediaTypes?.length || this._allowedMediaTypes.includes(item.mediaType.unique);

  #openPicker() {
    this.#pickerInputContext.openPicker({
      multiple: this._multiple,
      pickableFilter: this.#pickableFilter,
      acceptedMediaTypes: this._allowedMediaTypes?.map((unique) => ({ unique, entityType: UMB_MEDIA_TYPE_ENTITY_TYPE })),
    });
  }

  #removeItem(unique: string) {
    this.#pickerInputContext.requestRemoveItem(unique);
  }

  override render() {
    return html`
      <div id="cards">
        ${repeat(
          this._cards,
          (card) => card.key,
          (card) => html`
            <uui-card-media
              name=${card.name}
              data-mark="media:${card.unique}"
              .href=${!this.readonly ? this._routeBuilder?.({ key: card.key }) : undefined}>
              <umb-imaging-thumbnail unique=${card.unique} alt=${card.name} icon=${card.icon ?? nothing}></umb-imaging-thumbnail>
              ${!this.readonly
                ? html`
                    <uui-action-bar slot="actions">
                      <uui-button label="Remove" @click=${() => this.#removeItem(card.unique)}>
                        <uui-icon name="icon-trash"></uui-icon>
                      </uui-button>
                    </uui-action-bar>
                  `
                : nothing}
            </uui-card-media>
          `,
        )}
        ${!this.readonly && (this._multiple || this._cards.length === 0)
          ? html`
              <uui-button id="add-button" look="placeholder" @click=${() => this.#openPicker()}>
                <uui-icon name="icon-add"></uui-icon>
                ${this.localize.term("general_choose")}
              </uui-button>
            `
          : nothing}
      </div>
    `;
  }

  static override styles = [
    css`
      #cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        grid-auto-rows: 160px;
        gap: var(--uui-size-space-4);
      }

      #add-button {
        height: 100%;
      }
    `,
  ];
}

export default RecentMediaPickerPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "recent-media-picker": RecentMediaPickerPropertyEditorElement;
  }
}
