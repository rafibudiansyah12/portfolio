-- ============================================================================
-- Sample data: 10 rows per table (PostgreSQL)
-- Matches backend/api/prisma/schema.prisma
-- Jalankan sekali di psql / pgAdmin / DBeaver. Aman dijalankan ulang untuk
-- tabel yang punya UNIQUE (ON CONFLICT DO NOTHING).
-- Prisma membuat id (uuid) dan updatedAt di sisi client, jadi di sini diisi manual.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. SKILLS (10)
-- ---------------------------------------------------------------------------
INSERT INTO skills (id, name, category, level, icon) VALUES
  (gen_random_uuid(), 'React',        'Frontend', 90, NULL),
  (gen_random_uuid(), 'Next.js',      'Frontend', 85, NULL),
  (gen_random_uuid(), 'TypeScript',   'Language', 88, NULL),
  (gen_random_uuid(), 'Tailwind CSS', 'Frontend', 92, NULL),
  (gen_random_uuid(), 'Node.js',      'Backend',  82, NULL),
  (gen_random_uuid(), 'Express',      'Backend',  80, NULL),
  (gen_random_uuid(), 'PostgreSQL',   'Database', 78, NULL),
  (gen_random_uuid(), 'Prisma',       'Database', 80, NULL),
  (gen_random_uuid(), 'Docker',       'DevOps',   65, NULL),
  (gen_random_uuid(), 'Figma',        'Design',   75, NULL)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. PROJECTS (10)
-- ---------------------------------------------------------------------------
INSERT INTO projects
  (id, title, slug, summary, client, problem, solution, result, "thumbnailUrl",
   "repoUrl", "demoUrl", featured, "order", status, "publishAt", "seoTitle",
   "seoDescription", "viewCount", "updatedAt")
