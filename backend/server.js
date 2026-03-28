import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import proSessionRoutes from "./routes/proSessionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "https://preppilot-ai-interview.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

app.set("io", io);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/pro-sessions", proSessionRoutes);
app.use("/api/payments", paymentRoutes);

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;

  if (userId) {
    socket.join(userId);
    console.log(`User ${socket.id} joined room: ${userId}`);
  }

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
