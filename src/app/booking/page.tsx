"use client";

import { useState } from "react";

const services = [
  "Classic Manicure",
  "Luxury Spa Manicure",
  "Acrylic Full Set",
  "Acrylic Infill",
  "Gel Polish",
  "Nail Art Session",
];

const artists = [
  "No Preference",
  "Amara Wanjiku",
  "Brenda Achieng",
  "Cynthia Muthoni",
  "Diana Njeri",
  "Esther Kamau",
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM",
  "3:00 PM", "4:00 PM", "5:00 PM",
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

type FormData = {
  name: string;
  phone: string;
  email: string;
  service: string;
  artist: string;
  date: string;
  time: string;
  mobile: string;
  notes: string;
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    service: "",
    artist: "No Preference",
    date: "",
    time: "",
    mobile: "no",
    notes: "",
  });

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const step1Valid = form.name && form.phone && form.service;
  const step2Valid = form.date && form.time;

  const handleSubmit = () => {
    setSubmitted(true);
  };

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

  if (submitted) {
    return (
      <main style={{ backgroundColor: colors.cream, fontFamily: fonts.body, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: "520px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "24px" }}>💅</div>
          <p style={{ color: colors.gold, letterSpacing: "0.2em", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "16px" }}>
            You're Booked!
          </p>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: "2.8rem",
              fontWeight: 300,
              color: colors.espresso,
              margin: "0 0 16px",
            }}
          >
            See You Soon, {form.name.split(" ")[0]}!
          </h1>
          <p style={{ fontSize: "0.92rem", lineHeight: 1.8, opacity: 0.7, marginBottom: "8px" }}>
            We've received your booking request for <strong>{form.service}</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong>.
          </p>
          <p style={{ fontSize: "0.88rem", opacity: 0.6, marginBottom: "36px" }}>
            We'll confirm your appointment via WhatsApp or call to <strong>{form.phone}</strong> shortly.
          </p>
          <div
            style={{
              backgroundColor: colors.sand,
              padding: "20px 24px",
              marginBottom: "32px",
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px", opacity: 0.6 }}>Booking Summary</p>
            {[
              ["Service", form.service],
              ["Artist", form.artist],
              ["Date", form.date],
              ["Time", form.time],
              ["Mobile Service", form.mobile === "yes" ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "6px 0", borderBottom: `1px solid #d8d3cb` }}>
                <span style={{ opacity: 0.6 }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setForm({ name: "", phone: "", email: "", service: "", artist: "No Preference", date: "", time: "", mobile: "no", notes: "" }); }}
            style={{
              backgroundColor: colors.gold,
              color: colors.espresso,
              border: "none",
              padding: "14px 36px",
              fontFamily: fonts.body,
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Book Another Appointment
          </button>
        </div>
      </main>
    );
  }

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
          Reserve Your Spot
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
          Book an Appointment
        </h1>
        <p style={{ color: colors.sand, fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7, opacity: 0.85 }}>
          Fill in your details below and we'll confirm your appointment via WhatsApp or call.
        </p>
      </section>

      {/* ── Step Indicator ── */}
      <section style={{ backgroundColor: "#fff", borderBottom: `1px solid ${colors.sand}`, padding: "20px 24px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", alignItems: "center", gap: "0" }}>
          {[
            { num: 1, label: "Your Details" },
            { num: 2, label: "Date & Time" },
            { num: 3, label: "Confirm" },
          ].map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: step >= s.num ? colors.gold : colors.sand,
                    color: step >= s.num ? colors.espresso : colors.espresso,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    opacity: step >= s.num ? 1 : 0.4,
                  }}
                >
                  {s.num}
                </div>
                <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", opacity: step >= s.num ? 0.9 : 0.4, fontWeight: step === s.num ? 700 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: "1px", backgroundColor: step > s.num ? colors.gold : colors.sand, margin: "0 8px", marginBottom: "20px" }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Form ── */}
      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>

        {/* STEP 1 — Your Details */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: "2rem", fontWeight: 300, margin: "0 0 32px" }}>Your Details</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} type="text" placeholder="e.g. Jane Wanjiru" value={form.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number (WhatsApp) *</label>
                <input style={inputStyle} type="tel" placeholder="e.g. 0712 345 678" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Email Address (optional)</label>
                <input style={inputStyle} type="email" placeholder="e.g. jane@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Select Service *</label>
                <select style={inputStyle} value={form.service} onChange={(e) => update("service", e.target.value)}>
                  <option value="">-- Choose a service --</option>
                  {services.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Preferred Artist</label>
                <select style={inputStyle} value={form.artist} onChange={(e) => update("artist", e.target.value)}>
                  {artists.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mobile Service?</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {["yes", "no"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => update("mobile", opt)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: `1px solid ${form.mobile === opt ? colors.gold : colors.sand}`,
                        backgroundColor: form.mobile === opt ? colors.gold : "#fff",
                        color: colors.espresso,
                        fontFamily: fonts.body,
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {opt === "yes" ? "🚗 Yes, come to me" : "🏠 I'll visit the parlour"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              style={{
                marginTop: "36px",
                width: "100%",
                padding: "15px",
                backgroundColor: step1Valid ? colors.gold : colors.sand,
                color: colors.espresso,
                border: "none",
                fontFamily: fonts.body,
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: step1Valid ? "pointer" : "not-allowed",
                opacity: step1Valid ? 1 : 0.6,
                transition: "all 0.2s",
              }}
            >
              Next: Choose Date & Time →
            </button>
          </div>
        )}

        {/* STEP 2 — Date & Time */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: "2rem", fontWeight: 300, margin: "0 0 32px" }}>Date & Time</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div>
                <label style={labelStyle}>Preferred Date *</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => update("date", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Preferred Time *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onMouseEnter={() => setHoveredSlot(slot)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      onClick={() => update("time", slot)}
                      style={{
                        padding: "12px 8px",
                        border: `1px solid ${form.time === slot ? colors.gold : colors.sand}`,
                        backgroundColor: form.time === slot ? colors.gold : hoveredSlot === slot ? "#faf9f6" : "#fff",
                        color: colors.espresso,
                        fontFamily: fonts.body,
                        fontSize: "0.82rem",
                        fontWeight: form.time === slot ? 700 : 400,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Additional Notes</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  placeholder="Any special requests, allergies, or inspiration images to share?"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "36px" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: "15px",
                  backgroundColor: "transparent",
                  color: colors.espresso,
                  border: `1px solid ${colors.sand}`,
                  fontFamily: fonts.body,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                style={{
                  flex: 2,
                  padding: "15px",
                  backgroundColor: step2Valid ? colors.gold : colors.sand,
                  color: colors.espresso,
                  border: "none",
                  fontFamily: fonts.body,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: step2Valid ? "pointer" : "not-allowed",
                  opacity: step2Valid ? 1 : 0.6,
                  transition: "all 0.2s",
                }}
              >
                Next: Confirm →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Confirm */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: "2rem", fontWeight: 300, margin: "0 0 8px" }}>Confirm Booking</h2>
            <p style={{ fontSize: "0.88rem", opacity: 0.6, marginBottom: "32px" }}>Please review your details before submitting.</p>

            <div style={{ backgroundColor: "#fff", border: `1px solid ${colors.sand}`, marginBottom: "28px" }}>
              {[
                ["Name", form.name],
                ["Phone", form.phone],
                ["Email", form.email || "Not provided"],
                ["Service", form.service],
                ["Artist", form.artist],
                ["Date", form.date],
                ["Time", form.time],
                ["Mobile Service", form.mobile === "yes" ? "Yes — come to me" : "No — visiting parlour"],
                ["Notes", form.notes || "None"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "14px 20px",
                    borderBottom: `1px solid ${colors.sand}`,
                    gap: "20px",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, minWidth: "100px" }}>{label}</span>
                  <span style={{ fontSize: "0.88rem", textAlign: "right", fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: colors.sand,
                padding: "16px 20px",
                marginBottom: "28px",
                fontSize: "0.82rem",
                lineHeight: 1.6,
                opacity: 0.8,
              }}
            >
              💳 <strong>Payment:</strong> M-Pesa payment will be collected at the time of your appointment. We'll send you the till number when we confirm your booking.
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  padding: "15px",
                  backgroundColor: "transparent",
                  color: colors.espresso,
                  border: `1px solid ${colors.sand}`,
                  fontFamily: fonts.body,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                onMouseEnter={() => setHoveredBtn("submit")}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  flex: 2,
                  padding: "15px",
                  backgroundColor: hoveredBtn === "submit" ? colors.espresso : colors.gold,
                  color: hoveredBtn === "submit" ? colors.cream : colors.espresso,
                  border: "none",
                  fontFamily: fonts.body,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.25s",
                }}
              >
                Confirm Booking ✓
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}