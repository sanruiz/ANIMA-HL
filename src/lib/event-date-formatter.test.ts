import { describe, expect, it } from "vitest";
import { formatEventDateRange, parseEventDate } from "@/lib/event-date-formatter";

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
    ).toBe("11 de julio a las 14:00");
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
    ).toBe("11 de julio al 13 de julio de 10:00 a 18:00");
  });

  it("formats English dates with day before month", () => {
    expect(
      formatEventDateRange({
        startDate: "20250711",
        endDate: "20250713",
        startTime: "10:00",
        endTime: "18:00",
        locale: "en",
      })
    ).toBe("11 July to 13 July from 10:00 to 18:00");
  });
});
