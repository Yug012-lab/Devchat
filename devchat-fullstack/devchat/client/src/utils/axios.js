import axios from "axios";

const api = axios.create({
  baseURL        : "/api",
  withCredentials: true,          // send cookies (JWT)
  timeout        : 10000,
});

// ── Response interceptor: handle 401 globally ─────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Clear local state and redirect to login
      localStorage.removeItem("devchat-user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
