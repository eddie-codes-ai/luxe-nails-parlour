"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

const INACTIVITY_LIMIT = 29 * 60 * 1000;
const WARNING_DURATION = 60 * 1000;

export default function AdminDashboard() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [hoverSignOut, setHoverSignOut] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const showWarningRef = useRef(false);

  const logout = useCallback(async () => {
    setSigningOut(true);
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.replace("/admin/login");
  }, []);

  const clearAllTimers = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  };

  const startInactivityTimer = useCallback(() => {
    clearAllTimers();
    showWarningRef.current = false;
    setShowWarning(false);
    setCountdown(60);

    inactivityTimer.current = setTimeout(() => {
      showWarningRef.current = true;
      setShowWarning(true);
      setCountdown(60);

      countdownInterval.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      warningTimer.current = setTimeout(() => {
        logout();
      }, WARNING_DURATION);

    }, INACTIVITY_LIMIT);
  }, [logout]);

  const handleStayLoggedIn = () => {
    startInactivityTimer();
  };

  const handleLogout = async () => {
    clearAllTimers();
    setSigningOut(true);
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.replace("/admin/login");
  };

  useEffect(() => {
    startInactivityTimer();

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => {
      if (!showWarningRef.current) startInactivityTimer();
    };

    events.forEach(e => window.addEventListener(e, handleActivity));

    return () => {
      clearAllTimers();
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      emoji: "🛍️",
      title: "Shop Products",
      description: "Add, edit or remove products. Update prices, descriptions and photos.",
      label: "Manage Products",
      path: "/admin/products",
    },
    {
      emoji: "🖼️",
      title: "Gallery",
      description: "Upload new nail art photos and remove old ones from your gallery.",
      label: "Manage Gallery",
      path: "/admin/gallery",
    },
    {
      emoji: "💅",
      title: "Artists",
      description: "Add new artists, update their bios, specialties and mobile availability.",
      label: "Manage Artists",
      path: "/admin/artists",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FDFBF7", fontFamily: "'Jost', sans-serif" }}>

      {/* Auto Logout Warning Popup */}
      {showWarning && (
        <div style={{
          position: "fixed", bottom: "32px", left: "50%",
          transform: "translateX(-50%)", zIndex: 1000,
          background: "#2D2424", borderRadius: "6px",
          padding: "20px 28px", boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: "20px",
          border: "1px solid rgba(197,163,88,0.3)", minWidth: "380px",
        }}>
          <div style={{ fontSize: "22px" }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", color: "#FDFBF7", margin: 0, lineHeight: 1.5 }}>
              You'll be logged out in{" "}
              <span style={{ color: "#C5A358", fontWeight: 600 }}>
                {countdown} second{countdown !== 1 ? "s" : ""}
              </span>{" "}
              due to inactivity.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStayLoggedIn}
            style={{
              background: "#C5A358", border: "none", borderRadius: "2px",
              padding: "8px 16px", cursor: "pointer", fontSize: "11px",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#2D2424", fontWeight: 600, whiteSpace: "nowrap",
            }}
          >
            Stay Logged In
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div style={{
        background: "#2D2424", padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#C5A358" }}>
            Luxe Nails
          </span>
          <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(253,251,247,0.5)", textTransform: "uppercase", marginLeft: "12px" }}>
            Admin Panel
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          onMouseEnter={() => setHoverSignOut(true)}
          onMouseLeave={() => setHoverSignOut(false)}
          style={{
            background: hoverSignOut ? "rgba(197,163,88,0.15)" : "none",
            border: `1px solid ${hoverSignOut ? "#C5A358" : "rgba(253,251,247,0.2)"}`,
            borderRadius: "2px", padding: "8px 20px", cursor: "pointer",
            fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: hoverSignOut ? "#C5A358" : "rgba(253,251,247,0.6)",
            transition: "all 0.2s ease", opacity: signingOut ? 0.5 : 1,
          }}
        >
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 40px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "40px", color: "#2D2424", fontWeight: 300, marginBottom: "8px" }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.5)", marginBottom: "48px" }}>
          What would you like to manage today?
        </p>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {cards.map((card) => (
            <div
              key={card.path}
              onClick={() => router.push(card.path)}
              style={{
                background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
                padding: "40px 32px", cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(45,36,36,0.1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>{card.emoji}</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#2D2424", fontWeight: 500, marginBottom: "8px" }}>
                {card.title}
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.5)", lineHeight: 1.7 }}>
                {card.description}
              </p>
              <div style={{ marginTop: "24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C5A358", fontWeight: 600 }}>
                {card.label} →
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: "48px", fontSize: "12px", color: "rgba(45,36,36,0.35)", textAlign: "center" }}>
          Changes you make here will appear on your live website instantly.
        </p>
      </div>
    </div>
  );
}