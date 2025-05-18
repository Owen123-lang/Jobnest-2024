import express from "express";
import multer from "multer";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyJobs,
  addCompanyAdmin,
  removeCompanyAdmin,
  getAllAdmins,
  getCompanyByUserId,
  getMyCompanyProfile
} from "../controllers/companyController.js";
import { verifyToken, checkCompanyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.get("/:id/jobs", getCompanyJobs);

// Create company route with upload middleware
router.post("/", upload.single('logo'), createCompany);

// Protected routes (authentication required)
router.get("/user/:userId", verifyToken, getCompanyByUserId);
router.get("/profile/me", verifyToken, checkCompanyRole, getMyCompanyProfile);

router.put("/:id", verifyToken, upload.single('logo'), updateCompany);
router.delete("/:id", verifyToken, deleteCompany);

router.post("/admin", verifyToken, addCompanyAdmin);
router.delete("/:companyId/admin/:adminId", verifyToken, removeCompanyAdmin);

// Admin of company
router.get("/admins/all", getAllAdmins); // For super admin use

// Add a new route for notifications
router.get('/api/notifications', (req, res) => {
  res.status(200).json([]); // Return an empty array
});

export default router;
