/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import type { EventNode } from "@/lib/types";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => React.createElement("a", { href, className }, children),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) =>
    React.createElement("img", {
      src: props.src,
      alt: props.alt,
      className: props.className,
    }),
}));

const { default: AgendaEventsList } = await import("./../index");

function createEvent({
  id,
  title,
  startDate,
  tagSlug,
  tagName,
}: {
  id: string;
  title: string;
  startDate: string | null;
  tagSlug?: string;
  tagName?: string;
}): EventNode {
  return {
    id,
    title,
    slug: id,
    date: null,
    excerpt: null,
    featuredImage: null,
    eventTags: tagSlug
      ? { nodes: [{ name: tagName ?? tagSlug, slug: tagSlug }] }
      : { nodes: [] },
    eventFields: {
      startDate,
      startTime: null,
      endDate: null,
      endTime: null,
      place: null,
      featured: null,
      gallery: null,
    },
  };
}

const defaultProps = {
  locale: "es",
  heading: "Próximos eventos",
  pastHeading: "Eventos pasados",
  emptyMessage: "No hay eventos por ahora.",
  pastEmptyMessage: "No hay eventos pasados por ahora.",
  filterAllLabel: "Todo",
  pastBadgeLabel: "Finalizado",
};

describe("AgendaEventsList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders upcoming events and the past events section below", () => {
    const upcomingEvents = [
      createEvent({ id: "u1", title: "Sunset Yoga", startDate: "2026-05-28" }),
    ];
    const pastEvents = [
      createEvent({ id: "p1", title: "Cine bajo las estrellas", startDate: "2026-01-10" }),
    ];

    render(
      <AgendaEventsList
        {...defaultProps}
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
      />,
    );

    expect(screen.getByText("Sunset Yoga")).toBeInTheDocument();
    expect(screen.getByText("Cine bajo las estrellas")).toBeInTheDocument();
    expect(screen.getByText("Eventos pasados")).toBeInTheDocument();
    expect(screen.getAllByText("Finalizado")).toHaveLength(1);
  });

  it("shows the empty message when there are no upcoming events", () => {
    render(
      <AgendaEventsList {...defaultProps} upcomingEvents={[]} pastEvents={[]} />,
    );

    expect(screen.getByText(defaultProps.emptyMessage)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.pastEmptyMessage)).toBeInTheDocument();
  });

  it("filters both upcoming and past lists by the selected category", () => {
    const upcomingEvents = [
      createEvent({
        id: "u1",
        title: "Mercado de productores",
        startDate: "2026-06-04",
        tagSlug: "hospitalidad",
        tagName: "Hospitalidad",
      }),
      createEvent({
        id: "u2",
        title: "Sunset Yoga",
        startDate: "2026-05-28",
        tagSlug: "bienestar",
        tagName: "Bienestar",
      }),
    ];

    render(
      <AgendaEventsList
        {...defaultProps}
        upcomingEvents={upcomingEvents}
        pastEvents={[]}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Bienestar" }));

    expect(screen.getByText("Sunset Yoga")).toBeInTheDocument();
    expect(screen.queryByText("Mercado de productores")).not.toBeInTheDocument();
  });

  it("links each row to its event detail page", () => {
    const upcomingEvents = [
      createEvent({ id: "convivio-cdmx", title: "Convivio CDMX", startDate: "2026-05-22" }),
    ];

    render(
      <AgendaEventsList {...defaultProps} upcomingEvents={upcomingEvents} pastEvents={[]} />,
    );

    expect(screen.getByText("Convivio CDMX").closest("a")).toHaveAttribute(
      "href",
      "/agenda/convivio-cdmx",
    );
  });
});
