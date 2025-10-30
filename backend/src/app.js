import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
const app = express();

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3003", // For development, allows all. Change to frontend URL in production.
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Database connection
connectDB();

export default app;
