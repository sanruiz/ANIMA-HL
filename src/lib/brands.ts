import { collectionTag } from "@/lib/cache-tags";
import { BRANDS_QUERY } from "@/lib/queries";
import type { BrandNode, BrandsResponse } from "@/lib/types";
import { fetchGraphQL } from "@/lib/wp";

const BRAND_PAGE_SIZE = 100;
const MAX_BRAND_PAGES = 10;

/** Fetches every brand page exposed by WPGraphQL's connection. */
export async function getAllBrands(locale: string): Promise<BrandNode[]> {
  const brands: BrandNode[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_BRAND_PAGES; page += 1) {
    const data: BrandsResponse = await fetchGraphQL<BrandsResponse>({
      query: BRANDS_QUERY,
      variables: { first: BRAND_PAGE_SIZE, after },
      locale,
      revalidate: 3600,
      tags: [collectionTag("brand")],
    });

    brands.push(...data.brands.nodes);

    if (!data.brands.pageInfo.hasNextPage || !data.brands.pageInfo.endCursor) {
      break;
    }

    after = data.brands.pageInfo.endCursor;
  }

  return brands;
}
