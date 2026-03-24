"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AddOn {
  name: string;
  price: number;
}

interface Service {
  id: string;
  name: string;
  tagline: string;
  tag: string | null;
  tag_color: string | null;
  description: string;
  base_price: number;
  duration_minutes: number;
  category: string;
  house_call_available: boolean;
  includes: string[];
  add_ons: AddOn[];
}

interface Props {
  services: Service[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function groupByCategory(services: Service[]): Record<string, Service[]> {
  return services.reduce((acc, s) => {
    const key = s.category || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, Service[]>);
}

// ── Tokens ────────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function ServicesPageClient({ services }: Props) {
  const [openService, setOpenService] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredBtn,  setHoveredBtn]  = useState<string | null>(null);

  const toggle = (id: string) => setOpenService(openService === id ? null : id);

  const grouped    = groupByCategory(services);
  const categories = Object.keys(grouped);

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
          What We Offer
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
          Our Services
        </h1>
        <p style={{ color: colors.sand, fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.7, opacity: 0.85 }}>
          Every treatment is crafted with precision, care, and a touch of luxury. Choose your experience below.
        </p>
        <Link
          href="/booking"
          style={{
            display: "inline-block",
            backgroundColor: colors.gold,
            color: colors.espresso,
            padding: "14px 36px",
            fontFamily: fonts.body,
            fontSize: "0.85rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Book an Appointment
        </Link>
      </section>

      {/* ── Pricing Note ── */}
      <section style={{ backgroundColor: colors.sand, padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "0.85rem", opacity: 0.75, margin: 0 }}>
          All prices in <strong>KES</strong> · M-Pesa accepted · Mobile service available for select treatments 📍
        </p>
      </section>

      {/* ── Services by Category ── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>

        {services.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.5, fontSize: "1rem" }}>
            Services coming soon — check back shortly!
          </p>
        ) : (
          categories.map((category) => (
            <div key={category} style={{ marginBottom: "72px" }}>

              {/* Category heading */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "36px" }}>
                <h2
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    fontWeight: 300,
                    color: colors.espresso,
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {category}
                </h2>
                <div style={{ flex: 1, height: "1px", backgroundColor: colors.sand }} />
              </div>

              {/* Cards grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "32px",
                }}
              >
                {grouped[category].map((service) => {
                  const isOpen    = openService === service.id;
                  const isHovered = hoveredCard === service.id;
                  const hasDetails =
                    (Array.isArray(service.includes) && service.includes.length > 0) ||
                    (Array.isArray(service.add_ons)  && service.add_ons.length  > 0);

                  // Tag text colour — light text on dark bg, dark text on light bg
                  const tagTextColor =
                    service.tag_color === colors.espresso ? colors.cream : colors.espresso;

                  return (
                    <article
                      key={service.id}
                      onMouseEnter={() => setHoveredCard(service.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        backgroundColor: "#fff",
                        border: isHovered ? `2px solid ${colors.gold}` : "2px solid transparent",
                        boxShadow: isHovered
                          ? "0 12px 40px rgba(197,163,88,0.15)"
                          : "0 4px 20px rgba(0,0,0,0.06)",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* ── Tag badge (e.g. "Most Popular") ── */}
                      {service.tag && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            backgroundColor: service.tag_color || colors.gold,
                            color: tagTextColor,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            padding: "6px 14px",
                          }}
                        >
                          {service.tag}
                        </div>
                      )}

                      {/* ── Card Header ── */}
                      <div style={{ padding: "32px 28px 20px" }}>

                        {/* Duration + mobile badge */}
                        <p style={{
                          fontSize: "0.7rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: colors.gold,
                          marginBottom: "8px",
                          fontWeight: 600,
                        }}>
                          {formatDuration(service.duration_minutes)}
                          {service.house_call_available && " · 🚗 Mobile Available"}
                        </p>

                        {/* Name */}
                        <h3
                          style={{
                            fontFamily: fonts.heading,
                            fontSize: "1.8rem",
                            fontWeight: 400,
                            margin: "0 0 6px",
                            color: colors.espresso,
                          }}
                        >
                          {service.name}
                        </h3>

                        {/* Tagline */}
                        {service.tagline && (
                          <p style={{
                            fontSize: "0.85rem",
                            opacity: 0.6,
                            margin: "0 0 20px",
                            fontStyle: "italic",
                          }}>
                            {service.tagline}
                          </p>
                        )}

                        {/* Description */}
                        {service.description && (
                          <p style={{ fontSize: "0.92rem", lineHeight: 1.7, opacity: 0.8, margin: "0 0 20px" }}>
                            {service.description}
                          </p>
                        )}

                        {/* Price */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "24px" }}>
                          <span style={{ fontSize: "0.75rem", color: colors.gold, fontWeight: 600 }}>FROM</span>
                          <span
                            style={{
                              fontFamily: fonts.heading,
                              fontSize: "2.4rem",
                              fontWeight: 300,
                              color: colors.espresso,
                              lineHeight: 1,
                            }}
                          >
                            {Number(service.base_price).toLocaleString()}
                          </span>
                          <span style={{ fontSize: "0.75rem", opacity: 0.55 }}>KES</span>
                        </div>

                        {/* Toggle button — only shown when includes or add-ons exist */}
                        {hasDetails && (
                          <button
                            onClick={() => toggle(service.id)}
                            style={{
                              width: "100%",
                              padding: "12px",
                              border: `1px solid ${colors.gold}`,
                              backgroundColor: isOpen ? colors.gold : "transparent",
                              color: isOpen ? colors.espresso : colors.gold,
                              fontFamily: fonts.body,
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              transition: "all 0.25s ease",
                            }}
                          >
                            {isOpen ? "Hide Details ↑" : "View Details ↓"}
                          </button>
                        )}
                      </div>

                      {/* ── Expandable Details ── */}
                      {isOpen && (
                        <div
                          style={{
                            borderTop: `1px solid ${colors.sand}`,
                            padding: "24px 28px 28px",
                            backgroundColor: "#faf9f6",
                          }}
                        >
                          {/* What's Included */}
                          {Array.isArray(service.includes) && service.includes.length > 0 && (
                            <>
                              <p style={{
                                fontSize: "0.7rem",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: colors.gold,
                                fontWeight: 700,
                                marginBottom: "10px",
                              }}>
                                What's Included
                              </p>
                              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                                {service.includes.map((item, i) => (
                                  <li
                                    key={i}
                                    style={{
                                      fontSize: "0.88rem",
                                      padding: "5px 0",
                                      borderBottom: `1px solid ${colors.sand}`,
                                      display: "flex",
                                      gap: "10px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span style={{ color: colors.gold, fontWeight: 700 }}>✓</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}

                          {/* Optional Add-ons */}
                          {Array.isArray(service.add_ons) && service.add_ons.length > 0 && (
                            <>
                              <p style={{
                                fontSize: "0.7rem",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: colors.espresso,
                                fontWeight: 700,
                                marginBottom: "10px",
                              }}>
                                Optional Add-ons
                              </p>
                              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                                {service.add_ons.map((addon, i) => (
                                  <li
                                    key={i}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "0.85rem",
                                      padding: "6px 0",
                                      borderBottom: `1px solid ${colors.sand}`,
                                      opacity: 0.8,
                                    }}
                                  >
                                    <span>{addon.name}</span>
                                    <span style={{ fontWeight: 600, color: colors.gold }}>
                                      + {Number(addon.price).toLocaleString()} KES
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}

                          {/* Book CTA */}
                          <Link
                            href={`/booking?service=${encodeURIComponent(service.name)}`}
                            onMouseEnter={() => setHoveredBtn(`book-${service.id}`)}
                            onMouseLeave={() => setHoveredBtn(null)}
                            style={{
                              display: "block",
                              textAlign: "center",
                              backgroundColor: hoveredBtn === `book-${service.id}` ? colors.espresso : colors.gold,
                              color: hoveredBtn === `book-${service.id}` ? colors.cream : colors.espresso,
                              padding: "13px",
                              fontFamily: fonts.body,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              textDecoration: "none",
                              transition: "all 0.25s ease",
                            }}
                          >
                            Book {service.name}
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* ── Bottom CTA Banner ── */}
      <section style={{ backgroundColor: colors.espresso, padding: "80px 24px", textAlign: "center" }}>
        <p style={{ color: colors.gold, letterSpacing: "0.2em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>
          Not Sure What to Choose?
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
          Let Us Help You Decide
        </h2>
        <p style={{ color: colors.sand, opacity: 0.8, maxWidth: "480px", margin: "0 auto 36px", lineHeight: 1.7, fontSize: "0.95rem" }}>
          Send us a message or call us — our team is happy to recommend the perfect treatment for your needs and budget.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/contact"
            style={{
              display: "inline-block",
              backgroundColor: colors.gold,
              color: colors.espresso,
              padding: "14px 36px",
              fontFamily: fonts.body,
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Contact Us
          </Link>
          <Link
            href="/booking"
            style={{
              display: "inline-block",
              border: `1px solid ${colors.sand}`,
              color: colors.sand,
              padding: "14px 36px",
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
        </div>
      </section>

    </main>
  );
}