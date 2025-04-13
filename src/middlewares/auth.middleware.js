import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const portectRoute = async (req, res, next) => {
  try {
    //get token
    const token = req.headers.authorization.split(" ")[1]; //Bearer token
    if (!token) {
      return res.status(401).json({
        message: "No authentication token, access denied",
      });
    }

    //verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedToken.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "Inavlid Token",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Auth failed",
    });
  }
};

export default portectRoute;
