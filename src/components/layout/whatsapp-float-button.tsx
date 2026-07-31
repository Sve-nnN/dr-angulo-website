"use client";

import { MessageCircle } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/tracking";
import { whatsappUrl, whatsappMessages } from "@/lib/site-config";

export function WhatsAppFloatButton() {
  return (
    <a
      href={whatsappUrl(whatsappMessages.floating_button)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick("floating_button")}
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform duration-200 ease-out hover:scale-105 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <MessageCircle className="size-7" aria-hidden="true" />
    </a>
  );
}
