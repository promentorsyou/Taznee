import { ProductGridSkeleton, TextLineSkeleton } from "@/components/skeletons";

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <TextLineSkeleton className="h-8 w-48 mb-2" />
      <TextLineSkeleton className="h-4 w-full max-w-2xl mb-8" />
      <TextLineSkeleton className="h-6 w-full max-w-lg mb-8" />
      <ProductGridSkeleton />
    </div>
  );
}
