"use client";

import { useState } from "react";
import { CrosshairIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  LocateError,
  locateAddress,
  type LocateErrorReason,
  type LocationAddress,
} from "@/lib/checkout/locate";

type Status =
  | { kind: "idle" }
  | { kind: "locating" }
  | { kind: "found"; hasHouseNumber: boolean }
  | { kind: "failed"; reason: LocateErrorReason };

const FAILURE_MESSAGES: Record<LocateErrorReason, string> = {
  unsupported: "This browser can't share your location. Please type your address below.",
  denied:
    "Location access is blocked. Allow it in your browser settings, or type your address below.",
  unavailable: "We couldn't find your location. Check that location is on, or type your address.",
  "lookup-failed": "We found you but couldn't look up the address. Please type it below.",
};

interface UseLocationButtonProps {
  onLocated: (address: LocationAddress) => void;
}

/** Fills the address form from the visitor's current location, after they allow it. */
export function UseLocationButton({ onLocated }: UseLocationButtonProps) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const isLocating = status.kind === "locating";

  async function useCurrentLocation() {
    setStatus({ kind: "locating" });
    try {
      const located = await locateAddress();
      onLocated(located);
      setStatus({ kind: "found", hasHouseNumber: Boolean(located.houseNumber) });
    } catch (error) {
      const reason = error instanceof LocateError ? error.reason : "unavailable";
      setStatus({ kind: "failed", reason });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={isLocating}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-brand bg-brand-soft px-4 text-sm font-semibold text-brand hover:bg-brand-soft/60 disabled:cursor-wait"
      >
        <CrosshairIcon className={cn("size-5", isLocating && "")} />
        {isLocating ? "Finding your location…" : "Use my current location"}
      </button>
      <p
        aria-live="polite"
        className={cn(
          "text-xs",
          status.kind === "failed" ? "font-medium text-negative" : "text-ink-muted",
        )}
      >
        {status.kind === "found" &&
          (status.hasHouseNumber
            ? "Address filled from your location. Please check it before continuing."
            : "Address filled from your location. Please check it and add your house number.")}
        {status.kind === "failed" && FAILURE_MESSAGES[status.reason]}
      </p>
    </div>
  );
}
