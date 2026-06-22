<p align="center">
  <img src="frontend/src/lib/assets/image.png" alt="MEVER Platform Banner" width="300px" />
</p>

# MEVER — Platform Video Streaming Internal

> **MEVER** adalah platform video streaming berbasis web yang dirancang untuk kebutuhan internal organisasi. Platform ini mendukung unggah video, proses transkoding otomatis dengan FFmpeg, pemutaran adaptif via HLS/DASH, serta sistem manajemen pengguna yang dilengkapi keamanan dua faktor (MFA).

---

## ✨ Fitur Utama

- 🎬 **Upload & Transcoding Otomatis** — Video diunggah ke MinIO dan langsung diproses oleh worker FFmpeg secara asinkron (BullMQ).
- 📺 **Adaptive Streaming (HLS)** — Pemutaran video adaptif menggunakan Nginx VOD Module yang menghasilkan stream HLS *on-the-fly*.
- 🔐 **Autentikasi & MFA (TOTP)** — Login berbasis JWT dengan Two-Factor Authentication wajib untuk semua pengguna, dilengkapi Trusted Device 7 hari.
- 👥 **Manajemen Pengguna** — Sistem Request Account dengan persetujuan Admin dan notifikasi email otomatis via Mailjet.
- 🛠️ **Admin Panel Lengkap** — Kelola User, Video, Quality Preset, Storage Config, dan Transcode Jobs Monitoring.
- 🌙 **Dark Mode & PWA** — Antarmuka modern yang mendukung tema gelap dan dapat dipasang sebagai Progressive Web App.

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                  (SvelteKit Frontend)                   │
└────────────────────────┬────────────────────────────────┘
                         │ REST API / Auth
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Fastify)                      │
│            Port 3000 — Node.js + TypeScript             │
└──────┬──────────────┬──────────────────┬────────────────┘
       │              │                  │
       ▼              ▼                  ▼
 PostgreSQL 16     Redis 7           MinIO (S3)
  (Database)    (Cache & Queue)   (Object Storage)
                      │
                      │ Event Notifikasi Upload
                      ▼
┌─────────────────────────────────────────────────────────┐
│              TRANSCODER WORKER (Node.js)                │
│           FFmpeg + BullMQ — Proses Render               │
└──────────────────────────┬──────────────────────────────┘
                           │ Upload Hasil ke MinIO
                           ▼
┌─────────────────────────────────────────────────────────┐
│            NGINX VOD MODULE (Docker)                    │
│       Port 8080 — Adaptive HLS/DASH Streaming           │
└─────────────────────────────────────────────────────────┘
```

### Komponen Proyek

| Komponen | Teknologi | Port |
|----------|-----------|------|
| **Frontend** | SvelteKit 2 + Svelte 5 + Tailwind CSS v4 | `5173` |
| **Backend API** | Fastify + Drizzle ORM + TypeScript | `3000` |
| **Transcoder** | Node.js + FFmpeg + BullMQ | — |
| **Database** | PostgreSQL 16 | `5432` |
| **Cache & Queue** | Redis 7 | `6379` |
| **Object Storage** | MinIO (S3-compatible) | `9000` / `9001` |
| **Streaming Server** | Nginx VOD Module | `8080` |

---

## 🚀 Cara Instalasi (Development)

### Prasyarat

Pastikan software berikut sudah terpasang di mesin Anda:

- [Node.js](https://nodejs.org/) v20+ dan npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (untuk menjalankan infrastruktur)
- [FFmpeg](https://ffmpeg.org/) (untuk Transcoder Worker)
- Git

---

### Langkah 1 — Clone Repository

```bash
git clone https://github.com/username/mever-rebuild.git
cd mever-rebuild
```

---

### Langkah 2 — Jalankan Infrastruktur (Docker)

Semua service pendukung (PostgreSQL, Redis, MinIO, Nginx VOD) dijalankan via Docker Compose.

```bash
# Jalankan semua container di background
docker compose up -d