VALUES
  (gen_random_uuid(), 'Portfolio Website', 'portfolio-website',
   'Website portfolio pribadi dengan dashboard admin dan blog.', 'Personal',
   'Portfolio statis sulit diperbarui tanpa mengubah kode.',
   'Membangun CMS dashboard dengan API terpisah dan frontend Next.js.',
   'Konten bisa diperbarui dalam hitungan detik tanpa deploy ulang.',
   'https://picsum.photos/seed/p1/800/500', 'https://github.com/example/portfolio',
   'https://example.com', true, 1, 'PUBLISHED', NULL, 'Portfolio Website',
   'Portfolio pribadi dengan dashboard admin.', 120, now()),
  (gen_random_uuid(), 'E-Commerce Toko Online', 'e-commerce-toko-online',
   'Toko online lengkap dengan keranjang dan pembayaran.', 'Toko Maju Jaya',
   'Penjualan masih manual lewat chat.', 'Membuat katalog, keranjang, dan checkout online.',
   'Penjualan naik 40% dalam 3 bulan.', 'https://picsum.photos/seed/p2/800/500',
   'https://github.com/example/ecommerce', 'https://example.com/shop', true, 2, 'PUBLISHED',
   NULL, 'E-Commerce Toko Online', 'Aplikasi toko online dengan pembayaran.', 98, now()),
  (gen_random_uuid(), 'Aplikasi Kasir (POS)', 'aplikasi-kasir-pos',
   'Point of sale sederhana untuk UMKM.', 'Warung Sehat',
   'Pencatatan transaksi masih di buku.', 'Aplikasi kasir web dengan laporan harian.',
   'Waktu rekap harian turun dari 1 jam menjadi 2 menit.', 'https://picsum.photos/seed/p3/800/500',
   'https://github.com/example/pos', NULL, false, 3, 'PUBLISHED', NULL,
   'Aplikasi Kasir POS', 'POS untuk UMKM.', 75, now()),
  (gen_random_uuid(), 'Sistem Informasi Sekolah', 'sistem-informasi-sekolah',
   'Pengelolaan data siswa, nilai, dan absensi.', 'SMK Nusantara',
   'Data siswa tersebar di banyak file spreadsheet.', 'Satu sistem terpusat dengan hak akses guru dan admin.',
   'Administrasi lebih cepat dan minim kesalahan.', 'https://picsum.photos/seed/p4/800/500',
   'https://github.com/example/sis', NULL, false, 4, 'PUBLISHED', NULL,
   'Sistem Informasi Sekolah', 'Sistem informasi akademik.', 64, now()),
  (gen_random_uuid(), 'Landing Page Startup', 'landing-page-startup',
   'Landing page cepat dengan skor Lighthouse tinggi.', 'Startup Nusa',
   'Landing lama lambat dan konversi rendah.', 'Redesign dengan optimasi gambar dan SEO.',
   'Waktu muat turun 60%, konversi naik 25%.', 'https://picsum.photos/seed/p5/800/500',
   NULL, 'https://example.com/landing', false, 5, 'PUBLISHED', NULL,
   'Landing Page Startup', 'Landing page performa tinggi.', 52, now()),
  (gen_random_uuid(), 'Aplikasi Booking Barbershop', 'aplikasi-booking-barbershop',
   'Reservasi online untuk barbershop.', 'Gentleman Cut',
   'Antrian pelanggan sering bentrok.', 'Booking berbasis jadwal dengan notifikasi WhatsApp.',
   'No-show berkurang 50%.', 'https://picsum.photos/seed/p6/800/500',
   'https://github.com/example/booking', NULL, false, 6, 'PUBLISHED', NULL,
   'Booking Barbershop', 'Reservasi online barbershop.', 41, now()),
  (gen_random_uuid(), 'Dashboard Analitik', 'dashboard-analitik',
   'Visualisasi data penjualan interaktif.', 'Internal',
   'Laporan penjualan sulit dibaca.', 'Dashboard dengan grafik dan filter periode.',
   'Keputusan bisnis lebih cepat berbasis data.', 'https://picsum.photos/seed/p7/800/500',
   'https://github.com/example/analytics', NULL, false, 7, 'PUBLISHED', NULL,
   'Dashboard Analitik', 'Dashboard analitik penjualan.', 33, now()),
  (gen_random_uuid(), 'Aplikasi Catatan Kolaboratif', 'aplikasi-catatan-kolaboratif',
   'Catatan real-time untuk tim kecil.', 'Personal',
   'Catatan tim terpisah di banyak aplikasi.', 'Editor kolaboratif dengan sinkronisasi real-time.',
   'Dalam pengembangan.', 'https://picsum.photos/seed/p8/800/500',
   NULL, NULL, false, 8, 'DRAFT', NULL, NULL, NULL, 0, now()),
  (gen_random_uuid(), 'Chatbot Customer Service', 'chatbot-customer-service',
   'Chatbot untuk menjawab pertanyaan umum pelanggan.', 'Toko Maju Jaya',
   'Admin kewalahan membalas pertanyaan berulang.', 'Chatbot berbasis aturan dan FAQ.',
   'Dijadwalkan rilis bulan depan.', 'https://picsum.photos/seed/p9/800/500',
   NULL, NULL, false, 9, 'SCHEDULED', now() + interval '30 days', NULL, NULL, 0, now()),
  (gen_random_uuid(), 'API Manajemen Inventori', 'api-manajemen-inventori',
   'REST API untuk stok barang multi-gudang.', 'CV Sentosa',
   'Stok antar gudang tidak sinkron.', 'API dengan transaksi dan audit log.',
   'Selisih stok turun signifikan.', 'https://picsum.photos/seed/p10/800/500',
   'https://github.com/example/inventory-api', NULL, false, 10, 'PUBLISHED', NULL,
   'API Inventori', 'REST API inventori.', 28, now())
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. PROJECT_SKILLS (10) — relasi proyek ↔ skill (lewat slug & nama)
-- ---------------------------------------------------------------------------
INSERT INTO project_skills ("projectId", "skillId")
SELECT p.id, s.id
FROM (VALUES
  ('portfolio-website',            'Next.js'),
  ('portfolio-website',            'TypeScript'),
  ('e-commerce-toko-online',       'React'),
  ('e-commerce-toko-online',       'PostgreSQL'),
  ('aplikasi-kasir-pos',           'Node.js'),
  ('sistem-informasi-sekolah',     'Prisma'),
  ('landing-page-startup',         'Tailwind CSS'),
  ('aplikasi-booking-barbershop',  'Express'),
  ('dashboard-analitik',           'React'),
  ('api-manajemen-inventori',      'Docker')
) AS v(project_slug, skill_name)
JOIN projects p ON p.slug = v.project_slug
JOIN skills   s ON s.name = v.skill_name
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. EXPERIENCES (10)  type: WORK | ORGANIZATION | EDUCATION
-- ---------------------------------------------------------------------------
INSERT INTO experiences (id, type, title, organization, "startDate", "endDate", description, "order") VALUES
  (gen_random_uuid(), 'EDUCATION',    'S1 Teknik Informatika',          'Universitas Indraprasta PGRI', '2022-09-01', NULL,         'Fokus pada pengembangan web dan rekayasa perangkat lunak.', 1),
  (gen_random_uuid(), 'WORK',         'Freelance Web Developer',        'Self-employed',                '2023-01-01', NULL,         'Membangun website dan aplikasi web untuk klien UMKM.', 2),
  (gen_random_uuid(), 'WORK',         'Frontend Developer Intern',      'PT Teknologi Nusantara',       '2024-06-01', '2024-09-01', 'Mengembangkan komponen UI dengan React dan TypeScript.', 3),
  (gen_random_uuid(), 'ORGANIZATION', 'Anggota Divisi Teknologi',       'Himpunan Mahasiswa Informatika','2023-02-01', '2024-01-31', 'Mengelola website organisasi dan workshop pemrograman.', 4),
  (gen_random_uuid(), 'EDUCATION',    'SMK Rekayasa Perangkat Lunak',   'SMK Negeri 1',                 '2019-07-01', '2022-06-30', 'Belajar dasar pemrograman, basis data, dan desain web.', 5),
  (gen_random_uuid(), 'WORK',         'Backend Developer Intern',       'CV Digital Kreatif',           '2024-10-01', '2025-01-31', 'Membuat REST API dengan Node.js dan PostgreSQL.', 6),
  (gen_random_uuid(), 'ORGANIZATION', 'Asisten Laboratorium',           'Lab Komputer Kampus',          '2023-09-01', '2024-06-30', 'Membantu praktikum pemrograman web mahasiswa baru.', 7),
  (gen_random_uuid(), 'ORGANIZATION', 'Panitia Hackathon Kampus',       'BEM Fakultas Teknik',          '2023-11-01', '2023-12-15', 'Koordinator teknis acara hackathon tingkat fakultas.', 8),
  (gen_random_uuid(), 'WORK',         'UI Developer (Part-time)',       'Studio Kreatif Jakarta',       '2025-02-01', NULL,         'Menerjemahkan desain Figma menjadi antarmuka responsif.', 9),
  (gen_random_uuid(), 'EDUCATION',    'Bootcamp Fullstack JavaScript',  'Dicoding Academy',             '2023-03-01', '2023-08-30', 'Pelatihan intensif JavaScript, Node.js, dan React.', 10);

