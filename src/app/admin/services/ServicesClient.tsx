"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceCategory {
  id: number;
  name: string;
}

interface AddOn {
  name: string;
  price: number;
}

interface Service {
  id?: string;
  name: string;
  tagline: string;
  tag: string;
  tag_color: string;
  description: string;
  base_price: number;
  duration_minutes: number;
  category: string;
  house_call_available: boolean;
  is_active: boolean;
  includes: string[];
  add_ons: AddOn[];
}

const emptyService: Service = {
  name: "",
  tagline: "",
  tag: "",
  tag_color: "#C5A358",
  description: "",
  base_price: 0,
  duration_minutes: 60,
  category: "",
  house_call_available: true,
  is_active: true,
  includes: [],
  add_ons: [],
};

// ─── Style tokens ─────────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  fontSize: "13px",
  border: "1px solid #E5E0D8",
  borderRadius: "2px",
  fontFamily: "'Jost', sans-serif",
  background: "#FDFBF7",
  color: "#2D2424",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  fontSize: "11px",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "rgba(45,36,36,0.5)",
  marginBottom: "6px",
  display: "block",
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

const smallBtnStyle = {
  background: "none",
  border: "1px solid #E5E0D8",
  borderRadius: "2px",
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "11px",
  fontFamily: "'Jost', sans-serif",
  color: "rgba(45,36,36,0.5)",
  letterSpacing: "0.08em",
};

