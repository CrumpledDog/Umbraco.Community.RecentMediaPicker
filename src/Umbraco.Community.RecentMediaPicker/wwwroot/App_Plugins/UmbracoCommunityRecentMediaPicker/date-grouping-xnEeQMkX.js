const u = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This week",
  month: "This month",
  older: "Older"
};
function D(a) {
  const t = new Date(a), n = /* @__PURE__ */ new Date(), e = new Date(n.getFullYear(), n.getMonth(), n.getDate()), o = new Date(e);
  o.setDate(o.getDate() - 1);
  const r = new Date(e);
  r.setDate(r.getDate() - 7);
  const s = new Date(e);
  return s.setMonth(s.getMonth() - 1), t >= e ? "today" : t >= o ? "yesterday" : t >= r ? "week" : t >= s ? "month" : "older";
}
function c(a) {
  const t = [];
  for (const n of a) {
    const e = D(n.createDate), o = t[t.length - 1];
    o?.group === e ? o.items.push(n) : t.push({ group: e, label: u[e], items: [n] });
  }
  return t;
}
export {
  c as g
};
//# sourceMappingURL=date-grouping-xnEeQMkX.js.map
