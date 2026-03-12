"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect email or password. Please try again.");
    }
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
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#2D2424" }}>
            Luxe Nails
          </div>
          <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#C5A358", textTransform: "uppercase", marginTop: "2px" }}>
            Admin Panel
          </div>
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#2D2424", fontWeight: 400, marginBottom: "6px", textAlign: "center" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.5)", textAlign: "center", marginBottom: "32px" }}>
          Sign in to manage your website
        </p>

        {error && (
          <div style={{ background: "#FFF0F0", border: "1px solid #FFCDD2", borderRadius: "4px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#C62828" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#2D2424", display: "block", marginBottom: "6px" }}>Email Address</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #E5E0D8", borderRadius: "2px", fontSize: "14px", color: "#2D2424", background: "#fff" }}
          />
        </div>

        <div style={{ marginBottom: "28px" }}>
          <label style={{ fontSize: "12px", color: "#2D2424", display: "block", marginBottom: "6px" }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #E5E0D8", borderRadius: "2px", fontSize: "14px", color: "#2D2424", background: "#fff" }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", background: "#C5A358",
            border: "none", borderRadius: "2px", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
            fontWeight: 600, color: "#2D2424", opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}