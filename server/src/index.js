import express from "express";
import dotenv from "dotenv";
import uploadRoutes from "../routes/uploadRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import applicationRoutes from "../routes/applicationRoutes.js";
import jobRoutes from "../routes/jobRoutes.js";
import companyRoutes from "../routes/companyRoutes.js";
import profileRoutes from "../routes/profileRoutes.js";
import skillRoutes from "../routes/skillRoutes.js";
import notificationRoutes from "../routes/notificationRoutes.js";
import interestRoutes from "../routes/interestRoutes.js";
import favoritesRoutes from "../routes/favoritesRouter.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Route untuk jobs
app.use("/api/jobs", jobRoutes);

// Route untuk upload CV
app.use("/api/uploadCV", uploadRoutes);

// Route untuk company
app.use("/api/companies", companyRoutes);

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

app.use("/api/applications", applicationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? "Server error" : err.message,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
