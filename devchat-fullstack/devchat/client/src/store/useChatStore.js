import { create } from "zustand";
import api from "../utils/axios.js";

const useChatStore = create((set, get) => ({
  users            : [],
  conversations    : [],
  selectedUser     : null,
  messages         : [],
  onlineUsers      : [],
  isLoadingMessages: false,
  isLoadingUsers   : false,
  typingUsers      : {}, // { userId: true }

  // ── Fetch all users for sidebar ──────────────────────────────────────────
  fetchUsers: async (search = "") => {
    set({ isLoadingUsers: true });
    try {
      const { data } = await api.get("/users", { params: { search } });
      set({ users: data.users, isLoadingUsers: false });
    } catch (_) {
      set({ isLoadingUsers: false });
    }
  },

  // ── Select a user and load their messages ────────────────────────────────
  selectUser: async (user) => {
    set({ selectedUser: user, messages: [], isLoadingMessages: true });
    try {
      const { data } = await api.get(`/messages/${user._id}`);
      set({ messages: data.messages, isLoadingMessages: false });

      // Mark as seen
      await api.put(`/messages/${user._id}/seen`).catch(() => {});
    } catch (_) {
      set({ isLoadingMessages: false });
    }
  },

  // ── Send a message ───────────────────────────────────────────────────────
  sendMessage: async (text, image = "") => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    try {
      const { data } = await api.post(`/messages/${selectedUser._id}`, { text, image });
      set((s) => ({ messages: [...s.messages, data.message] }));
    } catch (err) {
      throw err;
    }
  },

  // ── Called by Socket listener when a new message arrives ─────────────────
  appendMessage: (message) => {
    const { selectedUser } = get();
    // Only append if it belongs to the active conversation
    if (
      selectedUser &&
      (message.senderId === selectedUser._id ||
       message.senderId?._id === selectedUser._id)
    ) {
      set((s) => ({ messages: [...s.messages, message] }));
    }
  },

  // ── Online users (from socket) ───────────────────────────────────────────
  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

  // ── Typing ───────────────────────────────────────────────────────────────
  setTyping: (userId, isTyping) =>
    set((s) => ({
      typingUsers: { ...s.typingUsers, [userId]: isTyping },
    })),

  clearSelected: () => set({ selectedUser: null, messages: [] }),
}));

export default useChatStore;
