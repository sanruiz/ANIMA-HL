import type { Locale } from "@/i18n/routing";

const DATE_ONLY_PATTERN = /^(\d{4})-?(\d{2})-?(\d{2})/;
const TIME_PATTERN = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

type EventDateLocale = Locale;

type EventDateRangeArgs = {
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  locale?: EventDateLocale;
};

type ParsedDate = {
  date: Date;
  key: number;
};

function getIntlLocale(locale: EventDateLocale): string {
  if (locale === "en") return "en-GB";
  return "es";
}

function normalizeLocale(locale: string | undefined): EventDateLocale {
  return locale === "en" ? "en" : "es";
}

function normalizeTime(value: string | null | undefined): string {
  if (!value) return "";

  const trimmedValue = value.trim();
  const match = TIME_PATTERN.exec(trimmedValue);

  if (!match) return trimmedValue;

  const hour = match[1].padStart(2, "0");
  return `${hour}:${match[2]}`;
}

/**
 * Parses WordPress/ACF event dates without applying the server timezone.
 * Supports YYYYMMDD, YYYY-MM-DD, and ISO-like values whose first 10 chars are a date.
 */
export function parseEventDate(value: string | null | undefined): ParsedDate | null {
  if (!value) return null;

  const match = DATE_ONLY_PATTERN.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    date,
    key: year * 10000 + month * 100 + day,
  };
}

/**
 * Formats an event date or date range using the locale-specific copy required by the agenda.
 */
export function formatEventDateRange({
  startDate,
  endDate,
  startTime,
  endTime,
  locale,
}: EventDateRangeArgs = {}): string {
  const normalizedLocale = normalizeLocale(locale);
  const start = parseEventDate(startDate);

  if (!start) return "";

  const dateFormatter = new Intl.DateTimeFormat(getIntlLocale(normalizedLocale), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  const startDateLabel = dateFormatter.format(start.date);
  const end = parseEventDate(endDate);
  const normalizedStartTime = normalizeTime(startTime);
  const normalizedEndTime = normalizeTime(endTime);
  const isRange = Boolean(end && end.key !== start.key);

  let output = startDateLabel;

  if (isRange && end) {
    const endDateLabel = dateFormatter.format(end.date);
    output =
      normalizedLocale === "es"
        ? `${startDateLabel} al ${endDateLabel}`
        : `${startDateLabel} to ${endDateLabel}`;
  }

  if (normalizedStartTime && normalizedEndTime && isRange) {
    output +=
      normalizedLocale === "es"
        ? ` de ${normalizedStartTime} a ${normalizedEndTime}`
        : ` from ${normalizedStartTime} to ${normalizedEndTime}`;
    return output;
  }

  if (normalizedStartTime) {
    output +=
      normalizedLocale === "es"
        ? ` a las ${normalizedStartTime}`
        : ` at ${normalizedStartTime}`;
  }

  return output;
}
