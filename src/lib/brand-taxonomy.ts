import type { BrandNode, TermNode } from "@/lib/types";

/**
 * Returns true when a brand tag is the excluded slug itself or belongs to it.
 */
export function isExcludedBrandTag(
  tag: TermNode,
  excludedSlugs: string[],
): boolean {
  if (excludedSlugs.includes(tag.slug)) {
    return true;
  }

  return tag.ancestors?.nodes.some(
    (ancestor) => ancestor.slug && excludedSlugs.includes(ancestor.slug),
  ) ?? false;
}

/**
 * Filters brands by excluding any brand that is assigned to an excluded tag or
 * one of its descendants.
 */
export function filterBrandsByExcludedTags(
  brands: BrandNode[],
  excludedSlugs: string[],
): BrandNode[] {
  if (excludedSlugs.length === 0) return brands;

  return brands.filter((brand) =>
    !(brand.brandTags?.nodes.some((tag) => isExcludedBrandTag(tag, excludedSlugs)) ?? false),
  );
}
