# Diferidos de la fase 13

Cosas encontradas durante la ejecución que quedan **fuera del alcance** del plan que las
encontró. No se arreglan ahí: se anotan acá.

## 1. Prueba sensible al reloj en el cliente de DinoRank

- **Encontrado en:** plan 13-01, tarea 3, corriendo la suite completa
- **Dónde:** `seo-tools/src/sources/dinorank.test.ts:325`,
  `comportamiento 5: un limite de tasa no se persiste y se reintenta con retroceso exponencial`
- **Qué pasa:** la segunda mitad de la prueba mide con `Date.now()` los intervalos reales entre
  reintentos, con `backoffMs: 20`, y afirma que crecen. Bajo la carga de la suite completa el
  planificador puede estirar un intervalo lo suficiente como para que la comparación falle.
- **Medido el 2026-08-11:** falló 1 de 5 corridas de `npm test`; pasó 5 de 5 corriendo solo
  `src/sources/dinorank.test.ts` y 4 de 4 en las corridas siguientes de la suite completa.
- **Por qué no se arregló acá:** es preexistente de la fase 12 y ningún cambio del plan 13-01
  toca el cliente de DinoRank ni el envoltorio de red. Arreglarlo bien significa dejar de medir
  el reloj y pasar a inyectar el temporizador, que es una refactorización del envoltorio de red
  con sus propias pruebas.
- **Cuándo tocaría:** si vuelve a fallar y bloquea una verificación, o cuando algún plan tenga
  que tocar `src/http.ts` por otro motivo.
- **Reincidencia el 2026-08-11 (plan 13-03):** volvió a fallar 1 de 4 corridas de la suite
  completa, con las otras 3 en verde y sin ningún cambio de por medio. Confirma el diagnóstico:
  es el reloj bajo carga y no una regresión. Sigue diferido.
