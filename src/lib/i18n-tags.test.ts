import { describe, expect, it } from "vitest";
import { localizeTags } from "@/lib/i18n-tags";

describe("localizeTags()", () => {
  // === Empty values / no markers ===
  it("null → empty string", () => {
    expect(localizeTags(null, "es")).toBe("");
  });

  it("undefined → empty string", () => {
    expect(localizeTags(undefined, "es")).toBe("");
  });

  it("empty string → empty string", () => {
    expect(localizeTags("", "es")).toBe("");
  });

  it("returns text without markers as-is", () => {
    expect(localizeTags("Solo texto", "es")).toBe("Solo texto");
    expect(localizeTags("Sin etiquetas", "en")).toBe("Sin etiquetas");
  });

  // === Language extraction ===
  it("extracts the requested language from a bilingual string", () => {
    expect(localizeTags("[:en]Hello[:es]Hola[:]", "en")).toBe("Hello");
    expect(localizeTags("[:en]Hello[:es]Hola[:]", "es")).toBe("Hola");
  });

  it("trims whitespace around the extracted text", () => {
    expect(localizeTags("[:en]  Hello  [:es]  Hola  [:]", "en")).toBe("Hello");
    expect(localizeTags("[:en]  Hello  [:es]  Hola  [:]", "es")).toBe("Hola");
  });

  // === Fallbacks ===
  it("requested language missing → falls back to Spanish", () => {
    expect(localizeTags("[:en]Hello[:es]Hola[:]", "fr")).toBe("Hola");
  });

  it("requested language and Spanish missing → falls back to English", () => {
    expect(localizeTags("[:en]Hello[:]", "fr")).toBe("Hello");
  });

  it("requested language, 'es' and 'en' missing → returns the first available language", () => {
    expect(localizeTags("[:de]Hallo[:it]Ciao[:]", "fr")).toBe("Hallo");
  });

  it("falls back to en, then whatever is available, when es itself is requested and missing", () => {
    expect(localizeTags("[:en]Hello[:]", "es")).toBe("Hello");
    expect(localizeTags("[:fr]Bonjour[:]", "es")).toBe("Bonjour");
  });

  // === Edge cases ===
  it("a single language → returned for any locale", () => {
    expect(localizeTags("[:es]Solo español[:]", "es")).toBe("Solo español");
    expect(localizeTags("[:es]Solo español[:]", "en")).toBe("Solo español");
  });

  it("keeps line breaks inside the text", () => {
    const value = "[:es]Línea uno\nLínea dos[:]";
    expect(localizeTags(value, "es")).toBe("Línea uno\nLínea dos");
  });

  it("a string with '[' but no language markers → returned as-is", () => {
    expect(localizeTags("Texto [sin etiquetas]", "es")).toBe("Texto [sin etiquetas]");
  });

  it("supports three or more languages", () => {
    const value = "[:en]English[:es]Español[:fr]Français[:]";
    expect(localizeTags(value, "fr")).toBe("Français");
    expect(localizeTags(value, "en")).toBe("English");
    expect(localizeTags(value, "es")).toBe("Español");
  });
});
