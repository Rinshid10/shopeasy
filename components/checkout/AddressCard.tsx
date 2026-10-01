import type { ReactNode } from "react";
import { MapPinIcon } from "@/components/ui/icons";
import { formatAddressLine } from "@/lib/checkout/address";
import type { Address } from "@/types";

interface AddressCardProps {
  address: Address;
  /** An optional control in the corner, such as a "Change" button or link. */
  action?: ReactNode;
}

/** A saved delivery address: name, phone and the address on one line. */
export function AddressCard({ address, action }: AddressCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-brand/40 bg-brand-soft p-4">
      <MapPinIcon className="mt-0.5 size-5 shrink-0 text-brand" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold text-ink">{address.fullName}</p>
        <p className="text-sm text-ink-muted">{formatAddressLine(address)}</p>
        <p className="text-sm text-ink">+91 {address.phone}</p>
      </div>
      {action}
    </div>
  );
}
