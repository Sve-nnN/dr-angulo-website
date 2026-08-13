import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import {
  ContentBody,
  ContentBodyBoundary,
} from "@/components/content/content-body";
import { hubServicios, hubServiciosH1 } from "@/content/static-pages/hub-servicios";
import { ServiceCard } from "@/components/services/service-card";
import { serviceCategories, procedureApproaches } from "@/content/services";
import { servicePages } from "@/content/service-pages";
import { BreadcrumbJsonLd, ServicesJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: { absolute: "Cirujano de columna en Lima: qué trata el doctor" },
  description:
    "Hernia discal, estenosis, escoliosis y ortopedia infantil. Qué atiende el Dr. Juan Carlos Angulo y en qué sede de Lima.",
  alternates: { canonical: "/servicios" },
};

export default function ServiciosPage() {
  return (
    <>
      <ServicesJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Servicios", path: "/servicios" }]} />
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        {hubServiciosH1}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-foreground/70">
        Cada consulta empieza con una evaluación a fondo. El tratamiento se
        decide según tu caso específico: no todas las condiciones necesitan
        cirugía.
      </p>

      {/* Va arriba de la lista de categorías porque las URLs hijas son el
          motivo de existir del silo: enterrarlas al pie las volvería
          invisibles. Los `id` de sección de abajo no se tocan, la home enlaza
          a `#columna`, `#traumatologia`, `#ortopedia-infantil` y
          `#procedimientos`. */}
      <section className="mt-14">
        <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
          Condiciones que explico en detalle
        </h2>
        <div className="mt-6 grid items-stretch gap-6 sm:grid-cols-2">
          {servicePages.map((page) => (
            <ServiceCard key={page.slug} page={page} />
          ))}
        </div>
      </section>

      {/* Cuerpo aprobado del hub. Va después de la rejilla, que es la razón de
          ser de esta página, y antes del catálogo heredado, que es el detalle.
          El límite de la puerta abarca solo esta prosa. */}
      <ContentBodyBoundary as="section" className="mt-16">
        <ContentBody sections={hubServicios.sections} flushFirstSection />

        {hubServicios.outboundLinks && hubServicios.outboundLinks.length > 0 && (
          <section className="mt-14 border-t border-border pt-10">
            <p className="font-heading text-lg font-bold text-foreground">
              Sigue leyendo
            </p>
            <ul className="mt-3">
              {hubServicios.outboundLinks.map((link) => (
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

      <div className="mt-14 divide-y divide-border border-y border-border">
        {serviceCategories.map((cat) => (
          <section key={cat.slug} id={cat.slug} className="scroll-mt-28 py-10">
            <h2 className="font-heading text-xl font-bold text-primary sm:text-2xl">
              {cat.name}
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/80">{cat.description}</p>
            <ul className="mt-6 grid gap-x-10 gap-y-2 sm:grid-cols-2">
              {cat.conditions.map((c) => (
                <li
                  key={c}
                  className="border-l border-border pl-4 text-sm text-foreground/80"
                >
                  {c}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section id="procedimientos" className="mt-20 scroll-mt-28">
        <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
          Cómo se opera: de lo convencional a lo mínimamente invasivo
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-foreground/70">
          La técnica se elige según el diagnóstico, no al revés. En consulta te
          explico qué opción corresponde a tu caso, qué implica cada una y cómo
          es la recuperación.
        </p>

        <figure className="mt-10">
          <Image
            src="/dr-angulo-quirofano-arco-c.avif"
            alt="El Dr. Angulo en quirófano durante una cirugía de columna, con el arco en C y las resonancias del paciente en el negatoscopio"
            width={1280}
            height={853}
            sizes="(min-width: 896px) 896px, 100vw"
            className="w-full rounded-2xl object-cover shadow-sm"
          />
          <figcaption className="mt-3 text-sm text-foreground/70">
            Cirugía guiada por imágenes: el arco en C permite verificar la
            posición de cada implante durante la operación.
          </figcaption>
        </figure>

        <div className="mt-12 space-y-12">
          {procedureApproaches.map((p) => (
            <article
              key={p.slug}
              className="grid gap-6 border-t border-border pt-8 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-10"
            >
              <Image
                src={p.image.src}
                alt={p.image.alt}
                width={p.image.width}
                height={p.image.height}
                sizes="(min-width: 640px) 240px, 100vw"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm"
              />
              <div>
                <h3 className="font-heading text-lg font-bold text-primary">
                  {p.name}
                </h3>
                <p className="mt-2 text-foreground/80">{p.description}</p>
                <p className="mt-3 text-sm text-foreground/70">
                  {p.examples.join(" · ")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 border-t border-border pt-12">
        <h2 className="font-heading text-xl font-bold text-primary sm:text-2xl">
          ¿No estás seguro de qué necesitas?
        </h2>
        <p className="mt-3 max-w-xl text-lg text-foreground/70">
          Cuéntame tu caso por WhatsApp y te indico los siguientes pasos.
        </p>
        <div className="mt-6">
          <WhatsAppCta location="services" variant="accent">
            Escribir por WhatsApp
          </WhatsAppCta>
        </div>
      </section>
    </div>
    </>
  );
}
