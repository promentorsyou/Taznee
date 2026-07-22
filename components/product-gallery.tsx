"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

/**
 * Product image gallery: a large active image, a thumbnail strip to switch
 * between views, and a click-to-open lightbox with keyboard navigation
 * (arrows to move, Escape to close). Falls back gracefully to a single
 * image when only one is provided. Works in both the live and static
 * builds — pure client component, no server dependencies.
 */

interface GalleryImage {
  id: string;
  url: string;
  altText?: string | null;
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const count = images.length;
  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  if (count === 0) {
    return <div className="relative aspect-[3/4] rounded-md bg-charcoal/5" aria-hidden="true" />;
  }

  const activeImg = images[active];
  const alt = activeImg.altText ?? productName;

  return (
    <div>
      {/* Active image — click to zoom */}
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block aspect-[3/4] w-full overflow-hidden rounded-md bg-charcoal/5 cursor-zoom-in"
        aria-label="Zoom image"
      >
        <Image
          src={activeImg.url}
          alt={alt}
          fill
          priority
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-charcoal/60 p-2 text-ivory opacity-0 transition-opacity group-hover:opacity-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${count}`}
              aria-current={i === active}
              className={`relative aspect-square overflow-hidden rounded-md bg-charcoal/5 ring-2 transition ${
                i === active ? "ring-burgundy" : "ring-transparent hover:ring-charcoal/20"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} — view ${i + 1}`}
                fill
                className="object-cover"
                sizes="20vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} enlarged image`}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full p-2 text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Previous image"
                className="absolute left-4 rounded-full p-2 text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Next image"
                className="absolute right-4 bottom-1/2 rounded-full p-2 text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative h-[85vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImg.url}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          {count > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-ivory/70">
              {active + 1} / {count}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
