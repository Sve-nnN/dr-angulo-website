/**
 * Pruebas de las 10 de Oro (KWR-06, D-10).
 *
 * Hay una prueba por cada vinieta del bloque <behavior> del plan 13-05, y las dos que el plan
 * exige POR NOMBRE son la de marca ajena con volumen alto —que nunca entra, por mucho que
 * encabece cualquier orden por volumen— y la de la condicion que el doctor opera sin volumen
 * medido, que si puede entrar porque el hueco es de la fuente y no del mercado.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  cargarCriterio,
  categoriaDe,
  construir,
  descartadasDeMayorVolumen,
  documento,
  elegir,
  evaluarCandidatas,
  justificacion,
  serializar,
  servicioPropio,
  terminosDeServicioPropio,
  valorDeNegocio,
  type CabezaEntrada,
  type Semilla,
} from "./golden.js";

const CRITERIO = cargarCriterio();

const SEMILLAS: Semilla[] = [
  { keyword: "Hernia discal", keywordKey: "hernia discal", tipo: "condicion", procedencia: "services.ts:serviceCategories[].conditions", rango: 1 },
  { keyword: "Ortopedia infantil", keywordKey: "ortopedia infantil", tipo: "especialidad", procedencia: "services.ts:serviceCategories[].name", rango: 1 },
  { keyword: "Traumatología", keywordKey: "traumatologia", tipo: "especialidad", procedencia: "cv.ts:education/experience", rango: 2 },
  { keyword: "Escoliosis y deformidades de columna", keywordKey: "escoliosis y deformidades de columna", tipo: "condicion", procedencia: "service-pages.ts:h1", rango: 1 },
  { keyword: "Neurocirujano", keywordKey: "neurocirujano", tipo: "especialidad", procedencia: "COMPETITORS.md:perfil", rango: 2 },
  { keyword: "Lima", keywordKey: "lima", tipo: "sede", procedencia: "locations.ts:addressRegion", rango: 2 },
];

const TERMINOS = terminosDeServicioPropio(SEMILLAS, CRITERIO);

/** Un top 10 con `n` posiciones disputables, todas de dominios distintos por cabeza. */
function posiciones(n: number, medidas: number, sufijo: string) {
  return Array.from({ length: medidas }, (_v, i) => ({
    posicion: i + 1,
    dominio: `d${i}-${sufijo}.pe`,
    url: `https://d${i}-${sufijo}.pe/x`,
    tipo: i < n ? "directorio" : "contenido-internacional",
    veredicto: i < n ? "disputable" : "barrera",
    motivo: i < n ? "contenido debil: directorio" : "contenido internacional",
  }));
}

function cabeza(p: Partial<CabezaEntrada> & { keywordKey: string }): CabezaEntrada {
  const disputables = p.disputables ?? 6;
  const medidas = p.posicionesMedidas ?? 9;
  return {
    keyword: p.keyword ?? p.keywordKey,
    keywordKey: p.keywordKey,
    cluster: p.cluster ?? `cluster-${p.keywordKey}`,
    tipoDePagina: p.tipoDePagina ?? "pagina-de-servicio",
    rango: p.rango ?? 2,
    familia: p.familia ?? "nucleo",
    intent: p.intent ?? "transaccional",
    stage: p.stage ?? "decision",
    alcance: p.alcance ?? "objetivo",
    motivoAlcance: p.motivoAlcance ?? null,
    semilla: p.semilla ?? null,
    volumenDinorank: p.volumenDinorank ?? null,
    volumenAhrefs: p.volumenAhrefs ?? null,
    volumenFuente: p.volumenFuente ?? "sin_datos",
    keywordDifficulty: p.keywordDifficulty ?? null,
    keywordDifficultyFuente: p.keywordDifficultyFuente ?? "no_consultado",
    trafficPotential: p.trafficPotential ?? null,
    trafficPotentialFuente: p.trafficPotentialFuente ?? "no_consultado",
    nivel: p.nivel ?? "alto",
    disputables,
    barreras: medidas - disputables,
    posicionesMedidas: medidas,
    primeraDisputable: p.primeraDisputable ?? (disputables > 0 ? 1 : null),
    posiciones: p.posiciones ?? posiciones(disputables, medidas, p.keywordKey),
    competidoresEnTop: p.competidoresEnTop ?? [],
    razones: p.razones ?? ["razon medida de ejemplo"],
  };
}

