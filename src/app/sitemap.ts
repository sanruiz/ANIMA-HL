import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { BRAND_SLUGS_QUERY, NEWS_SLUGS_QUERY } from "@/lib/queries";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";
import type { BrandSlugsResponse, NewsSlugsResponse } from "@/lib/types";
import { fetchGraphQL } from "@/lib/wp";

const STATIC_PATHS = [
  "/",
  "/about",
  "/brands",
  "/gastronomy",
  "/agenda",
  "/blog",
  "/map",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = routing.locales.flatMap((locale) =>
    STATIC_PATHS.map((pathname) => ({
      url: getLocalizedUrl(locale, pathname),
      lastModified: new Date(),
      alternates: {
        languages: getLanguageAlternates(pathname),
      },
    }))
  );

  const postEntries = await getPostEntries();
  const brandEntries = await getBrandEntries();

  return [...staticEntries, ...postEntries, ...brandEntries];
}

async function getPostEntries(): Promise<MetadataRoute.Sitemap> {
  const entries = await Promise.all(
    routing.locales.map(async (locale) => {
      try {
        const data = await fetchGraphQL<NewsSlugsResponse>({
          query: NEWS_SLUGS_QUERY,
          locale,
          revalidate: 3600,
          tags: ["wp:posts"],
        });

        return data.posts.nodes
          .filter((post) => post.slug)
          .map((post) => {
            const pathname = `/blog/${post.slug}`;
            return {
              url: getLocalizedUrl(locale, pathname),
              lastModified: post.modified ?? post.date ?? undefined,
              alternates: {
                languages: getLanguageAlternates(pathname),
              },
            };
          });
      } catch (err) {
        console.error(`[sitemap] error cargando posts para ${locale}:`, err);
        return [];
      }
    })
  );

  return entries.flat();
}

async function getBrandEntries(): Promise<MetadataRoute.Sitemap> {
  const entries = await Promise.all(
    routing.locales.map(async (locale) => {
      try {
        const data = await fetchGraphQL<BrandSlugsResponse>({
          query: BRAND_SLUGS_QUERY,
          locale,
          revalidate: 3600,
          tags: ["wp:brands"],
        });

        return data.brands.nodes
          .filter((brand) => brand.slug)
          .map((brand) => {
            const pathname = `/brands/${brand.slug}`;
            return {
              url: getLocalizedUrl(locale, pathname),
              lastModified: brand.modified ?? undefined,
              alternates: {
                languages: getLanguageAlternates(pathname),
              },
            };
          });
      } catch (err) {
        console.error(`[sitemap] error cargando marcas para ${locale}:`, err);
        return [];
      }
    })
  );

  return entries.flat();
}
