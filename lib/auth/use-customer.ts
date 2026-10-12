"use client";

import { hasAccount } from "@/lib/auth/customer-auth";
import { useAuthUser } from "@/lib/auth/use-auth-user";

export type CustomerState =
  | { status: "loading" }
  /** Logged in with Google. */
  | { status: "account"; email: string; fullName?: string }
  /** A visitor or guest: not logged in, so not able to buy yet. */
  | { status: "none" };

/** Who is shopping, and whether they may buy. */
export function useCustomer(): CustomerState {
  const { isLoaded, user } = useAuthUser();

  if (!isLoaded) return { status: "loading" };
  if (user && hasAccount(user)) {
    return {
      status: "account",
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name as string | undefined,
    };
  }
  return { status: "none" };
}
