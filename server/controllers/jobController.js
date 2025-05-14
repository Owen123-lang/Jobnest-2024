import pool from "../config/db.js";

// CREATE - Tambah lowongan baru
export const createJob = async (req, res) => {
  const { 
    company_id,
    title, 
    job_type, 
    work_mode, 
    location, 
    salary_min,
    salary_max, 
    description, 
    deadline,
    status = 'active' // Default status is active
  } = req.body;

  // Validasi input
  if (!title || !description || !company_id) {
    return res.status(400).json({ message: "Title, description, and company_id are required." });
  }

  try {
    // Periksa apakah company ada (seharusnya memeriksa tabel users, bukan jobs)
    const companyCheck = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND role = 'company'`, 
      [company_id]
    );
    
    if (companyCheck.rows.length === 0) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Gunakan INSERT untuk membuat lowongan baru, bukan UPDATE
    const query = `
      INSERT INTO jobs (
        company_id, title, job_type, work_mode, location,
        salary_min, salary_max, description, created_at, deadline, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
      RETURNING *;
    `;

    const values = [
      company_id,
      title,
      job_type || 'full_time',
      work_mode || 'onsite',
      location,
      salary_min,
      salary_max,
      description,
      deadline,
      status
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Job created successfully",
      job: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// READ ALL - Ambil semua lowongan
export const getAllJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM jobs ORDER BY created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
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
      `SELECT * FROM jobs WHERE id = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Job not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
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
    deadline,
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
        deadline = $8,
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
      deadline || jobCheck.rows[0].deadline,
      status || jobCheck.rows[0].status,
      jobId
    ];

    const result = await pool.query(query, values);
    
    res.status(200).json({
      message: "Job updated successfully",
      job: result.rows[0]
    });
  } catch (error) {
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

    // Hapus job
    await pool.query(
      `DELETE FROM jobs WHERE id = $1`,
      [jobId]
    );
    
    res.status(200).json({
      message: "Job deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};