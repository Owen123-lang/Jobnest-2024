import express from "express";
import { 
  createProfile, 
  updateProfile,
  getProfileByUserId, 
    deleteProfile,
  getMyProfile
} from "../controllers/profileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes - require authentication
router.post("/", verifyToken, createProfile);
router.put("/", verifyToken, updateProfile);
router.delete("/", verifyToken, deleteProfile);
router.get("/me", verifyToken, getMyProfile);

// Public route - get profile by user ID
router.get("/user/:userId", getProfileByUserId);
router.get("/", getProfileByUserId);

export default router;