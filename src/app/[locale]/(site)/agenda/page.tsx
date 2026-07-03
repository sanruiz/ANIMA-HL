import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchGraphQL } from "@/lib/wp";
import { EVENTS_QUERY } from "@/lib/queries";
import type { EventsResponse, EventNode } from "@/lib/types";
import { localizeTags } from "@/lib/i18n-tags";

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
    <div className="container">
      <h1>{t("title")}</h1>

      {failed ? (
        <p className="error">{t("error")}</p>
      ) : events.length === 0 ? (
        <p className="empty">{t("empty")}</p>
      ) : (
        <div className="grid">
          {events.map((ev) => {
            const img = ev.featuredImage?.node;
            const f = ev.eventFields;
            // startDate es un campo de fecha de ACF (medianoche UTC); se formatea
            // en UTC para evitar desfase de un día. Fallback a la fecha del post.
            const startDate = f?.startDate ?? ev.date;
            return (
              <article className="card" key={ev.id}>
                {img?.sourceUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.sourceUrl} alt={img.altText ?? ev.title ?? ""} />
                )}
                <div className="body">
                  {f?.featured && <span className="tag">★ {t("featured")}</span>}
                  <h3>{ev.title}</h3>
                  {startDate && (
                    <div className="meta">
                      {new Date(startDate).toLocaleDateString(locale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                      {f?.startTime ? ` · ${f.startTime.slice(0, 5)}` : ""}
                    </div>
                  )}
                  {f?.place && <div className="meta">{f.place}</div>}
                  <div>
                    {ev.eventTags?.nodes.map((tag) => (
                      <span className="tag" key={tag.slug}>
                        {localizeTags(tag.name, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
