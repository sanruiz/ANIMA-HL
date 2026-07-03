import Image from "next/image";
import { useTranslations } from "next-intl";

// Hero de la página About migrado de Webflow: render aéreo del Village
// full-bleed, con gradiente superior para legibilidad del header transparente.
export default function AboutHero() {
  const t = useTranslations("about");

  return (
    <section className="about-hero" aria-label="Ánima Village">
      <Image
        src="/about/hero-aerial.avif"
        alt={t("heroImageAlt")}
        fill
        priority
        sizes="100vw"
        className="about-hero__img"
      />
      <div className="about-hero__overlay" aria-hidden />
    </section>
  );
}
