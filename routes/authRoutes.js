// src/routes/authRoutes.js
import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register user
// POST /api/auth/register
router.post("/register", register);

// Login user
// POST /api/auth/login
router.post("/login", login);

// Get current user
// GET /api/auth/me
router.get("/me", protect, getMe);

export default router;
