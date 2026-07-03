/**
 * Lógica del "modo coming soon".
 *
 * Cuando COMING_SOON=true, el proxy sirve /coming-soon a todo el público.
 * El equipo puede ver las páginas internas visitando cualquier URL con
 * ?preview=<PREVIEW_TOKEN> (setea una cookie de bypass por 30 días) y volver
 * al comportamiento público con ?preview=off.
 *
 * Separada del proxy para poder testearla como funciones puras.
 */
import { routing } from "@/i18n/routing";

export const PREVIEW_COOKIE = "anima_preview";
export const PREVIEW_PARAM = "preview";
export const PREVIEW_OFF_VALUE = "off";
export const COMING_SOON_PATH = "/coming-soon";
/** Días de validez de la cookie de bypass. */
export const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type ComingSoonEnv = {
  COMING_SOON?: string;
  PREVIEW_TOKEN?: string;
};

/** El modo coming soon se activa sólo con COMING_SOON=true. */
export function isComingSoonEnabled(
  env: ComingSoonEnv = process.env as ComingSoonEnv
): boolean {
  return env.COMING_SOON === "true";
}

/** Token de preview. Vacío = bypass deshabilitado. */
export function getPreviewToken(
  env: ComingSoonEnv = process.env as ComingSoonEnv
): string {
  return env.PREVIEW_TOKEN ?? "";
}

/** Separa el prefijo de locale del resto del pathname. */
export function splitLocale(pathname: string): {
  locale: string;
  rest: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...restSegments] = segments;

  if (first && (routing.locales as readonly string[]).includes(first)) {
    return {
      locale: first,
      rest: restSegments.length ? `/${restSegments.join("/")}` : "/",
    };
  }

  return { locale: routing.defaultLocale, rest: pathname || "/" };
}

/** ¿El pathname (con o sin locale) ya apunta al coming soon? */
export function isComingSoonPath(pathname: string): boolean {
  const { rest } = splitLocale(pathname);
  return rest === COMING_SOON_PATH || rest === `${COMING_SOON_PATH}/`;
}
