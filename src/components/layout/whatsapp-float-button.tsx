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
        "animate-fade-in animate-delay-late fixed right-5 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-[transform,bottom] duration-200 ease-out hover:scale-105 motion-reduce:hover:scale-100",
        bannerVisible ? "bottom-44 sm:bottom-28" : "bottom-5"
      )}
    >
      <MessageCircle className="size-7" aria-hidden="true" />
    </a>
  );
}
