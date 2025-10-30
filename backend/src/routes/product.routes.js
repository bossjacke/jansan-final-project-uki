import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  placeOrder,
  getCustomerOrders,
  updateOrderStatus,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Product CRUD
router.post("/", authMiddleware, createProduct); // Admin
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", authMiddleware, updateProduct); // Admin
router.delete("/:id", authMiddleware, deleteProduct); // Admin

// Orders
router.post("/order", authMiddleware, placeOrder);
router.get("/orders", authMiddleware, getCustomerOrders);
router.put("/orders/:orderId", authMiddleware, updateOrderStatus); // Admin

export default router;
