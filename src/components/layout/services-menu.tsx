"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { servicePages } from "@/content/service-pages";

/**
 * Megamenú de "Servicios" en el navbar de escritorio.
 *
 * Abre con hover y con foco de teclado: un usuario de teclado tiene que
 * llegar a las cuatro páginas con solo Tab, sin depender del mouse. Escape
 * cierra y devuelve el foco al disparador. Un retraso al salir con el mouse
 * evita que el panel se cierre al cruzar en diagonal desde el disparador.
 */
export function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Si el foco sale del todo del contenedor (disparador + panel), cierra.
  const onBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && containerRef.current?.contains(next)) return;
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      onBlurCapture={onBlurCapture}
    >
      <Link
        ref={triggerRef}
        href="/servicios"
        aria-expanded={open}
        aria-controls="menu-servicios"
        onFocus={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-foreground/80 transition-colors duration-150 hover:text-primary"
      >
        Servicios
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-150",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </Link>

      {open && (
        <div
          id="menu-servicios"
          role="menu"
          aria-label="Páginas de servicio"
          className="absolute left-1/2 top-full z-50 mt-3 w-[26rem] -translate-x-1/2 rounded-2xl border border-border bg-background p-3 shadow-lg"
        >
          <ul className="grid grid-cols-2 gap-1">
            {servicePages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/servicios/${page.slug}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted hover:text-primary"
                >
                  {page.navLabel}
                  <span className="mt-0.5 block text-xs font-normal text-foreground/60">
                    {page.cardSummary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/servicios"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-2 block min-h-11 rounded-lg border-t border-border px-3 py-2.5 pt-4 text-sm font-semibold text-primary-dark hover:underline"
          >
            Ver todas las especialidades
          </Link>
        </div>
      )}
    </div>
  );
}
