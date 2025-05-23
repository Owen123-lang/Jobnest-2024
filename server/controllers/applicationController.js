import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// CREATE - Submit a new application (USER)
export const submitApplication = async (req, res) => {
  try {
    const user_id = req.user.id; // Get user ID from the token

    // validate job_id from request body
    const job_id = req.body.job_id ? parseInt(req.body.job_id, 10) : null;
    if (!job_id || isNaN(job_id)) {
      return res.status(400).json({ message: "Job ID is required or invalid." });
    }

    // Validate file upload
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No CV file uploaded." });
    }

    // Check if job exists
    const jobCheck = await pool.query("SELECT * FROM jobs WHERE id = $1", [job_id]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: "Job not found." });
    }
    
    // Check if user has already applied for this job
    const existingApplication = await pool.query(
      "SELECT * FROM applications WHERE user_id = $1 AND job_id = $2",
      [user_id, job_id]
    );
    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    // Upload CV to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "job_applications", // specify a folder in Cloudinary
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    }

    // Upload the file to cloudinary
    const uploadResult = await streamUpload(req.file.buffer);
    console.log("Cloudinary upload result:", uploadResult);

    // Get the secure URL from Cloudinary
    const cv_url = uploadResult.secure_url;

    // Insert application into PostgreSQL
    const result = await pool.query(
      `INSERT INTO applications (user_id, job_id, cv_url, status, applied_at)
      VALUES ($1, $2, $3, 'pending', NOW())
      RETURNING *`,
      [user_id, job_id, cv_url]
    );
    const application = result.rows[0];
    
    // Create notification for company with job and applicant context
    // Fetch job title and company user ID
    const jobInfo = await pool.query(
      `SELECT j.title, c.user_id AS company_user_id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1`,
      [job_id]
    );
    if (jobInfo.rows.length > 0) {
      const { title: jobTitle, company_user_id: companyUserId } = jobInfo.rows[0];
      // Fetch applicant name or email
      const userInfo = await pool.query(
        `SELECT u.email, p.full_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = $1`,
        [user_id]
      );
      const applicantName = userInfo.rows[0].full_name || userInfo.rows[0].email;
      const companyNotifMessage = `${applicantName} telah melamar posisi "${jobTitle}".`;
      // Insert notification for company
      const companyNotif = await pool.query(
        `INSERT INTO notifications (user_id, message, is_read, created_at)
         VALUES ($1, $2, false, NOW()) RETURNING *`,
        [companyUserId, companyNotifMessage]
      );
      // Emit real-time notification to company
      const io = req.app.get('io');
      const roomCompany = `user_${companyUserId}`;
      io.to(roomCompany).emit('newNotification', companyNotif.rows[0]);
    }
    
    res.status(201).json({
      message: "Application submitted successfully.",
      application
    });
    return;
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ - Get user applications (USER)
export const getUserApplications = async (req, res) => {
  const user_id = req.user.id; // Get user ID from the token

  try {
    const result = await pool.query(
      `SELECT a.id, a.job_id, j.title AS job_title, a.cv_url, a.status, a.applied_at
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve applications", error: error.message });
  }
};

// READ - Get application by applicatiionId for a specific job (COMPANY)
export const getApplicationById = async (req, res) => {
  const applicationId = parseInt(req.params.id);
  
  if (!applicationId || isNaN(applicationId)) {
    return res.status(400).json({ message: "Valid application ID is required" });
  }
  
  try {
    const result = await pool.query(
      `SELECT a.*, j.title AS job_title, u.email AS applicant_email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [applicationId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ - Get all applications by job_id for a specific job
export const getJobApplications = async (req, res) => {
  const jobId = parseInt(req.params.jobId);
  
  if (!jobId || isNaN(jobId)) {
    return res.status(400).json({ message: "Valid job ID is required" });
  }
  
  try {
    // Optional pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT a.id, a.user_id, a.cv_url, a.status, a.applied_at, 
       u.email AS user_email, 
       p.full_name, p.profile_picture
       FROM applications a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE a.job_id = $1
       ORDER BY a.applied_at DESC
       LIMIT $2 OFFSET $3`,
      [jobId, limit, offset]
    );
    
    // Get total count for pagination
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM applications WHERE job_id = $1",
      [jobId]
    );
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      applications: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE - Update application status
export const updateApplicationStatus = async (req, res) => {
  const applicationId = parseInt(req.params.id);
  const { status } = req.body;
  
  if (!applicationId || isNaN(applicationId)) {
    return res.status(400).json({ message: "Valid application ID is required" });
  }
  
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }
  
  // Validate status
  const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }
  
  try {
    // Check if application exists
    const appCheck = await pool.query(
      "SELECT * FROM applications WHERE id = $1",
      [applicationId]
    );
    
    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Update application status
    const result = await pool.query(
      `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, applicationId]
    );
    
    // Create notification for the applicant with job and company context
    const application = result.rows[0];
    // Fetch job title and company name
    const jobInfo = await pool.query(
      `SELECT j.title, c.name AS company_name FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1`,
      [application.job_id]
    );
    const { title: jobTitle, company_name: companyName } = jobInfo.rows[0] || {};
    let notificationMessage;
    
    switch (status) {
      case 'reviewed':
        notificationMessage = `Your application for "${jobTitle}" at ${companyName} has been reviewed.`;
        break;
      case 'accepted':
        notificationMessage = `Congratulations! Your application for "${jobTitle}" at ${companyName} has been accepted.`;
        break;
      case 'rejected':
        notificationMessage = `We regret to inform you that your application for "${jobTitle}" at ${companyName} has been rejected.`;
        break;
      default:
        notificationMessage = `Update on your application for "${jobTitle}" at ${companyName}.`;
    }
    
    // Insert notification into database and get the record
    const notifResult = await pool.query(
      `INSERT INTO notifications (user_id, message, is_read, created_at)
       VALUES ($1, $2, false, NOW()) RETURNING *`,
      [application.user_id, notificationMessage]
    );
    const newNotification = notifResult.rows[0];
    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    const room = `user_${application.user_id}`;
    io.to(room).emit('newNotification', newNotification);
    
    res.status(200).json({
      message: "Application status updated successfully",
      application: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE - Delete an application
export const deleteApplication = async (req, res) => {
  const applicationId = parseInt(req.params.id);
  
  if (!applicationId || isNaN(applicationId)) {
    return res.status(400).json({ message: "Valid application ID is required" });
  }
  
  try {
    // Check if application exists
    const appCheck = await pool.query(
      "SELECT * FROM applications WHERE id = $1",
      [applicationId]
    );
    
    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Delete application
    await pool.query(
      "DELETE FROM applications WHERE id = $1",
      [applicationId]
    );
    
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
