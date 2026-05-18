import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";

import authRoutes    from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes    from "./routes/user.routes.js";
import groupRoutes   from "./routes/group.routes.js";

dotenv.config();

const app    = express();
const server = createServer(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Connect DB ──────────────────────────────────────────────────────────────
connectDB();

// ── Init Socket.io ──────────────────────────────────────────────────────────
initSocket(server);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/groups",   groupRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "OK", timestamp: new Date() }));

// ── Serve Frontend in Production ──────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (_, res) =>
    res.sendFile(path.join(__dirname, "../client/dist/index.html"))
  );
}

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || "Internal Server Error";
  console.error(`[ERROR] ${req.method} ${req.url} → ${statusCode}: ${message}`);
  res.status(statusCode).json({ success: false, message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`)
);
