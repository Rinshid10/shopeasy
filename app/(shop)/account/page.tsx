import { AccountPanel } from "@/components/account/AccountPanel";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Log in",
  description: "Log in with your name and email to buy and to see your orders.",
  path: routes.account,
  noIndex: true,
});

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { next } = await searchParams;
  // Only return to a page on this site.
  const returnTo =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return <AccountPanel returnTo={returnTo} />;
}
