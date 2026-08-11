# DESIGN.md: Arah Visual Velox

> Status: source of truth untuk UI produk Velox. Dokumen ini menggantikan
> arah visual aplikasi pada `DESIGN_REFERENCE.md`. `ANTISLOP.md` adalah filter,
> bukan pengganti arah visual ini.

## Design Read

Membaca Velox sebagai aplikasi komunitas investasi privat untuk investor saham
Indonesia tingkat menengah, dengan bahasa visual editorial-finance yang tenang,
terpercaya, hangat, dan spesifik terhadap brand Velox.

**Dial: ENERGI 1 / RITME 2 / GERAK 1**

- ENERGI 1: data dan percakapan harus mudah dibaca, bukan tampil mencolok.
- RITME 2: struktur konsisten, tetapi halaman feed, saham, watchlist, dan calls
  memiliki komposisi sesuai kebutuhan kontennya.
- GERAK 1: gerak hanya untuk feedback, perubahan state, dan hover yang membantu.

## Prinsip Produk yang Terlihat

1. **Community first.** Feed dan diskusi menjadi fokus utama Home. Data pasar
   menjadi konteks untuk percakapan, bukan dekorasi terminal trading.
2. **Calm confidence.** Tampilan harus terasa serius tanpa menjadi kaku atau
   menyerupai dashboard bank generik.
3. **Information before decoration.** Harga, perubahan, ticker, penulis, waktu,
   dan status harus memiliki hierarchy yang jelas.
4. **One primary action per surface.** Setiap layar atau card hanya memiliki satu
   aksi yang paling menonjol.
5. **Honest data.** Data delayed selalu diberi label. Data kosong, gagal, dan
   loading ditampilkan secara jujur.

## Identitas Visual

### Warna

| Peran | Token | Nilai | Alasan |
|---|---|---:|---|
| Latar utama | `--background` | `#F7F4EE` | Cream memberi rasa hangat dan membedakan Velox dari fintech biru generik. |
| Surface | `--card` | `#FFFFFF` | Putih menjaga keterbacaan data dan percakapan. |
| Teks utama | `--foreground` | `#0E2230` | Navy mengikat UI ke logo dan memberi kontras kuat. |
| Teks sekunder | `--text-muted` | `#5B6B7A` | Dipakai untuk metadata, harus tetap lolos WCAG AA. |
| Border | `--border` | `#E5DCCB` | Memisahkan surface tanpa membuat semua card melayang. |
| Aksen | `--accent` | `#C9A961` | Gold berasal dari logo, dipakai hanya untuk aksi utama dan status khusus. |
| Positif | `--up` | `#1E8E5A` | Khusus kenaikan harga dan status positif. |
| Negatif | `--down` | `#C04545` | Khusus penurunan harga dan error. |

Gold tidak digunakan untuk semua link, ikon, badge, dan border secara bersamaan.
Hijau dan merah tidak dipakai sebagai dekorasi.

### Typography

- Gunakan Geist Sans yang sudah tersedia karena bentuknya netral dan terbaca
  baik untuk angka serta teks komunitas.
- Harga dan angka pasar menggunakan `tabular-nums`.
- Heading memakai sentence case. Hindari label uppercase dengan tracking ekstrem.
- Ukuran minimum body utama 15px desktop dan 16px pada input mobile.

### Bentuk dan Elevation

- Card utama: radius 12px, border 1px, tanpa shadow atau shadow sangat ringan.
- Modal dan auth card: radius 16px dengan elevation ringan karena berada di atas
  surface lain.
- Button dan input: radius 8px sampai 10px.
- Pill hanya untuk status nyata seperti `BUY`, `SELL`, `Aktif`, `Admin`, atau ticker.
- Jangan memberi hover lift pada setiap card. Gunakan perubahan border atau
  background untuk item yang benar-benar dapat diklik.

## Layout Global

