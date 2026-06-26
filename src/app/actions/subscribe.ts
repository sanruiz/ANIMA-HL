"use server";

// Server Action de suscripción al newsletter (Doppler).
// El form la invoca vía useActionState; la API key vive sólo en el server.
//
// Devuelve códigos de error, no mensajes — la traducción se hace en el cliente
// con next-intl para mantener el action locale-agnostic.

const DOPPLER_ACCOUNT = process.env.DOPPLER_ACCOUNT || "gmajul@animavillage.com";
const DOPPLER_LIST_ID = process.env.DOPPLER_LIST_ID || "29207920";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type SubscribeErrorCode = "email" | "consent" | "server" | "network";

export type SubscribeState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; code: SubscribeErrorCode };

export const INITIAL_STATE: SubscribeState = { status: "idle" };

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  // Honeypot: si "website" viene lleno es un bot. Devolvemos éxito falso.
  const website = formData.get("website");
  if (typeof website === "string" && website.trim() !== "") {
    return { status: "success" };
  }

  const emailRaw = formData.get("email");
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: "error", code: "email" };
  }

  // El checkbox required del HTML5 ya filtra esto, pero validamos en server por si llega
  // un submit programático.
  const consent = formData.get("consent");
  if (!consent) {
    return { status: "error", code: "consent" };
  }

  const apiKey = process.env.DOPPLER_API_KEY;
  if (!apiKey) {
    console.error("[subscribe] DOPPLER_API_KEY no configurada");
    return { status: "error", code: "server" };
  }

  const payload: { email: string; fields: Array<{ name: string; value: string }> } = {
    email,
    fields: [],
  };

  const firstname = formData.get("firstname");
  if (typeof firstname === "string" && firstname.trim()) {
    payload.fields.push({ name: "FIRSTNAME", value: firstname.slice(0, 200) });
  }

  const url = `https://restapi.fromdoppler.com/accounts/${encodeURIComponent(
    DOPPLER_ACCOUNT
  )}/lists/${DOPPLER_LIST_ID}/subscribers`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Doppler-Subscriber-Origin": "Formulario",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      console.error("[subscribe] Doppler error", res.status, data);
      return { status: "error", code: "network" };
    }

    return { status: "success" };
  } catch (err) {
    console.error("[subscribe] network error", err);
    return { status: "error", code: "network" };
  }
}
