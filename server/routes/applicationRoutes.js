import express from "express";
import multer from "multer";
import { uploadLimiter } from "../middleware/ratelimiter.js";

import {
  submitApplication,
  getUserApplications,
  getApplicationById,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication
} from "../controllers/applicationController.js";
import { verifyToken, checkCompanyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });


// Protected routes - require authentication
// Create a new job application (USER)
router.post("/create",
  verifyToken,
  // uploadLimiter,
  upload.single("cv"),
  submitApplication);

// Get all applications for the logged-in user (USER)
router.get("/user", verifyToken, getUserApplications);

// Delete an application (For Testing)
router.delete("/:id", verifyToken, deleteApplication);


// Company routes - require company role
// Get all applications for a specific job posting (company access only)
router.get("/job/:jobId/applications", verifyToken, checkCompanyRole, getJobApplications);

// Update application status (pending, reviewed, accepted, rejected) (COMPANY)
router.put("/:id/status", verifyToken, checkCompanyRole, updateApplicationStatus);

// Get a specific application by ID (COMPANY)
router.get("/:id", verifyToken, checkCompanyRole, getApplicationById);


export default router;