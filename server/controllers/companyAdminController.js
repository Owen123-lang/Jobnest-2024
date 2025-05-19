import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { streamUpload } from "../utils/streamUpload.js";

// Register a new company admin
export const registerCompanyAdmin = async (req, res) => {
  const { company_name, email, password, role } = req.body;

  if (!email || !password || !company_name) {
    return res.status(400).json({ message: "Company name, email and password are required." });
  }

  try {
    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Check if user exists
      const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "Email already registered." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user with company_admin role
      const newUser = await pool.query(
        "INSERT INTO users (email, password, role, created_at, last_login) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, email, role, created_at",
        [email, hashedPassword, "company_admin"]
      );

      const user = newUser.rows[0];

      // Create company record
      const newCompany = await pool.query(
        "INSERT INTO companies (user_id, name) VALUES ($1, $2) RETURNING id",
        [user.id, company_name]
      );
      
      const companyId = newCompany.rows[0].id;

      // Link user as company admin
      await pool.query(
        "INSERT INTO company_admin (company_id, user_id, role_in_company) VALUES ($1, $2, $3)",
        [companyId, user.id, 'admin']
      );

      // Commit transaction
      await pool.query('COMMIT');

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, company_id: companyId },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Return success with user and token
      return res.status(201).json({
        message: "Company admin registered successfully",
        token,
        admin: {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: companyId
        }
      });
    } catch (error) {
      // Rollback in case of error
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error("Error registering company admin:", error);
    return res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// Login company admin
export const loginCompanyAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Find user by email
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const user = userResult.rows[0];

    // Verify role is company_admin
    if (user.role !== 'company_admin') {
      return res.status(403).json({ message: "Access denied. Not a company admin account." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Get company ID for this admin
    const companyResult = await pool.query(
      "SELECT company_id FROM company_admin WHERE user_id = $1",
      [user.id]
    );

    let companyId = null;
    if (companyResult.rows.length > 0) {
      companyId = companyResult.rows[0].company_id;
    }

    // Update last login
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        company_id: companyId
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success with token and admin data
    return res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: companyId
      }
    });

  } catch (error) {
    console.error("Error logging in company admin:", error);
    return res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// Create company profile
export const createCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify user is company admin
    const adminCheck = await pool.query(
      "SELECT company_id FROM company_admin WHERE user_id = $1",
      [userId]
    );
    
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied. User is not a company admin." });
    }
    
    const companyId = adminCheck.rows[0].company_id;
    
    // Check if company profile already exists
    const companyCheck = await pool.query(
      "SELECT * FROM companies WHERE id = $1",
      [companyId]
    );
    
    if (companyCheck.rows.length === 0) {
      return res.status(404).json({ message: "Company not found." });
    }
    
    // Extract company profile data from request body
    const {
      name,
      industry,
      size,
      location,
      founded,
      website,
      description,
      vision,
      mission
    } = req.body;
    
    let logoUrl = null;
    
    // Handle logo upload if present
    if (req.file) {
      try {
        const result = await streamUpload(req.file.buffer);
        logoUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Error uploading company logo:", uploadError);
        return res.status(400).json({ message: "Error uploading company logo", error: uploadError.message });
      }
    }
    
    // Update company profile
    const updatedCompany = await pool.query(
      `UPDATE companies SET
        name = COALESCE($1, name),
        industry = COALESCE($2, industry),
        size = COALESCE($3, size),
        location = COALESCE($4, location),
        founded = COALESCE($5, founded),
        website = COALESCE($6, website),
        description = COALESCE($7, description),
        vision = COALESCE($8, vision),
        mission = COALESCE($9, mission),
        logo = COALESCE($10, logo),
        updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [
        name,
        industry,
        size,
        location,
        founded,
        website,
        description,
        vision,
        mission,
        logoUrl,
        companyId
      ]
    );
    
    if (updatedCompany.rows.length === 0) {
      return res.status(404).json({ message: "Company not found or update failed." });
    }
    
    // Return updated company profile
    return res.status(200).json({
      message: "Company profile updated successfully",
      company: updatedCompany.rows[0]
    });
    
  } catch (error) {
    console.error("Error creating/updating company profile:", error);
    return res.status(500).json({ message: "Server error during profile update", error: error.message });
  }
};

// Get company profile for the authenticated admin
export const getCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify user is company admin and get company ID
    const adminCheck = await pool.query(
      "SELECT company_id FROM company_admin WHERE user_id = $1",
      [userId]
    );
    
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied. User is not a company admin." });
    }
    
    const companyId = adminCheck.rows[0].company_id;
    
    // Get company profile
    const companyResult = await pool.query(
      "SELECT * FROM companies WHERE id = $1",
      [companyId]
    );
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ message: "Company not found." });
    }
    
    // Return company profile
    return res.status(200).json(companyResult.rows[0]);
    
  } catch (error) {
    console.error("Error getting company profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update company profile
export const updateCompanyProfile = async (req, res) => {
  try {
    // This method can share the same implementation as createCompanyProfile
    // since both create and update operations use UPSERT logic
    return await createCompanyProfile(req, res);
    
  } catch (error) {
    console.error("Error updating company profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get company staff members
export const getCompanyStaff = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.params.companyId;
    
    // Verify user is admin for this company
    const adminCheck = await pool.query(
      "SELECT * FROM company_admin WHERE company_id = $1 AND user_id = $2",
      [companyId, userId]
    );
    
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied. Not an admin for this company." });
    }
    
    // Get staff members (both company admins and regular staff)
    const staffResult = await pool.query(
      `SELECT u.id, u.email, u.role, ca.role_in_company 
       FROM users u
       JOIN company_admin ca ON u.id = ca.user_id
       WHERE ca.company_id = $1`,
      [companyId]
    );
    
    return res.status(200).json({
      company_id: companyId,
      staff: staffResult.rows
    });
    
  } catch (error) {
    console.error("Error getting company staff:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add staff member to company
export const addStaffMember = async (req, res) => {
  const { email, role_in_company } = req.body;
  const companyId = req.params.companyId;
  
  if (!email || !companyId || !role_in_company) {
    return res.status(400).json({ message: "Email, company ID and role are required." });
  }
  
  try {
    const userId = req.user.id;
    
    // Verify user is admin for this company
    const adminCheck = await pool.query(
      "SELECT * FROM company_admin WHERE company_id = $1 AND user_id = $2",
      [companyId, userId]
    );
    
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied. Not an admin for this company." });
    }
    
    // Begin transaction
    await pool.query('BEGIN');
    
    try {
      // Check if user exists
      let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      let user;
      
      if (userResult.rows.length === 0) {
        // User doesn't exist, create a new user
        const tempPassword = Math.random().toString(36).slice(-8); // Generate random password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);
        
        // Create user with company_staff role
        const newUser = await pool.query(
          "INSERT INTO users (email, password, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, role",
          [email, hashedPassword, "company_staff"]
        );
        
        user = newUser.rows[0];
        
        // Send email invitation (implement this separately)
        // ...
      } else {
        user = userResult.rows[0];
      }
      
      // Check if this user is already a staff member
      const staffCheck = await pool.query(
        "SELECT * FROM company_admin WHERE company_id = $1 AND user_id = $2",
        [companyId, user.id]
      );
      
      if (staffCheck.rows.length > 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: "This user is already a staff member." });
      }
      
      // Add user as staff member
      await pool.query(
        "INSERT INTO company_admin (company_id, user_id, role_in_company) VALUES ($1, $2, $3)",
        [companyId, user.id, role_in_company]
      );
      
      // Commit transaction
      await pool.query('COMMIT');
      
      return res.status(201).json({
        message: "Staff member added successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          role_in_company: role_in_company
        }
      });
      
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error("Error adding staff member:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove staff member from company
export const removeStaffMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.params.companyId;
    const staffUserId = req.params.userId;
    
    // Verify user is admin for this company
    const adminCheck = await pool.query(
      "SELECT * FROM company_admin WHERE company_id = $1 AND user_id = $2",
      [companyId, userId]
    );
    
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied. Not an admin for this company." });
    }
    
    // Prevent removing the original admin / self-removal
    if (userId === staffUserId) {
      return res.status(400).json({ message: "Cannot remove yourself from the company." });
    }
    
    // Remove user from company staff
    const result = await pool.query(
      "DELETE FROM company_admin WHERE company_id = $1 AND user_id = $2 RETURNING *",
      [companyId, staffUserId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Staff member not found." });
    }
    
    return res.status(200).json({
      message: "Staff member removed successfully",
      removed: {
        company_id: companyId,
        user_id: staffUserId
      }
    });
    
  } catch (error) {
    console.error("Error removing staff member:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET - Dashboard summary for real-time updates
export const getDashboardSummary = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    
    // If no company_id in the user token, fetch from database
    if (!companyId) {
      const companyResult = await pool.query(
        "SELECT id FROM companies WHERE user_id = $1",
        [req.user.id]
      );
      
      if (companyResult.rows.length === 0) {
        return res.status(404).json({ 
          message: "Company profile not found for this user" 
        });
      }
      
      companyId = companyResult.rows[0].id;
    }
    
    // Get job IDs for this company
    const jobsResult = await pool.query(
      "SELECT id FROM jobs WHERE company_id = $1",
      [companyId]
    );
    
    const jobIds = jobsResult.rows.map(job => job.id);
    
    // If no jobs, return zero counts
    if (jobIds.length === 0) {
      return res.status(200).json({
        totalApplicants: 0,
        unreadNotifications: 0
      });
    }
    
    // Count total applicants across all jobs
    const applicantsResult = await pool.query(
      "SELECT COUNT(*) FROM applications WHERE job_id = ANY($1::int[])",
      [jobIds]
    );
    
    // Count unread notifications
    const notificationsResult = await pool.query(
      "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
      [req.user.id]
    );
    
    // Return the summary data
    res.status(200).json({
      totalApplicants: parseInt(applicantsResult.rows[0].count) || 0,
      unreadNotifications: parseInt(notificationsResult.rows[0].count) || 0
    });
    
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};