# Verifikasi semua container berjalan
docker ps
```

Setelah berhasil, Anda akan memiliki:
- **PostgreSQL** → `localhost:5432`
- **Redis** → `localhost:6379`
- **MinIO API** → `localhost:9000`
- **MinIO Console** → `localhost:9001` (Login: `mever_access` / `mever_secret`)
- **Nginx VOD** → `localhost:8080`

> **Catatan:** Saat pertama kali menjalankan, MinIO perlu dikonfigurasi. Buka MinIO Console di `http://localhost:9001`, buat dua bucket: `source` (private) dan `public` (public read-access), lalu aktifkan event notification dari bucket `source` ke Redis.

---

### Langkah 3 — Setup Backend

```bash
cd backend
```

**3.1 Install dependencies:**
```bash
npm install
```

**3.2 Buat file `.env`** berdasarkan template berikut:
```env
# Server
PORT=3000

# Database PostgreSQL
DATABASE_URL=postgresql://mever:mever1234@127.0.0.1:5432/mever_db

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASS=mever_redis_pass

# MinIO / Object Storage
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=mever_access
MINIO_SECRET_KEY=mever_secret
MINIO_BUCKET_SOURCE=source
MINIO_BUCKET_PUBLIC=public

# JWT Authentication
JWT_SECRET=ganti-dengan-string-rahasia-minimal-32-karakter
JWT_EXPIRES_IN=7d

# Enkripsi (untuk MFA secret)
ENCRYPTION_KEY=ganti-dengan-32-karakter-hex-string-di-sini

# Mailjet (untuk notifikasi email)
MAILJET_API_KEY=api-key-mailjet-anda
MAILJET_SECRET_KEY=secret-key-mailjet-anda
MAILJET_SENDER_EMAIL=noreply@domain-anda.com
MAILJET_SENDER_NAME=MEVER Admin
```

**3.3 Jalankan migrasi database:**
```bash
npm run db:push
```

**3.4 Jalankan server backend:**
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3000`.

---

### Langkah 4 — Setup Transcoder

```bash
cd ../transcoder
```

**4.1 Install dependencies:**
```bash
npm install
```

**4.2 Buat file `.env`** berdasarkan template berikut:
```env
# Database
DATABASE_URL=postgresql://mever:mever1234@127.0.0.1:5432/mever_db

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASS=mever_redis_pass

# MinIO
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=mever_access
MINIO_SECRET_KEY=mever_secret
MINIO_BUCKET_SOURCE=source
MINIO_BUCKET_PUBLIC=public
```

**4.3 Jalankan transcoder worker:**
```bash
npm run dev
```

Transcoder worker akan aktif dan mendengarkan antrian upload video secara otomatis.

---

### Langkah 5 — Setup Frontend

```bash
cd ../frontend
```

**5.1 Install dependencies:**
```bash
npm install
```

**5.2 Buat file `.env`:**
```env
PUBLIC_API_URL=http://localhost:3000
```

**5.3 Jalankan server development:**
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

---

## 📖 Cara Penggunaan

### Pertama Kali Setup (Admin)

Karena tidak ada halaman registrasi terbuka untuk admin, akun admin pertama harus dibuat langsung via API atau database. Setelah itu, semua pengguna baru didaftarkan melalui sistem Request Account.

**Membuat akun admin pertama via API:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin MEVER",
    "email": "admin@mever.com",
    "password": "Admin@12345"
  }'
```

Kemudian ubah `role` user tersebut menjadi `admin` langsung di database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@mever.com';
```

---

### Alur Penggunaan untuk User Reguler

**1. Pengajuan Akun**
   - Kunjungi halaman publik: `http://localhost:5173/auth/request-account`
   - Isi form: Nama Lengkap, Email, dan Departemen
   - Klik **Kirim Permintaan**

**2. Persetujuan Admin**
   - Admin login dan masuk ke **Admin Panel → Account Requests**
   - Klik tombol **Approve** pada pengajuan yang masuk
   - Sistem akan mengirimkan email ke pemohon berisi kredensial login default

**3. Login & Setup MFA**
   - User membuka email dan menggunakan kredensial yang diberikan
   - Login di `http://localhost:5173/auth/login`
   - Karena MFA wajib, sistem akan meminta scan QR Code menggunakan aplikasi Authenticator (Google Authenticator / Authy)
   - Setelah scan, masukkan kode OTP 6 digit untuk mengaktifkan MFA
   - MFA hanya perlu diverifikasi ulang setiap **7 hari sekali**

