/**
 * Barril de compatibilidad. El contenido de las sedes vive desde el plan 08-17
 * en `src/content/location-pages/`, con un módulo por sede. Este archivo se
 * conserva para que la ruta de importación pública siga resolviendo igual y
 * ningún consumidor tenga que cambiar su import.
 */

export * from "./location-pages/index";
