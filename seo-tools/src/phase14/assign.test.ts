/**
 * Pruebas del asignador de keywords a URLs.
 *
 * Una prueba por cada conducta declarada en el plan 14-02, mas la del calculo de accion.
 *
 * La mayoria corre contra datos sinteticos minimos, a proposito: una conducta como "si hay
 * menos de tres candidatas a secundaria el asignador falla" no se puede provocar con el
 * universo real sin recortarlo, y recortarlo dentro de la prueba es escribir el dato dos veces.
 * La unica que si corre contra la realidad es la del guardarrail de fusion (D-05), porque lo
 * que esa prueba defiende es justamente que el trio del cluster de 41 cabezas no se colapse, y
 * eso solo significa algo medido contra las 96 capturas ya pagadas.
 *
 * Coste de cuota: cero. Todo lo que toca SERP se lee en modo offline.
 *
 * El prefijo `assign:` de cada nombre es lo que hace que
 * `npm test -- --test-name-pattern=assign` seleccione este archivo.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ErrorDeAsignacion,
  asignar,
  clinicaDe,
  distritoDe,
  esExclusivaDeCaptacion,
  intentSegunSerp,
  motivoDeExclusion,
  type EntradaDeAsignacion,
  type EspecificacionDeUrl,
  type KeywordDeOro,
  type RegistroDeKeyword,
} from "./assign.js";
import { cargarIndiceDeSerp, type IndiceDeSerp } from "./overlap.js";

/** Indice vacio: para las pruebas sinteticas no hay ninguna fusion que consultar. */
const INDICE_VACIO: IndiceDeSerp = {
  porClave: new Map(),
  sinCaptura: [],
  tope: 10,
};

function kw(
  keyword: string,
  cluster: string,
  volumen: number | null = null,
  intent = "transaccional",
): RegistroDeKeyword {
  return {
    keyword,
    keywordKey: keyword,
    cluster,
    clusterFuente: "serp",
    intent,
    metricas: { searchVolume: volumen },
  };
}

function oro(keyword: string, cluster: string, url: string, valor: number, puesto: number): KeywordDeOro {
  return {
    puesto,
    keyword,
    keywordKey: keyword,
    cluster,
    valorDeNegocio: valor,
    volumenAhrefs: null,
    keywordDifficulty: null,
    trafficPotential: null,
    tipoDePagina: "pagina-de-servicio",
    intent: "transaccional",
    urlCandidata: { url },
  };
}

function spec(parcial: Partial<EspecificacionDeUrl> & { url: string }): EspecificacionDeUrl {
  return {
    titulo: `Titulo de ${parcial.url}`,
    origen: "prueba",
    estado: "viva",
    esPaginaSeo: true,
    familia: "servicio",
    tipoDePagina: "pagina-de-servicio",
    topic: "servicios",
    candidatas: [],
    sirveHoy: null,
    porQue: "Motivo de prueba, suficientemente largo para pasar el minimo de prosa exigido.",
    ...parcial,
  };
}

function entrada(parcial: Partial<EntradaDeAsignacion>): EntradaDeAsignacion {
  return {
    especificaciones: [],
    universo: [],
    oro: [],
    sedesDeOro: [],
    puntoDulce: [],
    tiposDePagina: [],
    inventario: [],
    indice: INDICE_VACIO,
    ...parcial,
  };
}

const CLUSTER_DE_PRUEBA = [
  kw("hernia discal", "hernia-discal", null, "informacional"),
  kw("tratamiento de hernia discal", "hernia-discal", 100, "comercial"),
  kw("operacion de hernia discal", "hernia-discal", 90, "comercial"),
  kw("sintomas de hernia discal", "hernia-discal", 80, "informacional"),
  kw("ejercicios para hernia discal", "hernia-discal", 70, "informacional"),
  kw("hernia discal cirugia precio", "hernia-discal", 60, "transaccional"),
];

test("assign: una URL de servicio recibe como primaria la keyword de oro de su tema", () => {
  const { asignaciones } = asignar(
    entrada({
      universo: CLUSTER_DE_PRUEBA,
      oro: [oro("hernia discal", "hernia-discal", "/servicios/hernia-discal", 48, 1)],
      especificaciones: [
        spec({ url: "/servicios/hernia-discal", candidatas: ["hernia discal"] }),
      ],
    }),
  );

  assert.equal(asignaciones.length, 1);
  assert.equal(asignaciones[0]?.keywordPrimaria, "hernia discal");
  assert.equal(asignaciones[0]?.cluster, "hernia-discal");
});

