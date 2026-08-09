"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getConsentServerSnapshot,
  getStoredConsent,
  setStoredConsent,
  subscribeConsent,
} from "@/components/analytics/consent";

export function CookieConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getStoredConsent,
    getConsentServerSnapshot
  );

  if (consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-4 py-4 shadow-xl sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/80">
          Usamos cookies para medir visitas y mejorar la web (Google Analytics y Meta).
          Puedes leer más en nuestra{" "}
          <Link href="/privacidad" className="underline hover:text-primary">
            Política de Privacidad
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setStoredConsent("denied")}
            className="min-h-11 flex-1 cursor-pointer rounded-lg border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-muted sm:flex-none"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => setStoredConsent("granted")}
            className="min-h-11 flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-colors duration-150 hover:bg-primary-dark sm:flex-none"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
