import { setRequestLocale } from "next-intl/server";
import { VideoHero } from "@/components/anima/video-hero";
import { OurSoul } from "@/components/anima/our-soul";
import { OfferBanner } from "@/components/anima/offer-banner";
import { DailyRituals } from "@/components/anima/daily-rituals";

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
