import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { PAGE_BY_URI_QUERY } from "@/lib/queries";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";
import type { PageByUriResponse } from "@/lib/types";
import {
  buildWordPressUriPath,
  decodeHtmlEntities,
  stripHtml,
  transformContentToAssetProxy,
} from "@/lib/utils";
import { fetchGraphQL } from "@/lib/wp";

export const revalidate = 3600;

type WordPressPageParams = {
  params: Promise<{ locale: string; uri: string[] }>;
};

async function getPage(locale: string, uriPath: string) {
  const data = await fetchGraphQL<PageByUriResponse>({
    query: PAGE_BY_URI_QUERY,
    variables: { uri: uriPath },
    locale,
    revalidate: 3600,
    tags: ["wp:pages", `wp:page:${uriPath}`],
  });

  return data.page;
}

function getPageDescription(content: string | null, fallback: string): string {
  const description = stripHtml(decodeHtmlEntities(content));

  if (!description) return fallback;

  return description.length > 160
    ? `${description.slice(0, 157).trim()}...`
    : description;
}

function getRobotsMetadata(): Metadata["robots"] {
  return process.env.NODE_ENV === "production"
    ? { follow: true, index: true }
    : { follow: false, index: false };
}

export async function generateMetadata({
  params,
}: WordPressPageParams): Promise<Metadata> {
  const { locale, uri } = await params;
  const uriPath = buildWordPressUriPath(uri);
  const t = await getTranslations({ locale, namespace: "metadata" });

  if (!uriPath) return {};

  try {
    const page = await getPage(locale, uriPath);
    if (!page) return {};

    const title = `${decodeHtmlEntities(page.title) || t("defaultTitle")} | Ánima Village`;
    const description = getPageDescription(page.content, t("defaultDescription"));
    const canonical = getLocalizedUrl(locale, uriPath);
    const image = page.featuredImage?.node?.sourceUrl;

    return {
      title,
      description,
      robots: getRobotsMetadata(),
      alternates: {
        canonical,
        languages: getLanguageAlternates(uriPath),
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
      title: `${t("defaultTitle")} | Ánima Village`,
      description: t("defaultDescription"),
      robots: getRobotsMetadata(),
    };
  }
}

export default async function WordPressPage({ params }: WordPressPageParams) {
  const { locale, uri } = await params;
  setRequestLocale(locale);

  const uriPath = buildWordPressUriPath(uri);

  if (!uriPath) notFound();

  let page: PageByUriResponse["page"] = null;

  try {
    page = await getPage(locale, uriPath);
  } catch (err) {
    console.error("[wp-pages] error cargando página:", err);
  }

  if (!page) notFound();

  const title = decodeHtmlEntities(page.title) || "Ánima Village";
  const content = transformContentToAssetProxy(page.content);
  const pageUrl = getLocalizedUrl(locale, uriPath);
  const description = getPageDescription(page.content, title);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: pageUrl,
      datePublished: page.date ?? undefined,
      dateModified: page.modified ?? page.date ?? undefined,
      inLanguage: locale,
      publisher: {
        "@type": "Organization",
        name: "Ánima Village",
        url: getLocalizedUrl(locale, "/"),
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
          item: getLocalizedUrl(locale, "/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: title,
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <article className="w-full bg-brand-claro">
      <JsonLd data={jsonLd} />
      <header className="mt-32 flex w-full justify-center bg-brand-oscuro pb-11 pt-32 text-brand-claro md:pb-14 md:pt-37 lg:pb-18 lg:pt-45">
        <div className="w-[95%] max-w-240">
          <h1 className="max-w-215 font-(family-name:--font-primary) text-[34px] leading-10 font-normal text-brand-claro md:text-[44px] md:leading-12.5 lg:text-[56px] lg:leading-15.5">
            {title}
          </h1>
        </div>
      </header>
      {content ? (
        <section className="flex w-full justify-center pb-19 pt-13 md:pb-26 md:pt-18">
          <div
            className="blog-post__content w-[95%] lg:w-[70%]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </section>
      ) : null}
    </article>
  );
}
