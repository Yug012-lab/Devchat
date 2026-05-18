import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/useAuthStore.js";
import useChatStore from "../store/useChatStore.js";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { authUser } = useAuthStore();
  const { appendMessage, setOnlineUsers, setTyping } = useChatStore();

  useEffect(() => {
    if (!authUser) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect
    const socket = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
      {
        query      : { userId: authUser._id },
        withCredentials: true,
        transports : ["websocket", "polling"],
      }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    // ── Event listeners ────────────────────────────────────────────────────
    socket.on("receiveMessage",   (message)  => appendMessage(message));
    socket.on("getOnlineUsers",   (userIds)  => setOnlineUsers(userIds));
    socket.on("typing",           ({ senderId }) => setTyping(senderId, true));
    socket.on("stopTyping",       ({ senderId }) => setTyping(senderId, false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authUser?._id]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
