import Stripe from 'stripe';
import logger from "../utils/logger.js";
import Order from "../models/order.model.js";

// Initialize Stripe lazily to ensure environment variables are loaded
let stripe = null;

const getStripe = () => {
  if (!stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set and no fallback key available');
    }
    stripe = new Stripe(stripeSecretKey);
  }
  return stripe;
};

// ==================== PAYMENT CONTROLLERS ====================

/**
 * Create a Payment Intent for direct card payment
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'inr', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required"
      });
    }

    // Create payment intent
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        ...metadata,
        userId: req.user?.id || 'guest'
      },
      automatic_payment_methods: {
        enabled: true,
      },
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      }
    });

    logger.info(`Payment intent created: ${paymentIntent.id}`);

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment intent"
    });
  }
};

/**
 * Create a Checkout Session for Stripe hosted checkout
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { items, shippingAddress, successUrl, cancelUrl } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required"
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.productId?.name || item.name || 'Product',
          description: item.productId?.description || '',
          images: item.productId?.images ? [item.productId.images[0]] : []
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity
    }));

    // Create checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'upi', 'netbanking'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.CLIENT_URL}/payment/cancel`,
      customer_email: req.user?.email,
      metadata: {
        userId: req.user?.id || 'guest',
        shippingAddress: JSON.stringify(shippingAddress || {}),
        items: JSON.stringify(items)
      },
      shipping_address_collection: {
        allowed_countries: ['IN', 'US', 'GB']
      },
      payment_method_options: {
        upi: {
          supported_countries: ['IN']
        }
      }
    });

    logger.info(`Checkout session created: ${session.id}`);

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });

  } catch (error) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create checkout session"
    });
  }
};

/**
 * Confirm payment after successful payment intent
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderData } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required"
      });
    }

    // Retrieve payment intent to confirm status
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not successful. Status: ${paymentIntent.status}`
      });
    }

    // Create order if order data is provided
    let order = null;
    if (orderData) {
      order = new Order({
        ...orderData,
        paymentDetails: {
          paymentIntentId: paymentIntent.id,
          paymentMethod: 'stripe',
          status: 'completed',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          stripeChargeId: paymentIntent.charges.data[0]?.id
        },
        orderStatus: 'confirmed',
        paymentStatus: 'paid'
      });

      await order.save();
      logger.info(`Order created after payment confirmation: ${order._id}`);
    }

    res.status(200).json({
      success: true,
      data: {
        paymentIntent: paymentIntent,
        order: order
      },
      message: "Payment confirmed successfully"
    });

  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm payment"
    });
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required"
      });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata
      }
    });

  } catch (error) {
    logger.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get payment status"
    });
  }
};

/**
 * Process refund
 */
export const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, amount } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.paymentDetails?.paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "No payment found for this order"
      });
    }

    // Create refund
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentDetails.paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if amount provided
      reason: reason || 'requested_by_customer',
      metadata: {
        orderId: order._id.toString()
      }
    });

    // Update order status
    order.paymentDetails.status = 'refunded';
    order.paymentDetails.refundId = refund.id;
    order.orderStatus = 'refunded';
    await order.save();

    logger.info(`Refund processed for order ${orderId}: ${refund.id}`);

    res.status(200).json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      },
      message: "Refund processed successfully"
    });

  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process refund"
    });
  }
};

/**
 * Handle Stripe webhooks
 */
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('Stripe webhook secret not configured');
    return res.status(500).json({
      success: false,
      message: "Webhook secret not configured"
    });
  }

  let event;

  try {
    // Verify webhook signature
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: `Webhook signature verification failed: ${err.message}`
    });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    logger.error(`Error processing webhook event ${event.type}:`, error);
    res.status(500).json({
      success: false,
      message: "Error processing webhook event"
    });
  }
};

/**
 * Handle successful payment intent
 */
