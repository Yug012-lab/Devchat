import { useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import useChatStore from "../store/useChatStore.js";

const STOP_TYPING_DELAY = 1000; // ms

const useTyping = () => {
  const socketRef       = useSocket();
  const { selectedUser } = useChatStore();
  const timerRef        = useRef(null);
  const isTypingRef     = useRef(false);

  const emitTyping = useCallback(() => {
    const socket = socketRef?.current;
    if (!socket || !selectedUser) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { receiverId: selectedUser._id });
    }

    // Reset the stop-typing timer
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
      isTypingRef.current = false;
    }, STOP_TYPING_DELAY);
  }, [selectedUser?._id]);

  const emitStopTyping = useCallback(() => {
    const socket = socketRef?.current;
    if (!socket || !selectedUser) return;
    clearTimeout(timerRef.current);
    if (isTypingRef.current) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
      isTypingRef.current = false;
    }
  }, [selectedUser?._id]);

  return { emitTyping, emitStopTyping };
};

export default useTyping;
