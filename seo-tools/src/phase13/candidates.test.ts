/**
 * Pruebas de la eleccion de cabezas de cluster (KWR-04, D-03, D-06).
 *
 * POR QUE ESTAS PRUEBAS NO SALEN A LA RED NI LEEN LA CACHE REAL. Este modulo decide en que se
 * gastan 90 busquedas de SerpApi que no se reponen hasta el 2026-08-21. Una prueba que
 * consultara la fuente para saber si una keyword esta cacheada podria, en el peor caso,
 * gastar cuota al correr la suite. El conjunto de lo ya capturado entra como parametro y las
 * pruebas lo arman a mano.
 *
 * Los volumenes, las intenciones y los alcances de las dobles salen de mediciones reales
 * sobre data/keywords.jsonl del 2026-08-11. `ortopedia viza surco` con 590,
 * `dia del traumatologo peruano` con 260 y `traumatologia peru dr jorge gomez tello` con 210
 * son las tres que el CONTEXT nombra como el caso de referencia del filtro de ruido: pasaron
 * el filtro de alcance de la fase 12 porque contienen un termino del dominio.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  cargarReglasDeCandidatas,
  seleccionarCandidatas,
  type RegistroDeKeyword,
} from "./candidates.js";
import { normalizeKeyword } from "../keywords/normalize.js";

// ---------------------------------------------------------------------------
// Dobles
// ---------------------------------------------------------------------------

interface Parcial {
  readonly keyword: string;
  readonly volumen?: number | null;
  readonly intent?: string;
  readonly alcance?: string;
  readonly motivoAlcance?: string | null;
}

/** Construye un registro con la forma exacta de una linea de keywords.jsonl. */
function kw(p: Parcial): RegistroDeKeyword {
  const volumen = p.volumen === undefined ? null : p.volumen;
  return {
    keyword: p.keyword,
    keywordKey: normalizeKeyword(p.keyword),
    capa: "dinorank",
    intent: p.intent ?? "comercial",
    stage: "tratamiento",
    alcance: p.alcance ?? "objetivo",
    motivoAlcance: p.motivoAlcance ?? null,
    metricas: {
      searchVolume: volumen,
      searchVolumeFuente: volumen === null ? "sin_datos" : "dinorank",
    },
  };
}

const REGLAS = cargarReglasDeCandidatas();

/** Las cuatro condiciones nucleo, tal como estan escritas en el dataset. */
const NUCLEO: readonly RegistroDeKeyword[] = [
  kw({ keyword: "hernia discal", intent: "informacional" }),
  kw({ keyword: "estenosis espinal", intent: "informacional" }),
  kw({ keyword: "escoliosis", intent: "informacional" }),
  kw({ keyword: "ortopedia infantil", intent: "informacional" }),
];

function seleccion(
  keywords: readonly RegistroDeKeyword[],
  opciones: Partial<Parameters<typeof seleccionarCandidatas>[1]> = {},
) {
  return seleccionarCandidatas(keywords, { reglas: REGLAS, ...opciones });
}

function claves(lista: readonly { keywordKey: string }[]): string[] {
  return lista.map((c) => c.keywordKey);
}

// ---------------------------------------------------------------------------
// Comportamiento 1: las condiciones nucleo entran por regla de negocio
// ---------------------------------------------------------------------------

test("comportamiento 1: una condicion nucleo sin volumen entra igual, por regla de negocio y no por metrica", () => {
  // Las cuatro tienen el volumen vacio porque DinoRank trunca las relacionadas en 900 y nunca
  // devuelve la keyword consultada en su propio arreglo. No es falta de demanda.
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "ortopedia surco", volumen: 210, intent: "transaccional" }),
  ]);

  for (const nucleo of ["hernia discal", "estenosis espinal", "escoliosis", "ortopedia infantil"]) {
    const entrada = resultado.candidatas.find((c) => c.keywordKey === nucleo);
    assert.ok(entrada !== undefined, `falta la condicion nucleo ${nucleo}`);
    assert.equal(entrada.rango, 1);
    assert.equal(entrada.volumen, null, "la prueba pierde sentido si la doble trae volumen");
  }
});

