"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { siteConfig } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-el-doctor", label: "Sobre el doctor" },
  { href: "/servicios", label: "Servicios" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/logo-icon-square.png"
            alt="Logo Dr. Juan Angulo Totesaut"
            width={44}
            height={44}
            className="shrink-0 rounded-full"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-base font-bold text-primary sm:text-lg">
              {siteConfig.shortName}
            </span>
            <span className="text-xs text-foreground/70 sm:text-sm">
              Cirujano de columna
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors duration-150 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <WhatsAppCta location="header" variant="accent" className="px-5 py-2.5 text-sm">
            Agendar cita
          </WhatsAppCta>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-primary lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors duration-150 hover:bg-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2">
            <WhatsAppCta location="header" variant="accent" className="w-full">
              Agendar cita
            </WhatsAppCta>
          </div>
        </nav>
      )}
    </header>
  );
}
