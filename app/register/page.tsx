import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-3xl mb-8">Create your account</h1>
      <RegisterForm />
      <p className="mt-6 text-sm text-charcoal/60">
        Already have an account? <Link href="/login" className="text-burgundy hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
