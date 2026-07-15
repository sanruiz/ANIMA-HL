"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  formatEventDateRange,
  parseEventDate,
} from "@/lib/event-date-formatter";
import { localizeTags } from "@/lib/i18n-tags";
import type { EventNode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

const ALL_FILTER = "__all__";

interface AgendaEventsGridProps {
  events: EventNode[];
  locale: string;
  heading: string;
  emptyMessage: string;
  filterAllLabel: string;
}

export default function AgendaEventsGrid({
  events,
  locale,
  heading,
  emptyMessage,
  filterAllLabel,
}: AgendaEventsGridProps) {
  const [active, setActive] = useState<string>(ALL_FILTER);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of events) {
      for (const tag of event.eventTags?.nodes ?? []) {
        if (!map.has(tag.slug)) {
          map.set(tag.slug, localizeTags(tag.name, locale));
        }
      }
    }

    return [...map.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [events, locale]);

  const filtered =
    active === ALL_FILTER
      ? events
      : events.filter(
          (event) =>
            event.eventTags?.nodes.some((tag) => tag.slug === active) ?? false,
        );

  const filterKey = active;

  const filterClass = (isActive: boolean) =>
    cn(
      "appearance-none rounded-full border bg-transparent cursor-pointer",
      "px-4 py-2 text-[13px] uppercase tracking-[0.06em]",
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
        aria-label={heading}
        className="flex w-[95%] max-w-(--width-max) flex-wrap justify-center gap-x-3 gap-y-2 pt-4 pb-10"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === ALL_FILTER}
          onClick={() => setActive(ALL_FILTER)}
          className={filterClass(active === ALL_FILTER)}
        >
          {filterAllLabel}
        </button>
        {categories.map(({ slug, name }) => (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={active === slug}
            onClick={() => setActive(slug)}
            className={filterClass(active === slug)}
          >
            {name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="agenda-events__empty">{emptyMessage}</p>
      ) : (
        <ul className="m-0 grid w-[95%] max-w-(--width-max) list-none grid-cols-1 gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {filtered.map((event) => {
            const fields = event.eventFields;
            const image = event.featuredImage?.node;
            const startDate = fields?.startDate ?? event.date;
            const parsedStartDate = parseEventDate(startDate);
            const dateTime = parsedStartDate?.date.toISOString().slice(0, 10);
            const dateLabel = formatEventDateRange({
              startDate,
              endDate: fields?.endDate,
              startTime: fields?.startTime,
              endTime: fields?.endTime,
              locale: locale === "en" ? "en" : "es",
            });
            const content = (
              <>
                <div className="relative aspect-4/3 w-full overflow-hidden bg-brand-beige/60">
                  {image?.sourceUrl ? (
                    <Image
                      src={image.sourceUrl}
                      alt={image.altText ?? event.title ?? ""}
                      fill
                      sizes="(min-width: 992px) 33vw, (min-width: 600px) 50vw, 95vw"
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                      unoptimized={shouldBypassImageOptimizer(image.sourceUrl)}
                    />
                  ) : null}
                </div>
                <div className="px-0.5">
                  <h3 className="m-0 font-(family-name:--font-ui-stack) text-base leading-5.5 font-light text-brand-oscuro lg:text-[17px]">
                    {event.title}
                  </h3>
                  {dateLabel ? (
                    <time
                      className="mt-1.5 block font-(family-name:--font-ui-stack) text-sm leading-5 text-brand-oscuro/60"
                      dateTime={dateTime}
                    >
                      {dateLabel}
                    </time>
                  ) : null}
                </div>
              </>
            );

            return (
              <li
                key={`${filterKey}:${event.id}`}
                className="agenda-events__item"
              >
                {event.slug ? (
                  <Link
                    href={`/agenda/${event.slug}`}
                    className="group flex flex-col gap-4.5"
                  >
                    {content}
                  </Link>
                ) : (
                  <article className="group flex flex-col gap-4.5">
                    {content}
                  </article>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
