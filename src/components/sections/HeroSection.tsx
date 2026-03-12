"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fadeIn = {
    transition: "opacity 0.7s ease, transform 0.7s ease",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #FDFBF7 0%, #F5EFE6 50%, #E8DDD0 100%)",
      }}
    >
      {/* Gold glow */}
      <div style={{
        position: "absolute",
        top: "25%",
        right: "25%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "rgba(197,163,88,0.12)",
        filter: "blur(80px)",
        pointerEvents: "none",
      }} />

      {/* Rose glow */}
      <div style={{
        position: "absolute",
        bottom: "30%",
        left: "30%",
        width: "280px",
        height: "280px",
        borderRadius: "50%",
        background: "rgba(212,160,154,0.15)",
        filter: "blur(80px)",
        pointerEvents: "none",
      }} />

      {/* Main content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1280px",
        margin: "0 auto",
        padding: isMobile ? "100px 24px 120px" : "128px 48px 80px",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <div style={{ maxWidth: "720px" }}>

          {/* Eyebrow */}
          <div style={{ ...fadeIn, transitionDelay: "100ms", display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
            <div style={{ width: "48px", height: "1px", backgroundColor: "#C5A358", flexShrink: 0 }} />
            <span style={{
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "11px",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#C5A358",
            }}>
              Nairobi's Premier Nail Studio
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            ...fadeIn,
            transitionDelay: "200ms",
            fontFamily: "var(--font-heading), serif",
            fontSize: isMobile ? "clamp(40px, 12vw, 64px)" : "clamp(56px, 8vw, 96px)",
            color: "#2D2424",
            lineHeight: 1,
            marginBottom: "24px",
          }}>
            Where Art Meets
            <br />
            <span style={{ color: "#C5A358", fontStyle: "italic" }}>Your Nails</span>
          </h1>

          {/* Subtext */}
          <p style={{
            ...fadeIn,
            transitionDelay: "350ms",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: isMobile ? "16px" : "18px",
            color: "rgba(45,36,36,0.6)",
            lineHeight: 1.7,
            maxWidth: "540px",
            marginBottom: "48px",
          }}>
            From classic elegance to bold custom art — every set is crafted with
            intention. Visit our studio or let us come to you anywhere in Nairobi.
          </p>

          {/* CTA Buttons */}
          <div style={{
            ...fadeIn,
            transitionDelay: "500ms",
            display: "flex",
            gap: "16px",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
          }}>
            <Link
              href="/services"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "13px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                backgroundColor: "#2D2424",
                color: "#FDFBF7",
                padding: "16px 40px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              View Our Services →
            </Link>

            <Link
              href="/booking"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "13px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                border: "1px solid rgba(45,36,36,0.3)",
                color: "#2D2424",
                padding: "16px 40px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Book an Appointment
            </Link>
          </div>

          {/* Stats */}
          <div style={{ ...fadeIn, transitionDelay: "650ms", display: "flex", gap: "32px", marginTop: "64px", flexWrap: "wrap" }}>
            {[
              { number: "8+", label: "Years of Excellence" },
              { number: "5", label: "Expert Artists" },
              { number: "2K+", label: "Happy Clients" },
            ].map((stat) => (
              <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: "var(--font-heading), serif", fontSize: isMobile ? "28px" : "36px", color: "#C5A358" }}>
                  {stat.number}
                </span>
                <span style={{
                  fontFamily: "var(--font-body), sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(45,36,36,0.5)",
                  maxWidth: "80px",
                  lineHeight: 1.4,
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile badge — inline on mobile, absolute on desktop */}
          {isMobile ? (
            <div style={{
              ...fadeIn,
              transitionDelay: "750ms",
              marginTop: "40px",
              backgroundColor: "rgba(255,255,255,0.85)",
              border: "1px solid #E5E0D8",
              padding: "16px 20px",
              display: "inline-block",
            }}>
              <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C5A358", marginBottom: "4px" }}>
                Mobile Service Available
              </p>
              <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "13px", color: "#2D2424", margin: 0 }}>
                We come to you — anywhere in Nairobi
              </p>
            </div>
          ) : (
            <div style={{
              ...fadeIn,
              transitionDelay: "750ms",
              position: "absolute",
              bottom: "48px",
              right: "48px",
              backgroundColor: "rgba(255,255,255,0.85)",
              border: "1px solid #E5E0D8",
              padding: "16px 24px",
            }}>
              <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C5A358", marginBottom: "4px" }}>
                Mobile Service Available
              </p>
              <p style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "14px", color: "#2D2424", margin: 0 }}>
                We come to you — anywhere in Nairobi
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}