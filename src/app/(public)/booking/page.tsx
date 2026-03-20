import type { Metadata } from "next";
import BookingClient from "./BookingClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";

export const metadata: Metadata = {
  title: "Book an Appointment | Online Nail Booking",
  description:
    "Book your nail appointment at Luxe Nails Parlour online. Choose your service, artist and preferred time. In-salon or house call available in Juja, Nairobi.",
  keywords: [
    "book nail appointment Nairobi",
    "online nail booking Kenya",
    "nail salon booking Juja",
    "book manicure Nairobi",
    "nail appointment Thika Road",
    "house call nail booking Kenya",
  ],
  alternates: { canonical: `${SITE_URL}/booking` },
  openGraph: {
    title: "Book an Appointment | Luxe Nails Parlour",
    description:
      "Book your nail appointment online — choose your service, artist and time. In-salon or house call in Juja, Nairobi.",
    url: `${SITE_URL}/booking`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Book at Luxe Nails" }],
  },
  robots: { index: false, follow: true },
};

export default function BookingPage() {
  return <BookingClient />;
}