-- ---------------------------------------------------------------------------
-- 5. POSTS (10)  status: DRAFT | PUBLISHED  — tags[0] tampil sebagai kategori
-- ---------------------------------------------------------------------------
INSERT INTO posts (id, title, slug, excerpt, content, "coverUrl", status, "publishedAt", tags, "updatedAt") VALUES
  (gen_random_uuid(), 'Hal yang Saya Pelajari Saat Membuat Website', 'hal-yang-saya-pelajari-membuat-website',
   'Catatan tentang proses merancang dan membangun website dari nol.',
   '<p>Membangun website mengajarkan banyak hal, mulai dari perencanaan hingga deployment.</p>',
   'https://picsum.photos/seed/b1/800/500', 'PUBLISHED', now() - interval '2 days',  ARRAY['web development','pengalaman'], now()),
  (gen_random_uuid(), 'Kenapa Saya Memilih Next.js', 'kenapa-saya-memilih-nextjs',
   'Alasan teknis memilih Next.js untuk proyek portfolio.',
   '<p>Server components, routing, dan performa menjadi pertimbangan utama.</p>',
   'https://picsum.photos/seed/b2/800/500', 'PUBLISHED', now() - interval '5 days',  ARRAY['frontend','next.js'], now()),
  (gen_random_uuid(), 'Dasar-Dasar PostgreSQL untuk Pemula', 'dasar-dasar-postgresql-pemula',
   'Panduan singkat memahami tabel, relasi, dan query dasar.',
   '<p>PostgreSQL adalah database relasional yang kuat dan open source.</p>',
   'https://picsum.photos/seed/b3/800/500', 'PUBLISHED', now() - interval '9 days',  ARRAY['database','tutorial'], now()),
  (gen_random_uuid(), 'Tips Membuat UI yang Rapi', 'tips-membuat-ui-yang-rapi',
   'Prinsip spacing, tipografi, dan warna yang membuat UI terlihat profesional.',
   '<p>Konsistensi lebih penting daripada banyaknya efek visual.</p>',
   'https://picsum.photos/seed/b4/800/500', 'PUBLISHED', now() - interval '14 days', ARRAY['desain','ui'], now()),
  (gen_random_uuid(), 'Mengenal TypeScript dalam 10 Menit', 'mengenal-typescript-10-menit',
   'Ringkasan fitur TypeScript yang paling sering dipakai.',
   '<p>Type safety membantu menangkap bug sebelum aplikasi berjalan.</p>',
   'https://picsum.photos/seed/b5/800/500', 'PUBLISHED', now() - interval '20 days', ARRAY['typescript','tutorial'], now()),
  (gen_random_uuid(), 'Deploy Aplikasi dengan Docker', 'deploy-aplikasi-dengan-docker',
   'Langkah membungkus aplikasi Node.js ke dalam container.',
   '<p>Docker membuat lingkungan development dan production lebih konsisten.</p>',
   'https://picsum.photos/seed/b6/800/500', 'PUBLISHED', now() - interval '27 days', ARRAY['devops','docker'], now()),
  (gen_random_uuid(), 'Belajar REST API dengan Express', 'belajar-rest-api-dengan-express',
   'Membuat endpoint CRUD pertama dengan Express dan Prisma.',
   '<p>REST API adalah fondasi komunikasi frontend dan backend.</p>',
   'https://picsum.photos/seed/b7/800/500', 'PUBLISHED', now() - interval '35 days', ARRAY['backend','api'], now()),
  (gen_random_uuid(), 'Optimasi Performa Website', 'optimasi-performa-website',
   'Cara meningkatkan skor Lighthouse dengan perubahan sederhana.',
   '<p>Optimasi gambar, lazy loading, dan caching memberi dampak besar.</p>',
   'https://picsum.photos/seed/b8/800/500', 'PUBLISHED', now() - interval '45 days', ARRAY['performa','web development'], now()),
  (gen_random_uuid(), 'Rencana Belajar 2026', 'rencana-belajar-2026',
   'Daftar topik teknologi yang ingin saya pelajari tahun depan.',
   '<p>Draf: masih dalam penulisan.</p>',
   NULL, 'DRAFT', NULL, ARRAY['pribadi'], now()),
  (gen_random_uuid(), 'Review Tools Developer Favorit', 'review-tools-developer-favorit',
   'Editor, extension, dan tools yang membantu produktivitas harian.',
   '<p>Draf: menunggu foto dan contoh konfigurasi.</p>',
   NULL, 'DRAFT', NULL, ARRAY['tools','produktivitas'], now())
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. TESTIMONIALS (10)
-- ---------------------------------------------------------------------------
INSERT INTO testimonials (id, "authorName", "authorRole", message, approved) VALUES
  (gen_random_uuid(), 'Andi Pratama',   'Owner, Toko Maju Jaya',      'Hasilnya rapi dan cepat. Penjualan online kami naik signifikan.', true),
  (gen_random_uuid(), 'Siti Nurhaliza', 'Kepala Sekolah, SMK Nusantara','Sistem sekolah jadi jauh lebih mudah dipakai guru.', true),
  (gen_random_uuid(), 'Budi Santoso',   'Founder, Startup Nusa',      'Landing page-nya cepat dan konversinya naik. Komunikasi juga enak.', true),
  (gen_random_uuid(), 'Rina Wulandari', 'Pemilik Warung Sehat',       'Aplikasi kasirnya sederhana dan sangat membantu rekap harian.', true),
  (gen_random_uuid(), 'Dimas Aditya',   'Product Manager',            'Detail UI-nya bagus dan kode mudah dirawat.', true),
  (gen_random_uuid(), 'Laila Fitri',    'Owner, Gentleman Cut',       'Booking online mengurangi pelanggan yang tidak datang.', true),
  (gen_random_uuid(), 'Fajar Nugroho',  'Dosen Pembimbing',           'Mahasiswa yang rajin dan terbuka terhadap masukan.', true),
  (gen_random_uuid(), 'Maya Kusuma',    'Desainer UI',                'Implementasi desainnya sangat presisi dengan file Figma.', true),
  (gen_random_uuid(), 'Reza Mahendra',  'CTO, CV Sentosa',            'API inventori stabil dan dokumentasinya jelas.', false),
  (gen_random_uuid(), 'Putri Anggraini','Rekan Tim',                  'Menyenangkan diajak kerja sama dan cepat belajar.', false);

