import express from "express";
import {getUserApplications} from "../controllers/applicationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/applications/:userId", verifyToken, getUserApplications);

export default router;