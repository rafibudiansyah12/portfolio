# Design Brief

## Konsep visual

Portofolio personal seorang web developer yang terasa seperti meja kerja digital yang tenang: proyek tampil sebagai artefak utama dalam ruang kaca yang rapi.

**Kata sifat:** tenang, taktil, terarah.

## Arah visual

Soft glassmorphism dengan bento grid dan mode terang sebagai tema utama; dark mode menjadi tema kedua yang memakai token warna, radius, dan elevasi yang sama dengan nilai permukaan serta teks yang disesuaikan.

## Palet warna

| Nama         | Hex       | Peran                                         |
| ------------ | --------- | --------------------------------------------- |
| Kabut Pagi   | `#F4F6F4` | Latar terang                                  |
| Kaca Embun   | `#FFFFFF` | Permukaan kartu dan navigasi kaca             |
| Tinta Arang  | `#182321` | Teks utama dan tombol utama                   |
| Abu Pakis    | `#64716D` | Teks sekunder                                 |
| Giok Pesisir | `#168C78` | Aksen, tautan aktif, dan fokus                |
| Busa Laut    | `#DDF2EB` | Tint lembut untuk badge atau sorotan terbatas |

Giok Pesisir menggantikan aksen ungu default karena memberi identitas yang lebih dekat dengan kesan tumbuh, teknis, dan tenang. Aksen ini cukup kuat untuk navigasi dan fokus tanpa mendominasi permukaan terang; uji kontras tetap diperlukan saat diterapkan pada teks kecil.

## Tipografi

1. **Space Grotesk + Source Sans 3** — Space Grotesk untuk judul yang berkarakter geometris dan sedikit teknis; Source Sans 3 untuk isi, navigasi, dan formulir yang mudah dibaca.
2. **Manrope + Lora** — Manrope untuk antarmuka dan judul yang bersih; Lora untuk kutipan atau bagian editorial yang lebih personal.

**Pilihan:** Space Grotesk + Source Sans 3. Pasangan ini memberi suara khas pada judul tanpa mengorbankan keterbacaan antarmuka. Batasi dua keluarga font dan muat melalui `next/font`.

## Elemen khas

Satu panel “jejak proyek” yang menampilkan cuplikan proyek pilihan seperti artefak kerja yang sedang dibuka—tangkapan layar nyata dengan anotasi singkat tentang masalah yang diselesaikan. Elemen ini muncul di sisi kanan hero sebagai fokus visual utama; seluruh elemen lain tetap lebih tenang.

## Hal yang dihindari

- Teks gradasi sebagai gaya; paling banyak satu aksen gradasi untuk seluruh halaman.
- Eyebrow huruf kapital renggang di atas setiap judul.
- Satu kata pada headline diberi warna atau italic berbeda hanya sebagai hiasan.
- Kartu identik dengan radius dan bayangan seragam; ukuran dan bobot harus mengikuti kepentingan konten.
- Tiga blok statistik identik yang dibuat hanya demi simetri; tampilkan hanya angka yang nyata.
- Kotak ikon pastel pada empat kartu yang sama besar.
- Emoji sebagai ikon; gunakan satu set ikon dengan bobot garis konsisten.
- Panah dekoratif pada setiap tombol.
- Penanda bernomor kecuali untuk urutan yang memang nyata.
- Metadata dekoratif yang mengandalkan titik tengah, label fragmen, atau monospace tanpa fungsi.
- Semua konten rata tengah; gunakan perataan kiri dan asimetri dengan sengaja.
- Logo klien, testimoni, metrik, atau pengalaman yang direkayasa.
- Lorem ipsum, nama contoh seperti John Doe, dan wajah foto stok.
- Copy generik seperti “passionate developer”, “crafting meaningful digital experiences”, atau “turning ideas into reality”.
- Animasi masuk seragam di setiap bagian, hover lift di setiap kartu, dan dekorasi yang tidak membantu isi.

## Data pemilik

- **Nama:** [NAMA]
- **Peran:** [mis. Web developer, mahasiswa Teknik Informatika]
- **Tagline:** [TAGLINE]
- **Bahasa konten:** Indonesia (ID) dan English (EN)
