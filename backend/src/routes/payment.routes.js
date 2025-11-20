import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund
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

export default router;
