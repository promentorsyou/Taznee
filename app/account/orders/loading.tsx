import { TextLineSkeleton } from "@/components/skeletons";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <TextLineSkeleton className="h-8 w-40 mb-8" />
      <div className="space-y-6">
        <TextLineSkeleton className="h-36 w-full" />
        <TextLineSkeleton className="h-36 w-full" />
      </div>
    </div>
  );
}
