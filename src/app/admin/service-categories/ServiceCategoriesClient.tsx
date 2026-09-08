"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";

interface ServiceCategory {
  id: number;
  name: string;
}

export default function ServiceCategoriesClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoverBack, setHoverBack] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/service-categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError("Please enter a category name.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await adminFetch("/api/admin/service-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("Category added!");
      setNewName("");
      fetchCategories();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(data.error || "Something went wrong. Category may already exist.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(
      `Delete "${name}"?\n\nServices using this category will keep it, but it won't appear in the dropdown when adding new services.`
    )) return;
    setDeletingId(id);
    const res = await adminFetch("/api/admin/service-categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("Category deleted!");
      fetchCategories();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(data.error || "Failed to delete category.");
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
            onClick={() => router.push("/admin/services")}
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
            <span style={{
              fontSize: "10px", letterSpacing: "0.2em",
              color: "rgba(253,251,247,0.5)", textTransform: "uppercase", marginLeft: "12px",
            }}>
              Service Categories
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "48px 40px" }}>

        {success && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px",
            padding: "12px 16px", marginBottom: "24px", fontSize: "13px", color: "#166534",
          }}>
            ✅ {success}
          </div>
        )}

        {/* Add New Category */}
        <div style={{
          background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
          padding: "32px", marginBottom: "40px",
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "26px",
            color: "#2D2424", fontWeight: 500, marginBottom: "6px",
          }}>
            Add New Service Category
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.45)", marginBottom: "24px" }}>
            These categories appear in the service form dropdown. They are separate from shop product categories.
          </p>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px",
              padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#991b1b",
            }}>
              ⚠️ {error}
            </div>
          )}

          <label style={labelStyle}>Category Name</label>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={newName}
              onChange={e => { setNewName(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Nail Art"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              style={{
                background: "#C5A358", border: "none", borderRadius: "2px",
                padding: "10px 24px", cursor: saving ? "not-allowed" : "pointer",
                fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#2D2424", fontWeight: 600, opacity: saving ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {saving ? "Adding..." : "+ Add"}
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.4)", marginTop: "8px" }}>
            Press Enter or click + Add to save
          </p>
        </div>

        {/* Categories List */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "30px",
          color: "#2D2424", fontWeight: 300, marginBottom: "24px",
        }}>
          All Service Categories ({categories.length})
        </h2>

        {loading ? (
          <p style={{ color: "rgba(45,36,36,0.4)", fontSize: "14px" }}>Loading categories...</p>
        ) : categories.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
            padding: "40px", textAlign: "center",
          }}>
            <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.4)" }}>
              No service categories yet. Add your first one above!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {categories.map(cat => (
              <div key={cat.id} style={{
                background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
                padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "#C5A358", flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "14px", color: "#2D2424", fontWeight: 500 }}>
                    {cat.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={deletingId === cat.id}
                  style={{
                    background: "none", border: "1px solid #fecaca", borderRadius: "2px",
                    padding: "5px 14px", cursor: "pointer", fontSize: "11px",
                    letterSpacing: "0.1em", textTransform: "uppercase", color: "#991b1b",
                    opacity: deletingId === cat.id ? 0.5 : 1,
                  }}
                >
                  {deletingId === cat.id ? "..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.3)", textAlign: "center", marginTop: "32px" }}>
          Deleting a category won&apos;t affect services already using it — it only removes it from the dropdown.
        </p>
      </div>
    </div>
  );
}