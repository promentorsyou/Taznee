import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Newsletter subscribe endpoint. Requires an email and an explicit consent
 * flag. Subscribers are stored durably in the DB so signups are never lost
 * before an email provider is connected. When the owner wires a provider
 * (Klaviyo/Mailchimp/etc.), sync these rows and/or forward here — see
 * LAUNCH_CONFIG.md. No welcome email is sent yet.
 */
const schema = z.object({
  email: z.string().email(),
  consent: z.literal(true, { message: "Consent is required" }),
  source: z.string().max(60).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email and accept the consent checkbox." },
      { status: 400 },
    );
  }

  const { email, source } = parsed.data;
  await prisma.newsletterSubscriber.upsert({
    where: { email: email.toLowerCase() },
    update: { consent: true, source: source ?? "homepage" },
    create: { email: email.toLowerCase(), consent: true, source: source ?? "homepage" },
  });

  return NextResponse.json({ ok: true });
}
