import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import proxy from "./proxy";

// next-intl's ESM build imports `next/server` without an extension, which
// vitest's Node resolver rejects. What is under test is the wrapper, so stand
// in for the locale middleware with its two shapes: redirect the bare root,
// pass everything else through.
vi.mock("next-intl/middleware", () => ({
  default: () => (req: NextRequest) =>
    req.nextUrl.pathname === "/"
      ? NextResponse.redirect(new URL("/es", req.url), 307)
      : NextResponse.next(),
}));

const CANONICAL = "www.animavillage.com";
const TOKEN = "test-token";
const NOINDEX = "noindex, nofollow";

function request(host: string, path = "/es", cookie?: string) {
  return new NextRequest(`https://${host}${path}`, {
    headers: cookie ? { host, cookie } : { host },
  });
}

const robotsTag = (response: Response) => response.headers.get("x-robots-tag");

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", `https://${CANONICAL}`);
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("COMING_SOON", "false");
  vi.stubEnv("PREVIEW_TOKEN", TOKEN);
});
afterEach(() => vi.unstubAllEnvs());

describe("proxy X-Robots-Tag without coming soon", () => {
  it("leaves the canonical production host indexable", () => {
    expect(robotsTag(proxy(request(CANONICAL)))).toBeNull();
    expect(robotsTag(proxy(request(CANONICAL, "/")))).toBeNull();
  });

  it("marks a production alias noindex", () => {
    expect(robotsTag(proxy(request("anima-hl-git-main-team.vercel.app")))).toBe(NOINDEX);
  });

  it.each(["anima.sanruiz.co", "anima-hl.vercel.app", CANONICAL])(
    "marks %s noindex on a preview deploy, including the locale redirect",
    (host) => {
      vi.stubEnv("VERCEL_ENV", "preview");
      expect(robotsTag(proxy(request(host)))).toBe(NOINDEX);
      expect(robotsTag(proxy(request(host, "/")))).toBe(NOINDEX);
    },
  );
});

// Every exit of the coming-soon gate, on a preview deploy where all of them
// must carry the header, and on the canonical production host where none may.
describe("proxy X-Robots-Tag with coming soon", () => {
  const exits = {
    "the coming-soon rewrite": () => request(CANONICAL, "/es/brands"),
    "the ?preview=<token> redirect": () => request(CANONICAL, `/es?preview=${TOKEN}`),
    "the ?preview=off redirect": () => request(CANONICAL, "/es?preview=off"),
    "a bypass cookie": () => request(CANONICAL, "/es/brands", `anima_preview=${TOKEN}`),
    "the coming-soon page itself": () => request(CANONICAL, "/es/coming-soon"),
  };

  beforeEach(() => vi.stubEnv("COMING_SOON", "true"));

  it.each(Object.entries(exits))("marks %s noindex on a preview deploy", (_, make) => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(robotsTag(proxy(make()))).toBe(NOINDEX);
  });

  it.each(Object.entries(exits))(
    "leaves %s indexable on the canonical production host",
    (_, make) => {
      expect(robotsTag(proxy(make()))).toBeNull();
    },
  );

  it("still serves the coming-soon page through the wrapper", () => {
    const response = proxy(request(CANONICAL, "/es/brands"));
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `https://${CANONICAL}/es/coming-soon`,
    );
  });
});