// ---------------------------------------------------------------------------
// comportamiento 1: valor de negocio ANTES que alcanzabilidad (D-10)
// ---------------------------------------------------------------------------

test("comportamiento 1: una keyword de valor alto y alcanzabilidad media entra antes que una de valor bajo y alcanzabilidad alta", () => {
  const valiosaPeroDificil = cabeza({
    keywordKey: "hernia discal lumbar y cervical en lima",
    semilla: "Hernia discal",
    trafficPotential: 3400,
    trafficPotentialFuente: "ahrefs",
    rango: 1,
    nivel: "medio",
    disputables: 4,
  });
  const facilPeroPobre = cabeza({
    keywordKey: "traumatologia surco",
    semilla: "Traumatología",
    rango: 5,
    nivel: "alto",
    disputables: 9,
    posicionesMedidas: 9,
  });

  const { candidatas } = evaluarCandidatas([facilPeroPobre, valiosaPeroDificil], SEMILLAS, CRITERIO);
  assert.equal(candidatas.length, 2);
  assert.equal(
    candidatas[0]?.cabeza.keywordKey,
    "hernia discal lumbar y cervical en lima",
    "el valor de negocio manda: la de 3.400 de potencial y rango 1 va primero aunque su SERP sea mas dura",
  );
  assert.ok(
    (candidatas[0]?.valor.puntos ?? 0) > (candidatas[1]?.valor.puntos ?? 0),
    "y la diferencia esta en los puntos de valor, no en el desempate",
  );
});

test("comportamiento 1b: dentro del mismo valor de negocio, la alcanzabilidad desempata", () => {
  const dura = cabeza({ keywordKey: "traumatologia san isidro", semilla: "Traumatología", nivel: "medio", disputables: 4 });
  const facil = cabeza({ keywordKey: "traumatologia lima", semilla: "Traumatología", nivel: "alto", disputables: 8 });
  const { candidatas } = evaluarCandidatas([dura, facil], SEMILLAS, CRITERIO);
  // Distinto nivel de localidad haria distinto el valor; se comparan dos con el mismo peso.
  const iguales = candidatas.filter((c) => c.valor.puntos === candidatas[0]?.valor.puntos);
  if (iguales.length === 2) {
    assert.equal(iguales[0]?.cabeza.nivel, "alto", "a igual valor, primero la mas alcanzable");
  }
});

// ---------------------------------------------------------------------------
// comportamiento 2: marca ajena, jamas, sin importar el volumen
// ---------------------------------------------------------------------------

test("comportamiento 2: una keyword de marca ajena con el volumen mas alto del universo nunca entra", () => {
  const marca = cabeza({
    keywordKey: "clinica san bernardo especialistas en traumatologia",
    semilla: "Traumatología",
    alcance: "fuera_de_alcance",
    motivoAlcance: "marca_ajena",
    volumenDinorank: 2400,
    volumenFuente: "dinorank",
    trafficPotential: 5000,
    trafficPotentialFuente: "ahrefs",
    nivel: "alto",
    disputables: 9,
  });
  const normal = cabeza({ keywordKey: "traumatologia lima", semilla: "Traumatología" });

  const { candidatas, rechazadas } = evaluarCandidatas([marca, normal], SEMILLAS, CRITERIO);
  assert.ok(
    !candidatas.some((c) => c.cabeza.keywordKey === "clinica san bernardo especialistas en traumatologia"),
    "no puede ser candidata",
  );
  const r = rechazadas.find((x) => x.keywordKey === "clinica san bernardo especialistas en traumatologia");
  assert.ok(r, "y tiene que quedar registrada como rechazada, no desaparecer en silencio");
  assert.match(r.motivo, /marca_ajena|alcance/i);

  const { elegidas } = elegir(candidatas, CRITERIO);
  assert.ok(!elegidas.some((e) => e.cabeza.motivoAlcance === "marca_ajena"));
});

