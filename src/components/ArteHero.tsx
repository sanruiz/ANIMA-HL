import { getTranslations } from "next-intl/server";

const HERO_VIDEO = "/art/arte-hero.mp4";
const HERO_POSTER = "/art/arte-hero-poster.jpg";

export default async function ArteHero() {
  const t = await getTranslations("arte");

  return (
    <section className="arte-hero" aria-labelledby="arte-hero-heading">
      <video
        className="arte-hero__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={HERO_POSTER}
        aria-hidden
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="arte-hero__overlay" aria-hidden />
      <div className="arte-hero__inner">
        <h1 id="arte-hero-heading" className="arte-hero__heading">
          {t("heroHeading")}
        </h1>
      </div>
    </section>
  );
}
