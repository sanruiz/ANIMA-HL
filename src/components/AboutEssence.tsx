import { useTranslations } from "next-intl";

// Sección "Our Essence / Acerca de Ánima": heading italic + texto, sobre verde.
export default function AboutEssence() {
  const t = useTranslations("about");
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <section className="about-essence" aria-labelledby="about-essence-heading">
      <div className="about-essence__inner">
        <h2 id="about-essence-heading" className="about-essence__heading">
          {t("essenceHeading")}
        </h2>
        <div className="about-essence__body">
          <p>{t("essenceP1")}</p>
          <p>{t("essenceP2")}</p>
          <p>{t.rich("essenceP3", { em })}</p>
        </div>
      </div>
    </section>
  );
}
