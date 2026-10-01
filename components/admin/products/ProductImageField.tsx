"use client";

import Image from "next/image";
import { useState } from "react";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";
import { getSupabaseAdminBrowserClient } from "@/lib/supabase/client";
import { getImageUrl, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/mappers";

const ACCEPTED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

interface ProductImageFieldProps {
  /** The product's stored picture path, if it has one. */
  imagePath: string | null;
  productTitle: string;
  /** Called with the new stored path (or null) once a picture is uploaded or removed. */
  onChange: (imagePath: string | null) => void;
}

/**
 * Picks a product picture and uploads it to Supabase Storage straight away. The product only
 * points at it once the form is saved.
 */
export function ProductImageField({ imagePath, productTitle, onChange }: ProductImageFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = getImageUrl(imagePath);

  async function upload(file: File | undefined) {
    if (!file) {
      return;
    }
    const extension = ACCEPTED_TYPES[file.type];
    if (!extension) {
      setError("Choose a PNG, JPG or WebP picture.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Choose a picture under 5 MB.");
      return;
    }

    setIsUploading(true);
    setError(null);
    const path = `products/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await getSupabaseAdminBrowserClient()
      .storage.from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    setIsUploading(false);

    if (uploadError) {
      setError(`Couldn't upload the picture: ${uploadError.message}`);
      return;
    }
    onChange(path);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">Product picture</p>
      <div className="flex items-center gap-4">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-muted">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`Picture of ${productTitle || "the product"}`}
              fill
              sizes="112px"
              className="object-contain p-2"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-xs text-ink-muted">
              {isUploading ? "Uploading…" : "No picture"}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex pressable cursor-pointer items-center gap-2 rounded-xl border border-brand bg-surface px-4 py-2.5 text-sm font-semibold text-brand focus-within:outline-2 focus-within:outline-brand hover:bg-brand-soft">
            <PlusIcon className="size-4" />
            {isUploading ? "Uploading…" : previewUrl ? "Change picture" : "Upload picture"}
            <input
              type="file"
              accept={Object.keys(ACCEPTED_TYPES).join(",")}
              disabled={isUploading}
              className="sr-only"
              onChange={(event) => {
                void upload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {previewUrl && !isUploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 self-start text-sm font-medium text-ink-muted hover:text-negative"
            >
              <CloseIcon className="size-4" />
              Remove
            </button>
          )}
          <p className="text-xs text-ink-muted">PNG, JPG or WebP, square, at least 800 × 800.</p>
          {error && (
            <p role="alert" className="text-xs font-medium text-negative">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
