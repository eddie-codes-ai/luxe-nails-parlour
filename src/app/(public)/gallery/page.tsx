import type { Metadata } from "next";
import GalleryPageClient from "./GalleryPageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";

export const metadata: Metadata = {
  title: "Nail Art Gallery | Our Work",
  description:
    "Browse Luxe Nails Parlour's gallery — stunning nail art, gel designs, acrylic sets and creative nail styles by our expert artists in Juja, Nairobi.",
  keywords: [
    "nail art gallery Nairobi",
    "nail designs Kenya",
    "gel nail art Juja",
    "acrylic nail designs Nairobi",
    "nail inspiration Kenya",
    "best nail art Thika Road",
  ],
  alternates: { canonical: `${SITE_URL}/gallery` },
  openGraph: {
    title: "Nail Art Gallery | Luxe Nails Parlour",
    description:
      "Stunning nail art, gel designs and acrylic sets by our expert artists in Juja, Nairobi. Get inspired.",
    url: `${SITE_URL}/gallery`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Luxe Nails Gallery" }],
  },
};

export default function GalleryPage() {
  return <GalleryPageClient />;
}