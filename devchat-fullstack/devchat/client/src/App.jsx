import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { SocketProvider } from "./context/SocketContext.jsx";
import useAuthStore       from "./store/useAuthStore.js";

import LoginPage   from "./pages/LoginPage.jsx";
import SignupPage  from "./pages/SignupPage.jsx";
import HomePage    from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFound    from "./pages/NotFound.jsx";

// ── Route guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  return authUser ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  return !authUser ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth(); // verify JWT on every app load / refresh
  }, []);

  if (isLoading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0a0c10",
        fontFamily: "monospace", color: "#6366f1", fontSize: 14,
      }}>
        ⚡ Loading DevChat...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SocketProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1d27",
              color      : "#e2e8f0",
              border     : "1px solid #252836",
              fontFamily : "monospace",
              fontSize   : 13,
            },
          }}
        />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute><SignupPage /></PublicRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}
