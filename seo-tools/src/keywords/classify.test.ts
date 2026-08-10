/**
 * Pruebas del motor de clasificacion.
 *
 * Todas las keywords de este archivo salen de `data/candidates.jsonl`, el universo real de
 * 5716 candidatas del plan 12-03. No hay ni una inventada: lo que se prueba es como clasifica
 * el motor lo que de verdad hay que cargar en el Sheet del cliente.
 *
 * Las reglas se cargan del archivo de datos real, no de un doble. El motor sin sus patrones no
 * es nada, y una prueba contra patrones de juguete no diria si `data/intent-rules.json` esta
 * bien escrito. Las anulaciones, en cambio, SI van en memoria: el archivo commiteado crece en
 * la tarea 2 y las pruebas no pueden depender de su contenido.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  cargarReglas,
  clasificar,
  ETAPAS,
  INTENCIONES,
  ORIGENES_DE_INTENCION,
  type Anulaciones,
} from "./classify.js";
import { normalizeKeyword } from "./normalize.js";

const reglas = cargarReglas();
const SIN_ANULACIONES: Anulaciones = {};

/** Atajo de lectura: clasifica con las reglas reales y sin anulaciones. */
const c = (clave: string) => clasificar(clave, reglas, SIN_ANULACIONES);

// ---------------------------------------------------------------------------
// Comportamiento 1: los patrones se evaluan sobre el texto ya normalizado
// ---------------------------------------------------------------------------

test("comportamiento 1: los patrones se escriben sin tildes y calzan sobre el texto normalizado", () => {
  // El archivo de reglas no puede tener ni una tilde: se compara contra la salida de
  // normalizeKeyword, que las quita. Un patron acentuado nunca calzaria con nada.
  const serializado = JSON.stringify(reglas);
  const acentuadas = serializado.match(/[áéíóúÁÉÍÓÚüÜ]/g) ?? [];
  assert.deepEqual(acentuadas, [], "hay patrones con tilde en data/intent-rules.json");

  // Y el texto con tildes, una vez normalizado, dispara el patron escrito sin ellas.
  assert.equal(c(normalizeKeyword("Cirugía de hernia discal en Lima")).intent, "transaccional");
  assert.equal(c(normalizeKeyword("¿Qué es la estenosis espinal?")).intent, "informacional");
});

// ---------------------------------------------------------------------------
// Comportamiento 2: precedencia estricta, primera coincidencia gana
// ---------------------------------------------------------------------------

test("comportamiento 2: la precedencia declarada es marca, transaccional, comercial e informacional", () => {
  const niveles = reglas.intencion.map((n) => n.nivel);
  assert.deepEqual(niveles, ["navegacional", "transaccional", "comercial", "informacional"]);

  // Un ejemplo real por nivel, en orden.
  assert.equal(c("clinica ricardo palma").intent, "navegacional");
  assert.equal(c("cirujano de columna lima").intent, "transaccional");
  assert.equal(c("tratamiento de hernia discal").intent, "comercial");
  assert.equal(c("que es hernia discal").intent, "informacional");
});

// ---------------------------------------------------------------------------
// Comportamiento 3: marca sin termino de condicion resuelve a navegacional
// ---------------------------------------------------------------------------

test("comportamiento 3 (precedencia): la marca sin termino de condicion gana sobre el patron comercial", () => {
  // "opiniones" es disparador comercial y "doctoralia" es marca. Manda la marca.
  assert.equal(c("doctoralia opiniones").intent, "navegacional");
  // "ortopedia wong" es marca de retail; "telefono" dispararia transaccional.
  assert.equal(c("ortopedia wong telefono").intent, "navegacional");
});

test("comportamiento 3 (contraparte): la marca CON termino de condicion cae al nivel siguiente", () => {
  // La clinica es sede real del doctor y la frase nombra una especialidad: eso es un paciente
  // buscando donde atenderse, no la ficha de la clinica.
  const r = c("traumatologo clinica ricardo palma");
  assert.equal(r.intent, "transaccional");
  assert.notEqual(r.intent, "navegacional");
  assert.equal(c("cirugia de columna clinica montefiori").intent, "transaccional");
});

