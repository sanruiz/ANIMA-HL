"use server";

import { subscribeToDoppler } from "@/lib/newsletter/doppler";
import type { SubscribeState } from "@/lib/newsletter/types";

export type {
  SubscribeErrorCode,
  SubscribeState,
} from "@/lib/newsletter/types";

export async function subscribe(
  _previous: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const website = formData.get("website");
  if (typeof website === "string" && website.trim()) return { status: "success" };

  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { status: "error", code: "email" };
  }
  if (formData.get("consent") !== "on") return { status: "error", code: "consent" };

  return subscribeToDoppler(email);
}
