import Image from "next/image";
import { useTranslations } from "next-intl";

const COLLECTION_IMG =
  "https://s3.amazonaws.com/webflow-prod-assets/67323ae4f125fe55a3034503/696ff8e450b07e9297e06cd6_AnimaVillage_VirroyLola_0011.avif";

// "Colección": Joint Effort de Jose Dávila. Imagen + texto (con eyebrow) sobre beige.
export default function ArteCollection() {
  const t = useTranslations("arte");
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <section
      className="arte-split arte-split--beige"
      aria-labelledby="arte-collection-heading"
    >
      <div className="arte-split__inner arte-split__inner--reverse">
        <div className="arte-split__text">
          <p className="arte-split__eyebrow">{t("collectionEyebrow")}</p>
          <h2 id="arte-collection-heading" className="arte-split__heading">
            {t("collectionHeading")}
          </h2>
          <p className="arte-split__p">{t.rich("collectionP1", { em })}</p>
        </div>
        <div className="arte-split__media">
          <Image
            src={COLLECTION_IMG}
            alt={t("collectionImageAlt")}
            fill
            sizes="(max-width: 991px) 100vw, 50vw"
            className="arte-split__img"
          />
        </div>
      </div>
    </section>
  );
}
