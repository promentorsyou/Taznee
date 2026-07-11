import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { centsToDisplay } from "@/lib/money";

/**
 * Read-only admin product list, gated by role === "ADMIN". No create/update/
 * delete actions are implemented — see README "Known Limitations" for the
 * full admin CRUD scope that is intentionally out of scope for this build.
 */
export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/products");
  if (session.user.role !== "ADMIN") redirect("/");

  const products = await prisma.product.findMany({
    include: {
      category: true,
      designer: true,
      variants: { include: { inventory: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl mb-2">Admin — Products</h1>
      <p className="text-charcoal/50 mb-8 text-sm">
        Read-only view. Full admin CRUD is not implemented in this build — see README.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-charcoal/10 text-charcoal/50">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Designer</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Ready to Ship</th>
              <th className="py-2 pr-4">Total Inventory</th>
              <th className="py-2 pr-4">Active</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-charcoal/5">
                <td className="py-2 pr-4">{p.name}</td>
                <td className="py-2 pr-4">{p.category.name}</td>
                <td className="py-2 pr-4">{p.designer?.name ?? "—"}</td>
                <td className="py-2 pr-4">{centsToDisplay(p.basePriceCents)}</td>
                <td className="py-2 pr-4">{p.readyToShip ? "Yes" : "No"}</td>
                <td className="py-2 pr-4">
                  {p.variants.reduce((sum, v) => sum + (v.inventory?.quantity ?? 0), 0)}
                </td>
                <td className="py-2 pr-4">{p.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
