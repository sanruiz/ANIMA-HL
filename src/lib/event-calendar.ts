import { parseEventDate } from "@/lib/event-date-formatter";
import type { EventFields, EventSingle } from "@/lib/types";
import { decodeHtmlEntities, stripHtml } from "@/lib/utils";

/**
 * Identity of the mall the calendar entry belongs to. Passed in rather than
 * hardcoded: this module is shared core, and a file naming one mall stops
 * being core.
 */
export type CalendarMall = {
  /** Mall name, used as the fallback title and in the LOCATION line. */
  name: string;
  /** Postal address appended to LOCATION when the event names no place. */
  address: string;
  /**
   * IANA zone the CMS hours are expressed in — the mall's own zone, not the
   * visitor's. Getting this wrong shifts every entry by the offset
   * difference, which is silent: the .ics still imports cleanly.
   */
  timeZone: string;
};

const DAY = 86_400_000;

function parseTime(value: string | null | undefined): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value?.trim() ?? "");
  if (!match) return null;
  const [, hours, minutes, seconds = "0"] = match;
  if (+hours > 23 || +minutes > 59 || +seconds > 59) return null;
  return (+hours * 3600 + +minutes * 60 + +seconds) * 1000;
}

function toUtc(day: Date, time: number, timeZone: string): Date {
  const offsetFormatter = new Intl.DateTimeFormat("en", {
    timeZone,
    timeZoneName: "longOffset",
  });
  const wallTime = day.getTime() + time;
  let utc = wallTime;
  // Resolve the offset at the event's date (including historical DST).
  for (let pass = 0; pass < 3; pass++) {
    const offset = offsetFormatter.formatToParts(utc).find((part) => part.type === "timeZoneName")?.value;
    const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offset ?? "");
    if (!match) throw new Error("Cannot resolve the event timezone");
    const minutes = (+match[2] * 60 + +match[3]) * (match[1] === "+" ? 1 : -1);
    const next = wallTime - minutes * 60_000;
    if (next === utc) break;
    utc = next;
  }
  return new Date(utc);
}

export function getCalendarSchedule(fields: EventFields, timeZone: string) {
  const start = parseEventDate(fields?.startDate);
  if (!start) return null;
  const end = parseEventDate(fields?.endDate);
  if ((fields?.endDate && !end) || (end && end.key < start.key)) return null;

  if (!fields?.startTime?.trim()) {
    return { allDay: true, start: start.date, end: new Date((end?.date ?? start.date).getTime() + DAY) };
  }

  const startTime = parseTime(fields.startTime);
  const endTime = parseTime(fields.endTime);
  if (startTime === null || (fields.endTime?.trim() && endTime === null)) return null;
  const startsAt = toUtc(start.date, startTime, timeZone);
  let endsAt: Date | null = null;
  if (endTime !== null) {
    const endDay = end?.date ?? new Date(start.date.getTime() + (endTime < startTime ? DAY : 0));
    endsAt = toUtc(endDay, endTime, timeZone);
    if (endsAt <= startsAt) return null;
  } else if (end && end.key > start.key) {
    // An inclusive final day without an end time runs through that day.
    endsAt = toUtc(new Date(end.date.getTime() + DAY), 0, timeZone);
  }
  // Without an end, do not invent a duration.
  return { allDay: false, start: startsAt, end: endsAt };
}

function timestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let result = "";
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      result += "\r\n ";
      bytes = 1;
    }
    result += character;
    bytes += size;
  }
  return result;
}

/** RFC 5545: UTC times, exclusive all-day DTEND, escaped TEXT and UTF-8 folding. */
export function createEventCalendar(
  event: EventSingle,
  url: string,
  mall: CalendarMall,
  now = new Date()
): string | null {
  const schedule = getCalendarSchedule(event.eventFields, mall.timeZone);
  if (!schedule) return null;
  const title = decodeHtmlEntities(event.title) || mall.name;
  const description = decodeHtmlEntities(stripHtml(event.content || event.excerpt));
  const place = decodeHtmlEntities(stripHtml(event.eventFields?.place ?? null));
  const dateProperty = (name: string, date: Date) => schedule.allDay
    ? `${name};VALUE=DATE:${timestamp(date).slice(0, 8)}`
    : `${name}:${timestamp(date)}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${mall.name}//Events//EN`,
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${encodeURIComponent(event.id)}@${new URL(url).hostname}`,
    `DTSTAMP:${timestamp(now)}`,
    dateProperty("DTSTART", schedule.start),
    ...(schedule.end ? [dateProperty("DTEND", schedule.end)] : []),
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText([description, url].filter(Boolean).join("\n\n"))}`,
    `LOCATION:${escapeText(place ? `${place}, ${mall.name}` : mall.address)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