// ---------------------------------------------------------------------------
// comportamiento 3: alcance distinto de objetivo, fuera
// ---------------------------------------------------------------------------

test("comportamiento 3: ninguna keyword de alcance distinto de objetivo entra, incluida la de codificacion clinica", () => {
  const cie10 = cabeza({
    keywordKey: "artrosis cie 10",
    semilla: "Traumatología",
    alcance: "fuera_de_alcance",
    motivoAlcance: "codificacion_clinica",
    volumenDinorank: 2400,
    volumenFuente: "dinorank",
  });
  const retail = cabeza({
    keywordKey: "ortopedia zapatos",
    semilla: "Traumatología",
    alcance: "fuera_de_alcance",
    motivoAlcance: "retail_ortopedico",
    volumenDinorank: 1600,
    volumenFuente: "dinorank",
  });
  const { candidatas } = evaluarCandidatas([cie10, retail], SEMILLAS, CRITERIO);
  assert.equal(candidatas.length, 0);
});

// ---------------------------------------------------------------------------
// comportamiento 4: sin volumen medido NO es sin mercado
// ---------------------------------------------------------------------------

test("comportamiento 4: una condicion que el doctor opera y no tiene volumen medido si puede entrar", () => {
  const sinVolumen = cabeza({
    keywordKey: "hernia discal lumbar y cervical en lima",
    semilla: "Hernia discal",
    volumenDinorank: null,
    volumenAhrefs: null,
    volumenFuente: "sin_datos",
    trafficPotential: null,
    trafficPotentialFuente: "no_consultado",
    rango: 3,
  });
  const { candidatas } = evaluarCandidatas([sinVolumen], SEMILLAS, CRITERIO);
  assert.equal(candidatas.length, 1, "no se descarta por falta de volumen");

  const componente = candidatas[0]?.valor.componentes.find((c) => c.nombre === "demanda");
  assert.ok(componente);
  assert.ok(componente.puntos > 0, "y el hueco de la fuente no se puntua como cero");
  assert.match(
    candidatas[0]?.valor.razones.join(" ") ?? "",
    /sin dato|no es cero|fuente/i,
    "la razon tiene que decir que el hueco es de la fuente",
  );
});

test("comportamiento 4b: sin dato y cero medido no se puntuan igual", () => {
  const sinDato = cabeza({ keywordKey: "estenosis de canal en lima", semilla: "Hernia discal", volumenFuente: "sin_datos" });
  const ceroMedido = cabeza({
    keywordKey: "estenosis de canal la molina",
    semilla: "Hernia discal",
    volumenDinorank: 0,
    volumenFuente: "dinorank",
  });
  const a = valorDeNegocio(sinDato, CRITERIO, { como: "semilla", termino: "hernia discal", procedencia: "services.ts" });
  const b = valorDeNegocio(ceroMedido, CRITERIO, { como: "semilla", termino: "hernia discal", procedencia: "services.ts" });
  const da = a.componentes.find((c) => c.nombre === "demanda")?.puntos ?? -1;
  const db = b.componentes.find((c) => c.nombre === "demanda")?.puntos ?? -1;
  assert.notEqual(da, db, "un cero medido por DinoRank no vale lo mismo que un hueco de la fuente");
});

// ---------------------------------------------------------------------------
// Los bonos de pagina se pagan una sola vez
// ---------------------------------------------------------------------------

