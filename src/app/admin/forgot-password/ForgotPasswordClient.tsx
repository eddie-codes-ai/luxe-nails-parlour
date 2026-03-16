"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "email" | "code" | "success";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  // Step 1 — email
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Step 2 — code + new password
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  // ── Step 1: Send code ─────────────────────────────────────
  const handleSendCode = async () => {
    setEmailError("");
    if (!email) { setEmailError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address."); return;
    }

    setEmailLoading(true);
    const res = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEmailLoading(false);

    if (res.ok) {
      setStep("code");
    } else {
      setEmailError("Something went wrong. Please try again.");
    }
  };

  // ── Step 2: Verify code + reset password ──────────────────
  const handleResetPassword = async () => {
    setResetError("");
    if (!code || code.length !== 6) { setResetError("Please enter the 6-digit code."); return; }
    if (!newPassword || !confirmPassword) { setResetError("Please fill in all fields."); return; }
    if (newPassword.length < 8) { setResetError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setResetError("Passwords do not match."); return; }

    setResetLoading(true);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    setResetLoading(false);

    if (data.success) {
      setStep("success");
    } else if (data.error === "invalid_code") {
      setResetError("Invalid code. Please check and try again.");
    } else if (data.error === "code_expired") {
      setResetError("This code has expired. Please request a new one.");
    } else {
      setResetError("Something went wrong. Please try again.");
    }
  };

  // ── Shared styles ─────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #E5E0D8",
    borderRadius: "2px", fontSize: "14px", color: "#2D2424",
    background: "#fff", fontFamily: "'Jost', sans-serif", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "12px", color: "#2D2424", display: "block", marginBottom: "6px",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#FDFBF7",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "'Jost', sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: "400px", background: "#fff",
        border: "1px solid #E5E0D8", borderRadius: "4px",
        padding: "48px 40px", boxShadow: "0 8px 40px rgba(45,36,36,0.08)",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#2D2424" }}>
            Luxe Nails
          </div>
          <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#C5A358", textTransform: "uppercase", marginTop: "2px" }}>
            Admin Panel
          </div>
        </div>

        {/* ── Step 1: Enter email ── */}
        {step === "email" && (
          <>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#2D2424", fontWeight: 400, marginBottom: "6px", textAlign: "center" }}>
              Forgot Password
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.5)", textAlign: "center", marginBottom: "32px" }}>
              Enter your admin email and we'll send you a reset code.
            </p>

            {emailError && (
              <div style={{ background: "#FFF0F0", border: "1px solid #FFCDD2", borderRadius: "4px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#C62828" }}>
                {emailError}
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendCode()}
                style={inputStyle}
              />
            </div>

            <button
              onClick={handleSendCode}
              disabled={emailLoading}
              style={{
                width: "100%", padding: "14px", background: "#C5A358", border: "none",
                borderRadius: "2px", cursor: emailLoading ? "not-allowed" : "pointer",
                fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontWeight: 600, color: "#2D2424", opacity: emailLoading ? 0.7 : 1,
              }}
            >
              {emailLoading ? "Sending..." : "Send Reset Code"}
            </button>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                onClick={() => router.push("/admin/login")}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "rgba(45,36,36,0.5)", textDecoration: "underline" }}
              >
                Back to sign in
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Enter code + new password ── */}
        {step === "code" && (
          <>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#2D2424", fontWeight: 400, marginBottom: "6px", textAlign: "center" }}>
              Enter Code
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.5)", textAlign: "center", marginBottom: "6px" }}>
              We sent a 6-digit code to
            </p>
            <p style={{ fontSize: "13px", color: "#2D2424", fontWeight: 600, textAlign: "center", marginBottom: "28px" }}>
              {email}
            </p>

            {resetError && (
              <div style={{ background: "#FFF0F0", border: "1px solid #FFCDD2", borderRadius: "4px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#C62828" }}>
                {resetError}
              </div>
            )}

            {/* Code input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>6-Digit Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                style={{
                  ...inputStyle,
                  letterSpacing: "0.35em",
                  fontSize: "22px",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              />
            </div>

            {/* New password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "rgba(45,36,36,0.4)" }}
                >
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                  style={{
                    ...inputStyle,
                    borderColor: confirmPassword && confirmPassword !== newPassword ? "#FFCDD2" : "#E5E0D8",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "rgba(45,36,36,0.4)" }}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p style={{ fontSize: "11px", color: "#991b1b", marginTop: "4px" }}>Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === newPassword && (
                <p style={{ fontSize: "11px", color: "#166534", marginTop: "4px" }}>✅ Passwords match</p>
              )}
            </div>

            <button
              onClick={handleResetPassword}
              disabled={resetLoading}
              style={{
                width: "100%", padding: "14px", background: "#C5A358", border: "none",
                borderRadius: "2px", cursor: resetLoading ? "not-allowed" : "pointer",
                fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontWeight: 600, color: "#2D2424", opacity: resetLoading ? 0.7 : 1,
              }}
            >
              {resetLoading ? "Resetting..." : "Reset Password"}
            </button>

            <div style={{ textAlign: "center", marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => { setStep("email"); setCode(""); setResetError(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "rgba(45,36,36,0.5)", textDecoration: "underline" }}
              >
                Resend code
              </button>
              <button
                onClick={() => router.push("/admin/login")}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "rgba(45,36,36,0.5)", textDecoration: "underline" }}
              >
                Back to sign in
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#2D2424", fontWeight: 400, marginBottom: "12px" }}>
              Password Reset!
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.5)", marginBottom: "32px", lineHeight: "1.6" }}>
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => router.push("/admin/login")}
              style={{
                width: "100%", padding: "14px", background: "#C5A358", border: "none",
                borderRadius: "2px", cursor: "pointer", fontSize: "13px",
                letterSpacing: "0.15em", textTransform: "uppercase",
                fontWeight: 600, color: "#2D2424",
              }}
            >
              Go to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}