**4. Ganti Password (Direkomendasikan)**
   - Setelah login, buka **Settings** (ikon di Sidebar)
   - Gulir ke bagian **Change Password**
   - Masukkan password lama (default dari email) dan password baru yang lebih kuat
   - Klik **Save Changes**

**5. Upload Video**
   - Klik tombol **Upload** di Sidebar
   - Seret dan lepas (*drag & drop*) file video, atau klik untuk memilih file
   - Isi Judul dan Deskripsi video
   - Klik **Upload** — sistem akan memproses video secara otomatis di background

**6. Menonton Video**
   - Buka menu **Videos** di Sidebar
   - Pilih video yang statusnya sudah **Ready**
   - Pilih kualitas yang diinginkan dari dropdown (atau gunakan mode **Auto Adaptive**)
   - Video akan diputar via streaming HLS adaptif

---

### Panduan Admin Panel

| Menu | Fungsi |
|------|--------|
| **Users** | Lihat semua user, ubah role, nonaktifkan, atau hapus akun |
| **Videos** | Kelola semua video di platform (edit metadata, hapus) |
| **Account Requests** | Setujui atau tolak pengajuan akun baru |
| **Quality Presets** | Buat dan kelola preset kualitas render (resolusi, codec, bitrate) |
| **Storage Config** | Konfigurasi koneksi MinIO/S3 untuk penyimpanan video |
| **Analytics** | Lihat statistik platform (total user, video, status transcode) |

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `PORT` | ✅ | Port server backend (default: `3000`) |
| `DATABASE_URL` | ✅ | Connection string PostgreSQL |
| `REDIS_HOST` | ✅ | Hostname Redis |
| `REDIS_PORT` | ✅ | Port Redis (default: `6379`) |
| `REDIS_PASS` | ❌ | Password Redis (jika ada) |
| `MINIO_ENDPOINT` | ✅ | Hostname MinIO |
| `MINIO_PORT` | ✅ | Port MinIO API (default: `9000`) |
| `MINIO_ACCESS_KEY` | ✅ | MinIO Access Key |
| `MINIO_SECRET_KEY` | ✅ | MinIO Secret Key |
| `MINIO_BUCKET_SOURCE` | ✅ | Nama bucket untuk video sumber |
| `MINIO_BUCKET_PUBLIC` | ✅ | Nama bucket untuk video hasil render |
| `JWT_SECRET` | ✅ | Secret key JWT (minimal 32 karakter) |
| `JWT_EXPIRES_IN` | ✅ | Durasi token JWT (contoh: `7d`) |
| `ENCRYPTION_KEY` | ✅ | Kunci enkripsi AES-256 untuk MFA secret |
| `MAILJET_API_KEY` | ✅ | API Key Mailjet |
| `MAILJET_SECRET_KEY` | ✅ | Secret Key Mailjet |
| `MAILJET_SENDER_EMAIL` | ✅ | Alamat email pengirim notifikasi |
| `MAILJET_SENDER_NAME` | ❌ | Nama pengirim email (default: `MEVER Admin`) |

---

## 🛠️ Perintah Berguna

### Backend
```bash
npm run dev          # Jalankan dalam mode development (hot-reload)
npm run build        # Kompilasi TypeScript ke JavaScript
npm run start        # Jalankan hasil build production
npm run db:push      # Sinkronkan schema ke database tanpa migration file
npm run db:generate  # Generate file migration dari perubahan schema
npm run db:migrate   # Jalankan semua file migration
npm run db:studio    # Buka Drizzle Studio (GUI database) di browser
```

### Frontend
```bash
npm run dev          # Jalankan dalam mode development
npm run build        # Build untuk production
npm run preview      # Preview hasil build production
npm run check        # Validasi tipe TypeScript + Svelte
```

### Transcoder
```bash
npm run dev          # Jalankan worker dalam mode development (hot-reload)
npm run build        # Kompilasi TypeScript ke JavaScript
npm run start        # Jalankan hasil build production
```

### Docker
```bash
docker compose up -d       # Jalankan semua container di background
docker compose down        # Hentikan dan hapus semua container
docker compose logs -f     # Lihat log semua container secara real-time
docker compose ps          # Lihat status semua container
```

---

## 📁 Struktur Direktori

