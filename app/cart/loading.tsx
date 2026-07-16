import { TextLineSkeleton } from "@/components/skeletons";

export default function CartLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <TextLineSkeleton className="h-8 w-32 mb-8" />
      <div className="space-y-4">
        <TextLineSkeleton className="h-24 w-full" />
        <TextLineSkeleton className="h-24 w-full" />
        <TextLineSkeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
