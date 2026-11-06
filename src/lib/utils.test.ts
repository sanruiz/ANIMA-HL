import { describe, expect, it } from "vitest";
import {
  buildWordPressUriPath,
  cn,
  decodeHtmlEntities,
  formatBrandHours,
  formatMonthYear,
  isPetFriendly,
  stripHtml,
  transformContentToAssetProxy,
} from "@/lib/utils";

describe("cn()", () => {
  it("joins plain classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("drops falsy values", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts — the last one wins", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("accepts clsx conditional objects", () => {
    expect(cn({ "font-bold": true, italic: false })).toBe("font-bold");
  });

  it("returns an empty string with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("merges size variants correctly", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("w-4 h-4", "w-6")).toBe("h-4 w-6");
  });
});

describe("stripHtml()", () => {
  it("null → empty string", () => {
    expect(stripHtml(null)).toBe("");
  });

  it("empty string → empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("returns text without HTML unchanged", () => {
    expect(stripHtml("Hola mundo")).toBe("Hola mundo");
  });

  it("removes simple HTML tags", () => {
    expect(stripHtml("<p>Hola</p>")).toBe("Hola");
  });

  it("removes nested tags", () => {
    expect(stripHtml("<div><p><strong>Texto</strong></p></div>")).toBe("Texto");
  });

  it("removes attributes inside tags", () => {
    expect(stripHtml('<a href="/ruta" class="link">Ver más</a>')).toBe("Ver más");
  });

  it("collapses multiple spaces into one", () => {
    expect(stripHtml("<p>  Hola   mundo  </p>")).toBe("Hola mundo");
  });

  it("turns line breaks into spaces", () => {
    expect(stripHtml("Texto\n\ncon\n   espacios")).toBe("Texto con espacios");
  });

  it("removes self-closing tags", () => {
    expect(stripHtml("Antes<br />Después")).toBe("AntesDespués");
  });

  // Real WordPress output that reached meta descriptions encoded.
  it("decodes entities, so a meta description reads as text", () => {
    expect(stripHtml("<p>AT&amp;T tiene los planes</p>")).toBe("AT&T tiene los planes");
    expect(stripHtml("<p>y así arrancó, [&hellip;]</p>\n")).toBe("y así arrancó, […]");
    expect(stripHtml("su colección &#8220;Real Women&#8221;")).toBe(
      "su colección “Real Women”"
    );
  });

  it("keeps markup written as text instead of stripping it", () => {
    expect(stripHtml("<p>Usa &lt;b&gt;negritas&lt;/b&gt;</p>")).toBe(
      "Usa <b>negritas</b>"
    );
  });

  it("collapses non-breaking spaces with the rest", () => {
    expect(stripHtml("Hola&nbsp;&nbsp; mundo&#160;")).toBe("Hola mundo");
  });
});

describe("decodeHtmlEntities()", () => {
  it("decodes common named HTML entities", () => {
    expect(decodeHtmlEntities("Tom &amp; Jerry &quot;Club&quot;")).toBe(
      'Tom & Jerry "Club"'
    );
  });

  it("decodes decimal and hexadecimal numeric entities", () => {
    expect(decodeHtmlEntities("Caf&#233; &#x26; té")).toBe("Café & té");
  });

  it("decodes the typographic entities WordPress excerpts carry", () => {
    expect(decodeHtmlEntities("Leer más [&hellip;]")).toBe("Leer más […]");
    expect(decodeHtmlEntities("10&ndash;12 &mdash; &laquo;hoy&raquo; it&rsquo;s")).toBe(
      "10–12 — «hoy» it’s"
    );
  });

  it("decodes named accents case-sensitively", () => {
    expect(decodeHtmlEntities("&Aacute;nima &aacute;rbol &Ntilde;u")).toBe("Ánima árbol Ñu");
  });

  it("still decodes an uppercase spelling of a basic entity", () => {
    expect(decodeHtmlEntities("A &AMP; B")).toBe("A & B");
  });

  it("keeps unknown entities", () => {
    expect(decodeHtmlEntities("Texto &unknown;")).toBe("Texto &unknown;");
  });

  it("null or undefined → empty string", () => {
    expect(decodeHtmlEntities(null)).toBe("");
    expect(decodeHtmlEntities(undefined)).toBe("");
  });
});

describe("buildWordPressUriPath()", () => {
  it("turns catch-all segments into a WordPress URI", () => {
    expect(buildWordPressUriPath(["legal", "privacy"])).toBe("/legal/privacy");
  });

  it("decodes URL-encoded segments", () => {
    expect(buildWordPressUriPath(["privacy%20notice"])).toBe("/privacy notice");
  });

  it("no segments → null", () => {
    expect(buildWordPressUriPath(undefined)).toBeNull();
    expect(buildWordPressUriPath([])).toBeNull();
  });
});

describe("transformContentToAssetProxy()", () => {
  it("rewrites relative /wp-content/uploads paths", () => {
    expect(
      transformContentToAssetProxy('<img src="/wp-content/uploads/foo.png" />')
    ).toBe('<img src="/assets/uploads/foo.png" />');
  });

  it("rewrites absolute URLs keeping the query string", () => {
    expect(
      transformContentToAssetProxy(
        '<link href="https://cms.example.com/wp-content/themes/main.css?ver=1" />'
      )
    ).toBe('<link href="/assets/themes/main.css?ver=1" />');
  });

  it("rewrites protocol-relative plugin URLs", () => {
    expect(
      transformContentToAssetProxy(
        "url(//cms.example.com/wp-content/plugins/form/style.css)"
      )
    ).toBe("url(/assets/plugins/form/style.css)");
  });

  it("leaves content without WordPress assets unchanged", () => {
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

describe("isPetFriendly()", () => {
  // The shape WPGraphQL actually returns for the ACF select field. The array
  // is why the raw value cannot be tested directly: ["no"] is truthy.
  it.each([[["si"]], [["sí"]], [["yes"]]])("accepts %j", (value) => {
    expect(isPetFriendly(value)).toBe(true);
  });

  it.each([[["no"]], [[]], [["No"]]])("rejects %j", (value) => {
    expect(isPetFriendly(value)).toBe(false);
  });

  it("does not mark a brand that answered no as pet friendly", () => {
    expect(isPetFriendly(["no"])).toBe(false);
    expect(Boolean(["no"])).toBe(true); // the bug this guards against
  });

  // Shapes older installs expose.
  it.each([["si"], ["SÍ"], [" yes "], ["1"], [true], [1]])(
    "accepts the legacy shape %j",
    (value) => {
      expect(isPetFriendly(value)).toBe(true);
    }
  );

  it.each([["no"], [""], [false], [0], [null], [undefined], [{}]])(
    "rejects the legacy shape %j",
    (value) => {
      expect(isPetFriendly(value)).toBe(false);
    }
  );
});
