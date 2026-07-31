"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackWhatsAppClick } from "@/lib/tracking";
import { whatsappUrl, whatsappMessages, type CtaLocation } from "@/lib/site-config";

type WhatsAppCtaProps = {
  location: CtaLocation;
  children: React.ReactNode;
  variant?: "accent" | "outline" | "whatsapp";
  className?: string;
};

const variantClasses: Record<NonNullable<WhatsAppCtaProps["variant"]>, string> = {
  accent:
    "bg-accent text-white hover:bg-accent-dark",
  outline:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white",
  whatsapp: "bg-whatsapp text-white hover:brightness-95",
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
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-all duration-200 ease-out",
        variantClasses[variant],
        className
      )}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      {children}
    </a>
  );
}
