import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NewsletterForm from "./NewsletterForm";
import InstagramIcon from "./InstagramIcon";
import SomaLogo from "./SomaLogo";

const MAPS_URL =
  "https://www.google.com/maps/dir//Anima+village,+Tourist+Corridor,+23455+Cabo+San+Lucas,+B.C.S.,+Mexico/@22.919928,-109.8330288,17z";
const INSTAGRAM_URL = "https://www.instagram.com/animavillagecabo";
const INSTAGRAM_ICON_URL = "https://www.instagram.com/animavillagecabos";
const SOMA_URL = "https://soma.group/";

// "What We Offer": brands→/marcas y news→/noticias ya existen en headless;
// arte y gastronomy son placeholders hasta migrar; programming→/agenda existe.
const OFFER_LINKS = [
  { key: "offerBrands", href: "/marcas" },
  { key: "offerArte", href: "/arte" },
  { key: "offerGastronomy", href: "/gastronomy" },
  { key: "offerProgramming", href: "/agenda" },
  { key: "offerNews", href: "/noticias" },
] as const;

// Replicado de Webflow: dos zonas apiladas — newsletter (bg oscuro con SVG
// watermark) arriba, info columns (bg verde) abajo, y créditos al final.
export default function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="site-footer">
      {/* === Zona 1: Newsletter sobre fondo oscuro con SVG decorativo === */}
      <div className="footer-news-section">
        <div className="footer-news-section__inner pb-12">
          {/* Tres variantes del SVG por breakpoint (igual que Webflow). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/footer-mark.svg"
            alt=""
            aria-hidden
            className="footer-news-section__mark footer-news-section__mark--desktop"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/footer-mark-tablet.svg"
            alt=""
            aria-hidden
            className="footer-news-section__mark footer-news-section__mark--tablet"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/footer-mark-mobile.svg"
            alt=""
            aria-hidden
            className="footer-news-section__mark footer-news-section__mark--mobile"
          />
          <div className="footer-news-section__content">
            <h2 className="footer-news-section__title">{t("newsletterTitle")}</h2>
            <p className="footer-news-section__lead">{t("newsletterLead")}</p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* === Zona 2: Info columns sobre fondo verde === */}
      <div className="footer-info-section">
        <div className="footer-info-section__grid">
          {/* Col 1: Horario y dirección */}
          <div className="footer-col">
            <h3 className="footer-col__title">{t("hoursTitle")}</h3>
            <p className="footer-col__text">
              {t("hours")}
              <br />
              <br />
              Cabo Del Sol
              <br />
              Carretera Transpeninsular
              <br />
              Km 10.3
              <br />
              Cabo San Lucas, B.C.S.
              <br />
              23455, Mexico
            </p>
          </div>

          {/* Col 2: What We Offer */}
          <div className="footer-col">
            <h3 className="footer-col__title">{t("offerTitle")}</h3>
            {OFFER_LINKS.map((l) => (
              <Link key={l.key} href={l.href} className="footer-col__link">
                {t(l.key)}
              </Link>
            ))}
          </div>

          {/* Col 3: Links externos + Instagram + SOMA */}
          <div className="footer-col">
            <a
              className="footer-col__link"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("followUs")}
            </a>
            <a className="footer-col__link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              {t("findUs")}
            </a>
            <Link href="/privacy-notice" className="footer-col__link">
              {t("legalPrivacy")}
            </Link>
            <Link href="/regulations" className="footer-col__link">
              {t("guidelines")}
            </Link>
            <a
              className="footer-col__social"
              href={INSTAGRAM_ICON_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon size={22} />
            </a>

            <div className="footer-col__soma">
              <span className="footer-col__soma-label">{t("destinationBy")}</span>
              <a
                href={SOMA_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SOMA Group"
                className="footer-col__soma-logo"
              >
                <SomaLogo height={28} />
              </a>
            </div>
          </div>
        </div>

        {/* Créditos centrados con border-top, replicando .footer-info.credits */}
        <div className="footer-credits">
          <p>{t("credits")}</p>
        </div>
      </div>
    </footer>
  );
}
