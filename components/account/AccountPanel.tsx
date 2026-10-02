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
import { continueAsGuest, sendLoginCode, signOut, verifyLoginCode } from "@/lib/auth/customer-auth";
import { useCustomer } from "@/lib/auth/use-customer";
import { routes } from "@/lib/routes";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Supabase codes are 6 digits by default; the project can set up to 10. */
const CODE_PATTERN = /^\d{6,10}$/;
/** Seconds before another code can be sent. */
const RESEND_WAIT = 60;

interface AccountPanelProps {
  /** Where to go after logging in, e.g. back to checkout. */
  returnTo?: string;
}

/** Log in with name, email and an emailed code (needed to buy), or see who is logged in. */
export function AccountPanel({ returnTo }: AccountPanelProps) {
  const router = useRouter();
  const customer = useCustomer();
  const [isChangingDetails, setIsChangingDetails] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "code">("details");
  const [resendIn, setResendIn] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  if (customer.status === "loading") {
    return <CheckoutLoading />;
  }

  if (customer.status === "guest" && !isChangingDetails) {
    return (
      <Container width="narrow" className="flex flex-col gap-5 py-8 sm:py-12">
        <AccountHeading title={`Hi, ${customer.fullName}`} />
        <Card className="flex flex-col gap-4 p-4 sm:p-6">
          <p className="text-ink-muted">
            Shopping as a guest with{" "}
            <span className="font-semibold text-ink">{customer.email}</span>. Your orders are saved
            on this device.
          </p>
          <ButtonLink href={returnTo ?? routes.orders} variant="buy" size="lg">
            {returnTo ? "Continue to Checkout" : "My Orders"}
          </ButtonLink>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setFullName(customer.fullName);
              setEmail(customer.email);
              setIsChangingDetails(true);
            }}
          >
            Change details
          </Button>
        </Card>
      </Container>
    );
  }

  if (customer.status === "account") {
    return (
      <Container width="narrow" className="flex flex-col gap-5 py-8 sm:py-12">
        <AccountHeading title={customer.fullName ? `Hi, ${customer.fullName}` : "My Account"} />
        <Card className="flex flex-col gap-4 p-4 sm:p-6">
          <p className="text-ink-muted">
            Logged in as <span className="font-semibold text-ink">{customer.email}</span>
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

  /** Emails a code; if email can't be sent right now, checks the email and continues as guest. */
  async function sendCode(name: string, address: string) {
    setIsBusy(true);
    setError(undefined);
    try {
      if ((await sendLoginCode(name, address)) === "code-sent") {
        setCode("");
        setStep("code");
        setResendIn(RESEND_WAIT);
        setIsBusy(false);
        return;
      }
      await continueAsGuest(name, address);
      router.replace(returnTo ?? routes.orders);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Couldn't send the code.");
      setIsBusy(false);
    }
  }

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (fullName.trim().length < 2) {
      return setError("Enter your name.");
    }
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      return setError("Enter a valid email address.");
    }
    setEmail(cleanEmail);
    void sendCode(fullName.trim(), cleanEmail);
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!CODE_PATTERN.test(code)) {
      return setError("Enter the code from the email.");
    }
    setIsBusy(true);
    setError(undefined);
    try {
      await verifyLoginCode(fullName.trim(), email, code);
      router.replace(returnTo ?? routes.orders);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Couldn't check the code.");
      setIsBusy(false);
    }
  }

  return (
    <Container width="narrow" className="flex flex-col gap-5 py-8 sm:py-12">
      <AccountHeading
        title="Log in or Sign up"
        text={
          returnTo
            ? "Enter your name and email to buy. Your item is saved."
            : "Enter your name and email to buy and to see your orders on any device."
        }
      />
      <Card className="flex flex-col gap-4 p-4 sm:p-6">
        {step === "details" ? (
          <form noValidate onSubmit={submitDetails} className="flex flex-col gap-4">
            <FormField id="account-name" label="Full name">
              <TextInput
                id="account-name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </FormField>
            <FormField
              id="account-email"
              label="Email address"
              error={error}
              hint="We'll email you a code to confirm it's you."
            >
              <TextInput
                id="account-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                error={error}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
            <Button type="submit" variant="buy" size="lg" fullWidth disabled={isBusy}>
              {isBusy ? "Sending code…" : "Continue"}
            </Button>
          </form>
        ) : (
          <form noValidate onSubmit={submitCode} className="flex flex-col gap-4">
            <FormField
              id="account-code"
              label="Enter the code"
              error={error}
              hint={
                <>
                  Sent to <span className="font-semibold text-ink">{email}</span>. Check spam if it
                  isn&apos;t there.
                </>
              }
            >
              <TextInput
                id="account-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                error={error}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 10))}
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
                  setStep("details");
                  setError(undefined);
                }}
                className="font-semibold text-brand hover:underline disabled:opacity-60"
              >
                Change email
              </button>
              <button
                type="button"
                disabled={isBusy || resendIn > 0}
                onClick={() => void sendCode(fullName.trim(), email)}
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
