import express from "express";
import { createPaymentIntent } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// POST /api/payments/create-intent
router.post("/create-intent", authMiddleware, createPaymentIntent);

export default router;
