import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchGraphQL } from "@/lib/wp";
import { EVENTS_QUERY } from "@/lib/queries";
import type { EventsResponse, EventNode } from "@/lib/types";

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
    });
    events = data.events.nodes;
  } catch (err) {
    console.error("[agenda] error cargando eventos:", err);
    failed = true;
  }

  return (
    <>
      <h1>{t("title")}</h1>

      {failed ? (
        <p className="error">{t("error")}</p>
      ) : events.length === 0 ? (
        <p className="empty">{t("empty")}</p>
      ) : (
        <div className="grid">
          {events.map((ev) => {
            const img = ev.featuredImage?.node;
            return (
              <article className="card" key={ev.id}>
                {img?.sourceUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.sourceUrl} alt={img.altText ?? ev.title ?? ""} />
                )}
                <div className="body">
                  <h3>{ev.title}</h3>
                  {ev.date && (
                    <div className="meta">
                      {new Date(ev.date).toLocaleDateString(locale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  <div>
                    {ev.eventTags?.nodes.map((tag) => (
                      <span className="tag" key={tag.slug}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
