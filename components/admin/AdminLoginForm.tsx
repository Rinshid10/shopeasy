"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormField, TextInput } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import { adminSignOut } from "@/lib/admin/admin-auth";
import { isAdminClaims } from "@/lib/auth/roles";
import { getSupabaseAdminBrowserClient } from "@/lib/supabase/client";

interface AdminLoginFormProps {
  /** The admin page to open after signing in. */
  returnTo: string;
}

/** Signs the store owner in with email and password, and only lets admins through. */
export function AdminLoginForm({ returnTo }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setIsBusy(true);
    setError(undefined);
    const supabase = getSupabaseAdminBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError) {
      setIsBusy(false);
      setError(
        signInError.code === "invalid_credentials"
          ? "Wrong email or password."
          : signInError.message,
      );
      return;
    }

    const { data } = await supabase.auth.getClaims();
    if (!isAdminClaims(data?.claims)) {
      await adminSignOut();
      setIsBusy(false);
      setError("This account isn't an admin.");
      return;
    }
    router.replace(returnTo);
    router.refresh();
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <FormField id="admin-email" label="Email address">
        <TextInput
          id="admin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>
      <FormField id="admin-password" label="Password" error={error}>
        <TextInput
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          error={error}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormField>
      <Button type="submit" variant="buy" size="lg" fullWidth disabled={isBusy}>
        {isBusy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
