import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MapFindUs } from "@/components/anima/map-find-us";
import { MapIntro } from "@/components/anima/map-intro";
import { mallPageMetadata } from "@/lib/mall";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("map");
  return {
    title: `${t("title")} | Ánima Village`,
    description: t("metaDescription"),
    ...mallPageMetadata(locale, "/map"),
  };
}

export default function MapPage() {
  return (
    <>
      <MapIntro />
      <MapFindUs />
    </>
  );
}
