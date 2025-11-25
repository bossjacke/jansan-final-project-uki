import express from 'express';
import bodyParser from 'body-parser';
import { authMiddleware } from '../middleware/auth.js';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  createCheckoutSession,
  handleWebhook
} from '../controllers/payment.controller.js';

const router = express.Router();

// 💳 Create Payment Intent
router.post('/create-payment-intent', authMiddleware, createPaymentIntent);

// ✅ Confirm Payment and Create Order
router.post('/confirm-payment', authMiddleware, confirmPayment);

// 🔍 Get Payment Status
router.get('/status/:paymentIntentId', authMiddleware, getPaymentStatus);

// 💰 Process Refund (Admin only)
router.post('/refund/:orderId', authMiddleware, processRefund);

// 🛒 Create Checkout Session
router.post('/create-checkout-session', authMiddleware, createCheckoutSession);

// 🔔 Stripe Webhook (no auth needed, raw body)
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), handleWebhook);

export default router;
