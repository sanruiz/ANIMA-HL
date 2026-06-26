"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  subscribe,
  INITIAL_STATE,
  type SubscribeErrorCode,
} from "@/app/actions/subscribe";

// Mapea el código de error del server action a la clave de traducción.
const ERROR_KEY: Record<SubscribeErrorCode, string> = {
  email: "formErrorEmail",
  consent: "formErrorConsent",
  server: "formError",
  network: "formErrorNetwork",
};

export default function NewsletterForm() {
  const t = useTranslations("footer");
  const [state, action, pending] = useActionState(subscribe, INITIAL_STATE);

  if (state.status === "success") {
    return <p className="newsletter-done">{t("formSuccess")}</p>;
  }

  return (
    <form className="newsletter-form" action={action}>
      <input
        type="email"
        name="email"
        className="newsletter-input"
        placeholder={t("formPlaceholder")}
        required
        autoComplete="email"
      />

      {/* Honeypot anti-bot, oculto del usuario y del lector de pantalla */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="newsletter-hp"
      />

      <label className="newsletter-consent">
        <input type="checkbox" name="consent" required />
        <span>
          {t("consentBefore")}{" "}
          <Link href="/privacy-notice" className="newsletter-link">
            {t("privacyNotice")}
          </Link>
        </span>
      </label>

      <button type="submit" className="newsletter-submit" disabled={pending}>
        {pending ? t("formSending") : t("formSubmit")}
      </button>

      {state.status === "error" && (
        <p className="newsletter-error">{t(ERROR_KEY[state.code])}</p>
      )}
    </form>
  );
}