test("assign: cuando dos URLs pelean la misma primaria gana la de oro y el desempate queda escrito", () => {
  const universo = [
    ...CLUSTER_DE_PRUEBA,
    kw("estenosis espinal", "estenosis-espinal", null, "informacional"),
    kw("tratamiento de estenosis espinal", "estenosis-espinal", 40, "comercial"),
    kw("sintomas de estenosis espinal", "estenosis-espinal", 30, "informacional"),
    kw("operacion de estenosis espinal", "estenosis-espinal", 20, "comercial"),
  ];

  const { asignaciones, conflictos } = asignar(
    entrada({
      universo,
      oro: [oro("hernia discal", "hernia-discal", "/servicios/hernia-discal", 48, 1)],
      especificaciones: [
        spec({ url: "/servicios/hernia-discal", candidatas: ["hernia discal"] }),
        spec({
          url: "/servicios/estenosis-espinal",
          candidatas: ["hernia discal", "estenosis espinal"],
        }),
      ],
    }),
  );

  const ganadora = asignaciones.find((a) => a.url === "/servicios/hernia-discal");
  const perdedora = asignaciones.find((a) => a.url === "/servicios/estenosis-espinal");
  assert.equal(ganadora?.keywordPrimaria, "hernia discal");
  assert.equal(perdedora?.keywordPrimaria, "estenosis espinal");

  const conflicto = conflictos.find((c) => c.keyword === "hernia discal");
  assert.ok(conflicto, "el desempate tiene que quedar registrado, no resolverse en silencio");
  assert.equal(conflicto?.ganadora, "/servicios/hernia-discal");
  assert.equal(conflicto?.perdedora, "/servicios/estenosis-espinal");
  assert.match(conflicto?.motivo ?? "", /oro/i);
});

test("assign: dos URLs del mismo cluster no se fusionan sin veredicto de solape", async () => {
  // El trio real del cluster de 41 cabezas. Comparten cluster y CERO URLs del top 10.
  const indice = await cargarIndiceDeSerp([
    "cirujano de columna lima",
    "traumatología lima",
    "cirugía de columna lima",
    "traumatólogo lima",
    "traumatología y ortopedia lima",
    "ortopedia infantil lima",
    "ortopedia infantil",
    "traumatólogo ortopedia infantil",
  ]);

  const universo = [
    kw("cirujano de columna lima", "especialista-en-columna-y-trauma-en-lima"),
    kw("traumatología lima", "especialista-en-columna-y-trauma-en-lima", 880),
    kw("cirugía de columna lima", "especialista-en-columna-y-trauma-en-lima"),
    kw("traumatólogo lima", "especialista-en-columna-y-trauma-en-lima"),
    kw("traumatología y ortopedia lima", "especialista-en-columna-y-trauma-en-lima"),
    kw("ortopedia infantil lima", "especialista-en-columna-y-trauma-en-lima", 10),
  ];

  const { asignaciones, veredictos } = asignar(
    entrada({
      universo,
      indice,
      especificaciones: [
        spec({ url: "/servicios", familia: "hub", candidatas: ["cirujano de columna lima"] }),
        spec({ url: "/", familia: "home", candidatas: ["traumatología lima"] }),
      ],
    }),
  );

  assert.equal(asignaciones.length, 2, "dos URLs del mismo cluster siguen siendo dos URLs");
  assert.notEqual(asignaciones[0]?.keywordPrimaria, asignaciones[1]?.keywordPrimaria);

  const veredicto = veredictos.find(
    (v) =>
      [v.a, v.b].includes("cirujano de columna lima") && [v.a, v.b].includes("traumatología lima"),
  );
  assert.ok(veredicto, "el asignador tiene que pedir el veredicto antes de acercar dos URLs");
  assert.equal(veredicto?.fusionable, false);
  assert.equal(veredicto?.cardinalidad, 0);
});

test("assign: las secundarias salen del cluster de la primaria y son de tres a cinco", () => {
  const { asignaciones } = asignar(
    entrada({
      universo: CLUSTER_DE_PRUEBA,
      especificaciones: [spec({ url: "/servicios/hernia-discal", candidatas: ["hernia discal"] })],
    }),
  );

  const fila = asignaciones[0];
  assert.ok(fila);
  assert.ok(fila.secundarias.length >= 3 && fila.secundarias.length <= 5);
  assert.ok(fila.keywordPrimaria !== null, "una pagina de servicio siempre trae primaria");
  assert.ok(!fila.secundarias.includes(fila.keywordPrimaria), "la primaria no se repite abajo");
  const claves = new Set(CLUSTER_DE_PRUEBA.map((k) => k.keywordKey));
  for (const s of fila.secundarias) assert.ok(claves.has(s), `${s} no es del cluster de la primaria`);
});

