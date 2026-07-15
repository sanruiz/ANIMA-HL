import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import EventDetail from "@/components/event-detail";
import JsonLd from "@/components/JsonLd";
import { parseEventDate } from "@/lib/event-date-formatter";
import { EVENT_BY_SLUG_QUERY } from "@/lib/queries";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";
import type { EventBySlugResponse, EventSingle } from "@/lib/types";
import { stripHtml } from "@/lib/utils";
import { fetchGraphQL } from "@/lib/wp";

export const revalidate = 3600;

type EventDetailParams = {
  params: Promise<{ locale: string; slug: string }>;
};

function getSchemaDate(dateValue: string | null | undefined): string | undefined {
  const parsed = parseEventDate(dateValue);

  if (!parsed) return undefined;

  return parsed.date.toISOString().slice(0, 10);
}

function getEventDescription(event: EventSingle, fallback: string): string {
  return stripHtml(event.excerpt) || stripHtml(event.content) || fallback;
}

async function getEvent(locale: string, slug: string) {
  const data = await fetchGraphQL<EventBySlugResponse>({
    query: EVENT_BY_SLUG_QUERY,
    variables: { slug },
    locale,
    revalidate: 3600,
    tags: ["wp:events", `wp:event:${slug}`],
  });

  return data.event;
}

export async function generateMetadata({
  params,
}: EventDetailParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "agenda" });

  try {
    const event = await getEvent(locale, slug);
    if (!event) return {};

    const title = `${event.title ?? t("title")} | Ánima Village`;
    const description = getEventDescription(event, t("metaDescription"));
    const canonical = getLocalizedUrl(locale, `/agenda/${slug}`);
    const image = event.featuredImage?.node?.sourceUrl;

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: getLanguageAlternates(`/agenda/${slug}`),
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: canonical,
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return {
      title: `${t("title")} | Ánima Village`,
      description: t("metaDescription"),
    };
  }
}

export default async function EventDetailPage({ params }: EventDetailParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let event: EventBySlugResponse["event"] = null;
  try {
    event = await getEvent(locale, slug);
  } catch (err) {
    console.error("[agenda] error cargando evento:", err);
  }

  if (!event) notFound();

  const t = await getTranslations("agenda");
  const eventUrl = getLocalizedUrl(locale, `/agenda/${slug}`);
  const image = event.featuredImage?.node?.sourceUrl;
  const fields = event.eventFields;
  const description = getEventDescription(event, t("metaDescription"));
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description,
      image: image ? [image] : undefined,
      startDate: getSchemaDate(fields?.startDate ?? event.date),
      endDate: getSchemaDate(fields?.endDate),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: fields?.place
        ? {
            "@type": "Place",
            name: fields.place,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Cabo del Sol",
              addressCountry: "MX",
            },
          }
        : undefined,
      organizer: {
        "@type": "Organization",
        name: "Ánima Village",
        url: getLocalizedUrl(locale, "/"),
      },
      url: eventUrl,
      inLanguage: locale,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Ánima Village",
          item: getLocalizedUrl(locale, "/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t("title"),
          item: getLocalizedUrl(locale, "/agenda"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: event.title,
          item: eventUrl,
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <EventDetail event={event} locale={locale} />
    </>
  );
}
