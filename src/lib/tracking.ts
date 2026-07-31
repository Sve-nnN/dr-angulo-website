"use client";

import type { CtaLocation } from "@/lib/site-config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Dispara el evento de clic a WhatsApp en GA4 y Meta Pixel, diferenciado por ubicación del CTA. */
export function trackWhatsAppClick(location: CtaLocation) {
  window.gtag?.("event", "whatsapp_click", {
    cta_location: location,
    event_category: "engagement",
  });
  window.fbq?.("track", "Contact", { cta_location: location });
}

/** Dispara el evento de envío de formulario de contacto/cita. */
export function trackFormSubmit(outcome: "email" | "whatsapp_fallback") {
  window.gtag?.("event", "generate_lead", {
    cta_location: "contact_form",
    outcome,
  });
  window.fbq?.("track", "Lead", { outcome });
}