async function handlePaymentSucceeded(paymentIntent) {
  try {
    logger.info(`Payment succeeded: ${paymentIntent.id}`);

    // Check if order already exists for this payment intent
    const existingOrder = await Order.findOne({
      'paymentDetails.paymentIntentId': paymentIntent.id
    });

    if (existingOrder) {
      logger.info(`Order already exists for payment intent ${paymentIntent.id}`);
      return;
    }

    // Create order from metadata if available
    if (paymentIntent.metadata.items) {
      const items = JSON.parse(paymentIntent.metadata.items);
      const shippingAddress = paymentIntent.metadata.shippingAddress 
        ? JSON.parse(paymentIntent.metadata.shippingAddress) 
        : {};

      const order = new Order({
        userId: paymentIntent.metadata.userId,
        items: items,
        shippingAddress: shippingAddress,
        totalAmount: paymentIntent.amount / 100,
        paymentDetails: {
          paymentIntentId: paymentIntent.id,
          paymentMethod: 'stripe',
          status: 'completed',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          stripeChargeId: paymentIntent.charges.data[0]?.id
        },
        orderStatus: 'confirmed',
        paymentStatus: 'paid'
      });

      await order.save();
      logger.info(`Order created from webhook: ${order._id}`);
    }

  } catch (error) {
    logger.error('Error handling payment succeeded:', error);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    logger.error(`Payment failed: ${paymentIntent.id}, reason: ${paymentIntent.last_payment_error?.message}`);

    // You could update order status or send notification here
    // This is mainly for logging and monitoring

  } catch (error) {
    logger.error('Error handling payment failed:', error);
  }
}

/**
 * Handle completed checkout session
 */
async function handleCheckoutCompleted(session) {
  try {
    logger.info(`Checkout session completed: ${session.id}`);

    // Check if order already exists for this session
    const existingOrder = await Order.findOne({
      'paymentDetails.checkoutSessionId': session.id
    });

    if (existingOrder) {
      logger.info(`Order already exists for checkout session ${session.id}`);
      return;
    }

    // Create order from session metadata
    if (session.metadata.items) {
      const items = JSON.parse(session.metadata.items);
      const shippingAddress = session.metadata.shippingAddress 
        ? JSON.parse(session.metadata.shippingAddress) 
        : {};

      const order = new Order({
        userId: session.metadata.userId,
        items: items,
        shippingAddress: {
          ...shippingAddress,
          ...session.shipping_details?.address
        },
        totalAmount: session.amount_total / 100,
        paymentDetails: {
          checkoutSessionId: session.id,
          paymentIntentId: session.payment_intent,
          paymentMethod: 'stripe_checkout',
          status: 'completed',
          amount: session.amount_total / 100,
          currency: session.currency,
          customerEmail: session.customer_details?.email
        },
        orderStatus: 'confirmed',
        paymentStatus: 'paid'
      });

      await order.save();
      logger.info(`Order created from checkout session: ${order._id}`);
    }

  } catch (error) {
    logger.error('Error handling checkout completed:', error);
  }
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentCanceled(paymentIntent) {
  try {
    logger.info(`Payment canceled: ${paymentIntent.id}`);

    // You could update order status or send notification here

  } catch (error) {
    logger.error('Error handling payment canceled:', error);
  }
}

/**
 * Handle dispute created
 */
async function handleDisputeCreated(charge) {
  try {
    logger.error(`Dispute created for charge: ${charge.id}, amount: ${charge.amount / 100}`);

    // Find order associated with this charge
    const order = await Order.findOne({
      'paymentDetails.stripeChargeId': charge.id
    });

    if (order) {
      order.paymentDetails.status = 'disputed';
      order.orderStatus = 'under_review';
      await order.save();
      logger.info(`Order ${order._id} marked as disputed`);
    }

  } catch (error) {
    logger.error('Error handling dispute created:', error);
  }
}

export default {
  createPaymentIntent,
  createCheckoutSession,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  handleWebhook,
};
