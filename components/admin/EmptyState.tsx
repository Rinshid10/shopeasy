interface EmptyStateProps {
  title: string;
  text?: string;
}

/** Shown in place of a list when nothing matches. */
export function EmptyState({ title, text }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-line px-4 py-10 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {text && <p className="text-sm text-ink-muted">{text}</p>}
    </div>
  );
}