test("assign: con menos de tres candidatas a secundaria el asignador falla en vez de rellenar", () => {
  assert.throws(
    () =>
      asignar(
        entrada({
          universo: [
            kw("hernia discal", "hernia-discal"),
            kw("tratamiento de hernia discal", "hernia-discal", 100, "comercial"),
          ],
          especificaciones: [
            spec({ url: "/servicios/hernia-discal", candidatas: ["hernia discal"] }),
          ],
        }),
      ),
    ErrorDeAsignacion,
  );
});

test("assign: una marca de competidor o un codigo CIE-10 nunca queda de primaria ni de secundaria", () => {
  assert.ok(motivoDeExclusion("clinica arthromeds lima") !== null);
  assert.ok(motivoDeExclusion("dr paul carranza columna") !== null);
  assert.ok(motivoDeExclusion("hernia discal cie 10") !== null);
  assert.ok(motivoDeExclusion("m51.1 cie10") !== null);
  assert.equal(motivoDeExclusion("tratamiento de hernia discal"), null);

  const universo = [
    ...CLUSTER_DE_PRUEBA,
    kw("hernia discal cie 10", "hernia-discal", 5000, "informacional"),
    kw("hernia discal clinica arthromeds", "hernia-discal", 4000, "transaccional"),
  ];
  const { asignaciones } = asignar(
    entrada({
      universo,
      especificaciones: [spec({ url: "/servicios/hernia-discal", candidatas: ["hernia discal"] })],
    }),
  );

  const todas = [asignaciones[0]?.keywordPrimaria ?? "", ...(asignaciones[0]?.secundarias ?? [])];
  for (const t of todas) assert.equal(motivoDeExclusion(t), null, `${t} tendria que estar excluida`);
});

test("assign: las mejores pastillas para la ciatica solo puede ir en una URL de captacion", () => {
  assert.equal(esExclusivaDeCaptacion("las mejores pastillas para la ciática"), true);
  assert.equal(esExclusivaDeCaptacion("ciática"), false);

  const universo = [
    kw("ciática", "ciatica", 900, "informacional"),
    kw("las mejores pastillas para la ciática", "ciatica", 1200, "comercial"),
    kw("sintomas de ciatica", "ciatica", 300, "informacional"),
    kw("tratamiento de ciatica", "ciatica", 200, "comercial"),
    kw("ejercicios para la ciatica", "ciatica", 150, "informacional"),
  ];

  const enServicio = asignar(
    entrada({
      universo,
      especificaciones: [
        spec({ url: "/servicios/ciatica", familia: "servicio", candidatas: ["ciática"] }),
      ],
    }),
  );
  assert.ok(
    !enServicio.asignaciones[0]?.secundarias.includes("las mejores pastillas para la ciática"),
    "una URL de servicio no puede llevarla ni de secundaria",
  );

  const enCaptacion = asignar(
    entrada({
      universo,
      especificaciones: [
        spec({
          url: "/blog/ciatica",
          familia: "contenido",
          tipoDePagina: "guia",
          topic: "blog",
          candidatas: ["ciática"],
        }),
      ],
    }),
  );
  assert.ok(
    enCaptacion.asignaciones[0]?.secundarias.includes("las mejores pastillas para la ciática"),
    "en una URL de captacion si entra",
  );
});

