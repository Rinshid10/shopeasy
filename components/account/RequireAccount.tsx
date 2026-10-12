"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { CheckoutLoading } from "@/components/checkout/CheckoutStatus";
import { useCustomer } from "@/lib/auth/use-customer";
import { routes } from "@/lib/routes";

/**
 * Shows its content only to logged-in customers. Everyone else is sent to the login page,
 * then comes back here.
 */
export function RequireAccount({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const customer = useCustomer();
  const mustLogIn = customer.status === "none";

  useEffect(() => {
    if (mustLogIn) {
      router.replace(routes.login(pathname));
    }
  }, [mustLogIn, pathname, router]);

  if (customer.status === "loading" || mustLogIn) {
    return <CheckoutLoading />;
  }
  return children;
}
