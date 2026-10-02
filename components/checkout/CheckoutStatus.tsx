import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ShoppingBagIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";

/** A quiet placeholder while checkout loads. */
export function CheckoutLoading() {
  return (
    <Container width="narrow" className="py-8">
      <div aria-busy="true" className="flex flex-col gap-5">
        <span className="sr-only">Loading…</span>
        <div className="h-8 rounded-full bg-surface-muted" />
        <div className="h-7 w-48 rounded-lg bg-surface-muted" />
        <div className="grid gap-5 md:grid-cols-[1fr_20rem]">
          <div className="h-64 rounded-2xl bg-surface-muted" />
          <div className="h-48 rounded-2xl bg-surface-muted" />
        </div>
      </div>
    </Container>
  );
}

/** Shown on any checkout step when no product has been chosen with Buy Now. */
export function EmptyCart() {
  return (
    <Container width="narrow" className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-brand-soft text-brand">
        <ShoppingBagIcon className="size-10" />
      </span>
      <h1 className="text-xl font-extrabold text-ink">Nothing to buy yet</h1>
      <p className="max-w-xs text-ink-muted">Pick a product and tap Buy Now to order it.</p>
      <ButtonLink href={routes.home} variant="brand" size="lg">
        Start Shopping
      </ButtonLink>
    </Container>
  );
}
