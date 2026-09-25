// Shared by the recent-media picker modal and the "Recently added" Media-section Grid/Table
// collection views - all three group a flat, recency-sorted list of media items into the same
// "Today / Yesterday / This week / This month / Older" buckets. Originally written once, inline,
// in the picker modal; extracted here so the three call sites can't drift apart.

export type DateGroup = "today" | "yesterday" | "week" | "month" | "older";

export const DATE_GROUP_LABELS: Record<DateGroup, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This week",
  month: "This month",
  older: "Older",
};

export function dateGroupForDate(dateIso: string): DateGroup {
  const date = new Date(dateIso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  if (date >= startOfWeek) return "week";
  if (date >= startOfMonth) return "month";
  return "older";
}

export interface DateGroupBucket<T> {
  group: DateGroup;
  label: string;
  items: Array<T>;
}

/**
 * Buckets `items` into date-group runs, in the same order they appear. Each bucket gets its own
 * heading and its own grid/table - not one continuous list with inline dividers mixed in.
 *
 * Assumes `items` is already sorted descending by `createDate` (guaranteed today by every server
 * endpoint this is fed from) - this only merges an item into the *last* bucket if it matches, it
 * does not re-scan earlier buckets, so out-of-order input will fragment into extra, out-of-place
 * buckets instead of being grouped correctly.
 */
export function groupItemsByDate<T extends { createDate: string }>(items: Array<T>): Array<DateGroupBucket<T>> {
  const groups: Array<DateGroupBucket<T>> = [];
  for (const item of items) {
    const group = dateGroupForDate(item.createDate);
    const last = groups[groups.length - 1];
    if (last?.group === group) {
      last.items.push(item);
    } else {
      groups.push({ group, label: DATE_GROUP_LABELS[group], items: [item] });
    }
  }
  return groups;
}
