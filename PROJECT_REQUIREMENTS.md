# PROJECT_REQUIREMENTS.md — Velox Landing Page + Light Rebrand

> Dokumen ini hasil interview sebelum implementasi. Disetujui: menunggu approval.

---

## 1. Business Overview
- **Perusahaan/Komunitas:** VELOX — komunitas investasi saham **Indonesia**.
- **Model bisnis:** **Freemium** — komunitas/gratis + membership premium berbayar.
- **Posisi merek:** premium investment community (shield = proteksi, arrow = growth).
- **Nilai inti:** kepercayaan, pertumbuhan, keamanan, eksklusivitas, profesionalisme.

## 2. Target Audience
- **Menengah** — investor yang sudah berinvestasi, butuh **riset pasar** dan **komunitas diskusi**.
- (Tidak fokus ke pemula absolut, bukan trader ekstrem.)
- Utama: investor saham Indonesia.

## 3. Primary Conversion Goal
- **Bergabung ke komunitas** (daftar akun / join komunitas).
- Membership premium adalah konversi sekunder.

## 4. Primary CTA
- **"Bergabung / Join / Masuk"** ke komunitas (button utama di hero & seluruh page).

## 5. Secondary CTA
- **"Lihat Premium / Membership"** — arahkan ke detail membership premium.

## 6. Brand Direction
- **Official logo family:** shield "V"+arrow, horizontal "VELOX Investment Community".
- **Palet dari logo:** Navy `#1B3A52` + Gold/Champagne `#C9A961`.
- **Gaya:** premium fintech, terpercaya, modern-minimal.
- Logo = source of truth; **tidak** redesign, **tidak** ganti dengan wordmark generik.

### Logo Usage Rules
| Asset | File | Penggunaan |
|-------|------|-----------|
| Primary horizontal | `primary-horizontal-logo.png` | Navbar (desktop), hero, footer (seksi terang) |
| Shield icon | `symbol.png` | Mobile navbar, badge, compact identity, section accents |
| White monochrome | `monochrome_white.png` | Seksi/footer gelap *(note: masih ada bg off-white, perlu re-cut/penanganan)* |
| Favicon mark | `favicon.png` | Favicon, browser tab, small square |

## 7. Design Direction
- **Mode:** **Light mode premium** (navy + gold di atas background putih/cream).
- **Varian langsung konsisten rebrand:** app/dashboard juga mau light.
- **Urutan:** Landing dulu + bangun **design system CSS tokens (light)** yang nanti dashboard adopt.

## 8. Referensi (Framer "Aset")
- Struktur/filosofi: **hero → trusted-by → benefit → stats → pricing → testimonials → FAQ → CTA → footer**.
- Animasi: **spring entrance + scroll reveal + stagger delay** (Framer Motion).
- **Tidak** copy brand/text dari Aset; hanya komposisi & polish level.

## 9. Sections (yang gue rekomendasiin untuk Velox community)
> Sesuai revisi user: struktur saya tentukan sendiri (terinspirasi Aset, disesuaikan community).

1. **Navbar** — logo primary + nav (Home, Fitur, Harga, FAQ) + CTA Join.
2. **Hero** — headline community, subtext, primary CTA, visual/shield identity.
3. **Social Proof / Trusted-by** — partner/member logos (placeholder) — *diangkat dari Aset*.
4. **Why Join / Benefit** — value komunitas (riset, diskusi, calls, watchlist).
5. **Stats** — jumlah member/perusahaan (placeholder, jangan angka palsu).
6. **Membership / Pricing** — gratis + premium berbayar.
7. **Testimonials** — member stories (placeholder).
8. **FAQ** — pertanyaan komunitas.
9. **Final CTA** — join komunitas.
10. **Footer** — logo, links, sosmed.

## 10. Content
- **Available:** copy ringkas hero/why (dari app), nama brand.
- **Belum ada (placeholder):** judgemental angka member, testimoni, FAQ content, partner logos, harga premium.
- **Aturan:** placeholder jelas `[username]`, `[jumlah]`, `[nama testi]` — bukan claim palsu.

## 11. Assets Available
- 4 logo PNG: `primary-horizontal-logo.png`, `symbol.png`, `monochrome_white.png`, `favicon.png`.
- Belum ada: screenshot product, foto member, partner logos, fonts custom.
- **GAMBAR (untuk sementara):** pakai **placeholder** — dicari via browser/network (layanan placeholder online, warna mengikuti brand navy/gold). User akan mengganti dengan aset asli nanti.

## 12. Technical Requirements
- **Stack (rekomendasi):** Next.js + TypeScript + Tailwind CSS + **Framer Motion** (untuk animasi).
- **Framer Motion belum terinstall** — perlu `npm install framer-motion`.
- Belum ada kebutuhan: CMS, form handling, analytics, payment, backend tambahan, newsletter (belum disebut).
- Auth: landing page `public` (tidak perlu login untuk akses landing).

## 13. Responsive Requirements
- **Desktop dulu** (fokus layar besar), **mobile menyusul**.
- Tetap harus rapi & usable di mobile (framer Aset mobile-first; mayoritas pengunjung komunitas ID dari HP/sosmed/WhatsApp).

## 14. Integrations
- **Belum ada** yang diwajibkan (Discord/Telegram/WhatsApp link, newsletter, payment belum dikonfirmasi).
- Navbar/footer boleh siapkan slot untuk sosmed/link komunitas (placeholder).

## 15. Important Constraints
- Jangan invent angka/testimoni/return/claim regulasi palsu.
- Jangan copy brand nama/logo/text dari referensi "Aset".
- Logo Velox = identity resmi; konsisten di semua placement.
- Reusable components, responsive, semantic, performant.
- Landing light, app/dashboard juga light (bertahap).

---

## LOGO USAGE GUIDANCE (ringkas)
- **Primary horizontal:** navbar desktop, hero, footer terang, umum.
- **Shield icon (symbol):** mobile navbar, favicon kecil, badge, accent.
- **White monochrome:** section/footer gelap (perlu perhatian bg off-white → re-cut).
- **Favicon mark:** tab & small square.
