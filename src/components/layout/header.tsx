"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-el-doctor", label: "Sobre el doctor" },
  { href: "/servicios", label: "Servicios" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/blog", label: "Blog" },
  { href: "/agendar", label: "Sedes y horarios" },
  { href: "/contacto", label: "Contacto" },
];

/**
 * El CTA principal lleva a /agendar, no directo a WhatsApp: el doctor atiende
 * en cuatro sedes y solo una se agenda por WhatsApp. Mandar todo al chat hacía
 * que los pacientes le pidieran citas de clínicas cuya agenda él no maneja.
 */
const BOOKING_CTA_CLASSES =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-[background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:bg-accent-hover hover:shadow-md motion-reduce:hover:translate-y-0";

const MOBILE_NAV_ID = "menu-principal-movil";

export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape cierra el menú y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/logo-icon-square.avif"
            alt=""
            width={44}
            height={44}
            className="shrink-0 rounded-full"
            priority
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

        <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex">
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
          <Link href="/agendar" className={BOOKING_CTA_CLASSES}>
            <CalendarDays className="size-4" aria-hidden="true" />
            Agendar cita
          </Link>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls={MOBILE_NAV_ID}
          className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-primary transition-colors duration-150 hover:bg-muted lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav
          id={MOBILE_NAV_ID}
          aria-label="Principal"
          className="flex flex-col gap-1 border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden"
        >
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
            <Link
              href="/agendar"
              onClick={() => setOpen(false)}
              className={`${BOOKING_CTA_CLASSES} w-full px-6 py-3 text-base`}
            >
              <CalendarDays className="size-5" aria-hidden="true" />
              Agendar cita
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