test("assign: una keyword con modificador de distrito no genera URL propia y entra de secundaria", () => {
  assert.equal(distritoDe("ortopedia infantil la molina"), "la molina");
  assert.equal(distritoDe("hernia discal"), null);

  const universo = [
    kw("cirujano de columna clínica sanna", "cirujano-de-columna-clinica-sanna"),
    kw("traumatólogo clínica sanna", "cirujano-de-columna-clinica-sanna"),
    kw("cirugía de columna clínica sanna", "cirujano-de-columna-clinica-sanna"),
    kw("ortopedia clínica sanna", "cirujano-de-columna-clinica-sanna"),
    kw("ortopedia infantil la molina", "cirugia-de-columna-la-molina"),
  ];

  // Una URL de servicio, sin distrito, no puede tomarla de primaria.
  assert.throws(
    () =>
      asignar(
        entrada({
          universo,
          especificaciones: [
            spec({
              url: "/servicios/ortopedia-infantil-la-molina",
              estado: "planificada",
              candidatas: ["ortopedia infantil la molina"],
            }),
          ],
        }),
      ),
    ErrorDeAsignacion,
  );

  // En la sede del distrito que le corresponde, entra de secundaria.
  const { asignaciones } = asignar(
    entrada({
      universo,
      especificaciones: [
        spec({
          url: "/sedes/sanna-la-molina",
          familia: "sede",
          tipoDePagina: "pagina-de-sede",
          topic: "sedes",
          clinica: "clínica sanna",
          distrito: "la molina",
          candidatas: ["cirujano de columna clínica sanna"],
        }),
      ],
    }),
  );
  assert.ok(asignaciones[0]?.secundarias.includes("ortopedia infantil la molina"));
});

test("assign: una keyword con nombre de clinica si puede ser primaria de una URL de sede", () => {
  assert.equal(clinicaDe("cirujano de columna clínica sanna"), "clínica sanna");
  assert.equal(clinicaDe("hernia discal"), null);

  const universo = [
    kw("ortopedia infantil clínica tezza", "cirujano-de-columna-clinica-tezza"),
    kw("traumatólogo clínica tezza", "cirujano-de-columna-clinica-tezza"),
    kw("cirugía de columna clínica tezza", "cirujano-de-columna-clinica-tezza"),
    kw("ortopedia clínica tezza", "cirujano-de-columna-clinica-tezza"),
  ];

  const { asignaciones } = asignar(
    entrada({
      universo,
      especificaciones: [
        spec({
          url: "/sedes/clinica-tezza",
          familia: "sede",
          tipoDePagina: "pagina-de-sede",
          topic: "sedes",
          clinica: "clínica tezza",
          candidatas: ["ortopedia infantil clínica tezza"],
        }),
      ],
    }),
  );
  assert.equal(asignaciones[0]?.keywordPrimaria, "ortopedia infantil clínica tezza");
});

test("assign: la accion sale de comparar lo asignado contra lo que la pagina sirve hoy", () => {
  const base = {
    universo: CLUSTER_DE_PRUEBA,
    inventario: [
      { url: "/servicios/hernia-discal", estado: "viva" as const, mapeable: true, titulo: "x", origen: "y" },
    ],
    tiposDePagina: [
      {
        keywordKey: "hernia discal",
        tipoDePagina: "pagina-de-servicio",
        confianza: "alta",
        repartoDeTipos: { "pagina-de-servicio": 6 },
        posicionesMedidas: 7,
      },
    ],
  };

  const dejar = asignar(
    entrada({
      ...base,
      especificaciones: [
        spec({
          url: "/servicios/hernia-discal",
          candidatas: ["hernia discal"],
          sirveHoy: "hernia discal",
        }),
      ],
    }),
  );
  assert.equal(dejar.asignaciones[0]?.accion, "dejar");
  assert.equal(dejar.asignaciones[0]?.dejarActualizarEliminar, "dejar");

  const reescribir = asignar(
    entrada({
      ...base,
      especificaciones: [
        spec({
          url: "/servicios/hernia-discal",
          candidatas: ["hernia discal"],
          sirveHoy: "operacion de hernia discal",
        }),
      ],
    }),
  );
  assert.equal(reescribir.asignaciones[0]?.accion, "reescribir");
  assert.equal(reescribir.asignaciones[0]?.dejarActualizarEliminar, "actualizar");

  const crear = asignar(
    entrada({
      ...base,
      especificaciones: [
        spec({
          url: "/servicios/hernia-discal-cervical",
          estado: "planificada",
          candidatas: ["hernia discal"],
        }),
      ],
    }),
  );
  assert.equal(crear.asignaciones[0]?.accion, "crear");
});

test("assign: cada asignacion sale con justificacion en prosa o no sale", () => {
  const { asignaciones } = asignar(
    entrada({
      universo: CLUSTER_DE_PRUEBA,
      especificaciones: [spec({ url: "/servicios/hernia-discal", candidatas: ["hernia discal"] })],
    }),
  );
  assert.ok((asignaciones[0]?.justificacion.length ?? 0) > 40);

  assert.throws(
    () =>
      asignar(
        entrada({
          universo: CLUSTER_DE_PRUEBA,
          especificaciones: [
            spec({ url: "/servicios/hernia-discal", candidatas: ["hernia discal"], porQue: "" }),
          ],
        }),
      ),
    ErrorDeAsignacion,
  );
});

