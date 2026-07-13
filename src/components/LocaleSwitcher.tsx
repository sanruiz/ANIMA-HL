"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface LocaleSwitcherProps {
  active: string;
}

// Cambia de idioma manteniendo la ruta actual.
export default function LocaleSwitcher({ active }: LocaleSwitcherProps) {
  const t = useTranslations("localeSwitcher");
  const pathname = usePathname();

  return (
    <div className="locale-switcher">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          className={locale === active ? "active" : ""}
        >
          {t(locale)}
        </Link>
      ))}
    </div>
  );
}
