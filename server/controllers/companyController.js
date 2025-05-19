import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Upload company logo to Cloudinary using base64 encoding
 * @param {Object} file - Multer file object with buffer property
 * @returns {Promise<string>} - URL of the uploaded image
 * @throws {Error} If upload fails or file format is invalid
 */
export const uploadCompanyLogo = async (file) => {
  // Validate file exists
  if (!file || !file.buffer) {
    throw new Error('No file provided');
  }

  // Validate file type (only accept jpeg and png)
  if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
    throw new Error('Only JPEG and PNG formats are accepted');
  }
  
  try {
    // Convert buffer to base64 data URL
    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    
    // Upload to Cloudinary using base64 data
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      resource_type: 'image',
      folder: 'company_logos',
      format: file.mimetype.split('/')[1] // Extract format (jpeg/png) from mimetype
    });
    
    // Return the secure URL
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error uploading company logo:', error);
    throw new Error(`Logo upload failed: ${error.message}`);
  }
};

// Get all companies (READ)
export const getAllCompanies = async (req, res) => {
  try {
    // Optional pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Optional filtering by industry
    const industry = req.query.industry;
    
    let query;
    let queryParams = [];
    let countQuery;
    
    if (industry) {
      query = `
        SELECT * FROM companies 
        WHERE industry = $1
        ORDER BY name ASC
        LIMIT $2 OFFSET $3
      `;
      countQuery = `SELECT COUNT(*) FROM companies WHERE industry = $1`;
      queryParams = [industry, limit, offset];
    } else {
      query = `
        SELECT * FROM companies 
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
      `;
      countQuery = `SELECT COUNT(*) FROM companies`;
      queryParams = [limit, offset];
    }
    
    const companies = await pool.query(query, queryParams);
    
    // Get total count for pagination
    const countResult = await pool.query(
      countQuery,
      industry ? [industry] : []
    );
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      companies: companies.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving companies", 
      error: error.message 
    });
  }
};

// Update company (UPDATE)
export const updateCompany = async (req, res) => {
  
  try {
    // Debug logs
    console.debug('updateCompany req.body:', req.body);
    console.debug('updateCompany req.file:', req.file);
    console.debug('updateCompany companyId:', req.params.id);

    const companyId = parseInt(req.params.id);
    const { 
      name, website, industry, size, location, 
      founded, description, vision, mission 
    } = req.body;
    
    // Validate company ID
    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({ message: "Valid company ID is required." });
    }
    
    // Validate required fields
    if (name && typeof name !== 'string') {
      return res.status(400).json({ message: "Company name must be a valid string." });
    }
    
    try {
      // Check if company exists
      const companyCheck = await pool.query(
        `SELECT * FROM companies WHERE id = $1`,
        [companyId]
      );
      
      if (companyCheck.rows.length === 0) {
        return res.status(404).json({ message: "Company not found." });
      }
      
      const company = companyCheck.rows[0];
      
      // Initialize logoUrl with existing logo as fallback
      let logoUrl = company.logo;
      let uploadErrorMsg = null;

    // Upload new logo only if file and buffer are provided
    if (req.file && req.file.buffer) {
      try {
        logoUrl = await uploadCompanyLogo(req.file);
      } catch (err) {
        console.error("Logo upload failed, using existing logo:", err);
        uploadErrorMsg = err.message;
      }
    }

    const query = `
      UPDATE companies
      SET
        name = COALESCE($1, name),
        website = COALESCE($2, website),
        industry = COALESCE($3, industry),
        "size" = COALESCE($4, "size"),
        location = COALESCE($5, location),
        founded = COALESCE($6, founded),
        description = COALESCE($7, description),
        vision = COALESCE($8, vision),
        mission = COALESCE($9, mission),
        logo = COALESCE($10, logo)
      WHERE id = $11
      RETURNING *;
    `;
    const values = [
      name || null,
      website || null,
      industry || null,
      size || null,
      location || null,
      founded || null,
      description || null,
      vision || null,
      mission || null,
      logoUrl,
      companyId
    ];

    console.log("Executing SQL update with values:", values);
    const result = await pool.query(query, values);

    const responseMessage = uploadErrorMsg
      ? `Company updated, but logo upload failed: ${uploadErrorMsg}`
      : 'Company profile updated successfully';

    res.status(200).json({ message: responseMessage, company: result.rows[0] });
  } catch (error) {
    console.error("Error in SQL query:", error);
    res.status(500).json({ 
      message: "Server error during update", 
      error: error.message,
      details: error.response?.data || "No additional error details" 
    });
  }
  } catch (error) {
    console.error("Error updating company profile:", error);
    console.error("Error details:", error.response?.data);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      details: error.response?.data || "No additional error details"
    });
  }
};

