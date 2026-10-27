import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutHero } from "@/components/anima/about-hero";
import { AboutIntro } from "@/components/anima/about-intro";
import { AboutVideo } from "@/components/anima/about-video";
import { AboutEssence } from "@/components/anima/about-essence";
import { AboutGallery } from "@/components/anima/about-gallery";
import { AboutClosing } from "@/components/anima/about-closing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: `${t("title")} | Ánima Village`,
    description: t("metaDescription"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AboutHero />
      <AboutIntro />
      <AboutVideo />
      <AboutEssence />
      <AboutGallery />
      {/* <AboutClosing /> */}
    </>
  );
}
