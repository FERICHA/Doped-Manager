import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  alertThreshold: { type: Number, default: 5 },
  category: { type: String },
  session: { 
    type: String,
  }
}, { timestamps: true });

const productModel = mongoose.model("Product", ProductSchema);

export default productModel;