import express from "express";
import { getCustomerOrders, updateOrderStatus } from "../controllers/product.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminOnly } from "../middleware/roleCheck.js";

const router = express.Router();

// GET /api/orders/ - Get customer orders
router.get("/", authMiddleware, getCustomerOrders);
// PUT /api/orders/:orderId - Update order status (Admin only)
router.put("/:orderId", authMiddleware, adminOnly, updateOrderStatus);

export default router;