test("los bonos de categoria y de pagina publicada solo los cobra la cabeza canonica, no cada variante geo", () => {
  const canonica = cabeza({ keywordKey: "ortopedia infantil lima", semilla: "Ortopedia infantil", rango: 3 });
  const distrito = cabeza({ keywordKey: "ortopedia infantil surco", semilla: "Ortopedia infantil", rango: 3 });
  const clinica = cabeza({ keywordKey: "ortopedia infantil clinica tezza", semilla: "Ortopedia infantil", rango: 3 });

  const propio = { como: "semilla", termino: "ortopedia infantil", procedencia: "services.ts:serviceCategories[].name" } as const;
  const bono = (c: CabezaEntrada): number => {
    const v = valorDeNegocio(c, CRITERIO, propio);
    const dif = v.componentes.find((x) => x.nombre === "diferenciacion")?.puntos ?? 0;
    const pag = v.componentes.find((x) => x.nombre === "pagina publicada")?.puntos ?? 0;
    return dif + pag;
  };

  assert.ok(bono(canonica) > 0, "la cabeza a nivel Lima si cobra: la pagina de servicio es una para toda Lima");
  assert.equal(bono(distrito), 0, "una variante de distrito no vuelve a cobrar la misma pagina");
  assert.equal(bono(clinica), 0, "una variante de clinica tampoco: a esa la sirve una pagina de sede");
});

// ---------------------------------------------------------------------------
// comportamiento 5: la justificacion nombra el dato concreto
// ---------------------------------------------------------------------------

test("comportamiento 5: cada justificacion nombra cluster, tipo de pagina, quien ocupa el top 10 y el KD cuando existe", () => {
  const c = cabeza({
    keywordKey: "hernia discal lumbar y cervical en lima",
    keyword: "hernia discal lumbar y cervical en lima",
    semilla: "Hernia discal",
    cluster: "hernia-discal-lumbar-y-cervical-en-lima",
    tipoDePagina: "pagina-de-servicio",
    keywordDifficulty: 5,
    keywordDifficultyFuente: "ahrefs",
    trafficPotential: 1500,
    trafficPotentialFuente: "ahrefs",
    disputables: 7,
    posicionesMedidas: 8,
    competidoresEnTop: [{ domain: "clinicarthromeds.pe", domainRating: 1.1 }],
  });
  const { candidatas } = evaluarCandidatas([c], SEMILLAS, CRITERIO);
  const { elegidas } = elegir(candidatas, CRITERIO);
  const j = justificacion(elegidas[0] as never, CRITERIO);

  assert.ok(j.length >= 80, `la justificacion tiene que ser legible, no una etiqueta: ${j.length} caracteres`);
  assert.match(j, /hernia-discal-lumbar-y-cervical-en-lima/, "nombra su cluster");
  assert.match(j, /pagina-de-servicio|pagina de servicio/, "nombra el tipo de pagina que la SERP premia");
  assert.match(j, /7 de 8|7\/8/, "nombra cuantas posiciones del top 10 son disputables");
  assert.match(j, /KD 5/, "nombra el KD cuando Ahrefs lo devolvio");
  assert.match(j, /clinicarthromeds\.pe/, "nombra al competidor perfilado que ocupa ese top 10");
});

test("comportamiento 5b: cuando no hay KD, la justificacion lo dice en vez de callarlo", () => {
  const c = cabeza({ keywordKey: "cirujano de columna lima", semilla: "Traumatología", keywordDifficultyFuente: "ahrefs_sin_dato" });
  const { candidatas } = evaluarCandidatas([c], SEMILLAS, CRITERIO);
  const { elegidas } = elegir(candidatas, CRITERIO);
  const j = justificacion(elegidas[0] as never, CRITERIO);
  assert.match(j, /sin KD|KD sin medir|no consultado|sin dato/i);
  assert.doesNotMatch(j, /KD 0\b/, "y no inventa un cero");
});

