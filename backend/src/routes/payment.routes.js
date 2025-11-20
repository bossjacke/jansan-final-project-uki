import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund
} from '../controllers/payment.controller.js';

const router = express.Router();

// 💳 Create Payment Intent
router.post('/create-payment-intent', auth, createPaymentIntent);

// ✅ Confirm Payment and Create Order
router.post('/confirm-payment', auth, confirmPayment);

// 🔍 Get Payment Status
router.get('/status/:paymentIntentId', auth, getPaymentStatus);

// 💰 Process Refund (Admin only)
router.post('/refund/:orderId', auth, processRefund);

export default router;
