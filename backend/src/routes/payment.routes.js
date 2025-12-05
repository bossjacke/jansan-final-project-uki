import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createPaymentIntent,
  createCheckoutSession,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  handleWebhook
} from '../controllers/payment.controller.js';

const router = express.Router();

// Protected payment routes (require authentication)
router.use(authMiddleware);

// Create payment intent for direct card payment
router.post('/create-payment-intent', createPaymentIntent);

// Create checkout session for Stripe hosted checkout
router.post('/create-checkout-session', createCheckoutSession);

// Confirm payment after successful payment intent
router.post('/confirm-payment', confirmPayment);

// Get payment status
router.get('/status/:paymentIntentId', getPaymentStatus);

// Process refund (admin only - you might want to add admin middleware)
router.post('/refund/:orderId', processRefund);

export default router;
