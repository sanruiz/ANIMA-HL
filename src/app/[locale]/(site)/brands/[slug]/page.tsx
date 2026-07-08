import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import BrandDetail from "@/components/BrandDetail";
import JsonLd from "@/components/JsonLd";
import { BRAND_BY_SLUG_QUERY } from "@/lib/queries";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";
import type { BrandBySlugResponse } from "@/lib/types";
import { stripHtml } from "@/lib/utils";
import { fetchGraphQL } from "@/lib/wp";

export const revalidate = 3600;

type BrandDetailParams = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getBrand(locale: string, slug: string) {
  const data = await fetchGraphQL<BrandBySlugResponse>({
    query: BRAND_BY_SLUG_QUERY,
    variables: { slug },
    locale,
    revalidate: 3600,
    tags: ["wp:brands", `wp:brand:${slug}`],
  });

  return data.brand;
}

export async function generateMetadata({
  params,
}: BrandDetailParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "brands" });

  try {
    const brand = await getBrand(locale, slug);
    if (!brand) return {};

    const title = `${brand.title ?? t("title")} | Ánima Village`;
    const description = stripHtml(brand.content) || t("metaDescription");
    const canonical = getLocalizedUrl(locale, `/brands/${slug}`);
    const image = brand.featuredImage?.node?.sourceUrl;

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: getLanguageAlternates(`/brands/${slug}`),
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

export default async function BrandDetailPage({ params }: BrandDetailParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let brand: BrandBySlugResponse["brand"] = null;
  try {
    brand = await getBrand(locale, slug);
  } catch (err) {
    console.error("[brands] error cargando marca:", err);
  }

  if (!brand) notFound();

  const t = await getTranslations("brands");
  const brandUrl = getLocalizedUrl(locale, `/brands/${slug}`);
  const image = brand.featuredImage?.node?.sourceUrl;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Store",
      name: brand.title,
      image: image ? [image] : undefined,
      telephone: brand.brandFields?.phone ?? undefined,
      url: brandUrl,
      address: brand.brandFields?.store
        ? {
            "@type": "PostalAddress",
            name: brand.brandFields.store,
            addressLocality: "Cabo del Sol",
          }
        : undefined,
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
          item: getLocalizedUrl(locale, "/brands"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: brand.title,
          item: brandUrl,
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <BrandDetail brand={brand} />
    </>
  );
}
