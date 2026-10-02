import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; text?: string }
  | { status: "error"; error: string };

interface SaveStatusProps {
  state: SaveState;
}

/** A short note under an admin form or list: saving, saved, or what went wrong. */
export function SaveStatus({ state }: SaveStatusProps) {
  if (state.status === "idle") {
    return null;
  }

  const isError = state.status === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl p-3 text-xs",
        isError && "bg-negative-soft text-negative",
        state.status === "saved" && "bg-positive-soft text-positive",
        state.status === "saving" && "bg-surface-muted text-ink-muted",
      )}
    >
      {isError ? (
        <AlertIcon className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckIcon className="mt-0.5 size-4 shrink-0" />
      )}
      {state.status === "saving" && "Saving…"}
      {state.status === "saved" && (state.text ?? "Saved.")}
      {isError && state.error}
    </p>
  );
}
