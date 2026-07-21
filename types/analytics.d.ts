// Globals injected by GA4 (gtag.js) and Meta Pixel, plus the Taznee consent
// flag. Analytics only fire when the user has granted consent AND the
// relevant provider ID is configured.
interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  __tazneeConsent?: boolean;
}
