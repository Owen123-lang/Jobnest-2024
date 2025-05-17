import express from "express";
import { registerUser, loginUser, companyLogin, getAllUsers} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/company-login", companyLogin);
router.get("/", getAllUsers);

export default router;