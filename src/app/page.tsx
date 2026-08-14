import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { InstagramReelsSection } from "@/components/instagram/instagram-reels-section";
import { BookingCta } from "@/components/ui/booking-cta";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import {
  ContentBody,
  ContentBodyBoundary,
} from "@/components/content/content-body";
import { homePage } from "@/content/static-pages/home";
import { locations } from "@/content/locations";
import { serviceCategories } from "@/content/services";
import { credentialsInfo } from "@/content/cv";
import { faqItems } from "@/content/faq";
import { reviewLinks } from "@/content/testimonials";
import { siteConfig } from "@/lib/site-config";
import { GoogleReviewsSection } from "@/components/reviews/google-reviews";

export const metadata: Metadata = {
  title: { absolute: "Traumatología en Lima: Dr. Juan Carlos Angulo" },
  description:
    "Traumatólogo y cirujano de columna en Lima. Atiende en su consultorio de Surco, Ricardo Palma, Sanna La Molina y Clínica Tezza.",
  alternates: { canonical: "/" },
};

/** ISR: la página se regenera cada hora para tomar los reels nuevos. */
export const revalidate = 3600;

export default async function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-primary">
        <div
          aria-hidden="true"
          className="animate-settle-in absolute inset-0 opacity-10 [background-image:radial-gradient(circle,white_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <h1 className="animate-rise-in animate-step-1 font-heading text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Traumatólogo y cirujano de columna en Lima
            </h1>
            <p className="animate-rise-in animate-step-2 mt-5 max-w-xl text-lg text-white/85">
              {siteConfig.name}, traumatólogo y cirujano de columna en Lima.
              Escoliosis, hernia discal y desgaste de columna, con opciones que
              van desde el tratamiento conservador hasta la cirugía mínimamente
              invasiva. Si hace falta operar, te acompaño explicando cada paso.
            </p>
            <p className="animate-rise-in animate-step-3 mt-5 text-sm text-white/75">
              {credentialsInfo.yearsOfExperience} años de ejercicio · CMP{" "}
              {siteConfig.credentials.cmp} · RNE {siteConfig.credentials.rne} ·
              Atiende en {locations.length} sedes de Lima
            </p>
            <div className="animate-rise-in animate-step-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <BookingCta>Agendar cita</BookingCta>
              <Link
                href="/servicios"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-base font-semibold text-white transition-colors duration-150 hover:bg-white/10"
              >
                Ver especialidades
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <Image
            src="/dr-angulo-consulta.avif"
            alt={`${siteConfig.name} explica a una paciente un modelo de columna lumbar en su consultorio`}
            width={1129}
            height={1400}
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="animate-settle-in animate-step-2 mx-auto aspect-[4/3] w-full max-w-md rounded-2xl object-cover object-[60%_30%] shadow-lg sm:aspect-[16/10] lg:max-w-none"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="max-w-2xl font-heading text-2xl font-bold text-primary sm:text-3xl">
          Tres especialidades, un solo consultorio
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-foreground/70">
          Desde una torcedura o una fractura hasta una cirugía de columna
          planificada con estudios propios.
        </p>

        <dl className="mt-12 divide-y divide-border border-y border-border">
          {serviceCategories.map((cat) => (
            <div
              key={cat.slug}
              className="grid gap-3 py-8 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-10"
            >
              <dt className="font-heading text-lg font-bold text-primary">
                {cat.name}
              </dt>
              <dd>
                <p className="text-foreground/80">{cat.description}</p>
                <p className="mt-3 text-sm text-foreground/70">
                  {cat.conditions.slice(0, 5).join(" · ")}
                </p>
                <Link
                  href={`/servicios#${cat.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
                >
                  Qué incluye
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <figure>
          <Image
            src="/dr-angulo-quirofano-arco-c.avif"
            alt={`${siteConfig.name} operando en quirófano, con el arco en C sobre el paciente y las resonancias en el negatoscopio`}
            width={1280}
            height={853}
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="aspect-[16/9] w-full rounded-2xl object-cover shadow-md"
          />
          <figcaption className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-10">
            <p className="max-w-2xl text-lg text-foreground/70">
              En quirófano cada implante se verifica con imágenes durante la
              operación. Esa es la diferencia entre operar con precisión y
              operar a ciegas.
            </p>
            <Link
              href="/servicios#procedimientos"
              className="inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
            >
              Cómo se opera
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </figcaption>
        </figure>
      </section>

      <section className="bg-muted py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-center lg:gap-16">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              Quince años decidiendo cuándo no operar
            </h2>
            <div className="mt-5 space-y-4 text-lg text-foreground/80">
              <p>
                Me formé como traumatólogo en la Universidad de Oriente y me
                especialicé en columna en el Instituto de Columna de Caracas,
                dentro del Hospital de Clínicas Caracas. A eso le sumo cursos y
                entrenamientos dentro y fuera del país.
              </p>
              <p>
                Trato escoliosis, enfermedad degenerativa y procesos
                inflamatorios, con cirugía convencional y mínimamente invasiva.
                Antes de plantear una operación agoto lo que se puede resolver
                sin ella.
              </p>
            </div>
            <Link
              href="/sobre-el-doctor"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
            >
              Su trayectoria completa
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <Image
            src="/dr-angulo-implante-disco.avif"
            alt={`${siteConfig.name} sostiene un modelo de disco intervertebral con implante`}
            width={933}
            height={1400}
            sizes="(min-width: 1024px) 340px, 100vw"
            className="aspect-[4/3] w-full rounded-2xl object-cover object-[50%_25%] shadow-md lg:aspect-[4/5]"
          />
        </div>
      </section>

      <InstagramReelsSection
        limit={8}
        className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
      />

      <section className="border-t border-border bg-muted py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <GoogleReviewsSection title="Lo que dicen sus pacientes" limit={3} />

          <p className="mt-10 max-w-2xl text-lg text-foreground/80">
            Los pacientes operados también cuentan su recuperación en video, en
            el Instagram del doctor.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-10">
            <a
              href={reviewLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
            >
              Ver testimonios en video
              <ArrowRight className="size-4" aria-hidden="true" />
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <Link
              href="/testimonios"
              className="inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
            >
              Reseñas de pacientes
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <dl className="mt-10 divide-y divide-border border-y border-border">
          {faqItems.slice(0, 3).map((item) => (
            <div key={item.question} className="py-6">
              <dt className="font-heading text-lg font-bold text-foreground">
                {item.question}
              </dt>
              <dd className="mt-2 text-foreground/80">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <Link
          href="/preguntas-frecuentes"
          className="mt-8 inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
        >
          Ver todas las preguntas
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            Dónde atiende
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-foreground/70">
            Cuatro sedes en Lima. Su consultorio privado se agenda por WhatsApp;
            las clínicas, con la central de citas de cada una.
          </p>

          <dl className="mt-10 divide-y divide-border border-y border-border">
            {locations.map((location) => (
              <div
                key={location.slug}
                className="grid gap-2 py-6 sm:grid-cols-[minmax(0,18rem)_1fr] sm:gap-10"
              >
                <dt className="font-heading text-lg font-bold text-primary">
                  {location.name}
                </dt>
                <dd className="text-foreground/80">
                  <p>
                    {location.schedule
                      .map((block) => `${block.days}, ${block.hours}`)
                      .join(" · ")}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    {location.streetAddress}, {location.addressLocality}
                  </p>
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="/agendar"
            className="mt-8 inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
          >
            Ver horarios completos y cómo agendar en cada sede
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Cuerpo de texto del inicio. Va como último bloque antes del CTA de
          cierre: quien llegó hasta acá ya vio quién es el doctor y viene por
          el detalle. El límite de la puerta abarca solo esta prosa, así que
          los h2 de los módulos de marketing quedan fuera de la comprobación
          de esqueleto y no se confunden con secciones canónicas. */}
      <ContentBodyBoundary
        as="section"
        className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24"
      >
        <ContentBody sections={homePage.sections} flushFirstSection />

        {homePage.outboundLinks && homePage.outboundLinks.length > 0 && (
          <section className="mt-14 border-t border-border pt-10">
            <p className="font-heading text-lg font-bold text-foreground">
              Sigue leyendo
            </p>
            <ul className="mt-3">
              {homePage.outboundLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
                  >
                    {link.anchor}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </ContentBodyBoundary>

      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Cuéntame qué te duele
          </h2>
          <p className="mt-3 text-lg text-white/85">
            Elige la sede que te quede mejor y agenda por el canal de esa sede.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <BookingCta>Ver sedes y agendar</BookingCta>
            <WhatsAppCta location="hero" variant="outline-inverse">
              Consultorio privado por WhatsApp
            </WhatsAppCta>
          </div>
        </div>
      </section>
    </>
  );
}
