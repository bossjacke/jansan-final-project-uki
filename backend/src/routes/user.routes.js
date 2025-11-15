import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers
} from "../controllers/user.controller.js";
import { googleLogin } from "../controllers/googleAuth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

// Protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// Admin only routes
router.get("/", authMiddleware, roleCheck(['admin']), getAllUsers);
router.delete("/:userId", authMiddleware, roleCheck(['admin']), deleteUser);

export default router;
