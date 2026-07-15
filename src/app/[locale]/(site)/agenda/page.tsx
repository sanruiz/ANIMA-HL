import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AgendaEventsGrid from "@/components/agenda-events-grid";
import AgendaHero from "@/components/agenda-hero";
import JsonLd from "@/components/JsonLd";
import { getUpcomingEvents } from "@/lib/events";
import { EVENTS_QUERY } from "@/lib/queries";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";
import type { EventsResponse, EventNode } from "@/lib/types";
import { fetchGraphQL } from "@/lib/wp";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "agenda" });
  const canonical = getLocalizedUrl(locale, "/agenda");
  const description = t("metaDescription");
  const title = `${t("title")} | Ánima Village`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getLanguageAlternates("/agenda"),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
    },
  };
}

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("agenda");

  let events: EventNode[] = [];
  let failed = false;

  try {
    const data = await fetchGraphQL<EventsResponse>({
      query: EVENTS_QUERY,
      locale,
      revalidate: 3600,
      tags: ["wp:events"],
    });
    events = getUpcomingEvents(data.events.nodes);
  } catch (err) {
    console.error("[agenda] error cargando eventos:", err);
    failed = true;
  }

  const agendaUrl = getLocalizedUrl(locale, "/agenda");
  const homeUrl = getLocalizedUrl(locale, "/");
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: t("title"),
      description: t("metaDescription"),
      url: agendaUrl,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: "Ánima Village",
        url: homeUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Ánima Village",
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t("title"),
          item: agendaUrl,
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <AgendaHero />
      {failed ? (
        <section className="agenda-events">
          <p className="agenda-events__empty">{t("error")}</p>
        </section>
      ) : (
        <AgendaEventsGrid
          events={events}
          locale={locale}
          heading={t("upcomingHeading")}
          emptyMessage={t("empty")}
        />
      )}
    </>
  );
}
