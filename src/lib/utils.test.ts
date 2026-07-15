import { describe, expect, it } from "vitest";
import {
  buildWordPressUriPath,
  cn,
  decodeHtmlEntities,
  formatBrandHours,
  formatMonthYear,
  stripHtml,
  transformContentToAssetProxy,
} from "./utils";

describe("cn()", () => {
  it("combina clases simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("descarta valores falsy", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("resuelve conflictos de Tailwind — último gana", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("acepta objetos condicionales de clsx", () => {
    expect(cn({ "font-bold": true, italic: false })).toBe("font-bold");
  });

  it("devuelve string vacío sin argumentos", () => {
    expect(cn()).toBe("");
  });

  it("fusiona variantes de tamaño correctamente", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("w-4 h-4", "w-6")).toBe("h-4 w-6");
  });
});

describe("stripHtml()", () => {
  it("null → string vacío", () => {
    expect(stripHtml(null)).toBe("");
  });

  it("string vacío → string vacío", () => {
    expect(stripHtml("")).toBe("");
  });

  it("texto sin HTML → lo devuelve sin cambios", () => {
    expect(stripHtml("Hola mundo")).toBe("Hola mundo");
  });

  it("elimina etiquetas HTML simples", () => {
    expect(stripHtml("<p>Hola</p>")).toBe("Hola");
  });

  it("elimina etiquetas anidadas", () => {
    expect(stripHtml("<div><p><strong>Texto</strong></p></div>")).toBe("Texto");
  });

  it("elimina atributos dentro de etiquetas", () => {
    expect(stripHtml('<a href="/ruta" class="link">Ver más</a>')).toBe("Ver más");
  });

  it("normaliza espacios múltiples a uno solo", () => {
    expect(stripHtml("<p>  Hola   mundo  </p>")).toBe("Hola mundo");
  });

  it("normaliza saltos de línea a espacios", () => {
    expect(stripHtml("Texto\n\ncon\n   espacios")).toBe("Texto con espacios");
  });

  it("elimina etiquetas self-closing", () => {
    expect(stripHtml("Antes<br />Después")).toBe("AntesDespués");
  });
});

describe("decodeHtmlEntities()", () => {
  it("decodifica entidades HTML nombradas comunes", () => {
    expect(decodeHtmlEntities("Tom &amp; Jerry &quot;Club&quot;")).toBe(
      'Tom & Jerry "Club"'
    );
  });

  it("decodifica entidades numéricas decimales y hexadecimales", () => {
    expect(decodeHtmlEntities("Caf&#233; &#x26; té")).toBe("Café & té");
  });

  it("preserva entidades desconocidas", () => {
    expect(decodeHtmlEntities("Texto &unknown;")).toBe("Texto &unknown;");
  });

  it("null o undefined → string vacío", () => {
    expect(decodeHtmlEntities(null)).toBe("");
    expect(decodeHtmlEntities(undefined)).toBe("");
  });
});

describe("buildWordPressUriPath()", () => {
  it("convierte segmentos catch-all en URI de WordPress", () => {
    expect(buildWordPressUriPath(["legal", "privacy"])).toBe("/legal/privacy");
  });

  it("decodifica segmentos URL-encoded", () => {
    expect(buildWordPressUriPath(["privacy%20notice"])).toBe("/privacy notice");
  });

  it("sin segmentos → null", () => {
    expect(buildWordPressUriPath(undefined)).toBeNull();
    expect(buildWordPressUriPath([])).toBeNull();
  });
});

describe("transformContentToAssetProxy()", () => {
  it("reescribe rutas relativas de /wp-content/uploads", () => {
    expect(
      transformContentToAssetProxy('<img src="/wp-content/uploads/foo.png" />')
    ).toBe('<img src="/assets/uploads/foo.png" />');
  });

  it("reescribe URLs absolutas conservando query string", () => {
    expect(
      transformContentToAssetProxy(
        '<link href="https://cms.example.com/wp-content/themes/main.css?ver=1" />'
      )
    ).toBe('<link href="/assets/themes/main.css?ver=1" />');
  });

  it("reescribe URLs protocol-relative de plugins", () => {
    expect(
      transformContentToAssetProxy(
        "url(//cms.example.com/wp-content/plugins/form/style.css)"
      )
    ).toBe("url(/assets/plugins/form/style.css)");
  });

  it("no cambia contenido sin assets de WordPress", () => {
    expect(transformContentToAssetProxy("<p>Hola</p>")).toBe("<p>Hola</p>");
  });
});

describe("formatMonthYear()", () => {
  it("formats English as 'May 2026'", () => {
    expect(formatMonthYear("2026-05-14T10:00:00", "en")).toBe("May 2026");
  });

  it("formats Spanish as capitalized month plus year without 'de'", () => {
    expect(formatMonthYear("2026-05-14T10:00:00", "es")).toBe("Mayo 2026");
  });

  it("uses UTC to avoid timezone month drift", () => {
    expect(formatMonthYear("2026-05-31T23:59:00Z", "en")).toBe("May 2026");
    expect(formatMonthYear("2026-06-01T00:01:00Z", "en")).toBe("June 2026");
  });

  it("returns an empty string for null, undefined, and empty values", () => {
    expect(formatMonthYear(null, "es")).toBe("");
    expect(formatMonthYear(undefined, "es")).toBe("");
    expect(formatMonthYear("", "es")).toBe("");
  });

  it("returns an empty string for invalid dates", () => {
    expect(formatMonthYear("no-es-fecha", "es")).toBe("");
  });
});

describe("formatBrandHours()", () => {
  it("joins days and time with a colon", () => {
    expect(formatBrandHours("Monday to Sunday", "11:00 AM – 8:00 PM")).toBe(
      "Monday to Sunday: 11:00 AM – 8:00 PM"
    );
  });

  it("returns an empty string when days is missing", () => {
    expect(formatBrandHours(null, "11:00 AM – 8:00 PM")).toBe("");
  });

  it("returns an empty string when time is missing", () => {
    expect(formatBrandHours("Monday to Sunday", undefined)).toBe("");
  });

  it("returns an empty string when both are missing", () => {
    expect(formatBrandHours(null, null)).toBe("");
  });
});
