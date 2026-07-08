import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Formats an ISO date as "May 2026" / "Mayo 2026": long month plus year,
 * capitalized, in UTC to avoid server/client timezone drift.
 */
export function formatMonthYear(
  dateISO: string | null | undefined,
  locale: string
): string {
  if (!dateISO) return "";
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);

  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`.trim();
}

/**
 * Joins a brand's ACF `days` and `time` fields into the single "Hours" line
 * shown on the Webflow brand template (e.g. "Monday to Sunday: 11:00 AM –
 * 8:00 PM"). Empty unless both fields are present.
 */
export function formatBrandHours(
  days: string | null | undefined,
  time: string | null | undefined
): string {
  if (!days || !time) return "";
  return `${days}: ${time}`;
}
