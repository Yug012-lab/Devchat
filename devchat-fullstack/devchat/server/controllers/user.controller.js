import User from "../models/User.js";

// ── GET /api/users — all users except self (for sidebar) ─────────────────────
export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;

    const filter = { _id: { $ne: req.user._id } };

    if (search) {
      filter.$or = [
        { name  : { $regex: search, $options: "i" } },
        { email : { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email avatar isOnline lastSeen bio")
      .sort({ isOnline: -1, name: 1 }) // online users first
      .lean();

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/:id — single user profile ──────────────────────────────────
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email avatar isOnline lastSeen bio")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
