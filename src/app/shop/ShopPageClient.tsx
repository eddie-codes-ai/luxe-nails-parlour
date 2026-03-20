"use client";

import { useState, useEffect } from "react";

const fonts = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'Jost', sans-serif",
};

const colors = {
  cream: "#FDFBF7",
  espresso: "#2D2424",
  gold: "#C5A358",
  sand: "#E5E0D8",
};

const WHATSAPP_NUMBER = "254758550286";

// Category icon + background colour map
const categoryPlaceholder: Record<string, { icon: string; bg: string }> = {
  "Oils":               { icon: "🧴", bg: "#FFF8EE" },
  "Gels":               { icon: "💅", bg: "#FFF0F5" },
  "Jewellery":          { icon: "💎", bg: "#F3F0FF" },
  "Tools":              { icon: "🔧", bg: "#F0F4FF" },
  "Nail Kits":          { icon: "🎁", bg: "#F0FFF4" },
  "Nail Art":           { icon: "🎨", bg: "#FFF5F5" },
  "Treatments & Care":  { icon: "🌿", bg: "#F0FFF8" },
  "Accessories":        { icon: "✨", bg: "#FFFBF0" },
};

const getPlaceholder = (category: string) =>
  categoryPlaceholder[category] || { icon: "🛍️", bg: "#F5F5F5" };

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  in_stock: boolean;
  stock_quantity: number;
}

