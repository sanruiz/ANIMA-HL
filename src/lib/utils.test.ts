import { describe, expect, it } from "vitest";
import { cn, stripHtml } from "./utils";

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