-- ---------------------------------------------------------------------------
-- 7. GUESTBOOK_ENTRIES (10)
-- ---------------------------------------------------------------------------
INSERT INTO guestbook_entries (id, name, message, approved) VALUES
  (gen_random_uuid(), 'Agus',     'Portfolionya keren, desainnya bersih!', true),
  (gen_random_uuid(), 'Dewi',     'Semangat terus ngoding ya!', true),
  (gen_random_uuid(), 'Rizky',    'Blognya bermanfaat, ditunggu artikel selanjutnya.', true),
  (gen_random_uuid(), 'Nadia',    'Animasinya halus, suka banget.', true),
  (gen_random_uuid(), 'Hendra',   'Mampir dari LinkedIn, projectnya menarik.', true),
  (gen_random_uuid(), 'Citra',    'Tampilan dark mode-nya mantap.', true),
  (gen_random_uuid(), 'Yoga',     'Sukses selalu, bro!', true),
  (gen_random_uuid(), 'Anisa',    'Bagus banget untuk portfolio mahasiswa.', true),
  (gen_random_uuid(), 'Tester',   'Hanya mencoba fitur buku tamu.', false),
  (gen_random_uuid(), 'Pengunjung','Salam kenal dari Bandung.', false);

-- ---------------------------------------------------------------------------
-- 8. CONTACT_MESSAGES (10)
-- ---------------------------------------------------------------------------
INSERT INTO contact_messages (id, name, email, subject, message, "isRead", "isArchived") VALUES
  (gen_random_uuid(), 'Andi Pratama',  'andi@example.com',   'Pembuatan website toko',  'Halo, saya ingin dibuatkan website toko online. Bisa diskusi?', false, false),
  (gen_random_uuid(), 'Siti Aminah',   'siti@example.com',   'Kolaborasi proyek',       'Kami butuh frontend developer untuk proyek jangka pendek.',    false, false),
  (gen_random_uuid(), 'Budi Hartono',  'budi@example.com',   'Tanya harga landing page','Berapa estimasi biaya untuk landing page 1 halaman?',           true,  false),
  (gen_random_uuid(), 'Rina Marlina',  'rina@example.com',   'Magang',                  'Apakah terbuka untuk posisi magang di tempat kami?',           true,  false),
  (gen_random_uuid(), 'Dimas Saputra', 'dimas@example.com',  'Undangan wawancara',      'Kami tertarik dengan profil Anda, bisa jadwalkan wawancara?',  false, false),
  (gen_random_uuid(), 'Laila Sari',    'laila@example.com',  'Revisi desain',           'Mohon ditinjau ulang bagian halaman kontak.',                  true,  true),
  (gen_random_uuid(), 'Fajar Ramadhan','fajar@example.com',  'Pertanyaan teknis',       'Stack apa yang dipakai untuk dashboard admin?',                true,  false),
  (gen_random_uuid(), 'Maya Putri',    'maya@example.com',   'Sponsor event',           'Kami mengadakan event komunitas, tertarik jadi pembicara?',    false, false),
  (gen_random_uuid(), 'Reza Alfian',   'reza@example.com',   'Spam test',               'Pesan ini hanya untuk pengujian.',                             true,  true),
  (gen_random_uuid(), 'Putri Lestari', 'putri@example.com',  'Terima kasih',            'Terima kasih sudah membantu proyek kemarin!',                  true,  false);

