# Velox Capital

Dashboard investasi privat untuk circle investasi **Velox Capital** — data pasar Indonesia, chart, polling watchlist, dan trading calls.

Tech stack: **Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Prisma 7 + PostgreSQL + Yahoo Finance (yahoo-finance2) + NextAuth v5**.

---

## Fitur

- **Market Charts** — chart IHSG & saham individual (candlestick, TradingView Lightweight Charts).
- **Polling Watchlist** — harga saham favorit circle, auto-refresh, dengan perubahan harga & volume.
- **Trading Calls** — feed BUY / SELL / HOLD dengan target & entry price (admin yang posting).
- **Stock Info** — profil perusahaan, statistik kunci, dan fundamental.
- **Invite-only Auth** — admin membuat tautan sekali pakai yang kedaluwarsa dalam 72 jam.
- **Login + Signup** — siap untuk peran member/admin di versi berikutnya.

## Struktur

```
src/
├── app/
│   ├── page.tsx            # Landing page publik
│   ├── login/  signup/     # Auth pages
│   ├── dashboard/          # Dashboard utama (IHSG + ringkasan)
│   ├── charts/             # Market charts (IHSG + saham)
│   ├── watchlist/          # Polling watchlist
│   ├── calls/              # Trading calls feed
│   ├── stock/[symbol]/     # Detail saham + info
│   ├── admin/members/      # Registrasi anggota (admin only)
│   └── api/                # API routes (ticker, chart, stock, calls, signup, auth)
├── components/             # UI & client components
├── lib/
│   ├── yahoo.ts            # Yahoo Finance data service
│   ├── constants.ts        # Ticker constants (client-safe)
│   ├── db.ts               # Prisma client singleton
│   └── format.ts           # Formatting helpers
├── auth.ts / auth.config.ts # NextAuth config (Node + Edge)
└── proxy.ts                # Optimistic route protection (Next.js 16)
```

---

## Setup

### 1. Prasyarat
- Node.js 22+ (`yahoo-finance2` v4 mensyaratkannya)
- PostgreSQL (via Docker disarankan)

### 2. Jalankan database (Docker)
```bash
docker run -d --name velox-postgres \
  -e POSTGRES_USER=velox -e POSTGRES_PASSWORD=velox_secret -e POSTGRES_DB=velox \
  -p 5433:5432 postgres:16-alpine
```

### 3. Konfigurasi `.env`
Salin `.env.example` menjadi `.env` dan sesuaikan:
```bash
DATABASE_URL="postgresql://velox:velox_secret@localhost:5433/velox?schema=public"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="ganti-dengan-secret-yang-kuat"
ADMIN_EMAIL="admin@veloxcapital.com"
ADMIN_PASSWORD="minimal-12-karakter-yang-kuat"
```

### 4. Install & sync database
```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

### 5. Seed admin
```bash
npx prisma db seed
```
Perintah tersebut membuat atau memperbarui admin berdasarkan
`ADMIN_EMAIL` dan `ADMIN_PASSWORD`. Setelah berhasil, hapus `ADMIN_PASSWORD`
dari environment runtime dan kelola anggota melalui `/admin/members`.

### 6. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000.

### 7. Pemeriksaan kualitas
```bash
npm run check
npm run build
```

---

## Sumber Data

Data saham saat ini dari **Yahoo Finance** (delayed ~15-20 menit). Untuk real-time, perlu lisensi data dari BEI (mis. RTI Business / Sectors API). Struktur data service di `src/lib/yahoo.ts` sudah dipisah sehingga mudah diganti provider.

## Catatan

- **Data delayed** — Yahoo Finance memberikan data delayed, bukan real-time. Cocok untuk MVP internal.
- Prisma 7 memakai **driver adapter** (`@prisma/adapter-pg`), bukan URL datasource di schema.
- Next.js 16 memakai **Proxy** pada Node runtime. Proxy hanya melakukan pemeriksaan
  cookie secara optimistis; Route Handler memvalidasi sesi dan role terkini lagi.
- Endpoint Yahoo hanya menerima simbol dalam watchlist Velox, memakai cache singkat,
  dan dibatasi per pengguna.
- Rate limiter bawaan bersifat per-instance. Deployment multi-instance sebaiknya
  menggantinya dengan store bersama seperti Redis.
- Jangan memakai `prisma db push` untuk production; migration SQL berada di
  `prisma/migrations`.
