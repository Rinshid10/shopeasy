import { RequireAccount } from "@/components/account/RequireAccount";

/** Every checkout step needs a logged-in customer: guests are asked to log in with Google. */
export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return <RequireAccount>{children}</RequireAccount>;
}
