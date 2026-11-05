import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { headers } from "next/headers";
import robots from "./robots";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

// ANIMA's own values: the canonical host NEXT_PUBLIC_SITE_URL carries in
// Production and Preview alike (robots.txt's sitemap line on both says so),
// and the hosts each Vercel environment is actually served on.
const CANONICAL = "www.animavillage.com";
const STAGING = "anima.sanruiz.co";
const DEV = "anima-hl.vercel.app";

function setHost(host?: string) {
  vi.mocked(headers).mockResolvedValue(new Headers(host ? { host } : {}));
}

const BLOCKED = { rules: { userAgent: "*", disallow: "/" } };

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", `https://${CANONICAL}`);
  vi.stubEnv("VERCEL_ENV", "production");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe("robots on the production deploy", () => {
  it.each([CANONICAL, "WWW.ANIMAVILLAGE.COM", `${CANONICAL}.`])(
    "allows %s and excludes the API",
    async (host) => {
      setHost(host);
      expect(await robots()).toEqual({
        rules: { userAgent: "*", allow: "/", disallow: "/api/" },
        sitemap: `https://${CANONICAL}/sitemap.xml`,
      });
    },
  );

  // Served with VERCEL_ENV=production: only the host check blocks them.
  it.each([
    "anima-hl-git-main-santiago-ramirezs-projects-0d4a76db.vercel.app",
    // Vercel redirects the apex to www with a 308; never index it directly.
    "animavillage.com",
    "invalid host",
    undefined,
  ])("blocks %s", async (host) => {
    setHost(host);
    expect(await robots()).toEqual(BLOCKED);
  });
});

describe("robots off the production deploy", () => {
  // Staging and dev run with VERCEL_ENV=preview and the production
  // NEXT_PUBLIC_SITE_URL. Both served Allow: / before this rule.
  it.each([STAGING, DEV, CANONICAL])("blocks %s on a preview deploy", async (host) => {
    vi.stubEnv("VERCEL_ENV", "preview");
    setHost(host);
    expect(await robots()).toEqual(BLOCKED);
  });

  it.each(["anima.local", "localhost:3000", CANONICAL])(
    "blocks %s outside Vercel, where VERCEL_ENV is unset",
    async (host) => {
      vi.stubEnv("VERCEL_ENV", undefined);
      setHost(host);
      expect(await robots()).toEqual(BLOCKED);
    },
  );
});
