"use client";

import dynamic from "next/dynamic";
import type { InstagramReel } from "@/lib/instagram-shared";

/**
 * Límite de cliente que aísla el carrusel en su propio chunk (CWV-04).
 *
 * El problema que resuelve: `instagram-reels-section.tsx` es un Server Component
 * y hasta ahora importaba `ReelsCarousel` de forma estática. Eso metía el código
 * del carrusel en un chunk compartido que descargaban 25 de los 26 documentos del
 * build, aunque solo `/` y `/testimonios` monten esa sección. Las otras 22 rutas
 * descargaban, analizaban y compilaban código que no pueden ejecutar.
 *
 * Por qué el envoltorio y no un `dynamic()` en la sección: la guía de lazy
 * loading de la versión instalada de Next dice que cuando un Server Component
 * importa dinámicamente un Client Component, la división automática de código
 * **no** está soportada. Desde un Client Component sí lo está, que es el caso de
 * este archivo.
 *
 * El `dynamic()` va sin desactivar el render en servidor, que está prohibido en
 * toda la fase 18: desactivarlo borra el HTML del servidor y obliga a un
 * placeholder, que es el único camino por el que el CLS puede dejar de ser 0.
 * Tal como queda, el marcado servido sale idéntico.
 */
const ReelsCarousel = dynamic(() =>
  import("./reels-carousel").then((m) => m.ReelsCarousel)
);

type Props = {
  reels: InstagramReel[];
  labelledBy: string;
};

export function ReelsCarouselLazy({ reels, labelledBy }: Props) {
  return <ReelsCarousel reels={reels} labelledBy={labelledBy} />;
}
