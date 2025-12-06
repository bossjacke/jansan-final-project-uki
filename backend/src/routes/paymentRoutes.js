import express from "express";
import { createPayment, confirmPayment, getAllPayments } from "../controllers/paymentController.js";
import { authMiddleware as protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/roleCheck.js";

const router = express.Router();

router.post("/", protect, createPayment);

// ❗ remove protect — Stripe redirect has no token
router.post("/confirm", confirmPayment);

router.get("/all", protect, adminOnly, getAllPayments);

export default router;
