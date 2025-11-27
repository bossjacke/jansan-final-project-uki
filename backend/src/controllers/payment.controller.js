import logger from "../utils/logger.js";

// ==================== PAYMENT CONTROLLERS ====================
// All payment functionality has been removed - only Cash on Delivery is supported
// Payment processing is now handled entirely through the order creation endpoint

// Placeholder function to maintain compatibility
export const createPaymentIntent = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: "Online payments are disabled. Only Cash on Delivery is supported." 
  });
};

export const confirmPayment = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: "Online payments are disabled. Only Cash on Delivery is supported." 
  });
};

export const getPaymentStatus = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: "Online payments are disabled. Only Cash on Delivery is supported." 
  });
};

export const processRefund = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: "Online payments are disabled. Only Cash on Delivery is supported." 
  });
};

export const createCheckoutSession = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: "Online payments are disabled. Only Cash on Delivery is supported." 
  });
};

export const handleWebhook = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: "Online payments are disabled. Only Cash on Delivery is supported." 
  });
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  createCheckoutSession,
  handleWebhook,
};
