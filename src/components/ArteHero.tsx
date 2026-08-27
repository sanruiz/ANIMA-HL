import { getTranslations } from "next-intl/server";
import ArteHeroVideo from "@/components/arte-hero-video";

const HERO_VIDEO = "/art/arte-hero.mp4";
const HERO_POSTER = "/art/arte-hero-poster.jpg";

export default async function ArteHero() {
  const t = await getTranslations("arte");

  return (
    <section className="arte-hero" aria-labelledby="arte-hero-heading">
      <ArteHeroVideo src={HERO_VIDEO} poster={HERO_POSTER} />
      <div className="arte-hero__overlay" aria-hidden />
      <div className="arte-hero__inner">
        <h1 id="arte-hero-heading" className="arte-hero__heading">
          {t("heroHeading")}
        </h1>
      </div>
    </section>
  );
}
