import { U as n } from "./sdk.gen-CD4KcgHB.js";
async function d(t = 50, i = !1) {
  const { data: a, error: r } = await n.getMediaRecent({ query: { take: t, mine: i } });
  return r || !a ? { items: [], isPartial: !1 } : {
    isPartial: a.isPartial ?? !1,
    items: a.items.map((e) => ({
      unique: e.id,
      entityType: "media",
      icon: e.icon ?? void 0,
      name: e.name,
      createDate: e.createDate,
      updateDate: e.updateDate,
      updatedByName: e.updatedByName ?? void 0
    }))
  };
}
export {
  d as f
};
//# sourceMappingURL=fetch-recent-media-B3LwYWik.js.map
