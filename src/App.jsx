import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";
const CATEGORIES = ["All", "Rings", "Bracelets", "Necklaces", "Earrings"];
const TAG_COLORS = {
  Bestseller:  { bg: "#fff3cd", color: "#856404" },
  New:         { bg: "#d1f7e0", color: "#1a7a3c" },
  Trending:    { bg: "#fce4ec", color: "#ad1457" },
  Classic:     { bg: "#e8eaf6", color: "#3949ab" },
  Premium:     { bg: "#f3e5f5", color: "#7b1fa2" },
  Traditional: { bg: "#fbe9e7", color: "#bf360c" },
};

function formatPrice(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

// ── Image Gallery Component ───────────────────────────────────
function ImageGallery({ images, emoji, name }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasImages = images && images.length > 0;

  return (
    <>
      <div style={{ position: "relative", height: 200, background: "linear-gradient(135deg,#fdf6ec,#f5e6c8)", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
        {hasImages ? (
          <>
            <img
              src={images[current]}
              alt={name}
              onClick={() => setLightbox(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in", transition: "transform 0.3s" }}
              onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"}
            />
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrent(c => (c - 1 + images.length) % images.length)}
                  style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <button onClick={() => setCurrent(c => (c + 1) % images.length)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                {/* Dots */}
                <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
                  {images.map((_, i) => (
                    <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 16 : 6, height: 6, borderRadius: 3, background: i === current ? "#c9a84c" : "rgba(255,255,255,0.7)", cursor: "pointer", transition: "all 0.3s" }} />
                  ))}
                </div>
              </>
            )}
            {/* Image count badge */}
            {images.length > 1 && (
              <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                {current + 1}/{images.length}
              </div>
            )}
          </>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>
            {emoji}
          </div>
        )}

        {/* Thumbnail strip */}
        {hasImages && images.length > 1 && (
          <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
          </div>
        )}
      </div>

      {/* Thumbnail row below */}
      {hasImages && images.length > 1 && (
        <div style={{ display: "flex", gap: 6, padding: "8px 12px", background: "#fdf6ec", overflowX: "auto" }}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setCurrent(i)}
              style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: i === current ? "2px solid #c9a84c" : "2px solid transparent", flexShrink: 0, transition: "border 0.2s" }} />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && hasImages && (
        <div onClick={() => setLightbox(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <img src={images[current]} alt={name} style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(false)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setCurrent(c => (c - 1 + images.length) % images.length); }}
                style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 22, cursor: "pointer" }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setCurrent(c => (c + 1) % images.length); }}
                style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 22, cursor: "pointer" }}>›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── Home Page ────────────────────────────────────────────────
