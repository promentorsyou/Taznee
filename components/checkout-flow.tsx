"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { centsToDisplay } from "@/lib/money";
import { IS_STATIC_BUILD, itemWeightsGrams } from "@/lib/cart";
import { calculateShippingCents } from "@/lib/shipping";
import { SHIPPING_ZONES } from "@/lib/shipping-data";
import {
  PAYMENTS_ENABLED,
  PAYMENTS_DISABLED_BODY,
  PAYMENTS_DISABLED_HEADING,
} from "@/lib/payments";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart-provider";
import { NewsletterSignup } from "@/components/newsletter-signup";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
  "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

// 16px minimum font-size on inputs: iOS Safari zooms the viewport when a
// focused field is smaller, which looks like a broken layout.
const inputClass =
  "w-full rounded border border-charcoal/20 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-burgundy/40";

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

const EMPTY_FORM: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.firstName.trim()) errors.firstName = "Required.";
  if (!form.lastName.trim()) errors.lastName = "Required.";
  if (!form.street1.trim()) errors.street1 = "Required.";
  if (!form.city.trim()) errors.city = "Required.";
  if (!form.state) errors.state = "Select a state.";
  if (!/^\d{5}(-\d{4})?$/.test(form.zip.trim())) errors.zip = "Enter a 5-digit ZIP code.";
  return errors;
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-charcoal/70">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-burgundy">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The payments-off banner. Extracted so it can render both before and
 * after cart hydration without duplicating the copy.
 */
function PaymentsDisabledNotice() {
  return (
    <div role="status" className="mb-8 rounded-lg border border-gold/40 bg-gold/10 p-5">
      <h2 className="font-serif text-lg">{PAYMENTS_DISABLED_HEADING}</h2>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{PAYMENTS_DISABLED_BODY}</p>
      <div className="mt-4">
        <NewsletterSignup enabled={!IS_STATIC_BUILD} source="checkout_waitlist" />
      </div>
    </div>
  );
}