// ---------------------------------------------------------------------------
// Comportamiento 4: transaccional precede a comercial
// ---------------------------------------------------------------------------

test("comportamiento 4 (precedencia): precio mas tratamiento resuelve a transaccional", () => {
  assert.equal(c("precio de tratamiento de hernia discal").intent, "transaccional");
  assert.equal(c("cuanto cuesta la cirugia de hernia discal").intent, "transaccional");
  // Y sin el termino de precio, la misma frase se queda en comercial.
  assert.equal(c("tratamiento de hernia discal").intent, "comercial");
});

// ---------------------------------------------------------------------------
// Comportamiento 5: distrito de Lima o clinica del doctor resuelve a transaccional
// ---------------------------------------------------------------------------

test("comportamiento 5: nombrar un distrito de Lima resuelve a transaccional", () => {
  for (const clave of [
    "ortopedia infantil lima",
    "ortopedia infantil surco",
    "ortopedia infantil san isidro",
    "ortopedia infantil la molina",
    "cirujano de columna lima",
  ]) {
    assert.equal(c(clave).intent, "transaccional", clave);
  }
});

test("comportamiento 5 (clinicas): clinica mas especialidad en la misma frase resuelve a transaccional", () => {
  for (const clave of [
    "neurocirujano clinica sanna",
    "traumatologia clinica montefiori",
    "cirujano de columna clinica tezza",
    "ortopedia infantil clinica ricardo palma",
  ]) {
    assert.equal(c(clave).intent, "transaccional", clave);
  }
});

// ---------------------------------------------------------------------------
// Comportamiento 6: sin disparador, informacional por defecto
// ---------------------------------------------------------------------------

test("comportamiento 6: sin ningun disparador cae en informacional y nunca queda sin clasificar", () => {
  const r = c("hernia discal lumbar gpc");
  assert.equal(r.intent, "informacional");
  assert.equal(r.intentRegla, "defecto");
  // Ninguna keyword del universo queda fuera del dominio, ni siquiera una cadena vacia.
  const vacia = c("");
  assert.ok(INTENCIONES.includes(vacia.intent));
  assert.ok(ETAPAS.includes(vacia.stage));
});

// ---------------------------------------------------------------------------
// Comportamiento 7: la etapa es un eje independiente
// ---------------------------------------------------------------------------

test("comportamiento 7: la etapa se resuelve con su propio mapeo, independiente de la intencion", () => {
  // Misma intencion informacional, tres etapas distintas.
  assert.equal(c("sintomas de hernia discal").intent, "informacional");
  assert.equal(c("sintomas de hernia discal").stage, "sintoma");

  assert.equal(c("que es hernia discal").intent, "informacional");
  assert.equal(c("que es hernia discal").stage, "diagnostico");

  assert.equal(c("hernia discal se opera").stage, "decision");

  // Y misma etapa con intenciones distintas.
  assert.equal(c("ejercicios para hernia discal").stage, "sintoma");
  assert.equal(c("ejercicios para artrosis").stage, "sintoma");
});

test("comportamiento 7 (cobertura de etapas): las tres etapas aparecen sobre keywords reales", () => {
  assert.equal(c("dolor de espalda").stage, "sintoma");
  assert.equal(c("hernia discal l4 l5").stage, "diagnostico");
  assert.equal(c("precio de hernia discal").stage, "decision");
});

// ---------------------------------------------------------------------------
// Comportamiento 8: cualquier disparador transaccional arrastra la etapa a decision
// ---------------------------------------------------------------------------

