import express from "express";
import { getUsers, getUserById } from "../controllers/user.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/",    getUsers);
router.get("/:id", getUserById);

export default router;
