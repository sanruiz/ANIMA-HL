import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Detecta el idioma y redirige a /es o /en según corresponda.
export default createMiddleware(routing);

export const config = {
  // No interceptar API, assets de Next, ni archivos con extensión.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
