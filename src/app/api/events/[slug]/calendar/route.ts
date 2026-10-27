import { routing } from "@/i18n/routing";
import { collectionTag, itemTag } from "@/lib/cache-tags";
import { createEventCalendar } from "@/lib/event-calendar";
import { ANIMA } from "@/lib/mall";
import { EVENT_BY_SLUG_QUERY } from "@/lib/queries";
import { getLocalizedUrl } from "@/lib/seo";
import type { EventBySlugResponse } from "@/lib/types";
import { fetchGraphQL } from "@/lib/wp";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = new URL(request.url).searchParams.get("locale") ?? routing.defaultLocale;
  if (!routing.locales.some((supported) => supported === locale)) {
    return new Response("Unsupported locale", { status: 400 });
  }

  try {
    const { event } = await fetchGraphQL<EventBySlugResponse>({
      query: EVENT_BY_SLUG_QUERY,
      variables: { slug },
      locale,
      revalidate: 3600,
      tags: [collectionTag("event"), itemTag("event", slug)],
    });
    if (!event) return new Response("Event not found", { status: 404 });
    // ANIMA publishes events under /agenda, not the starter's /events.
    const calendar = createEventCalendar(
      event,
      getLocalizedUrl(locale, `/agenda/${encodeURIComponent(slug)}`),
      ANIMA
    );
    if (!calendar) return new Response("Event has no valid schedule", { status: 422 });
    const filename = slug.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 100) || (locale === "en" ? "event" : "evento");
    return new Response(calendar, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.ics"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[events] error generating calendar:", error);
    return new Response("Calendar temporarily unavailable", { status: 503 });
  }
}
