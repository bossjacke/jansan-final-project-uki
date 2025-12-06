import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: { type: String, default: "pending" },
    paymentIntentId: { type: String },
    clientSecret: { type: String }, // storing Stripe session id
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
