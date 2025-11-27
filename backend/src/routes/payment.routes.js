import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Payment routes disabled - only Cash on Delivery is supported
// All payment processing is handled through the order creation endpoint

export default router;
