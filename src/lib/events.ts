import type { EventNode } from "@/lib/types";
import { parseEventDate } from "@/lib/event-date-formatter";

const PAST_EVENT_TAG_SLUG = "eventos-pasados";

function getTodayKey(today: Date): number {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();

  return year * 10000 + month * 100 + day;
}

function hasPastEventTag(event: EventNode): boolean {
  return (
    event.eventTags?.nodes.some((tag) => tag.slug === PAST_EVENT_TAG_SLUG) ??
    false
  );
}

function getEventReferenceDateKey(event: EventNode): number | null {
  const fields = event.eventFields;
  const endDate = parseEventDate(fields?.endDate);
  const startDate = parseEventDate(fields?.startDate ?? event.date);

  return endDate?.key ?? startDate?.key ?? null;
}

function getEventSortDateKey(event: EventNode): number {
  return (
    parseEventDate(event.eventFields?.startDate ?? event.date)?.key ??
    Number.MAX_SAFE_INTEGER
  );
}

function getPastEventSortDateKey(event: EventNode): number {
  return getEventReferenceDateKey(event) ?? Number.MIN_SAFE_INTEGER;
}

function isPastByDate(event: EventNode, todayKey: number): boolean {
  const referenceDateKey = getEventReferenceDateKey(event);
  return referenceDateKey !== null && referenceDateKey < todayKey;
}

/**
 * Returns events that are active/upcoming and sorts them by closest start date first.
 */
export function getUpcomingEvents(
  events: EventNode[],
  today: Date = new Date()
): EventNode[] {
  const todayKey = getTodayKey(today);

  return events
    .filter((event) => !hasPastEventTag(event))
    .filter((event) => !isPastByDate(event, todayKey))
    .toSorted((eventA, eventB) => {
      const dateComparison =
        getEventSortDateKey(eventA) - getEventSortDateKey(eventB);

      if (dateComparison !== 0) return dateComparison;

      return (eventA.title ?? "").localeCompare(eventB.title ?? "");
    });
}

/**
 * Returns events that have ended or are manually tagged as past, sorted newest first.
 */
export function getPastEvents(
  events: EventNode[],
  today: Date = new Date()
): EventNode[] {
  const todayKey = getTodayKey(today);

  return events
    .filter((event) => hasPastEventTag(event) || isPastByDate(event, todayKey))
    .toSorted((eventA, eventB) => {
      const dateComparison =
        getPastEventSortDateKey(eventB) - getPastEventSortDateKey(eventA);

      if (dateComparison !== 0) return dateComparison;

      return (eventA.title ?? "").localeCompare(eventB.title ?? "");
    });
}
