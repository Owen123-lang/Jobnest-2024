import express from "express";
import dotenv from "dotenv";
import uploadRoutes from "../routes/uploadRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import applicationRoutes from "../routes/applicationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
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

// Route untuk aplikasi
app.use("/api", applicationRoutes);

// Route untuk upload CV
app.use("/api", uploadRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
