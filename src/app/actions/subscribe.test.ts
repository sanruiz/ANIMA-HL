import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { subscribe } from "./subscribe";
import { INITIAL_STATE } from "./subscribe-state";

// `server-only` resuelve a su build de cliente bajo vitest y lanza al
// importarse; el módulo de Doppler lo trae para evitar que lo importe un
// Client Component.
vi.mock("server-only", () => ({}));

// Helper para armar FormData declarativamente.
function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

// Stub global de fetch — cada test lo reemplaza con vi.fn() para controlar respuestas.
const originalFetch = globalThis.fetch;

beforeEach(() => {
  // El módulo del core no tiene valores por defecto: cada mall configura su
  // cuenta y su lista por entorno, así que los tres tienen que estar puestos.
  process.env.DOPPLER_API_KEY = "test-key-123";
  process.env.DOPPLER_ACCOUNT = "mall@example.com";
  process.env.DOPPLER_LIST_ID = "12345";
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
    expect(body).toEqual({
      email: "ok@user.com",
      fields: [{ name: "CONSENT", value: "true" }],
    });
  });

  it("envía CONSENT = true a Doppler cuando el usuario acepta el aviso", async () => {
    let capturedBody = "";
    globalThis.fetch = vi.fn(async (_url, init) => {
      capturedBody = (init?.body as string) ?? "";
      return new Response("{}", { status: 200 });
    });

    await subscribe(INITIAL_STATE, formData({ email: "ok@user.com", consent: "on" }));

    expect(JSON.parse(capturedBody).fields).toContainEqual({ name: "CONSENT", value: "true" });
  });

  // === Configuración por entorno (portados del test del core) ===
  it("la cuenta y la lista salen del entorno, no del formulario", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    globalThis.fetch = fetchSpy;

    await subscribe(
      INITIAL_STATE,
      formData({
        email: "ok@user.com",
        consent: "on",
        account: "atacante@example.com",
        listId: "999",
      })
    );

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain("mall%40example.com");
    expect(url).toContain("/lists/12345/");
    expect(url).not.toContain("atacante");
    expect(url).not.toContain("999");
  });

  it("lista mal configurada → error code:server sin llamar a Doppler", async () => {
    process.env.DOPPLER_LIST_ID = "no-es-un-numero";
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const state = await subscribe(
      INITIAL_STATE,
      formData({ email: "ok@user.com", consent: "on" })
    );

    expect(state).toEqual({ status: "error", code: "server" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
