-- Sample portfolio content for manual use in PostgreSQL / Supabase SQL Editor.
-- These rows are drafts and will not appear on the public site until published.
-- Change the example text to your own content before publishing.

INSERT INTO "projects" (
  "id", "title", "slug", "summary", "problem", "solution", "result",
  "featured", "order", "status", "updatedAt"
) VALUES
  (
    gen_random_uuid(), 'Contoh: Dashboard Inventaris', 'contoh-dashboard-inventaris',
    'Contoh data. Ganti ringkasan ini dengan deskripsi proyek asli.',
    'Jelaskan masalah pengguna yang benar-benar dihadapi.',
    'Jelaskan solusi dan keputusan teknis yang benar-benar kamu buat.',
    'Tambahkan hasil nyata setelah proyek selesai.',
    false, 0, 'DRAFT', NOW()
  ),
  (
    gen_random_uuid(), 'Contoh: Katalog Produk', 'contoh-katalog-produk',
    'Contoh data. Ganti ringkasan ini dengan deskripsi proyek asli.',
    'Jelaskan kebutuhan pengguna yang ingin dijawab.',
    'Jelaskan alur dan fitur yang kamu bangun.',
    'Tambahkan hasil nyata setelah proyek selesai.',
    false, 1, 'DRAFT', NOW()
  ),
  (
    gen_random_uuid(), 'Contoh: Aplikasi Catatan', 'contoh-aplikasi-catatan',
    'Contoh data. Ganti ringkasan ini dengan deskripsi proyek asli.',
    'Jelaskan pekerjaan pengguna yang ingin dibuat lebih mudah.',
    'Jelaskan pendekatan yang kamu gunakan untuk membuat aplikasi ini.',
    'Tambahkan hasil nyata setelah proyek selesai.',
    false, 2, 'DRAFT', NOW()
  )
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "posts" (
  "id", "title", "slug", "excerpt", "content", "status", "tags", "updatedAt"
) VALUES
  (
    gen_random_uuid(), 'Contoh: Catatan Membuat Antarmuka Responsif', 'contoh-antarmuka-responsif',
    'Draf contoh. Ganti dengan catatan dan pengalamanmu.',
    E'## Draf contoh\n\nGanti bagian ini dengan tulisan dan pengalamanmu sendiri.',
    'DRAFT', ARRAY['contoh', 'frontend']::TEXT[], NOW()
  ),
  (
    gen_random_uuid(), 'Contoh: Merapikan Alur API', 'contoh-merapikan-api',
    'Draf contoh. Ganti dengan catatan dan pengalamanmu.',
    E'## Draf contoh\n\nGanti bagian ini dengan tulisan dan pengalamanmu sendiri.',
    'DRAFT', ARRAY['contoh', 'backend']::TEXT[], NOW()
  )
ON CONFLICT ("slug") DO NOTHING;
