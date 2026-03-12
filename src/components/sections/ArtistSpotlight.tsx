"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const artistsData = [
  {
    id: "amara",
    name: "Amara Osei",
    title: "Lead Nail Artist & Founder",
    bio: "With over 8 years of experience, Amara is the creative force behind Luxe Nails Parlour.",
    specialties: ["Bridal Nails", "Nail Art", "Acrylic Extensions"],
    available_mobile: true,
  },
  {
    id: "zuri",
    name: "Zuri Kamau",
    title: "Gel & Enhancement Specialist",
    bio: "Zuri's precision and attention to detail make her the go-to artist for long-lasting gel manicures.",
    specialties: ["Gel Manicure", "Acrylic Tips", "Chrome Finishes"],
    available_mobile: false,
  },
  {
    id: "fatima",
    name: "Fatima Hassan",
    title: "Nail Art & Design Expert",
    bio: "Fatima turns nails into tiny masterpieces — from minimalist florals to bold geometric designs.",
    specialties: ["Custom Nail Art", "3D Embellishments", "Foil Effects"],
    available_mobile: true,
  },
  {
    id: "njeri",
    name: "Njeri Mwangi",
    title: "Pedicure & Wellness Specialist",
    bio: "Njeri believes self-care starts from the ground up.",
    specialties: ["Luxury Pedicure", "Hot Stone Massage", "Paraffin Treatments"],
    available_mobile: false,
  },
  {
    id: "aisha",
    name: "Aisha Wanjiku",
    title: "Classic & Mobile Nail Technician",
    bio: "Aisha is our mobile service champion — bringing the full Luxe Nails experience to your home or office.",
    specialties: ["Classic Manicure", "Mobile Services", "Gel Polish"],
    available_mobile: true,
  },
];

export default function ArtistSpotlight() {
  const [isMobile, setIsMobile] = useState(true);
  const featured = artistsData.slice(0, 3);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section style={{ backgroundColor: "#F5EFE6", padding: isMobile ? "80px 24px" : "112px 48px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "flex-end",
          marginBottom: "64px",
          gap: "32px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "1px", backgroundColor: "#C5A358", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#C5A358" }}>
                The Team
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading), serif", fontSize: "clamp(40px, 5vw, 64px)", color: "#2D2424", lineHeight: 1.1 }}>
              Meet Your Artists
            </h2>
          </div>
          <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "16px", color: "rgba(45,36,36,0.55)", maxWidth: "320px", lineHeight: 1.7 }}>
            Each artist brings a unique touch — find the one whose style speaks to you and book them directly.
          </p>
        </div>

        {/* Artist Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "32px",
        }}>
          {featured.map((artist) => (
            <div key={artist.id} style={{ position: "relative" }}>

              {/* Image placeholder */}
              <div
                style={{
                  position: "relative",
                  backgroundColor: "#E5E0D8",
                  aspectRatio: isMobile ? "4/3" : "3/4",
                  marginBottom: "24px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(197,163,88,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "var(--font-heading), serif", fontSize: "36px", color: "#C5A358" }}>
                    {artist.name.charAt(0)}
                  </span>
                </div>

                {artist.available_mobile && (
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    backgroundColor: "#C5A358",
                    padding: "4px 12px",
                  }}>
                    <span style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "white" }}>
                      Mobile
                    </span>
                  </div>
                )}
              </div>

              <h3 style={{ fontFamily: "var(--font-heading), serif", fontSize: "24px", color: "#2D2424", marginBottom: "4px" }}>
                {artist.name}
              </h3>

              <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#C5A358", marginBottom: "16px" }}>
                {artist.title}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {artist.specialties.slice(0, 2).map((specialty) => (
                  <span
                    key={specialty}
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(45,36,36,0.5)",
                      border: "1px solid rgba(45,36,36,0.2)",
                      padding: "4px 12px",
                    }}
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: "64px", textAlign: "center" }}>
          <Link
            href="/artists"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "13px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              backgroundColor: "#2D2424",
              color: "#FDFBF7",
              padding: "16px 40px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Meet All {artistsData.length} Artists
          </Link>
        </div>

      </div>
    </section>
  );
}