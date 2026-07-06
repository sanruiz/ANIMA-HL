import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BrandsDirectory from "@/components/BrandsDirectory";
import BrandsHero from "@/components/BrandsHero";
import BrandsIntro from "@/components/BrandsIntro";
import { BRANDS_QUERY } from "@/lib/queries";
import type { BrandNode, BrandsResponse } from "@/lib/types";
import { fetchGraphQL } from "@/lib/wp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brands" });
  return {
    title: `${t("title")} | Ánima Village`,
    description: t("metaDescription"),
  };
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("brands");

  let brands: BrandNode[] = [];
  let failed = false;

  try {
    const data = await fetchGraphQL<BrandsResponse>({
      query: BRANDS_QUERY,
      locale,
    });
    brands = data.brands.nodes;
  } catch (err) {
    console.error("[brands] error cargando marcas:", err);
    failed = true;
  }

  return (
    <>
      <BrandsHero />
      <BrandsIntro />
      {failed ? (
        <section className="brands-directory">
          <p className="brands-directory__empty">{t("error")}</p>
        </section>
      ) : (
        <BrandsDirectory brands={brands} />
      )}
    </>
  );
}
