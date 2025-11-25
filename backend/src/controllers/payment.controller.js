import stripe from 'stripe';
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Initialize Stripe lazily to ensure environment variables are loaded
const getStripeInstance = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
  }
  return stripe(process.env.STRIPE_SECRET_KEY);
};

// ==================== PAYMENT CONTROLLERS ====================

// 💳 Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    console.log("💳 Creating payment intent for user:", req.user.id);

    // Get user's cart
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    if (cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Validate cart items and check stock
    const productIds = cart.items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== cart.items.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Some products are unavailable or have been removed" 
      });
    }

    // Check stock availability
    for (const cartItem of cart.items) {
      const product = products.find(p => p._id.toString() === cartItem.productId.toString());
      
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

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(cart.totalAmount * 100);

    // Create a PaymentIntent with the order amount and currency
    const stripeInstance = getStripeInstance();
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInCents,
      currency: 'inr', // Indian Rupees
      payment_method_types: ['card'],
      metadata: {
        userId: req.user.id,
        cartTotal: cart.totalAmount.toString(),
        shippingAddress: JSON.stringify(shippingAddress || {})
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("✅ Payment intent created:", paymentIntent.id);

    res.status(200).json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: cart.totalAmount,
        currency: 'inr'
      }
    });

  } catch (err) {
    console.error("❌ Error creating payment intent:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error creating payment intent", 
      error: err.message 
    });
  }
};

// ✅ Confirm Payment and Create Order
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress } = req.body;

    console.log("✅ Confirming payment:", paymentIntentId);

    // Retrieve the payment intent from Stripe
    const stripeInstance = getStripeInstance();
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        message: "Payment not successful" 
      });
    }

    // Get user's cart
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    if (cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
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
      paymentMethod: "stripe",
      paymentStatus: "paid",
      paymentId: paymentIntentId,
      deliveryLocation: user.location || finalShippingAddress.addressLine1,
      shippingAddress: finalShippingAddress,
      orderStatus: "Processing"
    });

    // Set delivery date (3 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    order.deliveryDate = deliveryDate;
    await order.save();

    // Update product stock
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
      .populate("products.productId", "name type description images image");

    console.log("✅ Order created successfully:", order._id);

    res.status(201).json({
      success: true,
      message: "Payment confirmed and order created successfully",
      data: { order: fullOrder },
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

// 🔍 Get Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const stripeInstance = getStripeInstance();
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: true,
      message: "Payment status retrieved successfully",
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back to rupees
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      }
    });

  } catch (err) {
    console.error("❌ Error getting payment status:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error getting payment status", 
      error: err.message 
    });
  }
};

// 💰 Process Refund
export const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    if (order.paymentMethod !== "stripe" || !order.paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: "This order is not eligible for Stripe refund" 
      });
    }

    // Create refund
    const stripeInstance = getStripeInstance();
    const refund = await stripeInstance.refunds.create({
      payment_intent: order.paymentId,
      reason: 'requested_by_customer'
    });

    // Update order status
    order.paymentStatus = "refunded";
    order.orderStatus = "Refunded";
    await order.save();

    // Restore product stock
    for (const orderProduct of order.products) {
      await Product.findByIdAndUpdate(
        orderProduct.productId,
        { $inc: { stock: orderProduct.quantity } }
      );
    }

    console.log("💰 Refund processed successfully:", refund.id);

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (err) {
    console.error("❌ Error processing refund:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error processing refund", 
      error: err.message 
    });
  }
};

// 🛒 Create Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;

    // Validate and compute line_items
    const line_items = items.map(it => ({
      price_data: {
        currency: it.currency || 'usd',
        product_data: { name: `${it.name} (${it.unit})` },
        unit_amount: Math.round(it.unitPrice * 100) // convert to cents
      },
      quantity: it.quantity
    }));

    const stripeInstance = getStripeInstance();
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`
    });

    console.log("✅ Checkout session created:", session.id);

    res.status(200).json({
      success: true,
      message: "Checkout session created successfully",
      data: { url: session.url }
    });

  } catch (err) {
    console.error("❌ Error creating checkout session:", err);
    res.status(500).json({
      success: false,
      message: "Error creating checkout session",
      error: err.message
    });
  }
};

// 🔔 Handle Stripe Webhook
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripeInstance = getStripeInstance();
    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  // Handle event types
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Payment successful for session:', session.id);

    try {
      // Retrieve the order by metadata or session id (assumption: session id in metadata or external_reference)
      // If you have saved order id or user info in metadata, use that to find order
      // Here assuming you saved userId or orderId in session.metadata or session.client_reference_id

      // Example: Assuming client_reference_id stores order id or user id
      const stripeInstance = getStripeInstance();
      
      // We will try to get the order by userId from session metadata and update its payment status
      const userId = session.client_reference_id || (session.metadata && session.metadata.userId);
      if (!userId) {
        console.warn('Webhook: No userId or client_reference_id found in session');
        return res.status(400).json({ message: 'Missing user reference in session' });
      }
      
      // Find unpaid order for this user with paymentMethod 'checkout' and paymentStatus 'pending'
      const orderToUpdate = await Order.findOne({
        userId,
        paymentMethod: 'checkout',
        paymentStatus: 'pending',
      }).sort({ createdAt: -1 });

      if (!orderToUpdate) {
        console.warn('Webhook: No matching order found for user:', userId);
      } else {
        orderToUpdate.paymentStatus = 'paid';
        orderToUpdate.orderStatus = 'Processing'; // or 'Paid', depending on your flow
        orderToUpdate.paymentId = session.id;
        // Set delivery date (3 days from now) or configurable
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3);
        orderToUpdate.deliveryDate = deliveryDate;
        await orderToUpdate.save();
        console.log('✅ Order updated as paid for webhook:', orderToUpdate._id);
      }
    } catch (err) {
      console.error('❌ Error handling checkout.session.completed webhook:', err);
    }
  }

  res.sendStatus(200);
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  createCheckoutSession,
  handleWebhook,
};
  handleWebhook,
};
