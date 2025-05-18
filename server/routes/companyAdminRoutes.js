import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  registerCompanyAdmin,
  loginCompanyAdmin,
  createCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyStaff,
  addStaffMember,
  removeStaffMember
} from "../controllers/companyAdminController.js";

const router = express.Router();

// Configure multer for memory storage (for file uploads)
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

// Authentication routes
router.post("/register", registerCompanyAdmin);
router.post("/login", loginCompanyAdmin);

// Company profile routes (protected)
router.post("/profile", verifyToken, upload.single('logo'), createCompanyProfile);
router.get("/profile", verifyToken, getCompanyProfile);
router.put("/profile", verifyToken, upload.single('logo'), updateCompanyProfile);

// Staff management routes (protected)
router.get("/:companyId/staff", verifyToken, getCompanyStaff);
router.post("/:companyId/staff", verifyToken, addStaffMember);
router.delete("/:companyId/staff/:userId", verifyToken, removeStaffMember);

export default router;