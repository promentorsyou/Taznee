"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Fires a single analytics event on mount. Used for page-view-style events
 * (view_item, purchase) from server components by rendering this client
 * child. No-ops unless analytics are configured and consent is granted.
 */
export function TrackEvent({
  event,
  params,
}: {
  event: AnalyticsEvent;
  params?: Record<string, unknown>;
}) {
  useEffect(() => {
    track(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
