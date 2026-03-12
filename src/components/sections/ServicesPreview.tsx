"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const servicesData = [
  {
    id: "classic-manicure",
    name: "Classic Manicure",
    tagline: "Timeless elegance for every occasion",
    basePrice: 800,
    duration: 45,
    category: "Manicure",
    available_mobile: true,
  },
  {
    id: "gel-manicure",
    name: "Gel Manicure",
    tagline: "Long-lasting brilliance, up to 3 weeks",
    basePrice: 1200,
    duration: 60,
    category: "Manicure",
    available_mobile: true,
  },
  {
    id: "acrylic-tips",
    name: "Acrylic Tips",
    tagline: "Bold length, flawless finish",
    basePrice: 1500,
    duration: 90,
    category: "Enhancements",
    available_mobile: false,
  },
  {
    id: "pedicure",
    name: "Luxury Pedicure",
    tagline: "Restore, relax and refresh",
    basePrice: 1000,
    duration: 60,
    category: "Pedicure",
    available_mobile: false,
  },
  {
    id: "nail-art",
    name: "Nail Art & Design",
    tagline: "Your nails, your canvas",
    basePrice: 1500,
    duration: 75,
    category: "Art",
    available_mobile: true,
  },
  {
    id: "bridal-package",
    name: "Bridal Package",
    tagline: "Look perfect on your perfect day",
    basePrice: 4500,
    duration: 180,
    category: "Packages",
    available_mobile: true,
  },
];

export default function ServicesPreview() {
  const [isMobile, setIsMobile] = useState(false);
  const featured = servicesData.slice(0, 3);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section style={{ backgroundColor: "#FDFBF7", padding: isMobile ? "80px 24px" : "112px 48px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Section Header */}
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
                What We Offer
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading), serif", fontSize: "clamp(40px, 5vw, 64px)", color: "#2D2424", lineHeight: 1.1 }}>
              Our Services
            </h2>
          </div>
          <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "16px", color: "rgba(45,36,36,0.55)", maxWidth: "320px", lineHeight: 1.7 }}>
            Every service is a carefully crafted experience — from the moment you arrive to the moment you leave.
          </p>
        </div>

        {/* Service Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          border: "1px solid #E5E0D8",
        }}>
          {featured.map((service, index) => (
            <div
              key={service.id}
              style={{
                position: "relative",
                padding: isMobile ? "32px 24px" : "40px",
                borderRight: !isMobile && index < 2 ? "1px solid #E5E0D8" : "none",
                borderBottom: isMobile && index < 2 ? "1px solid #E5E0D8" : "none",
                transition: "background-color 0.4s ease",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2D2424")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span style={{
                fontFamily: "var(--font-heading), serif",
                fontSize: "64px",
                color: "#E5E0D8",
                position: "absolute",
                top: "32px",
                right: "24px",
                lineHeight: 1,
                userSelect: "none",
              }}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <span style={{
                display: "inline-block",
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "10px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#C5A358",
                border: "1px solid rgba(197,163,88,0.4)",
                padding: "4px 12px",
                marginBottom: "24px",
              }}>
                {service.category}
              </span>

              <h3 style={{ fontFamily: "var(--font-heading), serif", fontSize: "28px", color: "#2D2424", marginBottom: "12px" }}>
                {service.name}
              </h3>

              <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "14px", color: "rgba(45,36,36,0.55)", lineHeight: 1.6, marginBottom: "32px" }}>
                {service.tagline}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C5A358", marginBottom: "4px" }}>
                    From
                  </p>
                  <p style={{ fontFamily: "var(--font-heading), serif", fontSize: "24px", color: "#2D2424" }}>
                    KES {service.basePrice.toLocaleString()}
                  </p>
                </div>
                <span style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "12px", color: "rgba(45,36,36,0.4)" }}>
                  ~{service.duration} min
                </span>
              </div>

              {service.available_mobile && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#C5A358" }} />
                  <span style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C5A358" }}>
                    Mobile available
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View all link */}
        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <Link href="/services" style={{
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "13px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#2D2424",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "16px",
          }}>
            View All {servicesData.length} Services
            <div style={{ width: "48px", height: "1px", backgroundColor: "#2D2424" }} />
          </Link>
        </div>

      </div>
    </section>
  );
}