test("comportamiento 1b: una cabeza sin volumen se ordena por delante de una con volumen alto de rango menor valor", () => {
  const resultado = seleccion([
    kw({ keyword: "ciática: tratamientos", volumen: 590 }),
    ...NUCLEO,
  ]);

  // Un orden por volumen mandaria las cuatro condiciones centrales al final.
  assert.deepEqual(claves(resultado.candidatas).slice(0, 4).sort(), [
    "escoliosis",
    "estenosis espinal",
    "hernia discal",
    "ortopedia infantil",
  ]);
});

// ---------------------------------------------------------------------------
// Comportamiento 2: fuera de alcance nunca es cabeza
// ---------------------------------------------------------------------------

test("comportamiento 2: una keyword de marca ajena con volumen alto queda fuera y no gasta una busqueda", () => {
  // Las dos de mayor volumen de todo el universo son marca de competidores. Se leen como
  // inteligencia y jamas se persiguen (D-14).
  const resultado = seleccion([
    ...NUCLEO,
    kw({
      keyword: "clinica san bernardo especialistas en traumatologia",
      volumen: 2400,
      alcance: "fuera_de_alcance",
      motivoAlcance: "marca_ajena",
    }),
    kw({
      keyword: "clinica de traumatologia arthrosalud",
      volumen: 1600,
      alcance: "fuera_de_alcance",
      motivoAlcance: "marca_ajena",
    }),
  ]);

  const todas = [...resultado.candidatas, ...resultado.cercaDelCorte];
  for (const c of todas) {
    assert.notEqual(c.keywordKey, "clinica san bernardo especialistas en traumatologia");
    assert.notEqual(c.keywordKey, "clinica de traumatologia arthrosalud");
  }
});

test("una tienda ortopedica con volumen alto queda excluida antes de rankear, con su regla nombrada", () => {
  // Las tres del caso de referencia del CONTEXT, con sus volumenes reales del 2026-08-11.
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "ortopedia viza surco", volumen: 590, intent: "transaccional" }),
    kw({ keyword: "día del traumatólogo peruano", volumen: 260 }),
    kw({ keyword: "traumatología perú dr jorge gómez tello", volumen: 210, intent: "transaccional" }),
  ]);

  const dentro = new Set(claves(resultado.candidatas));
  assert.ok(!dentro.has("ortopedia viza surco"));
  assert.ok(!dentro.has("dia del traumatologo peruano"));
  assert.ok(!dentro.has("traumatologia peru dr jorge gomez tello"));

  // Y no desaparecen en silencio: la exclusion queda contada por regla.
  const reglas = resultado.excluidas.map((e) => e.regla);
  assert.ok(reglas.includes("tienda-ortopedica"), `reglas aplicadas: ${reglas.join(", ")}`);
  assert.ok(reglas.includes("efemeride"));
  assert.ok(reglas.includes("profesional-ajeno"));
});

// ---------------------------------------------------------------------------
// Comportamiento 3: lo ya cacheado es gratis
// ---------------------------------------------------------------------------

test("comportamiento 3: una keyword con SERP en cache entra marcada con coste cero y no consume presupuesto", () => {
  const enCache = new Set(["hernia discal", "estenosis espinal", "ortopedia infantil"]);
  const resultado = seleccion([...NUCLEO], { enCache, presupuesto: 1 });

  // El presupuesto es 1 busqueda y entran las cuatro: tres resuelven desde cache.
  assert.equal(resultado.candidatas.length, 4);
  assert.equal(resultado.resumen.enCache, 3);
  assert.equal(resultado.resumen.busquedasNuevas, 1);

  const hernia = resultado.candidatas.find((c) => c.keywordKey === "hernia discal");
  assert.equal(hernia?.enCache, true);
  const escoliosis = resultado.candidatas.find((c) => c.keywordKey === "escoliosis");
  assert.equal(escoliosis?.enCache, false);
});

// ---------------------------------------------------------------------------
// Comportamiento 4: el corte cae donde se agota el presupuesto
// ---------------------------------------------------------------------------

