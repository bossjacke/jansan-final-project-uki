import express from "express";
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleCheck.js';
import {
    createOrder,
    processOrderPayment,
    confirmOrderPayment,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.controller.js';

const router = express.Router();

// User routes
// POST /api/orders - Create order from cart
router.post("/", authMiddleware, createOrder);

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

// Admin routes
// GET /api/orders/admin/all - Get all orders (admin only)
router.get("/admin/all", authMiddleware, adminOnly, getAllOrders);

// PUT /api/orders/:orderId/status - Update order status (admin only)
router.put("/:orderId/status", authMiddleware, adminOnly, updateOrderStatus);

export default router;
