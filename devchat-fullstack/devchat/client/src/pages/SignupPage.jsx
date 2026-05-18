import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore.js";

export default function SignupPage() {
  const [form, setForm]      = useState({ name: "", email: "", password: "" });
  const { signup, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const res = await signup(form);
    if (!res.success) toast.error(res.message);
    else toast.success("Account created! Welcome to DevChat 🎉");
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

        <h1 className="auth-heading">Create account</h1>
        <p className="auth-sub">Join your team on DevChat</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>FULL NAME</label>
            <input
              type="text"
              placeholder="Alex Chen"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
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
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
