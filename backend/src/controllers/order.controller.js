import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Payment from "../models/payment.model.js";
import Product from "../models/product.model.js";
import Stripe from "stripe";

// 🧾 Setup Stripe
let stripe;
try {
  stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
} catch (err) {
  console.error("Stripe init failed:", err.message);
  stripe = null;
}

// ==================== ORDER CONTROLLERS ====================

// 🛍️ Create Order
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "card" } = req.body;

    const cart = await Cart.getOrCreateCart(req.user.id);
    if (cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // Check product availability
    const productIds = cart.items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== cart.items.length)
      return res.status(400).json({ success: false, message: "Some products unavailable" });

    const orderItems = cart.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
    }));

    // Create order first
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
    });

    let payment = null;
    let clientSecret = null;

    // Handle payment based on method
    if (paymentMethod === "cash_on_delivery") {
      // Create cash on delivery payment record
      payment = await Payment.create({
        userId: req.user.id,
        orderId: order._id,
        amount: cart.totalAmount,
        paymentMethod: "cash_on_delivery",
        status: "pending",
        description: `Cash on delivery for order ${order.orderNumber}`,
      });
    } else if (paymentMethod === "card" && stripe) {
      // Create Stripe payment intent
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(cart.totalAmount * 100),
        currency: "usd",
        description: `Payment for order ${order.orderNumber}`,
        metadata: { orderId: order._id.toString(), userId: req.user.id },
        automatic_payment_methods: { enabled: true },
      });

      payment = await Payment.create({
        userId: req.user.id,
        orderId: order._id,
        stripePaymentIntentId: intent.id,
        amount: cart.totalAmount,
        paymentMethod: "card",
        status: "pending",
      });

      clientSecret = intent.client_secret;
    } else {
      // Fallback for demo/testing
      payment = await Payment.create({
        userId: req.user.id,
        orderId: order._id,
        amount: cart.totalAmount,
        paymentMethod: "card",
        status: "succeeded", // Auto-succeed for demo
        description: `Demo payment for order ${order.orderNumber}`,
      });
    }

    // Update order with payment reference
    order.paymentId = payment._id;
    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    const fullOrder = await Order.findById(order._id)
      .populate("items.productId", "name type description")
      .populate("paymentId");

    const responseData = { order: fullOrder };
    
    if (clientSecret) {
      responseData.clientSecret = clientSecret;
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: responseData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating order", error: err.message });
  }
};

// 💳 Process Payment (online)
export const processOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured" });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "usd",
      description: `Payment for order ${order.orderNumber}`,
      metadata: { orderId: order._id.toString(), userId: req.user.id },
      automatic_payment_methods: { enabled: true },
    });

    const payment = await Payment.create({
      userId: req.user.id,
      orderId: order._id,
      stripePaymentIntentId: intent.id,
      amount: order.totalAmount,
      paymentMethod: "card",
      status: "pending",
    });

    order.paymentId = payment._id;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment intent created",
      data: {
        clientSecret: intent.client_secret,
        paymentId: payment._id,
        orderId: order._id,
        amount: order.totalAmount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error processing payment", error: err.message });
  }
};

// ✅ Confirm Payment
export const confirmOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentIntentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const payment = await Payment.findById(order.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    if (stripe) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      payment.status = intent.status === "succeeded" ? "succeeded" : "failed";
    } else payment.status = "succeeded";

    await payment.save();
    order.orderStatus = payment.status === "succeeded" ? "confirmed" : order.orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment confirmed",
      data: { orderId: order._id, paymentStatus: payment.status },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error confirming payment", error: err.message });
  }
};

// 📦 Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("items.productId", "name type description");

    res.status(200).json({ success: true, message: "Orders fetched", data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching orders", error: err.message });
  }
};

// 🔍 Get Single Order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("items.productId", "name type description")
      .populate("paymentId");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({ success: true, message: "Order fetched", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error getting order", error: err.message });
  }
};

// ❌ Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    if (["shipped", "delivered"].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: "Cannot cancel now" });

    order.orderStatus = "cancelled";
    await order.save();

    if (order.paymentId) {
      const payment = await Payment.findById(order.paymentId);
      if (payment && payment.status === "pending") {
        payment.status = "canceled";
        await payment.save();
      }
    }

    res.status(200).json({ success: true, message: "Order canceled", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error canceling order", error: err.message });
  }
};

export default {
  createOrder,
  processOrderPayment,
  confirmOrderPayment,
  getUserOrders,
  getOrderById,
  cancelOrder,
};
