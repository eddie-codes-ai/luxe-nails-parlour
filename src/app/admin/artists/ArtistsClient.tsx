"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Artist {
  id?: number;
  name: string;
  role: string;
  title: string;
  bio: string;
  specialty: string;
  years_experience: number;
  services: string;
  mobile_available: boolean;
  photo_url: string;
}

const emptyArtist: Artist = {
  name: "",
  role: "",
  title: "",
  bio: "",
  specialty: "",
  years_experience: 0,
  services: "",
  mobile_available: false,
  photo_url: "",
};

export default function ArtistsClient() {
  const router = useRouter();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [form, setForm] = useState<Artist>(emptyArtist);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoverBack, setHoverBack] = useState(false);

  const fetchArtists = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/artists");
    const data = await res.json();
    setArtists(data.artists || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setForm(artist);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNew = () => {
    setEditingArtist(null);
    setForm(emptyArtist);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingArtist(null);
    setForm(emptyArtist);
    setError("");
  };

  const handleSave = async () => {
    if (!form.name || !form.role || !form.specialty) {
      setError("Please fill in Name, Role and Specialty.");
      return;
    }
    setSaving(true);
    setError("");
    const method = editingArtist?.id ? "PUT" : "POST";
    const body = editingArtist?.id ? { ...form, id: editingArtist.id } : form;
    const res = await fetch("/api/admin/artists", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(editingArtist?.id ? "Artist updated!" : "Artist added!");
      setShowForm(false);
      setEditingArtist(null);
      setForm(emptyArtist);
      fetchArtists();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this artist?")) return;
    setDeletingId(id);
    const res = await fetch("/api/admin/artists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("Artist deleted!");
      fetchArtists();
      setTimeout(() => setSuccess(""), 3000);
    }
    setDeletingId(null);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

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
              Artists
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          style={{
            background: "#C5A358", border: "none", borderRadius: "2px",
            padding: "8px 20px", cursor: "pointer", fontSize: "12px",
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#2D2424", fontWeight: 600,
          }}
        >
          + Add Artist
        </button>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 40px" }}>

        {/* Success Banner */}
        {success && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px",
            padding: "12px 16px", marginBottom: "24px", fontSize: "13px", color: "#166534",
          }}>
            ✅ {success}
          </div>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div style={{
            background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
            padding: "36px", marginBottom: "40px",
          }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "26px",
              color: "#2D2424", fontWeight: 500, marginBottom: "28px",
            }}>
              {editingArtist?.id ? "Edit Artist" : "Add New Artist"}
            </h2>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px",
                padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#991b1b",
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              {/* Name */}
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Amara Wanjiku"
                />
              </div>

              {/* Role */}
              <div>
                <label style={labelStyle}>Role *</label>
                <input
                  style={inputStyle}
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Lead Nail Artist & Founder"
                />
              </div>

              {/* Title */}
              <div>
                <label style={labelStyle}>Title / Nickname</label>
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. The Visionary"
                />
              </div>

              {/* Specialty */}
              <div>
                <label style={labelStyle}>Specialty *</label>
                <input
                  style={inputStyle}
                  value={form.specialty}
                  onChange={e => setForm({ ...form, specialty: e.target.value })}
                  placeholder="e.g. Acrylic Sculpting & 3D Nail Art"
                />
              </div>

              {/* Years Experience */}
              <div>
                <label style={labelStyle}>Years Experience</label>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  value={form.years_experience}
                  onChange={e => setForm({ ...form, years_experience: Number(e.target.value) })}
                  placeholder="e.g. 5"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label style={labelStyle}>Photo URL</label>
                <input
                  style={inputStyle}
                  value={form.photo_url}
                  onChange={e => setForm({ ...form, photo_url: e.target.value })}
                  placeholder="https://... (leave empty for initials avatar)"
                />
              </div>

              {/* Services */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Services (comma separated)</label>
                <input
                  style={inputStyle}
                  value={form.services}
                  onChange={e => setForm({ ...form, services: e.target.value })}
                  placeholder="e.g. Gel Polish, Nail Art, Classic Manicure"
                />
                <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.4)", marginTop: "5px" }}>
                  Separate each service with a comma. These appear as tags on the artists page.
                </p>
              </div>

              {/* Bio */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Bio / Quote</label>
                <textarea
                  style={{ ...inputStyle, height: "90px", resize: "vertical" }}
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="A short bio or quote about this artist..."
                />
              </div>

              {/* Mobile Available */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="checkbox"
                  id="mobile_available"
                  checked={form.mobile_available}
                  onChange={e => setForm({ ...form, mobile_available: e.target.checked })}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="mobile_available" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>
                  Available for Mobile Service (+KES 1,000)
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: "#2D2424", border: "none", borderRadius: "2px",
                  padding: "10px 28px", cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#FDFBF7", fontWeight: 600, opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : editingArtist?.id ? "Update Artist" : "Save Artist"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: "none", border: "1px solid #E5E0D8", borderRadius: "2px",
                  padding: "10px 28px", cursor: "pointer", fontSize: "12px",
                  letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(45,36,36,0.5)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Artists List */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "30px",
          color: "#2D2424", fontWeight: 300, marginBottom: "24px",
        }}>
          All Artists ({artists.length})
        </h2>

        {loading ? (
          <p style={{ color: "rgba(45,36,36,0.4)", fontSize: "14px" }}>Loading artists...</p>
        ) : artists.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
            padding: "60px", textAlign: "center",
          }}>
            <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.4)", marginBottom: "20px" }}>
              No artists yet. Add your first artist!
            </p>
            <button
              type="button"
              onClick={handleAddNew}
              style={{
                background: "#C5A358", border: "none", borderRadius: "2px",
                padding: "10px 24px", cursor: "pointer", fontSize: "12px",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#2D2424", fontWeight: 600,
              }}
            >
              + Add Artist
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {artists.map(artist => (
              <div
                key={artist.id}
                style={{
                  background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
                  padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "#C5A358", flexShrink: 0, overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem",
                  fontWeight: 600, color: "#fff",
                }}>
                  {artist.photo_url ? (
                    <img src={artist.photo_url} alt={artist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    getInitials(artist.name)
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#2D2424" }}>{artist.name}</span>
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                      background: artist.mobile_available ? "#f0fdf4" : "#fafafa",
                      color: artist.mobile_available ? "#166534" : "rgba(45,36,36,0.4)",
                      border: `1px solid ${artist.mobile_available ? "#bbf7d0" : "#E5E0D8"}`,
                    }}>
                      {artist.mobile_available ? "📱 Mobile" : "In-Parlour Only"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#C5A358", marginBottom: "2px" }}>
                    {artist.role}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(45,36,36,0.5)" }}>
                    {artist.specialty} · {artist.years_experience} yrs experience
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(artist)}
                    style={{
                      background: "none", border: "1px solid #E5E0D8", borderRadius: "2px",
                      padding: "6px 16px", cursor: "pointer", fontSize: "11px",
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(artist.id!)}
                    disabled={deletingId === artist.id}
                    style={{
                      background: "none", border: "1px solid #fecaca", borderRadius: "2px",
                      padding: "6px 16px", cursor: "pointer", fontSize: "11px",
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "#991b1b",
                      opacity: deletingId === artist.id ? 0.5 : 1,
                    }}
                  >
                    {deletingId === artist.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}