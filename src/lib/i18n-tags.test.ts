import { describe, expect, it } from "vitest";
import { localizeTags } from "./i18n-tags";

describe("localizeTags()", () => {
  // === Valores vacíos / sin etiquetas ===
  it("null → string vacío", () => {
    expect(localizeTags(null, "es")).toBe("");
  });

  it("undefined → string vacío", () => {
    expect(localizeTags(undefined, "es")).toBe("");
  });

  it("string vacío → string vacío", () => {
    expect(localizeTags("", "es")).toBe("");
  });

  it("texto sin etiquetas → lo devuelve tal cual", () => {
    expect(localizeTags("Solo texto", "es")).toBe("Solo texto");
    expect(localizeTags("Sin etiquetas", "en")).toBe("Sin etiquetas");
  });

  // === Extracción de idioma ===
  it("extrae el idioma correcto de un string bilingüe", () => {
    expect(localizeTags("[:en]Hello[:es]Hola[:]", "en")).toBe("Hello");
    expect(localizeTags("[:en]Hello[:es]Hola[:]", "es")).toBe("Hola");
  });

  it("trimiea espacios alrededor del texto extraído", () => {
    expect(localizeTags("[:en]  Hello  [:es]  Hola  [:]", "en")).toBe("Hello");
    expect(localizeTags("[:en]  Hello  [:es]  Hola  [:]", "es")).toBe("Hola");
  });

  // === Fallbacks ===
  it("idioma no encontrado → cae a español", () => {
    expect(localizeTags("[:en]Hello[:es]Hola[:]", "fr")).toBe("Hola");
  });

  it("idioma no encontrado y sin español → cae a inglés", () => {
    expect(localizeTags("[:en]Hello[:]", "fr")).toBe("Hello");
  });

  it("idioma no encontrado, sin 'es' ni 'en' → devuelve el primer idioma disponible", () => {
    expect(localizeTags("[:de]Hallo[:it]Ciao[:]", "fr")).toBe("Hallo");
  });

  // === Casos límite ===
  it("solo un idioma → lo devuelve para cualquier locale", () => {
    expect(localizeTags("[:es]Solo español[:]", "es")).toBe("Solo español");
    expect(localizeTags("[:es]Solo español[:]", "en")).toBe("Solo español");
  });

  it("preserva saltos de línea dentro del texto", () => {
    const value = "[:es]Línea uno\nLínea dos[:]";
    expect(localizeTags(value, "es")).toBe("Línea uno\nLínea dos");
  });

  it("string con '[' pero sin etiquetas de idioma → lo devuelve tal cual", () => {
    expect(localizeTags("Texto [sin etiquetas]", "es")).toBe("Texto [sin etiquetas]");
  });

  it("soporta tres idiomas o más", () => {
    const value = "[:en]English[:es]Español[:fr]Français[:]";
    expect(localizeTags(value, "fr")).toBe("Français");
    expect(localizeTags(value, "en")).toBe("English");
    expect(localizeTags(value, "es")).toBe("Español");
  });
});
