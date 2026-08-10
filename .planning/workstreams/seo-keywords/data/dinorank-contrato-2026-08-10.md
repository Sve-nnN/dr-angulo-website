# Contrato real de `/keyword-research` de DinoRank — 2026-08-10

La clave que Juan entregó en la tercera vuelta **funciona**. Las dos anteriores eran la misma
y devolvían 401; esta responde 200. Sondeada en vivo antes de ejecutar la fase 12.

Fixture recortada en `fixtures/dinorank-keyword-research-pe.json` (25 de 899 relacionadas,
sin credenciales, verificado).

## Petición

```
POST https://api.dinorank.com/api/v1/keyword-research
X-API-Key: <clave>
Content-Type: application/json

{"keyword":"hernia discal","country":"pe","language":"es"}
```

`country` va en minúsculas y vuelve en mayúsculas. El proveedor es DataForSEO, no un índice
propio de DinoRank.

## Forma de la respuesta

Anidada tres niveles, con `data.data` repetido. No es un error de transcripción.

```
{ ok, data: { source, country, language, keyword,
              data: { keyword, pais, idioma, datos, keywords, id } } }
```

- **`data.data.datos`** — la keyword consultada. Campos: `key`, `search_volume`, `cpc`,
  `competition`, `position`, `etv`, `url`, `relative_url`, `history`.
- **`data.data.keywords`** — array de relacionadas, cada una con la misma forma que `datos`.
- **`history`** — 12 meses, objetos `{month: "YYYYMM", search_volume}`.

## Los tres hallazgos que cambian los planes

### 1. Una llamada devuelve cientos de keywords con métricas

`hernia discal` para Perú devolvió **899 relacionadas**, cada una con volumen, CPC y
competencia. `dolor de espalda` devolvió 900. `traumatologo lima`, 47.

**Consecuencia sobre KWR-01:** el universo de 400 o más ya no depende de SerpApi ni de la
permutación determinista para llegar al número. Unas pocas semillas alcanzan y sobran. La
permutación pasa a ser control de cobertura, no motor de volumen.

**Consecuencia sobre SerpApi:** las 127 búsquedas que quedan hasta el 21 de agosto se
liberan enteras para la fase 13, que las necesita de verdad para capturar la SERP por
cluster (COMP-03). Deja de ser el recurso crítico de la fase 12.

**Consecuencia sobre KWR-02:** volumen, CPC y competencia vienen en la misma llamada que la
expansión. No hace falta una segunda pasada de enriquecimiento keyword por keyword. El plan
`12-05` estaba dimensionado para unos 400 POST con concurrencia limitada; la realidad son
unos 15. Hay que replantear esa tarea antes de ejecutarla.

### 2. La keyword semilla vuelve siempre con volumen cero

Verificado en tres consultas distintas: `hernia discal`, `dolor de espalda` y
`traumatologo lima` devuelven `datos.search_volume: 0`, `cpc: 0`, `competition: 0` y los doce
meses de `history` en cero. Las relacionadas de `keywords[]` sí traen los valores reales.

**Trampa concreta para el parser:** si lee el volumen desde `datos`, el universo entero sale
en cero y el error es silencioso, porque cero es un valor válido. **El volumen se lee de
`keywords[]`.** Si además hace falta el dato de la propia semilla, hay que buscarla dentro de
ese array por `key`, no leer `datos`.

No está claro si es comportamiento del endpoint o un vacío de DataForSEO para esas semillas
exactas. A efectos del parser da igual: la regla es la misma.

### 3. Solo el 16% de las relacionadas trae volumen

De las 899 de `hernia discal`, **143 tienen `search_volume > 0`**. El resto viene en cero.

Esto valida la decisión ya tomada en el CONTEXT de conservar las keywords sin datos marcadas
en vez de descartarlas: el 84% sin volumen medible es justo el long tail donde un dominio de
agosto de 2026 sin historial puede ganar. Pero obliga a que el filtro de calidad no sea
"tiene volumen", o el universo se derrumba de 899 a 143.

## El geo de Lima aparece, y con intención transaccional

Veinte de las 899 relacionadas mencionan Lima o Perú. Las de mayor valor comercial:

| Keyword | Volumen |
|---|---|
| cirugía láser hernia discal lumbar precio perú | 40 |
| cuanto cuesta una operación de hernia discal en perú | 30 |
| operacion hernia discal precio perú | 10 |

Es exactamente el terreno que Ahrefs devolvía vacío. Intención transaccional pura, paciente
en etapa de decisión. Volúmenes bajos en absoluto, pero es tráfico que convierte.

**Ojo con una tensión que esto abre:** el proyecto todavía no decidió si publica precio de
consulta. `PROJECT.md` lo tiene como dato sin confirmar de Doctoralia (~S/130 presencial,
~S/100 online). Estas keywords piden precio de cirugía, que es otra cosa y mucho más
sensible. Es decisión de la fase 15, cuando se escriba el copy, no de acá.

## Endpoints que faltan sondear

Solo se verificó `/keyword-research`. Las fases 14 y 15 dependen de tres más, y su forma de
respuesta sigue sin documentar:

- `/tfidf` — entidades semánticas por URL (ONPAGE-03)
- `/auditoria` — titles, H1 y metas duplicados (ONPAGE-05)
- `/canibalizaciones` — canibalización sobre lo indexado (MAP-02)

El plan `12-05` los sondea y graba fixtures en la misma tarea. Ahora que la clave funciona,
esa tarea puede correr.

---
*Sondeado en vivo desde la sesión. El cliente repetible y las fixtures completas son parte
del plan `12-05`.*
