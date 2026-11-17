import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArteAbout } from "@/components/anima/arte-about";
import { ArteHero } from "@/components/anima/arte-hero";
import { ArteSections } from "@/components/anima/arte-sections";
import { mallPageMetadata } from "@/lib/mall";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("arte");
  return {
    title: `${t("title")} | Ánima Village`,
    description: t("metaDescription"),
    ...mallPageMetadata(locale, "/arte"),
  };
}

export default function ArtePage() {
  return (
    <>
      <ArteHero />
      <ArteAbout />
      <ArteSections />
    </>
  );
}
