"use client";

import { useState, type FormEvent } from "react";
import { FormField, TextInput, fieldControlClasses } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import type { Coupon, CouponType } from "@/types";

interface CouponCreateFormProps {
  existingCodes: string[];
  /** Saves the coupon; resolves with an error message if it couldn't be saved. */
  onCreate: (coupon: Coupon) => Promise<string | null>;
}

/** Creates a discount code: percent or flat off, with a minimum order and optional expiry. */
export function CouponCreateForm({ existingCodes, onCreate }: CouponCreateFormProps) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(value);
    if (!/^[A-Z0-9]{4,15}$/.test(code)) {
      return setError("Use 4 to 15 capital letters or numbers for the code.");
    }
    if (existingCodes.includes(code)) {
      return setError("That code already exists.");
    }
    if (!Number.isInteger(amount) || amount <= 0 || (type === "percent" && amount > 90)) {
      return setError(
        type === "percent" ? "Enter a discount from 1 to 90%." : "Enter the rupees off.",
      );
    }
    setIsSaving(true);
    const saveError = await onCreate({
      code,
      description: type === "percent" ? `${amount}% off` : `₹${amount} off`,
      type,
      value: amount,
      minOrderValue: Number(minOrder) || 0,
      usageCount: 0,
      expiresAt: expiresAt || undefined,
      isActive: true,
    });
    setIsSaving(false);
    if (saveError) {
      return setError(saveError);
    }
    setCode("");
    setValue("");
    setMinOrder("");
    setExpiresAt("");
    setError(null);
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <FormField id="coupon-code" label="Code" hint="Customers type this at checkout.">
        <TextInput
          id="coupon-code"
          value={code}
          placeholder="DIWALI25"
          onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="coupon-type" label="Discount type">
          <select
            id="coupon-type"
            value={type}
            onChange={(event) => setType(event.target.value === "flat" ? "flat" : "percent")}
            className={fieldControlClasses(false)}
          >
            <option value="percent">Percent off</option>
            <option value="flat">Rupees off</option>
          </select>
        </FormField>
        <FormField id="coupon-value" label={type === "percent" ? "Percent" : "Rupees"}>
          <TextInput
            id="coupon-value"
            inputMode="numeric"
            value={value}
            onChange={(event) => setValue(event.target.value.replace(/\D/g, ""))}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="coupon-min" label="Minimum order (₹)">
          <TextInput
            id="coupon-min"
            inputMode="numeric"
            value={minOrder}
            placeholder="0"
            onChange={(event) => setMinOrder(event.target.value.replace(/\D/g, ""))}
          />
        </FormField>
        <FormField id="coupon-expiry" label="Expires (optional)">
          <TextInput
            id="coupon-expiry"
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
        </FormField>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-negative">
          {error}
        </p>
      )}
      <Button type="submit" variant="buy" fullWidth disabled={isSaving}>
        Create coupon
      </Button>
    </form>
  );
}
