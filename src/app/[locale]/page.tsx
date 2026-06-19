import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="subtitle">{t("subtitle")}</p>
      <div className="home-actions">
        <Link className="btn" href="/agenda">
          {t("viewAgenda")}
        </Link>
        <Link className="btn" href="/marcas">
          {t("viewBrands")}
        </Link>
      </div>
    </>
  );
}
