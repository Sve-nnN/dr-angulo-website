# Las 91 cabezas de cluster: qué compran las 90 búsquedas

**Fecha:** 2026-08-11
**Estado:** **aprobado con cambios por Juan el 2026-08-11.**
**Estado del libro de cuota al cerrar la revisión:** SerpApi en **12**. Ninguna búsqueda se emitió antes de la aprobación.

Este documento es todo lo que hizo falta para decidir. No hay que abrir ningún archivo de datos.

---

## La decisión de Juan, 2026-08-11

Aprobó la lista con tres cambios. Quedó en **91 cabezas, 84 búsquedas nuevas y 6 de holgura**.

**Quitó las tres de clínica Montefiori:** `cirujano de columna clínica montefiori`,
`traumatólogo clínica montefiori` y `ortopedia infantil clínica montefiori`. Montefiori está
marcada como dato sin confirmar en `PROJECT.md` desde la fase 6, queda pendiente preguntarle al
doctor si sigue atendiendo ahí, y no es ninguna de las cuatro sedes que el sitio publica. Gastar
búsquedas irrecuperables en una sede sin confirmar no se justifica.

**Quitó dos de las tres de farmacia:** `cuál es el mejor antiinflamatorio para desgarro muscular` y
`cual es el mejor antiinflamatorio para la artrosis`. Son consultas de "qué pastilla tomo": la SERP
la dominan farmacias y portales de salud, y aun ganándolas traen a alguien que busca automedicarse.

**Mantuvo `las mejores pastillas para la ciática` (390), y la distinción importa.** Es de la misma
familia que las dos que salieron, pero la ciática sí es una condición que el doctor trata y 390 es
volumen alto para este mercado. Se queda **como contenido educativo de captación, no como página de
servicio.** Que la intención registrada diga "comercial" no la convierte en transaccional: en la
fase 14 esta keyword se mapea a un artículo, nunca a una página de conversión.

**Sumó `traumatólogo ortopedia infantil` (70)** desde la lista de cerca del corte. Es uno de los
cuatro servicios centrales, y wave 1 midió que `ortopedia infantil` es la única condición núcleo
cuya SERP premia páginas de servicio, o sea la más ganable de las cuatro.

### Un detalle del recálculo que hay que dejar escrito

Quitar cinco cabezas no libera cinco búsquedas por sí solo: el corte se recalcula y sube a las
siguientes de la lista. En la primera regeneración eso volvió a dejar 95 cabezas y 88 búsquedas, y
entre las que subieron estaba `cual es el mejor colageno para la artrosis`, que es exactamente la
familia de farmacia que Juan acababa de rechazar.

Se topó la lista en 91 cabezas para que las cinco que salieron no se reemplacen por keywords que
nadie revisó. El comando que produjo el archivo final:

```
./node_modules/.bin/tsx src/phase13/serp-candidates.ts --budget 90 --heads 91 \
  --exclude "cirujano de columna clínica montefiori,traumatólogo clínica montefiori,ortopedia infantil clínica montefiori,cuál es el mejor antiinflamatorio para desgarro muscular,cual es el mejor antiinflamatorio para la artrosis" \
  --include "traumatólogo ortopedia infantil"
```

### Cómo quedaron los números

| Concepto | Antes | Después |
|---|---|---|
| Cabezas | 95 | **91** |
| Ya en caché, gratis | 7 | 7 |
| Búsquedas que se emiten | 88 | **84** |
| Holgura sobre el presupuesto de 90 | 2 | **6** |
| Acumulado del libro al terminar | 100 | **96** de un techo de 102 |
| Reserva que sobrevive | 26 | **30** |
| Sedes | 12 | 9 |
| Marcadas como posible ruido | 7 | 5 |

Lo que sigue es el informe tal como se revisó. Las tablas describen las 95 originales; las cinco
que salieron y la que entró están nombradas arriba.

---

## Lo primero, porque cambia el número que venías esperando

