import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

/** Shown at once after tapping a product, until its page is ready. */
export default function ProductLoading() {
  return (
    <Container width="narrow" className="flex flex-col gap-6 py-5 sm:gap-8 sm:py-8">
      <span className="sr-only" role="status">
        Loading product…
      </span>
      <div className="h-4 w-48 rounded-full bg-surface-muted" />
      <Card className="grid gap-6 p-4 sm:p-6 md:grid-cols-5 md:gap-10">
        <div className="aspect-square rounded-2xl bg-surface-muted md:col-span-2" />
        <div className="flex flex-col gap-4 md:col-span-3 md:self-center">
          <div className="h-7 w-3/4 rounded-lg bg-surface-muted" />
          <div className="h-5 w-1/3 rounded-lg bg-surface-muted" />
          <div className="h-8 w-1/2 rounded-lg bg-surface-muted" />
          <div className="h-12 w-full rounded-xl bg-surface-muted sm:max-w-xs" />
        </div>
      </Card>
    </Container>
  );
}