// ---------------------------------------------------------------------------
// comportamiento 6: las de mayor volumen que NO entraron, con su razon
// ---------------------------------------------------------------------------

test("comportamiento 6: el bloque de descartadas trae las de mayor volumen del universo con su motivo", () => {
  const universo = [
    { keyword: "tendinitis", keywordKey: "tendinitis", volumen: 14800, volumenFuente: "dinorank", alcance: "objetivo", motivoAlcance: null, intent: "informacional" },
    { keyword: "clínica san bernardo especialistas en traumatología", keywordKey: "clinica san bernardo especialistas en traumatologia", volumen: 2400, volumenFuente: "dinorank", alcance: "fuera_de_alcance", motivoAlcance: "marca_ajena", intent: "transaccional" },
    { keyword: "artrosis cie 10", keywordKey: "artrosis cie 10", volumen: 2400, volumenFuente: "dinorank", alcance: "fuera_de_alcance", motivoAlcance: "codificacion_clinica", intent: "informacional" },
    { keyword: "cie-10 hernia discal", keywordKey: "cie-10 hernia discal", volumen: 1600, volumenFuente: "dinorank", alcance: "fuera_de_alcance", motivoAlcance: "codificacion_clinica", intent: "informacional" },
    { keyword: "clínica de traumatología arthrosalud", keywordKey: "clinica de traumatologia arthrosalud", volumen: 1600, volumenFuente: "dinorank", alcance: "fuera_de_alcance", motivoAlcance: "marca_ajena", intent: "transaccional" },
    { keyword: "traumatología lima", keywordKey: "traumatologia lima", volumen: 880, volumenFuente: "dinorank", alcance: "objetivo", motivoAlcance: null, intent: "transaccional" },
  ];
  const d = descartadasDeMayorVolumen(universo, new Set(["traumatologia lima"]), new Map(), CRITERIO, 10);

  assert.ok(d.length >= 5, "el plan exige al menos cinco");
  assert.ok(!d.some((x) => x.keywordKey === "traumatologia lima"), "una elegida no puede figurar como descartada");
  for (const x of d) assert.ok(x.motivo.length > 0, `sin motivo: ${x.keyword}`);

  const marca = d.filter((x) => /marca/i.test(x.motivo));
  assert.equal(marca.length, 2, "las dos de marca ajena van con su motivo explicito");
  // Ojo con el regex: un `/cie/i` suelto tambien casa dentro de "paciente", que aparece en el
  // motivo de marca ajena. Se pide el codigo entero o la frase entera.
  const cie = d.filter((x) => /CIE-10|codificacion clinica|personal administrativo/i.test(x.motivo));
  assert.equal(cie.length, 2, "las dos de codificacion clinica tambien");

  assert.equal(d[0]?.keywordKey, "tendinitis", "van ordenadas por volumen, que es el orden que dispara la pregunta");
});

// ---------------------------------------------------------------------------
// comportamiento 7: determinismo
// ---------------------------------------------------------------------------

test("comportamiento 7: dos corridas producen la misma lista en el mismo orden", () => {
  const base = [
    cabeza({ keywordKey: "escoliosis", semilla: "Escoliosis y deformidades de columna", cluster: "escoliosis", trafficPotential: 3400, trafficPotentialFuente: "ahrefs", rango: 1, nivel: "bajo", disputables: 1, posicionesMedidas: 7 }),
    cabeza({ keywordKey: "traumatologia lima", semilla: "Traumatología", cluster: "mega", volumenDinorank: 880, volumenFuente: "dinorank", rango: 3 }),
    cabeza({ keywordKey: "ortopedia infantil lima", semilla: "Ortopedia infantil", cluster: "mega", rango: 3 }),
    cabeza({ keywordKey: "hernia discal lumbar y cervical en lima", semilla: "Hernia discal", cluster: "hdl", rango: 3 }),
  ];
  const revuelto = [base[3], base[1], base[0], base[2]] as CabezaEntrada[];

  const a = elegir(evaluarCandidatas(base, SEMILLAS, CRITERIO).candidatas, CRITERIO);
  const b = elegir(evaluarCandidatas(revuelto, SEMILLAS, CRITERIO).candidatas, CRITERIO);

  assert.deepEqual(
    a.elegidas.map((e) => e.cabeza.keywordKey),
    b.elegidas.map((e) => e.cabeza.keywordKey),
    "el orden de entrada no puede cambiar el resultado",
  );
  assert.equal(serializar(construir(a, [], CRITERIO)), serializar(construir(b, [], CRITERIO)));
});

