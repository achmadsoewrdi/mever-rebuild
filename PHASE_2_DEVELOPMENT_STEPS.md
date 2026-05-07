# 🚀 MEVER Phase 2: User Expansion & Admin Operations

> Panduan pengembangan tingkat lanjut (Phase 2) untuk proyek MEVER.  
> Fokus utama: Profil Pengguna, Keamanan MFA, Panel Admin, Monitoring Antrian Transcoder (BullMQ), dan Peningkatan UI/UX.  
> **Target Penyelesaian:** Rabu Depan (13 Mei 2026)

---

## 📅 Timeline Pengerjaan (Target 7 Hari)

| Hari | Fokus Pengerjaan | Target Modul |
|---|---|---|
| **Kamis** | Manajemen Profil User (Backend & Frontend) | `users` endpoints, Halaman Settings |
| **Jumat** | Kemananan Lanjutan (MFA) | MFA Setup, MFA Login Flow |
| **Sabtu** | Admin Panel & Manajemen User | Daftar User, Ubah Hak Akses (Role) |
| **Minggu** | Manajemen Kualitas Preset | CRUD Quality Presets (Tabel Baru) |
| **Senin** | Transcoder Monitoring (BullMQ) | Endpoint Status Job, Visualisasi Antrian UI |
| **Selasa** | Analitik & Riwayat | View Count, Riwayat Upload |
| **Rabu** | UI/UX & Finalisasi | Dark Mode, PWA, Final Testing |

---

## ⚙️ FASE 1 — Manajemen Profil Pengguna (Edit Profile)

### 1.1 Backend (Fastify)
Kita perlu membuat modul `users` untuk memisahkan urusan autentikasi (login/register) dengan pengelolaan data profil.

```markdown
[ ] Buat `src/modules/users/users.repository.ts`
    - `findById(id)`: Mengambil data pengguna tanpa password_hash.
    - `updateProfile(id, data)`: Mengupdate nama, email, dll.
    - `updatePassword(id, hashedPassword)`: Mengupdate password.

[ ] Buat `src/modules/users/users.service.ts`
    - `getProfile(userId)`: Mengembalikan data profil.
    - `editProfile(userId, data)`: Logika update nama/email. Cek duplikasi email.
    - `changePassword(userId, oldPass, newPass)`: Verifikasi password lama sebelum mengganti.

[ ] Buat `src/modules/users/users.controller.ts` & `users.routes.ts`
    - `GET /users/me`: Ambil profil (Butuh Auth).
    - `PUT /users/me`: Update profil dasar (Butuh Auth).
    - `PUT /users/me/password`: Update password (Butuh Auth).
```

### 1.2 Frontend (SvelteKit)
Membuat halaman pengaturan (Settings) bagi user.

```markdown
[ ] Tambahkan fungsi fetch di `$lib/api/users.api.ts`
    - `getMe()`, `updateProfile()`, `changePassword()`

[ ] Buat Komponen Form di `$lib/components/user/`
    - `EditProfileForm.svelte`: Input nama dan email + tombol simpan.
    - `ChangePasswordForm.svelte`: Input password lama, password baru, konfirmasi.

[ ] Buat Halaman Route `routes/dashboard/settings/+page.svelte`
    - Gunakan sistem Tabs (Tab Profil, Tab Keamanan).
    - Tampilkan pesan Toast (Sukses/Gagal) menggunakan `svelte-sonner`.
```

---

## 🔒 FASE 2 — Multi-Factor Authentication (MFA)

Fitur keamanan tambahan dengan aplikasi Authenticator (Google Authenticator / Authy).

### 2.1 Backend (Fastify)
```markdown
[ ] Modifikasi `src/modules/auth/auth.service.ts`
    - Integrasikan library `otplib` dan `qrcode`.
    - `setupMFA(userId)`: Generate secret AES-256, return URI & QR Code Base64.
    - `verifyAndEnableMFA(userId, token)`: Cek token, jika valid update DB `mfa_enabled = true`.
    - `verifyMFALogin(userId, token)`: Verifikasi saat login jika akun butuh MFA.

[ ] Buat Route Tambahan di `auth.routes.ts`
    - `POST /auth/mfa/setup` (Butuh Auth)
    - `POST /auth/mfa/enable` (Butuh Auth)
    - `POST /auth/login/mfa` (Tanpa Auth, butuh temporary Token dari proses login pertama)
```

### 2.2 Frontend (SvelteKit)
```markdown
[ ] Tambahkan UI MFA di `routes/dashboard/settings/+page.svelte` (Tab Keamanan)
    - Tombol "Aktifkan Autentikasi 2 Langkah".
    - Modal/Dialog untuk scan QR Code & input 6 digit OTP.

[ ] Modifikasi Flow Login (`routes/auth/login/+page.svelte`)
    - Jika respons API mengembalikan `{ mfaRequired: true }`, sembunyikan form email/password, lalu munculkan form input 6 digit OTP.
```

---

## 👑 FASE 3 — Admin Panel & Manajemen User

Admin harus memiliki kuasa penuh terhadap ekosistem MEVER.

