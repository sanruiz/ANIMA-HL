import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function GastronomyHero() {
  const t = await getTranslations("gastronomy");
    const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <section className="brands-hero" aria-labelledby="gastronomy-hero-heading">
      <Image
        src="/gastronomy/gastronomy-hero.avif"
        alt={t("heroImageAlt")}
        fill
        priority
        sizes="100vw"
        className="brands-hero__img"
      />
      <div className="brands-hero__overlay" aria-hidden />
      <div className="brands-hero__inner">
        <h1 id="gastronomy-hero-heading" className="brands-hero__heading">
          {t("heroHeading")}
        </h1>
        <p className="brands-hero__lead">{t.rich("heroP1", { em })}</p>
      </div>
    </section>
  );
}