El plan decía que de las 12 SERP que dejó la fase 12 solo **5** servían como cabezas. Medí las 12
contra el dataset y son **7**. Las dos que faltaban en esa cuenta son `cirugía de columna` y
`cirugía convencional`: las dos existen como keyword de alcance objetivo y las dos tienen su SERP
guardada, con la tilde y todo, que es lo que decide si la caché acierta.

Eso son dos búsquedas más que no hay que pagar. El resto del informe ya está calculado con 7.

---

## 1. Las candidatas, por familia

95 cabezas en cinco familias. El orden dentro de la lista no es por volumen y eso es a propósito:
las cuatro condiciones que operas tienen la celda de volumen vacía porque DinoRank corta las
relacionadas en 900 y nunca devuelve la keyword que uno le pregunta. Si ordenara por volumen, las
cuatro páginas del negocio quedarían al final y el presupuesto se iría en la cola.

La columna **Fuente** dice de dónde sale el volumen. Un guion largo significa que nadie lo midió,
que no es lo mismo que cero.

### Familia 1: las cuatro condiciones núcleo (4 cabezas, 1 búsqueda)

Entran por regla de negocio, no por métrica. Son las cuatro páginas que v1.1 ya publicó.

| Keyword | Volumen | Fuente | Intención | Costo |
|---|---|---|---|---|
| hernia discal | — | sin datos | informacional | **gratis** |
| estenosis espinal | — | sin datos | informacional | **gratis** |
| ortopedia infantil | — | sin datos | informacional | **gratis** |
| escoliosis | — | sin datos | informacional | 1 búsqueda |

`ortopedia infantil` es la más ganable de las cuatro: su top 10 está dominado por páginas de
servicio de clínicas de Lima, no por contenido internacional. Es la única de las cuatro donde eso
pasa.

### Familia 2: especialidad y procedimientos (20 cabezas, 16 búsquedas)

El negocio del doctor: lo que opera y la especialidad con la que lo buscan.

| Keyword | Volumen | Fuente | Intención | Costo |
|---|---|---|---|---|
| cirujano de columna | — | sin datos | comercial | 1 búsqueda |
| traumatólogo de columna | 0 | DinoRank | comercial | 1 búsqueda |
| cirugía de columna | — | sin datos | comercial | **gratis** |
| cirugía endoscópica de columna | 0 | DinoRank | comercial | 1 búsqueda |
| escoliosis y deformidades de columna | — | sin datos | informacional | **gratis** |
| artrodesis en varios niveles | — | sin datos | comercial | **gratis** |
| hernia discal lumbar y cervical | — | sin datos | informacional | 1 búsqueda |
| estenosis de canal | — | sin datos | informacional | 1 búsqueda |
| endoscopía espinal | — | sin datos | comercial | 1 búsqueda |
| cirugía mínimamente invasiva | 30 | DinoRank | comercial | 1 búsqueda |
| cirugía convencional | — | sin datos | comercial | **gratis** |
| lumbalgia | — | sin datos | informacional | 1 búsqueda |
| ciática | 8.100 | DinoRank | informacional | 1 búsqueda |
| cifosis | 3.600 | DinoRank | informacional | 1 búsqueda |
| artrosis | — | sin datos | informacional | 1 búsqueda |
| desgarro muscular | 5.400 | DinoRank | informacional | 1 búsqueda |
| traumatólogo | — | sin datos | comercial | 1 búsqueda |
| traumatología | — | sin datos | informacional | 1 búsqueda |
| neurocirujano | — | sin datos | comercial | 1 búsqueda |
| traumatología y ortopedia | 0 | DinoRank | informacional | 1 búsqueda |

`cirujano de columna` va primera de la familia por una razón concreta: es la consulta cuyo top 10
trae a los cinco competidores juntos, verificado el 10 de agosto. No está en caché, así que se
paga, y vale la pena.

**Una sustitución que conviene que sepas.** El plan pedía `artrodesis` a secas. Esa keyword no
existe en el universo; lo que sí existe es `artrodesis en varios niveles`, y encima ya está
capturada. Entró esa.

### Familia 3: el geo de Lima (42 cabezas, 42 búsquedas)

