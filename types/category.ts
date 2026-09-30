/** Pastel background colours available for category cards. */
export type CategoryTint = "sky" | "lavender" | "pink" | "mint" | "peach" | "cream" | "blue";

export interface Category {
  slug: string;
  name: string;
  description: string;
  /** Picture shown on the category card, or null to show the placeholder. */
  imageUrl: string | null;
  /** Card background colour. Pick the one that matches the picture's own background. */
  tint: CategoryTint;
}