-- ---------------------------------------------------------------------------
-- 9. SUBSCRIBERS (10)  confirmedAt NULL = belum konfirmasi
-- ---------------------------------------------------------------------------
INSERT INTO subscribers (id, email, "confirmedAt") VALUES
  (gen_random_uuid(), 'sub1@example.com',  now() - interval '30 days'),
  (gen_random_uuid(), 'sub2@example.com',  now() - interval '25 days'),
  (gen_random_uuid(), 'sub3@example.com',  now() - interval '20 days'),
  (gen_random_uuid(), 'sub4@example.com',  now() - interval '15 days'),
  (gen_random_uuid(), 'sub5@example.com',  now() - interval '10 days'),
  (gen_random_uuid(), 'sub6@example.com',  now() - interval '7 days'),
  (gen_random_uuid(), 'sub7@example.com',  now() - interval '3 days'),
  (gen_random_uuid(), 'sub8@example.com',  NULL),
  (gen_random_uuid(), 'sub9@example.com',  NULL),
  (gen_random_uuid(), 'sub10@example.com', NULL)
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10. PAGE_VIEWS (10) — untuk grafik "Views 30 hari terakhir" di dashboard
-- ---------------------------------------------------------------------------
INSERT INTO page_views (id, path, "projectId", referrer, country, "createdAt")
SELECT gen_random_uuid(), v.path, p.id, v.referrer, v.country, now() - v.ago
FROM (VALUES
  ('/projects/portfolio-website',      'portfolio-website',      'https://google.com',   'ID', interval '1 day'),
  ('/projects/portfolio-website',      'portfolio-website',      'https://linkedin.com', 'ID', interval '2 days'),
  ('/projects/e-commerce-toko-online', 'e-commerce-toko-online', 'https://google.com',   'ID', interval '3 days'),
  ('/projects/e-commerce-toko-online', 'e-commerce-toko-online', NULL,                   'MY', interval '5 days'),
  ('/projects/aplikasi-kasir-pos',     'aplikasi-kasir-pos',     'https://github.com',   'ID', interval '7 days'),
  ('/projects/dashboard-analitik',     'dashboard-analitik',     'https://google.com',   'SG', interval '9 days'),
  ('/projects/landing-page-startup',   'landing-page-startup',   NULL,                   'ID', interval '12 days'),
  ('/projects/portfolio-website',      'portfolio-website',      'https://twitter.com',  'US', interval '15 days'),
  ('/projects/api-manajemen-inventori','api-manajemen-inventori','https://github.com',   'ID', interval '20 days'),
  ('/projects/sistem-informasi-sekolah','sistem-informasi-sekolah','https://google.com', 'ID', interval '25 days')
) AS v(path, slug, referrer, country, ago)
JOIN projects p ON p.slug = v.slug;

