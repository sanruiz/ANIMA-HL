import { useTranslations } from "next-intl";

// "Sobre Arte Abierto": bloque de texto centrado, SIN imagen.
export default function ArteAbout() {
  const t = useTranslations("arte");
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <section className="arte-intro" aria-labelledby="arte-about-heading">
      <div className="arte-intro__inner">
        <h2 id="arte-about-heading" className="arte-intro__heading">
          {t("aboutHeading")}
        </h2>
        <p className="arte-intro__p arte-intro__p--muted">{t("aboutP1")}</p>
        <a
          className="arte-button"
          href="https://arteabierto.org/"
          target="_blank"
          rel="noreferrer"
        >
          {t("aboutCta")}
        </a>
        <p className="arte-intro__p arte-intro__p--muted">
          {t.rich("aboutP2", { em })}
        </p>
      </div>
    </section>
  );
}
