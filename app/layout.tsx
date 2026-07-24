import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { IS_INDEXABLE, organizationSchema, websiteSchema } from "@/lib/seo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taznee.example.com";
const defaultTitle = "Taznee — Bangladeshi Fashion, Delivered to the US";
const defaultDescription =
  "Taznee brings original sarees, salwar kameez, panjabi, wedding wear, and jewelry from Bangladeshi designers directly to customers across the United States.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: "%s | Taznee" },
  description: defaultDescription,
  // Global gate: noindex everywhere until the owner opts in at launch.
  robots: { index: IS_INDEXABLE, follow: IS_INDEXABLE },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    siteName: "Taznee",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${playfair.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-burgundy focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to content
        </a>
        {/* CartProvider wraps the whole tree so the header badge, the
            product page, and the drawer all read one cart. */}
        <CartProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
