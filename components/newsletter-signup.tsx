"use client";

import { useState } from "react";
import { fetchJson, FetchJsonError } from "@/lib/fetch-json";
import { track } from "@/lib/analytics";

/**
 * Email newsletter signup with an explicit consent checkbox. Submits to
 * /api/newsletter (live app only). On the static preview (`enabled={false}`)
 * the form is shown but disabled with a note, since the API route doesn't
 * exist there. `welcomeOffer` is optional owner-configured copy — no
 * discount is implied unless the owner sets one.
 */
export function NewsletterSignup({
  enabled,
  welcomeOffer,
}: {
  enabled: boolean;
  welcomeOffer?: string;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Please tick the box to consent to receiving emails.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      await fetchJson("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true, source: "homepage" }),
      });
      track("sign_up", { method: "newsletter" });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof FetchJsonError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <p className="text-forest text-sm" role="status">
        Thanks for subscribing — we&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      {welcomeOffer && <p className="text-gold text-sm font-medium">{welcomeOffer}</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="flex-1">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="Your email"
            disabled={!enabled}
            className="w-full border border-ivory/30 bg-transparent rounded px-3 py-2.5 text-base placeholder:text-ivory/40 focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={!enabled || status === "loading"}
          className="bg-gold text-charcoal font-medium px-5 py-2.5 rounded-md hover:bg-gold/90 transition disabled:opacity-50"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <label className="flex items-start gap-2 text-xs text-ivory/60">
        <input
          type="checkbox"
          checked={consent}
          disabled={!enabled}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          I agree to receive marketing emails from Taznee and can unsubscribe at any time.
        </span>
      </label>
      {!enabled && (
        <p className="text-xs text-ivory/50">Newsletter signup is available on the live store.</p>
      )}
      {error && (
        <p className="text-sm text-gold" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
