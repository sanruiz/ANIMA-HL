import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import MapFindUs from "@/components/MapFindUs";
import MapIntro from "@/components/map-intro";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  return {
    title: `${t("title")} | Ánima Village`,
    description: t("metaDescription"),
  };
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <MapIntro />
      <MapFindUs />
    </>
  );
}
