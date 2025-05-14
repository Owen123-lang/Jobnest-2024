# BACKEND SHIT

## Fitur Utama

###  Target Utama
1. **Manajemen Lowongan kerja dan Magang**
    - Backend nyiapin struktur tabel jobs di PostgreSQL
    - kolom: title, company, location, work_mode, job_type, description, qualification, salary_range, dst
    - **Belum tersedia endpoint CRUD, namun tabel siap untuk POST, PUT, dan DELETE**

2. **Perusahaan bisa posting dan mengelola lowongan**
    - Tabel jobs dirancang agar perusahaan (dengan role = 'company') dapat menambahkan, mengedit, dan menghapus lowongan
    - backend akan mendukung fitur ini dengan sistem autentikasi berbasis role.

3. **Implementasi CRUD API di express.js**
- sudah ada:
    - POST /api/users/register
    - POST /api/users/login
    - POST /api/upload-cv
    - GET /api/applications/:userId

4. **Dashboard terpisah untuk user dan perusahaan**
- Di sisi backend, struktur role user (user, company) sudah ada melalui field role di tabel users.
- endpoint dapat disesuaikan dengan role, misalnya:
    - company hanya bisa akses POST/EDIT job
    - user hanya bisa apply job dan upload CV

5. **Apply lamaran secara online** 
- Backend menyediakan endpoint:
    - POST /api/upload-cv
    - Menggunakan multer.memoryStorage untuk upload file
    - File dikirim ke Cloudinary
    - Data disimpan ke tabel applications (user_id, job_id, cv_url)
    - CV disimpan di Cloudinary dengan tipe file pdf

6. **Tersimpan di Tabel Applications**
    - Setiap lamaran akan tersimpan di applications dengan timestamp otomatis.
    - user_id dan job_id dijadikan foreign key.

7. **Pencarian dan Filter Lowongan**
- belum ada, tapi kolom dalam db udah ada location,job_type, work_mode sudah siap.

8. **Manajemen Profil dan Portofolio Pencari Kerja**
    - agar perusahaan bisa melihat skill apa aja yang dimiliki user, serta interest dan riwayat proyek(portofolio)
    - harus ada tabel skills, portofolios, dan interest.

9. **Notifikasi Status Lamaran dan Lowongan Baru**
    - Rencana tabel notifications akan menyimpan:
        - Perubahan status lamaran
         - Pemberitahuan job baru

10. **Penyimpanan Lowongan Favorit**
    - Rencana tabel favorites menyimpan job yang disimpan user.

###  Fitur Inovatif (Coming Soon)( sebenernya gak harus semua tapi minimal 1 dikerjain dan bisa.)
- [ ] Simulasi Interview
- [ ] Rekomendasi AI (Career Recommender)
- [ ] Forum komunitas karier (discussion board)


## Dokumentasi tabel

**cek disini**

https://lucid.app/lucidspark/8ddf0509-e9f4-4216-ba67-1b5fc68fb627/edit?viewport_loc=2131%2C3318%2C2531%2C1279%2C0_0&invitationId=inv_8b7e3a17-353a-47b0-8c18-c7ccb53c12d6



## Progress per 08 Mei 2025 (ini gpt gw mager rangkum hehe)

# 🧠 BACKEND SHIT – JobNest 2024

## 🔹 Fitur Utama (Sisi Backend)

### 1. Manajemen Lowongan Kerja & Magang
- ✅ Tabel `jobs` disiapkan di PostgreSQL.
- Kolom: `title`, `company`, `location`, `work_mode`, `job_type`, `description`, `salary_range`, dll.
- ❌ Endpoint CRUD (`POST`, `PUT`, `DELETE`) belum tersedia.

### 2. Perusahaan Mengelola Lowongan
- ❌ Role `company` belum ditambahkan ke tabel `users`.
- ❌ Endpoint khusus untuk perusahaan belum tersedia.

### 3. CRUD API di Express.js
- ✅ Sudah tersedia:
  - `POST /api/users/register`
  - `POST /api/users/login`
  - `POST /api/upload-cv`
  - `GET /api/applications/:userId`

### 4. Dashboard Terpisah User & Perusahaan
- ⚠️ Kolom `role` **sudah** di tabel `users`, belum ada logika otorisasi berdasarkan role.

### 5. Apply Lamaran Secara Online
- ✅ Endpoint: `POST /api/upload-cv`
- File dikirim via `form-data`, diproses dengan `multer.memoryStorage`, dan diunggah ke **Cloudinary**.

### 6. Tersimpan di Tabel Applications
- ✅ Tabel `applications` menyimpan:
  - `user_id` (FK)
  - `job_id` (FK)
  - `cv_url` (Cloudinary)
  - `applied_at` (timestamp otomatis)

### 7. Pencarian & Filter Lowongan
- ⚠️ Struktur tabel mendukung (`location`, `job_type`, `work_mode`)
- ❌ Endpoint pencarian & query belum tersedia