test("comportamiento 8: cualquier disparador transaccional arrastra la etapa a decision", () => {
  for (const clave of [
    "ortopedia infantil lima",
    "cuanto cuesta artrodesis en varios niveles",
    "cita con neurocirujano",
    "cirujano de columna surco",
    "traumatologo clinica montefiori",
  ]) {
    const r = c(clave);
    assert.equal(r.intent, "transaccional", clave);
    assert.equal(r.stage, "decision", clave);
  }

  // Incluso cuando la frase tambien trae un disparador de sintoma, el transaccional manda.
  const mixta = c("dolor de espalda tratamiento precio lima");
  assert.equal(mixta.intent, "transaccional");
  assert.equal(mixta.stage, "decision");
});

// ---------------------------------------------------------------------------
// Comportamiento 9: la anulacion se consulta ANTES de las reglas
// ---------------------------------------------------------------------------

test("comportamiento 9 (prioridad): la anulacion gana sobre las reglas y declara origen de modelo", () => {
  const clave = "cirugia de hernia discal lima precio recuperacion";
  const porReglas = c(clave);
  assert.equal(porReglas.intent, "transaccional");
  assert.equal(porReglas.intentSource, "reglas");

  const anulaciones: Anulaciones = {
    [clave]: { intent: "informacional", stage: "diagnostico", origen: "llm" },
  };
  const anulada = clasificar(clave, reglas, anulaciones);
  assert.equal(anulada.intent, "informacional");
  assert.equal(anulada.stage, "diagnostico");
  assert.equal(anulada.intentSource, "llm");
  assert.equal(anulada.intentRegla, "anulacion");
});

test("comportamiento 9 (origen manual): una correccion a mano tambien se declara como de modelo", () => {
  // El archivo distingue llm de manual para el rastro, pero la columna del Sheet solo acepta
  // dos valores y las dos se declaran igual.
  const anulaciones: Anulaciones = {
    "que es hernia discal": { intent: "comercial", stage: "decision", origen: "manual" },
  };
  const r = clasificar("que es hernia discal", reglas, anulaciones);
  assert.equal(r.intentSource, "llm");
  assert.equal(r.intent, "comercial");
});

test("comportamiento 9 (no evalua reglas): la anulacion decide sin mirar ningun patron", () => {
  // La clave dispara marca, precio y geo; la anulacion los ignora a los tres.
  const clave = "clinica ricardo palma precio lima";
  const r = clasificar(clave, reglas, {
    [clave]: { intent: "informacional", stage: "sintoma", origen: "llm" },
  });
  assert.equal(r.intent, "informacional");
  assert.equal(r.stage, "sintoma");
  assert.equal(r.ambiguo, false, "una keyword anulada nunca vuelve al residuo");
});

// ---------------------------------------------------------------------------
// Comportamiento 10: determinismo
// ---------------------------------------------------------------------------

test("comportamiento 10: clasificar el mismo conjunto dos veces produce salida identica", () => {
  const universo = [
    "que es hernia discal",
    "precio de estenosis espinal",
    "clinica ricardo palma",
    "cirujano de columna lima",
    "sintomas de escoliosis y deformidades de columna",
    "hernia discal l5 s1 cie-10",
    "ortopedia zapatos",
    "hernia discal en perros recuperacion",
  ];
  const primera = universo.map((k) => clasificar(k, reglas, SIN_ANULACIONES));
  const segunda = universo.map((k) => clasificar(k, reglas, SIN_ANULACIONES));
  assert.equal(JSON.stringify(primera), JSON.stringify(segunda));
});

// ---------------------------------------------------------------------------
// Comportamiento 11: el origen de la intencion toma exactamente dos valores
// ---------------------------------------------------------------------------

test("comportamiento 11: el origen de la intencion nunca sale del par permitido", () => {
  assert.deepEqual([...ORIGENES_DE_INTENCION], ["reglas", "llm"]);

  const muestra = [
    "que es hernia discal",
    "precio de hernia discal",
    "clinica sanna",
    "tratamiento de artrosis",
  ];
  for (const clave of muestra) {
    assert.ok(ORIGENES_DE_INTENCION.includes(c(clave).intentSource), clave);
  }
  const anulada = clasificar("que es hernia discal", reglas, {
    "que es hernia discal": { intent: "comercial", stage: "decision", origen: "manual" },
  });
  assert.ok(ORIGENES_DE_INTENCION.includes(anulada.intentSource));
});

