import express from "express";
import {
  getMessages,
  sendMessage,
  markAsSeen,
  getConversations,
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute); // all message routes are protected

router.get ("/conversations",  getConversations);
router.get ("/:id",            getMessages);
router.post("/:id",            sendMessage);
router.put ("/:id/seen",       markAsSeen);

export default router;
