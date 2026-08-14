# Datos estructurados (JSON-LD)

Todo el marcado vive en `src/components/structured-data.tsx`. El layout raíz
emite un `@graph` con los nodos estables y cada página agrega los suyos
referenciando esos `@id`, así el doctor es **una sola entidad** para el buscador
y no una copia distinta por página.

## Qué emite cada página

| Página | Nodos propios |
|---|---|
| Layout (todas) | `WebSite`, `Physician`, 4 sedes (`MedicalClinic` para el consultorio, `Hospital` para las clínicas), 2 `MedicalProcedure` |
| `/` | solo el grafo raíz |
| `/servicios` | `MedicalWebPage` con las condiciones como `MedicalCondition` + `BreadcrumbList` |
| `/sobre-el-doctor` | `ProfilePage` apuntando al doctor + `BreadcrumbList` |
| `/agendar` | `MedicalWebPage` con `ItemList` de las 4 sedes + `BreadcrumbList` |
| `/contacto` | `ContactPage` + `BreadcrumbList` |
| `/blog` | `Blog` con sus `BlogPosting` + `BreadcrumbList` |
| `/blog/[slug]` | `BlogPosting` (autor y editor = el doctor) + `BreadcrumbList` |
| `/testimonios` | `BreadcrumbList` |
| `/preguntas-frecuentes` | `FAQPage` + `BreadcrumbList` |

El nodo `Physician` incluye colegiatura y RNE como `EducationalOccupationalCredential`,
la formación como `alumniOf`, los horarios del consultorio como
`openingHoursSpecification`, las clínicas como `hospitalAffiliation` y los dos
abordajes quirúrgicos como `availableService`.

## Reseñas de Google

`src/lib/google-reviews.ts` consulta la **Places API (New)** y devuelve la
calificación, el total de reseñas y hasta cinco reseñas con texto. Se muestran
en el Home y en Testimonios.

**No alimentan ningún dato estructurado.** El sitio no emite `Review` ni
`AggregateRating` en ninguna de sus rutas, y `scripts/check-seo.mjs` falla si
alguno vuelve a aparecer en el HTML prerenderizado.

### Configuración

```
GOOGLE_PLACES_API_KEY=<clave de Google Cloud con Places API (New) habilitada>
GOOGLE_PLACE_ID=ChIJQ4nDssLHBZEROmZ9nyesA5c   # opcional, ya viene por defecto
GOOGLE_REVIEWS_MAX_CALLS_PER_DAY=24           # opcional, techo propio de llamadas
```

Para obtener la clave: Google Cloud Console → crear proyecto → habilitar
**Places API (New)** → Credenciales → Crear clave de API. Conviene restringirla
por API (solo Places) y dejarla sin restricción de referrer, porque la llamada
sale del servidor, no del navegador.

Sin clave, la sección de reseñas no se renderiza y el sitio queda como estaba.
No hay estado intermedio roto.

### Costo y control de gasto

El campo `reviews` cae en el SKU **Place Details Enterprise + Atmosphere**:
1.000 llamadas gratis al mes y 25 USD por cada 1.000 después. Con el caché de
24 horas el sitio hace alrededor de **30 llamadas al mes**, o sea un 3% del
tramo gratuito. Aun así hay tres frenos, porque una clave filtrada o un bucle de
redeploys es lo único que puede disparar el consumo:

1. **Caché de 24 h** (`revalidate`), compartido entre Home y Testimonios: una
   sola llamada alimenta las dos páginas.
2. **Techo diario propio** en `src/lib/google-reviews.ts`: 24 llamadas por día
   por instancia. Al pasarse, sirve la última respuesta buena en memoria en vez
   de volver a pedir. Ajustable con `GOOGLE_REVIEWS_MAX_CALLS_PER_DAY`.
3. **Pausa por error**: ante un 429 (cuota agotada), un 5xx o un timeout de 5
   segundos, deja de llamar por una hora. Evita el bucle de reintentos que es
   lo que suele generar facturas sorpresa.

El control duro igual va del lado de Google: **cuota diaria en Google Cloud**
(APIs y servicios → Places API → Cuotas). Con 50 solicitudes por día alcanza y
sobra, y pone un techo que no depende del código.

### Verificar que quedó andando

```
curl -H "Authorization: Bearer $CRON_SECRET" https://<dominio>/api/reviews/status
```

Devuelve si la clave está configurada, cuántas llamadas lleva el día, si hay
pausa activa y qué respondió Google (calificación, total de reseñas y cuántas
traen texto). No expone la clave.

### Límites y reglas que impone Google

- La API devuelve **hasta 5 reseñas**, no todas. No existe endpoint oficial para
  traer el historial completo.
- Las reseñas **no se pueden almacenar más de 30 días**. Por eso el feed se
  revalida cada 24 horas y no se guarda nada en disco.
- Hay que mostrar la atribución al autor, que es lo que hace la tarjeta.

### Por qué no hay `aggregateRating` (AUD-01)

Entre agosto de 2026 y la auditoría de AUD-01, el nodo `Physician` declaraba la
calificación de la ficha y hasta cinco reseñas como datos propios del sitio. Se
retiró y no vuelve.

El motivo: las directrices de Google no permiten que un sitio marque como
propias las reseñas que se publicaron en una plataforma de terceros, aunque los
datos sean reales y verificables contra la ficha. Ese marcado no genera rich
result, así que no daba ninguna ganancia, y sí exponía al dominio a una acción
manual por datos estructurados que no cumplen las directrices.

Lo que sí está permitido, y es lo que el sitio hace, es **mostrar** las reseñas
con atribución al autor y a Google. La sección visible del Home y de
`/testimonios` no cambió.

Las estrellas que Google muestra en los resultados salen de la ficha del
negocio, no de este marcado. El camino para conseguirlas es pedir reseñas a los
pacientes, no volver a declararlas acá.

## Cómo verificar

1. `npm run build && npx next start`
2. Rich Results Test: https://search.google.com/test/rich-results
3. Validador de schema.org: https://validator.schema.org/

Vale la pena revisar `/`, `/servicios`, `/agendar`, `/preguntas-frecuentes` y un
artículo del blog: entre esas cinco pasan todos los tipos que emite el sitio.
