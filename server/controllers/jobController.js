import pool from "../config/db.js";

// CREATE - Tambah lowongan baru
export const createJob = async (req, res) => {
  const { 
    title, 
    description, 
    company, 
    location, 
    work_mode, 
    job_type, 
    salary_range, 
    qualifications, 
    responsibilities 
  } = req.body;

  // Validasi input
  if (!title || !description || !company) {
    return res.status(400).json({ message: "Title, description, and company are required." });
  }

  try {
    const query = `
      INSERT INTO jobs (
        title, description, company, location, work_mode, 
        job_type, salary_range, qualifications, responsibilities, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *;
    `;

    const values = [
      title, 
      description, 
      company, 
      location || null, 
      work_mode || null, 
      job_type || null,
      salary_range || null,
      qualifications || null,
      responsibilities || null
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
    description, 
    company, 
    location, 
    work_mode, 
    job_type, 
    salary_range, 
    qualifications, 
    responsibilities 
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
        description = $2, 
        company = $3, 
        location = $4, 
        work_mode = $5, 
        job_type = $6, 
        salary_range = $7, 
        qualifications = $8, 
        responsibilities = $9
      WHERE id = $10
      RETURNING *;
    `;

    const values = [
      title || jobCheck.rows[0].title,
      description || jobCheck.rows[0].description,
      company || jobCheck.rows[0].company,
      location !== undefined ? location : jobCheck.rows[0].location,
      work_mode !== undefined ? work_mode : jobCheck.rows[0].work_mode,
      job_type !== undefined ? job_type : jobCheck.rows[0].job_type,
      salary_range !== undefined ? salary_range : jobCheck.rows[0].salary_range,
      qualifications !== undefined ? qualifications : jobCheck.rows[0].qualifications,
      responsibilities !== undefined ? responsibilities : jobCheck.rows[0].responsibilities,
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