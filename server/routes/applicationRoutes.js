import express from "express";
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

// Public routes (none for applications)

// Protected routes - require authentication
// Create a new job application
router.post("/create", verifyToken, submitApplication);

// Get all applications for the logged-in user
router.get("/user", verifyToken, getUserApplications);

// Get a specific application by ID
router.get("/:id", verifyToken, getApplicationById);

// Update application status (pending, reviewed, accepted, rejected)
router.put("/:id/status", verifyToken, updateApplicationStatus);

// Delete an application
router.delete("/:id", verifyToken, deleteApplication);

// Company routes - require company role
// Get all applications for a specific job posting (company access only)
router.get("/job/:jobId/applications", verifyToken, checkCompanyRole, getJobApplications);

export default router;