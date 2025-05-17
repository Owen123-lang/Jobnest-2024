import express from "express";
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from "../controllers/jobController.js";
import { verifyToken, checkCompanyOwnerOrAdmin, checkCompanyRole} from "../middleware/authMiddleware.js";

const router = express.Router();

// Route untuk public (tidak perlu login)
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// Route khusus untuk company (perlu login dan role company)
router.post("/", verifyToken, checkCompanyRole, checkCompanyOwnerOrAdmin, createJob);
router.put("/:id", verifyToken, checkCompanyRole, updateJob);
router.delete("/delete/:id", verifyToken, checkCompanyRole, deleteJob);

export default router;