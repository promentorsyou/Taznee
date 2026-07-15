"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { centsToDisplay } from "@/lib/money";

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
  const [quote, setQuote] = useState<{
    subtotalCents: number;
    shippingCents: number;
    totalCents: number;
    estimatedMinDate: string;
    estimatedMaxDate: string;
  } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

  async function handleGetQuote() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/quote", {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to calculate shipping");
      setQuote(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrder() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create order");
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          placeholder="Full name"
          className="border border-charcoal/20 rounded px-3 py-2 sm:col-span-2"
          value={address.fullName}
          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
        />
        <input
          placeholder="Address line 1"
          className="border border-charcoal/20 rounded px-3 py-2 sm:col-span-2"
          value={address.line1}
          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
        />
        <input
          placeholder="Address line 2 (optional)"
          className="border border-charcoal/20 rounded px-3 py-2 sm:col-span-2"
          value={address.line2}
          onChange={(e) => setAddress({ ...address, line2: e.target.value })}
        />
        <input
          placeholder="City"
          className="border border-charcoal/20 rounded px-3 py-2"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
        />
        <select
          className="border border-charcoal/20 rounded px-3 py-2"
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value })}
        >
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          placeholder="ZIP code"
          className="border border-charcoal/20 rounded px-3 py-2"
          value={address.postalCode}
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
        />
        <input
          placeholder="Phone (optional)"
          className="border border-charcoal/20 rounded px-3 py-2"
          value={address.phone}
          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
        />
      </div>

      {error && <p className="text-burgundy text-sm">{error}</p>}

      {!clientSecret && (
        <button
          type="button"
          onClick={handleGetQuote}
          disabled={loading || !address.fullName || !address.line1 || !address.city || !address.postalCode}
          className="bg-forest text-ivory px-5 py-2.5 rounded-md hover:bg-forest/90 transition disabled:opacity-40"
        >
          Calculate Shipping
        </button>
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
          className="bg-burgundy text-ivory px-5 py-2.5 rounded-md hover:bg-burgundy/90 transition disabled:opacity-40"
        >
          Continue to Payment
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
            <li key={i.id} className="flex justify-between">
              <span>{i.name} ({i.size}/{i.color}) x{i.quantity}</span>
              <span>{centsToDisplay(i.unitPriceCents * i.quantity)}</span>
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
      setError(confirmError.message ?? "Payment failed");
      setSubmitting(false);
      return;
    }

    router.push(`/checkout/confirmation/${orderId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-burgundy text-sm">{error}</p>}
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
