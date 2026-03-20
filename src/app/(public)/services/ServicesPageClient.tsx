"use client";

import { useState } from "react";
import Link from "next/link";

const services = [
  {
    id: 1,
    name: "Classic Manicure",
    tagline: "Timeless elegance for every occasion",
    basePrice: 800,
    duration: "45 min",
    description:
      "A foundational treatment that keeps your nails clean, shaped, and polished. Includes cuticle care, hand massage, and your choice of regular polish.",
    includes: ["Nail shaping & filing", "Cuticle care", "Hand massage", "Regular polish of your choice"],
    addOns: [
      { name: "Gel Polish Upgrade", price: 400 },
      { name: "Nail Art (per nail)", price: 100 },
      { name: "Paraffin Wax Treatment", price: 300 },
    ],
    tag: "Most Popular",
    tagColor: "#C5A358",
    mobile: true,
  },
  {
    id: 2,
    name: "Luxury Spa Manicure",
    tagline: "Indulge your hands in pure luxury",
    basePrice: 1400,
    duration: "75 min",
    description:
      "An elevated experience with exfoliation, a nourishing mask, and extended massage. Perfect for a treat-yourself moment or special occasions.",
    includes: ["Everything in Classic", "Sugar scrub exfoliation", "Hydrating hand mask", "Extended 15-min massage", "Gel polish included"],
    addOns: [
      { name: "Nail Art (per nail)", price: 100 },
      { name: "Paraffin Wax Treatment", price: 300 },
      { name: "Strengthening Treatment", price: 250 },
    ],
    tag: "Signature",
    tagColor: "#2D2424",
    mobile: true,
  },
  {
    id: 3,
    name: "Acrylic Full Set",
    tagline: "Long-lasting length and strength",
    basePrice: 2500,
    duration: "90 min",
    description:
      "Full acrylic extensions sculpted to your desired length and shape. Durable, beautiful, and customisable with any nail art or finish.",
    includes: ["Nail prep & priming", "Full acrylic sculpt", "Shape & length of choice", "Gel polish finish", "Cuticle care"],
    addOns: [
      { name: "Ombre / Gradient", price: 500 },
      { name: "3D Nail Art", price: 300 },
      { name: "Chrome / Mirror Powder", price: 400 },
      { name: "Nail Art (per nail)", price: 150 },
    ],
    tag: "Extensions",
    tagColor: "#C5A358",
    mobile: false,
  },
  {
    id: 4,
    name: "Acrylic Infill",
    tagline: "Maintain your perfect set",
    basePrice: 1500,
    duration: "60 min",
    description:
      "Keep your acrylic set looking fresh. We fill in the regrowth area and refresh the colour or nail art to maintain that just-done look.",
    includes: ["Regrowth fill", "Shape refinement", "Surface buff & prep", "Fresh gel polish finish"],
    addOns: [
      { name: "Nail Art (per nail)", price: 150 },
      { name: "Chrome / Mirror Powder", price: 400 },
      { name: "Repair (per nail)", price: 200 },
    ],
    tag: null,
    tagColor: null,
    mobile: false,
  },
  {
    id: 5,
    name: "Gel Polish",
    tagline: "Chip-free colour that lasts 2–3 weeks",
    basePrice: 1200,
    duration: "50 min",
    description:
      "Long-wearing gel colour applied over your natural nails. No chips, no smudges — just glossy, perfect nails for up to three weeks.",
    includes: ["Nail prep & dehydration", "Base coat", "2 colour coats", "Top coat & cure", "Cuticle care"],
    addOns: [
      { name: "Nail Art (per nail)", price: 100 },
      { name: "Chrome / Mirror Powder", price: 400 },
      { name: "Ombre / Gradient", price: 400 },
    ],
    tag: "Quick Glam",
    tagColor: "#C5A358",
    mobile: true,
  },
  {
    id: 6,
    name: "Nail Art Session",
    tagline: "Wearable art, crafted just for you",
    basePrice: 1500,
    duration: "60–90 min",
    description:
      "A dedicated session for custom nail art — from minimalist designs to elaborate hand-painted masterpieces. Bring your inspo or let our artists create something unique.",
    includes: ["Design consultation", "Base & top coat", "Custom hand-painted art", "Gel finish for longevity"],
    addOns: [
      { name: "3D Embellishments", price: 500 },
      { name: "Foil / Chrome Details", price: 300 },
      { name: "Extra complexity (artist's discretion)", price: 500 },
    ],
    tag: "Creative",
    tagColor: "#2D2424",
    mobile: true,
  },
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

export default function ServicesPage() {
  const [openService, setOpenService] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const toggle = (id: number) => setOpenService(openService === id ? null : id);

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
        <p style={{ fontFamily: fonts.body, color: colors.gold, letterSpacing: "0.25em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>
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
            transition: "opacity 0.2s",
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

      {/* ── Services Grid ── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "32px",
          }}
        >
          {services.map((service) => {
            const isOpen = openService === service.id;
            const isHovered = hoveredCard === service.id;

            return (
              <article
                key={service.id}
                onMouseEnter={() => setHoveredCard(service.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: "#fff",
                  border: isHovered ? `2px solid ${colors.gold}` : "2px solid transparent",
                  boxShadow: isHovered ? "0 12px 40px rgba(197,163,88,0.15)" : "0 4px 20px rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Tag */}
                {service.tag && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: service.tagColor!,
                      color: service.tagColor === colors.espresso ? colors.cream : colors.espresso,
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

                {/* Card Header */}
                <div style={{ padding: "32px 28px 20px" }}>
                  <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: colors.gold, marginBottom: "8px", fontWeight: 600 }}>
                    {service.duration} {service.mobile && "· 🚗 Mobile Available"}
                  </p>
                  <h2
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: "1.8rem",
                      fontWeight: 400,
                      margin: "0 0 6px",
                      color: colors.espresso,
                    }}
                  >
                    {service.name}
                  </h2>
                  <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: "0 0 20px", fontStyle: "italic" }}>{service.tagline}</p>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.7, opacity: 0.8, margin: "0 0 20px" }}>{service.description}</p>

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
                      {service.basePrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "0.75rem", opacity: 0.55 }}>KES</span>
                  </div>

                  {/* Toggle Button */}
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
                </div>

                {/* Expandable Details */}
                {isOpen && (
                  <div
                    style={{
                      borderTop: `1px solid ${colors.sand}`,
                      padding: "24px 28px 28px",
                      backgroundColor: "#faf9f6",
                    }}
                  >
                    {/* Includes */}
                    <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: colors.gold, fontWeight: 700, marginBottom: "10px" }}>
                      What's Included
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                      {service.includes.map((item, i) => (
                        <li key={i} style={{ fontSize: "0.88rem", padding: "5px 0", borderBottom: `1px solid ${colors.sand}`, display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ color: colors.gold, fontWeight: 700 }}>✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Add-ons */}
                    <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: colors.espresso, fontWeight: 700, marginBottom: "10px" }}>
                      Optional Add-ons
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                      {service.addOns.map((addon, i) => (
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
                          <span style={{ fontWeight: 600, color: colors.gold }}>+ {addon.price.toLocaleString()} KES</span>
                        </li>
                      ))}
                    </ul>

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
      </section>

      {/* ── Bottom CTA Banner ── */}
      <section
        style={{
          backgroundColor: colors.espresso,
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
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