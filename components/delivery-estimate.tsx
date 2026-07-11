import { calculateDeliveryEstimate, formatDateRange } from "@/lib/delivery";

export function DeliveryEstimateBadge({
  readyToShip,
  processingMinDays,
  processingMaxDays,
  transitMinDays,
  transitMaxDays,
}: {
  readyToShip: boolean;
  processingMinDays: number;
  processingMaxDays: number;
  transitMinDays: number;
  transitMaxDays: number;
}) {
  const est = calculateDeliveryEstimate({
    readyToShip,
    processingMinDays,
    processingMaxDays,
    transitMinDays,
    transitMaxDays,
  });

  return (
    <div className="text-sm text-forest">
      <p className="font-medium">
        Estimated delivery to the US: {formatDateRange(est.estimatedMinDate, est.estimatedMaxDate)}
      </p>
      <p className="text-charcoal/60 text-xs mt-0.5">
        {readyToShip
          ? "Ready to ship — no tailoring wait."
          : `Handcrafted to order: ${processingMinDays}-${processingMaxDays} business days to prepare, `}
        {`then ${transitMinDays}-${transitMaxDays} business days international transit.`}
      </p>
    </div>
  );
}
