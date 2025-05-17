import pool from "../config/db.js";

// Create Notification
export const createNotification = async (req, res) => {
    const {user_id, message, is_read = false} = req.body;
    
    if (!user_id || !message) {
        return res.status(400).json({
            message: "User ID and message are required." 
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, message, is_read, created_at) 
            VALUES ($1, $2, $3, NOW())
            RETURNING *`,
            [user_id, message, is_read]
        );

        res.status(201).json({
            message: "Notification created successfully",
            notification: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
    const userId = req.user.id; // Get from JWT token

    try {
        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`, [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            notifications: result.rows
        })
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
    const notification_id = req.body.notification_id; // Get from request body
    const userId = req.user.id; // Get from JWT token

    if (!notification_id || isNaN(notification_id)) {
        return res.status(400).json({ message: "Valid notification ID is required." });
    }

    try {
        const notificationCheck = await pool.query(`SELECT * FROM notifications WHERE id = $1 AND user_id = $2`, [notification_id, userId]);

        if (notificationCheck.rows.length === 0) {
            return res.status(404).json({ 
                message: "Notification not found or you don't have permission to update it." 
            });
        }

        // Update notification to read
        const result = await pool.query(
            `UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1
            RETURNING *`,
            [notification_id]
        );

        res.status(200).json({
            message: "Notification marked as read successfully",
            notification: result.rows[0]
        })
    } catch (error) {
        console.error("Error marking notifcatiion:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
    const userId = req.user.id; // Get from JWT token

    try {
        const result = await pool.query(
            `UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1
            RETURNING *`,
            [userId]
        );

        res.status(200).json({
            message: "All notifications marked as read successfully",
            notifications: result.rows
        })
    } catch (error) {
        console.error("Error marking all notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Delete notification
export const deleteNotification = async (req, res) => {
    const notification_id = req.body.notification_id; // Get from request body
    const user_id = req.user.id; // Get from JWT token

    if (!notification_id || isNaN(notification_id)) {
        return res.status(400).json({ message: "Valid notification ID is required." });
    }

    try {
        const notificationCheck = await pool.query(`SELECT * FROM notifications WHERE id = $1 AND user_id = $2`, [notification_id, user_id]);

        if (notificationCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Notification not found."
            });
        }

        // Delete notification
        await pool.query(
            `DELETE FROM notifications
            WHERE id = $1`,
            [notification_id]
        )

        res.status(200).json({
            message: "Notification deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
