import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { fetchGraphQL } from "@/lib/wp";
import { NEWS_BY_SLUG_QUERY } from "@/lib/queries";
import type { NewsBySlugResponse } from "@/lib/types";
import { Link } from "@/i18n/navigation";

export default async function NoticiaDetallePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let post: NewsBySlugResponse["post"] = null;
  try {
    const data = await fetchGraphQL<NewsBySlugResponse>({
      query: NEWS_BY_SLUG_QUERY,
      variables: { slug },
      locale,
    });
    post = data.post;
  } catch (err) {
    console.error("[noticia] error:", err);
  }

  if (!post) notFound();

  const img = post.featuredImage?.node;

  return (
    <article className="container">
      <Link href="/noticias" className="meta" style={{ color: "var(--accent)" }}>
        ← {locale === "es" ? "Noticias" : "News"}
      </Link>

      {post.date && (
        <div className="meta" style={{ marginTop: "1rem" }}>
          {new Date(post.date).toLocaleDateString(locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </div>
      )}

      <h1>{post.title}</h1>

      {img?.sourceUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.sourceUrl}
          alt={img.altText ?? post.title ?? ""}
          style={{
            width: "100%",
            borderRadius: 12,
            margin: "1rem 0 1.5rem",
          }}
        />
      )}

      {post.content && (
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      )}
    </article>
  );
}
