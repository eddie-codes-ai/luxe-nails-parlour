import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block admin pages and API routes from being indexed
        disallow: ["/admin/", "/api/", "/booking/cancel", "/booking/confirmation"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}