test("comportamiento 4: el corte cae exactamente donde se agota el presupuesto, ni antes ni despues", () => {
  const resto = Array.from({ length: 30 }, (_, i) =>
    kw({ keyword: `tratamiento de columna variante ${i}`, volumen: 500 - i }),
  );
  const resultado = seleccion([...NUCLEO, ...resto], { presupuesto: 10 });

  assert.equal(resultado.resumen.busquedasNuevas, 10);
  assert.equal(resultado.candidatas.length, 10);
  // Y el orden dentro del rango 5 es por volumen descendente.
  const rango5 = resultado.candidatas.filter((c) => c.rango === 5).map((c) => c.volumen);
  assert.deepEqual([...rango5], [...rango5].sort((a, b) => (b ?? 0) - (a ?? 0)));
});

test("comportamiento 4b: el techo de cabezas corta aunque quede presupuesto", () => {
  const resto = Array.from({ length: 40 }, (_, i) =>
    kw({ keyword: `tratamiento de columna variante ${i}`, volumen: 500 - i }),
  );
  const resultado = seleccion([...NUCLEO, ...resto], {
    presupuesto: 90,
    objetivoDeCabezas: 12,
  });

  assert.equal(resultado.candidatas.length, 12);
});

// ---------------------------------------------------------------------------
// Comportamiento 5: determinismo
// ---------------------------------------------------------------------------

test("comportamiento 5: dos corridas sobre la misma entrada producen el mismo JSON byte a byte", () => {
  const entrada = [
    ...NUCLEO,
    kw({ keyword: "ciática: tratamientos", volumen: 590 }),
    kw({ keyword: "desgarro muscular tratamiento", volumen: 590 }),
    kw({ keyword: "mejor clínica de traumatología en lima", volumen: 210, intent: "transaccional" }),
  ];

  const a = JSON.stringify(seleccion(entrada));
  const b = JSON.stringify(seleccion([...entrada].reverse()));

  assert.equal(a, b, "el orden de la entrada no puede cambiar la salida");
});

// ---------------------------------------------------------------------------
// Comportamiento 6: deduplicacion por clave normalizada
// ---------------------------------------------------------------------------

test("comportamiento 6: dos escrituras de la misma keyword con tildes distintas colapsan en una sola cabeza", () => {
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "ciática", volumen: 8100, intent: "informacional" }),
    kw({ keyword: "ciatica", volumen: 8100, intent: "informacional" }),
  ]);

  const repetidas = claves(resultado.candidatas).filter((k) => k === "ciatica");
  assert.equal(repetidas.length, 1);

  const todas = claves(resultado.candidatas);
  assert.equal(new Set(todas).size, todas.length);
});

// ---------------------------------------------------------------------------
// Comportamiento 7: las diez que quedaron justo debajo del corte
// ---------------------------------------------------------------------------

test("comportamiento 7: se retienen las diez inmediatamente debajo del corte, cada una con su motivo", () => {
  const resto = Array.from({ length: 30 }, (_, i) =>
    kw({ keyword: `tratamiento de columna variante ${i}`, volumen: 500 - i }),
  );
  const resultado = seleccion([...NUCLEO, ...resto], { presupuesto: 10 });

  assert.equal(resultado.cercaDelCorte.length, 10);
  for (const c of resultado.cercaDelCorte) {
    assert.ok(c.motivo !== undefined && c.motivo !== "", `sin motivo: ${c.keywordKey}`);
  }

  // Son las diez SIGUIENTES en el orden, no diez cualesquiera.
  const dentro = new Set(claves(resultado.candidatas));
  for (const c of resultado.cercaDelCorte) assert.ok(!dentro.has(c.keywordKey));
  assert.equal(resultado.cercaDelCorte[0]?.volumen, 494);
});

// ---------------------------------------------------------------------------
// Comportamiento 8: el ruido que sobrevive se declara
// ---------------------------------------------------------------------------

test("comportamiento 8: una candidata que huele a ruido se marca en vez de esconderse entre las demas", () => {
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "las mejores pastillas para la ciática", volumen: 390 }),
    kw({ keyword: "cual es la diferencia entre artritis y artrosis", volumen: 170 }),
  ]);

  const pastillas = resultado.candidatas.find(
    (c) => c.keywordKey === "las mejores pastillas para la ciatica",
  );
  assert.ok(pastillas !== undefined, "la candidata sospechosa tiene que entrar, no desaparecer");
  assert.equal(pastillas.posibleRuido, "farmacologico");

  const marcadas = claves(resultado.posiblesRuido);
  assert.ok(marcadas.includes("las mejores pastillas para la ciatica"));
});

