import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#0a0c10", fontFamily: "'Space Mono', monospace", gap: 16,
    }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: "#1e2130" }}>404</div>
      <div style={{ fontSize: 18, color: "#6366f1", fontWeight: 700 }}>Page not found</div>
      <div style={{ fontSize: 13, color: "#475569" }}>The page you're looking for doesn't exist.</div>
      <Link to="/" style={{
        marginTop: 8, padding: "10px 24px",
        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
        borderRadius: 10, color: "#fff", textDecoration: "none",
        fontSize: 13, fontWeight: 700,
      }}>
        ← Back to DevChat
      </Link>
    </div>
  );
}