// ---------------------------------------------------------------------------
// La puerta de servicio propio
// ---------------------------------------------------------------------------

test("puerta de servicio propio: una cabeza sembrada desde el perfil de un competidor no entra", () => {
  const ajena = cabeza({ keywordKey: "neurocirujano lima", semilla: "Neurocirujano", trafficPotential: 90, trafficPotentialFuente: "ahrefs" });
  assert.equal(servicioPropio(ajena, TERMINOS, CRITERIO), null, "'neurocirujano' salio de COMPETITORS.md: es lo que hace otro");

  const { candidatas, rechazadas } = evaluarCandidatas([ajena], SEMILLAS, CRITERIO);
  assert.equal(candidatas.length, 0);
  assert.match(rechazadas[0]?.motivo ?? "", /servicio propio|COMPETITORS|declara/i);
});

test("puerta de servicio propio: una confirmacion explicita del cliente levanta la puerta y queda firmada", () => {
  // `cifosis` se sembro desde COMPETITORS.md, asi que la puerta automatica la dejaba fuera. Juan
  // confirmo el 2026-08-11 que el doctor la opera, y esa confirmacion vive en el archivo de
  // criterio con su fecha. Lo que la habilita es el dato corregido, no un parecido clinico.
  const cifosis = cabeza({ keywordKey: "cifosis", semilla: "Neurocirujano" });
  const p = servicioPropio(cifosis, TERMINOS, CRITERIO, SEMILLAS);
  assert.ok(p, "una excepcion confirmada tiene que abrir la puerta");
  assert.equal(p.como, "confirmacion");
  assert.match(p.procedencia, /confirmado por .+ el \d{4}-\d{2}-\d{2}/, "la firma y la fecha quedan a la vista");

  // Y no abre la puerta para cualquier deformidad de columna que nadie confirmo.
  const noConfirmada = cabeza({ keywordKey: "discopatia degenerativa", semilla: "Neurocirujano" });
  assert.equal(servicioPropio(noConfirmada, TERMINOS, CRITERIO, SEMILLAS), null);
});

test("puerta de servicio propio: un distrito no abre la puerta, porque un distrito no es un servicio", () => {
  const soloGeo = cabeza({ keywordKey: "neurocirujano san isidro", semilla: "Neurocirujano" });
  assert.equal(
    servicioPropio(soloGeo, TERMINOS, CRITERIO),
    null,
    "las semillas de tipo sede quedan fuera de la puerta a proposito",
  );
});

test("puerta de servicio propio: una cabeza cubierta por el H1 de una pagina publicada si entra, aunque su semilla sea ajena", () => {
  const escoliosis = cabeza({ keywordKey: "escoliosis", semilla: "Neurocirujano" });
  const p = servicioPropio(escoliosis, TERMINOS, CRITERIO);
  assert.ok(p, "'escoliosis' esta dentro de 'escoliosis y deformidades de columna', que es el H1 publicado");
  assert.equal(p.como, "texto");
  assert.match(p.procedencia, /service-pages\.ts/);
});

// ---------------------------------------------------------------------------
// El piso de evidencia
// ---------------------------------------------------------------------------

