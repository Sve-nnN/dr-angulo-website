/**
 * Title, meta y H1 de una URL, con el contrato que v1.1 ya verifica del otro lado (D-13).
 *
 * POR QUE ESTO VALIDA Y NO GENERA. Un title lo escribe alguien: es la unica linea del paquete
 * que el paciente lee antes de entrar y decide si entra. Generarlo por plantilla daria
 * dieciseis variantes de la misma frase, que es justo lo que la auditoria de duplicados del
 * plan 15-07 va a marcar. Lo que si tiene que ser mecanico es el limite: 60 y 155 no son gusto
 * sino el rango que la fase 10 de v1.1 comprueba, y entregar fuera de rango obliga a
 * reescribirlo alla, que es el trabajo duplicado que esta fase existe para evitar.
 *
 * LA COMPROBACION DE "AL FRENTE" ES POR TOKENS Y SIN TILDES. En espanol la keyword se parte
 * con preposiciones al escribirla natural: "cirugia de columna" cabe en un title como "cirugia
 * minimamente invasiva de columna" y sigue sirviendo la misma keyword. Exigir la cadena literal
 * obligaria a escribir titles que suenan a keyword y no a frase.
 */

import { normalizar, tokenizar } from "./entidades.js";
import { PaqueteInvalido } from "./model.js";

/** Contrato con la fase 10 de v1.1. Google corta mas alla y el snippet sale mutilado. */
export const LARGO_DE_TITLE = 60;
export const LARGO_DE_META = 155;

/**
 * Cuantos caracteres puede haber antes de la primera palabra de la primaria.
 *
 * Doce da para un prefijo corto de marca o de lugar y no para una frase entera delante. Mas
 * que eso empuja la keyword fuera de lo que el ojo lee primero en un resultado.
 */
export const FRENTE_DE_TITLE = 12;

export interface EntradaDeMetadatos {
  readonly url: string;
  readonly keywordPrimaria: string;
  readonly title: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly h1Origen: string;
}

export interface Metadatos {
  readonly title: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly h1Origen: string;
  readonly largoDeTitle: number;
  readonly largoDeMeta: number;
  readonly tokensDeLaPrimaria: readonly string[];
  /** Caracter donde arranca la primera palabra de la primaria dentro del title. */
  readonly primeraTokenEn: number;
}

/** Posicion de una palabra completa dentro de un texto ya normalizado. -1 si no esta. */
function posicionDePalabra(textoNormal: string, palabra: string): number {
  const encontrado = new RegExp(`(?:^|[^a-z0-9])(${palabra})(?![a-z0-9])`).exec(textoNormal);
  return encontrado === null ? -1 : encontrado.index + encontrado[0].length - palabra.length;
}

/**
 * Devuelve el title, la meta y el H1 de una URL, o falla nombrando que se rompio.
 *
 * Falla ruidoso a proposito: un title de 74 caracteres se publica igual y Google lo corta, asi
 * que nadie se entera hasta que el snippet ya salio mal en la SERP.
 */
export function tituloYMeta(entrada: EntradaDeMetadatos): Metadatos {
  const title = entrada.title.trim();
  const metaDescription = entrada.metaDescription.trim();
  const h1 = entrada.h1.trim();

  if (title === "" || metaDescription === "" || h1 === "") {
    throw new PaqueteInvalido(
      `${entrada.url}: title, metaDescription y h1 son obligatorios y alguno vino vacio.\n` +
        `  Accion: escribirlos en data/copy-guias.json. Un blanco se lee como olvido.`,
    );
  }

  if (title.length > LARGO_DE_TITLE) {
    throw new PaqueteInvalido(
      `${entrada.url}: el title mide ${title.length} caracteres y el limite es ` +
        `${LARGO_DE_TITLE} (D-13). Sobran ${title.length - LARGO_DE_TITLE}.\n` +
        `  Title: "${title}"`,
    );
  }

  if (metaDescription.length > LARGO_DE_META) {
    throw new PaqueteInvalido(
      `${entrada.url}: la meta description mide ${metaDescription.length} caracteres y el ` +
        `limite es ${LARGO_DE_META} (D-13). Sobran ${metaDescription.length - LARGO_DE_META}.`,
    );
  }

  const tokensDeLaPrimaria = tokenizar(entrada.keywordPrimaria);
  const titleNormal = normalizar(title);

  const ausentes = tokensDeLaPrimaria.filter((t) => posicionDePalabra(titleNormal, t) === -1);
  if (ausentes.length > 0) {
    throw new PaqueteInvalido(
      `${entrada.url}: el title no nombra ${ausentes.map((a) => `"${a}"`).join(", ")}, que es ` +
        `parte de la keyword primaria "${entrada.keywordPrimaria}".\n` +
        `  Title: "${title}"`,
    );
  }

  const primeraTokenEn = posicionDePalabra(titleNormal, tokensDeLaPrimaria[0] as string);
  if (primeraTokenEn > FRENTE_DE_TITLE) {
    throw new PaqueteInvalido(
      `${entrada.url}: la keyword primaria arranca en el caracter ${primeraTokenEn} del title ` +
        `y el maximo es ${FRENTE_DE_TITLE}. Delante hay una frase entera.\n` +
        `  Title: "${title}"`,
    );
  }

  return {
    title,
    metaDescription,
    h1,
    h1Origen: entrada.h1Origen.trim(),
    largoDeTitle: title.length,
    largoDeMeta: metaDescription.length,
    tokensDeLaPrimaria,
    primeraTokenEn,
  };
}
