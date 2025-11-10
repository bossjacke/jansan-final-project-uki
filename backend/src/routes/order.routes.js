import express from "express";
import { authMiddleware } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import {
    createOrder,
    confirmOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
} from '../controllers/order.controller.js';

const router = express.Router();

// POST /api/order/create - Create order from cart
router.post("/create", authMiddleware, createOrder);

// POST /api/order/confirm - Confirm order after Stripe success
router.post("/confirm", authMiddleware, confirmOrder);

// GET /api/order/my - Get logged-in user's orders
router.get("/my", authMiddleware, getMyOrders);

// GET /api/order/:orderId - Get specific order
router.get("/:orderId", authMiddleware, getOrderById);

// PUT /api/order/:orderId/status - Update order status (Admin only)
router.put("/:orderId/status", authMiddleware, roleCheck(['admin']), updateOrderStatus);

// DELETE /api/order/:orderId/cancel - Cancel order (User only)
router.delete("/:orderId/cancel", authMiddleware, cancelOrder);

// GET /api/admin/orders - Get all orders (Admin only)
router.get("/admin/orders", authMiddleware, roleCheck(['admin']), getAllOrders);

export default router;
