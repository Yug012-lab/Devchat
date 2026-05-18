import jwt from "jsonwebtoken";

/**
 * Generate JWT and set it as an HttpOnly cookie
 */
export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("jwt", token, {
    httpOnly  : true,                                    // no JS access
    secure    : process.env.NODE_ENV === "production",   // HTTPS only in prod
    sameSite  : "strict",
    maxAge    : 7 * 24 * 60 * 60 * 1000,                // 7 days in ms
  });

  return token;
};

/**
 * Verify a JWT string (used in middleware)
 */
export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);
