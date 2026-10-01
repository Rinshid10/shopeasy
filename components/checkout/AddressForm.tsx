"use client";

import { useRef, useState, type FormEvent } from "react";
import { FormField, TextInput, fieldControlClasses } from "@/components/checkout/FormField";
import { PincodeField } from "@/components/checkout/PincodeField";
import { UseLocationButton } from "@/components/checkout/UseLocationButton";
import { Button } from "@/components/ui/Button";
import {
  EMPTY_ADDRESS,
  INDIAN_STATES,
  validateAddress,
  type AddressErrors,
} from "@/lib/checkout/address";
import type { LocationAddress } from "@/lib/checkout/locate";
import { usePincodeCheck } from "@/lib/checkout/use-pincode-check";
import type { Address } from "@/types";

interface AddressFormProps {
  initialAddress: Address | null;
  onSave: (address: Address) => void;
  onCancel?: () => void;
}

/** Keeps only digits, up to a maximum length, for phone and PIN code fields. */
function digitsOnly(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

/** The delivery address form, with checks that run on submit and then as the visitor fixes fields. */
export function AddressForm({ initialAddress, onSave, onCancel }: AddressFormProps) {
  const [address, setAddress] = useState<Address>(initialAddress ?? EMPTY_ADDRESS);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // The city most recently filled in from a PIN code, so a new PIN code can replace it
  // without ever overwriting a city the visitor typed themselves.
  const autoFilledCity = useRef("");
  // A found PIN code fills in its state, and its city unless the visitor typed their own.
  const pincodeCheck = usePincodeCheck(address.pincode, ({ city, state }) => {
    const cityIsTheirs = address.city !== "" && address.city !== autoFilledCity.current;
    const fillCity = Boolean(city) && !cityIsTheirs;
    if (fillCity && city) {
      autoFilledCity.current = city;
    }
    setAddress((current) => ({
      ...current,
      city: fillCity && city ? city : current.city,
      state: state ?? current.state,
    }));
  });

  function update(field: keyof Address, value: string) {
    const next = { ...address, [field]: value };
    setAddress(next);
    if (hasSubmitted) {
      setErrors(validateAddress(next));
    }
  }

  /** Fills in the fields the location lookup found, keeping anything it could not work out. */
  function fillFromLocation(located: LocationAddress) {
    const next = { ...address };
    for (const [field, value] of Object.entries(located) as [
      keyof LocationAddress,
      string | undefined,
    ][]) {
      if (value) {
        next[field] = value;
      }
    }
    setAddress(next);
    if (hasSubmitted) {
      setErrors(validateAddress(next));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    const nextErrors = validateAddress(address);
    setErrors(nextErrors);

    // The PIN code field shows the India Post result itself; here it only blocks saving
    // while the code is unknown to India Post or still being checked.
    const pincodeBlocks = pincodeCheck.status === "invalid" || pincodeCheck.status === "checking";
    const firstInvalidField = Object.keys(nextErrors)[0] ?? (pincodeBlocks ? "pincode" : undefined);
    if (firstInvalidField) {
      document.getElementById(`address-${firstInvalidField}`)?.focus();
      return;
    }
    onSave({ ...address, fullName: address.fullName.trim() });
  }

  return (
    <form id="address-form" noValidate onSubmit={submit} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-bold text-ink">Contact details</legend>
        <FormField id="address-fullName" label="Full name" error={errors.fullName}>
          <TextInput
            id="address-fullName"
            autoComplete="name"
            value={address.fullName}
            error={errors.fullName}
            onChange={(event) => update("fullName", event.target.value)}
          />
        </FormField>
        <FormField
          id="address-phone"
          label="Mobile number"
          error={errors.phone}
          hint="We'll call this number about your delivery."
        >
          <TextInput
            id="address-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            value={address.phone}
            error={errors.phone}
            onChange={(event) => update("phone", digitsOnly(event.target.value, 10))}
          />
        </FormField>
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-bold text-ink">Address</legend>
        <UseLocationButton onLocated={fillFromLocation} />
        <FormField
          id="address-houseNumber"
          label="House no., building name"
          error={errors.houseNumber}
        >
          <TextInput
            id="address-houseNumber"
            autoComplete="address-line1"
            value={address.houseNumber}
            error={errors.houseNumber}
            onChange={(event) => update("houseNumber", event.target.value)}
          />
        </FormField>
        <FormField id="address-area" label="Road name, area, colony" error={errors.area}>
          <TextInput
            id="address-area"
            autoComplete="address-line2"
            value={address.area}
            error={errors.area}
            onChange={(event) => update("area", event.target.value)}
          />
        </FormField>
        <FormField id="address-landmark" label="Nearby landmark (optional)">
          <TextInput
            id="address-landmark"
            placeholder="E.g. near Apollo Hospital"
            value={address.landmark}
            onChange={(event) => update("landmark", event.target.value)}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <PincodeField
            value={address.pincode}
            check={pincodeCheck}
            error={errors.pincode}
            onChange={(value) => update("pincode", value)}
          />
          <FormField id="address-city" label="City" error={errors.city}>
            <TextInput
              id="address-city"
              autoComplete="address-level2"
              value={address.city}
              error={errors.city}
              onChange={(event) => update("city", event.target.value)}
            />
          </FormField>
        </div>
        <FormField id="address-state" label="State" error={errors.state}>
          <select
            id="address-state"
            autoComplete="address-level1"
            value={address.state}
            aria-invalid={errors.state ? true : undefined}
            aria-describedby={errors.state ? "address-state-error" : undefined}
            onChange={(event) => update("state", event.target.value)}
            className={fieldControlClasses(Boolean(errors.state))}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </FormField>
      </fieldset>
      {onCancel && (
        <Button variant="outline" onClick={onCancel} className="self-start">
          Cancel
        </Button>
      )}
    </form>
  );
}