### 3.1 Backend (Fastify)
```markdown
[ ] Buat `src/modules/admin/admin.repository.ts`
    - `findAllUsers()`: Menampilkan semua pengguna di database.
    - `changeUserRole(userId, newRole)`: Mengubah peran antara 'admin' dan 'user'.
    - `toggleUserStatus(userId, isActive)`: Suspend / Unsuspend akun.

[ ] Buat `src/modules/admin/admin.controller.ts` & `admin.routes.ts`
    - `GET /admin/users` (Butuh middleware Auth + role === 'admin')
    - `PUT /admin/users/:id/role`
    - `PUT /admin/users/:id/status`
```

### 3.2 Frontend (SvelteKit)
```markdown
[ ] Buat Layout Admin `routes/admin/+layout.svelte`
    - Pastikan route ini hanya bisa diakses oleh akun role `admin` (Cek di `hooks.server.ts`).

[ ] Buat Halaman Daftar Pengguna `routes/admin/users/+page.svelte`
    - Komponen tabel (DataGrid) menampilkan email, role, MFA status, created_at.
    - Aksi: Dropdown untuk ganti Role & Banned User.
```

---

## ⚙️ FASE 4 — Manajemen Kualitas Preset & Config

Daripada _hardcode_ kualitas video, admin bisa menambah/mengubah resolusi (misal: 4K, 8K, atau Audio-only) langsung dari Dashboard.

### 4.1 Backend (Fastify)
```markdown
[ ] Buat tabel `quality_presets` di `schema.ts` (jika belum ada).
    - name (1080p), resolution, format, bitrate, is_active.

[ ] Buat `src/modules/quality-presets/`
    - `GET /quality-presets` (List preset)
    - `POST /admin/quality-presets` (Tambah preset baru)
    - `PUT /admin/quality-presets/:id` (Update)
    - `DELETE /admin/quality-presets/:id` (Soft Delete / Deactivate)
```

### 4.2 Frontend (SvelteKit)
```markdown
[ ] Buat Halaman Pengaturan Preset `routes/admin/presets/+page.svelte`
    - Form untuk menambah resolusi baru.
    - Tabel list preset aktif dan tidak aktif.
```

---

## 📊 FASE 5 — Monitoring Transcoder (BullMQ) & Analitik

Memberikan visualisasi yang interaktif dari antrian yang sudah kita buat menggunakan BullMQ di sesi sebelumnya.

### 5.1 Backend (Fastify / Transcoder)
```markdown
[ ] Tambahkan API monitoring di `backend` atau `transcoder`
    - Karena BullMQ berada di transcoder, bisa dibuatkan endpoint monitoring kecil di backend yang membaca status BullMQ via Redis.
    - `GET /admin/jobs`: Melihat status job antrian (Active, Waiting, Failed, Completed).
    - `POST /admin/jobs/:id/retry`: Mencoba ulang job yang gagal (Call BullMQ `.retry()`).

[ ] Fitur View Count (Analitik) di Module `videos`
    - `POST /videos/:id/view`: Increment counter view.
```

### 5.2 Frontend (SvelteKit)
```markdown
[ ] Buat Halaman Transcoder Monitoring `routes/admin/transcoder/+page.svelte`
    - Tampilkan statistik: Job Sukses, Job Gagal, Sedang Diproses.
    - List video yang gagal di-render beserta tombol "Retry".

[ ] Tampilkan View Count di `VideoCard.svelte`.
```

---

## 🎨 FASE 6 — UI/UX Enhancements & Finalisasi

Penyempurnaan estetika dan aksesibilitas.

### Frontend
```markdown
[ ] Implementasi Toggle Dark Mode / Light Mode
    - Buat store `$lib/stores/theme.store.ts` berbasis `localStorage`.
    - Konfigurasi variabel di `app.css` (Tailwind Dark Mode class strategy).

[ ] Progressive Web App (PWA)
    - Tambahkan `manifest.json`.
    - Tambahkan Service Worker ringan agar aplikasi bisa di-install di HP/Desktop.

[ ] Final Testing (E2E)
    - Coba alur: Register -> Login -> Edit Profile -> Setup MFA -> Upload Video -> Lihat Progress -> Ganti Resolusi.
```

---

## ✅ Panduan Harian & Checklist Eksekusi

Agar selesai di hari Rabu, setiap hari kita akan fokus pada 1 Fase saja. Silakan centang checklist harian ini:

- [ ] **Kamis:** Fase 1 (API Edit Profil, Svelte Form Settings).
- [ ] **Jumat:** Fase 2 (QR Code Generator, Flow MFA).
- [ ] **Sabtu:** Fase 3 (Tabel Admin Pengguna, Ubah Role).
- [ ] **Minggu:** Fase 4 (CRUD Tabel Preset).
- [ ] **Senin:** Fase 5 (API Status Job BullMQ, UI Monitoring).
- [ ] **Selasa:** Fase 5 Lanjutan (Analitik dan Riwayat View).
- [ ] **Rabu:** Fase 6 (Dark Mode, PWA, Evaluasi Akhir).

> **Note:** Setiap sesi harian bisa dipecah menjadi beberapa *prompt* kecil saat berkomunikasi dengan AI agar hasilnya presisi dan tidak banyak error tumpang-tindih.
