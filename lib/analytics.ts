/**
 * Provider-agnostic analytics. Events are dispatched to GA4 (gtag) and Meta
 * Pixel (fbq) only when (a) the provider's ID is configured via env AND
 * (b) the visitor has granted consent. With no IDs set (the demo default),
 * nothing loads and nothing fires.
 *
 * Server-side Meta CAPI is intentionally NOT wired here — it needs the
 * owner's access token and a server relay; see LAUNCH_CONFIG.md.
 */

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
export const ANALYTICS_ENABLED = Boolean(GA4_ID || META_PIXEL_ID);

export type AnalyticsEvent =
  | "view_item"
  | "view_item_list"
  | "search"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "sign_up";

// GA4 event name -> Meta Pixel standard event name.
const META_EVENT_MAP: Record<AnalyticsEvent, string> = {
  view_item: "ViewContent",
  view_item_list: "ViewContent",
  search: "Search",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  sign_up: "CompleteRegistration",
};

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (!window.__tazneeConsent) return; // consent gate

  if (GA4_ID && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
  if (META_PIXEL_ID && typeof window.fbq === "function") {
    window.fbq("track", META_EVENT_MAP[event], params);
  }
}
