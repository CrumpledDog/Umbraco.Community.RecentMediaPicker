import { html as c, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as n } from "@umbraco-cms/backoffice/lit-element";
var o = Object.getOwnPropertyDescriptor, l = (m, u, i, a) => {
  for (var e = a > 1 ? void 0 : a ? o(u, i) : u, r = m.length - 1, d; r >= 0; r--)
    (d = m[r]) && (e = d(e) || e);
  return e;
};
let t = class extends n {
  render() {
    return c`
      <uui-breadcrumbs>
        <uui-breadcrumb-item href="section/media">Media</uui-breadcrumb-item>
        <uui-breadcrumb-item last-item>Recently added</uui-breadcrumb-item>
      </uui-breadcrumbs>
    `;
  }
};
t = l([
  b("recent-media-footer-breadcrumb")
], t);
const p = t;
export {
  t as RecentMediaFooterBreadcrumbElement,
  p as default
};
//# sourceMappingURL=recent-media-footer-breadcrumb.element-Bbauq4Al.js.map
