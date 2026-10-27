export type SubscribeState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; code: "email" | "consent" | "server" | "network" };

export type SubscribeErrorCode = Extract<SubscribeState, { status: "error" }>["code"];

export type NewsletterMessages = {
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  pending: string;
  success: string;
  consentBefore: string;
  privacyLabel: string;
  consentAfter: string;
  errors: Record<SubscribeErrorCode, string>;
};
