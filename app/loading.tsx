import { ProductGridSkeleton, TextLineSkeleton } from "@/components/skeletons";

export default function HomeLoading() {
  return (
    <div>
      <section className="bg-charcoal">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <TextLineSkeleton className="h-3 w-48 mb-4 bg-ivory/20" />
          <TextLineSkeleton className="h-12 w-full max-w-2xl mb-6 bg-ivory/20" />
          <TextLineSkeleton className="h-4 w-full max-w-xl bg-ivory/20" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <TextLineSkeleton className="h-7 w-56 mb-6" />
        <ProductGridSkeleton />
      </section>
    </div>
  );
}
