import { UMB_AUTH_CONTEXT as t } from "@umbraco-cms/backoffice/auth";
import { c as i } from "./client.gen-BUI-owez.js";
const a = async (o, e) => {
  const n = await o.getContext(t);
  if (!n) {
    console.warn("UMB_AUTH_CONTEXT not available — extension API client will not be authenticated");
    return;
  }
  typeof n.configureClient == "function" ? n.configureClient(i) : console.warn("authContext.configureClient is not available on this backoffice version — skipping API client auth wiring"), console.log("Hello from my extension 🎉");
}, c = (o, e) => {
  console.log("Goodbye from my extension 👋");
};
export {
  a as onInit,
  c as onUnload
};
//# sourceMappingURL=entrypoint-T560zMlW.js.map
