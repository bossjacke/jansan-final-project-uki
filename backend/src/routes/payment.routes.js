import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
    createPaymentIntent,
    confirmPayment,
    getPaymentHistory,
    getPaymentById,
    cancelPayment
} from '../controllers/payment.controller.js';

const router = express.Router();

// Create payment intent
router.post('/create-intent', authMiddleware, createPaymentIntent);

// Confirm payment
router.post('/confirm', authMiddleware, confirmPayment);

// Get payment history
router.get('/history', authMiddleware, getPaymentHistory);

// Get specific payment
router.get('/:paymentId', authMiddleware, getPaymentById);

// Cancel payment
router.delete('/:paymentId/cancel', authMiddleware, cancelPayment);

export default router;
