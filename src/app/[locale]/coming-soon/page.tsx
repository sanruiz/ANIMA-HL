import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AnimaLogo from "@/components/AnimaLogo";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { BRANDS } from "./brands";

export const metadata: Metadata = {
  title: "Ánima Village",
  // Evita indexar el coming soon en cada URL reescrita por el proxy.
  robots: { index: false, follow: false },
};

export default async function ComingSoonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("comingSoon");

  // Lista duplicada para que el loop del marquee sea continuo.
  const marqueeItems = [...BRANDS, ...BRANDS];

  return (
    <div className="coming-soon">
      <header className="coming-soon__header">
        <AnimaLogo className="coming-soon__logo" height={44} />
        <LocaleSwitcher active={locale} />
      </header>

      <main className="coming-soon__main">
        <p className="coming-soon__eyebrow">
          <span className="coming-soon__dot" aria-hidden="true" />
          {t("eyebrow")}
        </p>

        <h1 className="coming-soon__headline">
          {t.rich("headline", {
            em: (chunks) => <em>{chunks}</em>,
          })}
        </h1>

        <div className="coming-soon__marquee-block">
          <div className="coming-soon__marquee" aria-hidden="true">
            <div className="coming-soon__track">
              {marqueeItems.map((brand, index) => (
                <span
                  key={`${brand}-${index}`}
                  className={index % 2 ? "coming-soon__brand--italic" : undefined}
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
          <p className="coming-soon__more">{t("moreOnWay")}</p>
        </div>

        <p className="coming-soon__lead">{t("lead")}</p>
      </main>

      <footer className="coming-soon__footer">
        <div className="coming-soon__footer-col">
          <strong>{t("hoursTitle")}</strong>
          <span>{t("hours")}</span>
        </div>
        <div className="coming-soon__footer-col">
          <strong>{t("findUsTitle")}</strong>
          <span>{t("address")}</span>
        </div>
        <div className="coming-soon__footer-col">
          <strong>{t("followUs")}</strong>
          <a
            href="https://www.instagram.com/animavillagecabo"
            target="_blank"
            rel="noopener noreferrer"
          >
            @animavillagecabo
          </a>
        </div>
      </footer>
    </div>
  );
}
