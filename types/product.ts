export interface Product {
  slug: string;
  title: string;
  brand: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  /** Indicative price in whole rupees. Never shown as a guaranteed price. */
  price: number;
  /** ISO date (YYYY-MM-DD) on which the indicative price was last checked. */
  priceCheckedOn: string;
  /** Remote image URL from Flipkart's affiliate tools, or null to show the placeholder. */
  imageUrl: string | null;
  affiliateUrl: string;
  pros: string[];
  cons: string[];
  isTopPick: boolean;
}
