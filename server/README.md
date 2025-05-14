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

## 🧪 Cara Menggunakan API
```
Dokumentasi lengkap : https://docs.google.com/spreadsheets/d/1zw6ej-z0sdqa7OxRpFeMErI2vLJMxJlPfzz94jvLMfM/edit?usp=sharing
```
## Progres Selesai :
1. Table Users berhasil dibuat beserta CRUDnya
2. Table Jobs berhasil dibuat besart CRUDnya
3. Company Admin berhasil dibuat juga
4. users selesai dibuat 
5. CRUD portofolios
6. CRUD profiles

## Progres Belum Selesai :
1. CRUD skills;

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




