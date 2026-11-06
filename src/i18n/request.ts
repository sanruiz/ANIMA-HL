import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { locale as getRootLocale } from "next/root-params";
import { routing } from "./routing";

// Loads UI translations (messages/*.json) for the current request's locale.
export default getRequestConfig(async ({ locale: localeOverride }) => {
  const requested = localeOverride ?? (await getRootLocale());
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
