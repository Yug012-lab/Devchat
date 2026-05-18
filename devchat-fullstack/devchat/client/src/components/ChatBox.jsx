import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import useChatStore from "../store/useChatStore.js";
import useAuthStore from "../store/useAuthStore.js";
import useTyping    from "../hooks/useTyping.js";

const EMOJIS = ["😄","🔥","👀","🚀","💯","✅","🎉","😅","👍","🤔","💡","⚡","🙌","😂","❤️","🎯"];

const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (ts) => {
  const d = new Date(ts).toDateString();
  return d === new Date().toDateString() ? "Today" : d;
};

export default function ChatBox() {
  const [input, setInput]   = useState("");
  const [emoji, setEmoji]   = useState(false);
  const [imgFile, setImg]   = useState(null);
  const [imgPrev, setImgPrev] = useState("");
  const endRef   = useRef();
  const inputRef = useRef();
  const fileRef  = useRef();

  const { authUser }                                    = useAuthStore();
  const { selectedUser, messages, isLoadingMessages, sendMessage, typingUsers } = useChatStore();
  const { emitTyping, emitStopTyping }                  = useTyping();

  const isTyping = typingUsers[selectedUser?._id];

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping();
  };

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setImg(file); setImgPrev(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !imgFile) return;

    emitStopTyping();
    setInput("");
    setEmoji(false);

    try {
      await sendMessage(text, imgPrev || "");
      setImg(null);
      setImgPrev("");
    } catch (_) {
      toast.error("Failed to send message");
    }
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group messages by date
  const grouped = [];
  let lastDate  = null;
  messages.forEach(m => {
    const d = fmtDate(m.createdAt || m.ts);
    if (d !== lastDate) { grouped.push({ type: "date", label: d }); lastDate = d; }
    grouped.push({ type: "msg", ...m });
  });

  const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const s = {
    wrap    : { flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#0f1117", fontFamily: "'Space Mono', monospace" },
    header  : { padding: "16px 24px", borderBottom: "1px solid #1e2130", display: "flex", alignItems: "center", gap: 14, background: "#0d0f14" },
    msgs    : { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 2 },
    inputWrap: { padding: "14px 24px", borderTop: "1px solid #1e2130", background: "#0d0f14", display: "flex", gap: 10, alignItems: "flex-end" },
    input   : { flex: 1, padding: "10px 14px", background: "#1a1d27", border: "1px solid #252836", borderRadius: 12, color: "#e2e8f0", fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none", resize: "none", maxHeight: 100, overflowY: "auto", lineHeight: 1.5 },
    sendBtn : (active) => ({ background: active ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "#1a1d27", border: "none", borderRadius: 10, width: 40, height: 40, cursor: active ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.2s", flexShrink: 0 }),
    iconBtn : (active) => ({ background: active ? "rgba(99,102,241,0.2)" : "#1a1d27", border: `1px solid ${active ? "#6366f1" : "#252836"}`, borderRadius: 10, width: 40, height: 40, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }),
  };

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e580, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", overflow: "hidden" }}>
            {selectedUser.avatar
              ? <img src={selectedUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : getInitials(selectedUser.name)
            }
          </div>
          <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: "50%", background: "#22c55e", border: "2px solid #0d0f14" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.3 }}>{selectedUser.name}</div>
          <div style={{ fontSize: 11, color: isTyping ? "#a5b4fc" : "#22c55e", marginTop: 1 }}>
            {isTyping ? "typing..." : "● Online"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["📞", "📹"].map(ic => (
            <button key={ic} onClick={() => toast("Coming soon!")} style={{ background: "#1a1d27", border: "1px solid #252836", borderRadius: 9, width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>{ic}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={s.msgs}>
        {isLoadingMessages && (
          <div style={{ textAlign: "center", color: "#374151", fontSize: 12, padding: 20 }}>Loading messages...</div>
        )}

        {!isLoadingMessages && grouped.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ fontSize: 40 }}>💬</div>
            <div style={{ color: "#374151", fontSize: 13 }}>Start a conversation with {selectedUser.name}</div>
          </div>
        )}

        {grouped.map((item, i) => {
          if (item.type === "date") return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#1e2130" }} />
              <span style={{ fontSize: 10, color: "#374151", whiteSpace: "nowrap" }}>{item.label}</span>
              <div style={{ flex: 1, height: 1, background: "#1e2130" }} />
            </div>
          );

          const isMe     = item.senderId === authUser._id || item.senderId?._id === authUser._id;
          const senderAv = isMe ? authUser.avatar : selectedUser.avatar;
          const senderNm = isMe ? authUser.name   : selectedUser.name;

          return (
            <div key={item._id || i} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
              {!isMe && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e580,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
                  {senderAv ? <img src={senderAv} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getInitials(senderNm)}
                </div>
              )}
              <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                {item.image && (
                  <img src={item.image} alt="attachment" style={{ maxWidth: 240, borderRadius: 12, marginBottom: 4 }} />
                )}
                {item.text && (
                  <div style={{
                    padding: "10px 14px",
                    background: isMe ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "#1a1d27",
                    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    color: isMe ? "#fff" : "#cbd5e1",
                    fontSize: 13.5, lineHeight: 1.5,
                    border: isMe ? "none" : "1px solid #252836",
                    wordBreak: "break-word",
                  }}>
                    {item.text}
                  </div>
                )}
                <span style={{ fontSize: 10, color: "#374151", marginTop: 3 }}>
                  {fmtTime(item.createdAt || item.ts)} {isMe && item.seen && "· Seen"}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e580,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden" }}>
              {selectedUser.avatar ? <img src={selectedUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getInitials(selectedUser.name)}
            </div>
            <div style={{ background: "#1a1d27", border: "1px solid #252836", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Emoji picker */}
      {emoji && (
        <div style={{ padding: "10px 24px", display: "flex", flexWrap: "wrap", gap: 6, background: "#0d0f14", borderTop: "1px solid #1e2130" }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setInput(v => v + e)} style={{ background: "#1a1d27", border: "1px solid #252836", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 18 }}>{e}</button>
          ))}
        </div>
      )}

      {/* Image preview */}
      {imgPrev && (
        <div style={{ padding: "8px 24px", background: "#0d0f14", borderTop: "1px solid #1e2130", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={imgPrev} alt="preview" style={{ height: 64, borderRadius: 8, objectFit: "cover" }} />
          <button onClick={() => { setImg(null); setImgPrev(""); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
      )}

      {/* Input */}
      <div style={s.inputWrap}>
        <button onClick={() => setEmoji(v => !v)} style={s.iconBtn(emoji)}>😊</button>
        <button onClick={() => fileRef.current.click()} style={s.iconBtn(!!imgPrev)}>📎</button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} style={{ display: "none" }} />
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKey}
          onBlur={emitStopTyping}
          placeholder={`Message ${selectedUser.name}...`}
          rows={1}
          style={s.input}
        />
        <button onClick={handleSend} style={s.sendBtn(!!(input.trim() || imgPrev))}>➤</button>
      </div>
    </div>
  );
}
