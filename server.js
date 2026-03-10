const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// ── Serve uploaded images as static files ─────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// ── Multer config for image upload ────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    if (valid) cb(null, true);
    else cb(new Error("Only image files allowed!"));
  },
});

// ── MongoDB Connection ────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://demosilvertouch_db_user:MotoBhai1234@ecommerace.odycivh.mongodb.net/jewellery_shop?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected!"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ── Product Schema ────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  category: { type: String, required: true },
  price:    { type: Number, required: true },
  emoji:    { type: String, default: "💍" },
  tag:      { type: String, default: "New" },
  desc:     { type: String, default: "" },
  inStock:  { type: Boolean, default: true },
  images:   [{ type: String }], // Array of image URLs
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

// ── IMAGE UPLOAD ROUTE ────────────────────────────────────────
// Upload multiple images (max 5)
app.post("/api/upload", upload.array("images", 5), (req, res) => {
  try {
    const imageUrls = req.files.map(
      (file) => `http://localhost:5000/uploads/${file.filename}`
    );
    res.json({ success: true, urls: imageUrls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PRODUCT ROUTES ────────────────────────────────────────────

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Add new product
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product, message: "Product added!" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT - Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product, message: "Product updated!" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE - Remove product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Seed sample data
app.post("/api/seed", async (req, res) => {
  try {
    await Product.deleteMany({});
    const sampleProducts = [
      { name: "Rose Gold Ring",        category: "Rings",     price: 2499, emoji: "💍", tag: "Bestseller",  desc: "Delicate 18K rose gold band with a sparkling solitaire.", images: [] },
      { name: "Diamond Bracelet",      category: "Bracelets", price: 5999, emoji: "📿", tag: "New",         desc: "Classic tennis bracelet with brilliant-cut diamonds.", images: [] },
      { name: "Pearl Necklace",        category: "Necklaces", price: 3799, emoji: "🪬", tag: "Trending",    desc: "Timeless freshwater pearl strand, 18 inches.", images: [] },
      { name: "Gold Hoop Earrings",    category: "Earrings",  price: 1899, emoji: "🔮", tag: "Classic",     desc: "Polished 22K gold hoops, lightweight and elegant.", images: [] },
      { name: "Silver Charm Bangle",   category: "Bracelets", price: 1299, emoji: "✨", tag: "New",         desc: "Sterling silver bangle with hand-carved floral charms.", images: [] },
      { name: "Emerald Ring",          category: "Rings",     price: 8999, emoji: "💚", tag: "Premium",     desc: "Natural emerald set in 18K yellow gold, certified.", images: [] },
      { name: "Kundan Necklace",       category: "Necklaces", price: 6499, emoji: "🏵️", tag: "Traditional", desc: "Handcrafted Kundan necklace with meenakari work.", images: [] },
      { name: "Diamond Drop Earrings", category: "Earrings",  price: 4299, emoji: "💎", tag: "Bestseller",  desc: "Elegant drop earrings with pear-shaped diamond accents.", images: [] },
      { name: "Gold Mangalsutra",      category: "Necklaces", price: 9999, emoji: "🌟", tag: "Premium",     desc: "Traditional 22K gold mangalsutra with black beads.", images: [] },
    ];
    await Product.insertMany(sampleProducts);
    res.json({ success: true, message: `✅ ${sampleProducts.length} products seeded!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Start Server ──────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
