/** A review from a Meesho buyer, shown without their name. */
export interface MeeshoReview {
  /** The buyer's name as Meesho shows it ("Meesho User" when they gave none). */
  name?: string;
  rating: number;
  comment: string;
  /** ISO date, e.g. "2026-08-19". */
  date: string;
  /** Photos the buyer attached, on Meesho's image server. */
  images?: string[];
}

/** The product's rating and reviews on Meesho, shown labelled as such. */
export interface MeeshoRatings {
  rating: number;
  ratingCount?: number;
  /** How many of those buyers also wrote a review. */
  reviewCount?: number;
  /** Ratings per star level, best first: [5 stars, 4, 3, 2, 1]. */
  starCounts?: number[];
  /** The Meesho product page they came from. */
  url?: string;
  reviews: MeeshoReview[];
}

/** One row of a product's details table, e.g. { label: "Color", value: "Blue" }. */
export interface ProductSpec {
  label: string;
  value: string;
}

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
  /** Up to 3 more pictures, shown as thumbnails on the product page. */
  extraImageUrls: string[];
  /** Details such as Color or Material, shown as a table on the product page. */
  specs: ProductSpec[];
  /** Rating and reviews from Meesho, if the admin attached them. */
  meesho?: MeeshoRatings;
  pros: string[];
  cons: string[];
  isTopPick: boolean;
}
