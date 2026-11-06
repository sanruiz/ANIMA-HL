import { describe, expect, it } from "vitest";
import {
  formatEventDateRange,
  formatEventTime,
  formatMonthYearShort,
  parseEventDate,
} from "@/lib/event-date-formatter";

describe("parseEventDate()", () => {
  it("parses YYYYMMDD values", () => {
    expect(parseEventDate("20250711")?.key).toBe(20250711);
  });

  it("parses YYYY-MM-DD values", () => {
    expect(parseEventDate("2025-07-11")?.key).toBe(20250711);
  });

  it("parses ISO-like WordPress dates from the date portion", () => {
    expect(parseEventDate("2025-07-11T00:00:00")?.key).toBe(20250711);
  });

  it("returns null for invalid values", () => {
    expect(parseEventDate("2025-02-31")).toBeNull();
    expect(parseEventDate("not-a-date")).toBeNull();
    expect(parseEventDate(null)).toBeNull();
    expect(parseEventDate("")).toBeNull();
  });
});

describe("formatEventDateRange()", () => {
  it("formats a single Spanish date", () => {
    expect(formatEventDateRange({ startDate: "20250711", locale: "es" })).toBe(
      "11 de julio"
    );
  });

  it("formats a Spanish date with start time", () => {
    expect(
      formatEventDateRange({
        startDate: "20250711",
        startTime: "14:00:00",
        locale: "es",
      })
    ).toBe("11 de julio a las 2:00 PM");
  });

  it("formats a Spanish date range", () => {
    expect(
      formatEventDateRange({
        startDate: "20250711",
        endDate: "20250713",
        locale: "es",
      })
    ).toBe("11 de julio al 13 de julio");
  });

  it("formats a Spanish date range with hours", () => {
    expect(
      formatEventDateRange({
        startDate: "20250711",
        endDate: "20250713",
        startTime: "10:00",
        endTime: "18:00",
        locale: "es",
      })
    ).toBe("11 de julio al 13 de julio de 10:00 AM a 6:00 PM");
  });

  it("formats an English date range without hours", () => {
    expect(
      formatEventDateRange({
        startDate: "2026-09-15",
        endDate: "2026-09-18",
        locale: "en",
      })
    ).toBe("September 15 to September 18");
  });

  // US order, month first: both malls get most English-speaking visitors
  // from the United States.
  it("formats English dates with month before day", () => {
    expect(
      formatEventDateRange({
        startDate: "20250711",
        endDate: "20250713",
        startTime: "10:00",
        endTime: "18:00",
        locale: "en",
      })
    ).toBe("July 11 to July 13 from 10:00 AM to 6:00 PM");
  });

  it("formats a single English date with its start time", () => {
    expect(
      formatEventDateRange({ startDate: "20250711", startTime: "14:00:00", locale: "en" })
    ).toBe("July 11 at 2:00 PM");
  });

  it("returns an empty string when there is no start date", () => {
    expect(formatEventDateRange({})).toBe("");
  });
});

describe("formatEventTime()", () => {
  it.each([
    ["14:00", "2:00 PM"],
    ["09:05:00", "9:05 AM"],
    ["00:30", "12:30 AM"],
    ["12:00", "12:00 PM"],
  ])("formats ACF time %s as %s", (value, expected) => {
    expect(formatEventTime(value)).toBe(expected);
  });

  it("returns text it cannot parse as it came, trimmed", () => {
    expect(formatEventTime(" 7pm ")).toBe("7pm");
  });

  it("returns an empty string for a missing time", () => {
    expect(formatEventTime(null)).toBe("");
    expect(formatEventTime(undefined)).toBe("");
  });
});

describe("formatMonthYearShort()", () => {
  const march = new Date(Date.UTC(2026, 2, 1));

  it("formats a short month and year per locale", () => {
    expect(formatMonthYearShort(march, "es")).toBe("mar 2026");
    expect(formatMonthYearShort(march, "en")).toBe("Mar 2026");
  });

  it("falls back to Spanish for a missing or unknown locale", () => {
    expect(formatMonthYearShort(march, undefined)).toBe("mar 2026");
    expect(formatMonthYearShort(march, "fr")).toBe("mar 2026");
  });

  it("reads the date in UTC, so the first of the month never slips back", () => {
    expect(formatMonthYearShort(new Date(Date.UTC(2026, 0, 1)), "es")).toBe("ene 2026");
  });
});
