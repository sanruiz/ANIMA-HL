import Image from "next/image";
import { useTranslations } from "next-intl";

// Hero de Brands migrado de Webflow: render aéreo full-bleed con párrafo
// centrado sobre gradiente para legibilidad del header transparente.
export default function BrandsHero() {
  const t = useTranslations("brands");
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <section className="brands-hero" aria-label="Ánima Village">
      <Image
        src="/brands/hero-aerial.avif"
        alt={t("heroImageAlt")}
        fill
        priority
        sizes="100vw"
        className="brands-hero__img"
      />
      <div className="brands-hero__overlay" aria-hidden />
      <div className="brands-hero__inner">
        <p className="brands-hero__lead">{t.rich("heroP1", { em })}</p>
      </div>
    </section>
  );
}
