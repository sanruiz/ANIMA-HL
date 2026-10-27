import { CalendarPlus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { EventGallery } from "@/components/anima/event-gallery";
import {
  formatEventDateRange,
  parseEventDate,
} from "@/lib/event-date-formatter";
import { isPastEvent } from "@/lib/events";
import type { EventSingle } from "@/lib/types";
import { stripHtml } from "@/lib/utils";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

interface EventDetailProps {
  event: EventSingle;
  locale: string;
}


// Event detail template aligned with brand detail: content left, image right.
export function EventDetail({ event, locale }: EventDetailProps) {
  const t = useTranslations("agenda.detail");
  const fields = event.eventFields;
  const image = event.featuredImage?.node;
  const dateLabel = formatEventDateRange({
    startDate: fields?.startDate ?? event.date,
    endDate: fields?.endDate,
    startTime: fields?.startTime,
    endTime: fields?.endTime,
    locale: locale === "en" ? "en" : "es",
  });
  const parsedStartDate = parseEventDate(fields?.startDate ?? event.date);
  const dateTime = parsedStartDate?.date.toISOString().slice(0, 10);
  // The .ics is built server-side by /api/events/[slug]/calendar, which uses
  // the shared core's event-calendar module. Doing it here produced floating
  // DTSTART values — no Z, no TZID — so the event landed at the stated clock
  // time in whatever zone the visitor's calendar used.
  const calendarHref =
    isPastEvent(event) || !event.slug
      ? null
      : `/api/events/${encodeURIComponent(event.slug)}/calendar?locale=${locale}`;
  const mediaWidth = image?.mediaDetails?.width ?? 0;
  const mediaHeight = image?.mediaDetails?.height ?? 0;
  const hasMediaDimensions = mediaWidth > 0 && mediaHeight > 0;
  const imageWidth = hasMediaDimensions ? mediaWidth : 1200;
  const imageHeight = hasMediaDimensions ? mediaHeight : 900;
  const fallbackDescription = event.excerpt ? stripHtml(event.excerpt) : "";
  const galleryImages =
    fields?.gallery?.nodes.filter((galleryImage) => galleryImage.sourceUrl) ??
    [];

  return (
    <article className="event-detail">
      <div className="event-detail__inner">
        <div className="event-detail__grid">
          <div className="event-detail__body">
            <header className="event-detail__header">
              <h1 className="event-detail__title">{event.title}</h1>
            </header>

            <div className="event-detail__meta">
              {event.content ? (
                <div
                  className="event-detail__content"
                  dangerouslySetInnerHTML={{ __html: event.content }}
                />
              ) : fallbackDescription ? (
                <p className="event-detail__content">{fallbackDescription}</p>
              ) : null}

              {dateLabel ? (
                <div className="event-detail__info">
                  <p className="event-detail__info-label">{t("dateLabel")}</p>
                  <time className="event-detail__info-value" dateTime={dateTime}>
                    {dateLabel}
                  </time>
                </div>
              ) : null}

              {fields?.place ? (
                <div className="event-detail__info">
                  <p className="event-detail__info-label">
                    {t("locationLabel")}
                  </p>
                  <p className="event-detail__info-value">{fields.place}</p>
                </div>
              ) : null}

              {calendarHref ? (
                <a
                  href={calendarHref}
                  download
                  className="event-detail__calendar"
                >
                  <CalendarPlus size={18} strokeWidth={1.8} aria-hidden />
                  <span>{t("addToCalendar")}</span>
                </a>
              ) : null}
            </div>
          </div>

          {image?.sourceUrl ? (
            <div className="event-detail__media">
              <Image
                src={image.sourceUrl}
                alt={image.altText ?? event.title ?? ""}
                width={imageWidth}
                height={imageHeight}
                sizes="(max-width: 991px) 95vw, 55vw"
                className="event-detail__img"
                unoptimized={shouldBypassImageOptimizer(image.sourceUrl)}
                priority
              />
            </div>
          ) : null}
        </div>

        {galleryImages.length > 0 ? (
          <EventGallery images={galleryImages} title={event.title} />
        ) : null}
      </div>
    </article>
  );
}
