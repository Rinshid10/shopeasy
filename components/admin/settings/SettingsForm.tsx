"use client";

import { useState, useTransition, type FormEvent } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { SaveStatus, type SaveState } from "@/components/admin/SaveStatus";
import { FormField, TextInput } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import { saveStoreSettings } from "@/lib/admin/actions";
import type { StoreSettings } from "@/types";

type TextKey = {
  [K in keyof StoreSettings]: StoreSettings[K] extends string ? K : never;
}[keyof StoreSettings];
type NumberKey = {
  [K in keyof StoreSettings]: StoreSettings[K] extends number ? K : never;
}[keyof StoreSettings];

interface SettingsFormProps {
  settings: StoreSettings;
}

/** Store details, delivery, payment and return rules in one form. */
export function SettingsForm({ settings: initial }: SettingsFormProps) {
  const [settings, setSettings] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isSaving, startSaving] = useTransition();

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaveState({ status: "idle" });
  }

  const text = (key: TextKey, label: string, extra: object = {}) => (
    <FormField id={`setting-${key}`} label={label}>
      <TextInput
        id={`setting-${key}`}
        value={settings[key]}
        onChange={(event) => set(key, event.target.value)}
        {...extra}
      />
    </FormField>
  );
  const number = (key: NumberKey, label: string, hint?: string) => (
    <FormField id={`setting-${key}`} label={label} hint={hint}>
      <TextInput
        id={`setting-${key}`}
        inputMode="numeric"
        value={String(settings[key])}
        onChange={(event) => set(key, Number(event.target.value.replace(/\D/g, "")) || 0)}
      />
    </FormField>
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState({ status: "saving" });
    startSaving(async () => {
      const result = await saveStoreSettings(settings);
      setSaveState(
        result.ok
          ? { status: "saved", text: "Settings saved." }
          : { status: "error", error: result.error },
      );
    });
  }

  return (
    <form onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-2">
      <AdminCard title="Store details">
        {text("storeName", "Store name")}
        {text("contactEmail", "Contact email", { type: "email", autoComplete: "email" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("supportPhone", "Support phone", { inputMode: "tel" })}
          {text("whatsappNumber", "WhatsApp number", { inputMode: "tel" })}
        </div>
      </AdminCard>
      <AdminCard title="Delivery">
        <div className="grid gap-4 sm:grid-cols-2">
          {number("deliveryCharge", "Delivery charge (₹)", "0 shows FREE delivery.")}
          {number("freeDeliveryAbove", "Free above (₹)", "0 means no free-delivery minimum.")}
          {number("deliveryDaysMin", "Delivery in at least (days)")}
          {number("deliveryDaysMax", "Delivery within (days)")}
        </div>
      </AdminCard>
      <AdminCard title="Payments">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line p-3">
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-ink">Cash on Delivery</span>
            <span className="text-xs text-ink-muted">Customers pay when the order arrives.</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.isCodEnabled}
            onChange={(event) => set("isCodEnabled", event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-6 w-11 shrink-0 rounded-full bg-line peer-checked:bg-positive peer-focus-visible:outline-2 peer-focus-visible:outline-brand after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow peer-checked:after:translate-x-5"
          />
        </label>
        {number("codLimit", "Largest COD order (₹)", "Bigger orders would need online payment.")}
      </AdminCard>
      <AdminCard title="Returns">
        {number("returnWindowDays", "Return window (days after delivery)")}
      </AdminCard>
      <div className="flex flex-col gap-3 lg:col-span-2 lg:flex-row lg:items-center">
        <Button type="submit" variant="buy" size="lg" className="lg:w-56" disabled={isSaving}>
          Save settings
        </Button>
        <SaveStatus state={saveState} />
      </div>
    </form>
  );
}
