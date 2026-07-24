"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Product share control.
 *
 * On devices that support it (most phones) this opens the OS share sheet
 * via the Web Share API, which is the only reliable way to reach the full
 * set of installed apps. Everywhere else it falls back to a small menu of
 * web-intent links plus "Copy link" — those intents are genuine share URLs
 * the platforms support; we deliberately do NOT claim to post on the
 * customer's behalf, because a website cannot do that.
 *
 * Shared URLs carry UTM parameters so the owner can attribute traffic
 * without any tracking of the person who shared.
 */
function withUtm(url: string, source: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", "share");
    u.searchParams.set("utm_campaign", "product_share");
    return u.toString();
  } catch {
    return url;
  }
}

export function ShareButton({
  url,
  title,
  text,
}: {
  /** Absolute, canonical product URL. */
  url: string;
  title: string;
  text?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // navigator.share is probed at click time rather than stored in state:
  // it can't be read during render (the server has no navigator) and
  // checking lazily avoids an extra render pass on mount.
  function supportsNativeShare(): boolean {
    return typeof navigator !== "undefined" && typeof navigator.share === "function";
  }

  // Close the fallback menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function copyLink() {
    const link = withUtm(url, "copy_link");
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard API can be blocked; fall back to a selectable prompt so
      // the customer can still copy manually.
      window.prompt("Copy this link:", link);
    }
    setCopied(true);
    track("share", { method: "copy_link", item_id: title });
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (supportsNativeShare()) {
      try {
        await navigator.share({ title, text, url: withUtm(url, "native_share") });
        track("share", { method: "native", item_id: title });
      } catch {
        // The customer dismissed the sheet — not an error worth surfacing.
      }
      return;
    }
    setMenuOpen((open) => !open);
  }

  const encodedTitle = encodeURIComponent(title);
  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodeURIComponent(withUtm(url, "whatsapp"))}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(withUtm(url, "facebook"))}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodeURIComponent(withUtm(url, "x"))}` },
    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(withUtm(url, "pinterest"))}&description=${encodedTitle}` },
    { label: "Email", href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(withUtm(url, "email"))}` },
  ];

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="inline-flex items-center gap-2 rounded-md border border-charcoal/20 px-4 py-2.5 text-sm transition hover:border-burgundy hover:text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v13M12 3L8 7M12 3l4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Share
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute left-0 z-40 mt-2 w-48 overflow-hidden rounded-md border border-charcoal/15 bg-ivory shadow-lg"
        >
          {targets.map((t) => (
            <a
              key={t.label}
              role="menuitem"
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                track("share", { method: t.label.toLowerCase(), item_id: title });
                setMenuOpen(false);
              }}
              className="block px-4 py-2.5 text-sm hover:bg-charcoal/5"
            >
              {t.label}
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="block w-full border-t border-charcoal/10 px-4 py-2.5 text-left text-sm hover:bg-charcoal/5"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      )}

      <span aria-live="polite" className="sr-only">
        {copied ? "Product link copied to clipboard" : ""}
      </span>
    </div>
  );
}
