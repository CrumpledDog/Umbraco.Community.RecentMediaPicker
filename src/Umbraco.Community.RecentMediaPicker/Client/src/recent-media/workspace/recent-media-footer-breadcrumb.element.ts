import { customElement, html } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";

/**
 * A static "Media > Recently added" breadcrumb for the workspace footer. Core's own breadcrumb
 * workspaceFooterApp fetches a real tree's ancestors over HTTP - not applicable here, since
 * "Recently added" isn't a tree item and has no ancestors to fetch. Reuses the same
 * <uui-breadcrumbs>/<uui-breadcrumb-item> primitives core's own breadcrumb renders into, just
 * without the tree-ancestor lookup machinery.
 */
@customElement("recent-media-footer-breadcrumb")
export class RecentMediaFooterBreadcrumbElement extends UmbLitElement {
  override render() {
    return html`
      <uui-breadcrumbs>
        <uui-breadcrumb-item href="section/media">Media</uui-breadcrumb-item>
        <uui-breadcrumb-item last-item>Recently added</uui-breadcrumb-item>
      </uui-breadcrumbs>
    `;
  }
}

export default RecentMediaFooterBreadcrumbElement;

declare global {
  interface HTMLElementTagNameMap {
    "recent-media-footer-breadcrumb": RecentMediaFooterBreadcrumbElement;
  }
}
