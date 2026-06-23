/**
 * WP Multilang guarda algunas traducciones inline como "[:en]Hello[:es]Hola[:]".
 *
 * Para títulos y contenido de posts, WP Multilang ya resuelve estas etiquetas en
 * GraphQL según el ?lang. PERO para los NOMBRES DE TÉRMINOS de taxonomía el filtro
 * NO se aplica vía WPGraphQL, así que llegan crudos. Esta función extrae el idioma
 * correcto en el frontend.
 *
 * Es segura para textos sin etiquetas: si no hay "[:", devuelve el valor tal cual.
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