type CartItem = Product & { quantity: number };

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "cash">("mpesa");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filtered = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setToast(`${product.name} added to cart`);
    setTimeout(() => setToast(null), 2500);
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  const sendToWhatsApp = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Please enter your name and phone number before sending.");
      return;
    }
    const itemLines = cart.map(i => `  • ${i.name} × ${i.quantity} – KSh ${(i.price * i.quantity).toLocaleString()}`).join("\n");
    const paymentNote = paymentMethod === "mpesa"
      ? "💳 Payment: M-Pesa (please send till number)"
      : "💵 Payment: Cash on delivery/pickup";
    const message =
      `Hi LuxeNails! 💅 I'd like to place an order:\n\n` +
      `${itemLines}\n\n` +
      `*Total: KSh ${total.toLocaleString()}*\n\n` +
      `${paymentNote}\n` +
      `👤 Name: ${form.name}\n` +
      `📞 Phone: ${form.phone}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setCheckoutOpen(false);
    setCartOpen(false);
    setCart([]);
    setForm({ name: "", phone: "" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${colors.cream}; }
        .product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(45,36,36,0.12); }
        .add-btn { transition: background 0.2s ease; }
        .add-btn:hover { background: ${colors.espresso} !important; color: ${colors.cream} !important; }
        .cat-btn { transition: all 0.2s ease; }
        .cat-btn:hover { border-color: ${colors.gold} !important; color: ${colors.gold} !important; }
        .cart-panel { animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .overlay { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .remove-btn:hover { color: #c0392b !important; }
        .toast { animation: toastIn 0.3s ease; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .wa-btn:hover { background: #1ebc59 !important; transform: scale(1.01); }
        input:focus { border-color: ${colors.gold} !important; outline: none; }
        @media (max-width: 600px) {
          .product-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important; padding: 24px 16px 60px !important; }
          .page-hero { padding: 48px 20px 40px !important; }
          .cat-bar { padding: 24px 16px 0 !important; }
          .nav-links { display: none !important; }
          .cart-panel { width: 100vw !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: colors.espresso, height: 70,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <a href="/" style={{ fontFamily: fonts.heading, fontSize: "22px", color: colors.gold, textDecoration: "none", letterSpacing: "0.05em" }}>
          LuxeNails
        </a>
        <div className="nav-links" style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Gallery", href: "/gallery" },
            { label: "Booking", href: "/booking" },
            { label: "Contact", href: "/contact" },
          ].map(link => (
            <a key={link.label} href={link.href} style={{ fontFamily: fonts.body, fontSize: "13px", color: "rgba(253,251,247,0.7)", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {link.label}
            </a>
          ))}
          <a href="/shop" style={{ fontFamily: fonts.body, fontSize: "13px", color: colors.gold, textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${colors.gold}`, paddingBottom: "2px" }}>
            Shop
          </a>
        </div>
        <button onClick={() => setCartOpen(true)} style={{
          background: "none", border: `1px solid ${colors.gold}`, borderRadius: "4px",
          padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          fontFamily: fonts.body, fontSize: "13px", color: colors.gold,
        }}>
          🛍️ Cart
          {itemCount > 0 && (
            <span style={{
              background: colors.gold, color: colors.espresso, borderRadius: "50%",
              width: "20px", height: "20px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "11px", fontWeight: 700,
            }}>{itemCount}</span>
          )}
        </button>
      </nav>

      {/* MAIN */}
      <main style={{ paddingTop: 70, minHeight: "100vh", background: colors.cream }}>

        {/* Hero */}
        <div className="page-hero" style={{ background: colors.espresso, padding: "60px 40px 50px", textAlign: "center" }}>
          <p style={{ fontFamily: fonts.body, fontSize: "11px", letterSpacing: "0.25em", color: colors.gold, textTransform: "uppercase", marginBottom: "12px" }}>
            Nail Care Products
          </p>
          <h1 style={{ fontFamily: fonts.heading, fontSize: "clamp(36px, 5vw, 60px)", color: colors.cream, fontWeight: 300, marginBottom: "16px" }}>
            Shop Our Collection
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: "15px", color: "rgba(253,251,247,0.55)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.8 }}>
            Add your favourites to the cart, then send your full order straight to our WhatsApp — fast and easy.
          </p>
        </div>

        {/* Info Banner */}
        <div style={{
          background: "#E8F5E9", borderBottom: "1px solid #C8E6C9",
          padding: "13px 40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <span style={{ fontSize: "18px" }}>💬</span>
          <p style={{ fontFamily: fonts.body, fontSize: "13px", color: "#2E7D32" }}>
            Add items to your cart, then send your full order to us on <strong>WhatsApp</strong> — no account needed.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 40px" }}>
            <div style={{ fontFamily: fonts.heading, fontSize: "28px", color: colors.gold, marginBottom: "12px" }}>✦</div>
            <p style={{ fontFamily: fonts.body, fontSize: "14px", color: "rgba(45,36,36,0.4)", letterSpacing: "0.1em" }}>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 40px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛍️</div>
            <p style={{ fontFamily: fonts.heading, fontSize: "28px", color: colors.espresso, fontWeight: 300, marginBottom: "8px" }}>Coming Soon</p>
            <p style={{ fontFamily: fonts.body, fontSize: "14px", color: "rgba(45,36,36,0.45)" }}>Our shop products are being stocked. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Category Filter */}
            <div className="cat-bar" style={{ padding: "32px 40px 0", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {categories.map(cat => (
                <button key={cat} className="cat-btn" onClick={() => setActiveCategory(cat)} style={{
                  fontFamily: fonts.body, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "10px 22px", borderRadius: "2px", cursor: "pointer",
                  background: activeCategory === cat ? colors.gold : "transparent",
                  color: colors.espresso,
                  border: `1px solid ${activeCategory === cat ? colors.gold : colors.sand}`,
                  fontWeight: activeCategory === cat ? 600 : 400,
                }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="product-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px", padding: "32px 40px 80px", maxWidth: "1200px", margin: "0 auto",
            }}>
              {filtered.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                const placeholder = getPlaceholder(product.category);
                return (
                  <div key={product.id} className="product-card" style={{
                    background: "#fff", borderRadius: "4px", overflow: "hidden",
                    border: `1px solid ${inCart ? colors.gold : colors.sand}`,
                    position: "relative",
                  }}>
                    {inCart && (
                      <div style={{
                        position: "absolute", top: "12px", right: "12px",
                        background: colors.gold, color: colors.espresso,
                        borderRadius: "50%", width: "26px", height: "26px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, fontFamily: fonts.body, zIndex: 2,
                      }}>
                        {inCart.quantity}
                      </div>
                    )}

                    {/* Product Image / Smart Placeholder */}
                    <div style={{ height: "190px", background: product.image_url ? colors.sand : placeholder.bg, overflow: "hidden" }}>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => {
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.style.background = placeholder.bg;
                              (e.target as HTMLImageElement).style.display = "none";
                            }
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", gap: "10px",
                        }}>
                          <span style={{ fontSize: "52px", lineHeight: 1 }}>{placeholder.icon}</span>
                          <span style={{
                            fontFamily: fonts.body, fontSize: "9px",
                            color: "rgba(45,36,36,0.3)", letterSpacing: "0.15em",
                            textTransform: "uppercase",
                          }}>
                            Photo coming soon
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: "18px 20px 20px" }}>
                      <span style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: colors.gold, fontWeight: 500 }}>
                        {product.category}
                      </span>
                      <h3 style={{ fontFamily: fonts.heading, fontSize: "21px", color: colors.espresso, fontWeight: 500, margin: "5px 0 7px", lineHeight: 1.2 }}>
                        {product.name}
                      </h3>
                      <p style={{ fontFamily: fonts.body, fontSize: "13px", color: "rgba(45,36,36,0.55)", lineHeight: 1.7, marginBottom: "16px" }}>
                        {product.description}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontFamily: fonts.heading, fontSize: "22px", color: colors.espresso, fontWeight: 500 }}>
                          KSh {product.price.toLocaleString()}
                        </span>
                        {inCart ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button onClick={() => updateQty(product.id, -1)} style={{ width: "30px", height: "30px", background: colors.sand, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <span style={{ fontFamily: fonts.body, fontSize: "14px", fontWeight: 600, minWidth: "20px", textAlign: "center" }}>{inCart.quantity}</span>
                            <button onClick={() => updateQty(product.id, 1)} style={{ width: "30px", height: "30px", background: colors.gold, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                        ) : (
                          <button className="add-btn" onClick={() => addToCart(product)} style={{
                            background: colors.gold, color: colors.espresso, border: "none",
                            padding: "10px 18px", borderRadius: "2px", cursor: "pointer",
                            fontFamily: fonts.body, fontSize: "12px", letterSpacing: "0.08em",
                            textTransform: "uppercase", fontWeight: 600,
                          }}>
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* CART OVERLAY */}
      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(45,36,36,0.5)", zIndex: 200 }} />
      )}

      {/* CART PANEL */}
      {cartOpen && (
        <div className="cart-panel" style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "min(420px, 100vw)",
          background: colors.cream, zIndex: 201,
          display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(45,36,36,0.15)",
        }}>
          <div style={{ padding: "24px", borderBottom: `1px solid ${colors.sand}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: "28px", color: colors.espresso, fontWeight: 400 }}>
              Your Cart {itemCount > 0 && <span style={{ fontSize: "16px", color: colors.gold }}>({itemCount} items)</span>}
            </h2>
            <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: colors.espresso }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: "60px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛍️</div>
                <p style={{ fontFamily: fonts.body, color: "rgba(45,36,36,0.45)", fontSize: "15px" }}>Your cart is empty</p>
                <button onClick={() => setCartOpen(false)} style={{
                  marginTop: "20px", background: "none", border: `1px solid ${colors.gold}`,
                  borderRadius: "2px", padding: "10px 24px", cursor: "pointer",
                  fontFamily: fonts.body, fontSize: "12px", color: colors.gold,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  Browse Products
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {cart.map(item => {
                  const placeholder = getPlaceholder(item.category);
                  return (
                    <div key={item.id} style={{
                      display: "flex", gap: "14px", padding: "14px",
                      background: "#fff", borderRadius: "4px", border: `1px solid ${colors.sand}`, alignItems: "center",
                    }}>
                      <div style={{
                        width: "54px", height: "54px", borderRadius: "4px", overflow: "hidden", flexShrink: 0,
                        background: item.image_url ? colors.sand : placeholder.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "26px" }}>{placeholder.icon}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: fonts.heading, fontSize: "17px", color: colors.espresso, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.name}
                        </p>
                        <p style={{ fontFamily: fonts.body, fontSize: "13px", color: colors.gold, marginTop: "2px" }}>
                          KSh {item.price.toLocaleString()} each
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ width: "26px", height: "26px", background: colors.sand, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "14px" }}>−</button>
                          <span style={{ fontFamily: fonts.body, fontSize: "14px", fontWeight: 600 }}>{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ width: "26px", height: "26px", background: colors.sand, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "14px" }}>+</button>
                          <button className="remove-btn" onClick={() => removeItem(item.id)} style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontFamily: fonts.body, fontSize: "12px", color: "rgba(45,36,36,0.35)",
                            letterSpacing: "0.05em", marginLeft: "4px",
                          }}>
                            Remove
                          </button>
                        </div>
                      </div>
                      <div style={{ fontFamily: fonts.heading, fontSize: "18px", color: colors.espresso, fontWeight: 500, flexShrink: 0 }}>
                        KSh {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ padding: "20px 24px", borderTop: `1px solid ${colors.sand}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontFamily: fonts.body, fontSize: "13px", color: "rgba(45,36,36,0.55)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Total</span>
                <span style={{ fontFamily: fonts.heading, fontSize: "28px", color: colors.espresso, fontWeight: 500 }}>KSh {total.toLocaleString()}</span>
              </div>
              <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} style={{
                width: "100%", padding: "15px", background: "#25D366", border: "none",
                borderRadius: "2px", cursor: "pointer", fontFamily: fonts.body,
                fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase",
                fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                💬 Send Order via WhatsApp
              </button>
              <button onClick={() => setCartOpen(false)} style={{
                width: "100%", padding: "12px", background: "transparent",
                border: `1px solid ${colors.sand}`, borderRadius: "2px", cursor: "pointer",
                fontFamily: fonts.body, fontSize: "12px", color: colors.espresso,
                letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "10px",
              }}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <>
          <div className="overlay" onClick={() => setCheckoutOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(45,36,36,0.6)", zIndex: 300 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: colors.cream, borderRadius: "4px", zIndex: 301,
            width: "min(520px, 95vw)", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 24px 80px rgba(45,36,36,0.2)",
          }}>
            <div style={{ padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontFamily: fonts.heading, fontSize: "30px", color: colors.espresso, fontWeight: 400 }}>Almost done!</h2>
                <button onClick={() => setCheckoutOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: colors.espresso }}>✕</button>
              </div>

              <div style={{ background: "#fff", border: `1px solid ${colors.sand}`, borderRadius: "4px", padding: "18px", marginBottom: "24px" }}>
                <p style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: colors.gold, marginBottom: "12px" }}>Order Summary</p>
                {cart.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                    <span style={{ fontFamily: fonts.body, fontSize: "13px", color: colors.espresso }}>{item.name} × {item.quantity}</span>
                    <span style={{ fontFamily: fonts.body, fontSize: "13px", color: colors.espresso, fontWeight: 500 }}>KSh {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${colors.sand}`, paddingTop: "12px", marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: fonts.body, fontSize: "13px", fontWeight: 600 }}>Total</span>
                  <span style={{ fontFamily: fonts.heading, fontSize: "22px", color: colors.espresso, fontWeight: 500 }}>KSh {total.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginBottom: "22px" }}>
                <p style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: colors.gold, marginBottom: "14px" }}>Your Details</p>
                {[
                  { label: "Full Name", key: "name", placeholder: "e.g. Jane Doe", type: "text" },
                  { label: "Phone Number", key: "phone", placeholder: "e.g. 0712 345 678", type: "tel" },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: "14px" }}>
                    <label style={{ fontFamily: fonts.body, fontSize: "12px", color: colors.espresso, display: "block", marginBottom: "6px" }}>{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{
                        width: "100%", padding: "11px 14px",
                        border: `1px solid ${colors.sand}`, borderRadius: "2px",
                        fontFamily: fonts.body, fontSize: "14px", color: colors.espresso, background: "#fff",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "28px" }}>
                <p style={{ fontFamily: fonts.body, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: colors.gold, marginBottom: "14px" }}>Payment Method</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { id: "mpesa", label: "M-Pesa", icon: "📱", desc: "We'll send you the till number" },
                    { id: "cash", label: "Cash", icon: "💵", desc: "Pay on delivery or pickup" },
                  ].map(method => (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id as "mpesa" | "cash")} style={{
                      padding: "14px", textAlign: "left", cursor: "pointer",
                      border: `2px solid ${paymentMethod === method.id ? colors.gold : colors.sand}`,
                      borderRadius: "4px",
                      background: paymentMethod === method.id ? "rgba(197,163,88,0.07)" : "#fff",
                    }}>
                      <div style={{ fontSize: "22px", marginBottom: "5px" }}>{method.icon}</div>
                      <p style={{ fontFamily: fonts.body, fontSize: "14px", fontWeight: 600, color: colors.espresso }}>{method.label}</p>
                      <p style={{ fontFamily: fonts.body, fontSize: "11px", color: "rgba(45,36,36,0.5)", marginTop: "2px" }}>{method.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button className="wa-btn" onClick={sendToWhatsApp} style={{
                width: "100%", padding: "16px", background: "#25D366", border: "none",
                borderRadius: "2px", cursor: "pointer", fontFamily: fonts.body,
                fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase",
                fontWeight: 600, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                💬 Send Order on WhatsApp — KSh {total.toLocaleString()}
              </button>
              <p style={{ fontFamily: fonts.body, fontSize: "12px", color: "rgba(45,36,36,0.4)", textAlign: "center", marginTop: "12px", lineHeight: 1.6 }}>
                This will open WhatsApp with your full order ready to send to us.
              </p>
            </div>
          </div>
        </>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast" style={{
          position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)",
          background: colors.espresso, color: colors.cream, borderRadius: "4px",
          padding: "12px 24px", zIndex: 500, fontFamily: fonts.body, fontSize: "13px",
          letterSpacing: "0.04em", boxShadow: "0 8px 32px rgba(45,36,36,0.25)",
          display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap",
        }}>
          {toast} <span style={{ color: colors.gold, fontWeight: 700 }}>✓</span>
        </div>
      )}
    </>
  );
}