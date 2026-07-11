"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
}

export async function addToCartAction(formData: FormData) {
  const session = await auth();
  const variantId = String(formData.get("variantId"));
  const quantity = Number(formData.get("quantity") ?? 1);

  if (!session?.user?.id) {
    const productSlug = String(formData.get("productSlug") ?? "");
    redirect(`/login?callbackUrl=${encodeURIComponent(productSlug ? `/product/${productSlug}` : "/cart")}`);
  }

  const cart = await getOrCreateCart(session.user.id);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, variantId, quantity },
  });

  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateCartItemAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const itemId = String(formData.get("itemId"));
  const quantity = Number(formData.get("quantity"));

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { id: itemId, cart: { userId: session.user.id } } });
  } else {
    await prisma.cartItem.updateMany({
      where: { id: itemId, cart: { userId: session.user.id } },
      data: { quantity },
    });
  }

  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const itemId = String(formData.get("itemId"));
  await prisma.cartItem.deleteMany({ where: { id: itemId, cart: { userId: session.user.id } } });
  revalidatePath("/cart");
}
