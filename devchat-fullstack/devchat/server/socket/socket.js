import { Server } from "socket.io";

let io;

// userId → socketId map (in-memory; use Redis for multi-instance prod)
const userSocketMap = {};

export const getReceiverSocketId = (userId) => userSocketMap[userId];

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin     : process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    pingTimeout  : 60000,
    pingInterval : 25000,
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
      console.log(`🟢 User connected: ${userId} → socket ${socket.id}`);
    }

    // Broadcast updated online users list to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ── Join group rooms ────────────────────────────────────────────────────
    socket.on("joinGroup", (groupId) => {
      socket.join(groupId);
      console.log(`👥 User ${userId} joined group room ${groupId}`);
    });

    socket.on("leaveGroup", (groupId) => {
      socket.leave(groupId);
    });

    // ── Typing indicators ───────────────────────────────────────────────────
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId: userId });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
      }
    });

    // ── Group typing indicators ─────────────────────────────────────────────
    socket.on("groupTyping", ({ groupId }) => {
      socket.to(groupId).emit("groupTyping", { senderId: userId, groupId });
    });

    socket.on("groupStopTyping", ({ groupId }) => {
      socket.to(groupId).emit("groupStopTyping", { senderId: userId, groupId });
    });

    // ── Message seen ────────────────────────────────────────────────────────
    socket.on("messageSeen", ({ senderId }) => {
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { by: userId });
      }
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      if (userId) {
        delete userSocketMap[userId];
        console.log(`🔴 User disconnected: ${userId}`);
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  console.log("✅ Socket.io initialized");
  return io;
};
