"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import InstagramIcon from "./InstagramIcon";
import AnimaLogo from "./AnimaLogo";

// Nav del sitio Webflow replicado. Las páginas aún no migradas al headless
// (arte, gastronomy, map) apuntan a rutas internas placeholder y darán 404
// hasta que se migren; about, brands y blog ya existen.
const NAV_ITEMS = [
  { key: "about", href: "/about" },
  { key: "arte", href: "/arte" },
  { key: "elevatedBrands", href: "/brands" },
  { key: "gastronomy", href: "/gastronomy" },
  { key: "map", href: "/map" },
  { key: "blog", href: "/blog" },
] as const;

const ABOUT_IMAGE =
  "https://cdn.prod.website-files.com/67323ae4f125fe55a3034503/674f0d79c06947329efdeeaf_616_View_Ae%CC%81rea-04_HQ-RENDER--LOGO.avif";

const INSTAGRAM_URL = "https://www.instagram.com/animavillagecabo/";

export default function SiteHeader({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  // Páginas cuya primera sección es un media full-bleed oscuro: el header
  // flota encima en transparente con texto claro (home, about, brands).
  const onHero =
    pathname === "/" || pathname === "/about" || pathname === "/brands";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Bloquea el scroll del body mientras el overlay está abierto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cierra con Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Cambia a estilo sólido al hacer scroll fuera del top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = [
    "site-header",
    onHero && "site-header--over",
    scrolled && "site-header--scrolled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <div className="site-header__bar">
        <Link
          className="brand-mark"
          href="/"
          aria-label="Ánima Village"
        >
          <AnimaLogo height={44} />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-overlay"
          aria-label={open ? t("close") : t("menu")}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu size={28} strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <div
        id="nav-overlay"
        className={`nav-overlay${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <button
          type="button"
          className="nav-overlay__backdrop"
          aria-label={t("close")}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />

        <div className="nav-panel">
          <aside className="nav-about" aria-hidden>
            <div className="nav-about__img">
              {/* Render aéreo del Village (asset original de Webflow). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ABOUT_IMAGE} alt="" loading="lazy" />
            </div>
            <p className="nav-about__text">{t("aboutBlurb")}</p>
          </aside>

          <div className="nav-links">
            <button
              type="button"
              className="nav-close"
              aria-label={t("close")}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              <X size={28} strokeWidth={1.5} aria-hidden />
            </button>

            <nav className="nav-list" aria-label={t("menu")}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="nav-link"
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="nav-footer-row">
              <LocaleSwitcher active={locale} />
              <a
                className="nav-social"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? 0 : -1}
              >
                <InstagramIcon size={18} />
                <span>{t("followUs")}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
