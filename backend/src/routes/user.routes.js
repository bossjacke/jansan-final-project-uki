import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
//get user
import { getUserProfile,updateUserProfile,deleteUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.js";


//code 

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);





// GET /api/users/profile
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware,    updateUserProfile);
router.delete("/:userId", authMiddleware, deleteUser   );




export default router;