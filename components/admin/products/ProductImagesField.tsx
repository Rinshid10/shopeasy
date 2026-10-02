"use client";

import Image from "next/image";
import { useState } from "react";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";
import { MAX_PICTURES } from "@/lib/admin/product-form";
import { getSupabaseAdminBrowserClient } from "@/lib/supabase/client";
import { getImageUrl, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/mappers";

/** Picture types the product-images bucket accepts, with the file extension to store. */
const ACCEPTED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};
const TYPE_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * The picture's type. Some computers (often Windows, for .avif) give no type, so fall back to
 * the file name's extension.
 */
function pictureType(file: File): string | undefined {
  if (ACCEPTED_TYPES[file.type]) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return TYPE_BY_EXTENSION[extension];
}

interface ProductImagesFieldProps {
  /** Stored picture paths, main picture first. */
  imagePaths: string[];
  productTitle: string;
  /** Called with the new list after an upload, a removal or a new main picture. */
  onChange: (imagePaths: string[]) => void;
  /** Shown under the pictures, e.g. when the form is saved with none. */
  error?: string;
}

/**
 * Up to 4 product pictures; at least 1 is needed. The first is the main picture, shown on
 * product cards. Pictures upload to Supabase Storage as soon as they are picked; the product
 * only uses them once the form is saved.
 */
export function ProductImagesField({
  imagePaths,
  productTitle,
  onChange,
  error,
}: ProductImagesFieldProps) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const spaceLeft = MAX_PICTURES - imagePaths.length;
  const shownError = uploadError ?? error;

  async function upload(files: File[]) {
    const chosen = files.slice(0, spaceLeft);
    if (chosen.length === 0) return;
    if (files.length > spaceLeft) {
      setUploadError(`Only ${MAX_PICTURES} pictures fit; the extra ones were skipped.`);
    } else {
      setUploadError(null);
    }

    const bad = chosen.find((file) => !pictureType(file) || file.size > MAX_BYTES);
    if (bad) {
      setUploadError(
        pictureType(bad)
          ? `${bad.name} is over 5 MB. Choose a smaller picture.`
          : `${bad.name} isn't a PNG, JPG, WebP or AVIF picture.`,
      );
      return;
    }

    setUploadingCount(chosen.length);
    const uploaded: string[] = [];
    for (const file of chosen) {
      const type = pictureType(file) ?? file.type;
      const path = `products/${crypto.randomUUID()}.${ACCEPTED_TYPES[type]}`;
      const { error: storageError } = await getSupabaseAdminBrowserClient()
        .storage.from(PRODUCT_IMAGES_BUCKET)
        .upload(path, file, { contentType: type, cacheControl: "31536000" });
      if (storageError) {
        setUploadError(`Couldn't upload ${file.name}: ${storageError.message}`);
        break;
      }
      uploaded.push(path);
    }
    setUploadingCount(0);
    if (uploaded.length > 0) onChange([...imagePaths, ...uploaded]);
  }

  function remove(index: number) {
    onChange(imagePaths.filter((_, position) => position !== index));
  }

  function makeMain(index: number) {
    onChange([imagePaths[index], ...imagePaths.filter((_, position) => position !== index)]);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">
        Product pictures{" "}
        <span className="font-normal text-ink-muted">(at least 1, up to {MAX_PICTURES})</span>
      </p>
      <ul className="grid grid-cols-2 gap-3">
        {imagePaths.map((path, index) => {
          const url = getImageUrl(path);
          return (
            <li key={path} className="flex flex-col gap-1.5">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-muted">
                {url && (
                  <Image
                    src={url}
                    alt={`Picture ${index + 1} of ${productTitle || "the product"}`}
                    fill
                    sizes="150px"
                    className="object-contain p-2"
                  />
                )}
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-brand px-2 py-0.5 text-[0.65rem] font-bold text-surface">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove picture ${index + 1}`}
                  className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-surface text-ink-muted shadow hover:text-negative"
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => makeMain(index)}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Make main
                </button>
              )}
            </li>
          );
        })}
        {spaceLeft > 0 && (
          <li>
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-brand/40 bg-surface p-2 text-center text-xs font-semibold text-brand focus-within:outline-2 focus-within:outline-brand hover:bg-brand-soft">
              <PlusIcon className="size-5" />
              {uploadingCount > 0
                ? `Uploading ${uploadingCount}…`
                : imagePaths.length === 0
                  ? "Add pictures"
                  : "Add more"}
              <input
                type="file"
                multiple
                accept={[...Object.keys(ACCEPTED_TYPES), ".avif"].join(",")}
                disabled={uploadingCount > 0}
                className="sr-only"
                onChange={(event) => {
                  void upload(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>
      <p className="text-xs text-ink-muted">
        PNG, JPG, WebP or AVIF, square, at least 800 × 800. The main picture shows on product cards.
      </p>
      {shownError && (
        <p role="alert" className="text-xs font-medium text-negative">
          {shownError}
        </p>
      )}
    </div>
  );
}
