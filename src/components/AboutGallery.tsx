import Image from "next/image";
import { useTranslations } from "next-intl";

// Galería de 6 fotos del Village (assets de Webflow), grid de 3 columnas.
const IMAGES = ["g1", "g2", "g3", "g4", "g5", "g6"] as const;

export default function AboutGallery() {
  const t = useTranslations("about");

  return (
    <section className="about-gallery" aria-label={t("galleryAlt")}>
      <div className="about-gallery__grid">
        {IMAGES.map((name) => (
          <div key={name} className="about-gallery__item">
            <Image
              src={`/about/${name}.avif`}
              alt={t("galleryAlt")}
              fill
              sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 95vw"
              className="about-gallery__img"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
