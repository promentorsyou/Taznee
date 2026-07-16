import { TextLineSkeleton } from "@/components/skeletons";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-12">
      <div className="animate-pulse aspect-[3/4] rounded-md bg-charcoal/10" />
      <div className="space-y-4">
        <TextLineSkeleton className="h-3 w-32" />
        <TextLineSkeleton className="h-8 w-3/4" />
        <TextLineSkeleton className="h-4 w-24" />
        <TextLineSkeleton className="h-7 w-28" />
        <TextLineSkeleton className="h-24 w-full" />
        <TextLineSkeleton className="h-16 w-full" />
        <TextLineSkeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
