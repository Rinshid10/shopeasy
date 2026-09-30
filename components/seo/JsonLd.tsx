import type { JsonLdData } from "@/lib/seo";

interface JsonLdProps {
  data: JsonLdData;
}

/** Renders structured data for search engines. */
export function JsonLd({ data }: JsonLdProps) {
  // Escaping "<" stops text in the data from closing the script tag early.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