### 8. Manajemen Profil & Portofolio
- ❌ Belum dibuat tabel `skills`, `portfolios`, `interests`

### 9. Penyimpanan CV
- ✅ Disimpan di **Cloudinary** dengan tipe `raw`

### 10. Notifikasi Status & Lowongan Baru
- ❌ Belum ada tabel `notifications` atau logika backend

### 11. Penyimpanan Lowongan Favorit
- ❌ Tabel `favorites` dan endpoint `GET/POST` belum tersedia

---

## 💡 Fitur Inovatif (Rencana Backend)

| Fitur                  | Status | Rencana                                                                 |
|------------------------|--------|-------------------------------------------------------------------------|
| Forum Komunitas        | ❌     | Tabel `posts`, `comments`, `votes` → mirip Reddit forum                |
| Simulasi Interview     | ❌     | Endpoint `GET` untuk pertanyaan dan `POST` jawaban                     |
| AI Career Recommender  | ❌     | Akan pakai tabel `skills`, `interests`, `applications`, API ke GPT     |

---



| Tabel         | Status | Penjelasan                                                                 |
|---------------|--------|-----------------------------------------------------------------------------|
| `users`       | ✅     | Data akun user: `id`, `name`, `email`, `password`, `created_at`            |
| `jobs`        | ✅     | Lowongan kerja: `title`, `company`, `location`, `job_type`, `description`, dll |
| `applications`| ✅     | Relasi `user` ↔ `job` + `cv_url` dari Cloudinary                           |
| `favorites`   | ❌     | Relasi `user` ↔ `job` untuk fitur simpan lowongan                           |
| `skills`      | ❌     | Menyimpan daftar keahlian user (untuk AI)                                  |
| `portfolios`  | ❌     | Proyek atau pengalaman kerja user                                          |
| `notifications`| ❌    | Notifikasi seperti: “Lamaran Anda diterima”                                |
| `interests`   | ❌     | Bidang minat user untuk AI recommender                                     |

---



| Fitur                                  | Status | Detail                                                                 |
|----------------------------------------|--------|------------------------------------------------------------------------|
| Register & Login                       | ✅     | bcrypt + JWT, endpoint: `/api/users/register`, `/api/users/login`     |
| Upload CV                              | ✅     | via `multer.memoryStorage` → `cloudinary`                             |
| Simpan lamaran ke DB                   | ✅     | Tabel `applications` (user_id, job_id, cv_url)                        |
| Ambil lamaran user                     | ✅     | Endpoint `GET /api/applications/:userId`                              |
| Middleware JWT                         | ✅     | `verifyToken` digunakan untuk endpoint privat                         |
| Rate Limiter Upload                    | ✅     | 3 upload CV / 10 menit per IP (`uploadLimiter`)                       |
| Struktur tabel `jobs`                 | ✅     | Sudah lengkap, siap untuk CRUD                                        |
| Struktur tabel `users`                | ✅     | Tersedia field `name`, `email`, `password`, `created_at`             |
| Tambah field `role`                   | ❌     | Belum ditambahkan ke tabel `users`                                    |
| CRUD jobs                              | ❌     | Belum tersedia untuk admin/perusahaan                                 |
| Pencarian & Filter                     | ⚠️     | Kolom siap, query belum dibuat                                        |
| Tabel `favorites`, `skills`, dsb       | ❌     | Belum dibuat                                                           |
| Fitur Inovatif                         | ❌     | Belum dikembangkan                                                    |

---

# 🧠 Backend Jobnest 2024 – 2025

## ✅ Progress Selesai: CRUD untuk Lowongan + Role Proteksi

---

### 1. 🔐 Middleware `verifyToken` & `checkCompanyRole`

```js
// authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export const checkCompanyRole = (req, res, next) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: "Forbidden: Only company allowed." });
  }
  next();
};
```

---

### 2. 🧾 Job Controller (`controllers/jobController.js`)

