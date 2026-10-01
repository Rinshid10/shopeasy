"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { PINCODE_PATTERN } from "@/lib/checkout/address";
import { lookupPincode, type PincodeLookup } from "@/lib/checkout/pincode";

export type PincodeCheck = { status: "idle" } | { status: "checking" } | PincodeLookup;

/**
 * Checks the PIN code with India Post once all 6 digits are entered. When it is found,
 * onFound receives its city and state so the form can fill them in.
 */
export function usePincodeCheck(
  pincode: string,
  onFound: (place: { city?: string; state?: string }) => void,
): PincodeCheck {
  const [checked, setChecked] = useState<{ pincode: string; result: PincodeLookup } | null>(null);
  const isComplete = PINCODE_PATTERN.test(pincode);
  const handleFound = useEffectEvent(onFound);

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    const controller = new AbortController();
    lookupPincode(pincode, controller.signal)
      .then((result) => {
        setChecked({ pincode, result });
        if (result.status === "valid") {
          handleFound({ city: result.city, state: result.state });
        }
      })
      .catch(() => {
        // Aborted because the visitor changed the PIN code; the next check takes over.
      });
    return () => controller.abort();
  }, [pincode, isComplete]);

  if (!isComplete) {
    return { status: "idle" };
  }
  return checked?.pincode === pincode ? checked.result : { status: "checking" };
}
