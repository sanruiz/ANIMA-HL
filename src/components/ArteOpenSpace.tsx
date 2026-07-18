import Image from "next/image";
import { useTranslations } from "next-intl";

const OPEN_IMG =
  "https://s3.amazonaws.com/webflow-prod-assets/67323ae4f125fe55a3034503/6a2d9f3bb7d2374814eb674f_2.jpg";

// "Espacio Abierto": Autorretrato flameante de Cruzvillegas. Imagen + texto,
// invertido, sobre verde.
export default function ArteOpenSpace() {
  const t = useTranslations("arte");
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <section
      className="arte-split arte-split--verde"
      aria-labelledby="arte-open-heading"
    >
      <div className="arte-split__inner arte-split__inner--reverse">
        <div className="arte-split__text">
          <h2 id="arte-open-heading" className="arte-split__heading">
            {t("openSpaceHeading")}
          </h2>
          <p className="arte-split__p">{t.rich("openSpaceP1", { em })}</p>
        </div>
        <div className="arte-split__media">
          <Image
            src={OPEN_IMG}
            alt={t("openSpaceImageAlt")}
            fill
            sizes="(max-width: 991px) 100vw, 50vw"
            className="arte-split__img"
          />
        </div>
      </div>
    </section>
  );
}