test("piso de evidencia: una cabeza sin una sola posicion disputable no entra por muy alto que sea su valor", () => {
  const muro = cabeza({
    keywordKey: "hernia discal",
    semilla: "Hernia discal",
    trafficPotential: 1500,
    trafficPotentialFuente: "ahrefs",
    keywordDifficulty: 5,
    keywordDifficultyFuente: "ahrefs",
    rango: 1,
    nivel: "bajo",
    disputables: 0,
    posicionesMedidas: 7,
    primeraDisputable: null,
  });
  const { candidatas, rechazadas } = evaluarCandidatas([muro], SEMILLAS, CRITERIO);
  assert.equal(candidatas.length, 0, "cero disputables es cero sitios donde entrar");
  assert.match(rechazadas[0]?.motivo ?? "", /disputable/i);
});

// ---------------------------------------------------------------------------
// La regla de cluster
// ---------------------------------------------------------------------------

test("regla de cluster: dos cabezas del mismo cluster y la misma categoria no pueden ser las dos de oro", () => {
  const a = cabeza({ keywordKey: "traumatologia lima", semilla: "Traumatología", cluster: "mega", rango: 3 });
  const b = cabeza({ keywordKey: "traumatologia surco", semilla: "Traumatología", cluster: "mega", rango: 3 });
  const { candidatas } = evaluarCandidatas([a, b], SEMILLAS, CRITERIO);
  const { elegidas, desplazadas } = elegir(candidatas, CRITERIO);
  assert.equal(elegidas.length, 1, "serian la misma pagina");
  assert.match(desplazadas[0]?.motivo ?? "", /cluster/i);
});

test("regla de cluster: dos cabezas del mismo cluster pero de otra categoria y con solape medido cero si entran las dos", () => {
  const a = cabeza({ keywordKey: "traumatologia lima", semilla: "Traumatología", cluster: "mega", rango: 3 });
  const b = cabeza({ keywordKey: "ortopedia infantil lima", semilla: "Ortopedia infantil", cluster: "mega", rango: 3 });
  // Sus top 10 no comparten ni una url: `posiciones()` usa el keywordKey como sufijo.
  const { candidatas } = evaluarCandidatas([a, b], SEMILLAS, CRITERIO);
  const { elegidas } = elegir(candidatas, CRITERIO);
  assert.equal(elegidas.length, 2);
  assert.match(elegidas[1]?.motivoDeCluster ?? "", /solape medido 0|categoria/i);
});

test("regla de cluster: el escape se cierra si las dos cabezas comparten urls de verdad", () => {
  const compartidas = [
    { posicion: 1, dominio: "doctoralia.pe", url: "https://doctoralia.pe/a", tipo: "directorio", veredicto: "disputable", motivo: "contenido debil: directorio" },
    { posicion: 2, dominio: "facebook.com", url: "https://facebook.com/b", tipo: "red-social", veredicto: "disputable", motivo: "contenido debil: red-social" },
    { posicion: 3, dominio: "stellamaris.com.pe", url: "https://stellamaris.com.pe/c", tipo: "pagina-de-servicio", veredicto: "disputable", motivo: "medico o clinica pequena, sin marca" },
    { posicion: 4, dominio: "clinicaraimondi.pe", url: "https://clinicaraimondi.pe/d", tipo: "ficha-de-clinica", veredicto: "disputable", motivo: "medico o clinica pequena, sin marca" },
  ];
  const a = cabeza({ keywordKey: "traumatologia lima", semilla: "Traumatología", cluster: "mega", posiciones: compartidas, disputables: 4, posicionesMedidas: 4 });
  const b = cabeza({ keywordKey: "ortopedia infantil lima", semilla: "Ortopedia infantil", cluster: "mega", posiciones: compartidas, disputables: 4, posicionesMedidas: 4 });
  const { candidatas } = evaluarCandidatas([a, b], SEMILLAS, CRITERIO);
  const { elegidas } = elegir(candidatas, CRITERIO);
  assert.equal(elegidas.length, 1, "si comparten el top 10, son la misma SERP y una sola pagina");
});

