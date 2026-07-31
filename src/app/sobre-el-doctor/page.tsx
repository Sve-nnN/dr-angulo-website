import type { Metadata } from "next";
import Image from "next/image";
import { Award, GraduationCap, MapPin } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { education, experience, credentialsInfo } from "@/content/cv";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Dr. Juan Carlos Angulo — Trayectoria y formación en Lima",
  description:
    "Formación, experiencia y trayectoria del Dr. Juan Carlos Angulo Totesaut, traumatólogo y cirujano de columna en Lima, Perú.",
  alternates: { canonical: "/sobre-el-doctor" },
};

export default function SobreElDoctorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <Image
          src="/dr-angulo-portrait.png"
          alt={siteConfig.name}
          width={220}
          height={343}
          className="mx-auto rounded-xl object-cover shadow-md sm:mx-0 sm:shrink-0"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Sobre el doctor
          </p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            {siteConfig.name}
          </h1>
          <p className="mt-2 text-lg text-foreground/70">
            {siteConfig.specialties.join(" · ")}
          </p>

          <p className="mt-6 max-w-2xl text-foreground/80">
            Con formación en traumatología y ortopedia, el Dr. Angulo se dedica al
            diagnóstico y tratamiento de lesiones músculo-esqueléticas, con especial
            enfoque en columna vertebral y ortopedia infantil. Su enfoque prioriza
            el tratamiento conservador cuando es posible, y explica con claridad
            cada opción antes de recomendar una cirugía.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-primary">
              <Award className="size-4" aria-hidden="true" />
              CMP {credentialsInfo.cmp} · RNE {credentialsInfo.rne}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-primary">
              <MapPin className="size-4" aria-hidden="true" />
              {siteConfig.clinic.name}, {siteConfig.clinic.addressLocality}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <section>
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
            <GraduationCap className="size-5" aria-hidden="true" />
            Formación
          </h2>
          <ol className="mt-4 space-y-5 border-l-2 border-border pl-5">
            {education.map((item) => (
              <li key={item.title}>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-foreground/60">{item.place}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
            <Award className="size-5" aria-hidden="true" />
            Experiencia
          </h2>
          <ol className="mt-4 space-y-5 border-l-2 border-border pl-5">
            {experience.map((item) => (
              <li key={item.title + item.place}>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-foreground/60">
                  {item.place}
                  {item.period ? ` · ${item.period}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-14 rounded-xl border border-dashed border-border bg-muted/60 p-6 text-sm text-foreground/60">
        Esta sección se irá ampliando con más cursos, certificaciones y
        congresos a medida que el consultorio los comparta — el objetivo es
        mostrar aquí la trayectoria completa del doctor.
      </div>

      <div className="mt-10">
        <WhatsAppCta location="services" variant="accent">
          Agendar una cita
        </WhatsAppCta>
      </div>
    </div>
  );
}
