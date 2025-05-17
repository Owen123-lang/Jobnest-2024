import express from "express";
import {
  createSkill,
  getMySkills,
  getUserSkills,
  updateSkill,
  deleteSkill,
  getAllSkills
} from "../controllers/skillController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes - require authentication
router.post("/", verifyToken, createSkill);
router.get("/me", verifyToken, getMySkills);
router.put("/:id", verifyToken, updateSkill);
router.delete("/:id", verifyToken, deleteSkill);

// Public route - anyone can view user skills
router.get("/user/:userId", getUserSkills);

// Admin route - get all skills
router.get("/", verifyToken, getAllSkills); // You might want to add admin role check

export default router;