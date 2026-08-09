"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { InstagramReel } from "@/lib/instagram-shared";
import { reelTitle } from "@/lib/instagram-shared";
import { trackReelClick } from "@/lib/tracking";

type Props = {
  reels: InstagramReel[];
  labelledBy: string;
};

export function ReelsCarousel({ reels, labelledBy }: Props) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges]);

  const scrollByCards = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.clientWidth + 24 : el.clientWidth * 0.8;
    // El suavizado lo pone la clase scroll-smooth (con motion-reduce:scroll-auto),
    // así respeta la preferencia del sistema sin pelearse con el scroll-snap.
    el.scrollBy({ left: step * direction });
  };

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          disabled={atStart}
          aria-label="Ver reels anteriores"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-primary transition-colors duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          disabled={atEnd}
          aria-label="Ver más reels"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-primary transition-colors duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <ul
        ref={scrollerRef}
        onScroll={updateEdges}
        tabIndex={0}
        role="list"
        aria-labelledby={labelledBy}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 motion-reduce:scroll-auto"
      >
        {reels.map((reel) => {
          const title = reelTitle(reel.caption);
          return (
            <li
              key={reel.id}
              role="listitem"
              className="w-[240px] shrink-0 snap-start sm:w-[260px]"
            >
              <a
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackReelClick(reel.id)}
                className="group block rounded-xl border border-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-t-xl bg-muted">
                  <Image
                    src={reel.thumbnailUrl}
                    alt=""
                    fill
                    sizes="260px"
                    className="object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <Play className="size-12 fill-white text-white drop-shadow-lg" />
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-foreground/80">{title}</p>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    Ver en Instagram
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
