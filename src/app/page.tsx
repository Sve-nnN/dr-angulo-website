import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Award, Baby, Bone, Quote, ShieldCheck, Sparkles } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { serviceCategories } from "@/content/services";
import { faqItems } from "@/content/faq";
import { testimonials, reviewLinks } from "@/content/testimonials";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.title}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const specialtyIcons = [Bone, Baby, Sparkles];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle,white_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
              <ShieldCheck className="size-4" aria-hidden="true" />
              CMP {siteConfig.credentials.cmp} · Clínica Montefiori, La Molina
            </p>
            <h1 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Recupera tu movilidad sin miedo a la columna
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              {siteConfig.name}, traumatólogo y cirujano de columna en Lima.
              Evaluación clara, tratamiento a tu medida y, si hace falta cirugía,
              te acompaño explicando cada paso.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppCta location="hero" variant="accent" className="text-base">
                Agendar cita por WhatsApp
              </WhatsAppCta>
              <Link
                href="/servicios"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-base font-semibold text-white transition-colors duration-150 hover:bg-white/10"
              >
                Ver especialidades
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            {siteConfig.specialties.map((label, i) => {
              const Icon = specialtyIcons[i];
              return (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 rounded-xl bg-white/10 p-5 text-center backdrop-blur-sm"
                >
                  <Icon className="size-8 text-white" aria-hidden="true" />
                  <span className="text-sm font-semibold text-white">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            Especialidades
          </h2>
          <p className="mt-3 text-foreground/70">
            Atención para cada etapa: desde una torcedura o fractura hasta una
            cirugía de columna planificada con cuidado.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((cat) => (
            <div
              key={cat.slug}
              className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <h3 className="font-heading text-lg font-bold text-primary">
                {cat.name}
              </h3>
              <p className="mt-2 text-sm text-foreground/70">{cat.description}</p>
              <ul className="mt-4 space-y-1.5">
                {cat.conditions.slice(0, 4).map((c) => (
                  <li key={c} className="text-sm text-foreground/70">
                    · {c}
                  </li>
                ))}
              </ul>
              <Link
                href={`/servicios#${cat.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Ver más <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué elegirme */}
      <section className="bg-muted py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                Por qué los pacientes eligen al Dr. Angulo
              </h2>
              <p className="mt-4 text-foreground/70">
                Formación en traumatología y ortopedia, con experiencia en
                cirugía de columna en Venezuela y Perú. Consulta privada, sin
                intermediarios, con explicaciones claras antes de cualquier
                decisión.
              </p>
              <Link
                href="/sobre-el-doctor"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Conoce su trayectoria completa
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <Award className="size-6 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  Colegiatura verificada
                </p>
                <p className="text-xs text-foreground/60">
                  CMP {siteConfig.credentials.cmp} · RNE {siteConfig.credentials.rne}
                </p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <ShieldCheck className="size-6 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  Sede fija
                </p>
                <p className="text-xs text-foreground/60">
                  {siteConfig.clinic.name}, {siteConfig.clinic.addressLocality}
                </p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <Bone className="size-6 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  3 especialidades
                </p>
                <p className="text-xs text-foreground/60">
                  Trauma, columna y ortopedia infantil
                </p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <Quote className="size-6 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  Consulta directa
                </p>
                <p className="text-xs text-foreground/60">
                  Coordinación de citas por WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
          Lo que dicen sus pacientes
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="rounded-xl border border-border bg-white p-6 shadow-sm"
            >
              <Quote className="size-6 text-accent" aria-hidden="true" />
              <blockquote className="mt-3 text-foreground/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-foreground/60">
                {t.author} — vía {t.source}
              </figcaption>
            </figure>
          ))}
          <a
            href={reviewLinks.doctoralia}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center text-primary transition-colors duration-150 hover:bg-muted"
          >
            <span className="font-semibold">Ver más reseñas en Doctoralia</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="bg-muted py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-4">
            {faqItems.slice(0, 3).map((item) => (
              <div key={item.question} className="rounded-xl bg-white p-5 shadow-sm">
                <p className="font-semibold text-foreground">{item.question}</p>
                <p className="mt-2 text-sm text-foreground/70">{item.answer}</p>
              </div>
            ))}
          </div>
          <Link
            href="/preguntas-frecuentes"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Ver todas las preguntas frecuentes
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Da el primer paso hacia tu recuperación
          </h2>
          <p className="mt-3 text-white/85">
            Escríbeme por WhatsApp y agendemos tu evaluación en Clínica
            Montefiori, La Molina.
          </p>
          <div className="mt-7 flex justify-center">
            <WhatsAppCta location="hero" variant="accent" className="text-base">
              Agendar cita por WhatsApp
            </WhatsAppCta>
          </div>
        </div>
      </section>
    </>
  );
}
