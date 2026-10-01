"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { FormField, TextInput } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { UserIcon } from "@/components/ui/icons";
import {
  formatMobile,
  hasAccount,
  sendLoginCode,
  signOut,
  verifyLoginCode,
} from "@/lib/auth/customer-auth";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { PHONE_PATTERN } from "@/lib/checkout/address";
import { routes } from "@/lib/routes";

const CODE_PATTERN = /^\d{6}$/;
/** Seconds before another code can be sent. */
const RESEND_WAIT = 30;

function digitsOnly(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

interface AccountPanelProps {
  /** Where to go after logging in, e.g. back to checkout. */
  returnTo?: string;
}

/** Log in with mobile number and SMS code (needed to buy), or see who is logged in. */
export function AccountPanel({ returnTo }: AccountPanelProps) {
  const router = useRouter();
  const { isLoaded, user } = useAuthUser();
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"mobile" | "code">("mobile");
  const [resendIn, setResendIn] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  if (!isLoaded) {
    return <CheckoutLoading />;
  }

  if (hasAccount(user)) {
    return (
      <Container width="narrow" className="flex enter-up flex-col gap-5 py-8 sm:py-12">
        <AccountHeading title="My Account" />
        <Card className="flex flex-col gap-4 p-4 sm:p-6">
          <p className="text-ink-muted">
            Logged in as <span className="font-semibold text-ink">{formatMobile(user?.phone)}</span>
          </p>
          <ButtonLink href={returnTo ?? routes.orders} variant="buy" size="lg">
            {returnTo ? "Continue to Checkout" : "My Orders"}
          </ButtonLink>
          <Button
            variant="outline"
            size="lg"
            disabled={isBusy}
            onClick={async () => {
              setIsBusy(true);
              try {
                await signOut();
              } finally {
                setIsBusy(false);
              }
            }}
          >
            {isBusy ? "Logging out…" : "Log Out"}
          </Button>
        </Card>
      </Container>
    );
  }

  async function sendCode() {
    setIsBusy(true);
    setError(undefined);
    try {
      await sendLoginCode(mobile);
      setCode("");
      setStep("code");
      setResendIn(RESEND_WAIT);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Couldn't send the code.");
    } finally {
      setIsBusy(false);
    }
  }

  function submitMobile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!PHONE_PATTERN.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    void sendCode();
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!CODE_PATTERN.test(code)) {
      setError("Enter the 6-digit code from the SMS.");
      return;
    }
    setIsBusy(true);
    setError(undefined);
    try {
      await verifyLoginCode(mobile, code);
      router.replace(returnTo ?? routes.orders);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Couldn't check the code.");
      setIsBusy(false);
    }
  }

  return (
    <Container width="narrow" className="flex enter-up flex-col gap-5 py-8 sm:py-12">
      <AccountHeading
        title="Log in or Sign up"
        text={
          returnTo
            ? "Please log in with your mobile number to buy. Your cart is saved."
            : "Use your mobile number to buy and to see your orders on any device."
        }
      />
      <Card className="flex flex-col gap-4 p-4 sm:p-6">
        {step === "mobile" ? (
          <form noValidate onSubmit={submitMobile} className="flex flex-col gap-4">
            <FormField
              id="login-mobile"
              label="Mobile number"
              error={error}
              hint="We'll send a 6-digit code by SMS."
            >
              <div className="flex gap-2">
                <span className="flex h-12 items-center rounded-xl border border-line bg-surface-muted px-3 font-semibold text-ink">
                  +91
                </span>
                <TextInput
                  id="login-mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  error={error}
                  onChange={(event) => setMobile(digitsOnly(event.target.value, 10))}
                />
              </div>
            </FormField>
            <Button type="submit" variant="buy" size="lg" fullWidth disabled={isBusy}>
              {isBusy ? "Sending code…" : "Send Code"}
            </Button>
          </form>
        ) : (
          <form noValidate onSubmit={submitCode} className="flex flex-col gap-4">
            <FormField
              id="login-code"
              label="Enter the 6-digit code"
              error={error}
              hint={
                <>
                  Sent by SMS to{" "}
                  <span className="font-semibold text-ink">{formatMobile(mobile)}</span>
                </>
              }
            >
              <TextInput
                id="login-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                error={error}
                onChange={(event) => setCode(digitsOnly(event.target.value, 6))}
              />
            </FormField>
            <Button type="submit" variant="buy" size="lg" fullWidth disabled={isBusy}>
              {isBusy ? "Checking…" : "Verify and Continue"}
            </Button>
            <div className="flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setStep("mobile");
                  setError(undefined);
                }}
                className="font-semibold text-brand hover:underline disabled:opacity-60"
              >
                Change number
              </button>
              <button
                type="button"
                disabled={isBusy || resendIn > 0}
                onClick={() => void sendCode()}
                className="font-semibold text-brand hover:underline disabled:text-ink-muted disabled:no-underline"
              >
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </Card>
    </Container>
  );
}

function AccountHeading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <UserIcon className="size-8" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
      {text && <p className="max-w-sm text-ink-muted">{text}</p>}
    </div>
  );
}
