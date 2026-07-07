import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BlogIntro from "@/components/BlogIntro";
import BlogList from "@/components/BlogList";
import JsonLd from "@/components/JsonLd";
import { NEWS_QUERY } from "@/lib/queries";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";
import type { NewsResponse, PostNode } from "@/lib/types";
import { fetchGraphQL } from "@/lib/wp";

// Segment ISR: WPGraphQL uses POST reads, so the route needs its own
// revalidate export. The 1h tier is temporary until WP webhooks exist.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const canonical = getLocalizedUrl(locale, "/blog");
  const description = t("metaDescription");
  const title = `${t("title")} | Ánima Village`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getLanguageAlternates("/blog"),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  let posts: PostNode[] = [];
  let failed = false;

  try {
    const data = await fetchGraphQL<NewsResponse>({
      query: NEWS_QUERY,
      locale,
      revalidate: 3600,
      tags: ["wp:posts"],
    });
    posts = data.posts.nodes;
  } catch (err) {
    console.error("[blog] error cargando posts:", err);
    failed = true;
  }

  const blogUrl = getLocalizedUrl(locale, "/blog");
  const homeUrl = getLocalizedUrl(locale, "/");
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: t("title"),
      description: t("metaDescription"),
      url: blogUrl,
      inLanguage: locale,
      publisher: {
        "@type": "Organization",
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
          item: blogUrl,
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogIntro />
      {failed || posts.length === 0 ? (
        <section className="flex w-full justify-center bg-brand-claro pb-24">
          <p className="w-[95%] max-w-[640px] py-16 text-center font-[family-name:var(--font-primary)] text-xl text-brand-oscuro/65">
            {failed ? t("error") : t("empty")}
          </p>
        </section>
      ) : (
        <BlogList posts={posts} locale={locale} />
      )}
    </>
  );
}
