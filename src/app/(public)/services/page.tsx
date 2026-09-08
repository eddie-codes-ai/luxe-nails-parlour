import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ServicesPageClient from "./ServicesPageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";

export const metadata: Metadata = {
  title: "Our Services | Nail Care Menu & Pricing",
  description:
    "Explore Luxe Nails Parlour's full service menu — classic manicures, gel nails, acrylic extensions, nail art, pedicures and more. Competitive prices in Juja, Nairobi.",
  keywords: [
    "nail services Nairobi",
    "gel manicure Juja",
    "acrylic nails Thika Road",
    "nail art Nairobi prices",
    "pedicure Juja",
    "nail extensions Kenya",
    "house call nails Nairobi",
  ],
  alternates: { canonical: `${SITE_URL}/services` },
  openGraph: {
    title: "Our Services | Luxe Nails Parlour",
    description:
      "Full nail care menu with pricing — manicures, pedicures, gel, acrylics, nail art and house calls in Juja, Nairobi.",
    url: `${SITE_URL}/services`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Luxe Nails Services" }],
  },
};

async function getActiveServices() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!
  );

  const { data, error } = await supabase
    .from("services")
    .select("id, name, tagline, tag, tag_color, description, base_price, duration_minutes, category, house_call_available, includes, add_ons")
    .eq("is_active", true)
    .order("category")
    .order("base_price");

  if (error) {
    console.error("Failed to fetch services:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function ServicesPage() {
  const services = await getActiveServices();
  return <ServicesPageClient services={services} />;
}