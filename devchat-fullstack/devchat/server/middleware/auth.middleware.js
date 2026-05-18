import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    // Support both cookie and Authorization header (Bearer token)
    const token =
      req.cookies?.jwt ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized — no token provided" });
    }

    const decoded = verifyToken(token);
    const user    = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized — user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[protectRoute]", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired — please log in again" });
    }
    res.status(401).json({ success: false, message: "Unauthorized — invalid token" });
  }
};

export default protectRoute;
