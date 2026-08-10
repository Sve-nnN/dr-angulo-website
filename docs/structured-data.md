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
en el Home y en Testimonios, y alimentan el `aggregateRating` y los nodos
`Review` del doctor.

### Configuración

```
GOOGLE_PLACES_API_KEY=<clave de Google Cloud con Places API (New) habilitada>
GOOGLE_PLACE_ID=ChIJQ4nDssLHBZEROmZ9nyesA5c   # opcional, ya viene por defecto
REVIEWS_SCHEMA_ENABLED=false                  # opcional, apaga solo el marcado
```

Para obtener la clave: Google Cloud Console → crear proyecto → habilitar
**Places API (New)** → Credenciales → Crear clave de API. Conviene restringirla
por API (solo Places) y dejarla sin restricción de referrer, porque la llamada
sale del servidor, no del navegador.

Sin clave, la sección de reseñas no se renderiza y el sitio queda como estaba.
No hay estado intermedio roto.

### Límites y reglas que impone Google

- La API devuelve **hasta 5 reseñas**, no todas. No existe endpoint oficial para
  traer el historial completo.
- Las reseñas **no se pueden almacenar más de 30 días**. Por eso el feed se
  revalida cada 24 horas y no se guarda nada en disco.
- Hay que mostrar la atribución al autor, que es lo que hace la tarjeta.

### Advertencia sobre el `aggregateRating`

Google clasifica como **reseñas autopublicadas** las que un negocio marca en su
propio sitio sobre sí mismo. Su política dice explícitamente que no genera rich
snippet de estrellas con ellas para `LocalBusiness` ni `Organization`, y el
`Physician` del sitio es ambas cosas.

O sea: el marcado está, los datos son reales y verificables contra la ficha, y
sirve para que otros consumidores de datos estructurados (asistentes, LLMs,
agregadores) tengan la calificación. Pero **no hay que esperar estrellas en los
resultados de Google** por esta vía. Las estrellas que Google sí muestra son las
de la propia ficha del negocio, que se ganan pidiendo reseñas a los pacientes.

Si en algún momento conviene quitarlo: `REVIEWS_SCHEMA_ENABLED=false`. Las
reseñas se siguen mostrando a los visitantes; solo desaparece el marcado.

## Cómo verificar

1. `npm run build && npx next start`
2. Rich Results Test: https://search.google.com/test/rich-results
3. Validador de schema.org: https://validator.schema.org/

Vale la pena revisar `/`, `/servicios`, `/agendar`, `/preguntas-frecuentes` y un
artículo del blog: entre esas cinco pasan todos los tipos que emite el sitio.