test("dos cabezas aceptadas que solo se diferencian en un plural quedan declaradas como duplicado probable", () => {
  // Medido sobre el universo real: las dos existen, las dos tienen 590 y las dos entran.
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "desgarro muscular tratamiento", volumen: 590 }),
    kw({ keyword: "desgarro muscular tratamientos", volumen: 590 }),
  ]);

  // Las dos SIGUEN en la lista: quitar una es decision de la revision, no de una heuristica.
  const dentro = claves(resultado.candidatas);
  assert.ok(dentro.includes("desgarro muscular tratamiento"));
  assert.ok(dentro.includes("desgarro muscular tratamientos"));

  assert.equal(resultado.duplicadosProbables.length, 1);
  assert.equal(resultado.duplicadosProbables[0]?.keywordKey, "desgarro muscular tratamientos");
  assert.equal(resultado.duplicadosProbables[0]?.duplicaA, "desgarro muscular tratamiento");
});

test("el detector de plurales no junta dos condiciones distintas que terminan en `sis`", () => {
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "artrosis", intent: "informacional" }),
    kw({ keyword: "cifosis", intent: "informacional" }),
    kw({ keyword: "lumbalgia", intent: "informacional" }),
  ]);

  assert.deepEqual(resultado.duplicadosProbables, []);
});

test("la sospecha de tienda ortopedica esta anclada al principio y no marca al par de especialidades", () => {
  // Falso positivo medido el 2026-08-11 sobre la lista real: `ortopedia surco` como patron de
  // `contiene` marcaba tambien `traumatologia y ortopedia surco`, que es la especialidad.
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "ortopedia surco", volumen: 210, intent: "transaccional" }),
    kw({ keyword: "traumatología y ortopedia surco", intent: "transaccional" }),
  ]);

  const porClave = new Map(resultado.candidatas.map((c) => [c.keywordKey, c]));
  assert.equal(porClave.get("ortopedia surco")?.posibleRuido, "tienda-o-especialidad");
  assert.equal(porClave.get("traumatologia y ortopedia surco")?.posibleRuido, null);
});

test("el bloque de posibles ruidos existe aunque este vacio: declararlo vacio es informacion", () => {
  const resultado = seleccion([...NUCLEO]);
  assert.ok(Array.isArray(resultado.posiblesRuido));
  assert.equal(resultado.posiblesRuido.length, 0);
});

// ---------------------------------------------------------------------------
// El geo y las sedes cuelgan de los rangos 1 y 2, no de cualquier keyword
// ---------------------------------------------------------------------------

test("el rango 3 solo acepta geo de Lima montado sobre una base de los rangos 1 o 2", () => {
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "cirujano de columna surco", intent: "transaccional" }),
    kw({ keyword: "ortopedia infantil surco", intent: "transaccional" }),
    // Base que no es de rango 1 ni 2: no puede colarse por rango 3.
    kw({ keyword: "fisioterapia surco", intent: "transaccional" }),
  ]);

  const porClave = new Map(resultado.candidatas.map((c) => [c.keywordKey, c]));
  assert.equal(porClave.get("cirujano de columna surco")?.rango, 3);
  assert.equal(porClave.get("ortopedia infantil surco")?.rango, 3);
  assert.notEqual(porClave.get("fisioterapia surco")?.rango, 3);
});

test("cuando existen la forma con `en` y sin `en`, entra una sola y la otra queda absorbida", () => {
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "ortopedia infantil lima", intent: "transaccional" }),
    kw({ keyword: "ortopedia infantil en lima", intent: "transaccional" }),
  ]);

  const dentro = claves(resultado.candidatas);
  assert.ok(dentro.includes("ortopedia infantil lima"));
  assert.ok(!dentro.includes("ortopedia infantil en lima"));

  const absorbida = resultado.absorbidas.find(
    (a) => a.keywordKey === "ortopedia infantil en lima",
  );
  assert.equal(absorbida?.absorbidaPor, "ortopedia infantil lima");
});

