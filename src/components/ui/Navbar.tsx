"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Our Artists", href: "/artists" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "rgba(253,251,247,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled ? "1px solid #E5E0D8" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <nav
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "80px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", lineHeight: 1 }}>
          <div style={{ fontFamily: "var(--font-heading), serif", fontSize: "24px", color: "#2D2424", letterSpacing: "0.05em" }}>
            Luxe Nails
          </div>
          <div style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "10px", letterSpacing: "0.3em", color: "#C5A358", textTransform: "uppercase" }}>
            Parlour
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul style={{ display: "flex", alignItems: "center", gap: "40px", listStyle: "none", margin: 0, padding: 0 }}>
          {navLinks.map((link) => (
            <li key={link.href} style={{ display: "none" }} className="desktop-nav-item">
              <Link
                href={link.href}
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  fontSize: "12px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#2D2424",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Book Now Button */}
        <Link
          href="/booking"
          style={{
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            backgroundColor: "#2D2424",
            color: "#FDFBF7",
            padding: "12px 24px",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Book Now
        </Link>
      </nav>

      {/* Simple inline styles for desktop */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav-item {
            display: list-item !important;
          }
        }
      `}</style>
    </header>
  );
}