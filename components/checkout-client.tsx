"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { centsToDisplay } from "@/lib/money";
import { fetchJson, FetchJsonError } from "@/lib/fetch-json";
import { track } from "@/lib/analytics";

interface CartLine {
  id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPriceCents: number;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
  "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

// text-base (16px) on every field: iOS Safari auto-zooms the page when a
// focused input's font-size is below 16px, which reads as a broken layout.
const inputClass =
  "border border-charcoal/20 rounded px-3 py-2.5 text-base w-full focus:outline-none focus:ring-2 focus:ring-burgundy/40";

interface Quote {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  estimatedMinDate: string;
  estimatedMaxDate: string;
}

export function CheckoutClient({
  publishableKey,
  items,
}: {
  publishableKey: string;
  items: CartLine[];
}) {
  const [address, setAddress] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "CA",
    postalCode: "",
    phone: "",
  });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    track("begin_checkout", {
      currency: "USD",
      value: items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0) / 100,
      items: items.map((i) => ({ item_id: i.id, quantity: i.quantity })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

  function handleFailure(e: unknown) {
    if (e instanceof FetchJsonError) {
      setError(e.message);
      setCanRetry(e.retryable);
    } else {
      setError("Something went wrong. Please try again.");
      setCanRetry(true);
    }
  }

  async function handleGetQuote() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<Quote>("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: address.fullName,
          line1: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
        }),
      });
      setQuote(data);
      setCanRetry(false);
    } catch (e) {
      handleFailure(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrder() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<{ orderId: string; clientSecret: string }>(
        "/api/checkout/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(address),
          timeoutMs: 20000,
        },
      );
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setCanRetry(false);
    } catch (e) {
      handleFailure(e);
    } finally {
      setLoading(false);
    }
  }

  const zipValid = /^\d{5}(-\d{4})?$/.test(address.postalCode);
  const addressComplete = Boolean(address.fullName && address.line1 && address.city && zipValid);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="sm:col-span-2">
          <span className="sr-only">Full name</span>
          <input
            placeholder="Full name"
            autoComplete="name"
            className={inputClass}
            value={address.fullName}
            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="sr-only">Address line 1</span>
          <input
            placeholder="Address line 1"
            autoComplete="address-line1"
            className={inputClass}
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="sr-only">Address line 2 (optional)</span>
          <input
            placeholder="Address line 2 (optional)"
            autoComplete="address-line2"
            className={inputClass}
            value={address.line2}
            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
          />
        </label>
        <label>
          <span className="sr-only">City</span>
          <input
            placeholder="City"
            autoComplete="address-level2"
            className={inputClass}
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
        </label>
        <label>
          <span className="sr-only">State</span>
          <select
            autoComplete="address-level1"
            className={inputClass}
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
          >
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">ZIP code</span>
          <input
            placeholder="ZIP code"
            autoComplete="postal-code"
            inputMode="numeric"
            className={inputClass}
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
          />
        </label>
        <label>
          <span className="sr-only">Phone (optional)</span>
          <input
            placeholder="Phone (optional)"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={inputClass}
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-md border border-burgundy/30 bg-burgundy/5 p-3 text-sm text-burgundy" role="alert">
          <p>{error}</p>
          {canRetry && (
            <button
              type="button"
              onClick={quote && !clientSecret ? handleCreateOrder : handleGetQuote}
              disabled={loading}
              className="mt-2 underline underline-offset-2 disabled:opacity-40"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!clientSecret && (
        <button
          type="button"
          onClick={handleGetQuote}
          disabled={loading || !addressComplete}
          className="w-full sm:w-auto bg-forest text-ivory px-5 py-3 rounded-md hover:bg-forest/90 transition disabled:opacity-40"
        >
          {loading && !quote ? "Calculating…" : "Calculate Shipping"}
        </button>
      )}

      {!clientSecret && !addressComplete && (
        <p className="text-xs text-charcoal/50 -mt-4">
          Enter your name, street address, city, and a valid 5-digit ZIP code to see shipping.
        </p>
      )}

      {quote && (
        <div className="border border-charcoal/10 rounded-md p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{centsToDisplay(quote.subtotalCents)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{centsToDisplay(quote.shippingCents)}</span></div>
          <div className="flex justify-between font-medium border-t border-charcoal/10 pt-1 mt-1">
            <span>Total</span><span>{centsToDisplay(quote.totalCents)}</span>
          </div>
          <p className="text-forest pt-2">
            Estimated delivery: {new Date(quote.estimatedMinDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" – "}
            {new Date(quote.estimatedMaxDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
      )}

      {quote && !clientSecret && (
        <button
          type="button"
          onClick={handleCreateOrder}
          disabled={loading}
          className="w-full sm:w-auto bg-burgundy text-ivory px-5 py-3 rounded-md hover:bg-burgundy/90 transition disabled:opacity-40"
        >
          {loading ? "Preparing payment…" : "Continue to Payment"}
        </button>
      )}

      {clientSecret && stripePromise && orderId && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm orderId={orderId} />
        </Elements>
      )}

      {clientSecret && !publishableKey && (
        <p className="text-sm text-burgundy">
          Stripe publishable key not configured — set STRIPE_PUBLISHABLE_KEY in .env to enable
          the payment form.
        </p>
      )}

      <div className="border-t border-charcoal/10 pt-6">
        <h2 className="font-serif text-lg mb-3">Order Summary</h2>
        <ul className="text-sm space-y-1">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span className="min-w-0">{i.name} ({i.size}/{i.color}) x{i.quantity}</span>
              <span className="shrink-0">{centsToDisplay(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation/${orderId}`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. You have not been charged — please try again.");
      setSubmitting(false);
      return;
    }

    router.push(`/checkout/confirmation/${orderId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <p className="text-burgundy text-sm" role="alert">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-burgundy text-ivory py-3 rounded-md hover:bg-burgundy/90 transition disabled:opacity-40"
      >
        {submitting ? "Processing…" : "Pay Now"}
      </button>
      <p className="text-xs text-charcoal/40">
        Test mode — use card 4242 4242 4242 4242, any future expiry, any CVC.
      </p>
    </form>
  );
}
