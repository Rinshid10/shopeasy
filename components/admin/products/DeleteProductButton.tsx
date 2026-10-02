"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@/components/ui/icons";
import { deleteProduct } from "@/lib/admin/actions";
import { routes } from "@/lib/routes";

interface DeleteProductButtonProps {
  slug: string;
  title: string;
}

/** Deletes the product after an in-page confirmation (no pop-up dialog). */
export function DeleteProductButton({ slug, title }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteProduct(slug);
    if (!result.ok) {
      setIsDeleting(false);
      setError(result.error);
      return;
    }
    router.replace(routes.admin.products);
    router.refresh();
  }

  if (!isConfirming) {
    return (
      <Button
        variant="outline"
        fullWidth
        className="text-negative hover:border-negative"
        onClick={() => setIsConfirming(true)}
      >
        <TrashIcon className="size-4" />
        Delete product
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-labelledby="delete-product-question"
      className="flex flex-col gap-3 rounded-2xl border border-negative/30 bg-surface p-4"
    >
      <p id="delete-product-question" className="text-sm font-semibold text-ink">
        Delete &ldquo;{title}&rdquo;? This can&apos;t be undone.
      </p>
      <p className="text-xs text-ink-muted">
        It disappears from the shop, with its pictures and reviews. Past orders keep their details.
        To only hide it, choose Draft and save instead.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" disabled={isDeleting} onClick={() => setIsConfirming(false)}>
          Keep
        </Button>
        <Button variant="danger" disabled={isDeleting} onClick={() => void confirmDelete()}>
          {isDeleting ? "Deleting…" : "Yes, delete"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-negative">
          {error}
        </p>
      )}
    </div>
  );
}
