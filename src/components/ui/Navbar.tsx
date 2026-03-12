"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Our Artists", href: "/artists" },
    { label: "Contact", href: "/contact" },
  ];

  const fonts = {
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'Jost', 'Helvetica Neue', sans-serif",
  };

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
          <div style={{ fontFamily: fonts.heading, fontSize: "24px", color: "#2D2424", letterSpacing: "0.05em" }}>
            Luxe Nails
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.3em", color: "#C5A358", textTransform: "uppercase" }}>
            Parlour
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul style={{ display: "flex", alignItems: "center", gap: "40px", listStyle: "none", margin: 0, padding: 0 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isHovered = hoveredLink === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{
                    fontFamily: fonts.body,
                    fontSize: "12px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: isActive ? "#C5A358" : isHovered ? "#C5A358" : "#2D2424",
                    textDecoration: "none",
                    borderBottom: isActive ? "1px solid #C5A358" : "1px solid transparent",
                    paddingBottom: "2px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Book Now Button */}
        <Link
          href="/booking"
          style={{
            fontFamily: fonts.body,
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
    </header>
  );
}