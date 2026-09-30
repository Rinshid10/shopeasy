interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
}

export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 id={id} className="text-xl font-bold text-ink sm:text-2xl">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-ink-muted sm:text-base">{description}</p>}
    </div>
  );
}
