"use client";

import { useEffect, useState } from "react";

import { getGuestDetails, hasAccount } from "@/lib/auth/customer-auth";
import { useAuthUser } from "@/lib/auth/use-auth-user";

export type CustomerState =
  | { status: "loading" }
  /** Logged in with an emailed code. */
  | { status: "account"; email: string; fullName?: string }
  /** Gave name and email as a guest (when codes couldn't be sent). */
  | { status: "guest"; email: string; fullName: string }
  /** Not ready to buy yet. */
  | { status: "none" };

/** Who is shopping, and whether they may buy. */
export function useCustomer(): CustomerState {
  const { isLoaded, user } = useAuthUser();
  const [guest, setGuest] = useState<{ userId: string; fullName: string; email: string } | null>(
    null,
  );
  const [checkedGuestId, setCheckedGuestId] = useState<string | null>(null);

  const guestUserId = user?.is_anonymous ? user.id : null;

  useEffect(() => {
    if (!guestUserId) return;
    let isActive = true;
    void getGuestDetails(guestUserId).then((details) => {
      if (!isActive) return;
      setGuest(details ? { userId: guestUserId, ...details } : null);
      setCheckedGuestId(guestUserId);
    });
    return () => {
      isActive = false;
    };
  }, [guestUserId]);

  if (!isLoaded) return { status: "loading" };
  if (user && hasAccount(user)) {
    return {
      status: "account",
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name as string | undefined,
    };
  }
  if (guestUserId) {
    if (checkedGuestId !== guestUserId) return { status: "loading" };
    if (guest?.userId === guestUserId) {
      return { status: "guest", email: guest.email, fullName: guest.fullName };
    }
  }
  return { status: "none" };
}
