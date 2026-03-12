"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#FDFBF7",
      fontFamily: "'Jost', sans-serif",
    }}>
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
          onClick={handleLogout}
          style={{
            background: "none", border: "1px solid rgba(253,251,247,0.2)",
            borderRadius: "2px", padding: "8px 20px", cursor: "pointer",
            fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(253,251,247,0.6)",
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 40px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "40px", color: "#2D2424", fontWeight: 300, marginBottom: "8px" }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.5)", marginBottom: "48px" }}>
          What would you like to manage today?
        </p>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Shop Products */}
          <div
            onClick={() => router.push("/admin/products")}
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
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🛍️</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#2D2424", fontWeight: 500, marginBottom: "8px" }}>
              Shop Products
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.5)", lineHeight: 1.7 }}>
              Add, edit or remove products. Update prices, descriptions and photos.
            </p>
            <div style={{ marginTop: "24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C5A358", fontWeight: 600 }}>
              Manage Products →
            </div>
          </div>

          {/* Gallery */}
          <div
            onClick={() => router.push("/admin/gallery")}
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
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🖼️</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#2D2424", fontWeight: 500, marginBottom: "8px" }}>
              Gallery
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.5)", lineHeight: 1.7 }}>
              Upload new nail art photos and remove old ones from your gallery.
            </p>
            <div style={{ marginTop: "24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C5A358", fontWeight: 600 }}>
              Manage Gallery →
            </div>
          </div>

        </div>

        {/* Footer note */}
        <p style={{ marginTop: "48px", fontSize: "12px", color: "rgba(45,36,36,0.35)", textAlign: "center" }}>
          Changes you make here will appear on your live website instantly.
        </p>
      </div>
    </div>
  );
}