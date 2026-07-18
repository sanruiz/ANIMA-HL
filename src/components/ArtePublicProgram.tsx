import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const PROGRAM_IMG =
  "https://s3.amazonaws.com/webflow-prod-assets/67323ae4f125fe55a3034503/6a2d9f3b75b3d1a493dbeac8_1.jpg";

// "Programa Público": talleres/conferencias + CTA interno a la agenda. Texto + imagen.
export default function ArtePublicProgram() {
  const t = useTranslations("arte");

  return (
    <section
      className="arte-split arte-split--claro"
      aria-labelledby="arte-program-heading"
    >
      <div className="arte-split__inner">
        <div className="arte-split__text">
          <h2 id="arte-program-heading" className="arte-split__heading">
            {t("programHeading")}
          </h2>
          <p className="arte-split__p arte-split__p--muted">{t("programP1")}</p>
          <Link className="arte-button" href="/agenda">
            {t("programCta")}
          </Link>
        </div>
        <div className="arte-split__media">
          <Image
            src={PROGRAM_IMG}
            alt={t("programImageAlt")}
            fill
            sizes="(max-width: 991px) 100vw, 50vw"
            className="arte-split__img"
          />
        </div>
      </div>
    </section>
  );
}