La condición o la especialidad más el distrito. Es el terreno que Ahrefs no cubre y donde un
dominio nuevo todavía puede ganar. Solo los cuatro ámbitos donde el consultorio existe de verdad,
más la consulta desde el celular.

Casi ninguna tiene volumen medido, y eso no dice nada sobre la demanda: son permutaciones que este
proyecto construyó, no keywords que DinoRank haya devuelto con métrica.

| Base | Lima | Surco | San Isidro | La Molina | Cerca de mí |
|---|---|---|---|---|---|
| ortopedia infantil | 0 | — | — | — | 10 |
| cirujano de columna | — | — | — | — | 0 |
| cirugía de columna | — | — | — | — | — |
| traumatólogo | — | — | — | — | 0 |
| traumatología | **880** | — | — | — | — |
| neurocirujano | 0 | — | — | — | 0 |
| traumatología y ortopedia | — | — | — | — | 0 |

Siete bases por cinco ámbitos son 35. Las siete que faltan para llegar a 42 son procedimientos que
solo existen en la forma "en Lima", sin las otras variantes:

`cirugía endoscópica de columna en lima`, `artrodesis en varios niveles en lima`,
`hernia discal lumbar y cervical en lima`, `estenosis de canal en lima`,
`endoscopía espinal en lima`, `cirugía mínimamente invasiva en lima`,
`cirugía convencional en lima`.

`traumatología lima` con 880 es la keyword de mayor volumen de toda la lista aprobada.

**Ocho keywords se ahorraron solas.** Cuando existían las dos formas, con y sin preposición, entró
una sola y la otra queda anotada para heredar el cluster por texto en la tarea 4. Los ocho casos:
`ortopedia infantil en lima`, `traumatólogo en lima`, `traumatólogo en la molina`,
`traumatología en lima`, `neurocirujano en lima`, `neurocirujano en surco`, `ortopedia en surco` y
`traumatología en san miguel`. Son ocho búsquedas que no se gastan en preguntar dos veces lo mismo.

### Familia 4: las cuatro sedes (12 cabezas, 12 búsquedas)

Alimentan las cuatro URLs de sede de la fase 14. La related search
`traumatólogo especialista en columna clínica ricardo palma` ya está verificada en la SERP de Lima
y hoy no la responde ninguna URL del sitio.

| Base | Ricardo Palma | Sanna | Tezza | Montefiori |
|---|---|---|---|---|
| cirujano de columna | 1 búsqueda | 1 búsqueda | 1 búsqueda | 1 búsqueda |
| traumatólogo | 1 búsqueda | 1 búsqueda | 1 búsqueda | 1 búsqueda |
| ortopedia infantil | 1 búsqueda | 1 búsqueda | 1 búsqueda | 1 búsqueda |

Ninguna tiene volumen medido. Entran por la URL que alimentan, no por la métrica.

**Acá tomé una decisión de recorte que quiero que veas.** Con las 20 bases de la familia 2 por
cuatro sedes salían 80 permutaciones. Ochenta búsquedas para alimentar cuatro URLs es una mala
asignación del presupuesto, así que dejé tres bases: las tres formas con las que un paciente
escribe el nombre de una clínica al lado de lo que busca. Si prefieres otras tres, es un cambio de
una línea.

### Familia 5: el resto con intención de contratar (17 cabezas, 17 búsquedas)

Alcance objetivo, intención comercial o transaccional, volumen mayor que cero, ordenado por
volumen. Es el criterio literal de D-03.

