import { describe, expect, it } from "vitest";
import { shouldBypassImageOptimizer } from "./wp-image";

describe("shouldBypassImageOptimizer()", () => {
  const dev = { NODE_ENV: "development" };
  const prod = { NODE_ENV: "production" };

  it("URL vacía o null → false", () => {
    expect(shouldBypassImageOptimizer(null, dev)).toBe(false);
    expect(shouldBypassImageOptimizer(undefined, dev)).toBe(false);
    expect(shouldBypassImageOptimizer("", dev)).toBe(false);
  });

  it("dev + hostname .local → true", () => {
    expect(
      shouldBypassImageOptimizer(
        "https://anima-headless.local/wp-content/uploads/foo.png",
        dev
      )
    ).toBe(true);
  });

  it("dev + hostname público → false", () => {
    expect(
      shouldBypassImageOptimizer(
        "https://cms.animavillage.com/wp-content/uploads/foo.png",
        dev
      )
    ).toBe(false);
  });

  it("prod + hostname .local → false (defensa: nunca bypass en prod)", () => {
    expect(
      shouldBypassImageOptimizer(
        "https://anima-headless.local/wp-content/uploads/foo.png",
        prod
      )
    ).toBe(false);
  });

  it("URL malformada → false", () => {
    expect(shouldBypassImageOptimizer("no-es-una-url", dev)).toBe(false);
    expect(shouldBypassImageOptimizer("/rutas/relativas.png", dev)).toBe(false);
  });

  it("NODE_ENV no seteado → false", () => {
    expect(
      shouldBypassImageOptimizer("https://anima-headless.local/img.png", {})
    ).toBe(false);
  });

  it("hostname que solo contiene .local en medio no cuenta", () => {
    expect(
      shouldBypassImageOptimizer("https://foo.local.example.com/img.png", dev)
    ).toBe(false);
  });
});
