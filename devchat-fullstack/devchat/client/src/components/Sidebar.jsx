import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
import useChatStore from "../store/useChatStore.js";

export default function Sidebar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { authUser, logout }                              = useAuthStore();
  const { users, selectedUser, onlineUsers, fetchUsers, selectUser, isLoadingUsers } = useChatStore();

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const isOnline    = (userId) => onlineUsers.includes(userId);

  const s = {
    wrap    : { width: 300, minWidth: 300, display: "flex", flexDirection: "column", background: "#0d0f14", borderRight: "1px solid #1e2130", height: "100%", overflow: "hidden", fontFamily: "'Space Mono', monospace" },
    header  : { padding: "20px 20px 16px", borderBottom: "1px solid #1e2130" },
    logoRow : { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    logo    : { fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5 },
    sub     : { fontSize: 11, color: "#475569", marginTop: 1 },
    search  : { width: "100%", padding: "9px 12px 9px 36px", background: "#1a1d27", border: "1px solid #252836", borderRadius: 10, color: "#cbd5e1", fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none", boxSizing: "border-box" },
    section : { padding: "12px 20px 6px", fontSize: 10, color: "#374151", letterSpacing: 2, fontWeight: 700 },
    list    : { flex: 1, overflowY: "auto" },
    item    : (active) => ({ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", cursor: "pointer", background: active ? "rgba(99,102,241,0.12)" : "transparent", borderLeft: active ? "3px solid #6366f1" : "3px solid transparent", transition: "all 0.15s" }),
    foot    : { padding: "14px 20px", borderTop: "1px solid #1e2130", display: "flex", alignItems: "center", gap: 10, background: "#0a0c10" },
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.logoRow}>
          <div>
            <div style={s.logo}>DevChat</div>
            <div style={s.sub}>{onlineUsers.length} online</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
        </div>

        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569" }}>🔍</span>
          <input style={s.search} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teammates..." />
        </div>
      </div>

      <div style={s.section}>DIRECT MESSAGES</div>

      <div style={s.list}>
        {isLoadingUsers && (
          <div style={{ padding: 20, color: "#374151", fontSize: 12, textAlign: "center" }}>Loading...</div>
        )}
        {users.map(user => (
          <div key={user._id} style={s.item(selectedUser?._id === user._id)} onClick={() => selectUser(user)}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e580, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff",
                overflow: "hidden",
              }}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : getInitials(user.name)
                }
              </div>
              <div style={{
                position: "absolute", bottom: 1, right: 1,
                width: 12, height: 12, borderRadius: "50%",
                background: isOnline(user._id) ? "#22c55e" : "#4b5563",
                border: "2px solid #0d0f14",
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: selectedUser?._id === user._id ? "#a5b4fc" : "#e2e8f0" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: isOnline(user._id) ? "#22c55e" : "#475569", marginTop: 1 }}>
                {isOnline(user._id) ? "● Online" : "○ Offline"}
              </div>
            </div>
          </div>
        ))}

        {!isLoadingUsers && users.length === 0 && (
          <div style={{ padding: 20, color: "#374151", fontSize: 12, textAlign: "center" }}>
            No users found
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={s.foot}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #4f46e5, #6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
          cursor: "pointer", overflow: "hidden",
        }} onClick={() => navigate("/profile")}>
          {authUser?.avatar
            ? <img src={authUser.avatar} alt="me" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : getInitials(authUser?.name)
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{authUser?.name}</div>
          <div style={{ fontSize: 10, color: "#22c55e" }}>● Active</div>
        </div>
        <button onClick={handleLogout} style={{
          background: "none", border: "1px solid #252836", borderRadius: 8,
          color: "#6b7280", padding: "5px 10px", cursor: "pointer",
          fontFamily: "'Space Mono', monospace", fontSize: 11,
        }}>
          Exit
        </button>
      </div>
    </div>
  );
}
