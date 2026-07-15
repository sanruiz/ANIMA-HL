import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  formatEventDateRange,
  parseEventDate,
} from "@/lib/event-date-formatter";
import type { EventNode } from "@/lib/types";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

interface AgendaEventsGridProps {
  events: EventNode[];
  locale: string;
  heading: string;
  emptyMessage: string;
}

export default function AgendaEventsGrid({
  events,
  locale,
  heading,
  emptyMessage,
}: AgendaEventsGridProps) {
  return (
    <section className="agenda-events" aria-labelledby="agenda-events-heading">
      <div className="agenda-events__intro">
        <h2 id="agenda-events-heading" className="agenda-events__heading">
          {heading}
        </h2>
      </div>

      {events.length === 0 ? (
        <p className="agenda-events__empty">{emptyMessage}</p>
      ) : (
        <ul className="m-0 grid w-[95%] max-w-(--width-max) list-none grid-cols-1 gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {events.map((event) => {
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
              <li key={event.id} className="agenda-events__item">
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
