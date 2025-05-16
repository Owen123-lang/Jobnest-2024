import pool from "../config/db.js"

// Create a new favorite (save a job)
export const createFavorite = async (req, res) => {
    const user_id = req.user.id; 
    const { job_id } = req.body;

    if (!job_id) {
        return res.status(400).json({
            message: "Job ID is required"
        });
    }

    try {
        // Check if job exists
        const jobCheck = await pool.query(
            "SELECT * FROM jobs WHERE id = $1",
            [job_id]
        );

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // Check if already favorited
        const existingFavorite = await pool.query(
            "SELECT * FROM favorites WHERE user_id = $1 AND job_id = $2",
            [user_id, job_id]
        );

        if (existingFavorite.rows.length > 0) {
            return res.status(400).json({
                message: "Job already saved to favorites"
            });
        }

        // Add to favorites
        const result = await pool.query(
            `INSERT INTO favorites (user_id, job_id, saved_at) 
             VALUES ($1, $2, NOW()) 
             RETURNING *`, 
            [user_id, job_id]
        );

        res.status(201).json({
            message: "Job favorited successfully",
            favorite: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating favorite:", error);
        res.status(500).json({
            message: "Server error", 
            error: error.message
        });
    }
};

// Get all favorites for current user
export const getUserFavorites = async (req, res) => {
    const user_id = req.user.id;
    
    // Add debug logging
    console.log("Getting favorites for user ID:", user_id);

    try {
        // Simplify the query first to debug
        const result = await pool.query(
            `SELECT * FROM favorites WHERE user_id = $1`,
            [user_id]
        );
        
        console.log("Raw favorites found:", result.rows);
        
        // If basic query works, use your original detailed query
        if (result.rows.length > 0) {
            const detailedResult = await pool.query(
                `SELECT f.id, f.saved_at, j.id as job_id, j.title, j.location, 
                 j.job_type, j.work_mode, j.salary_min, j.salary_max, c.name as company_name
                 FROM favorites f
                 JOIN jobs j ON f.job_id = j.id
                 JOIN companies c ON j.company_id = c.id
                 WHERE f.user_id = $1
                 ORDER BY f.saved_at DESC`,
                [user_id]
            );
            
            res.status(200).json({
                count: detailedResult.rows.length,
                favorites: detailedResult.rows
            });
        } else {
            res.status(200).json({
                count: 0,
                favorites: []
            });
        }
    } catch (error) {
        console.error("Error getting favorites:", error);
        res.status(500).json({
            message: "Server error", 
            error: error.message
        });
    }
};

// Check if a job is favorited by current user
export const checkFavorite = async (req, res) => {
    const user_id = req.user.id;
    const job_id = parseInt(req.params.job_id);

    console.log("Checking favorite for job_id:", job_id, "type:", typeof job_id);
    

    if (!job_id || isNaN(job_id)) {
        return res.status(400).json({
            message: "Valid job ID is required"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM favorites WHERE user_id = $1 AND job_id = $2",
            [user_id, job_id]
        );

        const isFavorited = result.rows.length > 0;

        res.status(200).json({
            isFavorited,
            favorite: isFavorited ? result.rows[0] : null
        });
    } catch (error) {
        console.error("Error checking favorite status:", error);
        res.status(500).json({
            message: "Server error", 
            error: error.message
        });
    }
};

// Delete a favorite (remove from saved jobs)
export const deleteFavoriteByFavoriteId = async (req, res) => {
    const user_id = req.user.id;
    const favorite_id = parseInt(req.params.id);

    if (!favorite_id || isNaN(favorite_id)) {
        return res.status(400).json({
            message: "Valid favorite ID is required"
        });
    }

    try {
        // Check if favorite exists and belongs to user
        const favoriteCheck = await pool.query(
            "SELECT * FROM favorites WHERE id = $1 AND user_id = $2",
            [favorite_id, user_id]
        );

        if (favoriteCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Favorite not found or you don't have permission to delete it"
            });
        }

        // Delete the favorite
        await pool.query(
            "DELETE FROM favorites WHERE id = $1",
            [favorite_id]
        );

        res.status(200).json({
            message: "Job removed from favorites successfully"
        });
    } catch (error) {
        console.error("Error deleting favorite:", error);
        res.status(500).json({
            message: "Server error", 
            error: error.message
        });
    }
};

// Alternative delete by job_id instead of favorite_id
export const deleteFavoriteByJobId = async (req, res) => {
    const user_id = req.user.id;
    const job_id = parseInt(req.params.jobId);

    if (!job_id || isNaN(job_id)) {
        return res.status(400).json({
            message: "Valid job ID is required"
        });
    }

    try {
        // Check if favorite exists
        const favoriteCheck = await pool.query(
            "SELECT * FROM favorites WHERE job_id = $1 AND user_id = $2",
            [job_id, user_id]
        );

        if (favoriteCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found in your favorites"
            });
        }

        // Delete the favorite
        await pool.query(
            "DELETE FROM favorites WHERE job_id = $1 AND user_id = $2",
            [job_id, user_id]
        );

        res.status(200).json({
            message: "Job removed from favorites successfully"
        });
    } catch (error) {
        console.error("Error deleting favorite:", error);
        res.status(500).json({
            message: "Server error", 
            error: error.message
        });
    }
};