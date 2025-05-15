import express from 'express';
import { createNotification, getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes public
router.post("/create", createNotification);

// Routes protected
router.get("/user/", verifyToken, getUserNotifications);
router.put("/read/", verifyToken, markNotificationRead);
router.put("/read-all/", verifyToken, markAllNotificationsRead);
router.delete("/delete/", verifyToken, deleteNotification);


export default router;