| Keyword | Volumen | Intención | Nota |
|---|---|---|---|
| ciática: tratamientos | 590 | comercial | |
| desgarro muscular tratamiento | 590 | comercial | ver más abajo |
| desgarro muscular tratamientos | 590 | comercial | ver más abajo |
| que es un neurocirujano | 480 | comercial | marcada: definicional |
| las mejores pastillas para la ciática | 390 | comercial | marcada: farmacológica |
| reumatólogo o traumatólogo | 260 | comercial | marcada: comparativa |
| mejor clínica de traumatología en lima | 210 | transaccional | |
| ortopedia surco | 210 | transaccional | marcada: tienda o especialidad |
| cual es la diferencia entre artritis y artrosis | 170 | comercial | marcada: definicional |
| como curar desgarro muscular | 110 | comercial | |
| como se cura un desgarro muscular | 110 | comercial | |
| cuál es el mejor antiinflamatorio para desgarro muscular | 110 | comercial | marcada: farmacológica |
| cual es el mejor antiinflamatorio para la artrosis | 110 | comercial | marcada: farmacológica |
| tratamientos para desgarro muscular | 110 | comercial | |
| traumatología especialista en columna | 110 | comercial | |
| fisioterapia traumatología | 90 | comercial | |
| mejor neurocirujano de columna lima | 90 | transaccional | |

`traumatología especialista en columna` con 110 es la que más se parece al patrón de URL de
`clinicarthromeds.pe`, que es el competidor que armó la suya exactamente sobre la keyword geo.

---

## 2. Cuántas ya están en caché y por lo tanto salen gratis

**Siete de las 95.** Se capturaron en la fase 12 y su SERP está guardada en disco, así que la
tarea 3 las resuelve sin pedirle nada a SerpApi.

| Keyword | Familia |
|---|---|
| hernia discal | condición núcleo |
| estenosis espinal | condición núcleo |
| ortopedia infantil | condición núcleo |
| cirugía de columna | especialidad |
| escoliosis y deformidades de columna | especialidad |
| artrodesis en varios niveles | especialidad |
| cirugía convencional | especialidad |

Tres de las cuatro condiciones núcleo están acá dentro. La cuarta, `escoliosis`, no se capturó
nunca: lo que la fase 12 guardó fue la permutación `escoliosis y deformidades de columna`, que es
otra consulta.

Las otras cinco capturas de la fase 12 no cuentan como cabezas porque no existen como keyword en
el universo: son `clínica ricardo palma`, `clínica sanna la molina`, `clínica padre luis tezza`,
`casos de revisión` y `consultorio privado del dr. angulo`. Igual sirven, para el perfil de
competencia de COMP-02 y COMP-04.

---

## 3. El costo real en búsquedas

| Concepto | Búsquedas |
|---|---|
| Cabezas elegidas | 95 |
| De ellas, resuelven desde caché | 7 |
| **Búsquedas que se emiten de verdad** | **88** |
| Presupuesto aprobado para la fase | 90 |
| Holgura que queda sin usar | 2 |

Contra el estado de la cuenta:

| Concepto | Búsquedas |
|---|---|
| Disponibles hasta el 21 de agosto | 114 |
| Gastadas hasta hoy (fase 12) | 12 |
| Que gastaría esta lista | 88 |
| Acumulado si se aprueba tal cual | 100 de un techo de 102 |
| **Reserva que sobrevive** | **26** |

La reserva mínima acordada era 24 y quedarían 26. Esas dos de holgura significan que se pueden meter
hasta dos keywords de la lista de abajo sin sacar ninguna.

El techo de 102 no es una intención, es mecánico: la tarea 3 lee el acumulado del libro de cuota
antes de emitir la primera consulta y aborta si ya se llegó. Correr el comando cinco veces por
error no gasta 450 búsquedas.

---

## 4. Las diez que quedaron justo debajo del corte

Acá es donde tu criterio vale más que el mío. Todas son de la familia 5 y todas quedaron afuera por
volumen, no por otra cosa. Si alguna te parece que importa, entra.

| Keyword | Volumen | Intención | Por qué quedó afuera |
|---|---|---|---|
| como curar un desgarro muscular en la pierna rápido | 70 | comercial | el corte cayó en 90 de volumen |
| como tratar un desgarro muscular | 70 | comercial | ídem |
| cual es el mejor colageno para la artrosis | 70 | comercial | ídem, y además es farmacológica |
| el mejor neurocirujano de perú | 70 | transaccional | ídem |
| traumatología en lima norte | 70 | transaccional | ídem, y es un distrito sin sede |
| traumatología perú | 70 | transaccional | ídem |
| traumatología reconstructiva perú | 70 | transaccional | ídem |
| traumatólogo o reumatólogo | 70 | comercial | ídem, y duplica a `reumatólogo o traumatólogo` que sí entró |
| traumatólogo ortopedia infantil | 70 | comercial | ídem |
| como curar un desgarro muscular en el muslo | 50 | comercial | ídem |

