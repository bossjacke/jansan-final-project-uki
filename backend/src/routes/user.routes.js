import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
//get user
import { getUserProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.js";


//code 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;



// GET /api/users/profile
router.get("/profile", authMiddleware, getUserProfile);
