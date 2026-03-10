import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String }
});

export default mongoose.models.Products || mongoose.model("Products", ProductSchema);