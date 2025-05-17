import express from "express";
import {getUserApplications, getApplicationsByJobId, updateApplicationStatus} from "../controllers/applicationController.js";
import { verifyToken, checkCompanyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// User can view their applications
router.get("/user/:userId", verifyToken, getUserApplications);

// Company can view applications for their jobs
router.get("/job/:jobId", verifyToken, checkCompanyRole, getApplicationsByJobId);

// Company can update application status
router.put("/:id/status", verifyToken, checkCompanyRole, updateApplicationStatus);

export default router;