"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ANALYTICS_ENABLED, GA4_ID, META_PIXEL_ID } from "@/lib/analytics";

const CONSENT_KEY = "taznee-consent";
type Consent = "granted" | "denied" | null;

/**
 * Loads GA4 and Meta Pixel only after explicit consent, and only when their
 * IDs are configured. Renders a small consent banner when a choice hasn't
 * been made yet. With no analytics IDs set (the demo default), this renders
 * nothing and no tracking scripts load.
 */
export function AnalyticsProvider() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Consent lives in localStorage, which is unavailable during SSR — so it
    // must be read on mount, hence syncing external state into React here.
    if (!ANALYTICS_ENABLED) return;
    const stored = localStorage.getItem(CONSENT_KEY);
    const value: Consent = stored === "granted" ? "granted" : stored === "denied" ? "denied" : null;
    window.__tazneeConsent = value === "granted";
    /* eslint-disable react-hooks/set-state-in-effect */
    setConsent(value);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function choose(value: "granted" | "denied") {
    localStorage.setItem(CONSENT_KEY, value);
    window.__tazneeConsent = value === "granted";
    setConsent(value);
  }

  if (!ANALYTICS_ENABLED || !ready) return null;

  return (
    <>
      {consent === "granted" && GA4_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4_ID}');`}
          </Script>
        </>
      )}

      {consent === "granted" && META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}

      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 bg-charcoal text-ivory/90 border-t border-gold/20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between text-sm">
            <p className="text-ivory/75">
              We use analytics cookies to understand how the site is used. You can accept or decline.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => choose("denied")}
                className="px-4 py-2 rounded-md border border-ivory/30 hover:bg-ivory/10"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="px-4 py-2 rounded-md bg-gold text-charcoal font-medium hover:bg-gold/90"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
