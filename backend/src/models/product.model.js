import mongoose from "mongoose";

// Product Schema for both Biogas and Fertilizer
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Biogas Unit / Fertilizer
    type: { type: String, enum: ["biogas", "fertilizer"], required: true },
    capacity: { type: String }, // For biogas only
    price: { type: Number, required: true },
    warrantyPeriod: { type: String }, // For biogas only
    description: { type: String },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
