import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookingCta } from "@/components/ui/booking-cta";
import { education, experience, training, credentialsInfo } from "@/content/cv";
import { siteConfig } from "@/lib/site-config";
import { BreadcrumbJsonLd, ProfilePageJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: { absolute: "Sobre el Dr. Juan Carlos Angulo Totesaut" },
  description:
    "Formación, forma de trabajo y sedes donde atiende el Dr. Juan Carlos Angulo Totesaut, médico de columna en Lima.",
  alternates: { canonical: "/sobre-el-doctor" },
  openGraph: {
    title: "Sobre el Dr. Juan Carlos Angulo Totesaut",
    description:
      "Formación, forma de trabajo y sedes donde atiende el Dr. Juan Carlos Angulo Totesaut, médico de columna en Lima.",
    url: "/sobre-el-doctor",
  },
};

export default function SobreElDoctorPage() {
  return (
    <>
      <ProfilePageJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Sobre el doctor", path: "/sobre-el-doctor" }]} />
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start">
        <Image
          src="/dr-angulo-implante-disco.avif"
          alt={`${siteConfig.name} en su consultorio, sosteniendo un modelo de disco intervertebral con implante`}
          width={933}
          height={1400}
          priority
          sizes="(min-width: 640px) 260px, 220px"
          className="mx-auto w-[220px] rounded-2xl object-cover shadow-md sm:mx-0 sm:w-[260px] sm:shrink-0"
        />
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            {siteConfig.name}
          </h1>
          <p className="mt-3 text-lg text-foreground/70">
            {siteConfig.specialties.join(" · ")}
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            {credentialsInfo.yearsOfExperience} años de ejercicio · CMP{" "}
            {credentialsInfo.cmp} · RNE {credentialsInfo.rne} ·{" "}
            {siteConfig.office.name}, {siteConfig.office.addressLocality}
          </p>
          <a
            href={credentialsInfo.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-sm text-foreground/70 underline underline-offset-2 transition-colors duration-150 hover:text-primary"
          >
            Verifica la colegiatura en el registro del Colegio Médico del Perú
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>

          <div className="mt-8 max-w-2xl space-y-4 text-lg text-foreground/80">
            <p>
              Son 15 años atendiendo pacientes. Me formé como traumatólogo en la
              Universidad de Oriente y me especialicé en columna en el Instituto
              de Columna de Caracas, dentro del Hospital de Clínicas Caracas. A
              eso le sumo entrenamientos en Estados Unidos, Francia y Argentina,
              y los cursos AO de columna en Caracas.
            </p>
            <p>
              Trato deformidades como la escoliosis, enfermedades degenerativas
              de la columna y procesos inflamatorios, con opciones que van desde
              la cirugía convencional hasta técnicas mínimamente invasivas. Antes
              de plantear una operación, agoto lo que se puede resolver sin ella
              y explico cada alternativa con claridad, para que la decisión la
              tomemos juntos.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-12 border-t border-border pt-12 sm:grid-cols-2 sm:gap-16">
        <section>
          <h2 className="font-heading text-xl font-bold text-primary">
            Formación
          </h2>
          <ol className="mt-5 space-y-5">
            {education.map((item) => (
              <li key={item.title} className="border-l border-border pl-4">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-sm text-foreground/70">
                  {item.place}
                  {item.period ? ` · ${item.period}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-primary">
            Experiencia
          </h2>
          <ol className="mt-5 space-y-5">
            {experience.map((item) => (
              <li
                key={item.title + item.place}
                className="border-l border-border pl-4"
              >
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-sm text-foreground/70">
                  {item.place}
                  {item.period ? ` · ${item.period}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-16 border-t border-border pt-12">
        <h2 className="font-heading text-xl font-bold text-primary">
          Cursos, congresos y entrenamientos
        </h2>
        <p className="mt-3 max-w-2xl text-foreground/70">
          {credentialsInfo.internationalTrainings} de estos entrenamientos se
          hicieron fuera del país, con los fabricantes de los propios implantes
          de columna.
        </p>
        <ol className="mt-6 divide-y divide-border border-y border-border">
          {training.map((item) => (
            <li
              key={item.title + item.year}
              className="grid gap-1 py-4 sm:grid-cols-[5rem_1fr] sm:gap-6"
            >
              <p className="text-sm font-semibold text-primary">{item.year}</p>
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-sm text-foreground/70">
                  {item.place}
                  {item.international ? " · Internacional" : ""}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid items-center gap-10 border-t border-border pt-12 lg:grid-cols-[300px_1fr] lg:gap-14">
        <Image
          src="/dr-angulo-fluoroscopia.avif"
          alt="El Dr. Angulo opera guiándose por las imágenes de fluoroscopia del monitor de quirófano"
          width={720}
          height={1280}
          sizes="(min-width: 1024px) 300px, 100vw"
          className="aspect-[4/3] w-full rounded-2xl object-cover object-[45%_20%] shadow-sm lg:aspect-[4/5]"
        />
        <div>
          <h2 className="font-heading text-xl font-bold text-primary sm:text-2xl">
            Por qué insisto con la formación continua
          </h2>
          <p className="mt-4 text-lg text-foreground/80">
            Es lo que permite operar hoy con implantes y técnicas que hace unos
            años no existían. Cada caso se planifica con estudios de imagen
            propios y se elige el abordaje menos agresivo que resuelva el
            problema de fondo.
          </p>
          <Link
            href="/servicios#procedimientos"
            className="mt-5 inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
          >
            Ver cirugía convencional y mínimamente invasiva
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="mt-12">
        <BookingCta>Ver sedes y agendar</BookingCta>
      </div>

      <section className="mt-14 border-t border-border pt-10">
        <p className="font-heading text-lg font-bold text-foreground">
          Sigue leyendo
        </p>
        <ul className="mt-3">
          <li>
            <Link
              href="/"
              className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
            >
              traumatología especialista en columna
            </Link>
          </li>
          <li>
            <Link
              href="/sedes"
              className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
            >
              Sedes donde atiende el Dr. Juan Carlos Angulo en Lima
            </Link>
          </li>
          <li>
            <Link
              href="/testimonios"
              className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
            >
              Testimonios de pacientes
            </Link>
          </li>
        </ul>
      </section>
    </div>
    </>
  );
}
