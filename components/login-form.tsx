"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

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
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <input
        type="email"
        placeholder="Email"
        required
        className="w-full border border-charcoal/20 rounded px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        required
        className="w-full border border-charcoal/20 rounded px-3 py-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-burgundy text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-burgundy text-ivory py-2.5 rounded-md hover:bg-burgundy/90 transition disabled:opacity-40"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-charcoal/60">
        Demo account: demo@taznee.com / password123
      </p>
    </form>
  );
}