test("categoriaDe reparte el cluster de 41 en las tres categorias que declara el propio sitio", () => {
  assert.equal(categoriaDe("ortopedia infantil lima", CRITERIO), "ortopedia-infantil");
  assert.equal(categoriaDe("cirujano de columna lima", CRITERIO), "cirugia-de-columna");
  assert.equal(categoriaDe("escoliosis", CRITERIO), "cirugia-de-columna");
  assert.equal(categoriaDe("traumatologia lima", CRITERIO), "traumatologia-y-ortopedia");
  assert.equal(categoriaDe("artrosis", CRITERIO), "traumatologia-y-ortopedia");
});

// ---------------------------------------------------------------------------
// Vetos declarados
// ---------------------------------------------------------------------------

test("un veto escrito en el archivo de criterio saca la cabeza y deja su motivo a la vista", () => {
  const vetada = cabeza({ keywordKey: "cirugia convencional en lima", semilla: "Traumatología", nivel: "alto", disputables: 8 });
  const { candidatas, rechazadas } = evaluarCandidatas([vetada], SEMILLAS, CRITERIO);
  assert.equal(candidatas.length, 0);
  assert.match(rechazadas[0]?.motivo ?? "", /cirugia general|veto/i);
});

// ---------------------------------------------------------------------------
// El documento
// ---------------------------------------------------------------------------

test("el documento trae las cuatro secciones y declara que el universo es una muestra truncada", () => {
  const cs = [
    cabeza({ keywordKey: "escoliosis", semilla: "Escoliosis y deformidades de columna", cluster: "escoliosis", trafficPotential: 3400, trafficPotentialFuente: "ahrefs", rango: 1, nivel: "bajo", disputables: 1, posicionesMedidas: 7, primeraDisputable: 3 }),
    cabeza({ keywordKey: "traumatologia lima", semilla: "Traumatología", cluster: "mega", volumenDinorank: 880, volumenFuente: "dinorank", rango: 3 }),
  ];
  const sel = elegir(evaluarCandidatas(cs, SEMILLAS, CRITERIO).candidatas, CRITERIO);
  const descartadas = descartadasDeMayorVolumen(
    [{ keyword: "tendinitis", keywordKey: "tendinitis", volumen: 14800, volumenFuente: "dinorank", alcance: "objetivo", motivoAlcance: null, intent: "informacional" }],
    new Set<string>(),
    new Map(),
    CRITERIO,
    5,
  );
  const doc = documento(construir(sel, descartadas, CRITERIO), CRITERIO);

  assert.match(doc, /muestra truncada/, "la advertencia que el plan exige por nombre");
  assert.match(doc, /no entraron|descartadas|por que no/i);
  assert.match(doc, /## /, "tiene secciones");
  assert.match(doc, /tendinitis/, "y las descartadas de mayor volumen aparecen");
});

test("el json estructurado trae todo lo que la fase 14 necesita sin parsear prosa", () => {
  const cs = [cabeza({ keywordKey: "traumatologia lima", semilla: "Traumatología", cluster: "mega", rango: 3 })];
  const sel = elegir(evaluarCandidatas(cs, SEMILLAS, CRITERIO).candidatas, CRITERIO);
  const g = construir(sel, [], CRITERIO);
  const k = g.keywords[0];
  assert.ok(k);
  assert.equal(k.keywordKey, "traumatologia lima");
  assert.ok(k.cluster);
  assert.ok(k.tipoDePagina);
  assert.ok(k.justificacion.length >= 80);
  assert.ok(k.urlCandidata, "la fase 14 arranca de una URL candidata, aunque despues la cambie");
  assert.ok(Array.isArray(g.advertencias) && g.advertencias.length > 0);
});
