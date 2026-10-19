"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { NavMenuItem } from "@/lib/menus";
import { LocaleSwitcher } from "./locale-switcher";
import { InstagramIcon } from "./instagram-icon";
import { AnimaLogo } from "./anima-logo";

// Fallback de navegación. La nav real sale de WordPress (menú PRIMARY) y
// llega por props; esta lista sólo se usa si WP no devuelve nada — backend
// caído, menú desasignado en wp-admin — para que el header nunca quede vacío.
const FALLBACK_NAV_ITEMS = [
  { key: "elevatedBrands", href: "/brands" },
  { key: "gastronomy", href: "/gastronomy" },
  { key: "agenda", href: "/agenda" },
  { key: "arte", href: "/arte" },
  { key: "map", href: "/map" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
] as const;

// Mismo archivo que el hero de /about (checksum idéntico al original de Webflow).
const ABOUT_IMAGE = "/about/menu-background.avif";

const INSTAGRAM_URL = "https://www.instagram.com/animavillagecabo/";

export function SiteHeader({
  locale,
  menu = [],
}: {
  locale: string;
  menu?: NavMenuItem[];
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  // WordPress manda cuando tiene algo que decir; si no, la lista local
  // traducida con next-intl. Se normalizan a la misma forma para que el JSX
  // no tenga que distinguirlas.
  const navItems =
    menu.length > 0
      ? menu.map((item) => ({
          key: item.id,
          href: item.href,
          label: item.label,
          target: item.target,
        }))
      : FALLBACK_NAV_ITEMS.map((item) => ({
          key: item.key,
          href: item.href,
          label: t(item.key),
          target: null,
        }));
  // Páginas cuya primera sección es un media full-bleed oscuro: el header
  // flota encima en transparente con texto claro (home, about, brands, agenda).
  const onHero =
    pathname === "/" ||
    pathname === "/agenda" ||
    pathname === "/about" ||
    pathname === "/gastronomy" ||
    pathname === "/arte" ||
    pathname === "/brands";
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
              {/* Render aéreo del Village. */}
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
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="nav-link"
                  tabIndex={open ? 0 : -1}
                  target={item.target ?? undefined}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
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