// Get company profile by ID
export const getCompanyById = async (req, res) => {
  const companyId = parseInt(req.params.id);
  
  if (!companyId || isNaN(companyId)) {
    return res.status(400).json({ message: "Valid company ID is required." });
  }
  
  try {
    const result = await pool.query(
      `SELECT * FROM companies WHERE id = $1`,
      [companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: "Company not found.",
        missingCompanyProfile: true
      });
    }
    
    // Remove sensitive information if needed
    const company = result.rows[0];
    
    res.status(200).json(company);
  } catch (error) {
    console.error("Error retrieving company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get company profile by user ID
export const getCompanyByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId || req.user.id);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Valid user ID is required." });
    }
    
    const result = await pool.query(
      `SELECT * FROM companies WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: "No company profile found for this user. Please create one.",
        missingCompanyProfile: true
      });
    }
    
    // Remove sensitive information if needed
    const company = result.rows[0];
    
    res.status(200).json(company);
  } catch (error) {
    console.error("Error retrieving company profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get company profile for current authenticated user
export const getMyCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM companies WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: "No company profile found. Please create a company profile first.",
        missingCompanyProfile: true
      });
    }
    
    const company = result.rows[0];
    
    res.status(200).json(company);
  } catch (error) {
    console.error("Error retrieving company profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new company (CREATE)
export const createCompany = async (req, res) => {
  // Log request untuk debugging
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  
  // Ekstrak user_id dari token atau body
  const user_id = req.user?.id || req.body.user_id;
  
  // Ekstrak data dengan nilai default
  const {
    name = null, 
    website = null, 
    industry = null, 
    description = "No description provided",
    size = "Unknown", 
    location = "Not specified", 
    founded = null, 
    vision = "No vision provided", 
    mission = "No mission provided"
  } = req.body;

  // Validasi field penting
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  if (!name) {
    return res.status(400).json({ message: "Company name is required." });
  }

  try {
    // Cek apakah perusahaan sudah terdaftar untuk user_id ini
    const existingCompany = await pool.query(
      `SELECT * FROM companies WHERE user_id = $1`,
      [user_id]
    );

    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ message: "User already has a company registered." });
    }

    // Process logo upload if provided
    let logoUrl = null;
    if (req.file) {
      try {
        logoUrl = await uploadCompanyLogo(req.file);
      } catch (uploadError) {
        console.error("Logo upload failed:", uploadError);
        // Continue without logo if upload fails
      }
    }

    const query = `
      INSERT INTO companies (
        user_id, name, website, industry, description,
        "size", location, founded, vision, mission, logo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    // Pastikan nilai default diberikan jika nilai null atau undefined
    const values = [
      user_id,
      name || 'Unnamed Company',
      website || null,
      industry || null,
      description || "No description provided",
      size || "Unknown",
      location || "Not specified",
      founded || null,
      vision || "No vision provided",
      mission || "No mission provided",
      logoUrl
    ];

    console.log("SQL query values:", values); // Log untuk debugging
    
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Company created successfully",
      company: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete company (DELETE)
export const deleteCompany = async (req, res) => {
    const companyId = parseInt(req.params.id);
    // const userId = req.user.id; // Assuming you have user ID from the token

    if (!companyId || isNaN(companyId)) {
        return res.status(400).json({ message: "Valid company ID is required." });
    }

    try {
        const companyCheck = await pool.query(`SELECT * FROM companies WHERE id = $1`, [companyId]);

        if (companyCheck.rows.length === 0) {
            return res.status(404).json({ message: "Company not found." });
        }

        const company = companyCheck.rows[0];

        // // Check if the user is the owner of the company
        // if (company.user_id !== userId) {
        //     return res.status(403).json({ message: "Only the company owner can delete this" });
        // }
        
        // Begin transaction
        await pool.query('BEGIN');

        try {
            // Delete company admins
            await pool.query(
                `DELETE FROM company_admin WHERE company_id = $1`,
                [companyId]
            );

            // Delete job applications
            await pool.query(`DELETE FROM applications WHERE job_id IN (SELECT id FROM jobs WHERE company_id = $1)`, [companyId]);

            // Delete jobs
            await pool.query(
                `DELETE FROM jobs WHERE company_id = $1`,
                [companyId]
            );

            // Delete company
            await pool.query(
                `DELETE FROM companies WHERE id = $1`,
                [companyId]
            )

            // Commit transaction
            await pool.query('COMMIT');

            res.status(200).json({ message: "Company deleted successfully." });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get company jobs
export const getCompanyJobs = async (req, res) => {
  const companyId = parseInt(req.params.id);
  
  if (!companyId || isNaN(companyId)) {
    return res.status(400).json({ message: "Valid company ID is required." });
  }
  
  try {
    const result = await pool.query(
      `SELECT * FROM jobs WHERE company_id = $1 ORDER BY created_at DESC`,
      [companyId]
    );
    
    res.status(200).json({
      jobs: result.rows
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add company admin (no JWT authentication required for testing)
export const addCompanyAdmin = async (req, res) => {
  const { company_id, user_id, role_in_company } = req.body;
  
  if (!company_id || !user_id || !role_in_company) {
    return res.status(400).json({ 
      message: "Company ID, user ID, and role in company are required." 
    });
  }
  
  try {
    // Check if the company exists
    const companyCheck = await pool.query(
      `SELECT * FROM companies WHERE id = $1`,
      [company_id]
    );
    
    if (companyCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Company not found." 
      });
    }
    
    // Check if the user already exists as an admin
    const existingAdmin = await pool.query(
      `SELECT * FROM company_admin WHERE company_id = $1 AND user_id = $2`,
      [company_id, user_id]
    );
    
    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ 
        message: "This user is already an admin for this company." 
      });
    }
    
    // Add the user as admin
    const result = await pool.query(
      `INSERT INTO company_admin (company_id, user_id, role_in_company)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [company_id, user_id, role_in_company]
    );
    
    res.status(201).json({
      message: "Company admin added successfully",
      admin: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove company admin (no JWT authentication required for testing)
export const removeCompanyAdmin = async (req, res) => {
  const adminId = parseInt(req.params.adminId);
  const companyId = parseInt(req.params.companyId);
  
  if (!adminId || isNaN(adminId) || !companyId || isNaN(companyId)) {
    return res.status(400).json({ 
      message: "Valid admin ID and company ID are required." 
    });
  }
  
  try {
    // Check if the company exists
    const companyCheck = await pool.query(
      `SELECT * FROM companies WHERE id = $1`,
      [companyId]
    );
    
    if (companyCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Company not found." 
      });
    }
    
    // Check if the admin exists
    const adminCheck = await pool.query(
      `SELECT * FROM company_admin WHERE company_id = $1 AND user_id = $2`,
      [companyId, adminId]
    );
    
    if (adminCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Admin not found for this company." 
      });
    }
    
    // Remove the admin
    await pool.query(
      `DELETE FROM company_admin WHERE company_id = $1 AND user_id = $2`,
      [companyId, adminId]
    );
    
    res.status(200).json({
      message: "Company admin removed successfully"
    });
  } catch (error) {
    res.status  (500).json({ message: "Server error", error: error.message });
  }
};

// Get all admins across all companies (for admin panel)
export const getAllAdmins = async (req, res) => {
  try {
    // Optional pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Get all company admins with company and user details
    const result = await pool.query(`
      SELECT 
        ca.company_id, 
        ca.user_id, 
        ca.role_in_company,
        c.name as company_name,
        u.email as user_email
      FROM company_admin ca
      JOIN companies c ON ca.company_id = c.id
      JOIN users u ON ca.user_id = u.id
      ORDER BY c.name, ca.role_in_company
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    // Get total count for pagination
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM company_admin
    `);
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      count: result.rows.length,
      totalCount,
      currentPage: page,
      totalPages,
      admins: result.rows
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// PUT /companies/logo
export const uploadCompanyLogoOnly = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find company by user ID
    const result = await pool.query(`SELECT * FROM companies WHERE user_id = $1`, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Company profile not found for this user.' });
    }

    const company = result.rows[0];
    let logoUrl = null;

    if (req.file && req.file.buffer) {
      logoUrl = await uploadCompanyLogo(req.file);
    } else {
      return res.status(400).json({ message: 'Logo file is required.' });
    }

    const update = await pool.query(
      `UPDATE companies SET logo = $1 WHERE id = $2 RETURNING *`,
      [logoUrl, company.id]
    );

    res.status(200).json({ message: 'Logo uploaded successfully.', company: update.rows[0] });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCompanyLogoOnly = async (req, res) => {
  const userId = req.user.id;

  try {
    const company = await pool.query(`SELECT * FROM companies WHERE user_id = $1`, [userId]);
    if (company.rows.length === 0) {
      return res.status(404).json({ message: "Company not found for this user." });
    }

    const companyId = company.rows[0].id;

    let logoUrl = null;
    if (req.file && req.file.buffer) {
      logoUrl = await uploadCompanyLogo(req.file);
    } else {
      return res.status(400).json({ message: "No logo file uploaded." });
    }

    const updateLogo = await pool.query(`
      UPDATE companies SET logo = $1 WHERE id = $2 RETURNING *;
    `, [logoUrl, companyId]);

    res.status(200).json({ message: "Logo updated successfully.", company: updateLogo.rows[0] });
  } catch (error) {
    console.error("Error updating logo:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
