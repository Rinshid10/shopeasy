import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return [
    { url: absoluteUrl(routes.home) },
    ...categories.map((category) => ({ url: absoluteUrl(routes.category(category.slug)) })),
    ...products.map((product) => ({
      url: absoluteUrl(routes.product(product.slug)),
      lastModified: product.priceCheckedOn,
    })),
  ];
}
