import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo";

/**
 * Visible breadcrumb trail. Pair with a BreadcrumbList JSON-LD block on the
 * same page so the crawlable and machine-readable trails match. The last
 * item is rendered as plain text (current page), earlier items as links.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-charcoal/50">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1">
              {isLast ? (
                <span aria-current="page" className="text-charcoal/70">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-burgundy hover:underline">
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="text-charcoal/30">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
