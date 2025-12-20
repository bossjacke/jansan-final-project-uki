import express from "express";
import { authMiddleware } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import {
    createPaymentIntent,
    confirmPayment,
    getPaymentById,
    getUserPayments,
    processRefund,
    getAllPayments
} from '../controllers/payment.controller.js';

const router = express.Router();

// POST /api/payment/create-payment-intent - Create payment intent
router.post("/create-payment-intent", authMiddleware, createPaymentIntent);

// POST /api/payment/confirm - Confirm payment after successful stripe payment
router.post("/confirm", authMiddleware, confirmPayment);

// GET /api/payment/my - Get logged-in user's payments
router.get("/my", authMiddleware, getUserPayments);

// GET /api/payment/:paymentId - Get specific payment
router.get("/:paymentId", authMiddleware, getPaymentById);

// POST /api/payment/refund - Process refund (Admin only)
router.post("/refund", authMiddleware, roleCheck(['admin']), processRefund);

// GET /api/payment/admin/all - Get all payments (Admin only)
router.get("/admin/all", authMiddleware, roleCheck(['admin']), getAllPayments);

export default router;
