import { CashIcon, TagIcon, TruckIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

/** The light-blue strip of shop promises under the product details, as on Meesho. */
export function ProductPromises() {
  const promises = [
    { label: "Lowest Price", Icon: TagIcon },
    { label: "Cash on Delivery", Icon: CashIcon },
    ...(siteConfig.store.deliveryCharge === 0 ? [{ label: "Free Delivery", Icon: TruckIcon }] : []),
  ];

  return (
    <ul className="grid auto-cols-fr grid-flow-col divide-x divide-info/20 rounded-xl bg-info-soft py-3">
      {promises.map(({ label, Icon }) => (
        <li key={label} className="flex flex-col items-center gap-1.5 px-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-surface text-brand">
            <Icon className="size-5" />
          </span>
          <span className="text-xs font-medium text-ink">{label}</span>
        </li>
      ))}
    </ul>
  );
}
