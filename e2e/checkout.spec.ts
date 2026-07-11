import { test, expect } from "@playwright/test";

/**
 * End-to-end happy path: browse -> product detail -> add to cart -> login ->
 * checkout -> Stripe test-mode payment -> confirmation.
 *
 * Requires (see README "Running the e2e tests"):
 *  - `npm run dev` running against a seeded Postgres database
 *  - Stripe test-mode keys set in .env (STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY)
 *  - The demo customer seeded by `npm run db:seed` (demo@taznee.com / password123)
 */

test.describe("Taznee checkout flow", () => {
  test("browse a category, view a product, and add it to the cart", async ({ page }) => {
    await page.goto("/category/sarees");
    await expect(page.getByRole("heading", { name: "Sarees" })).toBeVisible();

    const firstProduct = page.locator("a[href^='/product/']").first();
    await firstProduct.click();

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Estimated delivery/)).toBeVisible();

    await page.getByRole("button", { name: "Add to Cart" }).click();

    // Unauthenticated users are redirected to login before the item is saved.
    await expect(page).toHaveURL(/\/login/);
  });

  test("full purchase flow with a signed-in demo customer", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("demo@taznee.com");
    await page.getByPlaceholder("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/category/sarees");
    const firstProduct = page.locator("a[href^='/product/']").first();
    await firstProduct.click();

    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page).toHaveURL("/cart");

    await page.getByRole("link", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL("/checkout");

    await page.getByPlaceholder("Full name").fill("Test Buyer");
    await page.getByPlaceholder("Address line 1").fill("456 Test Ave");
    await page.getByPlaceholder("City").fill("Austin");
    await page.getByPlaceholder("ZIP code").fill("78701");

    await page.getByRole("button", { name: "Calculate Shipping" }).click();
    await expect(page.getByText(/Estimated delivery/)).toBeVisible();

    await page.getByRole("button", { name: "Continue to Payment" }).click();

    const cardNumberFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await cardNumberFrame.locator('[name="number"]').fill("4242424242424242");
    await cardNumberFrame.locator('[name="expiry"]').fill("12/34");
    await cardNumberFrame.locator('[name="cvc"]').fill("123");

    await page.getByRole("button", { name: "Pay Now" }).click();

    await expect(page).toHaveURL(/\/checkout\/confirmation\//, { timeout: 15000 });
    await expect(page.getByText(/Order #/)).toBeVisible();
  });
});
