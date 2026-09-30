export interface Product {
  slug: string;
  title: string;
  brand: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  /** Indicative price in whole rupees. Never shown as a guaranteed price. */
  price: number;
  /**
   * The listed MRP in whole rupees, if known. When it is higher than the price, it is shown
   * struck through with the discount percentage.
   */
  mrp?: number;
  /** The product's average rating on Flipkart, out of 5, if known. Shown as a green badge. */
  rating?: number;
  /** How many ratings the average is based on, if known. Shown beside the badge, e.g. "(12.4k)". */
  ratingCount?: number;
  /** ISO date (YYYY-MM-DD) on which the indicative price was last checked. */
  priceCheckedOn: string;
  /**
   * The product picture: a remote URL from Flipkart's affiliate tools, a path under
   * /public, or null to show the placeholder.
   */
  imageUrl: string | null;
  affiliateUrl: string;
  pros: string[];
  cons: string[];
  isTopPick: boolean;
}
