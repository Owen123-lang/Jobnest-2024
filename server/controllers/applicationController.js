import pool from "../config/db.js";

export const getUserApplications = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const result = await pool.query(
      `SELECT a.id, j.title AS job_title, a.cv_url, a.applied_at 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve applications", error: error.message });
  }
};
