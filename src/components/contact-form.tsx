"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, MessageCircle } from "lucide-react";
import { submitContactForm, type ContactState } from "@/app/actions/contact";
import { trackFormSubmit } from "@/lib/tracking";
import { whatsappUrl } from "@/lib/site-config";

const initialState: ContactState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-on-primary transition-colors duration-150 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60 sm:w-auto"
    >
      {pending && (
        <Loader2
          className="size-5 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {pending ? "Enviando…" : "Enviar mensaje"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const trackedRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success" && !trackedRef.current) {
      trackedRef.current = true;
      trackFormSubmit("email");
      // El formulario desaparece: el foco tiene que aterrizar en la confirmación.
      successRef.current?.focus();
    }
    if (state.status !== "success") {
      trackedRef.current = false;
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="animate-rise-in rounded-xl border border-border bg-white p-6 text-center shadow-sm"
      >
        <p className="font-heading text-lg font-bold text-primary">
          ¡Mensaje recibido!
        </p>
        <p className="mt-2 text-foreground/70">
          Te contactaremos a la brevedad. Si prefieres una respuesta más
          rápida, continúa la conversación por WhatsApp:
        </p>
        <a
          href={whatsappUrl(state.whatsappMessage || "Hola Dr. Angulo, quisiera agendar una cita.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-foreground shadow-sm transition-[background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:bg-accent-hover hover:shadow-md motion-reduce:hover:translate-y-0"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Continuar por WhatsApp
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Honeypot anti-spam — oculto para personas, visible para bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          Nombre completo <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base placeholder:text-foreground/70 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/45"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
          Teléfono <span className="text-destructive">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+51 9XX XXX XXX"
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base placeholder:text-foreground/70 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/45"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          Correo electrónico <span className="text-foreground/70">(opcional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base placeholder:text-foreground/70 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/45"
        />
      </div>

      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-medium text-foreground">
          Motivo de tu consulta <span className="text-destructive">*</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          rows={4}
          placeholder="Cuéntame brevemente qué síntomas tienes o qué necesitas."
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base placeholder:text-foreground/70 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/45"
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
