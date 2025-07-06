import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No authentication token, access denied",
      });
    }

    const token = authHeader.split(" ")[1];
    try {
      console.log(token);
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedToken.userId).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "Invalid Token - User not found",
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default protectRoute;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ1OGI4MzFkZTI3MjhmMzRjOWMxNjQiLCJpYXQiOjE3NDkzODgxNjQsImV4cCI6MTc0OTQ3NDU2NH0.3hE1j5ODwKOr8BiJI0chbxEm7MebXYoEwqE_VQwWVqg