function HomePage({ goTo }) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", minHeight: "90vh", background: "linear-gradient(135deg,#fdf6ec,#fef9f0,#fdf0d8)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,0.1),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24, animation: "fadeUp 0.7s ease 0.1s both" }}>
            <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)" }} />
            <div style={{ width: 8, height: 8, background: "#c9a84c", transform: "rotate(45deg)" }} />
            <div style={{ width: 8, height: 8, background: "#c9a84c", transform: "rotate(45deg)" }} />
            <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)" }} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "#c9a84c", marginBottom: 14, animation: "fadeUp 0.7s ease 0.2s both" }}>Est. 2024 · Premium Jewellery</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(42px,6vw,80px)", fontWeight: 900, color: "#1a1208", lineHeight: 1.05, letterSpacing: "-1px", marginBottom: 22, animation: "fadeUp 0.8s ease 0.3s both" }}>
            Welcome to<br /><span style={shimmerStyle}>Kiran Jewellers</span>
          </h1>
          <p style={{ fontSize: 16, color: "#6b5040", lineHeight: 1.8, marginBottom: 40, animation: "fadeUp 0.8s ease 0.42s both" }}>
            Exquisite rings, necklaces, bracelets &amp; earrings —<br />crafted to celebrate every moment of your life.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.8s ease 0.55s both" }}>
            <button className="btn-primary" onClick={() => goTo("Shop Now")}>Explore Collection →</button>
            <button className="btn-outline" onClick={() => goTo("About Us")}>Our Story</button>
          </div>
        </div>
      </div>
      <div style={{ width: "100%", background: "#1a1208", padding: "32px 40px", display: "flex", justifyContent: "center", gap: "clamp(24px,5vw,80px)", flexWrap: "wrap" }}>
        {[["500+","Designs"],["10K+","Happy Customers"],["22K","Pure Gold"],["5★","Rated"]].map(([val, lbl]) => (
          <div key={lbl} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: "#f0d080" }}>{val}</div>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#c9a84c88", marginTop: 4 }}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ width: "100%", padding: "64px 40px", background: "#fffdf7" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={eyebrow}>Browse By Category</div>
          <h2 style={pageTitle}>Our <span style={shimmerStyle}>Collections</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {[{icon:"💍",label:"Rings",count:"120+ designs"},{icon:"📿",label:"Bracelets",count:"85+ designs"},{icon:"🪬",label:"Necklaces",count:"95+ designs"},{icon:"💎",label:"Earrings",count:"110+ designs"}].map((cat, i) => (
            <div key={cat.label} onClick={() => goTo("Shop Now")}
              style={{ background: "linear-gradient(135deg,#fdf6ec,#fef3dc)", border: "1.5px solid #f0e0c0", borderRadius: 16, padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.3s", animation: `fadeUp 0.6s ease ${i * 0.1}s both` }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "#c9a84c"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#f0e0c0"; }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>{cat.icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#1a1208" }}>{cat.label}</div>
              <div style={{ fontSize: 12, color: "#c9a84c", marginTop: 4 }}>{cat.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shop Page ────────────────────────────────────────────────
function ShopPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.append("category", activeCategory);
      if (search) params.append("search", search);
      const res = await fetch(`${API}/products?${params}`);
      const json = await res.json();
      if (json.success) setProducts(json.data);
      else setError("Could not load products.");
    } catch {
      setError("⚠️ Cannot connect to server. Make sure backend is running on port 5000.");
    } finally { setLoading(false); }
  }, [activeCategory, search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const addToCart = (product) => {
    setCart(c => {
      const existing = c.find(i => i._id === product._id);
      if (existing) return c.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
    setAdded(product._id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div style={{ width: "100%", padding: "48px 40px", background: "#fdf6ec" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={eyebrow}>Our Collection</div>
        <h2 style={pageTitle}>Fine <span style={shimmerStyle}>Jewellery</span></h2>
        <p style={{ color: "#8a6f4e", fontSize: 14, marginTop: 8 }}>Live from MongoDB Atlas</p>
      </div>
      <div style={{ position: "relative", maxWidth: 420, margin: "0 auto 28px" }}>
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        <input placeholder="Search jewellery..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "13px 16px 13px 44px", border: "1.5px solid #e8d8b8", borderRadius: 50, fontFamily: "'DM Sans',sans-serif", fontSize: 14, background: "#fffdf7", color: "#3d2b1f", outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "#c9a84c"} onBlur={e => e.target.style.borderColor = "#e8d8b8"} />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "9px 22px", borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid", borderColor: activeCategory === cat ? "#c9a84c" : "#e8d8b8", background: activeCategory === cat ? "#c9a84c" : "#fffdf7", color: activeCategory === cat ? "#fff" : "#8a6f4e", fontFamily: "'DM Sans',sans-serif", transition: "all 0.25s" }}>
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 40, animation: "spin 1s linear infinite", display: "inline-block" }}>💍</div>
          <div style={{ marginTop: 16, color: "#8a6f4e", fontFamily: "'Playfair Display',serif", fontSize: 18 }}>Loading...</div>
        </div>
      )}
      {error && !loading && (
        <div style={{ textAlign: "center", padding: 40, background: "#fff5f5", border: "1px solid #fcc", borderRadius: 14, maxWidth: 500, margin: "0 auto" }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ marginTop: 12, color: "#c0392b", fontWeight: 600 }}>{error}</div>
          <button onClick={fetchProducts} style={{ marginTop: 16, padding: "10px 24px", background: "#1a1208", color: "#f0d080", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {products.map((p, i) => (
            <div key={p._id} className="product-card" style={{ animation: `fadeUp 0.6s ease ${i * 0.07}s both` }}>
              {/* Image Gallery */}
              <ImageGallery images={p.images} emoji={p.emoji} name={p.name} />

              <div style={{ padding: "14px 18px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#c9a84c" }}>{p.category}</div>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 12, background: TAG_COLORS[p.tag]?.bg, color: TAG_COLORS[p.tag]?.color, fontWeight: 700 }}>{p.tag}</span>
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#1a1208", marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#8a6f4e", lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#c9a84c" }}>{formatPrice(p.price)}</div>
                  <button onClick={() => addToCart(p)} style={{ padding: "9px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "'DM Sans',sans-serif", background: added === p._id ? "#43e97b" : "#1a1208", color: added === p._id ? "#fff" : "#f0d080", transition: "all 0.3s" }}>
                    {added === p._id ? "✓ Added!" : "+ Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Page ───────────────────────────────────────────────
function AdminPage() {
  const [form, setForm] = useState({ name: "", category: "Rings", price: "", emoji: "💍", tag: "New", desc: "" });
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([""]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "url"

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch { showMsg("Cannot connect to backend!", "error"); }
  };

  useEffect(() => { loadProducts(); }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // Handle file selection & preview
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  // Upload files to backend
  const uploadFiles = async () => {
    if (imageFiles.length === 0) return [];
    const formData = new FormData();
    imageFiles.forEach(f => formData.append("images", f));
    const res = await fetch(`${API}/upload`, { method: "POST", body: formData });
    const json = await res.json();
    return json.success ? json.urls : [];
  };

  const handleAdd = async () => {
    if (!form.name || !form.price) return showMsg("⚠️ Name and price are required!", "error");
    setLoading(true);
    try {
      let finalImages = [];

      if (uploadMode === "file") {
        // Upload files
        finalImages = await uploadFiles();
      } else {
        // Use URLs — filter empty ones
        finalImages = imageUrls.filter(u => u.trim() !== "");
      }

      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), images: finalImages }),
      });
      const json = await res.json();
      if (json.success) {
        showMsg("✅ Product added with images!");
        setForm({ name: "", category: "Rings", price: "", emoji: "💍", tag: "New", desc: "" });
        setImageFiles([]);
        setImagePreviews([]);
        setImageUrls([""]);
        loadProducts();
      } else showMsg(json.message, "error");
    } catch (e) { showMsg("Error: " + e.message, "error"); }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await fetch(`${API}/products/${id}`, { method: "DELETE" });
      showMsg("🗑️ Deleted!"); loadProducts();
    } catch { showMsg("Delete failed!", "error"); }
  };

  const handleSeed = async () => {
    if (!window.confirm("Replace ALL products with sample data?")) return;
    try {
      const res = await fetch(`${API}/seed`, { method: "POST" });
      const json = await res.json();
      showMsg(json.message); loadProducts();
    } catch { showMsg("Seed failed!", "error"); }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #e8d8b8", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 14, background: "#fffdf7", color: "#3d2b1f", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ width: "100%", background: "#fdf6ec", padding: "48px 40px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={eyebrow}>Manage Store</div>
        <h2 style={pageTitle}>Admin <span style={shimmerStyle}>Panel</span></h2>
      </div>

      {msg && (
        <div style={{ maxWidth: 700, margin: "0 auto 20px", padding: "12px 20px", borderRadius: 10, textAlign: "center", fontWeight: 600, background: msg.type === "error" ? "#fff0f0" : "#f0fff4", color: msg.type === "error" ? "#c0392b" : "#1a7a3c", border: `1px solid ${msg.type === "error" ? "#fcc" : "#a8efc0"}` }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, maxWidth: 1100, margin: "0 auto" }}>

        {/* Add Product Form */}
        <div style={{ background: "#fffdf7", border: "1px solid #f0e0c0", borderRadius: 16, padding: "28px" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#1a1208" }}>➕ Add New Product</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Product Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = "#c9a84c"} onBlur={e => e.target.style.borderColor = "#e8d8b8"} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
              {["Rings","Bracelets","Necklaces","Earrings"].map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Price (₹) *" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = "#c9a84c"} onBlur={e => e.target.style.borderColor = "#e8d8b8"} />
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="Emoji 💍" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
              <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} style={{ ...inputStyle, flex: 1 }}>
                {["New","Bestseller","Trending","Classic","Premium","Traditional"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <textarea placeholder="Description" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => e.target.style.borderColor = "#c9a84c"} onBlur={e => e.target.style.borderColor = "#e8d8b8"} />

            {/* Image Section */}
            <div style={{ border: "1.5px solid #e8d8b8", borderRadius: 12, padding: 14, background: "#fffdf7" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#1a1208" }}>📸 Product Images (Max 5)</div>

              {/* Toggle */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["file", "url"].map(m => (
                  <button key={m} onClick={() => setUploadMode(m)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1.5px solid", borderColor: uploadMode === m ? "#c9a84c" : "#e8d8b8", background: uploadMode === m ? "#c9a84c" : "#fff", color: uploadMode === m ? "#fff" : "#8a6f4e", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {m === "file" ? "📁 Upload File" : "🔗 Paste URL"}
                  </button>
                ))}
              </div>

              {uploadMode === "file" ? (
                <>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange}
                    style={{ width: "100%", padding: "8px", border: "1.5px dashed #c9a84c", borderRadius: 8, background: "#fffdf7", cursor: "pointer", fontSize: 12 }} />
                  <div style={{ fontSize: 11, color: "#8a6f4e", marginTop: 4 }}>JPG, PNG, WEBP — Max 5MB each</div>
                  {/* Previews */}
                  {imagePreviews.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {imagePreviews.map((p, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img src={p} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1.5px solid #c9a84c" }} />
                          <button onClick={() => { const f = [...imageFiles]; f.splice(i, 1); setImageFiles(f); const pv = [...imagePreviews]; pv.splice(i, 1); setImagePreviews(pv); }}
                            style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#ff4444", color: "#fff", border: "none", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {imageUrls.map((url, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <input placeholder={`Image URL ${i + 1} (https://...)`} value={url} onChange={e => { const u = [...imageUrls]; u[i] = e.target.value; setImageUrls(u); }}
                        style={{ ...inputStyle, flex: 1, padding: "8px 12px" }} onFocus={e => e.target.style.borderColor = "#c9a84c"} onBlur={e => e.target.style.borderColor = "#e8d8b8"} />
                      {imageUrls.length > 1 && (
                        <button onClick={() => setImageUrls(u => u.filter((_, j) => j !== i))}
                          style={{ padding: "0 10px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, cursor: "pointer", color: "#c0392b", fontSize: 14 }}>✕</button>
                      )}
                    </div>
                  ))}
                  {imageUrls.length < 5 && (
                    <button onClick={() => setImageUrls(u => [...u, ""])}
                      style={{ width: "100%", padding: "8px", border: "1.5px dashed #c9a84c", borderRadius: 8, background: "#fffdf7", color: "#c9a84c", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                      + Add Another URL
                    </button>
                  )}
                  {/* URL Previews */}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {imageUrls.filter(u => u.trim()).map((u, i) => (
                      <img key={i} src={u} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1.5px solid #c9a84c" }} onError={e => e.target.style.display = "none"} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <button className="btn-primary" onClick={handleAdd} disabled={loading} style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "💾 Save to MongoDB"}
            </button>
            <button onClick={handleSeed} style={{ padding: "11px", borderRadius: 10, border: "1.5px solid #e8d8b8", background: "#fffdf7", color: "#8a6f4e", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
              🌱 Seed Sample Products
            </button>
          </div>
        </div>

        {/* Products List */}
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#1a1208" }}>📦 All Products ({products.length})</div>
          <div style={{ maxHeight: 560, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {products.map(p => (
              <div key={p._id} style={{ background: "#fffdf7", border: "1px solid #f0e0c0", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                {/* Thumbnail */}
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8, border: "1.5px solid #f0e0c0", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 50, height: 50, borderRadius: 8, background: "linear-gradient(135deg,#fdf6ec,#f5e6c8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{p.emoji}</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1208" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#8a6f4e" }}>{p.category} · {formatPrice(p.price)}</div>
                  {p.images && p.images.length > 0 && (
                    <div style={{ fontSize: 11, color: "#c9a84c", marginTop: 2 }}>📸 {p.images.length} image{p.images.length > 1 ? "s" : ""}</div>
                  )}
                </div>
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 12, background: TAG_COLORS[p.tag]?.bg || "#eee", color: TAG_COLORS[p.tag]?.color || "#333", fontWeight: 700 }}>{p.tag}</span>
                <button onClick={() => handleDelete(p._id, p.name)} style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: "#c0392b" }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── About Page ───────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ width: "100%", background: "#fdf6ec" }}>
      <div style={{ width: "100%", padding: "72px 40px", textAlign: "center", background: "linear-gradient(135deg,#fdf6ec,#fef3dc)" }}>
        <div style={eyebrow}>Our Story</div>
        <h2 style={pageTitle}>About <span style={shimmerStyle}>Us</span></h2>
        <div style={{ fontSize: 56, margin: "24px auto" }}>💍</div>
        <p style={{ fontSize: 16, color: "#6b5040", maxWidth: 600, margin: "0 auto", lineHeight: 1.8 }}>Kiran Jewellers has been crafting exquisite jewellery since 2010.</p>
      </div>
      <div style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {[["💛","Who We Are","Kiran Jewellers carries the legacy of traditional Indian craftsmanship."],["🔍","Our Promise","We use only certified 22K & 18K gold, authentic gemstones, and conflict-free diamonds."],["🛠️","Our Craft","Our master craftsmen bring decades of experience creating beautiful jewellery."]].map(([icon, title, text]) => (
            <div key={title} style={{ background: "#fffdf7", border: "1px solid #f0e0c0", borderRadius: 16, padding: "28px" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#1a1208", marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 14, color: "#6b5040", lineHeight: 1.8 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Contact Page ─────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const handle = () => { if (!form.name || !form.phone) return; setSent(true); setTimeout(() => setSent(false), 4000); setForm({ name: "", phone: "", message: "" }); };
  const inputStyle = { width: "100%", padding: "13px 16px", border: "1.5px solid #e8d8b8", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 14, background: "#fffdf7", color: "#3d2b1f", outline: "none", boxSizing: "border-box" };
  return (
    <div style={{ width: "100%", background: "#fdf6ec" }}>
      <div style={{ width: "100%", padding: "72px 40px", textAlign: "center", background: "linear-gradient(135deg,#fdf6ec,#fef3dc)" }}>
        <div style={eyebrow}>Get In Touch</div>
        <h2 style={pageTitle}>Contact <span style={shimmerStyle}>Us</span></h2>
      </div>
      <div style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["📍","Address","123 Gold Market, Surat"],["📞","Phone","+91 98765 43210"],["🕐","Hours","Mon–Sat: 10am–8pm"],["✉️","Email","info@kiranjewellers.com"]].map(([icon,label,val]) => (
                <div key={label} style={{ background: "#fffdf7", border: "1px solid #f0e0c0", borderRadius: 12, padding: "16px" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#5a4030" }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fffdf7", border: "1px solid #f0e0c0", borderRadius: 16, padding: "32px" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#1a1208" }}>Send a Message</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor="#c9a84c"} onBlur={e => e.target.style.borderColor="#e8d8b8"} />
              <input placeholder="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} type="tel" onFocus={e => e.target.style.borderColor="#c9a84c"} onBlur={e => e.target.style.borderColor="#e8d8b8"} />
              <textarea placeholder="Your message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => e.target.style.borderColor="#c9a84c"} onBlur={e => e.target.style.borderColor="#e8d8b8"} />
              <button className="btn-primary" onClick={handle} style={{ width: "100%", justifyContent: "center" }}>{sent ? "✓ Sent!" : "Send Message"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cart Page ────────────────────────────────────────────────
function CartPage({ cart, setCart }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const updateQty = (id, delta) => setCart(c => c.map(i => i._id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  return (
    <div style={{ width: "100%", background: "#fdf6ec", padding: "60px 40px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={eyebrow}>Your Selection</div>
        <h2 style={pageTitle}>Shopping <span style={shimmerStyle}>Cart</span></h2>
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.5, padding: 60 }}>
            <div style={{ fontSize: 52 }}>🛍️</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, marginTop: 12 }}>Cart is empty</div>
          </div>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={item._id} style={{ background: "#fffdf7", border: "1px solid #f0e0c0", borderRadius: 14, padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, border: "1.5px solid #f0e0c0" }} />
                ) : (
                  <div style={{ fontSize: 36 }}>{item.emoji}</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "#1a1208" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#c9a84c" }}>{formatPrice(item.price)} each</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => updateQty(item._id, -1)} style={qtyBtnStyle}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item._id, +1)} style={qtyBtnStyle}>+</button>
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "#1a1208", minWidth: 80, textAlign: "right" }}>{formatPrice(item.price * item.qty)}</div>
              </div>
            ))}
            <div style={{ background: "linear-gradient(135deg,#1a1208,#3d2b1f)", borderRadius: 14, padding: "22px 26px", marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ color: "#c9a84c", textTransform: "uppercase", fontSize: 13, letterSpacing: 1 }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#f0d080" }}>{formatPrice(total)}</span>
              </div>
              <button className="btn-gold" style={{ width: "100%" }}>Proceed to Checkout →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [cart, setCart] = useState([]);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const navItems = ["Home", "About Us", "Shop Now", "Contact Us"];

  // Secret Admin shortcut — Ctrl+Shift+A
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") setActivePage("Admin");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "Home":       return <HomePage goTo={setActivePage} />;
      case "Shop Now":   return <ShopPage cart={cart} setCart={setCart} />;
      case "About Us":   return <AboutPage />;
      case "Contact Us": return <ContactPage />;
      case "Cart":       return <CartPage cart={cart} setCart={setCart} />;
      case "Admin":      return <AdminPage />;
      default:           return <HomePage goTo={setActivePage} />;
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#fdf6ec", fontFamily: "'DM Sans',sans-serif", color: "#1a1208" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; overflow-x: hidden; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .btn-primary { display:inline-flex;align-items:center;gap:8px;padding:14px 34px;border-radius:50px;background:#1a1208;color:#f0d080;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;border:none;cursor:pointer;transition:all 0.3s; }
        .btn-primary:hover { background:#c9a84c;color:#1a1208;transform:translateY(-2px); }
        .btn-outline { display:inline-flex;align-items:center;padding:14px 34px;border-radius:50px;background:transparent;color:#1a1208;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;border:1.5px solid #c9a84c;cursor:pointer;transition:all 0.3s; }
        .btn-outline:hover { background:#c9a84c;color:#fff;transform:translateY(-2px); }
        .btn-gold { display:inline-block;padding:14px 32px;border-radius:50px;background:linear-gradient(135deg,#c9a84c,#f0d080);color:#1a1208;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;border:none;cursor:pointer;transition:all 0.3s; }
        .btn-gold:hover { transform:translateY(-2px); }
        .nav-item { background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;padding:8px 4px;position:relative;transition:color 0.2s; }
        .nav-item::after { content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:#c9a84c;transform:scaleX(0);transform-origin:center;transition:transform 0.3s ease; }
        .nav-item:hover::after,.nav-item.nav-active::after { transform:scaleX(1); }
        .nav-item:hover,.nav-item.nav-active { color:#c9a84c !important; }
        .product-card { background:#fff;border:1px solid #f0e0c0;border-radius:14px;overflow:hidden;transition:all 0.3s;box-shadow:0 2px 12px rgba(201,168,76,0.08); }
        .product-card:hover { transform:translateY(-6px);box-shadow:0 12px 36px rgba(201,168,76,0.2);border-color:#c9a84c; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-thumb { background:#e8d8b8;border-radius:3px; }
      `}</style>

      {/* Navbar */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, width: "100%", background: "rgba(253,246,236,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid #f0e0c0" }}>
        <div style={{ width: "100%", maxWidth: 1300, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", height: 68, gap: 20 }}>
          <button onClick={() => setActivePage("Home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#c9a84c,#f0d080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💍</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: "#1a1208", lineHeight: 1.1 }}>Kiran</div>
              <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#c9a84c" }}>Jewellers</div>
            </div>
          </button>
          <nav style={{ display: "flex", gap: 28, marginLeft: "auto", alignItems: "center" }}>
            {navItems.map(item => (
              <button key={item} className={`nav-item ${activePage === item ? "nav-active" : ""}`} onClick={() => setActivePage(item)} style={{ color: activePage === item ? "#c9a84c" : "#3d2b1f" }}>
                {item}
              </button>
            ))}
            <button onClick={() => setActivePage("Cart")} style={{ position: "relative", background: "#1a1208", border: "none", borderRadius: 10, width: 42, height: 42, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginLeft: 4 }}>
              🛍️
              {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#c9a84c", color: "#1a1208", borderRadius: "50%", width: 19, height: 19, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
            </button>
          </nav>
        </div>
      </header>

      <main style={{ width: "100%" }}>{renderPage()}</main>

      <footer style={{ width: "100%", borderTop: "1px solid #f0e0c0", padding: "36px 40px", textAlign: "center", background: "#fffdf7" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>💍</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: "#1a1208", marginBottom: 4 }}>Kiran Jewellers</div>
        <div style={{ fontSize: 13, color: "#8a6f4e" }}>Crafting memories, one jewel at a time · Surat, Gujarat</div>
        <div style={{ fontSize: 11, color: "#c9a84c", marginTop: 10 }}>© 2024 Kiran Jewellers. All rights reserved.</div>
      </footer>
    </div>
  );
}

const shimmerStyle = { fontStyle: "italic", background: "linear-gradient(90deg,#c9a84c,#f0d080,#c9a84c)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 3s linear infinite" };
const eyebrow = { fontSize: 11, fontWeight: 500, letterSpacing: 6, textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 };
const pageTitle = { fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,5vw,54px)", fontWeight: 900, color: "#1a1208", lineHeight: 1.1 };
const qtyBtnStyle = { width: 30, height: 30, borderRadius: 6, border: "1.5px solid #e8d8b8", background: "#fffdf7", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#1a1208" };