const sectionDivider = {
  gridColumn: "1 / -1" as const,
  borderTop: "1px solid #E5E0D8",
  paddingTop: "20px",
  marginTop: "4px",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ServicesClient() {
  const router = useRouter();

  const [services,          setServices]         = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories]= useState<ServiceCategory[]>([]);
  const [loading,           setLoading]          = useState(true);
  const [showForm,          setShowForm]         = useState(false);
  const [editingService,    setEditing]          = useState<Service | null>(null);
  const [form,              setForm]             = useState<Service>(emptyService);
  const [saving,            setSaving]           = useState(false);
  const [deletingId,        setDeletingId]       = useState<string | null>(null);
  const [togglingId,        setTogglingId]       = useState<string | null>(null);
  const [error,             setError]            = useState("");
  const [success,           setSuccess]          = useState("");
  const [hoverBack,         setHoverBack]        = useState(false);
  const [filterActive,      setFilterActive]     = useState<"all" | "active" | "inactive">("all");

  // ── includes helpers ────────────────────────────────────────────────────────

  const addInclude    = () => setForm(f => ({ ...f, includes: [...f.includes, ""] }));
  const updateInclude = (i: number, val: string) =>
    setForm(f => { const a = [...f.includes]; a[i] = val; return { ...f, includes: a }; });
  const removeInclude = (i: number) =>
    setForm(f => ({ ...f, includes: f.includes.filter((_, idx) => idx !== i) }));

  // ── add_ons helpers ─────────────────────────────────────────────────────────

  const addAddOn    = () => setForm(f => ({ ...f, add_ons: [...f.add_ons, { name: "", price: 0 }] }));
  const updateAddOn = (i: number, field: keyof AddOn, val: string | number) =>
    setForm(f => {
      const a = [...f.add_ons];
      a[i] = { ...a[i], [field]: field === "price" ? Number(val) : val };
      return { ...f, add_ons: a };
    });
  const removeAddOn = (i: number) =>
    setForm(f => ({ ...f, add_ons: f.add_ons.filter((_, idx) => idx !== i) }));

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchServices = async () => {
    setLoading(true);
    const res  = await adminFetch("/api/admin/services");
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  };

  const fetchServiceCategories = async () => {
    const res  = await adminFetch("/api/admin/service-categories");
    const data = await res.json();
    setServiceCategories(data.categories || []);
  };

  useEffect(() => { fetchServices(); fetchServiceCategories(); }, []);

  // ── Form helpers ─────────────────────────────────────────────────────────────

  const handleAddNew = () => {
    setEditing(null);
    setForm(emptyService);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (service: Service) => {
    setEditing(service);
    setForm({
      ...service,
      base_price:       Number(service.base_price),
      duration_minutes: Number(service.duration_minutes),
      category:         service.category  ?? "",
      tagline:          service.tagline   ?? "",
      tag:              service.tag       ?? "",
      tag_color:        service.tag_color ?? "#C5A358",
      includes:         Array.isArray(service.includes) ? service.includes : [],
      add_ons:          Array.isArray(service.add_ons)  ? service.add_ons  : [],
    });
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyService);
    setError("");
  };

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim())                                    { setError("Service name is required.");      return; }
    if (!form.base_price || form.base_price <= 0)             { setError("Please enter a valid price.");    return; }
    if (!form.duration_minutes || form.duration_minutes <= 0) { setError("Please enter a valid duration."); return; }
    if (!form.category)                                       { setError("Please select a category.");      return; }

    const cleanedForm = {
      ...form,
      includes: form.includes.filter(s => s.trim() !== ""),
      add_ons:  form.add_ons.filter(a => a.name.trim() !== ""),
      tag:      form.tag.trim() || null,
      tag_color:form.tag.trim() ? form.tag_color : null,
    };

    setSaving(true);
    setError("");

    const method = editingService?.id ? "PUT" : "POST";
    const body   = editingService?.id ? { ...cleanedForm, id: editingService.id } : cleanedForm;

    const res  = await adminFetch("/api/admin/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      setSuccess(editingService?.id ? "Service updated!" : "Service added!");
      setShowForm(false);
      setEditing(null);
      setForm(emptyService);
      fetchServices();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(data.error || "Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?\n\nExisting bookings will keep their service name, but this service will no longer appear in the booking form.`)) return;
    setDeletingId(id);
    const res  = await adminFetch("/api/admin/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) { setSuccess("Service deleted!"); fetchServices(); setTimeout(() => setSuccess(""), 3000); }
    else { setError(data.error || "Failed to delete service."); }
    setDeletingId(null);
  };

  // ── Toggle active ─────────────────────────────────────────────────────────────

  const handleToggleActive = async (service: Service) => {
    if (!service.id) return;
    setTogglingId(service.id);
    const res  = await adminFetch("/api/admin/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...service, id: service.id, is_active: !service.is_active }),
    });
    const data = await res.json();
    if (data.success) { fetchServices(); }
    else { setError("Failed to update service status."); }
    setTogglingId(null);
  };

  // ── Filtered list ────────────────────────────────────────────────────────────

  const filtered      = services.filter(s => filterActive === "all" ? true : filterActive === "active" ? s.is_active : !s.is_active);
  const activeCount   = services.filter(s => s.is_active).length;
  const inactiveCount = services.filter(s => !s.is_active).length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#FDFBF7", fontFamily: "'Jost', sans-serif" }}>

      {/* ── Top Bar ── */}
      <div style={{ background: "#2D2424", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            onMouseEnter={() => setHoverBack(true)}
            onMouseLeave={() => setHoverBack(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: hoverBack ? "#C5A358" : "rgba(253,251,247,0.5)", fontSize: "20px", transition: "color 0.2s", padding: 0 }}
          >←</button>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#C5A358" }}>Luxe Nails</span>
            <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(253,251,247,0.5)", textTransform: "uppercase", marginLeft: "12px" }}>Services</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button type="button" onClick={() => router.push("/admin/service-categories")}
            style={{ background: "none", border: "1px solid rgba(197,163,88,0.4)", borderRadius: "2px", padding: "8px 20px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C5A358", fontWeight: 500 }}>
            Manage Categories
          </button>
          <button type="button" onClick={handleAddNew}
            style={{ background: "#C5A358", border: "none", borderRadius: "2px", padding: "8px 20px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424", fontWeight: 600 }}>
            + Add Service
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 40px" }}>

        {/* ── Success banner ── */}
        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px", padding: "12px 16px", marginBottom: "24px", fontSize: "13px", color: "#166534" }}>
            ✅ {success}
          </div>
        )}

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px", padding: "36px", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#2D2424", fontWeight: 500, marginBottom: "6px" }}>
              {editingService?.id ? "Edit Service" : "Add New Service"}
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(45,36,36,0.45)", marginBottom: "28px" }}>
              Services appear in the customer booking form and the public services page.
            </p>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#991b1b" }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              {/* Name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Service Name *</label>
                <input style={inputStyle} value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); setError(""); }}
                  placeholder="e.g. Classic Gel Manicure" />
              </div>

              {/* Tagline */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Tagline <span style={{ opacity: 0.4 }}>(short italic subtitle shown on card)</span></label>
                <input style={inputStyle} value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Timeless elegance for every occasion" />
              </div>

              {/* Tag label */}
              <div>
                <label style={labelStyle}>Badge Label <span style={{ opacity: 0.4 }}>(e.g. Most Popular)</span></label>
                <input style={inputStyle} value={form.tag}
                  onChange={e => setForm({ ...form, tag: e.target.value })}
                  placeholder="e.g. Most Popular, Signature, New" />
                <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.4)", marginTop: "5px" }}>
                  Leave blank to show no badge on this card.
                </p>
              </div>

              {/* Tag colour */}
              <div>
                <label style={labelStyle}>Badge Colour</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {/* Preset swatches */}
                  {[
                    { color: "#C5A358", label: "Gold"    },
                    { color: "#2D2424", label: "Espresso"},
                    { color: "#4a3535", label: "Dark"    },
                  ].map(s => (
                    <button
                      key={s.color}
                      type="button"
                      title={s.label}
                      onClick={() => setForm({ ...form, tag_color: s.color })}
                      style={{
                        width: "28px", height: "28px", borderRadius: "2px",
                        backgroundColor: s.color, cursor: "pointer", flexShrink: 0,
                        border: form.tag_color === s.color ? "2px solid #2D2424" : "2px solid transparent",
                        transition: "border 0.15s",
                      }}
                    />
                  ))}
                  {/* Custom hex input */}
                  <input
                    style={{ ...inputStyle, flex: 1, fontFamily: "monospace" }}
                    value={form.tag_color}
                    onChange={e => setForm({ ...form, tag_color: e.target.value })}
                    placeholder="#C5A358"
                  />
                  {/* Live preview */}
                  {form.tag && (
                    <div style={{
                      backgroundColor: form.tag_color,
                      color: form.tag_color === "#2D2424" || form.tag_color === "#4a3535" ? "#FDFBF7" : "#2D2424",
                      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em",
                      textTransform: "uppercase", padding: "4px 10px", whiteSpace: "nowrap",
                    }}>
                      {form.tag || "Preview"}
                    </div>
                  )}
                </div>
              </div>

              {/* Base price */}
              <div>
                <label style={labelStyle}>Base Price (KES) *</label>
                <input style={inputStyle} type="number" min="0"
                  value={form.base_price || ""}
                  onChange={e => { setForm({ ...form, base_price: Number(e.target.value) }); setError(""); }}
                  placeholder="e.g. 1500" />
              </div>

              {/* Duration */}
              <div>
                <label style={labelStyle}>Duration (minutes) *</label>
                <input style={inputStyle} type="number" min="15" step="15"
                  value={form.duration_minutes || ""}
                  onChange={e => { setForm({ ...form, duration_minutes: Number(e.target.value) }); setError(""); }}
                  placeholder="e.g. 60" />
                {form.duration_minutes > 0 && (
                  <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.4)", marginTop: "5px" }}>
                    = {formatDuration(form.duration_minutes)} · used to block slots in the booking calendar
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>Category *</label>
                <select style={selectStyle} value={form.category}
                  onChange={e => { setForm({ ...form, category: e.target.value }); setError(""); }}>
                  <option value="">Select a category...</option>
                  {serviceCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {serviceCategories.length === 0 && (
                  <p style={{ fontSize: "11px", color: "#991b1b", marginTop: "5px" }}>
                    No categories yet.{" "}
                    <span onClick={() => router.push("/admin/service-categories")} style={{ color: "#C5A358", cursor: "pointer", textDecoration: "underline" }}>
                      Add some first
                    </span>
                  </p>
                )}
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input type="checkbox" id="is_active" checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#C5A358" }} />
                  <label htmlFor="is_active" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>Active (visible in booking form)</label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input type="checkbox" id="house_call_available" checked={form.house_call_available}
                    onChange={e => setForm({ ...form, house_call_available: e.target.checked })}
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#C5A358" }} />
                  <label htmlFor="house_call_available" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>Available for house calls 🚗</label>
                </div>
              </div>

              {/* Description */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description shown to customers during booking..." />
              </div>

              {/* ── What's Included ── */}
              <div style={{ ...sectionDivider }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <label style={{ ...labelStyle, margin: 0 }}>What's Included</label>
                  <button type="button" onClick={addInclude} style={{ ...smallBtnStyle, color: "#C5A358", borderColor: "rgba(197,163,88,0.4)" }}>
                    + Add Item
                  </button>
                </div>
                {form.includes.length === 0 && (
                  <p style={{ fontSize: "12px", color: "rgba(45,36,36,0.3)", fontStyle: "italic" }}>
                    No items yet — click "+ Add Item" to list what's included.
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {form.includes.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ color: "#C5A358", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>✓</span>
                      <input style={{ ...inputStyle, flex: 1 }} value={item}
                        onChange={e => updateInclude(i, e.target.value)}
                        placeholder="e.g. Nail shaping & filing" />
                      <button type="button" onClick={() => removeInclude(i)}
                        style={{ ...smallBtnStyle, color: "#991b1b", borderColor: "#fecaca", flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Optional Add-ons ── */}
              <div style={{ ...sectionDivider }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <label style={{ ...labelStyle, margin: 0 }}>Optional Add-ons</label>
                  <button type="button" onClick={addAddOn} style={{ ...smallBtnStyle, color: "#C5A358", borderColor: "rgba(197,163,88,0.4)" }}>
                    + Add Add-on
                  </button>
                </div>
                {form.add_ons.length === 0 && (
                  <p style={{ fontSize: "12px", color: "rgba(45,36,36,0.3)", fontStyle: "italic" }}>
                    No add-ons yet — click "+ Add Add-on" to offer optional upgrades.
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {form.add_ons.map((addon, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input style={{ ...inputStyle, flex: 2 }} value={addon.name}
                        onChange={e => updateAddOn(i, "name", e.target.value)}
                        placeholder="e.g. Gel Polish Upgrade" />
                      <div style={{ position: "relative", flex: 1 }}>
                        <input style={{ ...inputStyle, paddingRight: "44px" }} type="number" min="0"
                          value={addon.price || ""}
                          onChange={e => updateAddOn(i, "price", e.target.value)}
                          placeholder="400" />
                        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "rgba(45,36,36,0.35)", pointerEvents: "none" }}>
                          KES
                        </span>
                      </div>
                      <button type="button" onClick={() => removeAddOn(i)}
                        style={{ ...smallBtnStyle, color: "#991b1b", borderColor: "#fecaca", flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>{/* end grid */}

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button type="button" onClick={handleSave} disabled={saving}
                style={{ background: "#2D2424", border: "none", borderRadius: "2px", padding: "10px 28px", cursor: saving ? "not-allowed" : "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FDFBF7", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : editingService?.id ? "Update Service" : "Save Service"}
              </button>
              <button type="button" onClick={handleCancel}
                style={{ background: "none", border: "1px solid #E5E0D8", borderRadius: "2px", padding: "10px 28px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(45,36,36,0.5)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Filter tabs + heading ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "30px", color: "#2D2424", fontWeight: 300, margin: 0 }}>
            All Services ({services.length})
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {([
              { key: "all",      label: `All (${services.length})` },
              { key: "active",   label: `Active (${activeCount})` },
              { key: "inactive", label: `Inactive (${inactiveCount})` },
            ] as const).map(f => (
              <button key={f.key} type="button" onClick={() => setFilterActive(f.key)}
                style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: filterActive === f.key ? 600 : 400, background: filterActive === f.key ? "#2D2424" : "#fff", color: filterActive === f.key ? "#FDFBF7" : "rgba(45,36,36,0.5)", border: `1px solid ${filterActive === f.key ? "#2D2424" : "#E5E0D8"}`, transition: "all 0.15s" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Services list ── */}
        {loading ? (
          <p style={{ color: "rgba(45,36,36,0.4)", fontSize: "14px" }}>Loading services...</p>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px", padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.4)", marginBottom: "20px" }}>
              {services.length === 0 ? "No services yet. Add your first service!" : "No services match this filter."}
            </p>
            {services.length === 0 && (
              <button type="button" onClick={handleAddNew}
                style={{ background: "#C5A358", border: "none", borderRadius: "2px", padding: "10px 24px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424", fontWeight: 600 }}>
                + Add Service
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(service => (
              <div key={service.id}
                style={{ background: "#fff", border: "1px solid #E5E0D8", borderLeft: `3px solid ${service.is_active ? "#C5A358" : "#E5E0D8"}`, borderRadius: "4px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px", opacity: service.is_active ? 1 : 0.65, transition: "opacity 0.2s" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#2D2424" }}>{service.name}</span>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: service.is_active ? "#f0fdf4" : "#fef2f2", color: service.is_active ? "#166534" : "#991b1b", border: `1px solid ${service.is_active ? "#bbf7d0" : "#fecaca"}` }}>
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                    {service.tag && (
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: service.tag_color || "#C5A358", color: service.tag_color === "#2D2424" ? "#FDFBF7" : "#2D2424", fontWeight: 700 }}>
                        {service.tag}
                      </span>
                    )}
                    {service.category && (
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#FDF8EE", color: "#8A6F2E", border: "1px solid #E8D9B0" }}>
                        {service.category}
                      </span>
                    )}
                    {service.house_call_available && (
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#EFF7FF", color: "#2563A8", border: "1px solid #BFDBFE" }}>
                        🚗 House calls
                      </span>
                    )}
                    {Array.isArray(service.includes) && service.includes.length > 0 && (
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#F5F3FF", color: "#5B21B6", border: "1px solid #DDD6FE" }}>
                        {service.includes.length} included
                      </span>
                    )}
                    {Array.isArray(service.add_ons) && service.add_ons.length > 0 && (
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>
                        {service.add_ons.length} add-on{service.add_ons.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(45,36,36,0.5)" }}>
                    KES {Number(service.base_price).toLocaleString()}
                    <span style={{ margin: "0 6px", opacity: 0.3 }}>·</span>
                    {formatDuration(service.duration_minutes)}
                    {service.tagline && <span style={{ margin: "0 6px", opacity: 0.3 }}>·</span>}
                    {service.tagline && <span style={{ fontStyle: "italic" }}>{service.tagline}</span>}
                  </div>
                  {service.description && (
                    <div style={{ fontSize: "12px", color: "rgba(45,36,36,0.4)", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "520px" }}>
                      {service.description}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button type="button" onClick={() => handleToggleActive(service)} disabled={togglingId === service.id}
                    title={service.is_active ? "Hide from booking form" : "Show in booking form"}
                    style={{ background: "none", border: `1px solid ${service.is_active ? "#E5E0D8" : "#bbf7d0"}`, borderRadius: "2px", padding: "6px 14px", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: service.is_active ? "rgba(45,36,36,0.4)" : "#166534", opacity: togglingId === service.id ? 0.5 : 1 }}>
                    {togglingId === service.id ? "..." : service.is_active ? "Hide" : "Show"}
                  </button>
                  <button type="button" onClick={() => handleEdit(service)}
                    style={{ background: "none", border: "1px solid #E5E0D8", borderRadius: "2px", padding: "6px 16px", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D2424" }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(service.id!, service.name)} disabled={deletingId === service.id}
                    style={{ background: "none", border: "1px solid #fecaca", borderRadius: "2px", padding: "6px 16px", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#991b1b", opacity: deletingId === service.id ? 0.5 : 1 }}>
                    {deletingId === service.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {services.length > 0 && (
          <p style={{ fontSize: "11px", color: "rgba(45,36,36,0.3)", textAlign: "center", marginTop: "32px" }}>
            Only <strong>Active</strong> services appear in the customer booking form.
            Use <strong>Hide / Show</strong> to toggle without deleting.
          </p>
        )}
      </div>
    </div>
  );
}