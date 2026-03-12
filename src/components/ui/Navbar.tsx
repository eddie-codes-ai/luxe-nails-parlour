"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: scrolled || menuOpen ? "rgba(253,251,247,0.97)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(8px)" : "none",
          borderBottom: scrolled || menuOpen ? "1px solid #E5E0D8" : "none",
          transition: "all 0.4s ease",
        }}
      >
        <nav
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: isMobile ? "0 20px" : "0 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "70px",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", lineHeight: 1 }}>
            <div style={{ fontFamily: fonts.heading, fontSize: "22px", color: "#2D2424", letterSpacing: "0.05em" }}>
              Luxe Nails
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: "9px", letterSpacing: "0.3em", color: "#C5A358", textTransform: "uppercase" }}>
              Parlour
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {!isMobile && (
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
          )}

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {!isMobile && (
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
            )}

            {/* Mobile Hamburger */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "#2D2424", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
                <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "#2D2424", transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
                <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "#2D2424", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobile && menuOpen && (
          <div
            style={{
              backgroundColor: "rgba(253,251,247,0.97)",
              borderTop: "1px solid #E5E0D8",
              padding: "24px 20px 32px",
            }}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href} style={{ borderBottom: "1px solid #E5E0D8" }}>
                    <Link
                      href={link.href}
                      style={{
                        display: "block",
                        padding: "16px 0",
                        fontFamily: fonts.body,
                        fontSize: "13px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: isActive ? "#C5A358" : "#2D2424",
                        textDecoration: "none",
                        fontWeight: isActive ? 700 : 400,
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/booking"
              style={{
                display: "block",
                textAlign: "center",
                backgroundColor: "#2D2424",
                color: "#FDFBF7",
                padding: "14px",
                fontFamily: fonts.body,
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Book Now
            </Link>
          </div>
        )}
      </header>
    </>
  );
}