import { describe, expect, it } from "vitest";
import { getEnglishDisabledRedirect } from "./english-redirect";

describe("getEnglishDisabledRedirect", () => {
  it.each([
    ["/en", "", "/"],
    ["/en/", "", "/"],
    ["/en/brands/zara", "?source=menu", "/brands/zara?source=menu"],
  ])("redirects %s to its Spanish path", (pathname, search, expected) => {
    expect(getEnglishDisabledRedirect(pathname, search, false)).toBe(expected);
  });

  it("does not redirect when English is enabled", () => {
    expect(getEnglishDisabledRedirect("/en/brands", "", true)).toBeNull();
  });

  it("does not redirect unrelated paths", () => {
    expect(getEnglishDisabledRedirect("/english/brands", "", false)).toBeNull();
    expect(getEnglishDisabledRedirect("/brands", "", false)).toBeNull();
  });
});
