import express from "express";
import multer from "multer";
import { uploadCV } from "../controllers/uploadController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadLimiter } from "../middleware/ratelimiter.js";

const router = express.Router();

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload-cv",
  verifyToken, // Middleware to verify JWT
  uploadLimiter, // Middleware to limit upload rate
  upload.single("cv"), // Multer middleware to handle file upload
  uploadCV // Controller to handle the upload logic
);

export default router;