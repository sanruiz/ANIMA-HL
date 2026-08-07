import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import BlogPostHeader from "@/components/BlogPostHeader";
import JsonLd from "@/components/JsonLd";
import { collectionTag, itemTag } from "@/lib/cache-tags";
import { NEWS_BY_SLUG_QUERY } from "@/lib/queries";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";
import type { NewsBySlugResponse } from "@/lib/types";
import { cn, stripHtml } from "@/lib/utils";
import { fetchGraphQL } from "@/lib/wp";
import { shouldBypassImageOptimizer } from "@/lib/wp-image";

export const revalidate = 3600;

type BlogPostParams = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getPost(locale: string, slug: string) {
  const data = await fetchGraphQL<NewsBySlugResponse>({
    query: NEWS_BY_SLUG_QUERY,
    variables: { slug },
    locale,
    revalidate: 3600,
    tags: [collectionTag("post"), itemTag("post", slug)],
  });

  return data.post;
}

export async function generateMetadata({
  params,
}: BlogPostParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  try {
    const post = await getPost(locale, slug);
    if (!post) return {};

    const title = `${post.title ?? t("title")} | Ánima Village`;
    const description = stripHtml(post.excerpt) || t("metaDescription");
    const canonical = getLocalizedUrl(locale, `/blog/${slug}`);
    const image = post.featuredImage?.node?.sourceUrl;

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: getLanguageAlternates(`/blog/${slug}`),
      },
      openGraph: {
        title,
        description,
        type: "article",
        url: canonical,
        publishedTime: post.date ?? undefined,
        modifiedTime: post.modified ?? undefined,
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

export default async function BlogPostPage({ params }: BlogPostParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let post: NewsBySlugResponse["post"] = null;
  try {
    post = await getPost(locale, slug);
  } catch (err) {
    console.error("[blog] error:", err);
  }

  if (!post) notFound();

  const t = await getTranslations("blog");
  const postUrl = getLocalizedUrl(locale, `/blog/${slug}`);
  const image = post.featuredImage?.node?.sourceUrl;
  const description = stripHtml(post.excerpt) || t("metaDescription");
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description,
      datePublished: post.date,
      dateModified: post.modified ?? post.date,
      image: image ? [image] : undefined,
      mainEntityOfPage: postUrl,
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
          name: t("title"),
          item: getLocalizedUrl(locale, "/blog"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: postUrl,
        },
      ],
    },
  ];

  return (
    <article className="blog-post">
      <JsonLd data={jsonLd} />
      <div className="blog-post__layout">
        <BlogPostHeader
          date={post.date}
          locale={locale}
          title={post.title}
        />
        <div
          className={cn(
            "blog-post__columns",
            !post.featuredImage?.node?.sourceUrl && "blog-post__columns--full",
          )}
        >
          {post.featuredImage?.node?.sourceUrl && (
            <div className="blog-post__media">
              <Image
                src={post.featuredImage.node.sourceUrl}
                alt={post.featuredImage.node.altText ?? post.title ?? ""}
                width={1200}
                height={800}
                sizes="(max-width: 767px) 95vw, (max-width: 991px) 42vw, 40vw"
                className="blog-post__img"
                unoptimized={shouldBypassImageOptimizer(
                  post.featuredImage.node.sourceUrl,
                )}
                priority
              />
            </div>
          )}
          {post.content && (
            <section className="blog-post__body">
              <div
                className="blog-post__content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
