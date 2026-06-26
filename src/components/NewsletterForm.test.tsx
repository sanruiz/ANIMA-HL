/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import * as React from "react";
import type { SubscribeState } from "@/app/actions/subscribe";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    React.createElement("a", { href, className }, children),
}));

vi.mock("@/app/actions/subscribe", () => ({
  subscribe: vi.fn(),
  INITIAL_STATE: { status: "idle" },
}));

vi.mock("react", async (importActual) => {
  const actual = await importActual<typeof import("react")>();
  return { ...actual, useActionState: vi.fn() };
});

// Importar después de los mocks para que vi.mock ya esté registrado.
const { default: NewsletterForm } = await import("./NewsletterForm");

const mockAction = vi.fn();

function setupState(state: SubscribeState, pending = false) {
  vi.mocked(React.useActionState).mockReturnValue(
    [state, mockAction, pending] as unknown as ReturnType<typeof React.useActionState>
  );
}

describe("NewsletterForm", () => {
  beforeEach(() => {
    setupState({ status: "idle" });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    // Re-inicializar el mock tras clearAllMocks para que beforeEach del siguiente test lo encuentre listo.
    setupState({ status: "idle" });
  });

  // === Estados del formulario ===
  it("muestra el formulario en estado idle", () => {
    render(<NewsletterForm />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("formPlaceholder")).toBeInTheDocument();
  });

  it("muestra mensaje de éxito cuando state.status === 'success'", () => {
    setupState({ status: "success" });
    render(<NewsletterForm />);

    expect(screen.getByText("formSuccess")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // === Mapeo de códigos de error ===
  it("error 'email' muestra clave formErrorEmail", () => {
    setupState({ status: "error", code: "email" });
    render(<NewsletterForm />);
    expect(screen.getByText("formErrorEmail")).toBeInTheDocument();
  });

  it("error 'consent' muestra clave formErrorConsent", () => {
    setupState({ status: "error", code: "consent" });
    render(<NewsletterForm />);
    expect(screen.getByText("formErrorConsent")).toBeInTheDocument();
  });

  it("error 'server' muestra clave formError", () => {
    setupState({ status: "error", code: "server" });
    render(<NewsletterForm />);
    expect(screen.getByText("formError")).toBeInTheDocument();
  });

  it("error 'network' muestra clave formErrorNetwork", () => {
    setupState({ status: "error", code: "network" });
    render(<NewsletterForm />);
    expect(screen.getByText("formErrorNetwork")).toBeInTheDocument();
  });

  it("en estado idle no muestra mensaje de error", () => {
    render(<NewsletterForm />);
    expect(screen.queryByText("formErrorEmail")).not.toBeInTheDocument();
    expect(screen.queryByText("formError")).not.toBeInTheDocument();
  });

  // === Estado pending ===
  it("botón deshabilitado mientras pending === true", () => {
    setupState({ status: "idle" }, true);
    render(<NewsletterForm />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("botón habilitado cuando pending === false", () => {
    render(<NewsletterForm />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("botón muestra 'formSending' mientras pending === true", () => {
    setupState({ status: "idle" }, true);
    render(<NewsletterForm />);
    expect(screen.getByRole("button")).toHaveTextContent("formSending");
  });

  it("botón muestra 'formSubmit' cuando no está pendiente", () => {
    render(<NewsletterForm />);
    expect(screen.getByRole("button")).toHaveTextContent("formSubmit");
  });
});