// ---------------------------------------------------------------------------
// Cobertura de los cuatro niveles sobre 30+ keywords reales del universo
// ---------------------------------------------------------------------------

const CASOS_REALES: ReadonlyArray<readonly [string, string, string]> = [
  // navegacional
  ["clinica ricardo palma", "navegacional", "diagnostico"],
  ["doctoralia opiniones", "navegacional", "diagnostico"],
  ["ortopedia wong miraflores", "navegacional", "diagnostico"],
  ["arthrosalud", "navegacional", "diagnostico"],
  ["clinica san bernardo", "navegacional", "diagnostico"],
  // transaccional
  ["precio de hernia discal", "transaccional", "decision"],
  ["cuanto cuesta cirugia convencional", "transaccional", "decision"],
  ["artrodesis en varios niveles precio", "transaccional", "decision"],
  ["cirujano de columna lima", "transaccional", "decision"],
  ["ortopedia infantil surco", "transaccional", "decision"],
  ["cita con neurocirujano", "transaccional", "decision"],
  ["neurocirujano clinica sanna", "transaccional", "decision"],
  ["artrodesis en varios niveles en lima", "transaccional", "decision"],
  ["cirugia convencional en lima", "transaccional", "decision"],
  // comercial
  ["tratamiento de estenosis espinal", "comercial", "decision"],
  ["tratamiento de artrosis", "comercial", "decision"],
  ["cirugia de hernia discal", "comercial", "decision"],
  ["operacion de estenosis espinal", "comercial", "decision"],
  ["mejor medico para hernia discal", "comercial", "decision"],
  ["especialista en hernia discal", "comercial", "decision"],
  ["cirujano de columna", "comercial", "decision"],
  ["hernia discal se opera", "comercial", "decision"],
  // informacional
  ["que es hernia discal", "informacional", "diagnostico"],
  ["que es estenosis espinal", "informacional", "diagnostico"],
  ["sintomas de hernia discal", "informacional", "sintoma"],
  ["sintomas de estenosis espinal", "informacional", "sintoma"],
  ["ejercicios para hernia discal", "informacional", "sintoma"],
  ["ejercicios para artrosis", "informacional", "sintoma"],
  ["dolor de espalda", "informacional", "sintoma"],
  ["hernia discal l4 l5", "informacional", "diagnostico"],
  ["hernia discal l5 s1 cie-10", "informacional", "diagnostico"],
  ["cie 10 hernia discal", "informacional", "diagnostico"],
  ["artrosis cie 10", "informacional", "diagnostico"],
  ["tipos de hernia discal en perros", "informacional", "diagnostico"],
  ["hernia discal lumbar gpc", "informacional", "diagnostico"],
  ["clinica san bernardo especialistas en traumatologia", "transaccional", "decision"],
];

test("cobertura: 35 keywords reales del universo resuelven a la intencion y etapa esperadas", () => {
  assert.ok(CASOS_REALES.length >= 30, "la cobertura minima del plan son 30 keywords reales");
  for (const [clave, intent, stage] of CASOS_REALES) {
    const r = c(clave);
    assert.equal(r.intent, intent, `intencion de "${clave}"`);
    assert.equal(r.stage, stage, `etapa de "${clave}"`);
  }
});

test("cobertura: los cuatro niveles de intencion y las tres etapas aparecen en el conjunto real", () => {
  const intenciones = new Set(CASOS_REALES.map(([clave]) => c(clave).intent));
  const etapas = new Set(CASOS_REALES.map(([clave]) => c(clave).stage));
  for (const nivel of INTENCIONES) assert.ok(intenciones.has(nivel), `falta ${nivel}`);
  for (const etapa of ETAPAS) assert.ok(etapas.has(etapa), `falta ${etapa}`);
});

test("cobertura: todas las claves de prueba salen del universo real", () => {
  for (const [clave] of CASOS_REALES) {
    assert.equal(clave, normalizeKeyword(clave), `"${clave}" no esta en forma normalizada`);
  }
});

