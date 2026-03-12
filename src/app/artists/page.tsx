"use client";

import { useState } from "react";
import Link from "next/link";

const artists = [
  {
    id: 1,
    name: "Amara Wanjiku",
    role: "Lead Nail Artist & Founder",
    experience: "8 years",
    specialty: "Acrylic Sculpting & 3D Nail Art",
    bio: "Amara founded LuxeNails Parlour with a vision to bring world-class nail artistry to Nairobi. Trained in Nairobi and London, she specialises in intricate acrylic sculpting and bespoke nail art that tells a story.",
    skills: ["Acrylic Full Sets", "3D Nail Art", "Nail Design Consultation", "Gel Polish"],
    mobile: true,
    initial: "AW",
    accentColor: "#C5A358",
  },
  {
    id: 2,
    name: "Brenda Achieng",
    role: "Senior Nail Technician",
    experience: "5 years",
    specialty: "Gel Polish & Nail Art",
    bio: "Brenda is known for her steady hand and eye for detail. She brings a calm, attentive approach to every client and is beloved for her flawless gel sets and creative minimalist nail art.",
    skills: ["Gel Polish", "Nail Art", "Classic Manicure", "Nail Repairs"],
    mobile: true,
    initial: "BA",
    accentColor: "#2D2424",
  },
  {
    id: 3,
    name: "Cynthia Muthoni",
    role: "Nail Technician",
    experience: "3 years",
    specialty: "Spa Treatments & Nail Care",
    bio: "Cynthia is passionate about nail health and the full spa experience. Clients leave her chair feeling completely pampered. She specialises in luxury spa manicures and therapeutic hand treatments.",
    skills: ["Luxury Spa Manicure", "Classic Manicure", "Paraffin Wax", "Cuticle Care"],
    mobile: false,
    initial: "CM",
    accentColor: "#C5A358",
  },
  {
    id: 4,
    name: "Diana Njeri",
    role: "Nail Artist",
    experience: "4 years",
    specialty: "Chrome, Ombre & Creative Finishes",
    bio: "Diana pushes the boundaries of nail art. If you want chrome, ombre gradients, or something totally unique, Diana is your artist. Her work has been featured on several Nairobi lifestyle pages.",
    skills: ["Chrome & Mirror Powder", "Ombre / Gradient", "Gel Polish", "Nail Art"],
    mobile: true,
    initial: "DN",
    accentColor: "#2D2424",
  },
  {
    id: 5,
    name: "Esther Kamau",
    role: "Junior Nail Technician",
    experience: "2 years",
    specialty: "Classic Manicures & Nail Care",
    bio: "Esther is the newest member of the LuxeNails family, bringing fresh energy and a meticulous approach to classic nail care. She is quickly building a loyal clientele who love her warm personality.",
    skills: ["Classic Manicure", "Gel Polish", "Nail Shaping", "Cuticle Care"],
    mobile: false,
    initial: "EK",
    accentColor: "#C5A358",
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

export default function ArtistsPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

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
          The Team
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
          Meet Your Artists
        </h1>
        <p style={{ color: colors.sand, fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7, opacity: 0.85 }}>
          Every artist at LuxeNails brings skill, passion, and a personal touch. Get to know the hands behind your perfect nails.
        </p>
      </section>

      {/* ── Artists List ── */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {artists.map((artist, index) => {
            const isHovered = hoveredCard === artist.id;
            const isEven = index % 2 === 0;

            return (
              <article
                key={artist.id}
                onMouseEnter={() => setHoveredCard(artist.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: "0",
                  backgroundColor: "#fff",
                  border: isHovered ? `2px solid ${colors.gold}` : "2px solid transparent",
                  boxShadow: isHovered ? "0 12px 40px rgba(197,163,88,0.12)" : "0 4px 20px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                }}
              >
                {/* Left — Avatar Panel */}
                <div
                  style={{
                    backgroundColor: artist.accentColor,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 20px",
                    gap: "16px",
                  }}
                >
                  {/* Initials Circle */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      border: "2px solid rgba(255,255,255,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: fonts.heading,
                      fontSize: "1.6rem",
                      fontWeight: 400,
                      color: artist.accentColor === colors.espresso ? colors.cream : colors.espresso,
                    }}
                  >
                    {artist.initial}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: artist.accentColor === colors.espresso ? colors.gold : colors.espresso,
                        marginBottom: "4px",
                      }}
                    >
                      {artist.experience}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: artist.accentColor === colors.espresso ? colors.sand : "rgba(45,36,36,0.7)",
                        textAlign: "center",
                        lineHeight: 1.4,
                      }}
                    >
                      Experience
                    </p>
                  </div>

                  {artist.mobile && (
                    <div
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        padding: "4px 10px",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: artist.accentColor === colors.espresso ? colors.cream : colors.espresso,
                      }}
                    >
                      🚗 Mobile
                    </div>
                  )}
                </div>

                {/* Right — Info Panel */}
                <div style={{ padding: "32px 32px" }}>
                  <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: colors.gold, fontWeight: 600, marginBottom: "6px" }}>
                    {artist.role}
                  </p>
                  <h2
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: "2rem",
                      fontWeight: 400,
                      margin: "0 0 4px",
                      color: colors.espresso,
                    }}
                  >
                    {artist.name}
                  </h2>
                  <p style={{ fontSize: "0.8rem", color: colors.gold, fontStyle: "italic", marginBottom: "16px" }}>
                    Specialises in {artist.specialty}
                  </p>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.75, opacity: 0.75, marginBottom: "20px" }}>
                    {artist.bio}
                  </p>

                  {/* Skills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                    {artist.skills.map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          padding: "4px 12px",
                          border: `1px solid ${colors.sand}`,
                          color: colors.espresso,
                          opacity: 0.75,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Book CTA */}
                  <Link
                    href={`/booking?artist=${encodeURIComponent(artist.name)}`}
                    onMouseEnter={() => setHoveredBtn(`book-${artist.id}`)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      display: "inline-block",
                      backgroundColor: hoveredBtn === `book-${artist.id}` ? colors.espresso : colors.gold,
                      color: hoveredBtn === `book-${artist.id}` ? colors.cream : colors.espresso,
                      padding: "11px 28px",
                      fontFamily: fonts.body,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    Book with {artist.name.split(" ")[0]}
                  </Link>
                </div>
              </article>
            );
          })}
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
          Ready?
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
          Book Your Appointment
        </h2>
        <p style={{ color: colors.sand, opacity: 0.8, maxWidth: "440px", margin: "0 auto 36px", lineHeight: 1.7, fontSize: "0.95rem" }}>
          Choose your favourite artist or let us match you with the best fit for your treatment.
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