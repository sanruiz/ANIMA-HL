import type { Metadata } from "next";
import { VideoHero } from "@/components/anima/video-hero";
import { OurSoul } from "@/components/anima/our-soul";
import { OfferBanner } from "@/components/anima/offer-banner";
import { DailyRituals } from "@/components/anima/daily-rituals";
import { mallPageMetadata } from "@/lib/mall";

// Title and description come from the layout's defaults.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return mallPageMetadata(locale, "/");
}

export default function HomePage() {
  return (
    <>
      <VideoHero />
      <OurSoul />
      <OfferBanner />
      <DailyRituals />
    </>
  );
}
