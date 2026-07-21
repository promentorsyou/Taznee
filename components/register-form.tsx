"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { fetchJson, FetchJsonError } from "@/lib/fetch-json";
import { track } from "@/lib/analytics";

const inputClass =
  "w-full border border-charcoal/20 rounded px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-burgundy/40";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetchJson("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      track("sign_up", { method: "credentials" });
      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof FetchJsonError
          ? err.message
          : "Registration failed. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <input
        placeholder="Full name"
        required
        autoComplete="name"
        className={inputClass}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
        placeholder="Password (min 8 characters)"
        required
        minLength={8}
        autoComplete="new-password"
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
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
