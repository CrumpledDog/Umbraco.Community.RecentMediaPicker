import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbContextBase } from "@umbraco-cms/backoffice/class-api";
import { UmbBooleanState } from "@umbraco-cms/backoffice/observable-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

export const RECENT_MEDIA_SCOPE_CONTEXT = new UmbContextToken<RecentMediaScopeContext>("RecentMediaScopeContext");

/**
 * Single source of truth for the "by me"/"by everyone" scope, shared between the toolbar's tabs
 * (rendered once, by whichever collectionView - Grid or Table - is currently active) and both
 * collectionViews' own fetches. Provided by `recent-media-collection.element.ts` (the custom
 * `collection` kind element hosting the toolbar override), consumed by both views.
 */
export class RecentMediaScopeContext extends UmbContextBase {
  #mineOnly = new UmbBooleanState(true);
  readonly mineOnly = this.#mineOnly.asObservable();

  constructor(host: UmbControllerHost) {
    super(host, RECENT_MEDIA_SCOPE_CONTEXT);
  }

  getMineOnly() {
    return this.#mineOnly.getValue();
  }

  setMineOnly(value: boolean) {
    this.#mineOnly.setValue(value);
  }
}

export default RecentMediaScopeContext;
