import express from "express";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyJobs,
  addCompanyAdmin,
  removeCompanyAdmin,
} from "../controllers/companyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.get("/:id/jobs", getCompanyJobs);

// Protected routes (authentication required)
router.post("/", createCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);
router.post("/admin", addCompanyAdmin);
router.delete("/:companyId/admin/:adminId", removeCompanyAdmin);


export default router;
