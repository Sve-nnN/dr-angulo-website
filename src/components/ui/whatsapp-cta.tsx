"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackWhatsAppClick } from "@/lib/tracking";
import { whatsappUrl, whatsappMessages, type CtaLocation } from "@/lib/site-config";

type WhatsAppCtaProps = {
  location: CtaLocation;
  children: React.ReactNode;
  variant?: "accent" | "outline" | "outline-inverse";
  className?: string;
};

const variantClasses: Record<NonNullable<WhatsAppCtaProps["variant"]>, string> = {
  // Dorado de marca con texto oscuro: 6.2:1. El blanco sobre este dorado no llega a 2.5:1.
  accent:
    "bg-accent text-foreground shadow-sm hover:bg-accent-hover hover:-translate-y-px hover:shadow-md motion-reduce:hover:translate-y-0",
  outline:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-on-primary",
  // Para secciones con fondo teal, donde el borde primary desaparecería.
  "outline-inverse":
    "bg-transparent text-white border-2 border-white/40 hover:bg-white/10",
};

export function WhatsAppCta({
  location,
  children,
  variant = "accent",
  className,
}: WhatsAppCtaProps) {
  return (
    <a
      href={whatsappUrl(whatsappMessages[location])}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick(location)}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-[background-color,color,transform,box-shadow] duration-200 ease-out",
        variantClasses[variant],
        className
      )}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      {children}
      <span className="sr-only"> (se abre WhatsApp en una pestaña nueva)</span>
    </a>
  );
}
