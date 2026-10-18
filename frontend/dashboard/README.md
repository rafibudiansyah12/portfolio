# Portfolio dashboard

Panel admin React + Vite untuk mengelola konten portfolio melalui REST API. Dashboard tidak mengakses database secara langsung.

## Menjalankan lokal

Dari root monorepo:

```powershell
Copy-Item frontend/dashboard/.env.example frontend/dashboard/.env.local
pnpm install
pnpm --filter @portfolio/api dev
pnpm --filter @portfolio/dashboard dev
```

Atur `VITE_API_URL` di `frontend/dashboard/.env.local` (default `http://localhost:3001/api/v1`) dan `VITE_PUBLIC_SITE_URL` untuk tautan kembali dari login (default `http://localhost:3000/id`). Pastikan API dan PostgreSQL berjalan, migration sudah diterapkan, dan akun admin telah di-seed. Buka URL Vite yang dicetak di terminal (umumnya `http://localhost:5173`).

## Isi dashboard

- Login dan proteksi route; access token hanya disimpan di memori. Refresh token menggunakan cookie httpOnly API, dan permintaan yang menerima 401 mencoba refresh lalu mengulang sekali.
- Overview statistik dan grafik views proyek.
- CRUD proyek dengan Tiptap, thumbnail/galeri media, relasi skill, status terjadwal, SEO, serta drag-and-drop urutan.
- CRUD skill, pengalaman, blog, profil, dan testimoni; moderasi guestbook; inbox kontak dan balas email; subscriber; media; pengaturan situs; audit log.
- Tabel dengan pencarian, sortir, pagination, toast, dialog konfirmasi, dan tema gelap/terang.

Kontrak dan validasi formulir menggunakan skema bersama dari `packages/shared`. API base URL diatur lewat `VITE_API_URL`.
