import express from "express";
import dotenv from "dotenv";
import uploadRoutes from "../routes/uploadRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import applicationRoutes from "../routes/applicationRoutes.js";
import jobRoutes from "../routes/jobRoutes.js";
import companyRoutes from "../routes/companyRoutes.js";
import companyAdminRoutes from "../routes/companyAdminRoutes.js";
import profileRoutes from "../routes/profileRoutes.js";
import skillRoutes from "../routes/skillRoutes.js";
import notificationRoutes from "../routes/notificationRoutes.js";
import interestRoutes from "../routes/interestRoutes.js";
import favoritesRoutes from "../routes/favoritesRouter.js"
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  },
});

// Basic CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware untuk parsing JSON
app.use(express.json());
// Middleware untuk parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Server is running. Use /api/upload-cv to upload PDFs");
});

//  route untuk user
app.use("/api/users", userRoutes);

// Route untuk jobs (mount before applications to avoid catch-all)
app.use("/api/jobs", jobRoutes);

// Route untuk aplikasi (applications)
app.use("/api/applications", applicationRoutes);

// Route untuk upload CV
app.use("/api", uploadRoutes);

// Route untuk company
app.use("/api/companies", companyRoutes);

// Route untuk company admin
app.use("/api/company-admin", companyAdminRoutes);

// Route untuk profile
app.use("/api/profile", profileRoutes);

// Route untuk skill
app.use("/api/skill", skillRoutes);

// Route untuk notification
app.use("/api/notification", notificationRoutes);

// Route untuk interest
app.use("/api/interest", interestRoutes);

// Route untuk favorite
app.use("/api/favorite", favoritesRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? "Server error" : err.message,
  });
});

// Make io accessible in request handlers
app.set('io', io);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
