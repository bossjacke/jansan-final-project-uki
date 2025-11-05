import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  placeOrder,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminOnly } from "../middleware/roleCheck.js";

const router = express.Router();

// Product CRUD
router.post("/", authMiddleware, adminOnly, createProduct); // Admin only
router.get("/", getAllProducts); // Public
router.get("/:id", getProductById); // Public
router.put("/:id", authMiddleware, adminOnly, updateProduct); // Admin only
router.delete("/:id", authMiddleware, adminOnly, deleteProduct); // Admin only

// Orders
router.post("/order", authMiddleware, placeOrder); // Authenticated users

export default router;
