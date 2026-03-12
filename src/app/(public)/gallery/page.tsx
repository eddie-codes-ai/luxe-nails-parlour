"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  image_url: string;
  alt_text: string;
  featured: boolean;
  position: number;
  design_group: string;
}

const placeholders = [
  { id: "p1", category: "Acrylic Nails", title: "Classic French Acrylic", color: "#E8DDD0" },
  { id: "p2", category: "Nail Art", title: "Floral Hand-Painted", color: "#D4C5B8" },
  { id: "p3", category: "Nail Art", title: "Rose Gold Chrome Set", color: "#C9A882" },
  { id: "p4", category: "Gel Nails", title: "Deep Burgundy Gel", color: "#6B3A3A" },
  { id: "p5", category: "Ombre & Gradients", title: "Nude to Blush Ombre", color: "#E2C4B8" },
  { id: "p6", category: "Acrylic Nails", title: "Stiletto Acrylic Set", color: "#F0E6D8" },
  { id: "p7", category: "Nail Art", title: "Minimalist Line Art", color: "#E5E0D8" },
  { id: "p8", category: "French Tips", title: "Silver Mirror Chrome", color: "#C8C8C8" },
  { id: "p9", category: "Gel Nails", title: "Nude Beige Gel", color: "#D9C4A8" },
  { id: "p10", category: "Ombre & Gradients", title: "White to Gold Ombre", color: "#E8D5A0" },
  { id: "p11", category: "Acrylic Nails", title: "Almond Acrylic Nude", color: "#DDBFA0" },
  { id: "p12", category: "Nail Art", title: "Abstract Gold Art", color: "#C5A358" },
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

const CATEGORIES = ["All", "Gel Nails", "Acrylic Nails", "Nail Art", "Pedicure", "Ombre & Gradients", "French Tips"];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      setImages(data.images || []);
      setLoading(false);
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxImage(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightboxImage ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxImage]);

  const filteredReal = activeCategory === "All"
    ? images
    : images.filter(img => img.category === activeCategory);

  const filteredPlaceholders = activeCategory === "All"
    ? placeholders
    : placeholders.filter(p => p.category === activeCategory);

  const placeholdersToShow = filteredPlaceholders.slice(
    Math.min(filteredReal.length, filteredPlaceholders.length)
  );

  // Get related photos — same design_group OR same category if no group
  const relatedImages = lightboxImage
    ? lightboxImage.design_group
      ? images.filter(img => img.design_group === lightboxImage.design_group && img.id !== lightboxImage.id)
      : images.filter(img => img.category === lightboxImage.category && img.id !== lightboxImage.id)
    : [];

  return (
    <main style={{ backgroundColor: colors.cream, fontFamily: fonts.body, color: colors.espresso, minHeight: "100vh" }}>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            backgroundColor: "rgba(20,14,14,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: colors.espresso, borderRadius: "4px",
              maxWidth: "900px", width: "100%",
              maxHeight: "90vh", overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: colors.gold, margin: "0 0 2px" }}>
                  {lightboxImage.category}
                </p>
                <h3 style={{ fontFamily: fonts.heading, fontSize: "22px", color: colors.cream, margin: 0, fontWeight: 400 }}>
                  {lightboxImage.title}
                </h3>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
                  width: "36px", height: "36px", cursor: "pointer", color: colors.cream,
                  fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{
              display: "grid",
              gridTemplateColumns: relatedImages.length > 0 ? "1fr 200px" : "1fr",
              overflow: "hidden", flex: 1,
            }}>
              {/* Main Photo */}
              <div style={{ overflow: "hidden", maxHeight: "70vh" }}>
                <img
                  src={lightboxImage.image_url}
                  alt={lightboxImage.alt_text || lightboxImage.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              {/* Related Photos */}
              {relatedImages.length > 0 && (
                <div style={{
                  borderLeft: "1px solid rgba(255,255,255,0.1)",
                  overflowY: "auto", padding: "12px",
                  display: "flex", flexDirection: "column", gap: "8px",
                }}>
                  <p style={{
                    fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "rgba(253,251,247,0.4)", margin: "0 0 8px", paddingBottom: "8px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    More Photos
                  </p>
                  {relatedImages.map(img => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImage(img)}
                      style={{
                        cursor: "pointer", borderRadius: "2px", overflow: "hidden",
                        aspectRatio: "1 / 1", border: "2px solid transparent", transition: "border 0.2s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.border = `2px solid ${colors.gold}`)}
                      onMouseLeave={e => (e.currentTarget.style.border = "2px solid transparent")}
                    >
                      <img src={img.image_url} alt={img.alt_text || img.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${colors.espresso} 0%, #4a3535 100%)`,
        padding: "120px 24px 80px", textAlign: "center",
      }}>
        <p style={{ color: colors.gold, letterSpacing: "0.25em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>Our Work</p>
        <h1 style={{ fontFamily: fonts.heading, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 300, color: colors.cream, lineHeight: 1.1, margin: "0 0 20px" }}>
          The Gallery
        </h1>
        <p style={{ color: colors.sand, fontSize: "1.05rem", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7, opacity: 0.85 }}>
          A showcase of our artists' finest work. Browse by style and get inspired for your next appointment.
        </p>
      </section>

      {/* Filter Tabs */}
      <section style={{ backgroundColor: "#fff", borderBottom: `1px solid ${colors.sand}`, padding: "0 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "18px 24px", border: "none",
                borderBottom: activeCategory === cat ? `2px solid ${colors.gold}` : "2px solid transparent",
                backgroundColor: "transparent",
                color: activeCategory === cat ? colors.gold : colors.espresso,
                fontFamily: fonts.body, fontSize: "0.78rem",
                fontWeight: activeCategory === cat ? 700 : 400,
                letterSpacing: "0.12em", textTransform: "uppercase",
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.4)" }}>Loading gallery...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>

            {/* Real Photos */}
            {filteredReal.map(image => {
              const isHovered = hoveredItem === image.id;
              return (
                <div
                  key={image.id}
                  onClick={() => setLightboxImage(image)}
                  onMouseEnter={() => setHoveredItem(image.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ position: "relative", overflow: "hidden", cursor: "pointer", aspectRatio: "1 / 1", backgroundColor: colors.sand }}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || image.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease", transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundColor: isHovered ? "rgba(45,36,36,0.85)" : "rgba(45,36,36,0)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "20px", transition: "background-color 0.3s ease",
                  }}>
                    {isHovered && (
                      <>
                        <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: colors.gold, fontWeight: 700, marginBottom: "8px" }}>
                          {image.category}
                        </p>
                        <h3 style={{ fontFamily: fonts.heading, fontSize: "1.4rem", fontWeight: 400, color: colors.cream, textAlign: "center", margin: "0 0 6px" }}>
                          {image.title}
                        </h3>
                        <p style={{ fontSize: "0.75rem", color: colors.sand, opacity: 0.7, marginTop: "12px" }}>Click to view</p>
                      </>
                    )}
                  </div>
                  {image.featured && (
                    <div style={{ position: "absolute", top: "12px", right: "12px", background: colors.gold, color: colors.espresso, fontSize: "10px", padding: "3px 10px", borderRadius: "20px", fontWeight: 700 }}>
                      ⭐ Featured
                    </div>
                  )}
                </div>
              );
            })}

            {/* Placeholders */}
            {placeholdersToShow.map(placeholder => {
              const isHovered = hoveredItem === placeholder.id;
              return (
                <div
                  key={placeholder.id}
                  onMouseEnter={() => setHoveredItem(placeholder.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ position: "relative", overflow: "hidden", aspectRatio: "1 / 1", backgroundColor: placeholder.color }}
                >
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span style={{ fontSize: "2.5rem" }}>💅</span>
                    <p style={{ fontFamily: fonts.heading, fontSize: "1rem", color: colors.espresso, opacity: 0.4, textAlign: "center", padding: "0 16px" }}>
                      Photo Coming Soon
                    </p>
                  </div>
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundColor: isHovered ? "rgba(45,36,36,0.85)" : "rgba(45,36,36,0)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "20px", transition: "background-color 0.3s ease",
                  }}>
                    {isHovered && (
                      <>
                        <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: colors.gold, fontWeight: 700, marginBottom: "8px" }}>
                          {placeholder.category}
                        </p>
                        <h3 style={{ fontFamily: fonts.heading, fontSize: "1.4rem", fontWeight: 400, color: colors.cream, textAlign: "center", margin: 0 }}>
                          {placeholder.title}
                        </h3>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section style={{ backgroundColor: colors.espresso, padding: "80px 24px", textAlign: "center" }}>
        <p style={{ color: colors.gold, letterSpacing: "0.2em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>Love What You See?</p>
        <h2 style={{ fontFamily: fonts.heading, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: colors.cream, margin: "0 0 16px" }}>
          Book Your Look
        </h2>
        <p style={{ color: colors.sand, opacity: 0.8, maxWidth: "420px", margin: "0 auto 36px", lineHeight: 1.7, fontSize: "0.95rem" }}>
          Bring your inspiration and let our artists recreate it — or create something entirely new just for you.
        </p>
        <Link href="/booking" style={{ display: "inline-block", backgroundColor: colors.gold, color: colors.espresso, padding: "14px 40px", fontFamily: fonts.body, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
          Book Now
        </Link>
      </section>
    </main>
  );
}