import { describe, expect, it } from "vitest";
import { NEWS_TO_BLOG_REDIRECTS } from "./redirects";

describe("NEWS_TO_BLOG_REDIRECTS", () => {
  it("todos los redirects son 301 explícitos (nunca permanent/308)", () => {
    for (const redirect of NEWS_TO_BLOG_REDIRECTS) {
      expect(redirect.statusCode).toBe(301);
      expect(redirect).not.toHaveProperty("permanent");
    }
  });

  it("cubre las 8 combinaciones legadas (news/noticias × con/sin locale × índice/detalle)", () => {
    const sources = NEWS_TO_BLOG_REDIRECTS.map((r) => r.source);
    expect(sources).toEqual([
      "/news",
      "/news/:path*",
      "/:locale(es|en)/news",
      "/:locale(es|en)/news/:path*",
      "/noticias",
      "/noticias/:path*",
      "/:locale(es|en)/noticias",
      "/:locale(es|en)/noticias/:path*",
    ]);
  });

  it("cada destino apunta a /blog conservando locale y :path*", () => {
    for (const { source, destination } of NEWS_TO_BLOG_REDIRECTS) {
      expect(destination).toBe(
        source.replace(/\/(news|noticias)/, "/blog").replace("(es|en)", "")
      );
    }
  });

  it("los destinos con locale conservan el parámetro :locale", () => {
    const withLocale = NEWS_TO_BLOG_REDIRECTS.filter((r) =>
      r.source.startsWith("/:locale")
    );
    expect(withLocale).toHaveLength(4);
    for (const { destination } of withLocale) {
      expect(destination.startsWith("/:locale/blog")).toBe(true);
    }
  });
});
