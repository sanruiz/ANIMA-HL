import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ArteDetail from "@/components/arte-detail";
import JsonLd from "@/components/JsonLd";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";

const SLUG = "programa-publico";
const IMAGES = ["/art/158.jpg", "/art/160.jpg", "/art/161.jpg"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "arte.detail.program",
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

export default async function ArteProgramaPublicoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("arte.detail.program");
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
        tone="claro"
        heading={t("heading")}
        description={
          <>
            <p className="m-0">{t("descriptionP1")}</p>
            <p className="m-0">{t("descriptionP2")}</p>
          </>
        }
        cta={{ href: "/agenda", label: t("cta") }}
        images={IMAGES.map((src, index) => ({
          src,
          alt: t("imageAlt", { number: index + 1 }),
        }))}
      />
    </>
  );
}
