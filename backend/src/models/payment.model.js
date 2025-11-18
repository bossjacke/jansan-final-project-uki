import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    stripePaymentIntentId: {
      type: String,
      required: function () {
        return this.paymentMethod !== "cash_on_delivery";
      },
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "inr" },

    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "canceled"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "bank_transfer", "cash_on_delivery"],
      default: "card",
    },

    description: String,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true } // ✅ automatically manages createdAt & updatedAt
);

export default mongoose.model("Payment", paymentSchema);
