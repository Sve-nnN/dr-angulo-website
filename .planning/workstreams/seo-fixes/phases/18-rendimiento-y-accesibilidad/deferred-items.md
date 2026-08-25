# Hallazgos diferidos de la fase 18

Cosas que aparecieron durante la ejecución, quedaron fuera del alcance de los
planes y no se tocaron. Cada una con dónde vive y por qué se difiere.

---

## 1. Advertencia de trazado de `next.config.ts` en el build

**Encontrado:** 2026-08-24, durante la tarea 2 del plan 18-04.
**Estado:** preexistente. Ningún plan de esta fase tocó `next.config.ts`.

`npm run build` emite una advertencia de Turbopack:

```
./next.config.ts
Encountered unexpected file in NFT list
A file was traced that indicates that the whole project was traced unintentionally.
```

**Por qué no se arregla acá:** es anterior a la fase, no la produce ningún cambio
de estos planes, y no es la advertencia de prop obsoleta que el criterio de
aceptación del plan 18-04 vigila. El build sale en 0 igual.

**A quién le toca:** el plan 18-05 es el dueño de `next.config.ts` en esta fase y
va a envolverlo con `@next/bundle-analyzer`. Vale la pena que mire esta
advertencia de paso, porque envolver el archivo puede empeorarla.

---

## 2. Sobre-dimensionado de la imagen del LCP en dispositivos con DPR 2

**Encontrado:** 2026-08-24, tarea 1 del plan 18-04. Medido y documentado en
`18-LCP-EVIDENCE.md`, sección 5.

A 375 px de viewport con DPR 2, la imagen del doctor se pinta a 440 px de
dispositivo y el navegador descarga la variante de **640w**, porque el `srcset` no
tiene ningún candidato entre 384w y 640w. Son 1,45× el ancho y 2,1× los píxeles,
un sobrecosto del orden de **11 KB** en WebP.

**Por qué no se arregla acá:** cerrarlo exige agregar un ancho a `deviceSizes` o
`imageSizes` en `next.config.ts`, que es configuración global de imágenes del sitio
entero y archivo del plan 18-05.

**Matiz que baja su prioridad:** Lighthouse móvil emula DPR 2,625, y a ese DPR el
ancho pedido es 578 px, para el que 640w es el candidato correcto. **El informe de
Lighthouse no ve este sobrecosto.** Afecta a dispositivos reales con DPR 2, no al
puntaje.

---

## 3. `/_next/image` no se cachea en el borde

**Encontrado:** 2026-08-24, tarea 1 del plan 18-04.

Las imágenes optimizadas responden `cf-cache-status: DYNAMIC`, así que cada
petición de imagen paga el viaje hasta el origen. En `/sobre-el-doctor`, donde el
elemento LCP es la imagen, ese viaje entra directo en el camino crítico.

**No es un diferido del todo:** la Cache Rule del plan 18-02 lo cubre, con la sexta
invariante (`Accept` en la clave de caché) que se agregó a raíz de este mismo
hallazgo. Queda anotado acá para que la medición de cierre del plan 18-04 lo tenga
presente al separar efectos.

---

## 4. `target-size` en la navegación de escritorio, solo en el build local

**Encontrado:** 2026-08-24, en la corrida de Unlighthouse del checkpoint del plan 18-01.
**Estado: CERRADO el 2026-08-24.** Era artefacto de render local, como se sospechaba.

**La evidencia que lo cierra:** en la corrida de Unlighthouse sobre el build actual
de la rama, **la accesibilidad mínima del sitio entero es 1,00** y la auditoría
`target-size` ya no aparece en ninguna ruta. No hizo falta esperar al deploy.

Se conserva el registro de abajo porque documenta un modo de falla real del entorno
de medición local, que va a volver a aparecer.

Tres rutas que ningún plan de esta fase tocó bajan de 1,00 en accesibilidad en el
build local:

| Ruta | Puntaje local |
|---|---|
| `/sobre-el-doctor` | 0,96 |
| `/testimonios` | 0,96 |
| `/sedes/clinica-ricardo-palma` | 0,97 |

La auditoría que falla es **`target-size`** y el elemento es siempre el mismo:
`header.sticky > div.mx-auto > nav.hidden > a.whitespace-nowrap`. Es la
**navegación de escritorio, que en móvil está oculta por diseño** con `hidden`.

**Por qué no se arregla acá:** contra producción esa auditoría pasa, con la misma
emulación (412×823, DPR 1,75). Es el mismo build de la aplicación, así que la
diferencia está en cómo se resuelve el `hidden` en el render local, no en el
marcado. Y ninguno de los commits de la fase 18 toca `header.tsx` salvo la
migración de `priority` a `preload` del logo, que no puede afectar el tamaño de un
objetivo táctil.

**Qué se hizo:** nada, que era lo correcto. La medición siguiente sobre un build
distinto lo hizo desaparecer. **Arreglar un artefacto de medición habría sido tocar
el encabezado sin motivo**, en una fase que no sanciona ese cambio.
