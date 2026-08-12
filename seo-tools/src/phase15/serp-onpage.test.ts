import assert from "node:assert/strict";
import { test } from "node:test";

import { leerSerp } from "../phase13/serp.js";
import { MINIMO_DE_MOTIVO } from "./model.js";
import {
  construirOnPageSerp,
  filasDelMapa,
  formatoDe,
  jerarquiaDe,
  minimoDePalabrasDe,
} from "./serp-onpage.js";

/** Las cinco secundarias de `/servicios/hernia-discal` en `url-map.jsonl`, que es de solo lectura. */
const SECUNDARIAS_DE_HERNIA = [
  "hernia discal lumbar y cervical",
  "hernia discal lumbosacra tratamiento",
  "ciatica o hernia discal",
  "hernia discal tomografía",
  "lumbalgia o hernia discal",
] as const;

/** Lee la captura ya pagada. Offline: si faltara, falla la prueba en vez de gastar cuota. */
async function jerarquiaDeHernia() {
  const serp = await leerSerp("hernia discal", { offline: true });
  return {
    serp,
    resultado: jerarquiaDe({
      keywordPrimaria: "hernia discal",
      formato: "guia-clinica",
      secundarias: SECUNDARIAS_DE_HERNIA,
      preguntas: serp.preguntas,
      relacionadas: serp.relacionadas,
    }),
  };
}

test("serp-onpage: las cuatro preguntas de la SERP entran como encabezado o quedan nombradas con motivo", async () => {
  // La conducta que importa no es que las cuatro entren: es que ninguna desaparezca en
  // silencio. Una pregunta descartada sin motivo escrito deja la jerarquia sin forma de
  // auditar si respeta el lenguaje del paciente o lo invento quien escribio.
  const { serp, resultado } = await jerarquiaDeHernia();

  assert.equal(serp.preguntas.length, 4, "la captura de hernia discal trae cuatro preguntas");

  const usadas = resultado.jerarquia.filter((h) => h.origen === "pregunta-serp");
  assert.equal(
    usadas.length + resultado.preguntasSinUsar.length,
    serp.preguntas.length,
    "cada pregunta esta usada o nombrada, nunca perdida",
  );

  for (const h of usadas) {
    assert.ok(
      serp.preguntas.includes(h.literal ?? ""),
      `el literal "${h.literal}" tiene que ser la pregunta cruda de la SERP`,
    );
  }
  for (const p of resultado.preguntasSinUsar) {
    assert.ok(
      p.motivo.length >= MINIMO_DE_MOTIVO,
      `el motivo de "${p.pregunta}" es una etiqueta y no una explicacion: "${p.motivo}"`,
    );
  }
});

test("serp-onpage: ninguna secundaria del mapa queda sin encabezado que la cubra", async () => {
  // Los anchors de la matriz de enlazado del plan 14-04 salen de estas secundarias (D-15).
  // Una secundaria sin encabezado deja sin respaldo al anchor que apunta aca.
  const { resultado } = await jerarquiaDeHernia();

  assert.equal(resultado.coberturaDeSecundarias.length, SECUNDARIAS_DE_HERNIA.length);
  for (const c of resultado.coberturaDeSecundarias) {
    assert.ok(c.cubiertaPor, `la secundaria "${c.keyword}" quedo sin encabezado`);
  }
});

test("serp-onpage: la jerarquia arranca por el esqueleto del formato y no por la lista de keywords", async () => {
  // El indice de una guia clinica sigue el recorrido del paciente. Si el primer encabezado
  // fuera una busqueda relacionada, el documento seria una lista de keywords pegadas.
  const { resultado } = await jerarquiaDeHernia();
  const primero = resultado.jerarquia[0];

  assert.ok(primero);
  assert.equal(primero.nivel, 2);
  assert.equal(primero.origen, "esqueleto");
  assert.ok(
    resultado.jerarquia.filter((h) => h.nivel === 2).length >= 5,
    "una guia clinica no baja de cinco secciones de nivel 2",
  );
});

