import "server-only";
import type { SubscribeState } from "./types";

/** Called after server-side validation by the public subscription action. */
export async function subscribeToDoppler(email: string): Promise<SubscribeState> {
  // Each mall configures its own destination; no cross-brand defaults.
  const apiKey = process.env.DOPPLER_API_KEY?.trim();
  const account = process.env.DOPPLER_ACCOUNT?.trim();
  const listId = process.env.DOPPLER_LIST_ID?.trim();
  if (!apiKey || !account || !listId || !/^\d+$/.test(listId)) {
    return { status: "error", code: "server" };
  }

  try {
    const response = await fetch(
      `https://restapi.fromdoppler.com/accounts/${encodeURIComponent(account)}/lists/${listId}/subscribers`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Doppler-Subscriber-Origin": "Formulario",
        },
        // CONSENT records in Doppler that the visitor accepted the privacy
        // notice, which the action validated before calling this. Without it
        // the contact lands with CONSENT = false and is excluded from any
        // campaign that filters on consent.
        body: JSON.stringify({
          email,
          fields: [{ name: "CONSENT", value: "true" }],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!response.ok) {
      // Doppler explains refusals in the body (unknown list, revoked key,
      // malformed field); without logging it a failed subscription is just a
      // status code in the Vercel logs.
      console.error(
        "[newsletter] Doppler responded",
        response.status,
        await response.text()
      );
      return { status: "error", code: "network" };
    }
    return { status: "success" };
  } catch (error) {
    console.error("[newsletter] network error", error);
    return { status: "error", code: "network" };
  }
}
