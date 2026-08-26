import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ArteDetail from "@/components/arte-detail";
import JsonLd from "@/components/JsonLd";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";

const SLUG = "espacio-abierto";
const IMAGES = ["/art/147.jpg", "/art/148.jpg", "/art/149.jpg", "/art/150.jpg"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "arte.detail.openSpace",
  });
  const canonical = getLocalizedUrl(locale, `/arte/${SLUG}`);

  return {
    title: `${t("title")} | Ánima Village`,
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: getLanguageAlternates(`/arte/${SLUG}`),
    },
  };
}

export default async function ArteEspacioAbiertoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("arte.detail.openSpace");
  const tArte = await getTranslations("arte");
  const url = getLocalizedUrl(locale, `/arte/${SLUG}`);

  const jsonLd = [
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
          name: tArte("title"),
          item: getLocalizedUrl(locale, "/arte"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: t("heading"),
          item: url,
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArteDetail
        tone="verde"
        heading={t("heading")}
        artwork={{
          artist: t("artist"),
          titleYear: t("artworkTitleYear"),
          medium: t("medium"),
        }}
        description={
          <>
            <p className="m-0">{t("descriptionP1")}</p>
            <p className="m-0">{t("descriptionP2")}</p>
          </>
        }
        note={t("note")}
        images={IMAGES.map((src, index) => ({
          src,
          alt: t("imageAlt", { number: index + 1 }),
        }))}
      />
    </>
  );
}
