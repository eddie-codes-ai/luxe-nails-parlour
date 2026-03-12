"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stock_quantity: number;
  in_stock: boolean;
  category: string;
}

const emptyProduct: Product = {
  name: "",
  price: 0,
  description: "",
  image_url: "",
  stock_quantity: 0,
  in_stock: true,
  category: "",
};

const CATEGORIES = [
  "Nail Polish",
  "Nail Tools",
  "Nail Kits",
  "Nail Art",
  "Treatments & Care",
  "Accessories",
];

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoverBack, setHoverBack] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm(product);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyProduct);
    setError("");
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      setError("Please fill in Name, Price and Category.");
      return;
    }
    setSaving(true);
    setError("");

    const method = editingProduct?.id ? "PUT" : "POST";
    const body = editingProduct?.id ? { ...form, id: editingProduct.id } : form;

    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.success) {
      setSuccess(editingProduct?.id ? "Product updated!" : "Product added!");
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyProduct);
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError("Something went wrong. Please try again.");
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("Product deleted!");
      fetchProducts();
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
              Shop Products
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
          + Add Product
        </button>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 40px" }}>

        {/* Success message */}
        {success && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px",
            padding: "12px 16px", marginBottom: "24px",
            fontSize: "13px", color: "#166534",
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
              {editingProduct?.id ? "Edit Product" : "Add New Product"}
            </h2>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px",
                padding: "12px 16px", marginBottom: "20px",
                fontSize: "13px", color: "#991b1b",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Form Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              <div>
                <label style={labelStyle}>Product Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Gel Nail Polish"
                />
              </div>

              <div>
                <label style={labelStyle}>Price (KES) *</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="e.g. 1500"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232D2424' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: "36px",
                    cursor: "pointer",
                  }}
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Stock Quantity</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.stock_quantity}
                  onChange={e => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                  placeholder="e.g. 10"
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Image URL</label>
                <input
                  style={inputStyle}
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, height: "90px", resize: "vertical" }}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief product description..."
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="checkbox"
                  id="in_stock"
                  checked={form.in_stock}
                  onChange={e => setForm({ ...form, in_stock: e.target.checked })}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="in_stock" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>
                  In Stock
                </label>
              </div>

            </div>

            {/* Form Buttons */}
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
                {saving ? "Saving..." : editingProduct?.id ? "Update Product" : "Save Product"}
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

        {/* Products Table */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "30px",
          color: "#2D2424", fontWeight: 300, marginBottom: "24px",
        }}>
          All Products ({products.length})
        </h2>

        {loading ? (
          <p style={{ color: "rgba(45,36,36,0.4)", fontSize: "14px" }}>Loading products...</p>
        ) : products.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
            padding: "60px", textAlign: "center",
          }}>
            <p style={{ fontSize: "14px", color: "rgba(45,36,36,0.4)", marginBottom: "20px" }}>
              No products yet. Add your first product!
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
              + Add Product
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {products.map(product => (
              <div
                key={product.id}
                style={{
                  background: "#fff", border: "1px solid #E5E0D8", borderRadius: "4px",
                  padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px",
                }}
              >
                {/* Image */}
                <div style={{
                  width: "60px", height: "60px", borderRadius: "4px",
                  background: "#E5E0D8", flexShrink: 0, overflow: "hidden",
                }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                      🛍️
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#2D2424" }}>{product.name}</span>
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                      background: product.in_stock ? "#f0fdf4" : "#fef2f2",
                      color: product.in_stock ? "#166534" : "#991b1b",
                      border: `1px solid ${product.in_stock ? "#bbf7d0" : "#fecaca"}`,
                    }}>
                      {product.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(45,36,36,0.5)" }}>
                    KES {Number(product.price).toLocaleString()} · {product.category} · Qty: {product.stock_quantity}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
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
                    onClick={() => handleDelete(product.id!)}
                    disabled={deletingId === product.id}
                    style={{
                      background: "none", border: "1px solid #fecaca", borderRadius: "2px",
                      padding: "6px 16px", cursor: "pointer", fontSize: "11px",
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "#991b1b",
                      opacity: deletingId === product.id ? 0.5 : 1,
                    }}
                  >
                    {deletingId === product.id ? "Deleting..." : "Delete"}
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