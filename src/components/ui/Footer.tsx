"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fonts = {
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'Jost', 'Helvetica Neue', sans-serif",
  };

  return (
    <footer style={{ backgroundColor: "#2D2424", borderTop: "1px solid rgba(253,251,247,0.1)" }}>

      {/* Main content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "60px 24px" : "80px 48px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr",
          gap: isMobile ? "40px" : "48px",
        }}>

          {/* Column 1 — Brand */}
          <div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontFamily: fonts.heading, fontSize: "28px", color: "#FDFBF7", letterSpacing: "0.05em" }}>
                Luxe Nails
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C5A358" }}>
                Parlour
              </div>
            </div>

            <p style={{ fontFamily: fonts.body, fontSize: "14px", color: "rgba(253,251,247,0.45)", lineHeight: 1.7, maxWidth: "280px", marginBottom: "32px" }}>
              Nairobi's premier nail studio — where artistry meets self-care.
              Visit us in Westlands or let us bring the experience to you.
            </p>

            {/* M-Pesa badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              border: "1px solid rgba(197,163,88,0.3)",
              padding: "12px 16px",
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#C5A358" }} />
              <span style={{ fontFamily: fonts.body, fontSize: "12px", letterSpacing: "0.05em", color: "rgba(253,251,247,0.6)" }}>
                M-Pesa & Cash Payments Accepted
            </span>
            </div>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <h4 style={{ fontFamily: fonts.body, fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C5A358", marginBottom: "24px" }}>
              Navigate
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Services", href: "/services" },
                { label: "Gallery", href: "/gallery" },
                { label: "Our Artists", href: "/artists" },
                { label: "Book Appointment", href: "/booking" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={{
                    fontFamily: fonts.body,
                    fontSize: "14px",
                    color: "rgba(253,251,247,0.5)",
                    textDecoration: "none",
                  }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h4 style={{ fontFamily: fonts.body, fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C5A358", marginBottom: "24px" }}>
              Find Us
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <p style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(253,251,247,0.3)", marginBottom: "4px" }}>
                  Location
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: "14px", color: "rgba(253,251,247,0.55)", lineHeight: 1.6 }}>
                  Westlands, Nairobi<br />Kenya
                </p>
              </div>

              <div>
                <p style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(253,251,247,0.3)", marginBottom: "4px" }}>
                  Hours
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: "14px", color: "rgba(253,251,247,0.55)", lineHeight: 1.6 }}>
                  Mon–Sat: 8:00am – 7:00pm<br />Sun: 10:00am – 5:00pm
                </p>
              </div>

              <div>
                <p style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(253,251,247,0.3)", marginBottom: "4px" }}>
                  Phone / WhatsApp
                </p>
                <a href="tel:+254700000000" style={{ fontFamily: fonts.body, fontSize: "14px", color: "rgba(253,251,247,0.55)", textDecoration: "none" }}>
                  +254 700 000 000
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(253,251,247,0.1)", padding: isMobile ? "24px" : "24px 48px" }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: "16px",
        }}>
          <p style={{ fontFamily: fonts.body, fontSize: "12px", color: "rgba(253,251,247,0.25)", margin: 0 }}>
            © {currentYear} Luxe Nails Parlour. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Instagram", "TikTok", "WhatsApp"].map((social) => (
              <a key={social} href="#" style={{
                fontFamily: fonts.body,
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(253,251,247,0.3)",
                textDecoration: "none",
              }}>
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}