test("el rango 4 monta las sedes solo sobre las bases que el archivo de reglas declara", () => {
  const resultado = seleccion([
    ...NUCLEO,
    kw({ keyword: "cirujano de columna clínica ricardo palma", intent: "transaccional" }),
    kw({ keyword: "ortopedia infantil clínica tezza", intent: "transaccional" }),
  ]);

  const porClave = new Map(resultado.candidatas.map((c) => [c.keywordKey, c]));
  assert.equal(porClave.get("cirujano de columna clinica ricardo palma")?.rango, 4);
  assert.equal(porClave.get("ortopedia infantil clinica tezza")?.rango, 4);
});

// ---------------------------------------------------------------------------
// Lo que resuelva el checkpoint de la tarea 2
// ---------------------------------------------------------------------------

test("--exclude saca una cabeza y devuelve su busqueda a la reserva", () => {
  const base = [...NUCLEO, kw({ keyword: "ciática: tratamientos", volumen: 590 })];
  const antes = seleccion(base);
  const despues = seleccion(base, { excluir: ["Ciática: tratamientos"] });

  assert.equal(despues.candidatas.length, antes.candidatas.length - 1);
  assert.ok(!claves(despues.candidatas).includes("ciatica  tratamientos"));
  assert.ok(despues.resumen.busquedasNuevas < antes.resumen.busquedasNuevas);
});

test("--include mete una que el criterio automatico habia dejado fuera, sin reordenar el resto", () => {
  const resto = Array.from({ length: 30 }, (_, i) =>
    kw({ keyword: `tratamiento de columna variante ${i}`, volumen: 500 - i }),
  );
  const rescatada = "tratamiento de columna variante 25";
  const antes = seleccion([...NUCLEO, ...resto], { presupuesto: 10 });
  assert.ok(!claves(antes.candidatas).includes(rescatada));

  const despues = seleccion([...NUCLEO, ...resto], {
    presupuesto: 10,
    incluir: [rescatada],
  });
  const entrada = despues.candidatas.find((c) => c.keywordKey === rescatada);
  assert.ok(entrada !== undefined, "la keyword rescatada tiene que entrar");
  assert.equal(entrada.rango, 0);
  assert.match(entrada.motivo, /revisi/i);
});

test("una keyword fuera de alcance no se puede meter con --include: el filtro de alcance manda", () => {
  const resultado = seleccion(
    [
      ...NUCLEO,
      kw({
        keyword: "clinica de traumatologia arthrosalud",
        volumen: 1600,
        alcance: "fuera_de_alcance",
        motivoAlcance: "marca_ajena",
      }),
    ],
    { incluir: ["clinica de traumatologia arthrosalud"] },
  );

  assert.ok(!claves(resultado.candidatas).includes("clinica de traumatologia arthrosalud"));
});

// ---------------------------------------------------------------------------
// El archivo de reglas
// ---------------------------------------------------------------------------

test("el archivo de reglas declara las cuatro condiciones nucleo y cirujano de columna", () => {
  const rango1 = REGLAS.rangos.find((r) => r.rango === 1);
  assert.deepEqual([...(rango1?.claves ?? [])].sort(), [
    "escoliosis",
    "estenosis espinal",
    "hernia discal",
    "ortopedia infantil",
  ]);

  const rango2 = REGLAS.rangos.find((r) => r.rango === 2);
  assert.ok(rango2?.claves.includes("cirujano de columna"));
});

test("todos los patrones del archivo de reglas estan escritos sin tildes", () => {
  // Se evaluan contra la salida de normalizeKeyword, que las quita. Un patron acentuado no
  // calzaria jamas y fallaria en silencio.
  const textos: string[] = [];
  for (const r of REGLAS.rangos) textos.push(...r.claves, ...r.sufijos, ...r.bases);
  for (const e of REGLAS.exclusiones) textos.push(...e.contiene, ...e.terminaEn);
  for (const s of REGLAS.sospechas) textos.push(...s.contiene, ...s.empiezaCon);

  for (const t of textos) {
    assert.equal(t, normalizeKeyword(t), `patron con tilde o mayuscula: "${t}"`);
  }
});
