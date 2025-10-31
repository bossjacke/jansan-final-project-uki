import express from "express";
import { listOrders, getOrder } from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /api/orders/
router.get("/", authMiddleware, listOrders);
// GET /api/orders/:id
router.get("/:id", authMiddleware, getOrder);

export default router;
