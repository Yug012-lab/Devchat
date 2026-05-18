import express from "express";
import { signup, login, logout, getMe, updateProfile } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup",         signup);
router.post("/login",          login);
router.post("/logout",         protectRoute, logout);
router.get ("/me",             protectRoute, getMe);
router.put ("/update-profile", protectRoute, updateProfile);

export default router;
