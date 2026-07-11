import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-3xl mb-8">Sign in</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-sm text-charcoal/60">
        New to Taznee? <Link href="/register" className="text-burgundy hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
