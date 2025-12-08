import Stripe from "stripe";
import Payment from "../models/Payment.js";
import Order from "../models/order.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------------
// Create Payment (Checkout URL)
// -------------------------
export const createPayment = async (req, res) => {
  try {
    const { amount, items, subtotal, tax, shipping_fee, delivery_address } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Bio Gas and Fertilizer Payment" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }
      ],
      mode: "payment",
      success_url: "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cart",
      metadata: {
        userId: req.user.id,
        items: JSON.stringify(items),
        subtotal,
        tax,
        shipping_fee,
        delivery_address: JSON.stringify(delivery_address),
      }
    });

    await Payment.create({
      userId: req.user.id,
      amount,
      currency: "inr",
      status: "pending",
      paymentIntentId: session.payment_intent,
      clientSecret: session.id
    });

    res.status(201).json({
      success: true,
      checkoutUrl: session.url,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------
// Confirm Payment & Create Order
// -------------------------
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Missing sessionId" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    const payment = await Payment.findOneAndUpdate(
      { clientSecret: sessionId },
      {
        status: "completed",
        paymentIntentId: session.payment_intent,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // --------------------------------------
    // 🔥 PREVENT DUPLICATE ORDER CREATION
    // (This is the ONLY change — logic same)
    // --------------------------------------
    const existingOrder = await Order.findOne({
      paymentStatus: "paid",
      userId: payment.userId,
      totalAmount: session.amount_total / 100
    });

    if (existingOrder) {
      return res.json({ success: true, payment, order: existingOrder });
    }

    // --------------------------
    // Create Order (same logic)
    // --------------------------
    const orderData = {
      userId: payment.userId,
      products: session.metadata.items ? JSON.parse(session.metadata.items) : [],
      totalAmount: session.amount_total / 100,
      paymentMethod: "stripe_checkout",
      paymentStatus: "paid",
      orderStatus: "Processing",
      shippingAddress: session.metadata.delivery_address
        ? JSON.parse(session.metadata.delivery_address)
        : {},
      deliveryLocation: session.metadata.delivery_address
        ? JSON.parse(session.metadata.delivery_address).addressLine1 || ""
        : "",
    };

    const order = await Order.create(orderData);

    res.json({ success: true, payment, order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------
// Get All Payments (Admin Only)
// -------------------------
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("userId", "name email");
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
