import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import {
  COMING_SOON_PATH,
  PREVIEW_COOKIE,
  PREVIEW_COOKIE_MAX_AGE,
  PREVIEW_OFF_VALUE,
  PREVIEW_PARAM,
  getPreviewToken,
  isComingSoonEnabled,
  isComingSoonPath,
  splitLocale,
} from "@/lib/coming-soon";

// Detecta el idioma y redirige a /es o /en según corresponda.
const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Sin modo coming soon: comportamiento normal (sólo i18n).
  if (!isComingSoonEnabled()) {
    return intlMiddleware(request);
  }

  const { nextUrl } = request;
  const token = getPreviewToken();
  const previewParam = nextUrl.searchParams.get(PREVIEW_PARAM);

  // ?preview=<token> → setea cookie de bypass y limpia la URL.
  if (token && previewParam === token) {
    const url = nextUrl.clone();
    url.searchParams.delete(PREVIEW_PARAM);
    const response = NextResponse.redirect(url);
    response.cookies.set(PREVIEW_COOKIE, token, {
      path: "/",
      maxAge: PREVIEW_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  // ?preview=off → borra la cookie para volver a ver el coming soon.
  if (previewParam === PREVIEW_OFF_VALUE) {
    const url = nextUrl.clone();
    url.searchParams.delete(PREVIEW_PARAM);
    const response = NextResponse.redirect(url);
    response.cookies.delete(PREVIEW_COOKIE);
    return response;
  }

  // Con cookie válida (o ya en /coming-soon) se navega normal.
  const hasBypass =
    token !== "" && request.cookies.get(PREVIEW_COOKIE)?.value === token;

  if (hasBypass || isComingSoonPath(nextUrl.pathname)) {
    return intlMiddleware(request);
  }

  // Público sin bypass: servir el coming soon conservando la URL original.
  const { locale } = splitLocale(nextUrl.pathname);
  const url = nextUrl.clone();
  url.pathname = `/${locale}${COMING_SOON_PATH}`;
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  // No interceptar API, assets de Next, ni archivos con extensión.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
