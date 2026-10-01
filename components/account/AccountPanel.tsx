"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { FormField, TextInput } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { UserIcon } from "@/components/ui/icons";
import { hasAccount, logIn, register, signOut } from "@/lib/auth/customer-auth";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

type Mode = "log-in" | "register";

interface AccountPanelProps {
  /** Where to go after logging in, e.g. back to checkout. */
  returnTo?: string;
}

/** Log in or register (needed to buy), or see who is logged in. */
export function AccountPanel({ returnTo }: AccountPanelProps) {
  const router = useRouter();
  const { isLoaded, user } = useAuthUser();
  const [mode, setMode] = useState<Mode>("log-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | undefined>();

  if (!isLoaded) {
    return <CheckoutLoading />;
  }

  if (hasAccount(user)) {
    return (
      <Container width="narrow" className="flex enter-up flex-col gap-5 py-8 sm:py-12">
        <AccountHeading title="My Account" />
        <Card className="flex flex-col gap-4 p-4 sm:p-6">
          <p className="text-ink-muted">
            Logged in as <span className="font-semibold text-ink">{user?.email}</span>
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

  function switchMode(next: Mode) {
    setMode(next);
    setError(undefined);
    setNotice(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (mode === "register" && fullName.trim().length < 2) {
      return setError("Enter your name.");
    }
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      return setError("Enter a valid email address.");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    setIsBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      if (mode === "log-in") {
        await logIn(cleanEmail, password);
      } else if ((await register(fullName.trim(), cleanEmail, password)) === "confirm-email") {
        setNotice(
          `We sent a confirmation link to ${cleanEmail}. Open it, then log in here to continue.`,
        );
        setMode("log-in");
        setIsBusy(false);
        return;
      }
      router.replace(returnTo ?? routes.orders);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
      setIsBusy(false);
    }
  }

  return (
    <Container width="narrow" className="flex enter-up flex-col gap-5 py-8 sm:py-12">
      <AccountHeading
        title={mode === "log-in" ? "Log in" : "Create an account"}
        text={
          returnTo
            ? "Please log in or register to buy. Your cart is saved."
            : "Log in to buy and to see your orders on any device."
        }
      />
      <Card className="flex flex-col gap-4 p-4 sm:p-6">
        <div
          role="tablist"
          aria-label="Log in or register"
          className="grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1"
        >
          {(["log-in", "register"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => switchMode(tab)}
              className={cn(
                "rounded-lg py-2 text-sm font-semibold transition-colors",
                mode === tab ? "bg-surface text-brand shadow-sm" : "text-ink-muted hover:text-ink",
              )}
            >
              {tab === "log-in" ? "Log in" : "Register"}
            </button>
          ))}
        </div>
        {notice && (
          <p role="status" className="rounded-xl bg-positive-soft p-3 text-sm text-positive">
            {notice}
          </p>
        )}
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          {mode === "register" && (
            <FormField id="account-name" label="Full name">
              <TextInput
                id="account-name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </FormField>
          )}
          <FormField id="account-email" label="Email address">
            <TextInput
              id="account-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>
          <FormField
            id="account-password"
            label="Password"
            error={error}
            hint={mode === "register" ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
          >
            <TextInput
              id="account-password"
              type="password"
              autoComplete={mode === "log-in" ? "current-password" : "new-password"}
              value={password}
              error={error}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormField>
          <Button type="submit" variant="buy" size="lg" fullWidth disabled={isBusy}>
            {isBusy
              ? mode === "log-in"
                ? "Logging in…"
                : "Creating account…"
              : mode === "log-in"
                ? "Log in"
                : "Create Account"}
          </Button>
        </form>
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
