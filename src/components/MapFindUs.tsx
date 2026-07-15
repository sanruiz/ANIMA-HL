import Image from "next/image";
import { useTranslations } from "next-intl";

// Sección "Find us" de la página Map migrada de Webflow: plano maestro del
// Village y embed de Google Maps (mismo src que Webflow).
const GOOGLE_MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3674.785173442612!2d-109.83783042445927!3d22.921293279244868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86af4d0024a3e535%3A0x888b56fdcae57f05!2s%C3%81nima%20Village!5e0!3m2!1sen!2ses!4v1766396131424!5m2!1sen!2ses";

export default function MapFindUs() {
  const t = useTranslations("map");

  return (
    <section className="map-find" aria-label={t("heading")}>
      <div className="map-find__plan">
        <Image
          src="/map/map.avif"
          alt={t("masterplanAlt")}
          width={5268}
          height={8733}
          sizes="(min-width: 992px) 900px, 95vw"
          className="map-find__plan-img"
        />
      </div>
      <div className="map-find__embed">
        <h2 className="map-find__embed-title italic pb-4">{t("directionsTitle")}</h2>
        <iframe
          src={GOOGLE_MAPS_EMBED_SRC}
          title={t("embedTitle")}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="map-find__embed-frame"
        />
      </div>
    </section>
  );
}
