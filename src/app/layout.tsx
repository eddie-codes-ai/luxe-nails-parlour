import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

// ─── Site-wide defaults ───────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-nails-parlour.vercel.app";
const SITE_NAME = "Luxe Nails Parlour";
const TAGLINE = "Where elegance meets nail art";
const DESCRIPTION =
  "Luxe Nails Parlour — premium nail care on Thika Road, Juja. Manicures, pedicures, gel, acrylics, nail art and house calls across Nairobi. Book your appointment today.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const GA_ID = "G-HY0NP5K4PM";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "nail salon Nairobi",
    "nail art Nairobi",
    "manicure Nairobi",
    "pedicure Nairobi",
    "gel nails Nairobi",
    "acrylic nails Nairobi",
    "nail salon Juja",
    "nail salon Thika Road",
    "house call nail service Nairobi",
    "luxury nail salon Kenya",
    "nail extensions Nairobi",
    "Luxe Nails Parlour",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${TAGLINE}`,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — ${TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${TAGLINE}`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: SITE_URL },
};

// ─── Local business JSON-LD ───────────────────────────────────────────────────

const structuredData = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: SITE_NAME,
  description: DESCRIPTION,
  url: SITE_URL,
  telephone: "+254758550286",
  image: OG_IMAGE,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Thika Road",
    addressLocality: "Juja",
    addressRegion: "Kiambu County",
    addressCountry: "KE",
  },
  geo: { "@type": "GeoCoordinates", latitude: -1.1039, longitude: 37.0144 },
  areaServed: { "@type": "City", name: "Nairobi" },
  priceRange: "KSh 800 – KSh 5000",
  currenciesAccepted: "KES",
  paymentAccepted: "Cash, M-Pesa",
  hasMap: "https://maps.google.com/?q=Juja,Kiambu,Kenya",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Local business structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Brand fonts. ~20 components reference these families by literal
            name in inline styles, so they are loaded as a stylesheet rather
            than via next/font (which generates hashed family names and would
            require rewriting every one of those call sites). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {children}

        {/* Google Analytics 4 — uses Next.js Script for correct loading */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}