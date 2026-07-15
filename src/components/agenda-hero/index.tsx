import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AgendaHero() {
  const t = useTranslations("agenda");
  const em = (chunks: ReactNode) => <em>{chunks}</em>;

  return (
    <section className="agenda-hero" aria-labelledby="agenda-hero-heading">
      <Image
        src="/events/events-2026.avif"
        alt={t("heroImageAlt")}
        fill
        priority
        sizes="100vw"
        className="agenda-hero__img"
      />
      <div className="agenda-hero__overlay" aria-hidden />
      <div className="agenda-hero__inner">
        <h1 id="agenda-hero-heading" className="agenda-hero__heading">
          {t("heroHeading")}
        </h1>
        <p className="agenda-hero__lead">{t.rich("heroLead", { em })}</p>
      </div>
    </section>
  );
}