```js
import pool from "../config/db.js";

export const createJob = async (req, res) => {
  const { title, description, company, location, work_mode, job_type, salary_range, qualifications, responsibilities } = req.body;
  if (!title || !description || !company) return res.status(400).json({ message: "Title, description, and company are required." });

  try {
    const result = await pool.query(\`
      INSERT INTO jobs (title, description, company, location, work_mode, job_type, salary_range, qualifications, responsibilities, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *;
    \`, [title, description, company, location, work_mode, job_type, salary_range, qualifications, responsibilities]);

    res.status(201).json({ message: "Job created successfully", job: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllJobs = async (_, res) => {
  try {
    const result = await pool.query(\`SELECT * FROM jobs ORDER BY created_at DESC\`);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getJobById = async (req, res) => {
  const jobId = parseInt(req.params.id);
  if (!jobId || isNaN(jobId)) return res.status(400).json({ message: "Valid job ID is required." });

  try {
    const result = await pool.query(\`SELECT * FROM jobs WHERE id = $1\`, [jobId]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Job not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateJob = async (req, res) => {
  const jobId = parseInt(req.params.id);
  const { title, description, company, location, work_mode, job_type, salary_range, qualifications, responsibilities } = req.body;

  try {
    const check = await pool.query(\`SELECT * FROM jobs WHERE id = $1\`, [jobId]);
    if (check.rows.length === 0) return res.status(404).json({ message: "Job not found." });

    const job = check.rows[0];
    const result = await pool.query(\`
      UPDATE jobs SET 
        title=$1, description=$2, company=$3, location=$4, work_mode=$5, 
        job_type=$6, salary_range=$7, qualifications=$8, responsibilities=$9
      WHERE id=$10 RETURNING *;
    \`, [
      title || job.title, description || job.description, company || job.company,
      location ?? job.location, work_mode ?? job.work_mode,
      job_type ?? job.job_type, salary_range ?? job.salary_range,
      qualifications ?? job.qualifications, responsibilities ?? job.responsibilities,
      jobId
    ]);

    res.status(200).json({ message: "Job updated successfully", job: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteJob = async (req, res) => {
  const jobId = parseInt(req.params.id);
  try {
    const check = await pool.query(\`SELECT * FROM jobs WHERE id = $1\`, [jobId]);
    if (check.rows.length === 0) return res.status(404).json({ message: "Job not found." });

    await pool.query(\`DELETE FROM jobs WHERE id = $1\`, [jobId]);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
```

---

### 3. 🌐 Job Routes (`routes/jobRoutes.js`)

```js
import express from "express";
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from "../controllers/jobController.js";
import { verifyToken, checkCompanyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.post("/", verifyToken, checkCompanyRole, createJob);
router.put("/:id", verifyToken, checkCompanyRole, updateJob);
router.delete("/:id", verifyToken, checkCompanyRole, deleteJob);

export default router;
```

---

### 4. 🧩 Integrasi Routes (`index.js`)

```js
import jobRoutes from "./routes/jobRoutes.js";
app.use("/api/jobs", jobRoutes);
```

---

## 🧪 Cara Menggunakan API

### 🔸 Register sebagai Company

```http
POST /api/users/register
{
  "name": "PT JobNest",
  "email": "hr@jobnest.com",
  "password": "123456",
  "role": "company"
}
```

### 🔸 Login

```http
POST /api/users/login
{
  "email": "hr@jobnest.com",
  "password": "123456"
}
```

Tambahkan header:

```
Authorization: Bearer <token>
```

### 🔸 Endpoint CRUD Lowongan

| Operasi            | Method | Endpoint            | Proteksi             |
|--------------------|--------|---------------------|----------------------|
| Buat Lowongan      | POST   | `/api/jobs`         | `verifyToken + role` |
| Lihat Semua        | GET    | `/api/jobs`         | Publik               |
| Lihat Detail       | GET    | `/api/jobs/:id`     | Publik               |
| Update Lowongan    | PUT    | `/api/jobs/:id`     | `verifyToken + role` |
| Hapus Lowongan     | DELETE | `/api/jobs/:id`     | `verifyToken + role` |

---

## ✅ Progress Saat Ini

| Fitur                        | Status | Keterangan                                |
|-----------------------------|--------|--------------------------------------------|
| CRUD jobs                   | ✅     | Selesai semua operasi                     |
| Proteksi role company       | ✅     | Melalui middleware `checkCompanyRole`     |
| JWT + Register/Login        | ✅     | Termasuk payload `role`                   |
| Integrasi routes            | ✅     | Ditambahkan di `index.js`                 |
| Penyimpanan job ke DB       | ✅     | Menggunakan PostgreSQL                    |

---

##  Fitur Selanjutnya (Belum Selesai)

### 1. Filter & Pencarian Job
- [ ] Endpoint: `GET /api/jobs?location=Jakarta&job_type=full-time`
- [ ] Tambahkan logic filter di controller

### 2. Favorites
- [ ] Tabel favorites (user_id, job_id)
- [ ] Endpoint `POST /api/favorites`
- [ ] Endpoint `GET /api/favorites/:userId`
- [ ] Endpoint `DELETE /api/favorites/:id`

### 3.  Notifikasi
- [ ] Tabel `notifications` (user_id, message, status, created_at)
- [ ] Endpoint `GET /api/notifications/:userId`
- [ ] Notifikasi: job baru, pelamar baru, lamaran diterima/ditolak

### 4. Skills, Portfolio, Interests
- [ ] Tabel `skills`, `portfolios`, `interests`
- [ ] CRUD API untuk masing-masing
- [ ] Terhubung ke user_id

### 5. Fitur Inovatif (Bonus)
- [ ] Forum komunitas (tabel `posts`, `comments`, `votes`)
- [ ] Simulasi interview (GET pertanyaan, POST jawaban)
- [ ] AI career recommender (butuh tabel interest, skill, applications)


 

