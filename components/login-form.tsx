"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const inputClass =
  "w-full border border-charcoal/20 rounded px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-burgundy/40";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <input
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
        inputMode="email"
        className={inputClass}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        required
        autoComplete="current-password"
        className={inputClass}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-burgundy text-sm" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-burgundy text-ivory py-3 rounded-md hover:bg-burgundy/90 transition disabled:opacity-40"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-charcoal/60">
        Demo account: demo@taznee.com / password123
      </p>
    </form>
  );
}
