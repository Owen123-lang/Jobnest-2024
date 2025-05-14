import express from "express";
import { registerUser, loginUser, getAllUsers} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);

export default router;