"use client";

import { useState } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { fieldControlClasses } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import { parseMeeshoText } from "@/lib/admin/meesho-import";
import type { ProductFormValues } from "@/lib/admin/product-form";
import type { Category } from "@/types";

interface MeeshoPasteCardProps {
  categories: Category[];
  /** Fills the form with what was read from the pasted text. */
  onFill: (values: Partial<ProductFormValues>) => void;
}

/** Paste product text copied from Meesho, and fill the form from it in one tap. */
export function MeeshoPasteCard({ categories, onFill }: MeeshoPasteCardProps) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  function fill() {
    const { values, filled } = parseMeeshoText(text, categories);
    if (!values.title) {
      setMessage({
        tone: "bad",
        text: "Couldn't find a product name. Copy the product's name and details from Meesho.",
      });
      return;
    }
    onFill(values);
    const toCheck = [
      !values.price && "price",
      !values.categorySlug && "category",
      "stock",
      "pictures",
    ].filter(Boolean);
    setMessage({
      tone: "good",
      text: `Filled: ${filled.join(", ")}. Now add or check the ${toCheck.join(", ")}.`,
    });
  }

  return (
    <AdminCard
      title="Paste from Meesho"
      description="Copy the product's name and details on Meesho, paste them here, and tap Fill form."
    >
      <label htmlFor="meesho-text" className="sr-only">
        Product text copied from Meesho
      </label>
      <textarea
        id="meesho-text"
        rows={5}
        value={text}
        placeholder={
          "Product name\nName: …\nColor: Blue\nMaterial: Vinyl\nCountry of Origin: India"
        }
        onChange={(event) => {
          setText(event.target.value);
          setMessage(null);
        }}
        className={`${fieldControlClasses(false)} h-auto min-h-28 py-3 leading-relaxed`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline-brand" disabled={!text.trim()} onClick={fill}>
          Fill form
        </Button>
        {text && (
          <button
            type="button"
            onClick={() => {
              setText("");
              setMessage(null);
            }}
            className="text-sm font-medium text-ink-muted hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
      {message && (
        <p
          role="status"
          className={
            message.tone === "good"
              ? "rounded-xl bg-positive-soft p-3 text-sm text-positive"
              : "rounded-xl bg-negative-soft p-3 text-sm text-negative"
          }
        >
          {message.text}
        </p>
      )}
    </AdminCard>
  );
}
