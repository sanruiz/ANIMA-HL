"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  formatEventDateRange,
  parseEventDate,
} from "@/lib/event-date-formatter";
import { PAST_EVENT_TAG_SLUG } from "@/lib/events";
import { localizeTags } from "@/lib/i18n-tags";
import type { EventNode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

const ALL_FILTER = "__all__";

interface AgendaEventsListProps {
  upcomingEvents: EventNode[];
  pastEvents: EventNode[];
  locale: string;
  heading: string;
  pastHeading: string;
  emptyMessage: string;
  pastEmptyMessage: string;
  filterAllLabel: string;
  pastBadgeLabel: string;
}

interface EventRowProps {
  event: EventNode;
  locale: string;
  isPast: boolean;
  pastBadgeLabel: string;
}

function EventRow({ event, locale, isPast, pastBadgeLabel }: EventRowProps) {
  const fields = event.eventFields;
  const image = event.featuredImage?.node;
  const startDate = fields?.startDate ?? event.date;
  const parsedStartDate = parseEventDate(startDate);
  const dateTime = parsedStartDate?.date.toISOString().slice(0, 10);
  const dayLabel = parsedStartDate
    ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es", {
        day: "2-digit",
        timeZone: "UTC",
      }).format(parsedStartDate.date)
    : "";
  const monthYearLabel = parsedStartDate
    ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(parsedStartDate.date)
    : "";
  const dateLabel = formatEventDateRange({
    startDate,
    endDate: fields?.endDate,
    startTime: fields?.startTime,
    endTime: fields?.endTime,
    locale: locale === "en" ? "en" : "es",
  });
  const categoryTag = event.eventTags?.nodes.find(
    (tag) => tag.slug !== PAST_EVENT_TAG_SLUG,
  );
  const badgeLabel = isPast
    ? pastBadgeLabel
    : categoryTag
      ? localizeTags(categoryTag.name, locale)
      : null;

  const content = (
    <>
      <div className="flex flex-col items-center gap-3 sm:w-32 sm:shrink-0 md:flex-row sm:items-center">
        <span
          className={cn(
            "font-(family-name:--font-ui-stack) text-3xl leading-none font-light",
            isPast ? "text-brand-oscuro/40" : "text-brand-oscuro",
          )}
        >
          {dayLabel}
        </span>
        <span
          className={cn(
            "font-(family-name:--font-ui-stack) text-xs tracking-[0.06em] uppercase",
            isPast ? "text-brand-oscuro/30" : "text-brand-oscuro/60",
          )}
        >
          {monthYearLabel}
        </span>
      </div>

      <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-brand-beige/60 sm:w-20">
        {image?.sourceUrl ? (
          <Image
            src={image.sourceUrl}
            alt={image.altText ?? event.title ?? ""}
            fill
            sizes="80px"
            className={cn(
              "object-cover transition-transform duration-200 group-hover:scale-[1.03]",
              isPast && "grayscale",
            )}
            unoptimized={shouldBypassImageOptimizer(image.sourceUrl)}
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        {badgeLabel ? (
          <span
            className={cn(
              "mb-2 inline-flex rounded-full border px-2.5 py-1 font-(family-name:--font-ui-stack) text-[11px] leading-none font-normal tracking-[0.06em] uppercase",
              isPast
                ? "border-brand-oscuro/20 text-brand-oscuro/60"
                : "border-brand-oscuro/30 text-brand-oscuro",
            )}
          >
            {badgeLabel}
          </span>
        ) : null}
        <h3
          className={cn(
            "m-0 font-(family-name:--font-ui-stack) text-base leading-5.5 font-light lg:text-[17px]",
            isPast ? "text-brand-oscuro/50" : "text-brand-oscuro",
          )}
        >
          {event.title}
        </h3>
        {dateLabel ? (
          <time
            className={cn(
              "mt-1.5 block font-(family-name:--font-ui-stack) text-sm leading-5",
              isPast ? "text-brand-oscuro/35" : "text-brand-oscuro/60",
            )}
            dateTime={dateTime}
          >
            {dateLabel}
          </time>
        ) : null}
      </div>

      <div
        className={cn(
          " size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 hidden sm:flex ",
          isPast
            ? "border-brand-oscuro/15 text-brand-oscuro/30"
            : "border-brand-oscuro/30 text-brand-oscuro group-hover:bg-brand-oscuro group-hover:text-brand-claro",
        )}
      >
        <ArrowRight aria-hidden size={18} strokeWidth={1.6} />
      </div>
    </>
  );

  const rowClassName =
    "group flex items-center gap-4 py-6 sm:gap-6";

  return (
    <li className="agenda-events__item border-b border-brand-oscuro/10 first:border-t">
      {event.slug ? (
        <Link href={`/agenda/${event.slug}`} className={rowClassName}>
          {content}
        </Link>
      ) : (
        <article className={rowClassName}>{content}</article>
      )}
    </li>
  );
}

export default function AgendaEventsList({
  upcomingEvents,
  pastEvents,
  locale,
  heading,
  pastHeading,
  emptyMessage,
  pastEmptyMessage,
  filterAllLabel,
  pastBadgeLabel,
}: AgendaEventsListProps) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_FILTER);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of [...upcomingEvents, ...pastEvents]) {
      for (const tag of event.eventTags?.nodes ?? []) {
        if (tag.slug === PAST_EVENT_TAG_SLUG) continue;
        if (!map.has(tag.slug)) {
          map.set(tag.slug, localizeTags(tag.name, locale));
        }
      }
    }

    return [...map.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [upcomingEvents, pastEvents, locale]);

  const filterByCategory = (events: EventNode[]) =>
    activeCategory === ALL_FILTER
      ? events
      : events.filter(
          (event) =>
            event.eventTags?.nodes.some((tag) => tag.slug === activeCategory) ??
            false,
        );

  const filteredUpcoming = filterByCategory(upcomingEvents);
  const filteredPast = filterByCategory(pastEvents);

  const filterClass = (isActive: boolean) =>
    cn(
      "appearance-none rounded-full border bg-transparent cursor-pointer",
      "px-4 py-2 text-[13px]  tracking-[0.06em]",
      "font-[family-name:var(--font-ui-stack)] font-normal",
      "transition-colors duration-200",
      "border-brand-oscuro/20 text-brand-oscuro",
      "hover:border-brand-oscuro",
      isActive && "border-brand-oscuro bg-brand-oscuro text-brand-claro",
    );

  return (
    <section className="agenda-events" aria-labelledby="agenda-events-heading">
      <div className="agenda-events__intro">
        <h2 id="agenda-events-heading" className="agenda-events__heading">
          {heading}
        </h2>
      </div>

      <div
        role="tablist"
        aria-label={filterAllLabel}
        className="flex w-full max-w-(--width-max) flex-wrap justify-center gap-x-3 gap-y-2 pb-10 lg:w-[70%]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === ALL_FILTER}
          onClick={() => setActiveCategory(ALL_FILTER)}
          className={filterClass(activeCategory === ALL_FILTER)}
        >
          {filterAllLabel}
        </button>
        {categories.map(({ slug, name }) => (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={activeCategory === slug}
            onClick={() => setActiveCategory(slug)}
            className={filterClass(activeCategory === slug)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-(--width-max) lg:w-[50%]">
        {filteredUpcoming.length === 0 ? (
          <p className="agenda-events__empty">{emptyMessage}</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {filteredUpcoming.map((event) => (
              <EventRow
                key={`upcoming:${event.id}`}
                event={event}
                locale={locale}
                isPast={false}
                pastBadgeLabel={pastBadgeLabel}
              />
            ))}
          </ul>
        )}

        <div className="mt-16">
          <h2 className="mb-2 font-(family-name:--font-primary) text-2xl font-medium text-brand-oscuro/70 italic">
            {pastHeading}
          </h2>
          {filteredPast.length === 0 ? (
            <p className="agenda-events__empty">{pastEmptyMessage}</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {filteredPast.map((event) => (
                <EventRow
                  key={`past:${event.id}`}
                  event={event}
                  locale={locale}
                  isPast
                  pastBadgeLabel={pastBadgeLabel}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
