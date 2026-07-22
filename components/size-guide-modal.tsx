"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Size & measurement reference modal, opened from the product page.
 *
 * The table is a GENERAL body-measurement reference (standard apparel
 * size labels mapped to bust/waist/hip ranges) — it is not a claim about
 * any specific garment's cut. Many Bangladeshi pieces are stitched to
 * individual measurements, so the modal makes clear that body
 * measurements (not a size label) drive a custom fit, and links to the
 * full "How to Measure for Custom Stitching" guide. No fabricated
 * garment-specific specs.
 */

interface SizeRow {
  size: string;
  bustIn: string;
  waistIn: string;
  hipIn: string;
}

// Standard women's body-measurement ranges (inches). Widely used
// apparel reference values, not specific to any Taznee product.
const SIZE_ROWS: SizeRow[] = [
  { size: "XS", bustIn: "31–32", waistIn: "24–25", hipIn: "34–35" },
  { size: "S", bustIn: "33–34", waistIn: "26–27", hipIn: "36–37" },
  { size: "M", bustIn: "35–36", waistIn: "28–29", hipIn: "38–39" },
  { size: "L", bustIn: "37–39", waistIn: "30–32", hipIn: "40–42" },
  { size: "XL", bustIn: "40–42", waistIn: "33–35", hipIn: "43–45" },
  { size: "XXL", bustIn: "43–45", waistIn: "36–38", hipIn: "46–48" },
];

export function SizeGuideModal() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-burgundy hover:underline"
      >
        Size &amp; measurement guide
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-charcoal/50 p-0 sm:p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-ivory p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="size-guide-title" className="font-serif text-2xl">
                Size &amp; measurement guide
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close size guide"
                className="shrink-0 rounded-full p-1 text-charcoal/60 hover:bg-charcoal/10 hover:text-charcoal"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <p className="mt-2 text-sm text-charcoal/70 leading-relaxed">
              A general body-measurement reference. Compare your own
              measurements to the ranges below to find a starting size. Fit
              varies by style, so always check the product details.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <caption className="sr-only">
                  Standard body measurements in inches by size
                </caption>
                <thead>
                  <tr className="text-left text-charcoal/60 border-b border-charcoal/15">
                    <th scope="col" className="py-2 pr-3 font-medium">Size</th>
                    <th scope="col" className="py-2 px-3 font-medium">Bust (in)</th>
                    <th scope="col" className="py-2 px-3 font-medium">Waist (in)</th>
                    <th scope="col" className="py-2 pl-3 font-medium">Hip (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_ROWS.map((r) => (
                    <tr key={r.size} className="border-b border-charcoal/10">
                      <th scope="row" className="py-2 pr-3 font-medium text-charcoal">{r.size}</th>
                      <td className="py-2 px-3 text-charcoal/80">{r.bustIn}</td>
                      <td className="py-2 px-3 text-charcoal/80">{r.waistIn}</td>
                      <td className="py-2 pl-3 text-charcoal/80">{r.hipIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-charcoal/50">
              To convert to centimetres, multiply inches by 2.54.
            </p>

            <div className="mt-5 rounded-md bg-forest/5 border border-forest/10 p-4 text-sm text-charcoal/80 leading-relaxed">
              <p className="font-medium text-forest">Made-to-order &amp; custom stitching</p>
              <p className="mt-1">
                Many pieces are stitched to your own measurements rather than a
                fixed size. In that case your body measurements — not a size
                label — determine the fit. Learn how to take them accurately in
                our{" "}
                <Link
                  href="/guides/how-to-measure-for-custom-stitching"
                  className="text-burgundy hover:underline"
                >
                  measurement guide
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
