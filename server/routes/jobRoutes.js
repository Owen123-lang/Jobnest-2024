import express from "express";
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from "../controllers/jobController.js";
import { verifyToken, checkUserRole, checkCompanyRole, getCompanyIdForUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes for job listings and details
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// ✅ Hanya company bisa CRUD job
router.post("/", verifyToken, checkCompanyRole, getCompanyIdForUser, createJob);
router.put("/:id", verifyToken, checkCompanyRole, updateJob);
router.delete("/delete/:id", verifyToken, checkCompanyRole, deleteJob);

export default router;
