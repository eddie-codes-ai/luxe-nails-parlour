"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";

export default function SettingsClient() {
  const router = useRouter();
  const [hoverBack, setHoverBack] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSaving(true);

    const res = await adminFetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (data.success) {
      setSuccess("Password updated successfully! Use your new password next time you sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else if (data.error === "incorrect_password") {
      setError("Current password is incorrect. Please try again.");
    } else {
      setError("Something went wrong. Please try again.");
    }

    setSaving(false);
  };

  const requirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "One number or special character", met: /[0-9!@#$%^&*]/.test(newPassword) },
  ];

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: "13px",
    border: "1px solid #E5E0D8", borderRadius: "2px",
    fontFamily: "'Jost', sans-serif", background: "#FDFBF7",
    color: "#2D2424", outline: "none", boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const,
    color: "rgba(45,36,36,0.5)", marginBottom: "6px", display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FDFBF7", fontFamily: "'Jost', sans-serif" }}>

      {/* Top Bar */}
      <div style={{
        background: "#2D2424", padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            onMouseEnter={() => setHoverBack(true)}
            onMouseLeave={() => setHoverBack(false)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: hoverBack ? "#C5A358" : "rgba(253,251,247,0.5)",
              fontSize: "20px", transition: "color 0.2s", padding: 0,
            }}
          >
            ←
          </button>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#C5A358" }}>
              Luxe Nails
            </span>
            <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(253,251,247,0.5)", textTransform: "uppercase", marginLeft: "12px" }}>
              Settings
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 40px" }}>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "40px",
          color: "#2D2424", fontWeight: 300, marginBottom: "8px",
        }}>
          Settings
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.5)", marginBottom: "48px" }}>
          Manage your admin account settings.
        </p>

        {/* Change Password Card */}
        <div style={{
          background: "#fff", border: "1px solid #E5E0D8",
          borderRadius: "4px", padding: "36px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ fontSize: "24px" }}>🔒</div>
            <div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: "22px",
                color: "#2D2424", fontWeight: 500, margin: 0,
              }}>
                Change Password
              </h2>
              <p style={{ fontSize: "12px", color: "rgba(45,36,36,0.4)", margin: "2px 0 0" }}>
                Choose a strong password at least 8 characters long.
              </p>
            </div>
          </div>

          {success && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px",
              padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#166534",
            }}>
              ✅ {success}
            </div>
          )}

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px",
              padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#991b1b",
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Current Password */}
            <div>
              <label style={labelStyle}>Current Password</label>
              <div style={{ position: "relative" }}>
                <input
                  style={inputStyle}
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", fontSize: "14px",
                    color: "rgba(45,36,36,0.4)",
                  }}
                >
                  {showCurrent ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  style={inputStyle}
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", fontSize: "14px",
                    color: "rgba(45,36,36,0.4)",
                  }}
                >
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>

              {newPassword && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        style={{
                          height: "3px", flex: 1, borderRadius: "2px",
                          backgroundColor: getStrengthColor(newPassword, level),
                          transition: "background-color 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: getStrengthTextColor(newPassword), margin: "0 0 10px" }}>
                    {getStrengthLabel(newPassword)}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {requirements.map(req => (
                      <div key={req.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px" }}>{req.met ? "✅" : "○"}</span>
                        <span style={{ fontSize: "11px", color: req.met ? "#22c55e" : "rgba(45,36,36,0.4)" }}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: confirmPassword && confirmPassword !== newPassword ? "#fecaca" : "#E5E0D8",
                  }}
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", fontSize: "14px",
                    color: "rgba(45,36,36,0.4)",
                  }}
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

          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={saving}
            style={{
              marginTop: "28px", background: "#2D2424", border: "none",
              borderRadius: "2px", padding: "12px 32px", cursor: saving ? "not-allowed" : "pointer",
              fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#FDFBF7", fontWeight: 600, opacity: saving ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>

        {/* Updated: was static text, now a functional link */}
        <p style={{ marginTop: "32px", fontSize: "12px", color: "rgba(45,36,36,0.35)", textAlign: "center" }}>
          Forgot your password?{" "}
          <a
            href="/admin/forgot-password"
            style={{ color: "#C5A358", textDecoration: "underline", cursor: "pointer" }}
          >
            Reset it here
          </a>
        </p>

      </div>
    </div>
  );
}

// Password strength helpers
function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

function getStrengthColor(password: string, level: number): string {
  const strength = getPasswordStrength(password);
  if (strength < level) return "#E5E0D8";
  if (strength === 1) return "#ef4444";
  if (strength === 2) return "#f97316";
  if (strength === 3) return "#eab308";
  return "#22c55e";
}

function getStrengthTextColor(password: string): string {
  const strength = getPasswordStrength(password);
  if (strength <= 1) return "#ef4444";
  if (strength === 2) return "#f97316";
  if (strength === 3) return "#eab308";
  return "#22c55e";
}

function getStrengthLabel(password: string): string {
  const strength = getPasswordStrength(password);
  if (strength === 0) return "Too short";
  if (strength === 1) return "Weak";
  if (strength === 2) return "Fair";
  if (strength === 3) return "Good";
  return "Strong ✓";
}