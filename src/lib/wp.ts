/**
 * Cliente GraphQL para WPGraphQL usando fetch nativo.
 *
 * ¿Por qué fetch y no graphql-request o Apollo?
 * - En App Router con Server Components, fetch nativo soporta la cache/ISR de
 *   Next.js directamente (opción `next.revalidate`). Cero dependencias extra.
 * - graphql-request sería azúcar sintáctico; Apollo añade un cache de cliente
 *   que aquí no necesitamos. Si algún día lo quieres, solo cambia este archivo.
 *
 * Bilingüe (WP Multilang): el idioma se pasa como ?lang=es|en en la URL del
 * endpoint. Cada query recibe el `locale` y pedimos el contenido en ese idioma.
 */

const ENDPOINT =
  process.env.WORDPRESS_API_URL ?? "https://anima-headless.local/graphql";

type FetchArgs = {
  query: string;
  variables?: Record<string, unknown>;
  /** Idioma para WP Multilang (?lang=). */
  locale?: string;
  /** Segundos de revalidación ISR. 0 = sin cache. */
  revalidate?: number;
};

export async function fetchGraphQL<T>({
  query,
  variables,
  locale,
  revalidate = 60,
}: FetchArgs): Promise<T> {
  const url = locale ? `${ENDPOINT}?lang=${encodeURIComponent(locale)}` : ENDPOINT;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`WPGraphQL respondió ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(" | "));
  }

  if (!json.data) {
    throw new Error("WPGraphQL no devolvió datos.");
  }

  return json.data;
}
