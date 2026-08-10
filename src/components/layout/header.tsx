"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BookingCta } from "@/components/ui/booking-cta";
import { ServicesMenu } from "@/components/layout/services-menu";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { servicePages } from "@/content/service-pages";

/**
 * `label` es el texto del menú de escritorio, donde el espacio manda;
 * `longLabel` es el del menú móvil, que sí tiene ancho para ser explícito.
 *
 * "Servicios" no vive acá: en escritorio lo resuelve `ServicesMenu` como
 * megamenú, y en móvil se renderiza aparte con las cuatro páginas anidadas
 * debajo (ver el bloque de navegación móvil más abajo).
 */
const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-el-doctor", label: "El doctor", longLabel: "Sobre el doctor" },
  { href: "/agendar", label: "Sedes", longLabel: "Sedes y horarios" },
  { href: "/testimonios", label: "Testimonios" },
  {
    href: "/preguntas-frecuentes",
    label: "Preguntas",
    longLabel: "Preguntas frecuentes",
  },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

const MOBILE_NAV_ID = "menu-principal-movil";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // El header despega del contenido al hacer scroll: sin la sombra, sobre las
  // secciones claras no se distingue dónde termina la barra y empieza la página.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm transition-[box-shadow,border-color] duration-200 ease-out",
        scrolled ? "border-transparent shadow-md" : "border-border shadow-none"
      )}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo-icon-square.avif"
            alt=""
            width={44}
            height={44}
            className="shrink-0 rounded-full"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="whitespace-nowrap font-heading text-base font-bold text-primary sm:text-lg">
              {siteConfig.shortName}
            </span>
            <span className="whitespace-nowrap text-xs text-foreground/70 sm:text-sm">
              Cirujano de columna
            </span>
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-5 xl:flex"
        >
          {NAV_LINKS.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-foreground/80 transition-colors duration-150 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <ServicesMenu />
          {NAV_LINKS.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-foreground/80 transition-colors duration-150 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 xl:block">
          <BookingCta size="sm" className="whitespace-nowrap">
            Agendar cita
          </BookingCta>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls={MOBILE_NAV_ID}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-primary transition-colors duration-150 hover:bg-muted xl:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav
          id={MOBILE_NAV_ID}
          aria-label="Principal"
          className="animate-rise-in flex flex-col gap-1 border-t border-border bg-background px-4 pb-4 pt-2 [animation-duration:250ms] xl:hidden"
        >
          {NAV_LINKS.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors duration-150 hover:bg-muted hover:text-primary"
            >
              {link.longLabel ?? link.label}
            </Link>
          ))}
          <Link
            href="/servicios"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors duration-150 hover:bg-muted hover:text-primary"
          >
            Servicios
          </Link>
          <ul className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
            {servicePages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/servicios/${page.slug}`}
                  onClick={() => setOpen(false)}
                  className="block min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors duration-150 hover:bg-muted hover:text-primary"
                >
                  {page.navLabel}
                </Link>
              </li>
            ))}
          </ul>
          {NAV_LINKS.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors duration-150 hover:bg-muted hover:text-primary"
            >
              {link.longLabel ?? link.label}
            </Link>
          ))}
          <div className="mt-2">
            <BookingCta className="w-full" onClick={() => setOpen(false)}>
              Agendar cita
            </BookingCta>
          </div>
        </nav>
      )}
    </header>
  );
}
