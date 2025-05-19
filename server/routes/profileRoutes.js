import express from "express";
import multer from "multer";
import { 
  createProfile, 
  updateProfile,
  getProfileByUserId, 
    deleteProfile,
  getMyProfile
} from "../controllers/profileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();


// Protected routes - require authentication
router.post("/",
  verifyToken,
  upload.single("profile_picture"), 
  // uploadLimiter,
  createProfile);

router.put(
  "/",
  verifyToken,
  upload.single("profile_picture"),
  updateProfile);

router.delete("/", verifyToken, deleteProfile);

router.get("/me", verifyToken, getMyProfile);

// Public route - get profile by user ID
router.get("/user/:userId", getProfileByUserId);
router.get("/", getProfileByUserId);

export default router;