"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileScreen } from "@/components/account/ProfileScreen";
import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { GoogleIcon, UserIcon } from "@/components/ui/icons";
import {
  cancelGoogleLogin,
  finishGoogleLogin,
  isGoogleLoginPending,
  signInWithGoogle,
} from "@/lib/auth/customer-auth";
import { useCustomer } from "@/lib/auth/use-customer";
import { routes } from "@/lib/routes";

const LOGIN_ERRORS = {
  admin: "This is the admin account. Please use a customer Google account to shop.",
  google: "Couldn't log in with Google. Please try again.",
} as const;

interface AccountPanelProps {
  /** Where to go after logging in, e.g. back to checkout. */
  returnTo?: string;
  /** Why the Google login didn't work, from the callback. */
  loginError?: keyof typeof LOGIN_ERRORS;
}

/** Log in with Google (needed to buy), or see who is logged in. */
export function AccountPanel({ returnTo, loginError }: AccountPanelProps) {
  const router = useRouter();
  const customer = useCustomer();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(
    loginError ? LOGIN_ERRORS[loginError] : undefined,
  );
  /** True when the page opened on the way back from Google (see signInWithGoogle). */
  const [isBackFromGoogle] = useState(isGoogleLoginPending);
  const isFinishingGoogle = isBackFromGoogle && customer.status === "account";

  // Back from Google: bring the guest cart along, then carry on to checkout or the orders.
  const customerStatus = customer.status;
  useEffect(() => {
    if (!isBackFromGoogle || customerStatus === "loading") return;
    if (customerStatus !== "account") {
      // The login didn't go through; the button shows below.
      cancelGoogleLogin();
      return;
    }
    let isActive = true;
    void finishGoogleLogin()
      .catch((finishError: unknown) => {
        console.error("[account] Couldn't carry the guest cart over.", finishError);
      })
      .then(() => {
        if (isActive) router.replace(returnTo ?? routes.orders);
      });
    return () => {
      isActive = false;
    };
  }, [isBackFromGoogle, customerStatus, returnTo, router]);

  if (customer.status === "loading" || isFinishingGoogle) {
    return <CheckoutLoading />;
  }

  if (customer.status === "account") {
    return <ProfileScreen customer={customer} returnTo={returnTo} />;
  }

  async function continueWithGoogle() {
    setIsBusy(true);
    setError(undefined);
    try {
      await signInWithGoogle(returnTo);
      // The browser is now leaving for Google.
    } catch (googleError) {
      setError(googleError instanceof Error ? googleError.message : LOGIN_ERRORS.google);
      setIsBusy(false);
    }
  }

  return (
    <Container width="narrow" className="flex flex-col gap-5 py-8 sm:py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
          <UserIcon className="size-8" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Log in or Sign up</h1>
        <p className="max-w-sm text-ink-muted">
          {returnTo
            ? "Log in with Google to place your order. Your item is saved."
            : "Log in with Google to buy and to see your orders on any device."}
        </p>
      </div>
      <Card className="flex flex-col gap-4 p-4 sm:p-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          disabled={isBusy}
          onClick={() => void continueWithGoogle()}
        >
          <GoogleIcon className="size-5" />
          {isBusy ? "Opening Google…" : "Continue with Google"}
        </Button>
        {error && (
          <p role="alert" className="text-center text-sm text-negative">
            {error}
          </p>
        )}
        <p className="text-center text-xs text-ink-muted">
          We only use your name and email to manage your orders.
        </p>
      </Card>
    </Container>
  );
}
