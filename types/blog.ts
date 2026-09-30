export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  /** ISO date (YYYY-MM-DD), set only when the post was revised after publishing. */
  updatedAt?: string;
}
