"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Endpoint del proxy Doppler (suscripción client-side directa).
// Ver proyecto anima-doppler-proxy → /api/subscribe.
const PROXY_URL = "https://anima-doppler-proxy.vercel.app/api/subscribe";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const t = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage(t("formErrorEmail"));
      return;
    }
    if (!agree) {
      setStatus("error");
      setMessage(t("formErrorConsent"));
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("success");
        setEmail("");
        setAgree(false);
      } else {
        setStatus("error");
        setMessage(data?.error || t("formError"));
      }
    } catch {
      setStatus("error");
      setMessage(t("formErrorNetwork"));
    }
  }

  if (status === "success") {
    return <p className="newsletter-done">{t("formSuccess")}</p>;
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit} noValidate>
      <input
        type="email"
        name="email"
        className="newsletter-input"
        placeholder={t("formPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      {/* honeypot anti-bot, oculto */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="newsletter-hp"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />

      <label className="newsletter-consent">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          required
        />
        <span>
          {t("consentBefore")}{" "}
          <Link href="/privacy-notice" className="newsletter-link">
            {t("privacyNotice")}
          </Link>
        </span>
      </label>

      <button type="submit" className="newsletter-submit" disabled={status === "loading"}>
        {status === "loading" ? t("formSending") : t("formSubmit")}
      </button>

      {status === "error" && <p className="newsletter-error">{message || t("formError")}</p>}
    </form>
  );
}
