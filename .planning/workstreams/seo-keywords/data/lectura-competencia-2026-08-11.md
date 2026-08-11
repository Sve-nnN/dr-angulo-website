# Lectura estratégica del perfil de competencia — 2026-08-11

Interpretación de los datos de `13-COMPETIDORES.md` y `seo-tools/data/competitors.json`, medidos
en vivo contra Ahrefs. Esto no es el entregable de COMP-01, que ya está: es qué significa.

## Los números

| Dominio | DR | Ref. domains | Keywords org. | Tráfico org. | Top 3 |
|---|---:|---:|---:|---:|---:|
| **clinicarthromeds.pe** | 1.1 | 420 | **582** | **2.036** | 232 |
| cirujanocolumna-elaos.com | 0.0 | 426 | 39 | 113 | 19 |
| drcarranzacolumna.com | 0.0 | 432 | 14 | 14 | 5 |
| drciezatraumatologia.com | 2.9 | 431 | 0 | 0 | 0 |
| doctormunguia.com | 0.0 | 405 | 0 | 0 | 0 |
| **drangulocolumna.com** | **0.0** | **0** | **0** | **0** | **0** |

## Un error de medición que casi invalida todo esto

El plan generaba las consultas con `mode: domain`. La documentación de los tres endpoints de
`site-explorer` lo dice literal: *"When analyzing a domain name, you must use
`mode=subdomains`. Using `mode=domain` can exclude www and other subdomains."*

Medido sobre `drcarranzacolumna.com` antes de gastar las 24 consultas:

| | `mode=domain` | `mode=subdomains` |
|---|---:|---:|
| org_keywords | 0 | 14 |
| org_traffic | 0 | 14 |
| top 3 | 0 | 5 |

Con `domain` las 24 consultas habrían devuelto ceros para los cinco competidores, y el perfil
entero habría sido un artefacto de medición leído como "la competencia no rankea". Corregido en
`seo-tools/src/phase13/ahrefs.ts` con el porqué escrito al lado, para que nadie lo revierta.

## Las tres lecturas

### 1. El campo está mucho más flojo de lo que suponía el proyecto

**Tres de los cinco competidores tienen cero tráfico orgánico.** `doctormunguia.com`, que lidera
el local pack con 4.8 y 24 reseñas, no rankea por nada en búsqueda. Su visibilidad es de Google
Maps, no de Google Search. `drciezatraumatologia.com` tiene el DR más alto del grupo (2.9) y
también cero tráfico.

La auditoría del 2026-08-10 leyó la SERP de `cirujano de columna en Lima` y concluyó que las
posiciones 1 y 3 eran dominios exact-match fuertes. Los datos dicen otra cosa: son dominios
exact-match **débiles** que rankean porque nadie más lo intenta.

### 2. Hay un solo competidor real, y no es un médico individual

`clinicarthromeds.pe` tiene **582 keywords orgánicas y 2.036 de tráfico**: quince veces el
segundo del grupo. Es una clínica con equipo de contenido, no un consultorio.

Su jugada está a la vista en sus propias URLs:

```
/mejor-traumatologo-en-lima-peru/                                    71 de tráfico, 19 keywords
/especialidades-quirurgicas/cirugia-protesis-cadera-...-lima-peru/   98 de tráfico, 23 keywords
/alargamiento-de-piernas-peru-aumenta-tu-estatura-con-seguridad/     65 de tráfico, 18 keywords
/especialidades-quirurgicas/cirugia-secuelas-esguince-tobillo-lima-peru/  16 de tráfico
```

Una URL por procedimiento, con la geo incrustada en el slug. Es exactamente la arquitectura en
silo que `PROJECT.md` decidió para este proyecto en la fase 2, validada por alguien que ya la
tiene funcionando en este mercado.

### 3. El hallazgo que reordena la prioridad: los enlaces no son la barrera

**En los cinco competidores, la home concentra todos los referring domains y las páginas
interiores tienen cero.**

`clinicarthromeds.pe`: 371 en la home, **0 en cada una de las otras nueve**. Y esas nueve son
justo las que traen el tráfico: 98, 71, 65, 16...

`cirujanocolumna-elaos.com`: 162 en la home, 0 en sus dos posts.
`drcarranzacolumna.com`: 158 en la home, 0 en `/preguntas-frecuentes/`.

**Consecuencia para el proyecto:** las páginas que rankean en este nicho lo hacen **por
contenido, no por enlaces**. Un dominio con 0 backlinks —que es exactamente el del doctor— puede
disputar esas SERP sin campaña de linkbuilding.

Eso reordena la prioridad del milestone: **contenido primero, enlaces mucho después.** Y le da
sustento a la decisión ya tomada de dejar el linkbuilding fuera de alcance.

También corrige un supuesto que arrastraba el roadmap: KWR-05 define el punto dulce como "las
keywords cuyo KD es alcanzable con el perfil de enlaces real del dominio". Con la competencia
rankeando sin enlaces, el perfil de enlaces deja de ser el factor limitante. **El punto dulce
hay que calcularlo contra la calidad del contenido que ocupa el top 10, no contra los enlaces.**

## Un detalle que huele mal y conviene mirar aparte

Los cinco competidores tienen entre **405 y 432 referring domains**. Un rango de 27 puntos entre
sitios de tamaños tan distintos —desde uno con 582 keywords hasta tres con cero— no es
casualidad estadística.

La hipótesis más simple es que los cinco compraron el mismo paquete de directorios, o que
contrataron a la misma agencia. Ninguno de esos enlaces les está dando tráfico, lo que refuerza
la lectura anterior.

**No es accionable para este milestone** y no vale la pena investigarlo ahora. Queda anotado por
si en algún momento se evalúa linkbuilding: comprar el mismo paquete sería pagar por lo que
demostrablemente no funciona en este nicho.

## Qué hacer con esto

- **Fase 13, KWR-05 y KWR-06:** el punto dulce se mide por calidad de contenido del top 10, no
  por enlaces. Y las 10 de Oro pueden ser más ambiciosas de lo que parecía: el campo está flojo.
- **Fase 14, MAP-04:** el tipo de página que la SERP exige está confirmado por
  `clinicarthromeds.pe`: una URL por procedimiento con geo en el slug.
- **Fase 15:** el copy es la palanca, no los enlaces. Justifica invertir en profundidad clínica.
- **Workstream `milestone`, fase 11:** las reseñas siguen importando para el local pack, que es
  donde `doctormunguia.com` sí gana pese a no rankear. Los dos canales son independientes.

---
*Medido con 24 consultas a Ahrefs, unas 1.200 unidades. Datos crudos en `.cache/ahrefs/`.*
