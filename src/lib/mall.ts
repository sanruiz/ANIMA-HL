import type { CalendarMall } from "@/lib/event-calendar";

/**
 * ANIMA's own identity, kept out of the shared core modules that consume it.
 *
 * The long-term home for these values is `mallSettings` in WordPress, which
 * already holds the name and address. They live here meanwhile because the
 * .ics route builds its response synchronously and a second GraphQL round
 * trip per download buys nothing while the values are this stable.
 */
export const ANIMA: CalendarMall = {
  name: "Ánima Village",
  address: "Ánima Village, Cabo Del Sol, Cabo San Lucas, B.C.S., 23455, México",
  // Baja California Sur runs on Mountain time and has not observed DST since
  // 2022 — an hour behind Mexico City, which is what the starter hardcoded.
  timeZone: "America/Mazatlan",
};
