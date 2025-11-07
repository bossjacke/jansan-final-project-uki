import express from "express";
import { authMiddleware } from '../middleware/auth.js';
import {
    createOrder,
    processOrderPayment,
    confirmOrderPayment,
    getUserOrders,
    getOrderById,
    cancelOrder
} from '../controllers/order.controller.js';

const router = express.Router();

// User routes
// POST /api/orders - Create order from cart
router.post("/create", authMiddleware, createOrder);

// POST /api/orders/:orderId/payment - Process payment for order
router.post("/:orderId/payment", authMiddleware, processOrderPayment);

// POST /api/orders/:orderId/payment/confirm - Confirm payment
router.post("/:orderId/payment/confirm", authMiddleware, confirmOrderPayment);

// GET /api/orders - Get user's orders
router.get("/", authMiddleware, getUserOrders);

// GET /api/orders/:orderId - Get specific order
router.get("/:orderId", authMiddleware, getOrderById);

// DELETE /api/orders/:orderId - Cancel order
router.delete("/:orderId", authMiddleware, cancelOrder);

export default router;
