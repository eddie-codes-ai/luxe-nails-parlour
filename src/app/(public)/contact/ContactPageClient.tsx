"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

const contactInfo = [
  { icon: "📍", label: "Location", value: "Nairobi, Kenya", sub: "Mobile service available across Nairobi" },
  { icon: "📞", label: "Phone & WhatsApp", value: "+254 712 345 678", sub: "Mon – Sat, 8:00 AM – 7:00 PM" },
  { icon: "✉️", label: "Email", value: "hello@luxenailsparlour.co.ke", sub: "We reply within 24 hours" },
  { icon: "🕐", label: "Working Hours", value: "Mon – Sat: 8AM – 7PM", sub: "Sunday: 10AM – 4PM" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = form.name && form.phone && form.message;

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: `1px solid ${colors.sand}`,
    backgroundColor: "#fff",
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    color: colors.espresso,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: colors.espresso,
    marginBottom: "8px",
    opacity: 0.7,
  };

  return (
    <main style={{ backgroundColor: colors.cream, fontFamily: fonts.body, color: colors.espresso, minHeight: "100vh" }}>

      {/* ── Hero Banner ── */}
      <section style={{ background: `linear-gradient(135deg, ${colors.espresso} 0%, #4a3535 100%)`, padding: "120px 24px 80px", textAlign: "center" }}>
        <p style={{ color: colors.gold, letterSpacing: "0.25em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>
          Get In Touch
        </p>
        <h1 style={{ fontFamily: fonts.heading, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 300, color: colors.cream, lineHeight: 1.1, margin: "0 0 20px" }}>
          Contact Us
        </h1>
        <p style={{ color: colors.sand, fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7, opacity: 0.85 }}>
          Have a question or want to get in touch? We'd love to hear from you.
        </p>
      </section>

      {/* ── Main Content ── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "48px" : "60px",
        }}>

          {/* Left — Contact Info */}
          <div>
            <p style={{ color: colors.gold, letterSpacing: "0.2em", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>
              Find Us
            </p>
            <h2 style={{ fontFamily: fonts.heading, fontSize: "2.2rem", fontWeight: 300, margin: "0 0 12px" }}>
              We're Here For You
            </h2>
            <p style={{ fontSize: "0.92rem", lineHeight: 1.8, opacity: 0.7, marginBottom: "40px" }}>
              Whether you have a question about our services, want to book a mobile appointment, or just want to say hello — reach out and we'll get back to you quickly.
            </p>

            {/* Contact Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
              {contactInfo.map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "20px", backgroundColor: "#fff", border: `1px solid ${colors.sand}` }}>
                  <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.gold, marginBottom: "4px" }}>{item.label}</p>
                    <p style={{ fontSize: "0.92rem", fontWeight: 600, margin: "0 0 2px" }}>{item.value}</p>
                    <p style={{ fontSize: "0.78rem", opacity: 0.55, margin: 0 }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5, marginBottom: "14px" }}>
                Follow Us
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {["Instagram", "Facebook", "TikTok"].map((platform) => (
                  <a key={platform} href="#" style={{ padding: "10px 18px", border: `1px solid ${colors.sand}`, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.espresso, textDecoration: "none" }}>
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Message Form */}
          <div>
            <p style={{ color: colors.gold, letterSpacing: "0.2em", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>
              Send a Message
            </p>
            <h2 style={{ fontFamily: fonts.heading, fontSize: "2.2rem", fontWeight: 300, margin: "0 0 32px" }}>
              Drop Us a Line
            </h2>

            {submitted ? (
              <div style={{ backgroundColor: "#fff", border: `1px solid ${colors.sand}`, padding: "48px 32px", textAlign: "center" }}>
                <span style={{ fontSize: "2.5rem" }}>💌</span>
                <h3 style={{ fontFamily: fonts.heading, fontSize: "1.8rem", fontWeight: 300, margin: "16px 0 8px" }}>Message Sent!</h3>
                <p style={{ fontSize: "0.88rem", opacity: 0.65, lineHeight: 1.7, marginBottom: "24px" }}>
                  Thanks {form.name.split(" ")[0]}, we've received your message and will get back to you on <strong>{form.phone}</strong> shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", message: "" }); }}
                  style={{ backgroundColor: colors.gold, color: colors.espresso, border: "none", padding: "12px 28px", fontFamily: fonts.body, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input style={inputStyle} type="text" placeholder="e.g. Jane Wanjiru" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Phone / WhatsApp *</label>
                  <input style={inputStyle} type="tel" placeholder="e.g. 0712 345 678" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Your Message *</label>
                  <textarea style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }} placeholder="Ask us anything — services, pricing, mobile bookings..." value={form.message} onChange={(e) => update("message", e.target.value)} />
                </div>
                <button
                  onClick={() => isValid && setSubmitted(true)}
                  onMouseEnter={() => setHoveredBtn(true)}
                  onMouseLeave={() => setHoveredBtn(false)}
                  disabled={!isValid}
                  style={{
                    padding: "15px",
                    backgroundColor: !isValid ? colors.sand : hoveredBtn ? colors.espresso : colors.gold,
                    color: hoveredBtn && isValid ? colors.cream : colors.espresso,
                    border: "none",
                    fontFamily: fonts.body,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: isValid ? "pointer" : "not-allowed",
                    opacity: isValid ? 1 : 0.6,
                    transition: "all 0.25s",
                  }}
                >
                  Send Message →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ backgroundColor: colors.espresso, padding: "80px 24px", textAlign: "center" }}>
        <p style={{ color: colors.gold, letterSpacing: "0.2em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>
          Ready to Treat Yourself?
        </p>
        <h2 style={{ fontFamily: fonts.heading, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: colors.cream, margin: "0 0 16px" }}>
          Book Your Appointment
        </h2>
        <p style={{ color: colors.sand, opacity: 0.8, maxWidth: "400px", margin: "0 auto 36px", lineHeight: 1.7, fontSize: "0.95rem" }}>
          Skip the queue — book online in under 2 minutes.
        </p>
        <Link href="/booking" style={{ display: "inline-block", backgroundColor: colors.gold, color: colors.espresso, padding: "14px 40px", fontFamily: fonts.body, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
          Book Now
        </Link>
      </section>

    </main>
  );
}