import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import pool from "../config/db.js";
import streamUploadUtil from '../utils/streamUpload.js';

export const uploadCV = async (req, res) => {
  try {
    // Log the incoming form data for debugging
    console.log("Form data received:", req.body);
    console.log("File info:", req.file ? req.file.originalname : "No file uploaded");

    // Validate jobId
    const jobId = req.body.jobId ? parseInt(req.body.jobId, 10) : null;
    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({ message: "Job ID is required or invalid." });
    }

    // Validate file upload
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Get user ID from the verified token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const userId = req.user.id;

    // Upload file to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" }, // Ensure the file is uploaded as raw (not image)
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const uploadResult = await streamUpload(req.file.buffer);
    console.log("Cloudinary upload result:", uploadResult);

    // Insert data into PostgreSQL
    const query = `
      INSERT INTO applications (user_id, job_id, cv_url)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, job_id, cv_url;
    `;
    const values = [userId, jobId, uploadResult.secure_url];
    const result = await pool.query(query, values);

    // Respond with success
    res.status(201).json({
      message: "CV uploaded successfully.",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Error uploading CV:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Upload profile picture controller
export const uploadProfilePicture = async (req, res) => {
  try {
    // Upload file to Cloudinary using utility
    const result = await streamUploadUtil.uploadFromRequest(req, { folder: 'profiles' });
    // Update user's profile_picture in database
    const userId = req.user.id;
    const query = `
      UPDATE profiles
      SET profile_picture = $1
      WHERE user_id = $2
      RETURNING *
    `;
    const values = [result.secure_url, userId];
    const updateResult = await pool.query(query, values);
    // Always return secure_url
    const response = { secure_url: result.secure_url };
    if (updateResult.rows.length > 0) {
      response.profile = updateResult.rows[0];
      response.message = 'Profile picture uploaded successfully.';
    }
    res.status(200).json(response);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Upload failed.', error: error.message });
  }
};