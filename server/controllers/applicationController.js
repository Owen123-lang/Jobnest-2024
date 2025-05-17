import pool from "../config/db.js";

export const getUserApplications = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const result = await pool.query(
      `SELECT a.id, j.title AS job_title, j.id as job_id, a.cv_url, a.applied_at, a.status 
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

export const getApplicationsByJobId = async (req, res) => {
  const jobId = parseInt(req.params.jobId);

  try {
    const result = await pool.query(
      `SELECT a.id, a.user_id, a.cv_url, a.status, a.applied_at,
       u.email as user_email, p.full_name, p.profile_picture
       FROM applications a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE a.job_id = $1
       ORDER BY a.applied_at DESC`,
      [jobId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve applications for job", error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const applicationId = parseInt(req.params.id);
  const { status } = req.body;

  if (!status || !['pending', 'shortlisted', 'interview', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Valid status required" });
  }

  try {
    const result = await pool.query(
      `UPDATE applications 
       SET status = $1 
       WHERE id = $2
       RETURNING *`,
      [status, applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      message: "Application status updated successfully",
      application: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update application status", error: error.message });
  }
};