export function CheckoutFlow() {
  const { items, hydrated, subtotal, hasUnavailable } = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (hydrated && items.length > 0) {
      track("begin_checkout", { currency: "USD", value: subtotal / 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  /**
   * Shipping estimate from the real zone/weight rate table once a state is
   * chosen. Returns null before then rather than guessing — an invented
   * number here would be a shipping promise we can't keep.
   */
  const shipping = useMemo(() => {
    if (!form.state || items.length === 0) return null;
    try {
      return calculateShippingCents(SHIPPING_ZONES, form.state, itemWeightsGrams(items));
    } catch {
      return null;
    }
  }, [form.state, items]);

  const total = subtotal + (shipping?.shippingCents ?? 0);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setSubmitted(true);
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-2 font-serif text-3xl">Checkout</h1>
        {/* The payments notice renders before hydration too, so the honest
            "no order can be placed" message is in the server HTML and is
            visible immediately — never hidden behind a loading skeleton. */}
        {!PAYMENTS_ENABLED && <PaymentsDisabledNotice />}
        <div className="h-64 animate-pulse rounded bg-charcoal/5" aria-hidden="true" />
        <p className="sr-only">Loading your bag…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="mb-3 font-serif text-3xl">Checkout</h1>
        <p className="text-charcoal/60">Your bag is empty, so there is nothing to check out.</p>
        <Link
          href="/category/sarees"
          className="mt-6 inline-block rounded-md bg-burgundy px-6 py-3 text-ivory hover:bg-burgundy/90"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl">Checkout</h1>

      {/* Honest, unmissable state: payments are off, so no order can be
          placed. Shown BEFORE the form so nobody fills it in expecting a
          purchase to complete. */}
      {!PAYMENTS_ENABLED && <PaymentsDisabledNotice />}

      {hasUnavailable && (
        <p role="alert" className="mb-6 rounded bg-burgundy/10 px-4 py-3 text-sm text-burgundy">
          Your bag contains an unavailable item.{" "}
          <Link href="/cart" className="underline">
            Review your bag
          </Link>{" "}
          before continuing.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="mb-4 font-serif text-xl">
              1. Contact
            </h2>
            <Field label="Email" id="email" error={errors.email}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={inputClass}
              />
            </Field>
            <p className="mt-1 text-xs text-charcoal/45">
              Order updates are sent here. No account required.
            </p>
          </section>

          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="mb-4 font-serif text-xl">
              2. Shipping address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" id="firstName" error={errors.firstName}>
                <input
                  id="firstName"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                  className={inputClass}
                />
              </Field>
              <Field label="Last name" id="lastName" error={errors.lastName}>
                <input
                  id="lastName"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  aria-invalid={Boolean(errors.lastName)}
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street address" id="street1" error={errors.street1}>
                  <input
                    id="street1"
                    autoComplete="address-line1"
                    value={form.street1}
                    onChange={(e) => set("street1", e.target.value)}
                    aria-invalid={Boolean(errors.street1)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Apartment, suite (optional)" id="street2">
                  <input
                    id="street2"
                    autoComplete="address-line2"
                    value={form.street2}
                    onChange={(e) => set("street2", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="City" id="city" error={errors.city}>
                <input
                  id="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  aria-invalid={Boolean(errors.city)}
                  className={inputClass}
                />
              </Field>
              <Field label="State" id="state" error={errors.state}>
                <select
                  id="state"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  aria-invalid={Boolean(errors.state)}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="ZIP code" id="zip" error={errors.zip}>
                <input
                  id="zip"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  value={form.zip}
                  onChange={(e) => set("zip", e.target.value)}
                  aria-invalid={Boolean(errors.zip)}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone (optional)" id="phone">
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <p className="mt-3 text-xs text-charcoal/45">
              Taznee currently ships to United States addresses only.
            </p>
          </section>

          <section aria-labelledby="method-heading">
            <h2 id="method-heading" className="mb-4 font-serif text-xl">
              3. Shipping method
            </h2>
            {shipping ? (
              <div className="rounded-md border border-charcoal/20 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">Standard international</span>
                  <span className="tabular-nums">{centsToDisplay(shipping.shippingCents)}</span>
                </div>
                <p className="mt-1 text-sm text-charcoal/60">
                  Estimated {shipping.transitMinDays}–{shipping.transitMaxDays} days in transit
                  after dispatch ({shipping.zoneName}). Made-to-order pieces add tailoring time,
                  shown on each product page.
                </p>
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-charcoal/25 p-4 text-sm text-charcoal/55">
                Select a state above to see shipping options and cost.
              </p>
            )}
          </section>

          <section aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="mb-4 font-serif text-xl">
              4. Payment
            </h2>
            {PAYMENTS_ENABLED ? (
              <p className="rounded-md border border-charcoal/20 p-4 text-sm text-charcoal/70">
                Payment details are collected securely by Stripe on the next step. Taznee never
                sees or stores your card number.
              </p>
            ) : (
              <div className="rounded-md border border-charcoal/20 bg-charcoal/[0.03] p-4">
                <p className="text-sm text-charcoal/70">
                  Payment is not available yet, so this order cannot be completed and nothing will
                  be charged. You can still review everything below.
                </p>
              </div>
            )}
          </section>

          <div>
            <button
              type="submit"
              disabled={!PAYMENTS_ENABLED || hasUnavailable}
              className="w-full rounded-md bg-burgundy py-3.5 text-ivory transition hover:bg-burgundy/90 disabled:cursor-not-allowed disabled:bg-charcoal/20 disabled:text-charcoal/50"
            >
              {PAYMENTS_ENABLED ? "Continue to payment" : "Checkout unavailable"}
            </button>
            {submitted && PAYMENTS_ENABLED && (
              <p role="status" className="mt-3 text-sm text-forest">
                Details saved — continuing to secure payment.
              </p>
            )}
            {!PAYMENTS_ENABLED && (
              <p className="mt-3 text-center text-xs text-charcoal/50">
                No order has been placed and no payment has been taken.
              </p>
            )}
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-charcoal/15 p-5">
            <h2 className="mb-4 font-serif text-lg">Order review</h2>
            <ul className="divide-y divide-charcoal/10">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{item.name}</span>
                    <span className="text-xs text-charcoal/50">
                      {[item.size, item.color].filter(Boolean).join(" / ")} × {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {centsToDisplay(item.unitPriceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Subtotal</dt>
                <dd className="tabular-nums">{centsToDisplay(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Shipping</dt>
                <dd className="tabular-nums">
                  {shipping ? centsToDisplay(shipping.shippingCents) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Taxes &amp; duties</dt>
                <dd className="text-charcoal/50">Not yet calculated</dd>
              </div>
              <div className="flex justify-between border-t border-charcoal/10 pt-3 text-base font-medium">
                <dt>Estimated total</dt>
                <dd className="tabular-nums">{centsToDisplay(total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-charcoal/45">
              Any US import duties or sales tax are not included in this estimate.
            </p>
            <Link href="/cart" className="mt-4 block text-center text-sm text-burgundy hover:underline">
              Edit bag
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