```
mever-rebuild/
├── backend/                 # API Server (Fastify)
│   ├── drizzle/
│   │   └── schema/          # Definisi schema database (Drizzle ORM)
│   └── src/
│       ├── config/          # Konfigurasi environment (env.ts)
│       ├── loaders/         # Inisialisasi koneksi (postgres, redis, minio)
│       ├── middlewares/     # Auth middleware (authenticate, authorize)
│       ├── modules/
│       │   ├── auth/        # Register, Login, MFA
│       │   ├── users/       # Manajemen profil user
│       │   ├── videos/      # Upload, streaming, list video
│       │   └── admin/       # Semua endpoint admin panel
│       └── utils/           # Helper (hash, encrypt, slug, response)
│
├── frontend/                # UI (SvelteKit 2 + Svelte 5)
│   └── src/
│       ├── lib/
│       │   ├── api/         # Fungsi API client per modul
│       │   ├── components/  # Komponen reusable (UI, layout, user, video)
│       │   ├── stores/      # State management global
│       │   └── utils/       # Fungsi helper (format, validator)
│       └── routes/
│           ├── auth/        # Halaman Login, Register, Request Account
│           ├── dashboard/   # Halaman utama user (Video, Upload, Settings)
│           └── admin/       # Halaman admin panel
│
├── transcoder/              # Transcoding Worker (FFmpeg + BullMQ)
│   └── src/
│       ├── loaders/         # Koneksi Redis, MinIO, FFmpeg
│       ├── repository/      # Query database untuk update status video
│       └── services/        # Logic transcode, thumbnail, smart matching
│
├── nginx/                   # Konfigurasi Nginx VOD Module (Docker)
│   ├── nginx.conf
│   └── Dockerfile
│
└── docker-compose.yml       # Orkestrasi semua service infrastruktur
```

---

## 🔗 Endpoint API Utama

### Autentikasi
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/auth/login` | Login dengan email & password | ❌ |
| `POST` | `/auth/logout` | Logout & invalidasi token | ✅ |
| `POST` | `/auth/mfa/setup` | Setup MFA (mendapatkan QR Code) | ✅ |
| `POST` | `/auth/mfa/enable` | Aktivasi MFA dengan kode OTP | ✅ |
| `POST` | `/auth/login/mfa` | Verifikasi OTP saat login | ❌ |
| `POST` | `/auth/request-account` | Pengajuan akun baru (publik) | ❌ |

### Video
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/videos` | Daftar video (filter + paginasi) | ✅ |
| `GET` | `/videos/:id` | Detail video | ✅ |
| `POST` | `/videos/request-upload` | Dapatkan presigned URL MinIO | ✅ |
| `POST` | `/videos/:id/confirm` | Konfirmasi upload selesai | ✅ |
| `GET` | `/videos/:id/stream` | URL streaming HLS/DASH | ✅ |
| `GET` | `/videos/:id/assets` | Daftar aset resolusi video | ✅ |

### Admin
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/admin/users` | Daftar semua user | 🔒 Admin |
| `PUT` | `/admin/users/:id/role` | Ubah role user | 🔒 Admin |
| `GET` | `/admin/videos` | Semua video di platform | 🔒 Admin |
| `GET` | `/admin/account-requests` | Daftar pengajuan akun | 🔒 Admin |
| `POST` | `/admin/account-requests/:id/approve` | Setujui pengajuan | 🔒 Admin |
| `POST` | `/admin/account-requests/:id/reject` | Tolak pengajuan | 🔒 Admin |
| `GET` | `/admin/quality-presets` | Daftar preset kualitas | 🔒 Admin |
| `POST` | `/admin/quality-presets` | Buat preset baru | 🔒 Admin |
| `GET` | `/admin/storage-configs` | Daftar konfigurasi storage | 🔒 Admin |

---

## 🤝 Kontribusi & Pengembangan

Proyek ini dikembangkan sebagai bagian dari program **magang** oleh:
- **Nama:** Achmad Soewardi
- **Periode:** April 2026 – Juni 2026
- **Metodologi:** Agile Scrum (5 Sprint × 2 Minggu)

---

## 📝 Lisensi

Proyek ini dikembangkan untuk keperluan internal dan akademis. Seluruh hak cipta milik pengembang dan institusi terkait.
