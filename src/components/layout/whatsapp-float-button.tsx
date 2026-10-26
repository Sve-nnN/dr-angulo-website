"use client";

import { useSyncExternalStore } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackWhatsAppClick } from "@/lib/tracking";
import { whatsappUrl, whatsappMessages } from "@/lib/site-config";
import {
  getConsentServerSnapshot,
  getStoredConsent,
  subscribeConsent,
} from "@/components/analytics/consent";

export function WhatsAppFloatButton() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getStoredConsent,
    getConsentServerSnapshot
  );
  // Mientras el banner de cookies ocupa el borde inferior, la burbuja sube
  // para no taparle los botones.
  const bannerVisible = consent === null;

  return (
    <a
      href={whatsappUrl(whatsappMessages.floating_button)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick("floating_button")}
      aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)"
      className={cn(
        // Entra sin transform: el fill de la animación pisaría el hover:scale.
        // En móvil la burbuja mide 48px (por encima del mínimo táctil de 44) para
        // tapar menos texto; desde `sm` vuelve a los 56px de siempre.
        "animate-fade-in animate-delay-late fixed right-4 z-50 flex size-12 cursor-pointer items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-[transform,bottom] duration-200 ease-out hover:scale-105 motion-reduce:hover:scale-100 sm:right-5 sm:size-14",
        bannerVisible ? "bottom-40 sm:bottom-28" : "bottom-4 sm:bottom-5"
      )}
    >
      <MessageCircle className="size-6 sm:size-7" aria-hidden="true" />
    </a>
  );
}
