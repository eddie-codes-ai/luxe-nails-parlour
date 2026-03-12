import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

// Load heading font — Cormorant Garamond
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

// Load body font — Jost
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

// SEO metadata
export const metadata: Metadata = {
  title: "Luxe Nails Parlour | Nairobi's Premier Nail Studio",
  description:
    "Professional nail art, gel manicures, acrylics and luxury pedicures in Nairobi. Mobile service available across the city. Book your appointment today.",
  keywords: ["nail salon Nairobi", "nail art Kenya", "gel manicure Nairobi", "mobile nail service"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-[#FDFBF7] text-[#2D2424] antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}