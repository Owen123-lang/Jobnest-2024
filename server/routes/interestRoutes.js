import express from "express";
import {
    createInterest,
    getMyInterest,
    getUserInterest,
    updateInterest,
    deleteInterest,
    getAllInterests
} from "../controllers/interestController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/create", verifyToken, createInterest);
router.get("/me", verifyToken, getMyInterest);
router.put("/:id", verifyToken, updateInterest);    
router.delete("/:id", verifyToken, deleteInterest);

// Public routes  
router.get("/user/:id", getUserInterest);

// Admin route - get all interests (for admin use)
router.get("/all", verifyToken, getAllInterests);

export default router;
