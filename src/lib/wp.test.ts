import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGraphQL } from "@/lib/wp";

// ENDPOINT is evaluated when the module loads, so the statically imported
// module uses the code's default value.
const DEFAULT_ENDPOINT = "https://mall-headless.local/graphql";
const originalEnv = process.env.WORDPRESS_API_URL;
const originalFetch = globalThis.fetch;
const QUERY = "{ posts { nodes { id } } }";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockFetch(body: unknown, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status })
  );
}

describe("fetchGraphQL()", () => {
  // === Request ===
  it("POSTs to the endpoint with a JSON Content-Type", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY });

    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(DEFAULT_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("appends ?lang= when a locale is given", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY, locale: "es" });

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(`${DEFAULT_ENDPOINT}?lang=es`);
  });

  it("no locale → URL without a lang parameter", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY });

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).not.toContain("lang");
    expect(url).toBe(DEFAULT_ENDPOINT);
  });

  it("encodes a locale with special characters in the URL", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY, locale: "zh-TW" });

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("lang=zh-TW");
  });

  it("sends query and variables in the request body", async () => {
    mockFetch({ data: {} });

    const variables = { slug: "mi-post" };
    await fetchGraphQL({ query: QUERY, variables });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.query).toBe(QUERY);
    expect(body.variables).toEqual(variables);
  });

  it("passes revalidate as next.revalidate", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY, revalidate: 120 });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.next?.revalidate).toBe(120);
  });

  it("defaults revalidate to 60", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.next?.revalidate).toBe(60);
  });

  it("passes tags as next.tags together with revalidate", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY, revalidate: 3600, tags: ["wp:posts"] });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.next?.tags).toEqual(["wp:posts"]);
    expect(init.next?.revalidate).toBe(3600);
  });

  it("omits next.tags when tags are not provided", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.next).not.toHaveProperty("tags");
  });

  it("omits next.tags when tags are empty", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY, tags: [] });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.next).not.toHaveProperty("tags");
  });

  it("uses WORDPRESS_API_URL when it is set", async () => {
    process.env.WORDPRESS_API_URL = "https://example.test/graphql";
    vi.resetModules();
    try {
      mockFetch({ data: { ok: true } });

      const { fetchGraphQL: fetchWithEnv } = await import("@/lib/wp");
      const result = await fetchWithEnv<{ ok: boolean }>({
        query: "query { ok }",
        locale: "es",
      });

      expect(result).toEqual({ ok: true });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://example.test/graphql?lang=es",
        expect.objectContaining({ method: "POST" })
      );
    } finally {
      if (originalEnv === undefined) delete process.env.WORDPRESS_API_URL;
      else process.env.WORDPRESS_API_URL = originalEnv;
      vi.resetModules();
    }
  });

  // === HTTP errors ===
  it("throws with the status code on a non-ok HTTP response", async () => {
    mockFetch("Not Found", 404);

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow("404");
  });

  it("throws on a 500 response", async () => {
    mockFetch("Internal Server Error", 500);

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow("500");
  });

  // === GraphQL errors ===
  it("throws with every message when the response has an errors array", async () => {
    mockFetch({ errors: [{ message: "Error A" }, { message: "Error B" }] });

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow("Error A | Error B");
  });

  it("throws the message of a single error", async () => {
    mockFetch({ errors: [{ message: "Campo inválido" }] });

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow("Campo inválido");
  });

  // === Response without data ===
  it("throws a descriptive error when the JSON has no data field", async () => {
    mockFetch({});

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow(
      "WPGraphQL returned no data."
    );
  });

  // === Success ===
  it("returns the response's data field", async () => {
    type MyData = { posts: { id: number }[] };
    const mockData: MyData = { posts: [{ id: 1 }] };
    mockFetch({ data: mockData });

    const result = await fetchGraphQL<MyData>({ query: QUERY });

    expect(result).toEqual(mockData);
  });
});
