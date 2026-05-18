import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore.js";

export default function LoginPage() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    const res = await login(form);
    if (!res.success) toast.error(res.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">⚡</span>
          <div>
            <div className="logo-title">DevChat</div>
            <div className="logo-sub">Real-Time Collaboration</div>
          </div>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-sub">Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>EMAIL</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
