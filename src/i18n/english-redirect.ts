/** Returns the Spanish path for an English URL while English is disabled. */
export function getEnglishDisabledRedirect(
  pathname: string,
  search: string,
  englishEnabled: boolean,
): string | null {
  if (englishEnabled || (pathname !== "/en" && !pathname.startsWith("/en/"))) {
    return null;
  }

  const spanishPath = pathname.slice(3) || "/";
  return `${spanishPath}${search}`;
}
