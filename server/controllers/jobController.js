import pool from "../config/db.js";

// CREATE - Tambah lowongan baru
export const createJob = async (req, res) => {
  try {
    console.log("Job creation request body:", req.body); // Log entire request for debugging
    
    const { 
      company_id,
      title, 
      job_type, 
      work_mode, 
      location, 
      salary_min,
      salary_max, 
      description, 
      status = 'active' // Default status is active
    } = req.body;

    // Validasi input
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    if (!company_id) {
      return res.status(400).json({ 
        message: "Company ID is required. Please complete your company profile first.",
        missingCompanyProfile: true
      });
    }

    // Validate data types
    const sanitizedData = {
      company_id: parseInt(company_id),
      title: String(title),
      job_type: job_type ? String(job_type) : 'full_time',
      work_mode: work_mode ? String(work_mode) : 'onsite',
      location: location ? String(location) : null,
      salary_min: salary_min ? parseInt(salary_min) : null,
      salary_max: salary_max ? parseInt(salary_max) : null,
      description: String(description),
      status: status ? String(status) : 'active'
    };

    console.log("Sanitized job data:", sanitizedData);

    // Company existence is already verified by the getCompanyIdForUser middleware
    // Insert the new job
    const query = `
  INSERT INTO jobs (
    company_id, title, job_type, work_mode, location,
    salary_min, salary_max, description, status, created_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
  RETURNING *;
`;

const values = [
  sanitizedData.company_id,
  sanitizedData.title,
  sanitizedData.job_type,
  sanitizedData.work_mode,
  sanitizedData.location,
  sanitizedData.salary_min,
  sanitizedData.salary_max,
  sanitizedData.description,
  sanitizedData.status
];


    console.log("SQL values:", values);
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Job created successfully",
      job: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating job:", error);
    console.error("Error details:", error.stack);
    res.status(500).json({ 
      message: "Server error during job creation", 
      error: error.message,
      details: "Check server logs for more information" 
    });
  }
};

// READ ALL - Ambil semua lowongan
export const getAllJobs = async (req, res) => {
  try {
    // Add support for filtering
    const { location, job_type, work_mode, search } = req.query;
    let query = `SELECT j.*, c.name as company_name 
                FROM jobs j
                LEFT JOIN companies c ON j.company_id = c.id
                WHERE 1=1`;
    
    const params = [];
    let paramCount = 1;
    
    if (location) {
      query += ` AND j.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }
    
    if (job_type) {
      query += ` AND j.job_type = $${paramCount}`;
      params.push(job_type);
      paramCount++;
    }
    
    if (work_mode) {
      query += ` AND j.work_mode = $${paramCount}`;
      params.push(work_mode);
      paramCount++;
    }
    
    if (search) {
      query += ` AND (j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    query += ` ORDER BY j.created_at DESC`;
    
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting jobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ ONE - Ambil detail satu lowongan
export const getJobById = async (req, res) => {
  const jobId = parseInt(req.params.id);

  if (!jobId || isNaN(jobId)) {
    return res.status(400).json({ message: "Valid job ID is required." });
  }

  try {
    const result = await pool.query(
      `SELECT j.*, c.name as company_name
       FROM jobs j
       LEFT JOIN companies c ON j.company_id = c.id
       WHERE j.id = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Job not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting job details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE - Update lowongan
export const updateJob = async (req, res) => {
  const jobId = parseInt(req.params.id);
  const { 
    title, 
    job_type, 
    work_mode, 
    location, 
    salary_min,
    salary_max, 
    description, 
    status
  } = req.body;

  if (!jobId || isNaN(jobId)) {
    return res.status(400).json({ message: "Valid job ID is required." });
  }

  try {
    // Periksa apakah job ada
    const jobCheck = await pool.query(
      `SELECT * FROM jobs WHERE id = $1`,
      [jobId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Verify job belongs to the user's company
    if (req.user && req.user.role === 'company') {
      const companyCheck = await pool.query(
        `SELECT c.id FROM companies c
         WHERE c.user_id = $1`,
        [req.user.id]
      );
      
      if (companyCheck.rows.length > 0) {
        const companyId = companyCheck.rows[0].id;
        if (jobCheck.rows[0].company_id !== companyId) {
          return res.status(403).json({ message: "You are not authorized to update this job." });
        }
      }
    }

    const query = `
      UPDATE jobs 
      SET 
        title = $1, 
        job_type = $2, 
        work_mode = $3, 
        location = $4, 
        salary_min = $5, 
        salary_max = $6, 
        description = $7,
        status = $9
      WHERE id = $10
      RETURNING *;
    `;

    const values = [
      title || jobCheck.rows[0].title,
      job_type || jobCheck.rows[0].job_type,
      work_mode || jobCheck.rows[0].work_mode,
      location !== undefined ? location : jobCheck.rows[0].location,
      salary_min !== undefined ? salary_min : jobCheck.rows[0].salary_min,
      salary_max !== undefined ? salary_max : jobCheck.rows[0].salary_max,
      description || jobCheck.rows[0].description,
      status || jobCheck.rows[0].status,
      jobId
    ];

    const result = await pool.query(query, values);
    
    res.status(200).json({
      message: "Job updated successfully",
      job: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE - Hapus lowongan
export const deleteJob = async (req, res) => {
  const jobId = parseInt(req.params.id);

  if (!jobId || isNaN(jobId)) {
    return res.status(400).json({ message: "Valid job ID is required." });
  }

  try {
    // Periksa apakah job ada
    const jobCheck = await pool.query(
      `SELECT * FROM jobs WHERE id = $1`,
      [jobId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Verify job belongs to the user's company
    if (req.user && req.user.role === 'company') {
      const companyCheck = await pool.query(
        `SELECT c.id FROM companies c
         WHERE c.user_id = $1`,
        [req.user.id]
      );
      
      if (companyCheck.rows.length > 0) {
        const companyId = companyCheck.rows[0].id;
        if (jobCheck.rows[0].company_id !== companyId) {
          return res.status(403).json({ message: "You are not authorized to delete this job." });
        }
      }
    }

    // Hapus job
    await pool.query(
      `DELETE FROM jobs WHERE id = $1`,
      [jobId]
    );
    
    res.status(200).json({
      message: "Job deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};