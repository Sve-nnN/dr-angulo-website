import assert from "node:assert/strict";
import { test } from "node:test";

import { serpDesdeCuerpo } from "../phase13/serp.js";
import { entidadesDelTop10 } from "./entidades.js";

/** Arma un cuerpo crudo de SerpApi con la forma minima que consume el parser de la fase 13. */
function cuerpo(docs: readonly { titulo: string; fragmento: string; link?: string }[]): unknown {
  return {
    organic_results: docs.map((d, i) => ({
      position: i + 1,
      link: d.link ?? `https://ejemplo${i + 1}.org/articulo`,
      title: d.titulo,
      snippet: d.fragmento,
    })),
  };
}

const serpDe = (docs: readonly { titulo: string; fragmento: string; link?: string }[]) =>
  serpDesdeCuerpo("hernia discal", cuerpo(docs));

test("entidades: cada termino declara en cuantos documentos aparecio y en que posiciones", () => {
  // Siete organicos, como los que trae la captura real de `hernia discal`. `disco
  // intervertebral` aparece en cinco de los siete y en posiciones conocidas: eso es lo que
  // ONPAGE-03 pide y lo que un conteo de frecuencia bruta perderia.
  const serp = serpDe([
    { titulo: "Hernia discal sintomas y causas", fragmento: "El disco intervertebral se desplaza" },
    { titulo: "Hernia discal enciclopedia", fragmento: "parte de un disco intervertebral pasa" },
    { titulo: "Hernia discal lumbar", fragmento: "salida del nucleo pulposo al canal" },
    { titulo: "Sintomas de la hernia discal", fragmento: "el disco intervertebral presiona la raiz" },
    { titulo: "Tratamiento de hernia discal", fragmento: "el disco intervertebral se rompe" },
    { titulo: "Causas de hernia discal lumbar", fragmento: "levantar peso daña el disco intervertebral" },
    { titulo: "Hernia del disco lumbar", fragmento: "desplazamiento focal del material discal" },
  ]);

  const r = entidadesDelTop10(serp);
  const disco = r.entidades.find((e) => e.termino === "disco intervertebral");

  assert.ok(disco, "disco intervertebral tiene que salir como entidad obligatoria");
  assert.equal(disco.documentos, 5);
  assert.equal(disco.de, 7);
  assert.deepEqual(disco.posiciones, [1, 2, 4, 5, 6]);
  assert.equal(
    disco.posiciones.length,
    disco.documentos,
    "el largo de las posiciones ES el conteo de documentos: si difieren, la procedencia miente",
  );
});

test("entidades: un termino de un solo resultado queda fuera del umbral por defecto", () => {
  // Uno de siete es 0,14 y el umbral por defecto es 0,4. Un termino que solo dijo un
  // competidor no es una exigencia de la SERP: es el vocabulario de ese competidor.
  const serp = serpDe([
    { titulo: "Hernia discal sintomas", fragmento: "dolor que baja por la pierna" },
    { titulo: "Hernia discal causas", fragmento: "dolor que baja por la pierna" },
    { titulo: "Hernia discal tratamiento", fragmento: "dolor que baja por la pierna" },
    { titulo: "Hernia discal diagnostico", fragmento: "quiropraxia biomagnetica exclusiva" },
    { titulo: "Hernia discal cirugia", fragmento: "dolor que baja por la pierna" },
    { titulo: "Hernia discal lumbar", fragmento: "dolor que baja por la pierna" },
    { titulo: "Hernia discal cervical", fragmento: "dolor que baja por la pierna" },
  ]);

  const r = entidadesDelTop10(serp);
  const terminos = r.entidades.map((e) => e.termino);

  assert.equal(r.umbralAplicado, 0.4);
  assert.ok(!terminos.includes("quiropraxia biomagnetica"), `salio: ${terminos.join(", ")}`);
  assert.ok(terminos.some((t) => t.includes("hernia discal")));
});

test("entidades: dominios, marcas de competidores y ruido de navegacion no son entidad clinica", () => {
  // El corpus es title + snippet, o sea texto de presentacion. Ahi conviven el vocabulario
  // clinico y el nombre del sitio que lo publica. Confundirlos le pediria a la pagina del
  // doctor que nombre a Mayo Clinic para posicionar, que es exactamente lo contrario.
  const serp = serpDe([
    {
      titulo: "Hernia discal - Mayo Clinic",
      fragmento: "Inicio Contacto Leer mas sobre el disco intervertebral en mayoclinic",
      link: "https://www.mayoclinic.org/es/hernia",
    },
    {
      titulo: "Hernia discal - MedlinePlus",
      fragmento: "Inicio Contacto Leer mas sobre el disco intervertebral en medlineplus",
      link: "https://medlineplus.gov/spanish/hernia.htm",
    },
    {
      titulo: "Hernia discal - Quironsalud",
      fragmento: "Inicio Contacto Leer mas sobre el disco intervertebral en quironsalud",
      link: "https://www.quironsalud.com/hernia",
    },
    {
      titulo: "Hernia discal - Auna",
      fragmento: "Inicio Contacto Leer mas sobre el disco intervertebral en auna",
      link: "https://auna.org/pe/hernia",
    },
    {
      titulo: "Hernia discal - Clinic Barcelona",
      fragmento: "Inicio Contacto Leer mas sobre el disco intervertebral en clinicbarcelona",
      link: "https://www.clinicbarcelona.org/hernia",
    },
  ]);

  const terminos = entidadesDelTop10(serp).entidades.map((e) => e.termino);
  const prohibidos = [
    "mayoclinic",
    "mayo clinic",
    "medlineplus",
    "quironsalud",
    "auna",
    "clinicbarcelona",
    "clinic barcelona",
    "inicio",
    "contacto",
    "leer mas",
  ];

  for (const p of prohibidos) {
    assert.ok(
      !terminos.includes(p),
      `"${p}" salio como entidad obligatoria y no lo es. Lista: ${terminos.join(", ")}`,
    );
  }
  assert.ok(
    terminos.includes("disco intervertebral"),
    `el termino clinico si tiene que salir. Lista: ${terminos.join(", ")}`,
  );
});

test("entidades: ocho terminos genericos no dan por satisfecha la bandera de insuficientes", () => {
  // La bandera existe para declarar "esta SERP no dio lo suficiente". Contando el total, ocho
  // terminos institucionales la dejaban en false: quedaba satisfecha por ruido.
  const institucional = "Somos especialistas y contamos con la experiencia de nuestros medicos";
  const serp = serpDe(
    Array.from({ length: 9 }, (_, i) => ({
      titulo: `Especialidad y calidad en Lima ${i}`,
      fragmento: institucional,
      link: `https://sitio${i}.pe/pagina`,
    })),
  );

  const resultado = entidadesDelTop10(serp);
  const terminos = resultado.entidades.map((e) => e.termino);

  for (const primeraPersona of ["somos", "contamos", "nuestros"]) {
    assert.ok(!terminos.includes(primeraPersona), `"${primeraPersona}" salio como exigencia`);
  }
  assert.ok(
    resultado.entidadesInsuficientes,
    `una SERP sin vocabulario clinico tiene que declararse insuficiente. Lista: ${terminos.join(", ")}`,
  );
});
