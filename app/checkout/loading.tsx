import { TextLineSkeleton } from "@/components/skeletons";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <TextLineSkeleton className="h-8 w-40 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextLineSkeleton className="h-11 sm:col-span-2" />
        <TextLineSkeleton className="h-11 sm:col-span-2" />
        <TextLineSkeleton className="h-11" />
        <TextLineSkeleton className="h-11" />
        <TextLineSkeleton className="h-11" />
        <TextLineSkeleton className="h-11" />
      </div>
    </div>
  );
}
