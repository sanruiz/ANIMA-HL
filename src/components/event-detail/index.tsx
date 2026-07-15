import { CalendarPlus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import EventGallery from "@/components/event-gallery";
import {
  formatEventDateRange,
  parseEventDate,
} from "@/lib/event-date-formatter";
import type { EventSingle } from "@/lib/types";
import { stripHtml } from "@/lib/utils";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

interface EventDetailProps {
  event: EventSingle;
  locale: string;
}

type CalendarLink = {
  href: string;
  filename: string;
} | null;

function escapeCalendarText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatCalendarDate(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function formatCalendarDateTime(date: Date, time: string): string {
  const [hour = "00", minute = "00"] = time.split(":");
  return `${formatCalendarDate(date)}T${hour.padStart(2, "0")}${minute}00`;
}

function addUtcDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate;
}

function getCalendarLink(event: EventSingle): CalendarLink {
  const fields = event.eventFields;
  const start = parseEventDate(fields?.startDate ?? event.date);

  if (!start) return null;

  const end = parseEventDate(fields?.endDate) ?? start;
  const title = event.title ?? "Ánima Village event";
  const description = stripHtml(event.content) || stripHtml(event.excerpt);
  const location = fields?.place ?? "Ánima Village";
  const slug = event.slug ?? event.id;
  const fileSlug = slug.replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();
  const startTime = fields?.startTime?.trim();
  const endTime = fields?.endTime?.trim();
  const hasStartTime = Boolean(startTime);
  const endDate = hasStartTime ? end.date : addUtcDays(end.date, 1);
  const dtStart = hasStartTime
    ? `DTSTART:${formatCalendarDateTime(start.date, startTime ?? "00:00")}`
    : `DTSTART;VALUE=DATE:${formatCalendarDate(start.date)}`;
  const dtEnd =
    hasStartTime && endTime
      ? `DTEND:${formatCalendarDateTime(end.date, endTime)}`
      : `DTEND;VALUE=DATE:${formatCalendarDate(endDate)}`;
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Anima Village//Events//ES",
    "BEGIN:VEVENT",
    `UID:${event.id}@animavillage.com`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeCalendarText(title)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    `LOCATION:${escapeCalendarText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    href: `data:text/calendar;charset=utf-8,${encodeURIComponent(calendar)}`,
    filename: `${fileSlug || "event"}.ics`,
  };
}

// Event detail template aligned with brand detail: content left, image right.
export default function EventDetail({ event, locale }: EventDetailProps) {
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
  const calendarLink = getCalendarLink(event);
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

              {calendarLink ? (
                <a
                  href={calendarLink.href}
                  download={calendarLink.filename}
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