COMMIT;

-- Catatan:
--  * Tabel users, profiles, media, project_images, audit_logs tidak disertakan:
--    users/profiles dibuat lewat seed/login (butuh passwordHash), media butuh file upload.
--  * Kalau gen_random_uuid() tidak ada (PostgreSQL < 13), jalankan dulu:
--      CREATE EXTENSION IF NOT EXISTS pgcrypto;
--  * Hapus data sample:  TRUNCATE page_views, project_skills, projects, skills,
--      experiences, posts, testimonials, guestbook_entries, contact_messages,
--      subscribers RESTART IDENTITY CASCADE;


-- ============================================================================
-- 11. SITE_SETTINGS: Layanan (services) & Penghargaan/Sertifikat (awards)
--     Keduanya disimpan sebagai JSON array di tabel site_settings, bukan tabel
--     tersendiri. Home menampilkan maksimal 6 item per section.
--     Catatan: ini MENIMPA isi key 'services' dan 'awards' yang sudah ada.
-- ============================================================================
BEGIN;

INSERT INTO site_settings (key, value) VALUES
('services', '[
  {"id":"svc-1","title":{"id":"Pengembangan Website","en":"Website Development"},"description":{"id":"Website company profile, landing page, dan portfolio yang cepat dan responsif.","en":"Fast and responsive company profile sites, landing pages, and portfolios."}},
  {"id":"svc-2","title":{"id":"Aplikasi Web Kustom","en":"Custom Web Applications"},"description":{"id":"Dashboard, sistem informasi, dan aplikasi bisnis sesuai kebutuhan.","en":"Dashboards, information systems, and business apps tailored to your needs."}},
  {"id":"svc-3","title":{"id":"Desain UI/UX","en":"UI/UX Design"},"description":{"id":"Antarmuka modern dan mudah digunakan, dari wireframe hingga prototipe Figma.","en":"Modern, easy-to-use interfaces from wireframes to Figma prototypes."}},
  {"id":"svc-4","title":{"id":"Pengembangan REST API","en":"REST API Development"},"description":{"id":"API yang aman dan terdokumentasi dengan Node.js, Express, dan PostgreSQL.","en":"Secure, documented APIs built with Node.js, Express, and PostgreSQL."}},
  {"id":"svc-5","title":{"id":"Optimasi Performa & SEO","en":"Performance & SEO Optimization"},"description":{"id":"Tingkatkan kecepatan muat dan peringkat pencarian website Anda.","en":"Improve your website load speed and search ranking."}},
  {"id":"svc-6","title":{"id":"Maintenance & Dukungan","en":"Maintenance & Support"},"description":{"id":"Pembaruan rutin, perbaikan bug, dan dukungan teknis berkelanjutan.","en":"Routine updates, bug fixes, and ongoing technical support."}},
  {"id":"svc-7","title":{"id":"Integrasi Payment Gateway","en":"Payment Gateway Integration"},"description":{"id":"Integrasi pembayaran online dengan Midtrans, Xendit, atau Stripe.","en":"Online payment integration with Midtrans, Xendit, or Stripe."}},
  {"id":"svc-8","title":{"id":"Pembuatan CMS & Admin Panel","en":"CMS & Admin Panel"},"description":{"id":"Panel admin yang mudah digunakan untuk mengelola konten dan data bisnis.","en":"Easy-to-use admin panels for managing content and business data."}},
  {"id":"svc-9","title":{"id":"Migrasi & Desain Database","en":"Database Design & Migration"},"description":{"id":"Perancangan skema PostgreSQL yang rapi serta migrasi data yang aman.","en":"Clean PostgreSQL schema design and safe data migrations."}},
  {"id":"svc-10","title":{"id":"Deployment & Cloud Setup","en":"Deployment & Cloud Setup"},"description":{"id":"Setup server, Docker, CI/CD, dan domain agar aplikasi siap produksi.","en":"Server, Docker, CI/CD, and domain setup for production readiness."}}
]'::jsonb),
('awards', '[
  {"id":"awd-1","kind":"award","title":{"id":"Juara 1 Hackathon Kampus","en":"1st Place Campus Hackathon"},"issuer":"BEM Fakultas Teknik","date":"2023","url":"https://example.com/certificates/hackathon-2023"},
  {"id":"awd-2","kind":"award","title":{"id":"Mahasiswa Berprestasi Bidang Teknologi","en":"Outstanding Student in Technology"},"issuer":"Universitas Indraprasta PGRI","date":"2024","url":"https://example.com/certificates/mapres-2024"},
  {"id":"awd-3","kind":"certificate","title":{"id":"Belajar Fundamental Aplikasi Web dengan React","en":"React Web Application Fundamentals"},"issuer":"Dicoding Academy","date":"2023","url":"https://www.dicoding.com"},
  {"id":"awd-4","kind":"certificate","title":{"id":"Belajar Membuat Aplikasi Back-End untuk Pemula","en":"Back-End Application Basics"},"issuer":"Dicoding Academy","date":"2023","url":"https://www.dicoding.com"},
  {"id":"awd-5","kind":"certificate","title":{"id":"Responsive Web Design","en":"Responsive Web Design"},"issuer":"freeCodeCamp","date":"2022","url":"https://www.freecodecamp.org"},
  {"id":"awd-6","kind":"certificate","title":{"id":"Meta Front-End Developer","en":"Meta Front-End Developer"},"issuer":"Coursera","date":"2024","url":"https://www.coursera.org"},
  {"id":"awd-7","kind":"certificate","title":{"id":"JavaScript Algorithms and Data Structures","en":"JavaScript Algorithms and Data Structures"},"issuer":"freeCodeCamp","date":"2023","url":"https://www.freecodecamp.org"},
  {"id":"awd-8","kind":"award","title":{"id":"Finalis Web Design Competition","en":"Web Design Competition Finalist"},"issuer":"Komunitas Web Developer Indonesia","date":"2024","url":"https://example.com/certificates/web-design-2024"},
  {"id":"awd-9","kind":"certificate","title":{"id":"Cloud Practitioner Essentials","en":"Cloud Practitioner Essentials"},"issuer":"Dicoding & AWS","date":"2024","url":"https://www.dicoding.com"},
  {"id":"awd-10","kind":"certificate","title":{"id":"Mastering TypeScript & Node.js","en":"Mastering TypeScript & Node.js"},"issuer":"Udemy","date":"2025","url":"https://www.udemy.com"}
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
