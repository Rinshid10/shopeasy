import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { CartIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";

/** A quiet placeholder while the saved cart is read from the browser. */
export function CheckoutLoading() {
  return (
    <Container width="narrow" className="py-8">
      <div aria-busy="true" className="flex flex-col gap-5">
        <span className="sr-only">Loading your cart…</span>
        <div className="h-8 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-7 w-48 animate-pulse rounded-lg bg-surface-muted" />
        <div className="grid gap-5 md:grid-cols-[1fr_20rem]">
          <div className="h-64 animate-pulse rounded-2xl bg-surface-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-surface-muted" />
        </div>
      </div>
    </Container>
  );
}

/** Shown on any checkout step when there is nothing in the cart. */
export function EmptyCart() {
  return (
    <Container
      width="narrow"
      className="flex enter-up flex-col items-center gap-4 py-16 text-center"
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-brand-soft text-brand">
        <CartIcon className="size-10" />
      </span>
      <h1 className="text-xl font-extrabold text-ink">Your cart is empty</h1>
      <p className="max-w-xs text-ink-muted">
        Just relax, let us help you find some first-class products.
      </p>
      <ButtonLink href={routes.home} variant="brand" size="lg">
        Start Shopping
      </ButtonLink>
    </Container>
  );
}
