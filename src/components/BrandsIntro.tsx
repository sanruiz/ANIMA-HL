import { useTranslations } from "next-intl";

// Bloque de intro de Brands: heading "Store Directory" + subheading
// centrados sobre fondo claro. Replicado de Webflow.
export default function BrandsIntro() {
  const t = useTranslations("brands");

  return (
    <section className="brands-intro" aria-labelledby="brands-intro-heading">
      <div className="brands-intro__inner">
        <h2 id="brands-intro-heading" className="brands-intro__heading">
          {t("introHeading")}
        </h2>
        <p className="brands-intro__lead">{t("introLead")}</p>
      </div>
    </section>
  );
}
