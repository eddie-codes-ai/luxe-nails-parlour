import type { Metadata } from "next";
import ShopPageClient from "./ShopPageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";

export const metadata: Metadata = {
  title: "Nail Shop | Products & Accessories",
  description:
    "Shop premium nail care products at Luxe Nails Parlour. Nail polishes, gels, tools, oils and accessories. Order via WhatsApp for delivery across Nairobi.",
  keywords: [
    "nail products Kenya",
    "buy nail polish Nairobi",
    "gel nail products Kenya",
    "nail care shop Juja",
    "nail accessories Nairobi",
    "nail tools Kenya",
    "cuticle oil Nairobi",
  ],
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: "Nail Shop | Luxe Nails Parlour",
    description:
      "Premium nail care products — polishes, gels, tools and accessories. Order via WhatsApp for delivery across Nairobi.",
    url: `${SITE_URL}/shop`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Luxe Nails Shop" }],
  },
};

export default function ShopPage() {
  return <ShopPageClient />;
}