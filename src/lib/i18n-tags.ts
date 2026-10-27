/**
 * WP Multilang stores some translations inline as "[:en]Hello[:es]Hola[:]".
 *
 * For post titles and content, WP Multilang already resolves these tags in
 * GraphQL based on ?lang. BUT for taxonomy TERM NAMES the filter does NOT
 * apply via WPGraphQL, so they arrive raw. This function extracts the
 * correct language on the frontend.
 *
 * Safe for text without tags: if there's no "[:", the value is returned as-is.
 */
export function localizeTags(
  value: string | null | undefined,
  locale: string
): string {
  if (!value) return "";
  if (!value.includes("[:")) return value;

  const re = /\[:([a-z]{2})\]([\s\S]*?)(?=\[:|$)/g;
  const map: Record<string, string> = {};
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    map[m[1]] = m[2].trim();
  }

  return map[locale] ?? map.es ?? map.en ?? Object.values(map)[0] ?? value;
}
