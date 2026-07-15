import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BrandsDirectory from "@/components/BrandsDirectory";
import GastronomyHero from "@/components/GastronomyHero";
import FeaturedBrandsCarousel from "@/components/featured-brands-carousel";
import { BRANDS_QUERY } from "@/lib/queries";
import type { BrandNode, BrandsResponse } from "@/lib/types";
import { fetchGraphQL } from "@/lib/wp";

const GASTRONOMY_TAG_SLUG = "gastronomy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gastronomy" });
  return {
    title: `${t("title")} | Ánima Village`,
    description: t("metaDescription"),
  };
}

export default async function GastronomyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gastronomy");

  let brands: BrandNode[] = [];
  let failed = false;

  try {
    const data = await fetchGraphQL<BrandsResponse>({
      query: BRANDS_QUERY,
      locale,
    });

    brands = data.brands.nodes
      .filter((brand) =>
        brand.brandTags?.nodes.some((tag) => tag.slug === GASTRONOMY_TAG_SLUG),
      )
      .map((brand) => ({
        ...brand,
        brandTags: brand.brandTags
          ? {
              nodes: brand.brandTags.nodes.filter(
                (tag) => tag.slug !== GASTRONOMY_TAG_SLUG,
              ),
            }
          : null,
      }));
  } catch (err) {
    console.error("[gastronomy] error cargando marcas:", err);
    failed = true;
  }

  return (
    <>
      <GastronomyHero />
      {failed ? (
        <section className="brands-directory">
          <p className="brands-directory__empty">{t("error")}</p>
        </section>
      ) : (
        <>
          <FeaturedBrandsCarousel
            brands={brands.filter((brand) => Boolean(brand.brandFields?.featured))}
            copy={t("featuredCarouselCopy")}
            previousLabel={t("featuredCarouselPrevious")}
            nextLabel={t("featuredCarouselNext")}
          />
          <BrandsDirectory brands={brands} copyNamespace="gastronomy" />
        </>
      )}
    </>
  );
}
