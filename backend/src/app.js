
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import passwordRoutes from "./routes/password.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import paymentController from "./controllers/payment.controller.js";

dotenv.config();
const app = express();

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5175", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179"], // For development, allows all. Change to frontend URL in production.
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Stripe webhook needs the raw body, so define raw body middleware before the webhook route, and json for others
import bodyParser from "body-parser";
app.use(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" })
);

// Webhook route
app.post("/api/payments/webhook", paymentController.handleWebhook);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/password", passwordRoutes); // Password reset routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);

// Database connection
console.log('🔗 Initializing database connection...');
connectDB().catch(err => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
});

export default app;
