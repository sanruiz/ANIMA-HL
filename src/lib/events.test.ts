import { describe, expect, it } from "vitest";
import { getUpcomingEvents } from "@/lib/events";
import type { EventNode } from "@/lib/types";

function createEvent({
  id,
  title,
  startDate,
  endDate,
  tagSlugs = [],
}: {
  id: string;
  title: string;
  startDate: string | null;
  endDate?: string | null;
  tagSlugs?: string[];
}): EventNode {
  return {
    id,
    title,
    slug: id,
    date: null,
    excerpt: null,
    featuredImage: null,
    eventTags: {
      nodes: tagSlugs.map((slug) => ({ name: slug, slug })),
    },
    eventFields: {
      startDate,
      startTime: null,
      endDate: endDate ?? null,
      endTime: null,
      place: null,
      featured: null,
      gallery: null,
    },
  };
}

describe("getUpcomingEvents()", () => {
  const today = new Date(Date.UTC(2025, 6, 11));

  it("excludes events tagged as past", () => {
    const events = [
      createEvent({
        id: "past-tagged",
        title: "Past tagged",
        startDate: "20250712",
        tagSlugs: ["eventos-pasados"],
      }),
      createEvent({
        id: "future",
        title: "Future",
        startDate: "20250712",
      }),
    ];

    expect(getUpcomingEvents(events, today).map((event) => event.id)).toEqual([
      "future",
    ]);
  });

  it("keeps events happening today and multi-day events that have not ended", () => {
    const events = [
      createEvent({
        id: "today",
        title: "Today",
        startDate: "20250711",
      }),
      createEvent({
        id: "multi-day",
        title: "Multi day",
        startDate: "20250710",
        endDate: "20250712",
      }),
    ];

    expect(getUpcomingEvents(events, today).map((event) => event.id)).toEqual([
      "multi-day",
      "today",
    ]);
  });

  it("excludes events whose reference date is before today", () => {
    const events = [
      createEvent({
        id: "yesterday",
        title: "Yesterday",
        startDate: "20250710",
      }),
      createEvent({
        id: "ended",
        title: "Ended",
        startDate: "20250708",
        endDate: "20250710",
      }),
    ];

    expect(getUpcomingEvents(events, today)).toEqual([]);
  });

  it("sorts by closest start date first", () => {
    const events = [
      createEvent({
        id: "third",
        title: "Third",
        startDate: "20251201",
      }),
      createEvent({
        id: "first",
        title: "First",
        startDate: "20250720",
      }),
      createEvent({
        id: "second",
        title: "Second",
        startDate: "20250815",
      }),
    ];

    expect(getUpcomingEvents(events, today).map((event) => event.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });
});
