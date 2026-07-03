import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AboutHero from "@/components/AboutHero";
import AboutIntro from "@/components/AboutIntro";
import AboutVideo from "@/components/AboutVideo";
import AboutEssence from "@/components/AboutEssence";
import AboutGallery from "@/components/AboutGallery";
import AboutClosing from "@/components/AboutClosing";

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
      <AboutClosing />
    </>
  );
}