- Lebar konten maksimum: 1200px sampai 1280px.
- Header desktop: logo, Home, Saham, Watchlist, Calls, lalu avatar.
- Admin mendapat item Anggota hanya ketika role admin aktif.
- Mobile memakai bottom navigation empat item: Home, Saham, Watchlist, Calls.
- Ticker berjalan tidak tampil global. Market snapshot ditempatkan sebagai konten
  tetap di Home atau halaman Saham agar layar tidak terus bergerak.
- Tap target minimum 44x44px.

## Komposisi Halaman

### Home

- Desktop memakai kolom utama 65 persen dan sidebar 35 persen.
- Kolom utama: composer, feed, komentar.
- Sidebar: IHSG, watchlist ringkas, call terbaru.
- Mobile: IHSG, watchlist, composer, feed, call terbaru.
- Titik fokus: percakapan terbaru dari circle.

### Saham

- Search menjadi titik masuk utama.
- Header saham menampilkan ticker, nama, harga, perubahan, label delayed, dan aksi
  tambah atau hapus watchlist.
- Desktop: chart dua pertiga, statistik sepertiga.
- Bagian bawah: tab Ringkasan dan Diskusi.
- Titik fokus: harga dan konteks diskusi untuk satu ticker.

### Watchlist

- Tabel atau list padat dengan ticker, harga, perubahan, dan aksi hapus.
- Baris dapat dibuka ke halaman saham.
- Tidak ada kartu terpisah untuk setiap ticker.
- Titik fokus: perubahan harian saham yang diikuti member.

### Calls

- List card vertikal, bukan dashboard statistik.
- Setiap call menampilkan action, ticker, entry, target, alasan, status, penulis,
  dan waktu.
- Admin mendapat aksi Buat Call dan Tutup Call.
- Titik fokus: call aktif paling baru.

### Kelola Anggota

- Pisahkan daftar pending dan aktif.
- Kode aktivasi hanya muncul setelah aksi admin dan dapat disalin.
- Data sensitif tidak ditampilkan.
- Titik fokus: signup yang menunggu persetujuan.

## Copy dan Bahasa

- Bahasa utama Indonesia yang ringkas dan natural.
- Istilah pasar yang umum seperti ticker, entry, target, BUY, SELL, dan HOLD boleh
  dipertahankan.
- CTA harus menyebut aksi nyata: `Posting`, `Tambah Watchlist`, `Buka Saham`,
  `Tutup Call`, `Setujui Anggota`.
- Hindari buzzword, klaim performa, statistik member, dan testimonial tanpa bukti.
- Hindari em dash dalam seluruh copy UI.

## Motion

- Durasi transisi 120ms sampai 200ms.
- Gunakan motion untuk focus, hover, expand komentar, tab, dan feedback perubahan
  harga.
- Tidak ada parallax, floating card, scroll reveal massal, atau animasi dekoratif
  pada aplikasi member.
- Hormati `prefers-reduced-motion`.

## State Wajib

Setiap surface berbasis data wajib memiliki:

- loading state yang mempertahankan layout;
- empty state yang menjelaskan tindakan berikutnya;
- error state dengan pesan manusiawi dan retry jika aman;
- disabled state ketika request sedang berjalan;
- success feedback setelah mutasi;
- focus state yang terlihat untuk keyboard.

## Anti-Slop Delivery

Sebelum UI dianggap selesai:

1. Baca dan jalankan Delivery Gate pada `ANTISLOP.md`.
2. Verifikasi desktop 1280px, tablet 768px, dan mobile 390px.
3. Uji keyboard, focus, kontras WCAG AA, loading, empty, dan error state.
4. Pastikan setiap link dan tombol memiliki perilaku nyata.
5. Pastikan keputusan warna, layout, typography, spacing, card, ikon, dan motion
   dapat dijelaskan dalam satu kalimat.

## Sumber Anti-Slop

`ANTISLOP.md` diadaptasi dari versi Bahasa Indonesia proyek
[`miqdadbadjuber/anti-slop`](https://github.com/miqdadbadjuber/anti-slop), digunakan
berdasarkan MIT License yang disimpan di `ANTISLOP-LICENSE.md`.
