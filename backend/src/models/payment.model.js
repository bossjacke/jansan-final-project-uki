import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    },

    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "usd"
    },

    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "canceled", "refunded"],
      default: "pending"
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet"],
      default: "card"
    },

    description: {
      type: String
    },

    metadata: {
      type: Map,
      of: String
    },

    failureReason: {
      type: String
    },

    receiptEmail: {
      type: String
    },

    // Stripe charge ID (after successful payment)
    stripeChargeId: {
      type: String
    },

    // Refund information
    refundId: {
      type: String
    },

    refundAmount: {
      type: Number,
      min: 0
    },

    refundReason: {
      type: String
    },

    // Payment timestamps
    paidAt: Date,
    failedAt: Date,
    refundedAt: Date
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `$${(this.amount / 100).toFixed(2)}`;
});

// Virtual for formatted amount in INR (assuming 1 USD = 83 INR)
paymentSchema.virtual('formattedAmountINR').get(function() {
  return `₹${Math.round((this.amount / 100) * 83).toLocaleString()}`;
});

// Indexes for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ orderId: 1 });
// stripePaymentIntentId already has unique index from the schema definition

// Pre-save middleware to update timestamps based on status
paymentSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'succeeded':
        if (!this.paidAt) this.paidAt = now;
        break;
      case 'failed':
        if (!this.failedAt) this.failedAt = now;
        break;
      case 'refunded':
        if (!this.refundedAt) this.refundedAt = now;
        break;
    }
  }
  
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
