"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";

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
  buffer_minutes: number;
  unavailable_since?: string | null;
}

const emptyArtist: Artist = {
  name: "", role: "", title: "", bio: "", specialty: "",
  years_experience: 0, services: "", mobile_available: false,
  photo_url: "", buffer_minutes: 10,
};

export default function ArtistsClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [form, setForm] = useState<Artist>(emptyArtist);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoverBack, setHoverBack] = useState(false);
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchArtists = async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/artists");
    const data = await res.json();
    setArtists(data.artists || []);
    setLoading(false);
  };

  useEffect(() => { fetchArtists(); }, []);

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setForm({ ...artist, buffer_minutes: artist.buffer_minutes ?? 10 });
    setPreviewUrl(artist.photo_url || "");
    setUploadMode(artist.photo_url?.includes("supabase") ? "upload" : "url");
    setShowForm(true); setError(""); setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNew = () => {
    setEditingArtist(null); setForm(emptyArtist); setPreviewUrl("");
    setUploadMode("upload"); setShowForm(true); setError(""); setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false); setEditingArtist(null); setForm(emptyArtist);
    setPreviewUrl(""); setError("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await adminFetch("/api/admin/gallery", { method: "PATCH", body: fd });
    const data = await res.json();
    if (data.success) { setForm(prev => ({ ...prev, photo_url: data.url })); setPreviewUrl(data.url); }
    else setError("Image upload failed. Please try again.");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.role || !form.specialty) { setError("Please fill in Name, Role and Specialty."); return; }
    setSaving(true); setError("");
    const method = editingArtist?.id ? "PUT" : "POST";
    const body = editingArtist?.id ? { ...form, id: editingArtist.id } : form;
    const res = await adminFetch("/api/admin/artists", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) {
      setSuccess(editingArtist?.id ? "Artist updated!" : "Artist added!");
      setShowForm(false); setEditingArtist(null); setForm(emptyArtist); setPreviewUrl("");
      fetchArtists(); setTimeout(() => setSuccess(""), 3000);
    } else setError("Something went wrong. Please try again.");
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this artist?")) return;
    setDeletingId(id);
    const res = await adminFetch("/api/admin/artists", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (data.success) { setSuccess("Artist deleted!"); fetchArtists(); setTimeout(() => setSuccess(""), 3000); }
    setDeletingId(null);
  };

  // Out on a house call: blocks new bookings for the rest of today only.
  const toggleAvailability = async (artist: Artist) => {
    if (!artist.id) return;
    setTogglingId(artist.id);
    setError("");
    const res = await adminFetch("/api/admin/artists/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: artist.id, out: !isOutToday(artist) }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(data.out ? `${artist.name} marked out on a house call` : `${artist.name} is back at work`);
      fetchArtists();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(data.error ?? "Could not update availability.");
    }
    setTogglingId(null);
  };

  // Mirrors lib/artist-availability: only today counts, so a forgotten
  // toggle clears itself overnight.
  const isOutToday = (artist: Artist) => {
    if (!artist.unavailable_since) return false;
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    return fmt(new Date(artist.unavailable_since)) === fmt(new Date());
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

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
      <div style={{ background: "#2D2424", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button type="button" onClick={() => router.push("/admin")}
            onMouseEnter={() => setHoverBack(true)} onMouseLeave={() => setHoverBack(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: hoverBack ? "#C5A358" : "rgba(253,251,247,0.5)", fontSize: "20px", transition: "color 0.2s", padding: 0 }}>
            ←
          </button>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#C5A358" }}>Luxe Nails</span>
            <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(253,251,247,0.5)", textTransform: "uppercase", marginLeft: "12px" }}>Artists</span>
          </div>
        </div>
        <button type="button" onClick={handleAddNew}
          style={{ background: "#C5A358", border: "none", borderRadius: "2px", padding: "8px 20px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424", fontWeight: 600 }}>
          + Add Artist
        </button>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 40px" }}>
        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px", padding: "12px 16px", marginBottom: "24px", fontSize: "13px", color: "#166534" }}>
            ✅ {success}
          </div>
        )}

        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px", padding: "36px", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#2D2424", fontWeight: 500, marginBottom: "28px" }}>
              {editingArtist?.id ? "Edit Artist" : "Add New Artist"}
            </h2>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#991b1b" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Photo */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Artist Photo</label>
              <div style={{ display: "flex", marginBottom: "12px" }}>
                {(["upload", "url"] as const).map((mode, i) => (
                  <button key={mode} type="button" onClick={() => setUploadMode(mode)}
                    style={{ padding: "8px 20px", fontSize: "12px", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", background: uploadMode === mode ? "#2D2424" : "#fff", color: uploadMode === mode ? "#FDFBF7" : "rgba(45,36,36,0.5)", border: "1px solid #E5E0D8", borderLeft: i > 0 ? "none" : undefined, borderRadius: i === 0 ? "2px 0 0 2px" : "0 2px 2px 0" }}>
                    {mode === "upload" ? "📁 Upload from Device" : "🔗 Paste URL"}
                  </button>
                ))}
              </div>
              {uploadMode === "upload" ? (
                <div>
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{ border: "2px dashed #E5E0D8", borderRadius: "4px", padding: "32px", textAlign: "center", cursor: "pointer", background: "#FDFBF7" }}>
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "cover", borderRadius: "50%", width: "160px", height: "160px", margin: "0 auto", display: "block" }} />
                    ) : (
                      <div><div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
                        <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.4)", margin: 0 }}>{uploading ? "Uploading..." : "Click to select a photo"}</p></div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                  {previewUrl && !uploading && <p style={{ fontSize: "11px", color: "#166534", marginTop: "6px" }}>✅ Photo uploaded</p>}
                  {uploading && <p style={{ fontSize: "11px", color: "#C5A358", marginTop: "6px" }}>⏳ Uploading...</p>}
                </div>
              ) : (
                <div>
                  <input style={inputStyle} value={form.photo_url}
                    onChange={e => { setForm({ ...form, photo_url: e.target.value }); setPreviewUrl(e.target.value); }}
                    placeholder="https://... paste image URL here" />
                  {previewUrl && <img src={previewUrl} alt="Preview" style={{ marginTop: "12px", width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%", border: "3px solid #C5A358" }} onError={() => setPreviewUrl("")} />}
                </div>
              )}
            </div>

            {/* Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amara Wanjiku" />
              </div>
              <div>
                <label style={labelStyle}>Role *</label>
                <input style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Lead Nail Artist & Founder" />
              </div>
              <div>
                <label style={labelStyle}>Title / Nickname</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. The Visionary" />
              </div>
              <div>
                <label style={labelStyle}>Specialty *</label>
                <input style={inputStyle} value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="e.g. Acrylic Sculpting & 3D Nail Art" />
              </div>
              <div>
                <label style={labelStyle}>Years Experience</label>
                <input style={inputStyle} type="number" min={0} value={form.years_experience}
                  onChange={e => setForm({ ...form, years_experience: Number(e.target.value) })} placeholder="e.g. 5" />
              </div>

              {/* ── Buffer minutes — NEW FIELD ── */}
              <div>
                <label style={labelStyle}>Buffer Time (minutes)</label>
                <input style={inputStyle} type="number" min={0} max={60} value={form.buffer_minutes}
                  onChange={e => setForm({ ...form, buffer_minutes: Number(e.target.value) })} placeholder="e.g. 10" />
                <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.4)", marginTop: "4px" }}>
                  Wrap-up time after each appointment. Invisible to customers.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "24px" }}>
                <input type="checkbox" id="mobile_available" checked={form.mobile_available}
                  onChange={e => setForm({ ...form, mobile_available: e.target.checked })}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                <label htmlFor="mobile_available" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>
                  Available for Mobile Service (+KES 1,000)
                </label>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Services (comma separated)</label>
                <input style={inputStyle} value={form.services} onChange={e => setForm({ ...form, services: e.target.value })} placeholder="e.g. Gel Polish, Nail Art, Classic Manicure" />
                <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.4)", marginTop: "5px" }}>Separate each service with a comma.</p>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Bio / Quote</label>
                <textarea style={{ ...inputStyle, height: "90px", resize: "vertical" }} value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="A short bio or quote about this artist..." />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button type="button" onClick={handleSave} disabled={saving || uploading}
                style={{ background: "#2D2424", border: "none", borderRadius: "2px", padding: "10px 28px", cursor: saving ? "not-allowed" : "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FDFBF7", fontWeight: 600, opacity: saving || uploading ? 0.6 : 1 }}>
                {saving ? "Saving..." : editingArtist?.id ? "Update Artist" : "Save Artist"}
              </button>
              <button type="button" onClick={handleCancel}
                style={{ background: "none", border: "1px solid #E5E0D8", borderRadius: "2px", padding: "10px 28px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(45,36,36,0.5)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "30px", color: "#2D2424", fontWeight: 300, marginBottom: "24px" }}>
          All Artists ({artists.length})
        </h2>

        {loading ? (
          <p style={{ color: "rgba(45,36,36,0.4)", fontSize: "14px" }}>Loading artists...</p>
        ) : artists.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px", padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.4)", marginBottom: "20px" }}>No artists yet.</p>
            <button type="button" onClick={handleAddNew}
              style={{ background: "#C5A358", border: "none", borderRadius: "2px", padding: "10px 24px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424", fontWeight: 600 }}>
              + Add Artist
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {artists.map(artist => (
              <div key={artist.id}
                style={{ background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#C5A358", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                  {artist.photo_url ? <img src={artist.photo_url} alt={artist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getInitials(artist.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#2D2424" }}>{artist.name}</span>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: artist.mobile_available ? "#f0fdf4" : "#fafafa", color: artist.mobile_available ? "#166534" : "rgba(45,36,36,0.4)", border: `1px solid ${artist.mobile_available ? "#bbf7d0" : "#E5E0D8"}` }}>
                      {artist.mobile_available ? "📱 Mobile" : "In-Parlour Only"}
                    </span>
                    {isOutToday(artist) && (
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#FFF4E5", color: "#8A5A00", border: "1px solid #F0D9A8" }}>
                        🚗 Out today
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "#C5A358", marginBottom: "2px" }}>{artist.role}</div>
                  <div style={{ fontSize: "12px", color: "rgba(45,36,36,0.5)" }}>
                    {artist.specialty} · {artist.years_experience} yrs · {artist.buffer_minutes ?? 10} min buffer
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => toggleAvailability(artist)} disabled={togglingId === artist.id}
                    title={isOutToday(artist) ? "Make bookable again" : "Block new bookings for the rest of today"}
                    style={{ background: isOutToday(artist) ? "#166534" : "none", border: `1px solid ${isOutToday(artist) ? "#166534" : "#E5E0D8"}`, borderRadius: "2px", padding: "6px 12px", cursor: togglingId === artist.id ? "wait" : "pointer", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: isOutToday(artist) ? "#fff" : "rgba(45,36,36,0.6)", whiteSpace: "nowrap" }}>
                    {togglingId === artist.id ? "…" : isOutToday(artist) ? "Back at work" : "Out on call"}
                  </button>
                  <button type="button" onClick={() => handleEdit(artist)}
                    style={{ background: "none", border: "1px solid #E5E0D8", borderRadius: "2px", padding: "6px 16px", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424" }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(artist.id!)} disabled={deletingId === artist.id}
                    style={{ background: "none", border: "1px solid #fecaca", borderRadius: "2px", padding: "6px 16px", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#991b1b", opacity: deletingId === artist.id ? 0.5 : 1 }}>
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