import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrandNode, BrandsResponse } from "@/lib/types";

const fetchGraphQL = vi.fn();
vi.mock("@/lib/wp", () => ({ fetchGraphQL: (...args: unknown[]) => fetchGraphQL(...args) }));

const { getAllBrands } = await import("@/lib/brands");

function brand(id: string): BrandNode {
  return { id, title: id, slug: id, featuredImage: null, brandTags: null, brandFields: null };
}

function page(ids: string[], endCursor: string | null, hasNextPage: boolean): BrandsResponse {
  return { brands: { nodes: ids.map(brand), pageInfo: { hasNextPage, endCursor } } };
}

beforeEach(() => fetchGraphQL.mockReset());

describe("getAllBrands", () => {
  it("follows the cursor until WPGraphQL reports no next page", async () => {
    fetchGraphQL
      .mockResolvedValueOnce(page(["a", "b"], "c1", true))
      .mockResolvedValueOnce(page(["c"], "c2", false));

    const brands = await getAllBrands("es");

    expect(brands.map((b) => b.id)).toEqual(["a", "b", "c"]);
    expect(fetchGraphQL).toHaveBeenCalledTimes(2);
    expect(fetchGraphQL.mock.calls[0][0].variables).toEqual({ first: 100, after: null });
    expect(fetchGraphQL.mock.calls[1][0].variables).toEqual({ first: 100, after: "c1" });
    expect(fetchGraphQL.mock.calls[1][0].locale).toBe("es");
  });

  it("stops when a page claims more but carries no cursor", async () => {
    fetchGraphQL.mockResolvedValueOnce(page(["a"], null, true));

    expect((await getAllBrands("en")).map((b) => b.id)).toEqual(["a"]);
    expect(fetchGraphQL).toHaveBeenCalledTimes(1);
  });

  it("gives up after a bounded number of pages instead of looping forever", async () => {
    let n = 0;
    fetchGraphQL.mockImplementation(async () => page([`b${n}`], `c${++n}`, true));

    const brands = await getAllBrands("es");

    expect(fetchGraphQL.mock.calls.length).toBeGreaterThan(1);
    expect(fetchGraphQL.mock.calls.length).toBeLessThanOrEqual(10);
    expect(brands).toHaveLength(fetchGraphQL.mock.calls.length);
  });
});
