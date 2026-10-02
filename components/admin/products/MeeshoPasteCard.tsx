"use client";

import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { fieldControlClasses, TextInput } from "@/components/checkout/FormField";
import { Button } from "@/components/ui/Button";
import { checkMeeshoImport, startMeeshoImport } from "@/lib/admin/meesho-actions";
import { parseMeeshoText } from "@/lib/admin/meesho-import";
import type { ProductFormValues } from "@/lib/admin/product-form";
import type { Category, MeeshoRatings } from "@/types";

/** How often to ask whether Meesho has answered, and when to stop asking. */
const CHECK_EVERY_MS = 4000;
const GIVE_UP_AFTER_MS = 3 * 60 * 1000;

type Message = { tone: "good" | "bad" | "info"; text: string };

interface MeeshoPasteCardProps {
  categories: Category[];
  /** Fills the form; picture paths are added to the product's pictures. */
  onFill: (
    values: Partial<ProductFormValues>,
    imagePaths?: string[],
    meesho?: Omit<MeeshoRatings, "reviews"> | null,
  ) => void;
}

const messageClasses: Record<Message["tone"], string> = {
  good: "rounded-xl bg-positive-soft p-3 text-sm text-positive",
  bad: "rounded-xl bg-negative-soft p-3 text-sm text-negative",
  info: "rounded-xl bg-surface-muted p-3 text-sm text-ink-muted",
};

/**
 * Fill the product form from Meesho: import by product link (fetches details and pictures
 * through Apify), or paste the copied text as a free fallback.
 */
export function MeeshoPasteCard({ categories, onFill }: MeeshoPasteCardProps) {
  const [link, setLink] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Stop checking if the admin leaves the page mid-import.
  useEffect(() => () => clearTimeout(timer.current), []);

  async function importLink(url: string) {
    if (isImporting) return;
    setLink(url);
    setIsImporting(true);
    setMessage({ tone: "info", text: "Fetching from Meesho… this can take up to a minute." });

    const started = await startMeeshoImport(url);
    if (!started.ok) {
      setIsImporting(false);
      setMessage({ tone: "bad", text: started.error });
      return;
    }

    const startedAt = Date.now();
    const check = async () => {
      const result = await checkMeeshoImport(started.data.runId, started.data.pageRunId);
      if (result.ok && result.data.status === "running") {
        if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
          setIsImporting(false);
          setMessage({ tone: "bad", text: "Meesho took too long to answer. Try again." });
          return;
        }
        timer.current = setTimeout(check, CHECK_EVERY_MS);
        return;
      }

      setIsImporting(false);
      if (!result.ok) {
        setMessage({ tone: "bad", text: result.error });
        return;
      }
      if (result.data.status !== "done") return;
      const { values, imagePaths, filled, meesho } = result.data;
      onFill(values, imagePaths, meesho);
      setLink("");
      setMessage({
        tone: "good",
        text: `Filled: ${filled.join(", ")}. Now check the ${remainingToCheck(values, imagePaths)}.`,
      });
    };
    timer.current = setTimeout(check, CHECK_EVERY_MS);
  }

  /** Starts importing straight away when a Meesho link is pasted into either box. */
  function importOnPaste(event: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const pasted = event.clipboardData.getData("text").trim();
    if (!isMeeshoLink(pasted)) return;
    event.preventDefault();
    setText("");
    void importLink(pasted);
  }

  function fillFromText() {
    // A link pasted here by mistake is imported rather than read as product text.
    if (isMeeshoLink(text.trim())) {
      const url = text.trim();
      setText("");
      void importLink(url);
      return;
    }
    const { values, filled } = parseMeeshoText(text, categories);
    if (!values.title) {
      setMessage({
        tone: "bad",
        text: "Couldn't find a product name. Copy the product's name and details from Meesho.",
      });
      return;
    }
    onFill(values);
    setMessage({
      tone: "good",
      text: `Filled: ${filled.join(", ")}. Now add or check the ${remainingToCheck(values, [])}.`,
    });
  }

  return (
    <AdminCard
      title="Fill from Meesho"
      description="Paste a Meesho product link: the import starts by itself. Or paste the copied product text and tap Fill form."
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="meesho-link" className="sr-only">
          Meesho product link
        </label>
        <TextInput
          id="meesho-link"
          type="url"
          inputMode="url"
          placeholder="https://www.meesho.com/…/p/…"
          value={link}
          disabled={isImporting}
          onChange={(event) => {
            setLink(event.target.value);
            setMessage(null);
          }}
          onPaste={importOnPaste}
          onKeyDown={(event) => {
            // Enter imports the link instead of submitting the whole product form.
            if (event.key === "Enter") {
              event.preventDefault();
              if (link.trim()) void importLink(link.trim());
            }
          }}
        />
        <Button
          variant="buy"
          className="shrink-0"
          disabled={isImporting || !link.trim()}
          onClick={() => void importLink(link.trim())}
        >
          {isImporting ? "Importing…" : "Import"}
        </Button>
      </div>
      <p className="text-xs text-ink-muted">Or paste the product text copied from Meesho:</p>
      <label htmlFor="meesho-text" className="sr-only">
        Product text copied from Meesho
      </label>
      <textarea
        id="meesho-text"
        rows={4}
        value={text}
        disabled={isImporting}
        placeholder={
          "Product name\nName: …\nColor: Blue\nMaterial: Vinyl\nCountry of Origin: India"
        }
        onChange={(event) => {
          setText(event.target.value);
          setMessage(null);
        }}
        onPaste={importOnPaste}
        className={`${fieldControlClasses(false)} h-auto min-h-24 py-3 leading-relaxed`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline-brand"
          disabled={isImporting || !text.trim()}
          onClick={fillFromText}
        >
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
        <p role="status" className={messageClasses[message.tone]}>
          {message.text}
        </p>
      )}
    </AdminCard>
  );
}

/** What the admin still has to fill in or check after an import. */
function remainingToCheck(values: Partial<ProductFormValues>, imagePaths: string[]): string {
  return [
    !values.price && "price",
    !values.categorySlug ? "category" : "category guess",
    "stock",
    imagePaths.length === 0 && "pictures",
  ]
    .filter(Boolean)
    .join(", ");
}

/** True for a single Meesho product link, e.g. https://www.meesho.com/name/p/8vwcy5. */
function isMeeshoLink(text: string): boolean {
  return /^(https?:\/\/)?([\w-]+\.)?meesho\.com\/\S*\/p\/[\w-]+\S*$/i.test(text);
}
