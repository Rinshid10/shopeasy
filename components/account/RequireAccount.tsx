"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { hasAccount } from "@/lib/auth/customer-auth";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { routes } from "@/lib/routes";

/**
 * Shows its content only to customers with an account. Guests and visitors are sent to log
 * in or register, then come back here. Buying always needs an account.
 */
export function RequireAccount({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, user } = useAuthUser();
  const isAllowed = hasAccount(user);

  useEffect(() => {
    if (isLoaded && !isAllowed) {
      router.replace(routes.login(pathname));
    }
  }, [isLoaded, isAllowed, pathname, router]);

  if (!isLoaded || !isAllowed) {
    return <CheckoutLoading />;
  }
  return children;
}
