import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArteAbout } from "@/components/anima/arte-about";
import { ArteHero } from "@/components/anima/arte-hero";
import { ArteSections } from "@/components/anima/arte-sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "arte" });
  return {
    title: `${t("title")} | Ánima Village`,
    description: t("metaDescription"),
  };
}

export default async function ArtePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ArteHero />
      <ArteAbout />
      <ArteSections />
    </>
  );
}
