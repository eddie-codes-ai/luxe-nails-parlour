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
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/gallery");
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

  // Tabs are derived from the photos we actually have, so a category can
  // never advertise work that does not exist. Uploading a photo in a new
  // category makes its tab appear on its own.
  const CATEGORIES = [
    "All",
    ...Array.from(new Set(images.map(img => img.category).filter(Boolean))).sort(),
  ];

  const filteredReal = activeCategory === "All"
    ? images
    : images.filter(img => img.category === activeCategory);

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
        ) : filteredReal.length === 0 ? (
          /* An honest empty state. The grid used to be padded with invented
             work ("Rose Gold Chrome Set" and friends) that the salon had never
             done - better to show nothing than to imply a portfolio. */
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <span style={{ fontSize: "2.5rem", opacity: 0.35 }}>💅</span>
            <p style={{ fontFamily: fonts.heading, fontSize: "1.5rem", fontWeight: 300, margin: "16px 0 8px" }}>
              No photos here yet
            </p>
            <p style={{ fontSize: "0.9rem", opacity: 0.55, maxWidth: "380px", margin: "0 auto 28px", lineHeight: 1.7 }}>
              We haven&apos;t added photos to this category yet. Ask us about it when you
              book &mdash; we&apos;d love to create something for you.
            </p>
            <Link href="/booking" style={{ display: "inline-block", backgroundColor: colors.gold, color: colors.espresso, padding: "13px 34px", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
              Book an Appointment
            </Link>
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