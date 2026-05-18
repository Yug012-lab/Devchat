import { useEffect, useState } from "react";
import Sidebar  from "../components/Sidebar.jsx";
import ChatBox  from "../components/ChatBox.jsx";
import useChatStore from "../store/useChatStore.js";

export default function HomePage() {
  const { selectedUser, fetchUsers } = useChatStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0a0c10" }}>
      <Sidebar />
      {selectedUser
        ? <ChatBox key={selectedUser._id} />
        : <Welcome />
      }
    </div>
  );
}

function Welcome() {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#0f1117", gap: 16, fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 22,
        background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
      }}>⚡</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5 }}>Welcome to DevChat</div>
        <div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>Select a teammate to start messaging</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {["⚡ Real-time", "🔒 JWT Secured", "🌐 Always on"].map(tag => (
          <span key={tag} style={{
            padding: "5px 12px", background: "#1a1d27",
            border: "1px solid #252836", borderRadius: 20,
            fontSize: 11, color: "#6366f1",
          }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
