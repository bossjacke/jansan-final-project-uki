import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    items: [
      {
        productId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: true 
        },
        quantity: { 
          type: Number, 
          required: true, 
          min: 1 
        },
        price: { 
          type: Number, 
          required: true 
        },
      },
    ],

    totalAmount: { 
      type: Number, 
      required: true, 
      min: 0 
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    paymentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Payment" 
    },

    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      city: String,
      postalCode: String,
      country: String,
    },

    deliveryDate: Date,
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre('save', function(next) {
    if (this.isNew && !this.orderNumber) {
        this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    next();
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
    if (this.isModified('items')) {
        this.totalAmount = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
