import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGraphQL } from "./wp";

// ENDPOINT se evalúa al cargar el módulo, así que usamos el valor por defecto del código.
const DEFAULT_ENDPOINT = "https://anima-headless.local/graphql";
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
  it("hace POST al endpoint con Content-Type JSON", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY });

    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(DEFAULT_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("añade ?lang= cuando se pasa locale", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY, locale: "es" });

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(`${DEFAULT_ENDPOINT}?lang=es`);
  });

  it("sin locale → URL sin parámetro lang", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY });

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).not.toContain("lang");
    expect(url).toBe(DEFAULT_ENDPOINT);
  });

  it("locale con caracteres especiales se codifica en la URL", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY, locale: "zh-TW" });

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("lang=zh-TW");
  });

  it("incluye query y variables en el body del request", async () => {
    mockFetch({ data: {} });

    const variables = { slug: "mi-post" };
    await fetchGraphQL({ query: QUERY, variables });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.query).toBe(QUERY);
    expect(body.variables).toEqual(variables);
  });

  it("pasa revalidate como next.revalidate", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY, revalidate: 120 });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.next?.revalidate).toBe(120);
  });

  it("revalidate default es 60", async () => {
    mockFetch({ data: {} });

    await fetchGraphQL({ query: QUERY });

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.next?.revalidate).toBe(60);
  });

  // === Errores HTTP ===
  it("respuesta HTTP no-ok lanza error con el status code", async () => {
    mockFetch("Not Found", 404);

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow("404");
  });

  it("respuesta 500 lanza error", async () => {
    mockFetch("Internal Server Error", 500);

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow("500");
  });

  // === Errores GraphQL ===
  it("respuesta con array errors lanza error con todos los mensajes", async () => {
    mockFetch({ errors: [{ message: "Error A" }, { message: "Error B" }] });

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow("Error A | Error B");
  });

  it("respuesta con un solo error lanza su mensaje", async () => {
    mockFetch({ errors: [{ message: "Campo inválido" }] });

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow("Campo inválido");
  });

  // === Respuesta sin data ===
  it("respuesta JSON sin campo data lanza error descriptivo", async () => {
    mockFetch({});

    await expect(fetchGraphQL({ query: QUERY })).rejects.toThrow(
      "WPGraphQL no devolvió datos."
    );
  });

  // === Éxito ===
  it("devuelve el campo data de la respuesta", async () => {
    type MyData = { posts: { id: number }[] };
    const mockData: MyData = { posts: [{ id: 1 }] };
    mockFetch({ data: mockData });

    const result = await fetchGraphQL<MyData>({ query: QUERY });

    expect(result).toEqual(mockData);
  });
});
