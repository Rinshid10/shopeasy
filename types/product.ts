export interface Product {
  slug: string;
  title: string;
  brand: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  /** Selling price in whole rupees. */
  price: number;
  /**
   * The MRP in whole rupees, if known. When it is higher than the price, it is shown
   * struck through with the discount percentage.
   */
  mrp?: number;
  /** The product's average rating out of 5, if known. Shown as a green badge. */
  rating?: number;
  /** How many ratings the average is based on, if known. Shown beside the badge, e.g. "(12.4k)". */
  ratingCount?: number;
  /** The product picture: a remote URL, a path under /public, or null to show the placeholder. */
  imageUrl: string | null;
  pros: string[];
  cons: string[];
  isTopPick: boolean;
}
