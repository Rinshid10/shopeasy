"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { FormField, TextInput } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import {
  ChevronRightIcon,
  HeartIcon,
  MapPinIcon,
  PackageIcon,
  PencilIcon,
} from "@/components/ui/icons";
import { signOut } from "@/lib/auth/customer-auth";
import {
  getDefaultAddress,
  getProfile,
  updateProfile,
  type CustomerProfile,
} from "@/lib/auth/profile";
import type { CustomerState } from "@/lib/auth/use-customer";
import { routes } from "@/lib/routes";
import type { Address } from "@/types";

const PHONE_PATTERN = /^[6-9]\d{9}$/;

interface ProfileScreenProps {
  customer: Extract<CustomerState, { status: "account" }>;
  /** Where to go after logging in, e.g. back to checkout. */
  returnTo?: string;
}

/** The customer's profile: who they are, their saved address, and shortcuts to their things. */
export function ProfileScreen({ customer, returnTo }: ProfileScreenProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let isActive = true;
    void Promise.all([getProfile(), getDefaultAddress()]).then(([loadedProfile, loadedAddress]) => {
      if (!isActive) return;
      setProfile(loadedProfile);
      setAddress(loadedAddress);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const name = profile?.fullName || customer.fullName || "";
  const email = profile?.email || customer.email;
  const initial = (name || email).charAt(0).toUpperCase();

  async function logOut() {
    setIsBusy(true);
    try {
      await signOut();
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Container width="narrow" className="flex flex-col gap-4 py-6 sm:gap-5 sm:py-10">
      <Card className="flex items-center gap-4 p-4 sm:p-6">
        <span
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-bold text-surface"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
            {name ? `Hi, ${name}` : "My Account"}
          </h1>
          <p className="truncate text-sm text-ink-muted">{email}</p>
        </div>
      </Card>

      {returnTo && (
        <ButtonLink href={returnTo} variant="buy" size="lg">
          Continue to Checkout
        </ButtonLink>
      )}

      <Card
        as="section"
        aria-labelledby="details-heading"
        className="flex flex-col gap-4 p-4 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="details-heading" className="font-bold text-ink">
            Personal details
          </h2>
          {!isEditing && profile && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              <PencilIcon className="size-4" />
              Edit
            </button>
          )}
        </div>
        {isEditing && profile ? (
          <DetailsForm
            profile={profile}
            onSaved={(saved) => {
              setProfile(saved);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="Full name" value={name || "Not set"} />
            <Detail label="Email" value={email} />
            <Detail label="Phone" value={profile?.phone || "Not set"} />
          </dl>
        )}
      </Card>

      <Card
        as="section"
        aria-labelledby="address-heading"
        className="flex flex-col gap-3 p-4 sm:p-6"
      >
        <h2 id="address-heading" className="flex items-center gap-2 font-bold text-ink">
          <MapPinIcon className="size-5 text-brand" />
          Delivery address
        </h2>
        {address ? (
          <address className="text-sm leading-relaxed text-ink-muted not-italic">
            <span className="font-semibold text-ink">{address.fullName}</span>
            <br />
            {address.houseNumber}, {address.area}
            {address.landmark && `, ${address.landmark}`}
            <br />
            {address.city}, {address.state} {address.pincode}
            <br />
            Phone: {address.phone}
          </address>
        ) : (
          <p className="text-sm text-ink-muted">No address saved yet.</p>
        )}
        <p className="text-xs text-ink-muted">You can change the address at checkout.</p>
      </Card>

      <Card as="nav" aria-label="My things" className="overflow-hidden">
        <ul className="divide-y divide-line">
          <ShortcutRow
            href={routes.orders}
            icon={<PackageIcon className="size-5" />}
            label="My Orders"
          />
          <ShortcutRow
            href={routes.wishlist}
            icon={<HeartIcon className="size-5" />}
            label="Wishlist"
          />
        </ul>
      </Card>

      <Button variant="outline" size="lg" disabled={isBusy} onClick={() => void logOut()}>
        {isBusy ? "Logging out…" : "Log Out"}
      </Button>
    </Container>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-medium break-words text-ink">{value}</dd>
    </div>
  );
}

function ShortcutRow({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 p-4 text-sm font-semibold text-ink hover:bg-surface-muted"
      >
        <span className="text-brand">{icon}</span>
        {label}
        <ChevronRightIcon className="ml-auto size-5 text-ink-muted" />
      </Link>
    </li>
  );
}

interface DetailsFormProps {
  profile: CustomerProfile;
  onSaved: (profile: CustomerProfile) => void;
  onCancel: () => void;
}

function DetailsForm({ profile, onSaved, onCancel }: DetailsFormProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2) return setError("Enter your name.");
    if (cleanPhone && !PHONE_PATTERN.test(cleanPhone)) {
      return setError("Enter a 10-digit mobile number, or leave it empty.");
    }
    setIsSaving(true);
    setError(undefined);
    try {
      await updateProfile(cleanName, cleanPhone);
      onSaved({ ...profile, fullName: cleanName, phone: cleanPhone });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Couldn't save your details.");
      setIsSaving(false);
    }
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <FormField id="profile-name" label="Full name">
        <TextInput
          id="profile-name"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </FormField>
      <FormField
        id="profile-phone"
        label="Mobile number"
        hint="Optional. Used for delivery updates."
      >
        <TextInput
          id="profile-phone"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="9876543210"
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
        />
      </FormField>
      {error && (
        <p role="alert" className="text-sm text-negative">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" disabled={isSaving} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="buy" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
