import pool from '../config/db.js';

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
// In companyController.js
export const updateCompany = async (req, res) => {
  const companyId = parseInt(req.params.id);
  const { name, website, industry, description, logo } = req.body;
//   const userId = req.user.id;  // From the JWT token
  
  if (!companyId || isNaN(companyId)) {
    return res.status(400).json({ message: "Valid company ID is required." });
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
    
    // // Check if user owns this company or is an admin
    // if (company.user_id !== userId) {
    //   // Check if user is an admin for this company
    //   const isAdmin = await pool.query(
    //     `SELECT * FROM company_admin WHERE company_id = $1 AND user_id = $2`,
    //     [companyId, userId]
    //   );
      
    //   if (isAdmin.rows.length === 0) {
    //     return res.status(403).json({ message: "You don't have permission to update this company." });
    //   }
    // }
    
    // Update company details
    const query = `
      UPDATE companies 
      SET 
        name = COALESCE($1, name),
        website = COALESCE($2, website),
        industry = COALESCE($3, industry),
        description = COALESCE($4, description),
        logo = COALESCE($5, logo)
      WHERE id = $6
      RETURNING *;
    `;
    
    const values = [
      name || null,
      website || null,
      industry || null,
      description || null,
      logo || null,
      companyId
    ];
    
    const result = await pool.query(query, values);
    
    res.status(200).json({
      message: "Company updated successfully",
      company: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
      return res.status(404).json({ message: "Company not found." });
    }
    
    // Remove sensitive information if needed
    const company = result.rows[0];
    
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new company (CREATE)
export const createCompany = async (req, res) => {
  const { user_id, name, website, industry, description, logo } = req.body;
  
  if (!user_id || !name) {
    return res.status(400).json({ message: "User ID and company name are required." });
  }
  
  try {
    // Check if company already exists for this user
    const existingCompany = await pool.query(
      `SELECT * FROM companies WHERE user_id = $1`,
      [user_id]
    );
    
    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ message: "User already has a company registered." });
    }
    
    // Create new company
    const query = `
      INSERT INTO companies (user_id, name, website, industry, description, logo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const values = [user_id, name, website || null, industry || null, description || null, logo || null];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: "Company created successfully",
      company: result.rows[0]
    });
  } catch (error) {
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};