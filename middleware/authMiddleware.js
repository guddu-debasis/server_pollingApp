// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Protect routes (JWT verification)
 * Reads token from Authorization header
 */
export const protect = (req, res, next) => {
  try {
    // Check Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing"
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id
    };

    next(); // move to controller

  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token invalid"
    });
  }
};
