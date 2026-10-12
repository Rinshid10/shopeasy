import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

/** Every public page, with how often each tends to change and how important it is. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const newestChange = products.reduce<string | undefined>(
    (latest, product) => (latest && latest > product.updatedAt ? latest : product.updatedAt),
    undefined,
  );

  return [
    {
      url: absoluteUrl(routes.home),
      lastModified: newestChange,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl(routes.categories),
      lastModified: newestChange,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...categories.map((category) => ({
      url: absoluteUrl(routes.category(category.slug)),
      lastModified: newestChange,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(routes.product(product.slug)),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
