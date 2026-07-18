import Image from "next/image";
import { getTranslations } from "next-intl/server";

const HERO_IMAGE = "/art/AnimaVillage_VirroyLola_0039.avif";

export default async function ArteHero() {
  const t = await getTranslations("arte");
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;
  const br = () => <br />;

  return (
    <section className="arte-hero" aria-labelledby="arte-hero-heading">
      <Image
        src={HERO_IMAGE}
        alt={t("heroImageAlt")}
        fill
        priority
        sizes="100vw"
        className="arte-hero__img"
      />
      <div className="arte-hero__overlay" aria-hidden />
      <div className="arte-hero__inner">
        <h1 id="arte-hero-heading" className="arte-hero__heading">
          {t("heroHeading")}
        </h1>
        <p className="arte-hero__lead">{t.rich("heroLead", { em, br })}</p>
      </div>
    </section>
  );
}
