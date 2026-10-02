"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminSignOut } from "@/lib/admin/admin-auth";
import { routes } from "@/lib/routes";

interface AdminSignOutButtonProps {
  /** The admin's initial, shown in the avatar. */
  initial: string;
  email: string;
}

/** The admin's avatar; tapping it signs out after a confirm step. */
export function AdminSignOutButton({ initial, email }: AdminSignOutButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-muted hover:text-ink"
        >
          Stay
        </button>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={async () => {
            setIsSigningOut(true);
            await adminSignOut();
            router.replace(routes.admin.login);
            router.refresh();
          }}
          className="rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-surface disabled:opacity-60"
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      aria-label={`Signed in as ${email}. Sign out`}
      title={`${email}: sign out`}
      className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-surface"
    >
      {initial}
    </button>
  );
}
