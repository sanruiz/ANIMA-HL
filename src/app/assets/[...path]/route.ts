import { NextResponse } from "next/server";

const DEFAULT_WORDPRESS_ORIGIN = "https://anima-headless.local";
const ASSET_CACHE_CONTROL =
  "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=2592000";
const ALLOWED_FIRST_SEGMENTS = new Set(["plugins", "themes", "uploads"]);

type AssetRouteParams = {
  params: Promise<{ path: string[] }>;
};

function getWordPressOrigin(): string {
  const rawOrigin = process.env.BACKEND_URL ?? process.env.WORDPRESS_API_URL;

  if (!rawOrigin) return DEFAULT_WORDPRESS_ORIGIN;

  try {
    return new URL(rawOrigin).origin;
  } catch {
    return DEFAULT_WORDPRESS_ORIGIN;
  }
}

function getAssetPath(path: string[]): string | null {
  if (!path.length) return null;
  if (!ALLOWED_FIRST_SEGMENTS.has(path[0])) return null;
  if (path.some((segment) => segment === ".." || segment.includes("\\"))) {
    return null;
  }

  return path.map(encodeURIComponent).join("/");
}

function isAllowedContentType(contentType: string): boolean {
  const normalizedContentType = contentType.toLowerCase();

  return (
    normalizedContentType.startsWith("image/") ||
    normalizedContentType.startsWith("font/") ||
    normalizedContentType.startsWith("text/css") ||
    normalizedContentType.startsWith("application/font") ||
    normalizedContentType.startsWith("application/pdf") ||
    normalizedContentType.startsWith("application/vnd.ms-fontobject") ||
    normalizedContentType.startsWith("application/x-font")
  );
}

export async function GET(request: Request, { params }: AssetRouteParams) {
  const { path } = await params;
  const assetPath = getAssetPath(path);

  if (!assetPath) {
    return NextResponse.json({ error: "Invalid asset path" }, { status: 400 });
  }

  const assetUrl = new URL(`/wp-content/${assetPath}`, getWordPressOrigin());
  assetUrl.search = new URL(request.url).search;

  const response = await fetch(assetUrl, {
    next: { revalidate: 31536000, tags: ["wp:assets"] },
  });

  if (!response.ok || !response.body) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!isAllowedContentType(contentType)) {
    return NextResponse.json({ error: "Unsupported asset type" }, { status: 415 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Cache-Control": ASSET_CACHE_CONTROL,
      "Content-Type": contentType,
    },
  });
}
