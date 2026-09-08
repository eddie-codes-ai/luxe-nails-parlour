"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";

interface GalleryImage {
  id?: number;
  title: string;
  category: string;
  image_url: string;
  alt_text: string;
  featured: boolean;
  position: number;
  design_group: string;
}

const emptyImage: GalleryImage = {
  title: "",
  category: "",
  image_url: "",
  alt_text: "",
  featured: false,
  position: 0,
  design_group: "",
};

const CATEGORIES = [
  "Gel Nails",
  "Acrylic Nails",
  "Nail Art",
  "Pedicure",
  "Ombre & Gradients",
  "French Tips",
];

export default function AdminGallery() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState<GalleryImage>(emptyImage);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoverBack, setHoverBack] = useState(false);
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/gallery");
    const data = await res.json();
    setImages(data.images || []);
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setForm(image);
    setPreviewUrl(image.image_url);
    setUploadMode(image.image_url.includes("supabase") ? "upload" : "url");
    setShowForm(true);
    setShowNewGroupInput(false);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNew = () => {
    setEditingImage(null);
    setForm(emptyImage);
    setPreviewUrl("");
    setShowForm(true);
    setShowNewGroupInput(false);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingImage(null);
    setForm(emptyImage);
    setPreviewUrl("");
    setShowNewGroupInput(false);
    setError("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await adminFetch("/api/admin/gallery", { method: "PATCH", body: formData });
    const data = await res.json();
    if (data.success) {
      setForm(prev => ({ ...prev, image_url: data.url }));
      setPreviewUrl(data.url);
    } else {
      setError("Image upload failed. Please try again.");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.category || !form.image_url) {
      setError("Please fill in Title, Category and add an Image.");
      return;
    }
    setSaving(true);
    setError("");
    const method = editingImage?.id ? "PUT" : "POST";
    const body = editingImage?.id ? { ...form, id: editingImage.id } : form;
    const res = await adminFetch("/api/admin/gallery", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(editingImage?.id ? "Photo updated!" : "Photo added!");
      setShowForm(false);
      setEditingImage(null);
      setForm(emptyImage);
      setPreviewUrl("");
      setShowNewGroupInput(false);
      fetchImages();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    setDeletingId(id);
    const res = await adminFetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, image_url: imageUrl }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("Photo deleted!");
      fetchImages();
      setTimeout(() => setSuccess(""), 3000);
    }
    setDeletingId(null);
  };

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

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232D2424' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "right 14px center" as const,
    paddingRight: "36px",
    cursor: "pointer",
  };

  // Get unique design groups from existing images
  const existingGroups = [...new Set(images.map(img => img.design_group).filter(Boolean))];

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
              Gallery
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
          + Add Photo
        </button>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 40px" }}>

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
              {editingImage?.id ? "Edit Photo" : "Add New Photo"}
            </h2>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px",
                padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#991b1b",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Upload Mode Toggle */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Image Source</label>
              <div style={{ display: "flex" }}>
                <button
                  type="button"
                  onClick={() => setUploadMode("upload")}
                  style={{
                    padding: "8px 20px", fontSize: "12px", cursor: "pointer",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    background: uploadMode === "upload" ? "#2D2424" : "#fff",
                    color: uploadMode === "upload" ? "#FDFBF7" : "rgba(45,36,36,0.5)",
                    border: "1px solid #E5E0D8", borderRadius: "2px 0 0 2px",
                  }}
                >
                  📎 Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  style={{
                    padding: "8px 20px", fontSize: "12px", cursor: "pointer",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    background: uploadMode === "url" ? "#2D2424" : "#fff",
                    color: uploadMode === "url" ? "#FDFBF7" : "rgba(45,36,36,0.5)",
                    border: "1px solid #E5E0D8", borderLeft: "none", borderRadius: "0 2px 2px 0",
                  }}
                >
                  🔗 Paste URL
                </button>
              </div>
            </div>

            {uploadMode === "upload" ? (
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Upload Image *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed #E5E0D8", borderRadius: "4px",
                    padding: "32px", textAlign: "center", cursor: "pointer",
                    background: "#FDFBF7",
                  }}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain", borderRadius: "4px" }} />
                  ) : (
                    <div>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
                      <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.4)", margin: 0 }}>
                        {uploading ? "Uploading..." : "Click to select a photo from your device"}
                      </p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                {previewUrl && !uploading && <p style={{ fontSize: "11px", color: "#166534", marginTop: "6px" }}>✅ Image uploaded successfully</p>}
                {uploading && <p style={{ fontSize: "11px", color: "#C5A358", marginTop: "6px" }}>⏳ Uploading image...</p>}
              </div>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Image URL *</label>
                <input
                  style={inputStyle}
                  value={form.image_url}
                  onChange={e => { setForm({ ...form, image_url: e.target.value }); setPreviewUrl(e.target.value); }}
                  placeholder="https://instagram.com/... or any image URL"
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" style={{ marginTop: "12px", maxHeight: "200px", maxWidth: "100%", objectFit: "contain", borderRadius: "4px" }} onError={() => setPreviewUrl("")} />
                )}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Title / Caption *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Pink Ombre Gel Set" />
              </div>

              <div>
                <label style={labelStyle}>Category *</label>
                <select style={selectStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* ── Design Group ── */}
              <div>
                <label style={labelStyle}>
                  Design Group <span style={{ color: "#C5A358" }}>(links photos together)</span>
                </label>

                {existingGroups.length > 0 && !showNewGroupInput ? (
                  /* Show dropdown when groups exist */
                  <select
                    style={selectStyle}
                    value={form.design_group ?? ""}
                    onChange={e => {
                      if (e.target.value === "__new__") {
                        setShowNewGroupInput(true);
                        setForm({ ...form, design_group: "" });
                      } else {
                        setForm({ ...form, design_group: e.target.value });
                      }
                    }}
                  >
                    <option value="">No group (standalone photo)</option>
                    {existingGroups.map(g => (
                      <option key={g} value={g}>🔗 {g}</option>
                    ))}
                    <option value="__new__">＋ Create new group...</option>
                  </select>
                ) : (
                  /* Show text input for new group */
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={form.design_group}
                      onChange={e => setForm({ ...form, design_group: e.target.value })}
                      placeholder="e.g. pink-ombre-set (no spaces)"
                      autoFocus
                    />
                    {existingGroups.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewGroupInput(false);
                          setForm({ ...form, design_group: "" });
                        }}
                        style={{
                          background: "none", border: "1px solid #E5E0D8", borderRadius: "2px",
                          padding: "8px 14px", cursor: "pointer", fontSize: "18px",
                          color: "rgba(45,36,36,0.5)", lineHeight: 1,
                        }}
                        title="Back to dropdown"
                      >
                        ←
                      </button>
                    )}
                  </div>
                )}

                {/* Status line below the field */}
                {form.design_group && !showNewGroupInput && (
                  <p style={{ fontSize: "11px", color: "#C5A358", marginTop: "5px" }}>
                    🔗 Linking to group: <strong>{form.design_group}</strong>
                  </p>
                )}
                {showNewGroupInput && (
                  <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.4)", marginTop: "5px" }}>
                    Type a name then save — it will appear in the dropdown next time
                  </p>
                )}
                {!form.design_group && !showNewGroupInput && (
                  <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.4)", marginTop: "5px" }}>
                    Photos in the same group appear together in the lightbox
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Alt Text (SEO)</label>
                <input style={inputStyle} value={form.alt_text} onChange={e => setForm({ ...form, alt_text: e.target.value })} placeholder="e.g. Pink gel nails Nairobi" />
              </div>

              <div>
                <label style={labelStyle}>Position (display order)</label>
                <input style={inputStyle} type="number" value={form.position} onChange={e => setForm({ ...form, position: Number(e.target.value) })} placeholder="e.g. 1" />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                <label htmlFor="featured" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>Featured (show on homepage)</label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                style={{
                  background: "#2D2424", border: "none", borderRadius: "2px",
                  padding: "10px 28px", cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#FDFBF7", fontWeight: 600, opacity: saving || uploading ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : editingImage?.id ? "Update Photo" : "Save Photo"}
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

        {/* Gallery Grid */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "30px", color: "#2D2424", fontWeight: 300, marginBottom: "24px" }}>
          All Photos ({images.length})
        </h2>

        {loading ? (
          <p style={{ color: "rgba(45,36,36,0.4)", fontSize: "14px" }}>Loading gallery...</p>
        ) : images.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px", padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.4)", marginBottom: "20px" }}>No photos yet. Add your first photo!</p>
            <button type="button" onClick={handleAddNew} style={{ background: "#C5A358", border: "none", borderRadius: "2px", padding: "10px 24px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424", fontWeight: 600 }}>
              + Add Photo
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {images.map(image => (
              <div key={image.id} style={{ background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ position: "relative", paddingTop: "100%", background: "#E5E0D8" }}>
                  {image.image_url ? (
                    <img src={image.image_url} alt={image.alt_text || image.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>🖼️</div>
                  )}
                  {image.featured && (
                    <div style={{ position: "absolute", top: "8px", right: "8px", background: "#C5A358", color: "#2D2424", fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>
                      ⭐ Featured
                    </div>
                  )}
                  {image.design_group && (
                    <div style={{ position: "absolute", bottom: "8px", left: "8px", background: "rgba(45,36,36,0.75)", color: "#C5A358", fontSize: "10px", padding: "2px 8px", borderRadius: "20px" }}>
                      🔗 {image.design_group}
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px 16px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#2D2424", margin: "0 0 2px" }}>{image.title}</p>
                  <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.5)", margin: "0 0 10px" }}>{image.category}</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={() => handleEdit(image)} style={{ flex: 1, background: "none", border: "1px solid #E5E0D8", borderRadius: "2px", padding: "6px", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424" }}>Edit</button>
                    <button type="button" onClick={() => handleDelete(image.id!, image.image_url)} disabled={deletingId === image.id} style={{ flex: 1, background: "none", border: "1px solid #fecaca", borderRadius: "2px", padding: "6px", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#991b1b", opacity: deletingId === image.id ? 0.5 : 1 }}>
                      {deletingId === image.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}