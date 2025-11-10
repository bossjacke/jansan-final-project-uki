import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Payment from "../models/payment.model.js";
import Product from "../models/product.model.js";
import Stripe from "stripe";
import User from "../models/user.model.js";

// 🧾 Setup Stripe
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_51234567890abcdef') {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log("✅ Stripe initialized successfully");
  } catch (err) {
    console.error("Stripe init failed:", err.message);
    stripe = null;
  }
} else {
  console.log("⚠️ Stripe is using demo/test mode - payment features will be simulated");
  stripe = null;
}

// ==================== ORDER CONTROLLERS ====================

// 🛍️ Create Order
export const createOrder = async (req, res) => {
  try {
    const { paymentMethod = "card", shippingAddress } = req.body;

    console.log("🛒 Creating order for user:", req.user.id);
    console.log("💳 Payment method:", paymentMethod);

    // Validate payment method
    if (!["card", "cash"].includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment method. Must be 'card' or 'cash'" 
      });
    }

    const cart = await Cart.getOrCreateCart(req.user.id);
    console.log("🛍️ Cart items:", cart.items.length, cart.items);
    
    if (cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Validate cart items
    for (const item of cart.items) {
      if (!item.productId || !item.quantity || !item.price) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid cart item data" 
        });
      }
    }

    // Check product availability and stock
    const productIds = cart.items.map(i => i.productId);
    console.log("🔍 Product IDs to check:", productIds);
    
    const products = await Product.find({ _id: { $in: productIds } });
    console.log("📦 Found products:", products.length, products.map(p => ({ id: p._id, name: p.name, stock: p.stock })));

    if (products.length !== cart.items.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Some products are unavailable or have been removed" 
      });
    }

    // Check stock availability
    for (const cartItem of cart.items) {
      const product = products.find(p => p._id.toString() === cartItem.productId.toString());
      console.log("🔍 Checking stock for cart item:", cartItem);
      console.log("📦 Found product:", product ? { id: product._id, name: product.name, stock: product.stock } : 'NOT FOUND');
      
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          message: `Product not found` 
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}` 
        });
      }
    }

    // Get user information
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prepare order products
    const orderProducts = cart.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
    }));

    // Prepare shipping address
    const finalShippingAddress = shippingAddress || {
      fullName: user.fullName || user.name || '',
      phone: user.phone || '',
      addressLine1: user.location || '',
      city: user.city || '',
      postalCode: user.postalCode || '',
      country: user.country || 'India'
    };

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      products: orderProducts,
      totalAmount: cart.totalAmount,
      paymentMethod,
      deliveryLocation: user.location || finalShippingAddress.addressLine1,
      shippingAddress: finalShippingAddress,
    });

    let payment = null;
    let clientSecret = null;

    // Handle payment based on method
    if (paymentMethod === "cash") {
      // Create cash on delivery payment record
      payment = await Payment.create({
        userId: req.user.id,
        orderId: order._id,
        amount: cart.totalAmount,
        paymentMethod: "cash_on_delivery",
        status: "pending",
        description: `Cash on delivery for order ${order.orderNumber}`,
      });

      // Update order payment status
      order.paymentStatus = "pending";
      await order.save();
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
        status: "succeeded",
        description: `Demo payment for order ${order.orderNumber}`,
      });

      order.paymentStatus = "paid";
      await order.save();
    }

    // Update order with payment reference
    order.paymentId = payment._id;
    await order.save();

    // Update product stock (use atomic operations to prevent race conditions)
    const stockUpdatePromises = cart.items.map(cartItem => 
      Product.findByIdAndUpdate(
        cartItem.productId,
        { $inc: { stock: -cartItem.quantity } },
        { new: true }
      )
    );

    await Promise.all(stockUpdatePromises);

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Get complete order with populated data
    const fullOrder = await Order.findById(order._id)
      .populate("products.productId", "name type description images image")
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
    console.error("❌ Error creating order:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error creating order", 
      error: err.message 
    });
  }
};

// ✅ Confirm Order after Stripe Payment
export const confirmOrder = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // Find the payment in our database
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this payment'
      });
    }

    // Retrieve payment intent from Stripe to get the latest status
    if (stripe) {
      try {
        const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Update payment status based on Stripe status
        payment.status = stripePaymentIntent.status === "succeeded" ? "succeeded" : 
                       stripePaymentIntent.status === "canceled" ? "canceled" : "failed";
      } catch (stripeError) {
        console.error("Stripe retrieval error:", stripeError);
        payment.status = "failed";
      }
    } else {
      // If Stripe is not available, mark as succeeded for demo purposes
      payment.status = "succeeded";
    }

    await payment.save();

    // Update order status
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = payment.status === "succeeded" ? "paid" : 
                           payment.status === "canceled" ? "cancelled" : "failed";
      
      // Set delivery date for successful payments
      if (payment.status === "succeeded") {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3);
        order.deliveryDate = deliveryDate;
        order.orderStatus = "Processing";
      }
      
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: payment.status,
        orderStatus: order.orderStatus,
        deliveryDate: order.deliveryDate,
        message: payment.status === "succeeded" 
          ? "Your order has been placed successfully. It will arrive in 3 days."
          : `Payment ${payment.status}. Please try again.`
      }
    });

  } catch (err) {
    console.error("❌ Error confirming payment:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error confirming payment", 
      error: err.message 
    });
  }
};

// 📦 Get User Orders
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("products.productId", "name type description images image")
      .populate("paymentId", "status paymentMethod stripePaymentIntentId");

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      message: "Orders fetched successfully",
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders", 
      error: err.message 
    });
  }
};

// 🔍 Get Single Order
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId)
      .populate("products.productId", "name type description images image")
      .populate("paymentId", "status paymentMethod stripePaymentIntentId amount")
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized to access this order" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Order fetched successfully", 
      data: order 
    });

  } catch (err) {
    console.error("❌ Error getting order:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error getting order", 
      error: err.message 
    });
  }
};

// 🔄 Update Order Status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!["Processing", "Delivered", "Cancelled"].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.orderStatus = orderStatus;
    
    // Set delivery date if order is delivered
    if (orderStatus === "Delivered") {
      order.deliveryDate = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: err.message
    });
  }
};

// ❌ Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this order'
      });
    }

    // Check if order can be cancelled (only if it's still processing)
    if (order.orderStatus !== "Processing") {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.orderStatus = "Cancelled";
    await order.save();

    // Restore product stock
    for (const orderProduct of order.products) {
      await Product.findByIdAndUpdate(
        orderProduct.productId,
        { $inc: { stock: orderProduct.quantity } }
      );
    }

    // Update payment status if payment exists
    if (order.paymentId) {
      await Payment.findByIdAndUpdate(
        order.paymentId,
        { status: "canceled" }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (err) {
    console.error("❌ Error cancelling order:", err);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: err.message
    });
  }
};

// 📊 Get All Orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'userId.name': { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("userId", "name email")
      .populate("products.productId", "name type description images image")
      .populate("paymentId", "status paymentMethod amount");

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      message: "Orders fetched successfully",
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (err) {
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders", 
      error: err.message 
    });
  }
};

export default {
  createOrder,
  confirmOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};
