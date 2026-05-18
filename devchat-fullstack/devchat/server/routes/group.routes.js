import express from "express";
import {
  createGroup,
  getGroups,
  sendGroupMessage,
  getGroupMessages,
} from "../controllers/group.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/",                  createGroup);
router.get ("/",                  getGroups);
router.post("/:id/messages",      sendGroupMessage);
router.get ("/:id/messages",      getGroupMessages);

export default router;
