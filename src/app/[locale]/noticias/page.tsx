import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchGraphQL } from "@/lib/wp";
import { NEWS_QUERY } from "@/lib/queries";
import type { NewsResponse, PostNode } from "@/lib/types";
import { Link } from "@/i18n/navigation";

// Quita etiquetas HTML del excerpt para mostrarlo plano en la tarjeta.
function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default async function NoticiasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");

  let posts: PostNode[] = [];
  let failed = false;

  try {
    const data = await fetchGraphQL<NewsResponse>({ query: NEWS_QUERY, locale });
    posts = data.posts.nodes;
  } catch (err) {
    console.error("[noticias] error cargando noticias:", err);
    failed = true;
  }

  return (
    <div className="container">
      <h1>{t("title")}</h1>

      {failed ? (
        <p className="error">{t("error")}</p>
      ) : posts.length === 0 ? (
        <p className="empty">{t("empty")}</p>
      ) : (
        <div className="grid">
          {posts.map((post) => {
            const img = post.featuredImage?.node;
            const excerpt = stripHtml(post.excerpt);
            return (
              <Link
                className="card"
                key={post.id}
                href={`/noticias/${post.slug}`}
              >
                {img?.sourceUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.sourceUrl}
                    alt={img.altText ?? post.title ?? ""}
                  />
                )}
                <div className="body">
                  {post.date && (
                    <div className="meta">
                      {new Date(post.date).toLocaleDateString(locale, {
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </div>
                  )}
                  <h3>{post.title}</h3>
                  {excerpt && (
                    <div className="meta">
                      {excerpt.length > 140
                        ? excerpt.slice(0, 140) + "…"
                        : excerpt}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
