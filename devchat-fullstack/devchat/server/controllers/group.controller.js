import Conversation from "../models/Conversation.js";
import Message      from "../models/Message.js";
import { getIO, getReceiverSocketId } from "../socket/socket.js";

// ── POST /api/groups — create a group ────────────────────────────────────────
export const createGroup = async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;

    if (!name || !memberIds?.length) {
      return res.status(400).json({ success: false, message: "Group name and members are required" });
    }
    if (memberIds.length < 2) {
      return res.status(400).json({ success: false, message: "A group must have at least 2 other members" });
    }

    const allParticipants = [req.user._id, ...memberIds];

    const group = await Conversation.create({
      participants: allParticipants,
      isGroup     : true,
      groupName   : name.trim(),
      admin       : req.user._id,
    });

    await group.populate("participants", "name avatar isOnline");

    // Notify all members via socket
    allParticipants.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId.toString());
      if (socketId) {
        getIO().to(socketId).emit("newGroup", group);
      }
    });

    res.status(201).json({ success: true, group });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/groups — all groups for current user ─────────────────────────────
export const getGroups = async (req, res, next) => {
  try {
    const groups = await Conversation.find({
      participants: req.user._id,
      isGroup     : true,
    })
      .populate("participants", "name avatar isOnline")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, groups });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/groups/:id/messages — send message to group ────────────────────
export const sendGroupMessage = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const group = await Conversation.findOne({
      _id        : groupId,
      isGroup    : true,
      participants: req.user._id,
    });

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    let imageUrl = "";
    if (image) {
      const { default: cloudinary } = await import("../config/cloudinary.js");
      const result = await cloudinary.uploader.upload(image, { folder: "devchat/messages" });
      imageUrl = result.secure_url;
    }

    const message = await Message.create({
      senderId      : req.user._id,
      receiverId    : groupId, // for group messages receiver = groupId
      conversationId: group._id,
      text          : text || "",
      image         : imageUrl,
    });

    group.lastMessage = message._id;
    await group.save();

    await message.populate("senderId", "name avatar");

    // Emit to all group members via Socket.io room
    getIO().to(groupId).emit("receiveGroupMessage", { groupId, message });

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/groups/:id/messages ──────────────────────────────────────────────
export const getGroupMessages = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const group = await Conversation.findOne({
      _id        : groupId,
      isGroup    : true,
      participants: req.user._id,
    });

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: group._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "name avatar")
        .lean(),
      Message.countDocuments({ conversationId: group._id }),
    ]);

    res.json({ success: true, messages: messages.reverse(), total });
  } catch (err) {
    next(err);
  }
};
