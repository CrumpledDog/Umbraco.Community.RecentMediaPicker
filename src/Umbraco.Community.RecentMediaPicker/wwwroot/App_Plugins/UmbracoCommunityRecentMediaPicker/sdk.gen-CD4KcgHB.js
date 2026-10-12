import { c as t } from "./client.gen-CUUeBNNl.js";
class a {
  static getMediaRecent(e) {
    return (e?.client ?? t).get({
      security: [{ scheme: "bearer", type: "http" }],
      url: "/umbraco/recentmediapicker/api/v1/media/recent",
      ...e
    });
  }
  static getPing(e) {
    return (e?.client ?? t).get({
      security: [{ scheme: "bearer", type: "http" }],
      url: "/umbraco/recentmediapicker/api/v1/ping",
      ...e
    });
  }
  static getWhatsMyName(e) {
    return (e?.client ?? t).get({
      security: [{ scheme: "bearer", type: "http" }],
      url: "/umbraco/recentmediapicker/api/v1/whatsMyName",
      ...e
    });
  }
  static getWhatsTheTimeMrWolf(e) {
    return (e?.client ?? t).get({
      security: [{ scheme: "bearer", type: "http" }],
      url: "/umbraco/recentmediapicker/api/v1/whatsTheTimeMrWolf",
      ...e
    });
  }
  static getWhoAmI(e) {
    return (e?.client ?? t).get({
      security: [{ scheme: "bearer", type: "http" }],
      url: "/umbraco/recentmediapicker/api/v1/whoAmI",
      ...e
    });
  }
}
export {
  a as U
};
//# sourceMappingURL=sdk.gen-CD4KcgHB.js.map
