import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";

export const metadata: Metadata = {
  title: "Contact Us | Find Us on Thika Road, Juja",
  description:
    "Get in touch with Luxe Nails Parlour. Find us on Thika Road, Juja. Call or WhatsApp 0758 550 286. We also offer house call nail services across Nairobi.",
  keywords: [
    "nail salon contact Nairobi",
    "Luxe Nails Parlour location",
    "nail salon Juja address",
    "nail salon Thika Road",
    "contact nail salon Kenya",
    "nail salon near me Juja",
  ],
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Us | Luxe Nails Parlour",
    description:
      "Find us on Thika Road, Juja. Call or WhatsApp 0758 550 286. House calls available across Nairobi.",
    url: `${SITE_URL}/contact`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Contact Luxe Nails" }],
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}