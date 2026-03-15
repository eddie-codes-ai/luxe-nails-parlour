"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/ui/Navbar";

interface Artist {
  id: number;
  name: string;
  role: string;
  title: string;
  bio: string;
  specialty: string;
  years_experience: number;
  services: string;
  mobile_available: boolean;
  photo_url: string | null;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filtered, setFiltered] = useState<Artist[]>([]);
  const [mobileOnly, setMobileOnly] = useState(false);
  const [activeService, setActiveService] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("id", { ascending: true });
      if (!error && data) {
        setArtists(data);
        setFiltered(data);
      }
      setLoading(false);
    };
    fetchArtists();
  }, []);

  const allServices = [
    "All",
    ...Array.from(
      new Set(
        artists.flatMap((a) =>
          a.services ? a.services.split(",").map((s) => s.trim()) : []
        )
      )
    ),
  ];

  useEffect(() => {
    let result = [...artists];
    if (mobileOnly) result = result.filter((a) => a.mobile_available);
    if (activeService !== "All")
      result = result.filter((a) => a.services?.includes(activeService));
    setFiltered(result);
  }, [mobileOnly, activeService, artists]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const sidebarColors = ["#C5A358", "#2D2424", "#C5A358", "#2D2424", "#C5A358"];

  return (
    <div style={{ backgroundColor: "#FDFBF7", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ backgroundColor: "#2D2424", padding: "80px 5% 60px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#C5A358", marginBottom: "16px" }}>
          The Team
        </p>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 400, color: "#FDFBF7", marginBottom: "16px" }}>
          Meet Your <em>Artists</em>
        </h1>
        <p style={{ color: "rgba(253,251,247,0.6)", fontSize: "0.95rem", maxWidth: "500px", margin: "0 auto", lineHeight: 1.8 }}>
          Every set is personal. Find your perfect artist and book directly with them.
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid rgba(197,163,88,0.15)", padding: "16px 5%", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", position: "sticky", top: 0, zIndex: 10 }}>
        <button
          onClick={() => setMobileOnly(!mobileOnly)}
          style={{ padding: "8px 16px", borderRadius: "50px", border: `1px solid ${mobileOnly ? "#C5A358" : "rgba(45,36,36,0.2)"}`, backgroundColor: mobileOnly ? "#C5A358" : "transparent", color: mobileOnly ? "#fff" : "#2D2424", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}
        >
          📱 Mobile Only
        </button>

        <div style={{ width: "1px", height: "24px", backgroundColor: "rgba(45,36,36,0.15)" }} />

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {allServices.map((service) => (
            <button
              key={service}
              onClick={() => setActiveService(service)}
              style={{ padding: "7px 14px", borderRadius: "50px", border: `1px solid ${activeService === service ? "#C5A358" : "rgba(45,36,36,0.15)"}`, backgroundColor: activeService === service ? "rgba(197,163,88,0.1)" : "transparent", color: activeService === service ? "#C5A358" : "rgba(45,36,36,0.6)", fontSize: "11px", letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.2s" }}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Artists List */}
      <div style={{ padding: "60px 5%", maxWidth: "900px", margin: "0 auto" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "rgba(45,36,36,0.4)", padding: "60px 0" }}>Loading artists...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(45,36,36,0.4)", padding: "60px 0" }}>No artists match your filter.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {filtered.map((artist, index) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                sidebarColor={sidebarColors[index % sidebarColors.length]}
                initials={getInitials(artist.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArtistCard({ artist, sidebarColor, initials }: { artist: Artist; sidebarColor: string; initials: string }) {
  const [hovered, setHovered] = useState(false);
  const serviceTags = artist.services ? artist.services.split(",").map((s) => s.trim()) : [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", border: `1px solid ${hovered ? "rgba(197,163,88,0.6)" : "rgba(197,163,88,0.15)"}`, boxShadow: hovered ? "0 8px 32px rgba(197,163,88,0.15)" : "0 2px 8px rgba(0,0,0,0.04)", transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "all 0.3s ease" }}
    >
      {/* Sidebar */}
      <div style={{ width: "140px", minWidth: "140px", backgroundColor: sidebarColor, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", gap: "12px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontFamily: "Cormorant Garamond, serif", fontWeight: 600, color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          {artist.photo_url ? (
            <img src={artist.photo_url} alt={artist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.3rem", fontFamily: "Cormorant Garamond, serif", fontWeight: 600, color: "#fff", lineHeight: 1 }}>
            {artist.years_experience}
          </div>
          <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
            Years Experience
          </div>
        </div>

        {artist.mobile_available && (
          <div style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50px", padding: "4px 10px", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", display: "flex", alignItems: "center", gap: "4px" }}>
            📱 Mobile
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "28px 32px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C5A358", fontWeight: 600 }}>
            {artist.role}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
            <span style={{ fontSize: "10px", color: "#22c55e", letterSpacing: "0.05em" }}>Taking Bookings</span>
          </div>
        </div>

        <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#2D2424", margin: "0 0 4px", lineHeight: 1.1 }}>
          {artist.name}
        </h2>

        <p style={{ fontSize: "0.82rem", color: "#C5A358", fontStyle: "italic", marginBottom: "12px" }}>
          Specialises in {artist.specialty}
        </p>

        <p style={{ fontSize: "0.88rem", color: "rgba(45,36,36,0.7)", lineHeight: 1.8, marginBottom: "16px" }}>
          {artist.bio}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          {serviceTags.map((tag) => (
            <span key={tag} style={{ padding: "4px 12px", border: "1px solid rgba(45,36,36,0.2)", borderRadius: "4px", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(45,36,36,0.6)" }}>
              {tag}
            </span>
          ))}
        </div>

        <a href="/booking" style={{ display: "inline-block", padding: "12px 28px", backgroundColor: "#C5A358", color: "#fff", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", borderRadius: "4px" }}>
          Book with {artist.name.split(" ")[0]}
        </a>
      </div>
    </div>
  );
}