test("serp-onpage: entran las 16 URLs con primaria y no entran las 8 que declararon no competir", async () => {
  // Ocho URLs del mapa no tienen keyword primaria a proposito y lo declararon por escrito en
  // la fase 14. Inventarles jerarquia seria inventarles una intencion que el mapa les nego.
  const dataset = await construirOnPageSerp();
  const conPrimaria = filasDelMapa().filter((f) => f.keywordPrimaria);

  assert.equal(conPrimaria.length, 16);
  assert.equal(dataset.urls.length, 16);
  assert.equal(dataset.sinCaptura.length, 0, "las 16 primarias tienen captura en cache");

  const emitidas = new Set(dataset.urls.map((u) => u.url));
  for (const fila of filasDelMapa()) {
    assert.equal(
      emitidas.has(fila.url),
      Boolean(fila.keywordPrimaria),
      `${fila.url} esta del lado equivocado del corte`,
    );
  }
});

test("serp-onpage: el formato lo decide la SERP y no la carpeta", () => {
  // `/servicios/estenosis-espinal` vive en /servicios/ y su top 10 es 8 de 8 contenido
  // informativo. Escribirle una pagina de servicio seria competir en el formato equivocado
  // contra una SERP que ya dijo que premia otra cosa.
  assert.equal(formatoDe("/servicios/estenosis-espinal", "contenido-internacional"), "guia-clinica");
  assert.equal(formatoDe("/blog/artrosis", "guia"), "guia-clinica");
  assert.equal(formatoDe("/servicios/ortopedia-infantil", "pagina-de-servicio"), "pagina-de-servicio");
  // El prefijo de sede es lo unico que la SERP no puede repartir: los dos moldes rankean igual.
  assert.equal(formatoDe("/sedes/clinica-tezza", "pagina-de-servicio"), "ficha-de-sede");
  assert.equal(formatoDe("/sedes/sanna-la-molina", "red-social"), "ficha-de-sede");
});

test("serp-onpage: cada URL declara el minimo de palabras que los planes de copy tienen que cumplir", () => {
  // Es el contrato de D-05 contra la tentacion de entregar esquema en vez de pagina. Las dos
  // guias que absorben un post del blog llevan 1400 porque el material fundido cabe adentro.
  assert.equal(minimoDePalabrasDe("/servicios/hernia-discal", "guia-clinica"), 1400);
  assert.equal(minimoDePalabrasDe("/servicios/estenosis-espinal", "guia-clinica"), 1400);
  assert.equal(minimoDePalabrasDe("/sedes/clinica-tezza", "ficha-de-sede"), 500);
  assert.ok(minimoDePalabrasDe("/una/url/que-no-esta-en-la-tabla", "ficha-de-sede") > 0);
});

test("serp-onpage: una URL cuyo umbral de entidades tuvo que bajarse lo registra en su fila", async () => {
  // Sin el umbral aplicado al lado, dos filas con doce entidades cada una pareceria que
  // midieron lo mismo, y una puede venir de exigir el 40 % de los organicos y la otra el 20 %.
  const dataset = await construirOnPageSerp();

  for (const u of dataset.urls) {
    assert.ok(u.umbralAplicado >= 0.2 && u.umbralAplicado <= 0.4, `${u.url}: ${u.umbralAplicado}`);
    if (!u.entidadesInsuficientes) {
      assert.ok(u.entidades.length >= 8 && u.entidades.length <= 20, `${u.url}`);
    }
  }

  assert.ok(
    dataset.urls.some((u) => u.umbralAplicado < 0.4),
    "al menos una SERP no dio ocho terminos al umbral por defecto y tuvo que bajarlo",
  );
});

test("serp-onpage: dos corridas del generador producen el mismo dataset", async () => {
  // El documento se regenera, no se edita (D-12). Y el dataset es su fuente: si el generador
  // no fuera determinista, cada corrida cambiaria los dieciseis paquetes sin que nadie lo pida.
  const [a, b] = await Promise.all([construirOnPageSerp(), construirOnPageSerp()]);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});
