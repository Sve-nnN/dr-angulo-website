import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ErrorDeAuditoria,
  FUERA_DEL_MAPA,
  RESTO,
  SIN_INTENCION,
  SIN_PRIMARIA,
  entraAlMapa,
  filasSinPrimaria,
  resolverAccion,
  temaPublicadoDe,
  urlsDelResto,
  verificarCandidataAlcanzable,
  verificarPostDeCaptacion,
  verificarUrlDeConversion,
  type EntradaDeAccion,
} from "./audit.js";
import { distritoFueraDeRed, motivoDeExclusion } from "./assign.js";
import { validarAsignacion } from "./model.js";

function entrada(parcial: Partial<EntradaDeAccion> = {}): EntradaDeAccion {
  return {
    url: "/ejemplo",
    existe: true,
    familia: "servicio",
    tema: null,
    sirveHoy: null,
    keywordAsignadaKey: null,
    tipoDePagina: "pagina-de-servicio",
    tipoExigidoPorSerp: null,
    veredicto: null,
    destinoDeRedireccion: null,
    ...parcial,
  };
}

// --- Conducta 1 -------------------------------------------------------------------------------

test("audit: una URL cuyo contenido publicado ya sirve la keyword asignada recibe dejar", () => {
  const r = resolverAccion(
    entrada({
      url: "/servicios/ortopedia-infantil",
      tema: temaPublicadoDe("/preguntas-frecuentes"),
      sirveHoy: "ortopedia infantil lima",
      keywordAsignadaKey: "ortopedia infantil lima",
      tipoExigidoPorSerp: "pagina-de-servicio",
      tipoDePagina: "pagina-de-servicio",
    }),
  );
  assert.equal(r.accion, "dejar");
  assert.equal(r.redirigeA, null);
  assert.match(r.motivoDeAccion, /ya responde/);
});

// --- Conducta 2 -------------------------------------------------------------------------------

test("audit: una URL cuyo contenido apunta a otro tema recibe reescribir con el motivo escrito y citado", () => {
  const r = resolverAccion(
    entrada({
      url: "/preguntas-frecuentes",
      tema: temaPublicadoDe("/preguntas-frecuentes"),
      sirveHoy: null,
      keywordAsignadaKey: "reumatologo o traumatologo",
      tipoExigidoPorSerp: "guia",
      tipoDePagina: "pagina-de-preguntas",
    }),
  );
  assert.equal(r.accion, "reescribir");
  assert.ok(r.motivoDeAccion.length >= 30, "el motivo tiene que ser prosa, no una etiqueta");
  assert.match(r.motivoDeAccion, /preguntas-frecuentes\/page\.tsx:10/);
  assert.match(r.motivoDeAccion, /Resolvemos las dudas más comunes/);
});

test("audit: el motivo de reescritura por formato distingue cambiar la keyword de cambiar el formato", () => {
  const r = resolverAccion(
    entrada({
      url: "/servicios/estenosis-espinal",
      sirveHoy: "estenosis espinal",
      keywordAsignadaKey: "estenosis espinal",
      tipoDePagina: "pagina-de-servicio",
      tipoExigidoPorSerp: "contenido-internacional",
    }),
  );
  assert.equal(r.accion, "reescribir");
  assert.match(r.motivoDeAccion, /lo que cambia es el formato y no la keyword/);
});

// --- Conducta 3 -------------------------------------------------------------------------------

test("audit: una keyword de oro sin URL que la pueda ganar produce una entrada crear y planificada", () => {
  const r = resolverAccion(entrada({ url: "/blog/artrosis", existe: false }));
  assert.equal(r.accion, "crear");
  assert.match(r.motivoDeAccion, /no existe todavia/);

  const planificadas = RESTO.filter((s) => s.estado === "planificada").map((s) => s.url);
  assert.deepEqual(planificadas.sort(), [
    "/blog/artrosis",
    "/blog/lumbalgia",
    "/servicios/cirugia-minimamente-invasiva",
  ]);
});

// --- Conducta 4 -------------------------------------------------------------------------------

test("audit: /privacidad no entra al mapa, y el motivo esta escrito", () => {
  assert.equal(entraAlMapa("/privacidad"), false);
  assert.match(FUERA_DEL_MAPA["/privacidad"] as string, /noindex/);
  assert.ok(!urlsDelResto().includes("/privacidad"));
});

