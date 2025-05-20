import express from 'express';
import { createNotification, getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes public
router.post("/create", createNotification);

// Routes protected
router.get("/user", verifyToken, getUserNotifications);
router.put("/read/", verifyToken, markNotificationRead);
router.put("/read-all/", verifyToken, markAllNotificationsRead);
router.delete("/delete/", verifyToken, deleteNotification);

// Route untuk mengatasi masalah 404 di frontend
router.get("/", (req, res) => {
  res.status(200).json([]);  // Mengembalikan array kosong
});

export default router;