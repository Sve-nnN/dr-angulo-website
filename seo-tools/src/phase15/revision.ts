/**
 * La ronda unica de revision del doctor, armada desde los cuatro datasets de copy (D-09).
 *
 * POR QUE EL ORDEN NO ES POR URL. Un documento ordenado por URL obliga a leer las dieciseis
 * paginas enteras para encontrar las diez frases que de verdad necesitan formacion medica. El
 * tiempo del doctor no se gasta en las diez: se gasta en las doscientas quince que hay que
 * atravesar para llegar. Ordenado por riesgo, la revision se puede cortar donde sea y lo que
 * quedo sin leer es siempre lo menos peligroso.
 *
 * LOS CUATRO NIVELES, Y POR QUE ESTAN EN ESE ORDEN:
 *
 *   1. Lo que un paciente puede accionar solo. Cuando consultar, que no hacer, que significa un
 *      sintoma, que pastilla tomar. Si algo de esto esta mal, alguien actua mal sobre su cuerpo
 *      sin que ningun medico intervenga en el medio. Es el unico nivel donde el error del texto
 *      llega directo al paciente.
 *   2. Lo que decide una conducta medica. Cuando se opera, que se evalua, que alternativas hay.
 *      Un error aca desinforma una decision, pero la decision sigue pasando por una consulta.
 *   3. Lo descriptivo. Que es cada condicion, anatomia, terminologia. Un error es un error de
 *      contenido y no de conducta.
 *   4. Lo operativo. Pisos, seguros, precios. No lo revisa el ojo clinico: lo confirma la clinica.
 *      Va ultimo y aparte para que el doctor no gaste su turno en datos que no son suyos.
 *
 * POR QUE EL DOCUMENTO SE GENERA. Es la misma regla que el resto de la fase: la fuente de verdad
 * son los datasets y el Markdown es su vista. Una correccion escrita a mano acá se pierde en la
 * siguiente corrida, y una revision perdida es peor que una revision no hecha, porque nadie sabe
 * que falta.
 */

import { writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, REPO_ROOT, SEO_TOOLS_ROOT, destinoPermitido } from "../config.js";
import { ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { normalizar } from "./entidades.js";
import type { DatoOperativo, SeccionDeCopy } from "./model.js";
import { DATASETS_DE_COPY, archivoDePaquete, paginasDeCopy } from "./paquete.js";

const DIR_DE_LA_FASE = path.join(
  REPO_ROOT,
  ".planning",
  "workstreams",
  "seo-keywords",
  "phases",
  "15-paquete-on-page-por-url",
);

const DESTINO = path.join(DIR_DE_LA_FASE, "15-REVISION-DOCTOR.md");

/** Los cuatro niveles, con el nombre que el doctor lee y el motivo de su lugar. */
export const NIVELES = [
  {
    numero: 1,
    titulo: "Lo que un paciente puede hacer solo con lo que lee",
    porQue:
      "Cuándo consultar, qué no hacer y qué significa un síntoma. Si algo de esto está mal, " +
      "alguien actúa sobre su propio cuerpo sin que ningún médico intervenga en el medio. Es el " +
      "único nivel donde un error del texto llega directo al paciente.",
  },
  {
    numero: 2,
    titulo: "Lo que decide una conducta médica",
    porQue:
      "Cuándo se opera y cuándo no, qué se evalúa, qué alternativas hay. Un error acá desinforma " +
      "una decisión, pero esa decisión todavía pasa por una consulta.",
  },
  {
    numero: 3,
    titulo: "Lo descriptivo",
    porQue:
      "Qué es cada condición, anatomía y terminología. Un error acá es de contenido y no de " +
      "conducta: importa, y no es donde empieza la revisión.",
  },
] as const;

export type Nivel = 1 | 2 | 3;

/**
 * Titulos que suben una seccion al nivel 1 aunque su hueco del esqueleto diga otra cosa.
 *
 * Se evaluan ANTES que el hueco. "¿Qué no se debe hacer cuando tienes hernia discal?" vive en el
 * hueco de preguntas frecuentes, que es descriptivo, y sin embargo es exactamente una instruccion
 * que el paciente ejecuta sin consultar a nadie.
 */
const ACCIONABLE_SOLO: readonly RegExp[] = [
  /no se debe hacer/,
  /no debes hacer/,
  /que no hacer/,
  /se debe hacer si/,
  /peligros/,
  /que tan grave/,
  /urgencia/,
  /emergencia/,
  /medicament/,
  /pastilla/,
  /antiinflamatorio/,
  /vitamina/,
  /cuidado personal/,
  /ejercicios/,
  /desinflamar/,
  /como aliviar/,
  /como quitar/,
  /como se quita/,
  /como dormir/,
  /caminar despues/,
  /es bueno para/,
];

/**
 * Titulos que llevan una seccion al nivel 2 aunque su hueco sea descriptivo.
 *
 * Un bloque titulado "Hernia discal sin cirugia" vive en el hueco de que se atiende, que es
 * descriptivo, y sin embargo lo que discute es si hace falta operar. Eso es conducta.
 */
const DECIDE_CONDUCTA: readonly RegExp[] = [
  /sin cirugia/,
  /se opera/,
  /segunda opinion/,
  /riesgos/,
  /riesgosa/,
  /desventaja/,
  /secuela/,
  /recuperar/,
  /recuperacion/,
];

/** Huecos del esqueleto cuyo contenido decide una conducta medica. */
const HUECOS_DE_CONDUCTA = new Set([
  "cirugia",
  "diagnostico",
  "sin-operar",
  "como-es-la-consulta",
]);

/** Huecos del esqueleto que llegan directo al paciente sin pasar por una consulta. */
const HUECOS_ACCIONABLES = new Set(["cuando-consultar", "sintomas"]);

/** El hueco del esqueleto de una clave, sin el sufijo del H3. */
export function huecoDe(clave: string): string {
  return clave.split("--")[0] as string;
}

/**
 * En que nivel entra una seccion clinica. Solo mira la clave y el titulo, y por eso es estable:
 * reescribir un parrafo no mueve el bloque de lugar entre dos corridas.
 */
export function nivelDe(seccion: SeccionDeCopy): Nivel {
  const titulo = normalizar(seccion.titulo);
  if (ACCIONABLE_SOLO.some((patron) => patron.test(titulo))) return 1;
  if (DECIDE_CONDUCTA.some((patron) => patron.test(titulo))) return 2;

  const hueco = huecoDe(seccion.clave);
  if (HUECOS_ACCIONABLES.has(hueco)) return 1;
  if (HUECOS_DE_CONDUCTA.has(hueco)) return 2;
  return 3;
}

/**
 * Los bloques que las revisiones de los planes 15-05 y 15-06 marcaron como los primeros de todos.
 *
 * No se derivan: son juicio escrito, y por eso van declarados con nombre y motivo en vez de
 * inferidos con una heuristica que fingiria haberlos descubierto. Si una clave deja de existir,
 * la generacion FALLA en vez de omitir el destacado en silencio: un destacado que desaparece sin
 * avisar es una advertencia perdida.
 */
export const DESTACADOS: readonly { url: string; clave: string; motivo: string }[] = [
  {
    url: "/sedes/clinica-tezza",
    clave: "que-se-atiende--servicios-que-ofrece-clinica-padre-luis-tezza",
    motivo:
      "El texto cita el lema de la clínica. Salió de los resultados medidos en la SERP y no de " +
      "una fuente institucional directa, así que puede no ser textual. Si no es exacto, se saca: " +
      "citar mal a una clínica en la página de su propia sede es el error más barato de evitar y " +
      "el más incómodo de explicar.",
  },
  {
    url: "/sedes/consultorio-privado",
    clave: "que-se-atiende--clinica-de-la-columna-hernias-discales-sin-cirugias",
    motivo:
      "Dice dos cosas a la vez: que la mayoría de las hernias mejora sin operarse, y que hay que " +
      "desconfiar de quien promete que nunca hace falta operar. Las dos son defendibles y juntas " +
      "pueden leerse como una contradicción. Su ojo decide si el equilibrio quedó donde tiene " +
      "que estar.",
  },
  {
    url: "/blog/5-sintomas-de-columna-que-no-debes-ignorar",
    clave: "sintomas--como-aliviar-el-dolor-de-la-ciatica-en-2-minutos",
    motivo:
      "La búsqueda promete alivio en dos minutos. El texto responde sin prometerlo, y ahí está " +
      "el riesgo: hay que confirmar que la respuesta no termine sonando a que el alivio rápido " +
      "existe y es cuestión de encontrar el ejercicio correcto.",
  },
  {
    url: "/blog/5-sintomas-de-columna-que-no-debes-ignorar",
    clave: "sintomas--como-quitar-el-dolor-de-ciatica-en-3-minutos",
    motivo: "Mismo caso que el anterior, con la promesa de tres minutos.",
  },
  {
    url: "/blog/5-sintomas-de-columna-que-no-debes-ignorar",
    clave: "sintomas--como-quitar-el-dolor-de-ciatica-rapido",
    motivo: "Mismo caso, con la promesa de rapidez sin cifra.",
  },
  {
    url: "/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber",
    clave: "cirugia--que-tan-riesgosa-es-una-operacion-en-la-columna",
    motivo:
      "Enumera complicaciones sin ponerles probabilidad, porque ninguna cifra de este sitio está " +
      "verificada (D-10). Una lista de complicaciones sin frecuencia puede asustar más que la " +
      "cirugía. Si hay un rango que usted pueda sostener, entra acá.",
  },
];

// ---------------------------------------------------------------------------
// Armado
// ---------------------------------------------------------------------------

type PaginaDeCopy = ReturnType<typeof paginasDeCopy>[number];

export interface BloqueDeRevision {
  readonly url: string;
  readonly archivo: string;
  readonly seccion: SeccionDeCopy;
  readonly nivel: Nivel;
}

export interface PendienteOperativo {
  readonly url: string;
  readonly dato: DatoOperativo;
}

export interface RondaDeRevision {
  readonly bloques: readonly BloqueDeRevision[];
  readonly pendientes: readonly PendienteOperativo[];
  readonly paginas: number;
}

/** Las paginas de los cuatro datasets, en el orden en que los planes las escribieron. */
export function todasLasPaginas(): PaginaDeCopy[] {
  return DATASETS_DE_COPY.flatMap((relativa) =>
    paginasDeCopy(path.join(SEO_TOOLS_ROOT, relativa)),
  );
}

export function armarRonda(paginas: readonly PaginaDeCopy[]): RondaDeRevision {
  const bloques: BloqueDeRevision[] = [];
  const pendientes: PendienteOperativo[] = [];

  for (const pagina of paginas) {
    for (const seccion of pagina.secciones) {
      if (seccion.tipo !== "clinico") continue;
      bloques.push({
        url: pagina.url,
        archivo: archivoDePaquete(pagina.url),
        seccion,
        nivel: nivelDe(seccion),
      });
    }
    for (const dato of pagina.datosOperativos ?? []) {
      if (dato.estado === "pendiente") pendientes.push({ url: pagina.url, dato });
    }
  }

  return { bloques, pendientes, paginas: paginas.length };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function casilla(): string[] {
  return [
    "- [ ] Aprobado tal como está.",
    "- [ ] Corregir. Qué cambia:",
    "",
  ];
}

function bloqueEnMarkdown(bloque: BloqueDeRevision, numero: number): string[] {
  const { seccion } = bloque;
  const lineas: string[] = [
    `#### ${numero}. ${seccion.titulo}`,
    "",
    `\`${bloque.url}\` · sección \`${seccion.clave}\` · [\`paquetes/${bloque.archivo}\`]` +
      `(paquetes/${bloque.archivo})`,
    "",
  ];

  for (const parrafo of seccion.parrafos) {
    lineas.push(`> ${parrafo}`);
    lineas.push(">");
  }
  if (lineas[lineas.length - 1] === ">") lineas.pop();
  lineas.push("");

  const conCifra = seccion.afirmaciones.filter((a) => /\d/.test(a.texto));
  if (conCifra.length > 0) {
    lineas.push("Cifras que este bloque declara, con la fuente que trae:");
    lineas.push("");
    for (const afirmacion of conCifra) {
      lineas.push(`- ${afirmacion.texto} — ${afirmacion.fuente}`);
    }
    lineas.push("");
  }

  lineas.push(...casilla());
  return lineas;
}

export function renderRevision(ronda: RondaDeRevision): string {
  const porClave = new Map(
    ronda.bloques.map((b) => [`${b.url}|${b.seccion.clave}`, b] as const),
  );

  const lineas: string[] = [
    "# Revisión del doctor: la ronda completa del paquete on-page",
    "",
    "<!-- Generado por seo-tools/src/phase15/revision.ts desde los cuatro datasets de copy.",
    "     No se edita a mano: se regenera. Las correcciones van por escrito aparte. -->",
    "",
    `**Qué es:** los ${ronda.bloques.length} bloques clínicos de las ${ronda.paginas} páginas que ` +
      "la fase 15 redactó,",
    "reunidos en una sola ronda.",
    "**Por qué en un solo documento:** su tiempo no se fragmenta en dieciséis consultas (D-09).",
    "**Qué bloquea:** ninguna línea de texto clínico se publica sin su visto bueno por escrito",
    "(D-08). La fase 8 de v1.1 no arranca sin esto.",
    "",
    "## Cómo está ordenado, y por qué no por página",
    "",
    "Los bloques no van por URL. Van por lo que puede pasar si el texto está mal:",
    "",
    ...NIVELES.map((n) => `${n.numero}. **${n.titulo}.** ${n.porQue}`),
    "4. **Lo operativo.** Pisos, seguros y precios. Eso no lo revisa su ojo clínico: lo confirma",
    "   la clínica. Va al final y aparte para que no le gaste el turno.",
    "",
    "Ordenado así, la revisión se puede cortar en cualquier punto y lo que quede sin leer siempre",
    "es lo menos peligroso. Cada bloque trae su URL, su sección y el archivo donde vive, así que",
    "una corrección se puede ubicar sin abrir los veinticuatro documentos.",
    "",
    "Debajo de cada bloque hay dos casillas. Marcar una es la revisión: no hace falta reescribir",
    "nada que esté bien.",
    "",
    "## Lo que conviene mirar antes que todo",
    "",
    "Seis bloques que las revisiones anteriores dejaron señalados. Si solo tiene tiempo para una",
    "parte, es esta.",
    "",
  ];

  DESTACADOS.forEach((destacado, i) => {
    const bloque = porClave.get(`${destacado.url}|${destacado.clave}`);
    lineas.push(`### D${i + 1}. \`${destacado.url}\` · \`${destacado.clave}\``);
    lineas.push("");
    lineas.push(destacado.motivo);
    lineas.push("");
    if (bloque === undefined) {
      // Un bloque clinico destacado que no esta en la ronda se busca en su dataset igual: puede
      // ser una seccion operativa, como el lema de una clinica.
      lineas.push(`Está en [\`paquetes/${archivoDePaquete(destacado.url)}\`]` +
        `(paquetes/${archivoDePaquete(destacado.url)}), en esa sección.`);
      lineas.push("");
    } else {
      lineas.push(`Va completo abajo, en el nivel ${bloque.nivel}.`);
      lineas.push("");
    }
  });

  let numero = 0;
  for (const nivel of NIVELES) {
    const delNivel = ronda.bloques.filter((b) => b.nivel === nivel.numero);
    lineas.push(`## Nivel ${nivel.numero}. ${nivel.titulo}`);
    lineas.push("");
    lineas.push(`${delNivel.length} bloques. ${nivel.porQue}`);
    lineas.push("");
    for (const bloque of delNivel) {
      numero += 1;
      lineas.push(...bloqueEnMarkdown(bloque, numero));
    }
  }

  lineas.push("## Nivel 4. Lo operativo, que confirma la clínica y no el ojo clínico");
  lineas.push("");
  lineas.push(
    `${ronda.pendientes.length} datos de sede que ninguna fuente publicada del sitio respalda. No`,
    "se compusieron a propósito: una dirección, un piso o un horario inventado manda a un paciente",
    "a un lugar equivocado, que es el daño más concreto que puede hacer esta fase. v1.1 no publica",
    "la página de esa sede hasta resolverlos, sea confirmándolos o sacando la afirmación.",
  );
  lineas.push("");
  lineas.push("| # | Sede | Dato | Quién lo confirma |");
  lineas.push("| --- | --- | --- | --- |");
  ronda.pendientes.forEach((p, i) => {
    lineas.push(`| ${i + 1} | \`${p.url}\` | ${p.dato.dato} | ${p.dato.fuente} |`);
  });
  lineas.push("");
  lineas.push(
    "Los precios de consulta que aparecen en esta lista quedaron en blanco por decisión del",
    "proyecto y no por falta de dato (D-10): el sitio no publica precios. La página explica de qué",
    "depende el costo y remite a la central de citas.",
  );
  lineas.push("");

  lineas.push("## Cómo devolver esto");
  lineas.push("");
  lineas.push(
    "Marcando las casillas alcanza. Para lo que haya que corregir, con escribir el reemplazo",
    "debajo de su bloque es suficiente: quien implemente lo transcribe al dataset y el documento",
    "se regenera. No hace falta tocar ningún archivo del proyecto.",
    "",
    "Un bloque sin casilla marcada se lee como no revisado, no como aprobado. Esa es la diferencia",
    "que hace que el sello signifique algo.",
  );
  lineas.push("");

  return `${lineas.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase15/revision.ts
//
// COSTE DE CUOTA: CERO. Lee cuatro JSON del repositorio y no tiene forma de salir a la red.

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const salida = texto(banderas, "out");
  // El relativo sigue resolviendose contra la raiz del repositorio, que es como se venia
  // tipeando, pero el resultado tiene que caer dentro de las dos carpetas donde esta fase
  // escribe. `--out src/app/page.tsx` resolvia y escribia adentro del arbol de la aplicacion.
  const destino =
    salida === undefined
      ? DESTINO
      : destinoPermitido(path.resolve(REPO_ROOT, salida), DIR_DE_LA_FASE, SEO_TOOLS_ROOT);

  const paginas = todasLasPaginas();
  const ronda = armarRonda(paginas);

  const claves = new Set(ronda.bloques.map((b) => `${b.url}|${b.seccion.clave}`));
  const conSeccion = new Set(
    paginas.flatMap((p) => p.secciones.map((s) => `${p.url}|${s.clave}`)),
  );
  const perdidos = DESTACADOS.filter((d) => !conSeccion.has(`${d.url}|${d.clave}`));
  if (perdidos.length > 0) {
    throw new CliError(
      `${perdidos.length} bloque(s) destacado(s) ya no existen en los datasets: ` +
        `${perdidos.map((d) => `${d.url} ${d.clave}`).join("; ")}.\n` +
        `  La generacion se detiene: un destacado que desaparece sin avisar es una advertencia ` +
        `perdida.\n` +
        `  Accion: actualizar DESTACADOS en src/phase15/revision.ts con la clave nueva.`,
    );
  }

  writeFileSync(destino, renderRevision(ronda), "utf8");

  const out = process.stdout;
  out.write(`Ronda de revision de ${ronda.paginas} paginas\n`);
  for (const nivel of NIVELES) {
    const cuantos = ronda.bloques.filter((b) => b.nivel === nivel.numero).length;
    out.write(`  nivel ${nivel.numero}: ${String(cuantos).padStart(3)} bloque(s)\n`);
  }
  out.write(`  operativos pendientes: ${ronda.pendientes.length}\n`);
  out.write(`  bloques clinicos:      ${claves.size}\n`);
  out.write(`\nEscrito: ${destino}\n`);
  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("revision.ts")) {
  ejecutar(main);
}
