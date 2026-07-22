import Link from "next/link";
import { STATIC_EXPORT } from "@/lib/catalog";

export default function SiteFooter() {
  return (
    <footer className="border-t border-charcoal/10 mt-16 bg-charcoal text-ivory/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <div className="font-serif text-xl text-gold mb-2">Taznee</div>
          <p className="text-ivory/70">
            Original Bangladeshi fashion — sarees, salwar kameez, panjabi, wedding wear, and
            jewelry — designed in Dhaka and shipped directly to your door in the United States.
          </p>
        </div>
        <div>
          <div className="font-medium mb-2 text-gold">Shipping to the US</div>
          <ul className="space-y-1 text-ivory/70">
            <li>Every order ships internationally from Bangladesh.</li>
            <li>Delivery estimates are shown on every product page.</li>
            <li>Ready-to-ship items skip the tailoring queue.</li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2 text-gold">Customer Care</div>
          <ul className="space-y-1 text-ivory/70">
            <li>
              <Link href="/returns" className="hover:text-ivory hover:underline">
                Returns &amp; Refunds
              </Link>
            </li>
            <li>
              <Link href="/guides" className="hover:text-ivory hover:underline">
                Guides
              </Link>
            </li>
            {/* Order History needs auth + the live app; it doesn't exist in
                the static preview build, so linking it there would 404. */}
            {!STATIC_EXPORT && (
              <li>
                <Link href="/account/orders" className="hover:text-ivory hover:underline">
                  Order History
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2 text-gold">Company</div>
          <ul className="space-y-1 text-ivory/70">
            <li>&copy; {new Date().getFullYear()} Taznee. All rights reserved.</li>
            <li>Demo storefront — for evaluation purposes only.</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
