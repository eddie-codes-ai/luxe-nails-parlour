"use client";

import { useState } from "react";
import Link from "next/link";

const categories = ["All", "Acrylic", "Gel Polish", "Nail Art", "Ombre", "Chrome"];

const galleryItems = [
  { id: 1, category: "Acrylic", title: "Classic French Acrylic", artist: "Amara Wanjiku", color: "#E8DDD0" },
  { id: 2, category: "Nail Art", title: "Floral Hand-Painted", artist: "Diana Njeri", color: "#D4C5B8" },
  { id: 3, category: "Chrome", title: "Rose Gold Chrome Set", artist: "Diana Njeri", color: "#C9A882" },
  { id: 4, category: "Gel Polish", title: "Deep Burgundy Gel", artist: "Brenda Achieng", color: "#6B3A3A" },
  { id: 5, category: "Ombre", title: "Nude to Blush Ombre", artist: "Amara Wanjiku", color: "#E2C4B8" },
  { id: 6, category: "Acrylic", title: "Stiletto Acrylic Set", artist: "Amara Wanjiku", color: "#F0E6D8" },
  { id: 7, category: "Nail Art", title: "Minimalist Line Art", artist: "Brenda Achieng", color: "#E5E0D8" },
  { id: 8, category: "Chrome", title: "Silver Mirror Chrome", artist: "Diana Njeri", color: "#C8C8C8" },
  { id: 9, category: "Gel Polish", title: "Nude Beige Gel", artist: "Cynthia Muthoni", color: "#D9C4A8" },
  { id: 10, category: "Ombre", title: "White to Gold Ombre", artist: "Diana Njeri", color: "#E8D5A0" },
  { id: 11, category: "Acrylic", title: "Almond Acrylic Nude", artist: "Amara Wanjiku", color: "#DDBFA0" },
  { id: 12, category: "Nail Art", title: "Abstract Gold Art", artist: "Diana Njeri", color: "#C5A358" },
];

const fonts = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'Jost', 'Helvetica Neue', sans-serif",
};

const colors = {
  cream: "#FDFBF7",
  espresso: "#2D2424",
  gold: "#C5A358",
  sand: "#E5E0D8",
};

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const filtered = activeCategory === "All"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <main style={{ backgroundColor: colors.cream, fontFamily: fonts.body, color: colors.espresso, minHeight: "100vh" }}>

      {/* ── Hero Banner ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${colors.espresso} 0%, #4a3535 100%)`,
          padding: "120px 24px 80px",
          textAlign: "center",
        }}
      >
        <p style={{ color: colors.gold, letterSpacing: "0.25em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>
          Our Work
        </p>
        <h1
          style={{
            fontFamily: fonts.heading,
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 300,
            color: colors.cream,
            lineHeight: 1.1,
            margin: "0 0 20px",
          }}
        >
          The Gallery
        </h1>
        <p style={{ color: colors.sand, fontSize: "1.05rem", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7, opacity: 0.85 }}>
          A showcase of our artists' finest work. Browse by style and get inspired for your next appointment.
        </p>
      </section>

      {/* ── Filter Tabs ── */}
      <section style={{ backgroundColor: "#fff", borderBottom: `1px solid ${colors.sand}`, padding: "0 24px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            gap: "0",
            overflowX: "auto",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "18px 24px",
                border: "none",
                borderBottom: activeCategory === cat ? `2px solid ${colors.gold}` : "2px solid transparent",
                backgroundColor: "transparent",
                color: activeCategory === cat ? colors.gold : colors.espresso,
                fontFamily: fonts.body,
                fontSize: "0.78rem",
                fontWeight: activeCategory === cat ? 700 : 400,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Gallery Grid ── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {filtered.map((item) => {
            const isHovered = hoveredItem === item.id;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  aspectRatio: "1 / 1",
                  backgroundColor: item.color,
                }}
              >
                {/* Placeholder visual — replace with <Image> when real photos are ready */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "2.5rem" }}>💅</span>
                  <p
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: "1rem",
                      color: colors.espresso,
                      opacity: 0.4,
                      textAlign: "center",
                      padding: "0 16px",
                    }}
                  >
                    Photo Coming Soon
                  </p>
                </div>

                {/* Hover Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: isHovered ? "rgba(45,36,36,0.85)" : "rgba(45,36,36,0)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  {isHovered && (
                    <>
                      <p
                        style={{
                          fontSize: "0.65rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: colors.gold,
                          fontWeight: 700,
                          marginBottom: "8px",
                        }}
                      >
                        {item.category}
                      </p>
                      <h3
                        style={{
                          fontFamily: fonts.heading,
                          fontSize: "1.4rem",
                          fontWeight: 400,
                          color: colors.cream,
                          textAlign: "center",
                          margin: "0 0 6px",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p style={{ fontSize: "0.78rem", color: colors.sand, opacity: 0.8 }}>
                        by {item.artist}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Photo upload note */}
        <div
          style={{
            marginTop: "48px",
            padding: "24px",
            border: `1px dashed ${colors.sand}`,
            textAlign: "center",
            backgroundColor: "#fff",
          }}
        >
          <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: 0 }}>
            📸 Real photos will replace placeholders once uploaded. The grid and hover effects are fully ready.
          </p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        style={{
          backgroundColor: colors.espresso,
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: colors.gold, letterSpacing: "0.2em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>
          Love What You See?
        </p>
        <h2
          style={{
            fontFamily: fonts.heading,
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 300,
            color: colors.cream,
            margin: "0 0 16px",
          }}
        >
          Book Your Look
        </h2>
        <p style={{ color: colors.sand, opacity: 0.8, maxWidth: "420px", margin: "0 auto 36px", lineHeight: 1.7, fontSize: "0.95rem" }}>
          Bring your inspiration and let our artists recreate it — or create something entirely new just for you.
        </p>
        <Link
          href="/booking"
          style={{
            display: "inline-block",
            backgroundColor: colors.gold,
            color: colors.espresso,
            padding: "14px 40px",
            fontFamily: fonts.body,
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Book Now
        </Link>
      </section>

    </main>
  );
}