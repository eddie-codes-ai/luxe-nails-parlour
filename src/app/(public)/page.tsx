import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import ServicesPreview from "@/components/sections/ServicesPreview";
import WhyUs from "@/components/sections/WhyUs";
import ArtistSpotlight from "@/components/sections/ArtistSpotlight";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";

// ArtistSpotlight reads the roster from the database. Rebuilding every 5
// minutes keeps the page served from cache while picking up roster changes,
// rather than hitting Supabase on every visit.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Luxe Nails Parlour | Where Elegance Meets Nail Art",
  description:
    "Welcome to Luxe Nails Parlour — Juja's premier nail salon on Thika Road. Expert manicures, pedicures, gel, acrylics, nail art and house call services. Book online today.",
  keywords: [
    "nail salon Juja",
    "nail art Thika Road",
    "manicure pedicure Nairobi",
    "gel nails Juja",
    "luxury nail salon Kiambu",
    "book nail appointment Nairobi",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Luxe Nails Parlour | Where Elegance Meets Nail Art",
    description:
      "Juja's premier nail salon. Manicures, pedicures, gel, acrylics, nail art & house calls. Book your appointment online.",
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Luxe Nails Parlour" }],
  },
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesPreview />
      <WhyUs />
      <ArtistSpotlight />
    </main>
  );
}