// --- Los dos huecos de calidad que la verificacion del plan 14-02 encontro. -------------------

test("assign: la intencion de la URL sale del top 10 medido y no de la carpeta donde vive", () => {
  // El caso testigo real: `estenosis espinal` cuelga de /servicios/, suena a operacion, y Google
  // le responde con ocho de ocho articulos informativos. Si la intencion saliera de la familia
  // de la URL, al cliente se le escribiria transaccional, que es la creencia previa y no el dato.
  const medido = intentSegunSerp(
    {
      keywordKey: "estenosis espinal",
      tipoDePagina: "contenido-internacional",
      confianza: "alta",
      repartoDeTipos: { "contenido-internacional": 8 },
      posicionesMedidas: 8,
    },
    "transaccional",
  );
  assert.equal(medido.intent, "informacional");
  assert.equal(medido.deLaSerp, true);
  assert.match(medido.evidencia, /NO la transaccional/);

  // Una SERP de fichas de clinica dice lo contrario sobre una keyword que el texto llamo
  // informacional. La medicion manda en las dos direcciones o no manda en ninguna.
  const sede = intentSegunSerp(
    {
      keywordKey: "cirujano de columna clinica x",
      tipoDePagina: "ficha-de-clinica",
      confianza: "alta",
      repartoDeTipos: { "ficha-de-clinica": 6, directorio: 2 },
      posicionesMedidas: 8,
    },
    "informacional",
  );
  assert.equal(sede.intent, "transaccional");
  assert.equal(sede.deLaSerp, true);
});

test("assign: sin SERP medida o con empate la intencion se declara inferida, no medida", () => {
  const sinSerp = intentSegunSerp(undefined, "comercial");
  assert.equal(sinSerp.intent, "comercial");
  assert.equal(sinSerp.deLaSerp, false);
  assert.match(sinSerp.evidencia, /sin SERP medida/);

  // `otro` no mapea a ninguna intencion: un top 10 entero de `otro` no autoriza a afirmar nada.
  const opaca = intentSegunSerp(
    {
      keywordKey: "algo",
      tipoDePagina: "otro",
      confianza: "baja",
      repartoDeTipos: { otro: 9 },
      posicionesMedidas: 9,
    },
    "transaccional",
  );
  assert.equal(opaca.intent, "transaccional");
  assert.equal(opaca.deLaSerp, false);

  // Empate 4-4 entre informacional y transaccional: tampoco autoriza a afirmar.
  const empate = intentSegunSerp(
    {
      keywordKey: "empatada",
      tipoDePagina: "guia",
      confianza: "media",
      repartoDeTipos: { guia: 4, "pagina-de-servicio": 4 },
      posicionesMedidas: 8,
    },
    "comercial",
  );
  assert.equal(empate.intent, "comercial");
  assert.equal(empate.deLaSerp, false);
});

test("assign: dos secundarias donde una contiene a la otra no gastan dos ranuras", () => {
  // Tres reformulaciones de lo mismo mas dos angulos distintos. Sin el filtro, las cinco ranuras
  // se van en un solo termino escrito de tres formas y el mapa miente sobre lo que la pagina
  // cubre.
  const universo: RegistroDeKeyword[] = [
    kw("escoliosis", "escoliosis", null, "informacional"),
    kw("cirugia de escoliosis", "escoliosis", 500, "transaccional"),
    kw("cirugia de escoliosis en lima", "escoliosis", 400, "transaccional"),
    kw("cirugia de escoliosis en lima peru", "escoliosis", 300, "transaccional"),
    kw("corrector de escoliosis", "escoliosis", 200, "comercial"),
    kw("ejercicios para escoliosis", "escoliosis", 100, "informacional"),
  ];
  const { asignaciones } = asignar(
    entrada({
      universo,
      especificaciones: [spec({ url: "/servicios/escoliosis-y-deformidades", candidatas: ["escoliosis"] })],
    }),
  );
  const secundarias = asignaciones[0]?.secundarias ?? [];
  assert.ok(secundarias.length >= 3);
  for (const a of secundarias) {
    for (const b of secundarias) {
      if (a === b) continue;
      assert.ok(!a.includes(b), `"${a}" contiene a "${b}": son la misma consulta dos veces`);
    }
  }
});
