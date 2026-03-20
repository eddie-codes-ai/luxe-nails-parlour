import type { Metadata } from "next";
import ArtistsPageClient from "./ArtistsPageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";

export const metadata: Metadata = {
  title: "Meet Our Artists | Nail Technicians",
  description:
    "Meet the talented nail artists at Luxe Nails Parlour, Juja. Skilled in nail art, gel, acrylics and creative designs. Book your preferred artist online.",
  keywords: [
    "nail artists Nairobi",
    "nail technician Juja",
    "best nail artist Kenya",
    "nail tech Thika Road",
    "professional nail artist Nairobi",
  ],
  alternates: { canonical: `${SITE_URL}/artists` },
  openGraph: {
    title: "Meet Our Artists | Luxe Nails Parlour",
    description:
      "Skilled nail artists specialising in gel, acrylics and nail art in Juja, Nairobi. Book your preferred artist today.",
    url: `${SITE_URL}/artists`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Luxe Nails Artists" }],
  },
};

export default function ArtistsPage() {
  return <ArtistsPageClient />;
}