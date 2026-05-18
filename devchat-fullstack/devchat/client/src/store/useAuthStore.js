import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/axios.js";

const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser   : null,
      isLoading  : false,
      error      : null,

      // ── Signup ──────────────────────────────────────────────────────────────
      signup: async ({ name, email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/signup", { name, email, password });
          set({ authUser: data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || "Signup failed";
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // ── Login ───────────────────────────────────────────────────────────────
      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set({ authUser: data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || "Login failed";
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // ── Logout ──────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (_) {}
        set({ authUser: null });
      },

      // ── Verify token on app load ─────────────────────────────────────────
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/auth/me");
          set({ authUser: data.user, isLoading: false });
        } catch (_) {
          set({ authUser: null, isLoading: false });
        }
      },

      // ── Update profile ───────────────────────────────────────────────────
      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.put("/auth/update-profile", updates);
          set({ authUser: data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || "Update failed";
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name   : "devchat-auth",
      partialize: (state) => ({ authUser: state.authUser }), // only persist user object
    }
  )
);

export default useAuthStore;
