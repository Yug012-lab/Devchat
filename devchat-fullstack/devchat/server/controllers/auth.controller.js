import User from "../models/User.js";
import { generateTokenAndSetCookie } from "../utils/jwt.js";

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Create user (password hashed via pre-save hook in model)
    const user = await User.create({ name: name.trim(), email, password });

    // Issue JWT
    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Fetch user with password field explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Mark online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    generateTokenAndSetCookie(user._id, res);

    res.json({
      success: true,
      message: "Logged in successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    // Mark offline
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.clearCookie("jwt", {
      httpOnly: true,
      secure  : process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── PUT /api/auth/update-profile ──────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (bio  !== undefined) updates.bio = bio;

    if (avatar) {
      // avatar is a base64 string from client → upload to Cloudinary
      const { default: cloudinary } = await import("../config/cloudinary.js");

      // Delete old avatar if exists
      if (req.user.avatarPublicId) {
        await cloudinary.uploader.destroy(req.user.avatarPublicId);
      }

      const result = await cloudinary.uploader.upload(avatar, {
        folder        : "devchat/avatars",
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      });

      updates.avatar          = result.secure_url;
      updates.avatarPublicId  = result.public_id;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    res.json({ success: true, message: "Profile updated", user });
  } catch (err) {
    next(err);
  }
};
