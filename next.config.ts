import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF is about 20% smaller than WebP; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
    // Product pictures uploaded from the admin are served from Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kodjfjxztmjbjgcuyetn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Put the (small, Tailwind) CSS inside each page instead of a separate file, so the
    // page can draw at once. Best for first-time visitors arriving from search.
    inlineCss: true,
  },
};

export default nextConfig;
