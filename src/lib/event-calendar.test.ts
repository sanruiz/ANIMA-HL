import { describe, expect, it } from "vitest";
import { createEventCalendar, getCalendarSchedule } from "@/lib/event-calendar";
import { ANIMA } from "@/lib/mall";
import type { EventFields, EventSingle } from "@/lib/types";

const fields = (overrides: Partial<NonNullable<EventFields>> = {}): NonNullable<EventFields> => ({
  startDate: "2026-10-10T00:00:00+00:00", startTime: "20:30", endDate: null,
  endTime: null, place: "Jardín Sur", featured: false, gallery: null, ...overrides,
});
const event = (overrides: Partial<EventSingle> = {}): EventSingle => ({
  id: "post:123", slug: "cine", title: "Cine &amp; música", date: null, excerpt: null,
  content: "<p>Una noche de cine.</p>", modified: null, featuredImage: null,
  eventTags: null, eventFields: fields(), ...overrides,
});
const url = "https://www.animavillage.com/es/agenda/cine";
const now = new Date("2026-09-06T12:00:00Z");

function unfolded(value: string | null) {
  return value!.replace(/\r\n /g, "");
}

describe("event iCalendar export", () => {
  it("uses the venue's timezone and does not invent a missing end time", () => {
    const calendar = unfolded(createEventCalendar(event(), url, ANIMA, now));
    expect(calendar).toContain("DTSTART:20261011T033000Z\r\n");
    expect(calendar).not.toContain("DTEND");
    expect(calendar).toContain("DTSTAMP:20260906T120000Z");
    expect(calendar).toContain("SUMMARY:Cine & música");
    expect(calendar).toContain("LOCATION:Jardín Sur\\, Ánima Village");
    expect(calendar).toContain(`URL:${url}`);
  });

  it("keeps a stable event UID across downloads and locales", () => {
    const first = unfolded(createEventCalendar(event(), url, ANIMA, now)).match(/^UID:.+$/m)?.[0];
    const second = unfolded(createEventCalendar(event(), url.replace("/es/", "/en/"), ANIMA, new Date())).match(/^UID:.+$/m)?.[0];
    expect(first).toBe(second);
  });

  it("exports all-day events with an exclusive end, including year boundaries", () => {
    const calendar = createEventCalendar(event({ eventFields: fields({ startDate: "20261230", startTime: null, endDate: "2026-12-31" }) }), url, ANIMA, now);
    expect(calendar).toContain("DTSTART;VALUE=DATE:20261230\r\nDTEND;VALUE=DATE:20270101");
  });

  it("exports a single day when no times or end date are provided", () => {
    const calendar = createEventCalendar(event({ eventFields: fields({ startTime: null }) }), url, ANIMA, now);
    expect(calendar).toContain("DTSTART;VALUE=DATE:20261010\r\nDTEND;VALUE=DATE:20261011");
  });

  it("exports explicit multi-day start/end times", () => {
    const schedule = getCalendarSchedule(fields({ startDate: "2026-08-30", startTime: "08:00", endDate: "2026-09-03", endTime: "09:30" }), ANIMA.timeZone);
    expect(schedule?.start.toISOString()).toBe("2026-08-30T15:00:00.000Z");
    expect(schedule?.end?.toISOString()).toBe("2026-09-03T16:30:00.000Z");
  });

  it("handles overnight events when only an end time is supplied", () => {
    const schedule = getCalendarSchedule(fields({ startTime: "23:00", endTime: "01:00" }), ANIMA.timeZone);
    expect(schedule?.start.toISOString()).toBe("2026-10-11T06:00:00.000Z");
    expect(schedule?.end?.toISOString()).toBe("2026-10-11T08:00:00.000Z");
  });

  it("uses historical timezone rules instead of hardcoding a UTC offset", () => {
    const schedule = getCalendarSchedule(fields({ startDate: "2022-07-01", startTime: "12:00" }), ANIMA.timeZone);
    expect(schedule?.start.toISOString()).toBe("2022-07-01T18:00:00.000Z");
  });

  it.each([
    { startDate: null }, { startDate: "2026-02-30" }, { startTime: "25:00" },
    { endTime: "12:80" }, { endDate: "invalid" }, { endDate: "2026-01-01" },
    { endDate: "2026-10-10", endTime: "10:00" },
  ])("does not export an invalid schedule: %j", (overrides) => {
    expect(createEventCalendar(event({ eventFields: fields(overrides) }), url, ANIMA, now)).toBeNull();
  });

  it("does not use the publication date as an event date", () => {
    expect(createEventCalendar(event({ date: "2026-09-01", eventFields: null }), url, ANIMA, now)).toBeNull();
  });

  it("escapes text and folds UTF-8 lines without corrupting accented characters", () => {
    const title = "Música, arte; jardín \\ Ánima\r\n" + "🎬á".repeat(60);
    const calendar = createEventCalendar(event({ title }), url, ANIMA, now)!;
    expect(unfolded(calendar)).toContain("SUMMARY:Música\\, arte\\; jardín \\\\ Ánima\\n" + "🎬á".repeat(60));
    for (const line of calendar.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(calendar.replaceAll("\r\n", "")).not.toMatch(/[\r\n]/);
    expect(calendar).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(calendar).toMatch(/END:VEVENT\r\nEND:VCALENDAR\r\n$/);
  });
});
