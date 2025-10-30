import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    orderStatus: { 
      type: String, 
      enum: ["pending", "confirmed", "delivered"], 
      default: "pending" 
    },
    deliveryDate: { type: Date },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