// ---------------------------------------------------------------------------
// Alcance: la deriva de marca, retail, veterinaria y codificacion se marca aparte
// ---------------------------------------------------------------------------

test("alcance: las variantes de codificacion clinica quedan marcadas fuera de alcance", () => {
  // Son las dos keywords de mayor volumen del universo y son busquedas de personal
  // administrativo, no de pacientes. Encabezan cualquier orden por volumen.
  for (const clave of ["artrosis cie 10", "cie-10 hernia discal", "estenosis espinal cie 10"]) {
    const r = c(clave);
    assert.equal(r.alcance, "fuera_de_alcance", clave);
    assert.equal(r.motivoAlcance, "codificacion_clinica", clave);
    assert.notEqual(r.stage, "decision", `${clave} no puede ser etapa de decision`);
  }
});

test("alcance: la deriva veterinaria queda marcada fuera de alcance", () => {
  for (const clave of ["hernia discal en perros recuperacion", "medicamentos para hernia discal en perros"]) {
    const r = c(clave);
    assert.equal(r.alcance, "fuera_de_alcance", clave);
    assert.equal(r.motivoAlcance, "veterinario", clave);
  }
});

test("alcance: el retail ortopedico queda fuera, pero el producto en contexto de paciente no", () => {
  assert.equal(c("ortopedia zapatos").motivoAlcance, "retail_ortopedico");
  assert.equal(c("ortopedia calzado").motivoAlcance, "retail_ortopedico");
  // Contrapartida: nombra una condicion nucleo del negocio, asi que es un paciente preguntando.
  assert.equal(c("faja para hernia discal").alcance, "objetivo");
});

test("alcance: la marca ajena se distingue de las sedes reales del doctor", () => {
  assert.equal(c("clinica san bernardo").motivoAlcance, "marca_ajena");
  assert.equal(c("arthrosalud").motivoAlcance, "marca_ajena");
  // Las cuatro sedes del doctor SI son objetivo.
  assert.equal(c("clinica ricardo palma").alcance, "objetivo");
  assert.equal(c("traumatologo clinica montefiori").alcance, "objetivo");
});

test("alcance: la mayoria del universo queda dentro de alcance", () => {
  for (const clave of ["que es hernia discal", "precio de hernia discal", "cirujano de columna lima"]) {
    assert.equal(c(clave).alcance, "objetivo", clave);
    assert.equal(c(clave).motivoAlcance, null, clave);
  }
});

// ---------------------------------------------------------------------------
// Residuo ambiguo: es lo que alimenta la tarea 2
// ---------------------------------------------------------------------------

test("residuo: la frase larga sin ningun disparador entra al residuo", () => {
  const r = c("hernia discal lumbar gpc");
  assert.equal(r.ambiguo, true);
  assert.equal(r.motivoAmbiguo, "sin-senal");
});

test("residuo: la frase corta sin disparador NO entra al residuo", () => {
  // Tres palabras o menos: el nivel por defecto alcanza y no hay nada que desambiguar.
  const r = c("lumbalgia y ciatica");
  assert.equal(r.intentRegla, "defecto", "el caso solo prueba lo que dice si no dispara nada");
  assert.equal(r.ambiguo, false);
});

test("residuo: el empate de especificidad entre transaccional e informacional entra al residuo", () => {
  // El caso tipico del research: mezcla procedimiento, geografia, precio y recuperacion.
  const r = c("cirugia de hernia discal lima precio recuperacion");
  assert.equal(r.ambiguo, true);
  assert.equal(r.motivoAmbiguo, "empate-transaccional-informacional");
  // Y aun asi resuelve: el residuo no deja nada sin clasificar, solo lo marca para revision.
  assert.equal(r.intent, "transaccional");
});

test("residuo: la keyword que dispara un solo nivel no es ambigua", () => {
  assert.equal(c("precio de hernia discal").ambiguo, false);
  assert.equal(c("que es hernia discal").ambiguo, false);
});
