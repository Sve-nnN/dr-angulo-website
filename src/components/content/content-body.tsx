import { Fragment, type ReactNode } from "react";
import { ConsultAlert } from "@/components/ui/consult-alert";
import { ServiceItemGrid } from "@/components/ui/service-item-grid";
import type { ServiceSection } from "@/content/service-pages";

/**
 * Cuerpo largo del sitio: guías de servicio, posts, inicio y hub renderizan su
 * prosa con este componente. La regla de anclas, jerarquía y foco se escribe
 * una sola vez, así que un cambio en el contrato de accesibilidad no hay que
 * ir a repetirlo en cuatro plantillas con el riesgo de que una quede atrás.
 */

/**
 * Sección de contenido. Es el mismo modelo plano de las guías: el nivel 3 no
 * cuelga de una propiedad anidada, va como otro elemento del arreglo justo
 * detrás de su nivel 2. `BlogSection` encaja acá sin conversión.
 */
export type ContentSection = ServiceSection;

/** Una sección sin párrafos ni tarjetas no se renderiza ni entra en el índice. */
function hasContent(section: ContentSection) {
  return section.paragraphs.length > 0 || (section.items?.length ?? 0) > 0;
}

/**
 * Un h2 con las secciones de nivel 3 que le siguen. Agrupar antes de
 * renderizar es lo que evita que un h3 abra su propio `<section>` y quede
 * como hermano de su h2 en vez de colgar de él.
 */
export type ContentSectionGroup = {
  section: ContentSection;
  children: ContentSection[];
};

export function groupSections(sections: ContentSection[]): ContentSectionGroup[] {
  const groups: ContentSectionGroup[] = [];
  for (const section of sections) {
    if (section.level === 3) {
      if (hasContent(section) && groups.length > 0) {
        groups[groups.length - 1].children.push(section);
      }
      continue;
    }
    groups.push({ section, children: [] });
  }
  // Una sección de nivel 2 sin cuerpo propio se conserva si tiene hijas:
  // "Preguntas frecuentes" no tiene párrafos y es solo el techo de sus
  // preguntas. Si se filtrara por cuerpo propio, sus h3 quedarían colgando de
  // la sección anterior y el índice perdería la entrada.
  return groups.filter(
    (group) => hasContent(group.section) || group.children.length > 0
  );
}

/**
 * Cada sección tiene su propio tratamiento visual: alerta para "cuándo
 * consultar", tarjetas para síntomas y complicaciones, pasos numerados para
 * diagnóstico y recuperación. Es lo que separa una página de servicio de un
 * post de blog con el mismo contenido.
 */
function SectionBody({
  section,
  consultAlertSectionId,
}: {
  section: ContentSection;
  consultAlertSectionId?: string;
}) {
  if (consultAlertSectionId && section.id === consultAlertSectionId) {
    return <ConsultAlert paragraphs={section.paragraphs} />;
  }

  const stepVariant =
    section.id === "diagnostico" || section.id === "recuperacion";

  return (
    <>
      {section.paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className={
            section.level === 3
              ? "mt-3 text-lg text-foreground/80"
              : "mt-5 text-lg text-foreground/80"
          }
        >
          {paragraph}
        </p>
      ))}
      {section.items && (
        <ServiceItemGrid
          items={section.items}
          variant={stepVariant ? "steps" : "grid"}
        />
      )}
    </>
  );
}

type ContentBodyBoundaryProps = {
  /** Etiqueta del envoltorio. El límite lo fija cada plantilla. */
  as?: "div" | "article" | "section";
  className?: string;
  children: ReactNode;
};

/**
 * Límite que mide la puerta de contenido (`scripts/check-content.mjs`). Vive
 * acá y no en cada plantilla para que las cuatro superficies queden marcadas
 * con el mismo atributo y la puerta las inspeccione igual.
 *
 * Qué entra en el límite lo decide cada plantilla: en las guías envuelve la
 * banda de cabecera y el artículo, porque el h1 y el enlace al hub viven
 * arriba y la puerta los cuenta; en el inicio envuelve solo el bloque de
 * prosa, para que los h2 de los módulos de marketing queden fuera de la
 * comprobación de esqueleto.
 */
export function ContentBodyBoundary({
  as: Tag = "div",
  className,
  children,
}: ContentBodyBoundaryProps) {
  return (
    <Tag data-content-body="" className={className}>
      {children}
    </Tag>
  );
}

type ContentBodyProps = {
  sections: ContentSection[];
  /**
   * Escala de los h2. `lg` es la de las guías y el inicio, que abren su
   * cuerpo sin nada por encima; `md` es la de los posts, cuyo h1 y entradilla
   * ya ocuparon el peso tipográfico de la parte de arriba.
   */
  headingSize?: "lg" | "md";
  /** La primera sección pega arriba: úsalo cuando el cuerpo abre el bloque. */
  flushFirstSection?: boolean;
  /** `id` de la sección que se renderiza como alerta en vez de párrafos. */
  consultAlertSectionId?: string;
  banner?: ReactNode;
  /**
   * `id` de nivel 2 o de nivel 3 detrás del cual va el banner. Con un id de
   * nivel 3 el banner queda dentro del `<section>` del padre, que es lo que
   * hace falta cuando ninguna frontera de nivel 2 cae en la ventana de POS-01.
   */
  bannerAfterSectionId?: string;
  /** Posición por defecto del banner, en índice de grupo, si no hay id. */
  bannerAfterIndex?: number;
};

export function ContentBody({
  sections,
  headingSize = "lg",
  flushFirstSection = false,
  consultAlertSectionId,
  banner,
  bannerAfterSectionId,
  bannerAfterIndex,
}: ContentBodyProps) {
  const groups = groupSections(sections);

  const declaredBannerIndex = bannerAfterSectionId
    ? groups.findIndex(({ section }) => section.id === bannerAfterSectionId)
    : -1;
  const bannerChildId =
    bannerAfterSectionId && declaredBannerIndex === -1
      ? groups
          .flatMap(({ children }) => children)
          .find((child) => child.id === bannerAfterSectionId)?.id
      : undefined;
  const bannerIndex = bannerChildId
    ? -1
    : declaredBannerIndex === -1
      ? (bannerAfterIndex ?? -1)
      : declaredBannerIndex;

  const headingClassName =
    headingSize === "md"
      ? "scroll-mt-28 font-heading text-xl font-bold text-primary sm:text-2xl"
      : "scroll-mt-28 font-heading text-2xl font-bold text-primary sm:text-3xl";
  const sectionClassName = flushFirstSection ? "mt-12 first:mt-0" : "mt-12";

  return (
    <>
      {groups.map(({ section, children }, index) => (
        <Fragment key={section.id}>
          <section className={sectionClassName}>
            <h2 id={section.id} tabIndex={-1} className={headingClassName}>
              {section.heading}
            </h2>
            <SectionBody
              section={section}
              consultAlertSectionId={consultAlertSectionId}
            />
            {children.map((child) => (
              <Fragment key={child.id}>
                <div className="mt-8">
                  <h3
                    id={child.id}
                    tabIndex={-1}
                    className="scroll-mt-28 font-heading text-lg font-bold text-primary"
                  >
                    {child.heading}
                  </h3>
                  <SectionBody
                    section={child}
                    consultAlertSectionId={consultAlertSectionId}
                  />
                </div>
                {banner && child.id === bannerChildId && banner}
              </Fragment>
            ))}
          </section>
          {banner && index === bannerIndex && banner}
        </Fragment>
      ))}
    </>
  );
}
