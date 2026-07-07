import { describe, expect, it } from "vitest";
import {
  getPreviewToken,
  isComingSoonEnabled,
  isComingSoonPath,
  splitLocale,
} from "@/lib/coming-soon";

describe("isComingSoonEnabled", () => {
  it("es true sólo con COMING_SOON=true", () => {
    expect(isComingSoonEnabled({ COMING_SOON: "true" })).toBe(
      true
    );
  });

  it("es false con cualquier otro valor o sin definir", () => {
    expect(isComingSoonEnabled({})).toBe(false);
    expect(
      isComingSoonEnabled({ COMING_SOON: "false" })
    ).toBe(false);
    expect(isComingSoonEnabled({ COMING_SOON: "1" })).toBe(
      false
    );
  });
});

describe("getPreviewToken", () => {
  it("devuelve el token configurado", () => {
    expect(
      getPreviewToken({ PREVIEW_TOKEN: "abc123" })
    ).toBe("abc123");
  });

  it("devuelve cadena vacía sin token (bypass deshabilitado)", () => {
    expect(getPreviewToken({})).toBe("");
  });
});

describe("splitLocale", () => {
  it("extrae el locale del pathname", () => {
    expect(splitLocale("/es/brands")).toEqual({ locale: "es", rest: "/brands" });
    expect(splitLocale("/en")).toEqual({ locale: "en", rest: "/" });
  });

  it("usa el locale por defecto cuando no hay prefijo", () => {
    expect(splitLocale("/")).toEqual({ locale: "es", rest: "/" });
    expect(splitLocale("/brands")).toEqual({ locale: "es", rest: "/brands" });
  });

  it("no confunde segmentos que parecen locales", () => {
    expect(splitLocale("/estonia")).toEqual({ locale: "es", rest: "/estonia" });
  });
});

describe("isComingSoonPath", () => {
  it("detecta /coming-soon con y sin locale", () => {
    expect(isComingSoonPath("/coming-soon")).toBe(true);
    expect(isComingSoonPath("/es/coming-soon")).toBe(true);
    expect(isComingSoonPath("/en/coming-soon/")).toBe(true);
  });

  it("rechaza otras rutas", () => {
    expect(isComingSoonPath("/")).toBe(false);
    expect(isComingSoonPath("/es/brands")).toBe(false);
    expect(isComingSoonPath("/es/coming-soon/extra")).toBe(false);
  });
});
