import logger from "../utils/logger.js";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import stripe from "stripe";

// Initialize Stripe with secret key
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// ==================== CREATE PAYMENT INTENT ====================
export const createPaymentIntent = async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('CREATE PAYMENT INTENT CALLED');
    console.log('========================================');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user?.id);
    console.log('========================================\n');

    const { amount, orderId, currency = "usd", metadata = {} } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent with Stripe
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user.id,
        orderId: orderId || "",
        ...metadata
      },
      receipt_email: req.user.email
    });

    // Create payment record in database
    const payment = await Payment.create({
      userId: req.user.id,
      orderId: orderId || null,
      stripePaymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: currency,
      status: "pending",
      receiptEmail: req.user.email,
      metadata: new Map(Object.entries(paymentIntent.metadata))
    });

    console.log('Payment Intent Created:', paymentIntent.id);
    console.log('Payment Record Created:', payment._id);

    res.status(200).json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency
      }
    });

  } catch (error) {
    console.error("CREATE PAYMENT INTENT ERROR:", error);
    logger.error("Error creating payment intent:", error);

    res.status(500).json({
      success: false,
      message: "Error creating payment intent",
      error: error.message
    });
  }
};

// ==================== CONFIRM PAYMENT ====================
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required"
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful",
        status: paymentIntent.status
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        status: "succeeded",
        stripeChargeId: paymentIntent.charges.data[0]?.id,
        orderId: orderId || null
      },
      { new: true }
    ).populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    // If order exists, update its status
    if (payment.orderId) {
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: "paid",
        orderStatus: "Processing"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: payment
    });

  } catch (error) {
    console.error("CONFIRM PAYMENT ERROR:", error);
    logger.error("Error confirming payment:", error);

    res.status(500).json({
      success: false,
      message: "Error confirming payment",
      error: error.message
    });
  }
};

// ==================== GET PAYMENT BY ID ====================
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber totalAmount orderStatus');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Check if user owns this payment or is admin
    if (payment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this payment"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment
    });

  } catch (error) {
    console.error("GET PAYMENT ERROR:", error);
    logger.error("Error fetching payment:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message
    });
  }
};

// ==================== GET USER PAYMENTS ====================
export const getUserPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('orderId', 'orderNumber totalAmount orderStatus')
      .populate('userId', 'name email');

    // Get total count for pagination
    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: {
        payments,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("GET USER PAYMENTS ERROR:", error);
    logger.error("Error fetching user payments:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message
    });
  }
};

// ==================== PROCESS REFUND ====================
export const processRefund = async (req, res) => {
  try {
    const { paymentId, reason = "Customer requested refund" } = req.body;

    // Find payment record
    const payment = await Payment.findById(paymentId).populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Check if payment is eligible for refund
    if (payment.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Only successful payments can be refunded"
      });
    }

    // Process refund with Stripe
    const refund = await stripeInstance.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        reason: reason
      }
    });

    // Update payment record
    payment.status = "refunded";
    payment.refundId = refund.id;
    payment.refundAmount = refund.amount;
    payment.refundReason = reason;
    await payment.save();

    // Update order status if exists
    if (payment.orderId) {
      payment.orderId.orderStatus = "Refunded";
      await payment.orderId.save();
    }

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refundId: refund.id,
        refundAmount: refund.amount,
        payment: payment
      }
    });

  } catch (error) {
    console.error("PROCESS REFUND ERROR:", error);
    logger.error("Error processing refund:", error);

    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message
    });
  }
};

// ==================== GET ALL PAYMENTS (ADMIN) ====================
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.userId = userId;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber totalAmount orderStatus');

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "All payments fetched successfully",
      data: {
        payments,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("GET ALL PAYMENTS ERROR:", error);
    logger.error("Error fetching all payments:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message
    });
  }
};
