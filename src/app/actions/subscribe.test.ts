import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { subscribe, INITIAL_STATE } from "./subscribe";

// Helper para armar FormData declarativamente.
function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

// Stub global de fetch — cada test lo reemplaza con vi.fn() para controlar respuestas.
const originalFetch = globalThis.fetch;

beforeEach(() => {
  process.env.DOPPLER_API_KEY = "test-key-123";
  // Silenciar console.error en los caminos de error esperados.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("subscribe (Server Action)", () => {
  // === Honeypot ===
  it("honeypot lleno → devuelve success falso sin llamar a Doppler", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "bot@bot.com", consent: "on", website: "http://spam.com" })
    );

    expect(state).toEqual({ status: "success" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("honeypot con sólo espacios NO se considera lleno", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "real@user.com", consent: "on", website: "   " })
    );

    expect(state).toEqual({ status: "success" });
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  // === Validación email ===
  it("email malformado → error code:email", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "no-es-email", consent: "on" })
    );

    expect(state).toEqual({ status: "error", code: "email" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("email vacío → error code:email", async () => {
    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "", consent: "on" })
    );
    expect(state).toEqual({ status: "error", code: "email" });
  });

  it("email >254 caracteres → error code:email", async () => {
    const longLocal = "a".repeat(250);
    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: `${longLocal}@x.co`, consent: "on" })
    );
    expect(state).toEqual({ status: "error", code: "email" });
  });

  it("email se normaliza a lowercase y trimea espacios", async () => {
    let capturedBody = "";
    globalThis.fetch = vi.fn(async (_url, init) => {
      capturedBody = (init?.body as string) ?? "";
      return new Response("{}", { status: 200 });
    });

    await subscribe(
      INITIAL_STATE,
      formData({ email: "  USER@Example.COM  ", consent: "on" })
    );

    expect(JSON.parse(capturedBody).email).toBe("user@example.com");
  });

  // === Consent ===
  it("sin checkbox de consent → error code:consent", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const state = await subscribe(INITIAL_STATE, formData({ email: "ok@user.com" }));

    expect(state).toEqual({ status: "error", code: "consent" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // === Configuración ===
  it("API key no configurada → error code:server", async () => {
    delete process.env.DOPPLER_API_KEY;
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "ok@user.com", consent: "on" })
    );

    expect(state).toEqual({ status: "error", code: "server" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // === Respuestas de Doppler ===
  it("Doppler responde 4xx → error code:network", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('{"error":"already exists"}', { status: 409 }));

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "dup@user.com", consent: "on" })
    );

    expect(state).toEqual({ status: "error", code: "network" });
  });

  it("Doppler responde 5xx → error code:network", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("oops", { status: 503 }));

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "ok@user.com", consent: "on" })
    );

    expect(state).toEqual({ status: "error", code: "network" });
  });

  it("fetch lanza excepción → error code:network", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("network down"));

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "ok@user.com", consent: "on" })
    );

    expect(state).toEqual({ status: "error", code: "network" });
  });

  it("Doppler responde 200 → success", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "ok@user.com", consent: "on" })
    );

    expect(state).toEqual({ status: "success" });
  });

  // === Payload enviado a Doppler ===
  it("envía el payload correcto a la API de Doppler", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    globalThis.fetch = fetchSpy;

    await subscribe(
      INITIAL_STATE,
      formData({ email: "ok@user.com", consent: "on" })
    );

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toContain("restapi.fromdoppler.com");
    expect(url).toContain("/subscribers");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("token test-key-123");
    expect(headers["X-Doppler-Subscriber-Origin"]).toBe("Formulario");
    const body = JSON.parse(init.body);
    expect(body).toEqual({ email: "ok@user.com", fields: [] });
  });

  it("incluye FIRSTNAME en fields cuando viene el campo firstname", async () => {
    let capturedBody = "";
    globalThis.fetch = vi.fn(async (_url, init) => {
      capturedBody = (init?.body as string) ?? "";
      return new Response("{}", { status: 200 });
    });

    await subscribe(
      INITIAL_STATE,
      formData({ email: "ok@user.com", consent: "on", firstname: "Santiago" })
    );

    const body = JSON.parse(capturedBody);
    expect(body.fields).toEqual([{ name: "FIRSTNAME", value: "Santiago" }]);
  });

  it("firstname con sólo espacios NO se agrega al payload", async () => {
    let capturedBody = "";
    globalThis.fetch = vi.fn(async (_url, init) => {
      capturedBody = (init?.body as string) ?? "";
      return new Response("{}", { status: 200 });
    });

    await subscribe(
      INITIAL_STATE,
      formData({ email: "ok@user.com", consent: "on", firstname: "   " })
    );

    expect(JSON.parse(capturedBody).fields).toEqual([]);
  });
});
