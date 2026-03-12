"use client";

import { useState, useEffect } from "react";

const reasons = [
  {
    icon: "✦",
    title: "Certified & Experienced",
    description: "All our artists are professionally trained and certified, with a minimum of 3 years of hands-on experience.",
  },
  {
    icon: "⌂",
    title: "Mobile Service, Nairobi-Wide",
    description: "Can't come to us? We come to you. Our mobile artists bring the full Luxe Nails experience to your home or office.",
  },
  {
    icon: "◈",
    title: "Easy M-Pesa Payments",
    description: "Pay conveniently via M-Pesa — no cash hassle. Fast, secure and familiar to every Kenyan client.",
  },
  {
    icon: "♡",
    title: "Hygiene First, Always",
    description: "We use single-use tools and hospital-grade sterilisation for all reusable equipment. Your safety is non-negotiable.",
  },
  {
    icon: "❋",
    title: "Premium Products Only",
    description: "We stock only top-tier, cruelty-free nail products — from OPI to CND and Gelish — for lasting, beautiful results.",
  },
  {
    icon: "◷",
    title: "Flexible Booking",
    description: "Book online 24/7 and choose your preferred artist. We also accommodate walk-ins based on availability.",
  },
];

export default function WhyUs() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const columns = isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)";

  return (
    <section style={{ backgroundColor: "#2D2424", padding: isMobile ? "80px 24px" : "112px 48px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{ width: "48px", height: "1px", backgroundColor: "#C5A358" }} />
            <span style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#C5A358" }}>
              The Luxe Difference
            </span>
            <div style={{ width: "48px", height: "1px", backgroundColor: "#C5A358" }} />
          </div>
          <h2 style={{ fontFamily: "var(--font-heading), serif", fontSize: "clamp(40px, 5vw, 64px)", color: "#FDFBF7" }}>
            Why Choose Us
          </h2>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: columns,
          gap: "1px",
          backgroundColor: "rgba(253,251,247,0.1)",
        }}>
          {reasons.map((reason, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#2D2424",
                padding: isMobile ? "32px 24px" : "40px",
                transition: "background-color 0.4s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(197,163,88,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2D2424")}
            >
              <div style={{ fontSize: "24px", color: "#C5A358", marginBottom: "24px" }}>
                {reason.icon}
              </div>
              <h3 style={{ fontFamily: "var(--font-heading), serif", fontSize: "24px", color: "#FDFBF7", marginBottom: "16px" }}>
                {reason.title}
              </h3>
              <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "14px", color: "rgba(253,251,247,0.5)", lineHeight: 1.7 }}>
                {reason.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}