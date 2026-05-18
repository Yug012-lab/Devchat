import Message      from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";

// ── Utility: find or create a 1-on-1 conversation ────────────────────────────
const getOrCreateConversation = async (userA, userB) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userA, userB] },
    isGroup: false,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userA, userB],
    });
  }

  return conversation;
};

// ── GET /api/messages/:id — fetch chat history ────────────────────────────────
export const getMessages = async (req, res, next) => {
  try {
    const { id: receiverId } = req.params;
    const senderId           = req.user._id;

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      isGroup: false,
    });

    if (!conversation) {
      return res.json({ success: true, messages: [], total: 0 });
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: conversation._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "name avatar")
        .lean(),
      Message.countDocuments({ conversationId: conversation._id }),
    ]);

    // Return oldest first
    res.json({
      success: true,
      messages: messages.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/messages/:id — send a message ───────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { id: receiverId } = req.params;
    const senderId           = req.user._id;
    const { text, image }    = req.body;

    if (!text && !image) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const conversation = await getOrCreateConversation(senderId, receiverId);

    // Handle image upload to Cloudinary
    let imageUrl = "";
    if (image) {
      const { default: cloudinary } = await import("../config/cloudinary.js");
      const result = await cloudinary.uploader.upload(image, {
        folder: "devchat/messages",
      });
      imageUrl = result.secure_url;
    }

    const message = await Message.create({
      senderId,
      receiverId,
      conversationId: conversation._id,
      text : text || "",
      image: imageUrl,
    });

    // Update lastMessage on conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    // ── Real-Time Delivery via Socket.io ──────────────────────────────────────
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("receiveMessage", message);
    }

    await message.populate("senderId", "name avatar");

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/messages/:id/seen — mark messages as seen ───────────────────────
export const markAsSeen = async (req, res, next) => {
  try {
    const { id: senderId } = req.params;
    const receiverId       = req.user._id;

    await Message.updateMany(
      { senderId, receiverId, seen: false },
      { seen: true, seenAt: new Date() }
    );

    // Notify sender their messages were read
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      getIO().to(senderSocketId).emit("messagesSeen", { by: receiverId });
    }

    res.json({ success: true, message: "Messages marked as seen" });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/messages/conversations — all conversations for sidebar ────────────
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isGroup: false,
    })
      .populate("participants", "name avatar isOnline lastSeen")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean();

    // Attach unread count per conversation
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiverId    : req.user._id,
          seen          : false,
        });

        const otherUser = conv.participants.find(
          (p) => p._id.toString() !== req.user._id.toString()
        );

        return { ...conv, unreadCount, otherUser };
      })
    );

    res.json({ success: true, conversations: enriched });
  } catch (err) {
    next(err);
  }
};