Si tuviera que recomendarte dos de estas para las dos búsquedas de holgura, serían
**`traumatólogo ortopedia infantil`**, porque cruza dos cosas que sí haces, y **`traumatología
perú`**, porque es la versión nacional de la keyword de 880 que ya está adentro.

---

## 5. Las que entraron pese a oler a ruido

Siete de las 95. Ninguna se escondió entre las demás: todas están marcadas en el archivo de datos
con la regla que las señaló. Pasaron el filtro porque el filtro solo saca lo que es inequívocamente
ajeno, y estas no lo son.

| Keyword | Volumen | Marca | Por qué pasó igual |
|---|---|---|---|
| ortopedia surco | 210 | tienda o especialidad | En Perú "ortopedia" más un lugar nombra igual a la especialidad que a la tienda de insumos. Surco es distrito con sede, así que no se puede descartar de plano. Pero la de más volumen de esa forma es `ortopedia viza surco`, que es la tienda. **Es la más sospechosa de las siete.** |
| que es un neurocirujano | 480 | definicional | Consulta de enciclopedia. Trae tráfico, rara vez paciente |
| las mejores pastillas para la ciática | 390 | farmacológica | Busca un remedio, no una operación |
| cuál es el mejor antiinflamatorio para desgarro muscular | 110 | farmacológica | ídem |
| cual es el mejor antiinflamatorio para la artrosis | 110 | farmacológica | ídem |
| reumatólogo o traumatólogo | 260 | comparativa | Compara dos especialidades. Sirve de contenido, no de página de servicio |
| cual es la diferencia entre artritis y artrosis | 170 | definicional | ídem |

**Las tres del caso de referencia quedaron todas afuera.** `ortopedia viza surco` con 590 salió por
tienda, `día del traumatólogo peruano` con 260 por efeméride y
`traumatología perú dr jorge gómez tello` con 210 por nombrar a otro profesional. El filtro las
atrapó.

En total quedaron fuera 70 keywords antes de rankear:

| Regla | Cuántas | Ejemplos |
|---|---|---|
| léxico o traducción | 25 | `qué significa traumatología` (170), `traumatólogo en inglés` (90) |
| tienda ortopédica | 21 | `ortopedia viza surco` (590), `ortopedia viza comas` (390), `ortopedia lince` (140) |
| efeméride | 13 | `día del traumatólogo peruano` (260), `día del neurocirujano` (90) |
| fuera del terreno local | 8 | `el mejor neurocirujano del mundo` (30) |
| profesional ajeno | 3 | `traumatología perú dr jorge gómez tello` (210) |

---

## Un hallazgo aparte que conviene mirar antes de aprobar

Hay **un par de cabezas que se diferencian solo en un plural** y las dos están adentro:

- `desgarro muscular tratamiento` (590)
- `desgarro muscular tratamientos` (590)

Casi con seguridad devuelven la misma SERP y van a caer en el mismo cluster. Son dos búsquedas
irrecuperables para un solo resultado. No las junté sola porque el singular y el plural sí pueden
tener SERP distinta y nadie lo midió, pero si se saca una se recupera una búsqueda y la holgura pasa
de 2 a 3.

---

## Qué se puede responder

Tres salidas, y se pueden combinar:

1. **"aprobado"** y arranca la captura tal cual: 88 búsquedas, reserva de 26.
2. **Nombrar keywords a quitar.** Cada una que sale devuelve su búsqueda a la reserva.
3. **Nombrar keywords a agregar** de la lista de la sección 4. Caben dos sin sacar nada; a partir de
   la tercera, hay que sacar una por cada una que entre.

No hace falta reordenar nada: el orden lo fija el rango de valor de negocio.

**Mientras esto no se responda, el contador de SerpApi sigue en 12.**
