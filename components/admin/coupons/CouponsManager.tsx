"use client";

import { useState } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { SaveStatus, type SaveState } from "@/components/admin/SaveStatus";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CouponCreateForm } from "@/components/admin/coupons/CouponCreateForm";
import { Card } from "@/components/ui/Card";
import { createCoupon, setCouponActive } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/checkout/order-dates";
import { formatPrice } from "@/lib/format";
import type { Coupon } from "@/types";

interface CouponsManagerProps {
  coupons: Coupon[];
}

/** Discount codes with usage, an on/off switch for each, and a form to create more. */
export function CouponsManager({ coupons: initialCoupons }: CouponsManagerProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });

  function setActive(code: string, isActive: boolean) {
    setCoupons((list) => list.map((c) => (c.code === code ? { ...c, isActive } : c)));
    setSaveState({ status: "saving" });
    void setCouponActive(code, isActive).then((result) => {
      if (result.ok) {
        setSaveState({
          status: "saved",
          text: isActive ? `${code} turned on.` : `${code} turned off.`,
        });
      } else {
        setCoupons((list) =>
          list.map((c) => (c.code === code ? { ...c, isActive: !isActive } : c)),
        );
        setSaveState({ status: "error", error: result.error });
      }
    });
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-3">
        <SaveStatus state={saveState} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {coupons.map((coupon) => {
            const usedUp =
              coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit;
            const share = coupon.usageLimit
              ? Math.min(coupon.usageCount / coupon.usageLimit, 1)
              : 0;
            return (
              <li key={coupon.code}>
                <Card
                  className={cn("flex h-full flex-col gap-3 p-4", !coupon.isActive && "opacity-70")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="rounded-lg border-2 border-dashed border-brand/40 bg-brand-soft px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-brand-strong">
                        {coupon.code}
                      </p>
                      <p className="mt-2 text-sm text-ink">{coupon.description}</p>
                    </div>
                    <StatusBadge
                      status={
                        coupon.isActive && !usedUp
                          ? { label: "Active", tone: "good" }
                          : { label: usedUp ? "Used up" : "Paused", tone: "neutral" }
                      }
                    />
                  </div>
                  <p className="text-xs text-ink-muted">
                    Min. order {formatPrice(coupon.minOrderValue)}
                    {coupon.expiresAt && ` · ends ${formatShortDate(coupon.expiresAt)}`}
                  </p>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-ink-muted">
                      Used {coupon.usageCount}
                      {coupon.usageLimit ? ` of ${coupon.usageLimit}` : " times"}
                    </p>
                    {coupon.usageLimit && (
                      <span className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{ width: `${share * 100}%` }}
                        />
                      </span>
                    )}
                  </div>
                  <label className="mt-auto flex cursor-pointer items-center justify-between gap-3 border-t border-line pt-3 text-sm font-medium text-ink">
                    {coupon.isActive ? "Turned on" : "Turned off"}
                    <input
                      type="checkbox"
                      role="switch"
                      checked={coupon.isActive}
                      onChange={() => setActive(coupon.code, !coupon.isActive)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="relative h-6 w-11 rounded-full bg-line peer-checked:bg-positive peer-focus-visible:outline-2 peer-focus-visible:outline-brand after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow peer-checked:after:translate-x-5"
                    />
                  </label>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
      <AdminCard title="New coupon" className="lg:sticky lg:top-24">
        <CouponCreateForm
          existingCodes={coupons.map((coupon) => coupon.code)}
          onCreate={async (coupon) => {
            const result = await createCoupon(coupon);
            if (!result.ok) return result.error;
            setCoupons((list) => [coupon, ...list]);
            setSaveState({ status: "saved", text: `${coupon.code} created.` });
            return null;
          }}
        />
      </AdminCard>
    </div>
  );
}
