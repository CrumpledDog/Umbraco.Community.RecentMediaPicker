import { c as t } from "./client.gen-BUI-owez.js";
class a {
  static recent(e) {
    return (e?.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/recentmediapicker/api/v1/media/recent",
      ...e
    });
  }
  static ping(e) {
    return (e?.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/recentmediapicker/api/v1/ping",
      ...e
    });
  }
  static whatsMyName(e) {
    return (e?.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/recentmediapicker/api/v1/whatsMyName",
      ...e
    });
  }
  static whatsTheTimeMrWolf(e) {
    return (e?.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/recentmediapicker/api/v1/whatsTheTimeMrWolf",
      ...e
    });
  }
  static whoAmI(e) {
    return (e?.client ?? t).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/recentmediapicker/api/v1/whoAmI",
      ...e
    });
  }
}
export {
  a as U
};
//# sourceMappingURL=sdk.gen-B-I-Do8j.js.map
