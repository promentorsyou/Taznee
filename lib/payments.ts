/**
 * Payment provider abstraction and the PAYMENTS_ENABLED feature flag.
 *
 * Taznee's business entity and Stripe account are not yet set up, so live
 * payment processing is OFF by default. With payments disabled the cart and
 * the whole checkout flow still work end to end — the customer can enter
 * contact and shipping details and review the order — but the payment step
 * is replaced with an honest "secure checkout is launching soon" notice and
 * NO order is created, charged, or implied to be placed.
 *
 * Enabling payments later is a config change, not a rewrite: set
 * PAYMENTS_ENABLED=true plus the Stripe keys (see LAUNCH_CONFIG.md). No
 * card data is ever collected or stored by Taznee — when Stripe is live it
 * is entered directly into Stripe's own hosted/Elements fields.
 */

/**
 * Whether live payment processing is enabled.
 *
 * Read from a NEXT_PUBLIC_ variable because the checkout UI (a client
 * component) must know which state to render. This flag is NOT a security
 * boundary: it only controls UI. The server-side order/payment routes
 * independently refuse to charge unless the secret Stripe keys are present,
 * and no secret is ever exposed to the browser.
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

/** Supported payment providers. Only "stripe" is planned today. */
export type PaymentProvider = "stripe" | "none";

export const PAYMENT_PROVIDER: PaymentProvider = PAYMENTS_ENABLED ? "stripe" : "none";

/**
 * Customer-facing copy for the disabled state. Deliberately explicit that
 * no order has been placed — never imply a completed purchase.
 */
export const PAYMENTS_DISABLED_HEADING = "Secure checkout is launching soon";

export const PAYMENTS_DISABLED_BODY =
  "We're completing our payment setup, so orders can't be placed just yet. " +
  "Your cart is saved on this device — nothing has been charged and no order has been created. " +
  "Add your email below and we'll let you know the moment checkout opens.";
