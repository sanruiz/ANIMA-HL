import { setRequestLocale } from "next-intl/server";
import VideoHero from "@/components/VideoHero";
import OurSoul from "@/components/OurSoul";
import OfferBanner from "@/components/OfferBanner";
import DailyRituals from "@/components/DailyRituals";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <VideoHero />
      <OurSoul />
      <OfferBanner />
      <DailyRituals />
    </>
  );
}