test("audit: /servicios/escoliosis queda fuera del mapa por ser el slug viejo, no por no competir", () => {
  assert.equal(entraAlMapa("/servicios/escoliosis"), false);
  assert.match(FUERA_DEL_MAPA["/servicios/escoliosis"] as string, /escoliosis-y-deformidades/);
  assert.match(FUERA_DEL_MAPA["/servicios/escoliosis"] as string, /301/);
  assert.ok(!urlsDelResto().includes("/servicios/escoliosis"));
});

// --- Conducta 5 -------------------------------------------------------------------------------

test("audit: una URL de conversion rechaza una keyword de captacion", () => {
  assert.throws(
    () =>
      verificarUrlDeConversion("/agendar", "conversion", "las mejores pastillas para la ciática"),
    (error: unknown) => error instanceof ErrorDeAuditoria && /automedicacion/.test(String(error)),
  );
  assert.doesNotThrow(() => verificarUrlDeConversion("/agendar", "conversion", "traumatólogo lima"));
  assert.doesNotThrow(() =>
    verificarUrlDeConversion("/blog/x", "contenido", "las mejores pastillas para la ciática"),
  );
});

test("audit: ni /agendar ni /contacto llevan keyword de captacion, porque no llevan ninguna", () => {
  const conversion = SIN_PRIMARIA.filter((f) => ["/agendar", "/contacto"].includes(f.url));
  assert.equal(conversion.length, 2);
  for (const f of conversion) {
    assert.match(f.motivoSinPrimaria, /comparte \d+ URLs|comparten \d+ URLs/);
  }
});

// --- Conducta 6 -------------------------------------------------------------------------------

test("audit: la accion de un post de captacion nunca lo convierte en pagina de servicio (D-09)", () => {
  assert.throws(
    () =>
      verificarPostDeCaptacion(
        "/blog/5-sintomas-de-columna-que-no-debes-ignorar",
        "contenido",
        "las mejores pastillas para la ciática",
        "pagina-de-servicio",
      ),
    (error: unknown) => error instanceof ErrorDeAuditoria && /captacion/.test(String(error)),
  );
  assert.doesNotThrow(() =>
    verificarPostDeCaptacion("/blog/x", "contenido", "las mejores pastillas para la ciática", "guia"),
  );
  assert.doesNotThrow(() =>
    verificarPostDeCaptacion("/blog/x", "contenido", "ciática", "pagina-de-servicio"),
  );
});

// --- Conducta 7 -------------------------------------------------------------------------------

test("audit: una URL sin candidata alcanzable falla explicitamente en vez de recibir una primaria debil", () => {
  assert.throws(
    () => verificarCandidataAlcanzable("/testimonios", []),
    (error: unknown) =>
      error instanceof ErrorDeAuditoria && /No se le asigna una primaria debil/.test(String(error)),
  );
  assert.doesNotThrow(() => verificarCandidataAlcanzable("/", ["traumatologia lima"]));
});

// --- Conducta 8: la fila que declara que no compite --------------------------------------------

test("audit: una fila sin primaria es valida solo con esPaginaSeo falso, motivo escrito y cero secundarias", () => {
  const filas = filasSinPrimaria();
  assert.equal(filas.length, SIN_PRIMARIA.length);
  for (const f of filas) {
    assert.equal(f.keywordPrimaria, null);
    assert.equal(f.keywordPrimariaKey, null);
    assert.equal(f.esPaginaSeo, false);
    assert.equal(f.secundarias.length, 0);
    assert.equal(f.intent, SIN_INTENCION);
    assert.ok((f.motivoSinPrimaria ?? "").length >= 30);
  }
});

test("audit: una fila sin primaria que se declara esPaginaSeo true no valida", () => {
  const buena = filasSinPrimaria().find((f) => f.url === "/sedes");
  assert.ok(buena !== undefined);
  assert.throws(
    () => validarAsignacion({ ...buena, esPaginaSeo: true }, "prueba"),
    /no trae keyword primaria/,
  );
});

test("audit: una fila sin primaria y sin motivoSinPrimaria no valida", () => {
  const buena = filasSinPrimaria().find((f) => f.url === "/sedes");
  assert.throws(
    () => validarAsignacion({ ...buena, motivoSinPrimaria: null }, "prueba"),
    /motivoSinPrimaria/,
  );
});

test("audit: /sedes entra al mapa como decision de Juan y no como hueco", () => {
  const sedes = filasSinPrimaria().find((f) => f.url === "/sedes");
  assert.ok(sedes !== undefined);
  assert.equal(sedes.accion, "dejar");
  assert.match(sedes.motivoSinPrimaria as string, /2026-08-11/);
  assert.match(sedes.motivoSinPrimaria as string, /no es una omision|no una omision/);
});

// --- Conducta 9: el veredicto editorial que apaga una URL ---------------------------------------

