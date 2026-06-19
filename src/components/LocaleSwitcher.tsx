import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Cambia de idioma manteniendo la ruta actual.
export default function LocaleSwitcher({ active }: { active: string }) {
  const t = useTranslations("localeSwitcher");

  return (
    <div className="locale-switcher">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href="/"
          locale={locale}
          className={locale === active ? "active" : ""}
        >
          {t(locale)}
        </Link>
      ))}
    </div>
  );
}
