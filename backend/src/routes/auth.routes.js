import express from 'express';
import { registerUser, loginUser } from '../controllers/user.controller.js';

const router = express.Router();

// POST /api/auth/register → Register user with location
router.post('/register', registerUser);

// POST /api/auth/login → Login and return JWT
router.post('/login', loginUser);

export default router;