test("audit: un veredicto de fusion produce redirigir con destino, y nunca con primaria", () => {
  const r = resolverAccion(
    entrada({
      url: "/blog/estenosis-espinal-que-es",
      veredicto: "fusionar",
      destinoDeRedireccion: "/servicios/estenosis-espinal",
      tema: temaPublicadoDe("/blog/estenosis-espinal-que-es"),
    }),
  );
  assert.equal(r.accion, "redirigir");
  assert.equal(r.redirigeA, "/servicios/estenosis-espinal");
  assert.match(r.motivoDeAccion, /guía completa/);
});

test("audit: un veredicto de fusion sin destino rompe la corrida", () => {
  assert.throws(
    () => resolverAccion(entrada({ veredicto: "redirigir", destinoDeRedireccion: null })),
    (error: unknown) => error instanceof ErrorDeAuditoria && /enlace roto/.test(String(error)),
  );
});

test("audit: una URL a punto de redirigir no puede llevar primaria", () => {
  assert.throws(
    () =>
      resolverAccion(
        entrada({
          veredicto: "fusionar",
          destinoDeRedireccion: "/servicios/hernia-discal",
          keywordAsignadaKey: "hernia discal",
        }),
      ),
    (error: unknown) => error instanceof ErrorDeAuditoria && /no compite por nada/.test(String(error)),
  );
});

test("audit: los dos posts que redirigen declaran su guia destino y quedan como eliminar", () => {
  const redirigen = filasSinPrimaria().filter((f) => f.accion === "redirigir");
  assert.deepEqual(
    redirigen.map((f) => [f.url, f.redirigeA]).sort(),
    [
      ["/blog/estenosis-espinal-que-es", "/servicios/estenosis-espinal"],
      [
        "/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
        "/servicios/hernia-discal",
      ],
    ].sort(),
  );
  for (const f of redirigen) assert.equal(f.dejarActualizarEliminar, "eliminar");
});

// --- Conducta 10: la geo de un distrito donde el doctor no atiende -------------------------------

test("audit: una geo de distrito fuera de la red del consultorio queda excluida con su motivo", () => {
  assert.equal(distritoFueraDeRed("ortopedia infantil en los olivos"), "los olivos");
  const motivo = motivoDeExclusion("ortopedia infantil en los olivos");
  assert.ok(motivo !== null);
  assert.match(motivo as string, /donde el doctor no atiende/);
});

test("audit: los tres distritos de la red siguen entrando", () => {
  for (const k of [
    "cirugía de columna san isidro",
    "ortopedia infantil surco",
    "cirugía de columna la molina",
  ]) {
    assert.equal(distritoFueraDeRed(k), null, k);
    assert.equal(motivoDeExclusion(k), null, k);
  }
});

test("audit: una cirugia de otra especialidad no entra de secundaria de la guia de columna", () => {
  const motivo = motivoDeExclusion("cirugía ortognática mínimamente invasiva precio");
  assert.ok(motivo !== null);
  assert.match(motivo as string, /otra especialidad/);
  assert.equal(motivoDeExclusion("cirugía mínimamente invasiva de columna"), null);
});

// --- Cobertura del lote -------------------------------------------------------------------------

test("audit: cada URL auditada trae su tema publicado con la cita literal y el archivo", () => {
  for (const url of urlsDelResto()) {
    if (RESTO.some((s) => s.url === url && s.estado === "planificada")) continue;
    const tema = temaPublicadoDe(url);
    assert.ok(tema !== null, `${url} no tiene tema publicado auditado`);
    assert.ok(tema.evidencia.length > 0, `${url} no tiene evidencia citada`);
    for (const e of tema.evidencia) {
      assert.match(e.archivo, /^src\/.+:\d+$/, `${url}: la evidencia tiene que citar archivo y linea`);
      assert.ok(e.cita.length > 10, `${url}: la cita tiene que ser texto literal`);
    }
  }
});

test("audit: el lote del plan 14-03 no pisa ninguna de las nueve del plan 14-02", () => {
  const nueve = new Set([
    "/servicios",
    "/servicios/escoliosis-y-deformidades",
    "/servicios/hernia-discal",
    "/servicios/estenosis-espinal",
    "/servicios/ortopedia-infantil",
    "/sedes/clinica-ricardo-palma",
    "/sedes/sanna-la-molina",
    "/sedes/clinica-tezza",
    "/sedes/consultorio-privado",
  ]);
  for (const url of urlsDelResto()) assert.ok(!nueve.has(url), `${url} ya estaba asignada`);
});
