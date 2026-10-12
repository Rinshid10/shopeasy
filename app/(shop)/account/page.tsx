import { AccountPanel } from "@/components/account/AccountPanel";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Log in",
  description: "Log in with Google to buy and to see your orders on any device.",
  path: routes.account,
  noIndex: true,
});

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { next, error } = await searchParams;
  // Only return to a page on this site.
  const returnTo =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const loginError = error === "admin" || error === "google" ? error : undefined;
  return <AccountPanel returnTo={returnTo} loginError={loginError} />;
}
