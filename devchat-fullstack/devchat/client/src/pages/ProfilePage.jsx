import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore.js";

export default function ProfilePage() {
  const { authUser, updateProfile, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name    : authUser?.name     || "",
    bio     : authUser?.bio      || "",
    avatar  : authUser?.avatar   || "",
  });
  const [preview, setPreview] = useState(authUser?.avatar || "");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setForm(f => ({ ...f, avatar: reader.result })); // base64
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name cannot be empty"); return; }
    const res = await updateProfile(form);
    if (res.success) {
      toast.success("Profile updated ✅");
      navigate("/");
    } else {
      toast.error(res.message);
    }
  };

  const s = {
    page    : { minHeight: "100vh", background: "#0a0c10", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono', monospace" },
    card    : { width: 460, background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 20, padding: 40 },
    heading : { fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5, marginBottom: 28 },
    avatar  : { width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid #6366f1", cursor: "pointer", display: "block" },
    avatarFb: { width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", fontWeight: 700, cursor: "pointer", border: "3px solid #6366f1" },
    label   : { display: "block", fontSize: 10, color: "#6b7280", marginBottom: 6, letterSpacing: 1 },
    input   : { width: "100%", padding: "11px 14px", background: "#1a1d27", border: "1px solid #252836", borderRadius: 10, color: "#e2e8f0", fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none", boxSizing: "border-box", marginBottom: 16 },
    btn     : { width: "100%", padding: 13, background: "linear-gradient(135deg, #4f46e5, #6366f1)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono', monospace", marginTop: 8 },
    back    : { background: "none", border: "1px solid #252836", borderRadius: 12, color: "#6b7280", padding: "10px 20px", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12, marginTop: 10, width: "100%" },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.heading}>Edit Profile</div>

        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div onClick={() => fileRef.current.click()}>
            {preview
              ? <img src={preview} alt="avatar" style={s.avatar} />
              : <div style={s.avatarFb}>{authUser?.name?.[0]?.toUpperCase()}</div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#475569", marginBottom: 24 }}>Click avatar to upload photo</div>

        <label style={s.label}>FULL NAME</label>
        <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />

        <label style={s.label}>BIO</label>
        <textarea
          style={{ ...s.input, resize: "none", height: 80 }}
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          placeholder="Tell your team about yourself..."
          maxLength={160}
        />
        <div style={{ fontSize: 10, color: "#374151", textAlign: "right", marginTop: -12, marginBottom: 16 }}>{form.bio.length}/160</div>

        <button style={s.btn} onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes →"}
        </button>
        <button style={s.back} onClick={() => navigate("/")}>← Back to Chat</button>
      </div>
    </div>
  );
}
