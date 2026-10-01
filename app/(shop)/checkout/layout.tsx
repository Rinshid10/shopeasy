import { RequireAccount } from "@/components/account/RequireAccount";

/** Every checkout step needs a logged-in customer: guests are asked to log in or register. */
export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return <RequireAccount>{children}</RequireAccount>;
}
