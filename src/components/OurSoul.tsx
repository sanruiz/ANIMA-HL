import Image from "next/image";
import { useTranslations } from "next-intl";

// Sección "Our Soul" del home, migrada de Webflow (section.green / _2-columns).
// Texto izquierda + imagen horizontal con caption a la derecha; fondo verde.
export default function OurSoul() {
  const t = useTranslations("home");
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <section className="our-soul" aria-labelledby="our-soul-heading">
      <div className="our-soul__cols">
        <div className="our-soul__text">
          <p className="our-soul__paragraph">
            {t.rich("soulP1", { em })}
            <br />
            {t.rich("soulP2", { em })}
          </p>
          <h2 id="our-soul-heading" className="our-soul__h2">
            {t("soulHeading")}
          </h2>
        </div>

        <div className="our-soul__media">
          <div className="our-soul__img-frame">
            <Image
              src="/FOTO-OUR-SOUL-OPC.avif"
              alt={t("soulImageAlt")}
              fill
              sizes="(min-width: 900px) 50vw, 95vw"
              className="our-soul__img"
            />
          </div>
          <p className="our-soul__caption">{t.rich("soulCaption", { em })}</p>
        </div>
      </div>
    </section>
  );
}
