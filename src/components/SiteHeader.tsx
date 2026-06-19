import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

export default function SiteHeader({ locale }: { locale: string }) {
  const t = useTranslations("nav");

  return (
    <header className="site-header">
      <nav>
        <Link href="/">{t("home")}</Link>
        <Link href="/agenda">{t("agenda")}</Link>
        <Link href="/marcas">{t("brands")}</Link>
      </nav>
      <LocaleSwitcher active={locale} />
    </header>
  );
}
