import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

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
        {children}
      </body>
    </html>
  );
}