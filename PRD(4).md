# Product Requirements Document: Velox Investment Community

| Field | Value |
|---|---|
| Versi | 2.0 |
| Status | Draft siap implementasi |
| Tanggal | 11 Agustus 2026 |
| Product owner | Velox |
| Platform | Responsive web app |
| Stack saat ini | Next.js 16, React 19, TypeScript, Prisma 7, PostgreSQL, NextAuth v5 |
| Sumber data MVP | Yahoo Finance melalui `yahoo-finance2` |
| Dokumen visual | `DESIGN.md` |
| Filter UI | `ANTISLOP.md` |

Dokumen ini menjadi source of truth produk Velox dan menggantikan kebutuhan
produk lama yang hanya berfokus pada landing page. `PROJECT_REQUIREMENTS.md` dan
`DESIGN_REFERENCE.md` tetap disimpan sebagai konteks historis.

## 1. Ringkasan Produk

Velox adalah komunitas investasi saham Indonesia privat untuk investor tingkat
menengah. Velox menyatukan data pasar yang mudah dibaca, watchlist pribadi,
diskusi berbasis ticker, dan trading calls dari admin dalam satu alur sederhana.

Janji produk:

> Lihat saham, simpan yang menarik, bahas bersama circle, dan ikuti perkembangan
> call secara transparan.

Velox bukan broker, bukan terminal trading realtime, dan bukan pemberi eksekusi
transaksi. Seluruh informasi ditujukan untuk diskusi dan riset komunitas.

## 2. Latar Belakang dan Masalah

Investor komunitas biasanya berpindah antara aplikasi harga saham, grup chat,
catatan pribadi, dan posting admin. Akibatnya:

- diskusi terpisah dari konteks saham;
- analisis sulit ditemukan kembali;
- watchlist pribadi tidak terhubung dengan percakapan;
- trading call tidak memiliki status yang jelas;
- anggota baru menghadapi terlalu banyak fitur tanpa alur utama.

Repository saat ini sudah memiliki fondasi yang dapat dipakai:

- landing page publik;
- signup, approval admin, activation code, login, dan role member/admin;
- dashboard komunitas, post, komentar, watchlist;
- chart IHSG dan saham, quote, detail fundamental;
- trading calls yang dibuat admin;
- validasi input, rate limit per instance, route protection;
- unit test dasar untuk security helpers.

PRD ini mengarahkan pengembangan pada penyambungan fitur yang sudah ada, bukan
menambah banyak modul baru.

## 3. Tujuan Produk

### 3.1 Tujuan utama

1. Member memahami empat area produk tanpa onboarding panjang: Home, Saham,
   Watchlist, dan Calls.
2. Member dapat menghubungkan percakapan dengan ticker tertentu.
3. Member dapat berpindah dari data saham ke diskusi tanpa kehilangan konteks.
4. Admin dapat membuat dan menutup trading call dengan status yang jelas.
5. UI terasa spesifik sebagai Velox, mudah dipakai, responsif, dan tidak terlihat
   seperti template AI generik.
6. Kontrak backend dan frontend stabil, tervalidasi, serta dapat diuji otomatis.

### 3.2 Indikator keberhasilan

Angka target ditentukan setelah baseline penggunaan beta tersedia. Jangan
menampilkan target ini sebagai klaim publik.

| Indikator | Definisi |
|---|---|
| Aktivasi member | Persentase signup yang selesai diaktifkan dan berhasil login. |
| Weekly active member | Member unik yang membuka app atau melakukan aksi dalam tujuh hari. |
| Kontribusi komunitas | Jumlah post dan komentar valid per member aktif. |
| Diskusi berticker | Persentase post yang memiliki ticker. |
| Penggunaan watchlist | Persentase member aktif dengan minimal satu ticker. |
| Call engagement | Member unik yang membuka halaman Calls atau detail call. |
| Reliability | Persentase request internal yang selesai tanpa 5xx. |

### 3.3 Prinsip scope

- Satu fitur hanya masuk jika memperkuat alur lihat, simpan, bahas, atau ikuti.
- Data delayed yang stabil lebih baik daripada realtime yang tidak berlisensi.
- Konten nyata lebih baik daripada placeholder yang terlihat final.
- Fitur sederhana yang selesai lebih baik daripada banyak fitur setengah jadi.

## 4. Pengguna dan Hak Akses

### 4.1 Visitor

- melihat landing page;
- membuka login dan signup;
- tidak dapat mengakses data member atau API privat.

### 4.2 Pending member

- telah mengirim signup;
- menunggu approval admin;
- dapat memvalidasi kode aktivasi dan membuat password;
- tidak dapat mengakses app sebelum status `ACTIVE`.

### 4.3 Active member

- melihat Home, Saham, Watchlist, dan Calls;
- mencari saham dan melihat data delayed;
- menambah atau menghapus watchlist;
- membuat post dengan ticker opsional;
- membuat komentar pada post;
- membaca seluruh call.

### 4.4 Admin

- memiliki seluruh hak active member;
- melihat dan menyetujui signup;
- menghasilkan activation code;
- membuat trading call;
- menutup trading call.

### 4.5 Matriks akses

| Kapabilitas | Visitor | Pending | Member | Admin |
|---|:---:|:---:|:---:|:---:|
| Landing, login, signup | Ya | Ya | Ya | Ya |
| Aktivasi akun | Tidak | Ya | Tidak | Tidak |
| Data saham | Tidak | Tidak | Ya | Ya |
| Watchlist | Tidak | Tidak | Ya | Ya |
| Post dan komentar | Tidak | Tidak | Ya | Ya |
| Baca calls | Tidak | Tidak | Ya | Ya |
| Buat dan tutup call | Tidak | Tidak | Tidak | Ya |
| Kelola anggota | Tidak | Tidak | Tidak | Ya |

## 5. Scope Rilis

### 5.1 P0, wajib untuk rilis

- auth dan approval flow yang sudah ada;
- navigasi empat area member;
- Home dengan feed, IHSG, watchlist ringkas, dan call terbaru;
- pencarian serta detail saham;
- post dengan ticker opsional;
- diskusi berticker di halaman saham;
- watchlist pribadi;
- call dengan status `OPEN` atau `CLOSED`;
- loading, empty, error, disabled, dan success states;
- responsive desktop dan mobile;
- kontrak API dan automated test pada alur kritis;
- integrasi aturan `DESIGN.md` dan `ANTISLOP.md`.

### 5.2 P1 setelah validasi beta

- edit atau hapus post milik sendiri;
- moderasi post dan komentar oleh admin;
- pagination cursor pada feed;
- retry dan shared rate limit untuk deployment multi-instance;
- observability terstruktur dan error tracking;
- kontrak data provider kedua untuk fundamental yang lebih dalam.

### 5.3 Tidak masuk scope sekarang

- news aggregator terpisah;
- realtime price, running trade, atau order book production;
- price alerts dan push notification;
- live chat;
- portfolio riil atau broker integration;
- screener lanjutan;
- broker summary dan foreign flow;
- leaderboard atau reputasi member;
- AI recommendation;
- payment dan paket premium;
- dark mode toggle.

Dark mode tidak dikirim pada rilis ini. Velox menggunakan light theme karena
brand cream, navy, dan gold serta kebutuhan membaca feed panjang di berbagai
kondisi pencahayaan.

## 6. Information Architecture

### 6.1 Navigasi member

| Label UI | Route | Tujuan |
|---|---|---|
| Home | `/dashboard` | Ringkasan market dan aktivitas komunitas. |
| Saham | `/charts` | Cari saham, lihat chart, lalu buka detail. |
| Watchlist | `/watchlist` | Daftar saham pribadi. |
| Calls | `/calls` | Daftar trading call admin. |
| Anggota | `/admin/members` | Approval member, khusus admin. |

Label UI menggunakan `Home` walaupun route tetap `/dashboard` untuk menghindari
migrasi URL yang tidak memberi nilai langsung.

### 6.2 Navigasi mobile

- bottom navigation tetap dengan empat item member;
- item aktif memiliki label dan state yang dapat dikenali tanpa hanya mengandalkan
  warna;
- admin membuka Kelola Anggota dari avatar menu;
- ticker berjalan global dihapus.

## 7. Kebutuhan Fitur

### FR-01: Signup dan aktivasi

**Alur:** visitor signup, admin approve, admin membagikan kode, member mengaktifkan
akun, lalu login.

Acceptance criteria:

- email dinormalisasi dan unik;
- signup existing pending tidak membuat user duplikat;
- activation code disimpan dalam bentuk hash dan memiliki expiry;
- password 12 sampai 128 karakter;
- response aktivasi tidak membocorkan apakah kode milik user tertentu;
- pending user tidak dapat mengakses route privat;
- login memiliki rate limit;
- semua state form mempunyai feedback yang terlihat.

### FR-02: Home

Home adalah layar utama setelah login.

Desktop:

- kolom utama 65 persen untuk composer dan feed;
- sidebar 35 persen untuk IHSG, watchlist ringkas, dan call terbaru.

Mobile:

- IHSG;
- watchlist ringkas;
- composer;
- feed;
- call terbaru.

Acceptance criteria:

- hanya memuat data setelah session terverifikasi;
- error satu widget tidak menghilangkan seluruh Home;
- post baru muncul tanpa full page reload;
- klik ticker pada post membuka `/stock/{symbol}`;
- watchlist kosong memberi instruksi membuka pencarian saham;
- call terbaru memiliki link ke halaman Calls.

### FR-03: Post komunitas

Post terdiri dari content dan ticker opsional.

Input:

- `content`: wajib, 1 sampai 2.000 karakter setelah trim;
- `symbol`: opsional, canonical symbol valid seperti `BBCA.JK`.

Acceptance criteria:

- composer hanya memiliki pencarian ticker opsional dan textarea;
- member dapat posting tanpa ticker;
- ticker ditampilkan sebagai badge fungsional dan dapat diklik;
- feed default diurutkan `createdAt` terbaru;
- feed dapat difilter berdasarkan `symbol` melalui API;
- author hanya mengekspos id, nama, email, dan role yang diperlukan UI;
- post menampilkan loading, empty, error, dan retry state.

### FR-04: Komentar

Acceptance criteria:

- member aktif dapat mengirim komentar 1 sampai 500 karakter;
- komentar ditampilkan ascending berdasarkan waktu;
- submit dicegah ketika kosong atau sedang berjalan;
- post yang tidak ada menghasilkan `404`;
- komentar baru muncul tanpa reload halaman;
- versi P0 tidak mendukung nested reply.

### FR-05: Pencarian dan detail saham

Acceptance criteria:

- pencarian menerima maksimal 40 karakter;
- hasil dibatasi maksimal 12;
- hasil IDX memprioritaskan simbol berakhiran `.JK`;
- detail menampilkan quote, chart 1 tahun, statistik dasar, dan profil jika tersedia;
- label sumber dan delayed state terlihat;
- tombol tambah atau hapus watchlist berada di header saham;
- tab `Ringkasan` dan `Diskusi` dapat dioperasikan keyboard;
- tab Diskusi memanggil post dengan filter symbol;
- kegagalan fundamental tidak menggagalkan quote dan chart yang tersedia.

### FR-06: Watchlist

Acceptance criteria:

- watchlist bersifat personal per user;
- maksimal 50 symbol;
- duplikat tidak membuat row baru;
- list menampilkan ticker, harga, dan perubahan harian;
- klik row membuka halaman saham;
- hapus memberikan disabled state selama request;
- kegagalan satu quote tidak menggagalkan seluruh list;
- P0 tidak menyimpan target pribadi atau catatan.

### FR-07: Trading calls

Call P0 terdiri dari:

- ticker;
- action `BUY`, `SELL`, atau `HOLD`;
- entry price opsional;
- target price opsional;
- alasan opsional maksimal 1.000 karakter;
- status `OPEN` atau `CLOSED`;
- author;
- created, updated, dan closed timestamp.

Acceptance criteria:

- hanya admin dapat membuat atau menutup call;
- ticker call dibatasi pada symbol yang diperbolehkan Velox;
- call terbaru muncul lebih dulu;
- default filter menampilkan semua, dengan filter Aktif dan Selesai;
- aksi Tutup Call membutuhkan konfirmasi sederhana;
- call yang telah ditutup tidak dapat ditutup kembali;
- P0 tidak menghitung return atau menyimpan posisi member.

### FR-08: Kelola anggota

Acceptance criteria:

- hanya admin yang dapat membuka page dan endpoint;
- daftar pending terpisah dari active member;
- kode aktivasi hanya dikembalikan saat approval berhasil;
- kode dapat disalin dan expiry terlihat;
- password hash dan entry code hash tidak pernah dikirim ke frontend;
- user non-admin mendapat `403` dari backend walaupun melewati route UI.

## 8. Visual dan UX Requirements

Semua implementasi UI wajib membaca `DESIGN.md`, lalu `ANTISLOP.md`.

### 8.1 Design Read

Velox dibaca sebagai aplikasi komunitas investasi privat untuk investor saham
Indonesia tingkat menengah, dengan visual editorial-finance yang tenang.

Dial: **ENERGI 1 / RITME 2 / GERAK 1**.

### 8.2 Visual hierarchy

- satu titik fokus per layar;
- feed menjadi fokus Home;
- harga dan ticker menjadi fokus detail saham;
- call aktif terbaru menjadi fokus Calls;
- pending approval menjadi fokus halaman admin;
- gold hanya untuk aksi utama dan status khusus;
- hijau dan merah hanya untuk makna finansial atau feedback.

### 8.3 Responsive breakpoints untuk verifikasi

| Mode | Viewport referensi | Requirement |
|---|---:|---|
| Mobile | 390 x 844 | Satu kolom, bottom nav, tanpa overflow horizontal. |
| Tablet | 768 x 1024 | Satu atau dua kolom sesuai ruang, tap target 44px. |
| Desktop | 1280 x 800 | Home 65/35, container maksimal 1280px. |
| Wide | 1440 x 900 | Konten tidak melebar tanpa batas. |

### 8.4 Accessibility

- WCAG AA untuk contrast;
- semantic heading order;
- form memiliki label;
- icon-only button memiliki accessible name;
- Tab order mengikuti urutan visual;
- Enter dan Space mengaktifkan kontrol yang sesuai;
- Escape menutup dialog;
- focus indicator selalu terlihat;
- status async menggunakan teks yang dapat dibaca screen reader;
- chart memiliki ringkasan tekstual harga dan periode.

### 8.5 Anti-slop gate

UI tidak dapat dinyatakan selesai jika Delivery Gate `ANTISLOP.md` masih FAIL.
Laporan PR atau handoff UI harus menyertakan bukti minimum:

- route dan tombol nyata, tidak ada kontrol mati;
- loading, empty, dan error state;
- screenshot mobile dan desktop;
- hasil keyboard dan contrast check;
- alasan satu baris untuk warna, layout, typography, spacing, card, ikon, dan motion;
- hasil build dan test.

## 9. Arsitektur Data Pasar

### 9.1 Keputusan MVP

Yahoo Finance tetap dipakai pada P0 karena integrasi sudah tersedia dan cukup
untuk validasi closed community. Semua data harus diberi label delayed dan tidak
boleh dipasarkan sebagai realtime.

Keterbatasan:

- tidak ada SLA provider untuk Velox;
- schema dan availability dapat berubah;
- hak penggunaan komersial dan redistribusi harus ditinjau sebelum paid launch;
- tidak cocok sebagai fondasi order book production.

### 9.2 Provider boundary

Komponen dan route tidak boleh mengimpor library provider secara langsung.
Target boundary:

```ts
interface MarketDataProvider {
  search(query: string): Promise<MarketSearchResult[]>;
  getQuote(symbol: string): Promise<Quote>;
  getQuotes(symbols: string[]): Promise<Quote[]>;
  getChart(symbol: string, input: ChartQuery): Promise<Chart>;
  getSummary(symbol: string): Promise<StockSummary | null>;
}
```

Implementasi P0: `YahooMarketDataProvider`.

Future implementation dapat menggunakan Sectors untuk fundamental atau provider
IDX berlisensi tanpa mengubah contract frontend.

### 9.3 Normalisasi symbol

- canonical IDX symbol backend: `BBCA.JK`;
- display UI: `BBCA`;
- IHSG: `^JKSE`;
- backend menerima symbol case-insensitive lalu mengubah ke uppercase;
- format maksimal 15 karakter dan hanya `[A-Z0-9^.-]`;
- call tetap memakai allowlist;
- search dan watchlist boleh memakai format symbol valid.

### 9.4 Cache dan failure

| Data | Server revalidation | HTTP client cache | Failure behavior |
|---|---:|---:|---|
| Quote | 15 detik | private 10 detik, SWR 20 detik | `502 PROVIDER_UNAVAILABLE` |
| Batch quote | 15 detik | private 10 detik, SWR 20 detik | partial rows boleh null |
| Chart | 60 detik | private 30 detik, SWR 60 detik | `502 PROVIDER_UNAVAILABLE` |
| Stock summary | 60 detik minimum | private 30 detik, SWR 60 detik | summary boleh null |
| Search | cache singkat opsional | no-store atau private | `502 PROVIDER_UNAVAILABLE` |

API key provider, jika ditambahkan, hanya berada di server environment.

## 10. Model Data

### 10.1 Model yang dipertahankan

- `User`
- `WatchlistEntry`
- `Comment`

### 10.2 Perubahan Post

```prisma
model Post {
  id        String    @id @default(cuid())
  content   String
  symbol    String?
  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([createdAt])
  @@index([symbol, createdAt])
}
```

### 10.3 Perubahan Call

```prisma
enum CallStatus {
  OPEN
  CLOSED
}

model Call {
  id          String      @id @default(cuid())
  ticker      String
  action      CallAction
  status      CallStatus  @default(OPEN)
  targetPrice Float?
  entryPrice  Float?
  reason      String?
  authorId    String
  author      User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  closedAt    DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([ticker])
  @@index([status, createdAt])
}
```

Migration harus memberi default `OPEN` pada call lama dan tidak menghapus data.

## 11. Konvensi API Internal

### 11.1 Transport

- same-origin JSON over HTTPS;
- auth melalui NextAuth session cookie;
- request mutation memakai `Content-Type: application/json`;
- seluruh timestamp dikirim sebagai ISO 8601 UTC;
- seluruh harga dikirim sebagai JSON number dalam currency provider, IDX biasanya
  IDR;
- frontend tidak boleh menganggap null sama dengan zero.

### 11.2 Error contract target

Endpoint baru atau endpoint yang disentuh harus menggunakan:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Konten harus 1 sampai 2.000 karakter.",
    "fields": {
      "content": "INVALID_LENGTH"
    }
  }
}
```

`fields` opsional. Frontend menampilkan `message`, sedangkan `code` dipakai untuk
logic dan test.

| HTTP | Code | Makna |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Query atau body tidak valid. |
| 401 | `UNAUTHORIZED` | Session tidak ada atau user tidak aktif. |
| 403 | `FORBIDDEN` | Role tidak memiliki akses. |
| 404 | `NOT_FOUND` | Resource tidak ditemukan. |
| 409 | `CONFLICT` | Resource sudah diproses atau state tidak valid. |
| 429 | `RATE_LIMITED` | Rate limit terlampaui, sertakan `Retry-After`. |
| 500 | `INTERNAL_ERROR` | Kesalahan internal tanpa detail sensitif. |
| 502 | `PROVIDER_UNAVAILABLE` | Provider data pasar gagal. |

Response endpoint lama dapat tetap backward compatible selama migrasi. Jangan
mengubah semua response hanya untuk konsistensi kosmetik.

### 11.3 Pagination

P0 mempertahankan maksimum 50 post dan 50 call. P1 memakai cursor:

```json
{
  "items": [],
  "nextCursor": "cuid-or-null"
}
```

## 12. API Contract

### 12.1 Auth dan member lifecycle

#### `POST /api/signup`

Request:

```json
{ "email": "member@example.com", "name": "Nama Member" }
```

Success `201` atau existing pending `200`:

```json
{ "ok": true, "status": "pending" }
```

Errors: `400`, `409`, `429`.

#### `POST /api/admin/approve`

Admin only.

Request:

```json
{ "userId": "user_cuid" }
```

Success `200`:

```json
{
  "ok": true,
  "code": "ENTRY_CODE",
  "expiresAt": "2026-08-14T10:00:00.000Z"
}
```

Errors: `400`, `403`, `409`, `429`, `500`.

#### `POST /api/activate`

Request:

```json
{ "code": "ENTRY_CODE" }
```

Success `200`:

```json
{ "ok": true, "email": "member@example.com" }
```

Errors tidak boleh membedakan kode tidak ada, expired, atau telah digunakan.

#### `POST /api/set-password`

Request:

```json
{
  "code": "ENTRY_CODE",
  "name": "Nama Member",
  "password": "minimum-12-karakter"
}
```

Success `200`: `{ "ok": true }`.

#### `GET /api/admin/members`

Admin only. Success:

```json
{
  "members": [
    {
      "id": "user_cuid",
      "email": "member@example.com",
      "name": "Nama Member",
      "role": "member",
      "status": "ACTIVE",
      "active": true,
      "createdAt": "2026-08-11T10:00:00.000Z"
    }
  ],
  "pending": []
}
```

Password hash dan entry code hash tidak termasuk response.

### 12.2 Posts dan comments

#### `GET /api/posts?symbol=BBCA.JK`

Query `symbol` opsional. Success `200`:

```json
{
  "posts": [
    {
      "id": "post_cuid",
      "content": "Analisis member",
      "symbol": "BBCA.JK",
      "createdAt": "2026-08-11T10:00:00.000Z",
      "updatedAt": "2026-08-11T10:00:00.000Z",
      "author": {
        "id": "user_cuid",
        "name": "Nama Member",
        "email": "member@example.com",
        "role": "member"
      },
      "comments": []
    }
  ]
}
```

#### `POST /api/posts`

Request:

```json
{
  "content": "Menurut gue BBCA menarik di area ini.",
  "symbol": "BBCA.JK"
}
```

`symbol` boleh null atau tidak dikirim. Success `201`: `{ "post": Post }`.

Errors: `400`, `401`, `429`.

#### `POST /api/comments`

Request:

```json
{ "postId": "post_cuid", "content": "Setuju, gue pantau volumenya." }
```

Success `201`: `{ "comment": Comment }`.

Errors: `400`, `401`, `404`, `429`.

### 12.3 Watchlist

#### `GET /api/watchlist`

Success `200`:

```json
{ "symbols": ["BBCA.JK", "TLKM.JK"] }
```

#### `POST /api/watchlist`

Request: `{ "symbol": "BBCA.JK" }`.

Success `201`: `{ "entry": { "id": "entry_cuid", "symbol": "BBCA.JK" } }`.

Repeated add bersifat idempotent dari sudut pandang user dan tidak membuat row
duplikat.

#### `DELETE /api/watchlist?symbol=BBCA.JK`

Success `200`: `{ "ok": true }`, termasuk jika row sudah tidak ada.

### 12.4 Calls

#### `GET /api/calls?status=OPEN`

`status` opsional: `OPEN` atau `CLOSED`.

Success `200`:

```json
{
  "calls": [
    {
      "id": "call_cuid",
      "ticker": "BBCA.JK",
      "action": "BUY",
      "status": "OPEN",
      "entryPrice": 8900,
      "targetPrice": 9500,
      "reason": "Alasan spesifik dari admin.",
      "createdAt": "2026-08-11T10:00:00.000Z",
      "updatedAt": "2026-08-11T10:00:00.000Z",
      "closedAt": null,
      "author": {
        "name": "Admin Velox",
        "email": "admin@example.com"
      }
    }
  ]
}
```

#### `POST /api/calls`

Admin only.

```json
{
  "ticker": "BBCA",
  "action": "BUY",
  "entryPrice": 8900,
  "targetPrice": 9500,
  "reason": "Alasan spesifik dari admin."
}
```

Success `201`: `{ "ok": true, "call": Call }`.

#### `PATCH /api/calls/{id}`

Endpoint baru, admin only.

Request P0:

```json
{ "status": "CLOSED" }
```

Success `200`:

```json
{ "ok": true, "call": { "id": "call_cuid", "status": "CLOSED" } }
```

Errors: `400`, `403`, `404`, `409`, `429`.

### 12.5 Market data

#### `GET /api/search?q=bbca`

Success `200`:

```json
{
  "results": [
    {
      "symbol": "BBCA.JK",
      "shortName": "Bank Central Asia Tbk",
      "longName": "PT Bank Central Asia Tbk",
      "exchange": "JKT"
    }
  ]
}
```

#### `GET /api/quote?symbol=BBCA.JK`

Success `200`:

```json
{
  "quote": {
    "symbol": "BBCA.JK",
    "displayName": "Bank Central Asia",
    "price": 9000,
    "change": 50,
    "changePercent": 0.56,
    "volume": 1000000,
    "currency": "IDR",
    "marketState": "CLOSED",
    "regularMarketTime": 1786420800
  }
}
```

Nilai contoh hanya menjelaskan tipe contract dan tidak boleh dipakai sebagai
fixture tampilan production atau klaim data terkini.

#### `GET /api/ticker?symbols=BBCA.JK,TLKM.JK`

Maksimal 20 allowed symbols. Success: `{ "quotes": Quote[] }`.

#### `GET /api/chart?symbol=BBCA.JK&period=1y&interval=1d`

Allowed period: `1mo`, `3mo`, `6mo`, `1y`, `5y`.

Allowed interval: `1d`, `1wk`.

Success:

```json
{
  "symbol": "BBCA.JK",
  "bars": [
    {
      "time": 1786420800,
      "open": 8950,
      "high": 9050,
      "low": 8900,
      "close": 9000,
      "volume": 1000000
    }
  ],
  "meta": {
    "currency": "IDR",
    "exchangeName": "JKT",
    "instrumentType": "EQUITY"
  }
}
```

#### `GET /api/stock?symbol=BBCA.JK`

Aggregate response:

```json
{
  "quote": {},
  "summary": {},
  "chart": {}
}
```

`summary` dan `chart` boleh null jika subrequest gagal, selama quote berhasil.

## 13. Frontend Contract

### 13.1 API client boundary

Komponen tidak mengulang parsing fetch dan error handling. Target module:

```ts
type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "INTERNAL_ERROR";

interface ApiErrorPayload {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
}
```

Client functions minimum:

- `getPosts({ symbol? })`;
- `createPost({ content, symbol? })`;
- `createComment({ postId, content })`;
- `getWatchlist()`;
- `addWatchlist(symbol)`;
- `removeWatchlist(symbol)`;
- `getCalls({ status? })`;
- `createCall(input)`;
- `closeCall(id)`;
- `searchStocks(query)`;
- `getStock(symbol)`.

### 13.2 View state

Setiap async surface menggunakan state eksplisit:

```ts
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string; retryable: boolean };
```

Optimistic update hanya dipakai jika rollback jelas. P0 menggunakan confirmed
mutation untuk post, comment, watchlist, dan call agar perilaku mudah dipahami.

### 13.3 Formatting contract

- ticker backend `.JK`, UI tanpa `.JK`;
- locale angka `id-ID`;
- harga tidak menampilkan desimal jika currency IDR dan provider memberi integer;
- persentase maksimal dua desimal;
- waktu menggunakan relative time pada feed dan timestamp lengkap pada calls/admin;
- null ditampilkan `Tidak tersedia`, bukan `0`.

## 14. Security, Privacy, dan Reliability

### 14.1 Authentication dan authorization

- session strategy tetap JWT NextAuth;
- backend memvalidasi user terkini dari database;
- route UI bukan boundary keamanan;
- mutation member mensyaratkan status `ACTIVE`;
- mutation admin mensyaratkan role `admin`;
- callback URL hanya menerima path internal.

### 14.2 Input dan output

- semua JSON dibaca dengan safe parser;
- trim dan length validation di server;
- symbol dinormalisasi serta divalidasi;
- angka harga harus finite dan positif;
- error production tidak mengirim stack trace;
- password hash, code hash, dan secret tidak dikirim atau dicatat log;
- content dirender sebagai text, bukan raw HTML.

### 14.3 Rate limit P0

| Aksi | Batas saat ini |
|---|---:|
| Signup | 10 per IP per 15 menit |
| Activate | 15 per IP per 15 menit |
| Set password | 15 per IP per 15 menit |
| Login | 10 per IP dan email per 15 menit |
| Read posts/calls | 60 per user per menit |
| Create post | 20 per user per jam |
| Create comment | 30 per user per jam |
| Create call | 20 per admin per jam |
| Market quote/search/chart | 15 sampai 30 per user per menit |

Rate limiter in-memory hanya cukup untuk single instance. Sebelum multi-instance,
pindahkan ke shared store seperti Redis.

### 14.4 Financial data disclosure

- tampilkan sumber data dan status delayed;
- jangan menggunakan kata realtime kecuali ada kontrak provider yang mendukung;
- jangan menjanjikan return;
- tambahkan disclaimer bahwa konten komunitas bukan instruksi transaksi;
- sebelum paid launch, review izin commercial display dan redistribution provider.

### 14.5 Availability behavior

- market provider gagal: tampilkan data unavailable per widget;
- database gagal: log correlation id dan tampilkan generic error;
- session invalid: sign out dan kembali ke login;
- request timeout: frontend menawarkan retry;
- duplicate mutation: upsert atau conflict yang dapat dipahami.

## 15. Testing Strategy

### 15.1 Unit tests

Wajib mencakup:

- email normalization;
- text length dan trimming;
- positive number validation;
- symbol canonicalization dan allowlist;
- internal callback URL;
- activation code format, hash, dan expiry;
- rate limit window;
- Yahoo normalization untuk null dan partial fields;
- format price, percentage, dan relative time;
- transition call `OPEN` ke `CLOSED` dan penolakan repeated close.

### 15.2 API integration tests

Gunakan test database terisolasi dan mock market provider.

| Area | Skenario minimum |
|---|---|
| Signup | create pending, repeated pending, active conflict, invalid email, rate limit. |
| Activation | valid, expired, used, invalid, password terlalu pendek. |
| Authorization | anonymous 401, member pada admin route 403, admin sukses. |
| Posts | create tanpa ticker, create dengan ticker, invalid content, filter ticker. |
| Comments | create, empty content, missing post, inactive member. |
| Watchlist | add, duplicate, delete, limit 50, user isolation. |
| Calls | admin create, member forbidden, filter status, close, repeated close. |
| Market | valid response, invalid query, provider timeout, partial stock response. |

Contract test harus memastikan field frontend tidak berubah tanpa perubahan tipe
dan test yang disengaja.

### 15.3 Component tests

- PostComposer submit, disabled, error, dan reset;
- SocialFeed loading, empty, error, post, komentar;
- Stock search debounce dan keyboard selection;
- Watchlist add/remove serta partial quote failure;
- Calls filter dan admin close confirmation;
- tab Ringkasan dan Diskusi;
- mobile navigation active state.

### 15.4 End-to-end tests

Gunakan Playwright atau alat ekuivalen.

Critical journeys:

1. Signup, admin approve, activation, login.
2. Member mencari BBCA, menambah watchlist, lalu membuka detail.
3. Member membuat post berticker dan post muncul di Stock Discussion.
4. Member memberi komentar dan melihat komentar tanpa reload.
5. Admin membuat call, member melihat call, admin menutup call.
6. Member tidak dapat membuka admin page atau admin API.
7. Session invalid mengarahkan user kembali ke login.

### 15.5 Visual regression dan anti-slop QA

Screenshot minimum:

- Home loading, empty, populated, dan error;
- Stock detail loading, partial, populated, dan error;
- Watchlist empty dan populated;
- Calls empty, open, dan closed;
- Admin pending dan no pending;
- viewport 390, 768, 1280, dan 1440;
- long name, long content, null data, serta maximum content.

Review wajib menjalankan Delivery Gate `ANTISLOP.md`. Snapshot bukan pengganti
review fungsional.

### 15.6 Accessibility tests

- automated axe scan pada seluruh page utama;
- keyboard-only journey;
- focus visible;
- contrast WCAG AA;
- accessible names untuk icon button;
- heading hierarchy;
- form error terhubung dengan input;
- chart memiliki fallback tekstual.

### 15.7 Performance tests

Target awal, diverifikasi pada environment staging:

- tidak ada request market per row tanpa batas;
- batch quotes dipakai bila memungkinkan;
- tidak ada layout shift besar setelah data masuk;
- Home tetap interaktif ketika satu widget lambat;
- payload post dan comment dibatasi;
- Lighthouse digunakan sebagai diagnostic, bukan klaim publik.

### 15.8 Commands quality gate

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run check` harus lulus. UI juga wajib lolos browser test, karena build sukses
tidak membuktikan interaksi dan layout benar.

## 16. Observability

P0:

- log server untuk provider error, database error, dan auth anomaly;
- jangan log password, activation code, cookie, atau full request body;
- sertakan route, status, dan correlation id;
- pisahkan user-facing message dari internal error.

P1:

- shared error tracking;
- latency dan error rate per endpoint;
- provider success rate;
- signup to activation funnel;
- post, comment, watchlist, dan call events tanpa menyimpan content sensitif.

## 17. Migration dan Delivery Plan

### Phase 0: Design governance

- tambahkan `DESIGN.md`;
- tambahkan `ANTISLOP.md` dan lisensinya;
- route `AGENTS.md` ke kedua file;
- jadikan PRD ini source of truth.

### Phase 1: Post berticker

- migration `Post.symbol`;
- update POST dan GET posts;
- tambah ticker search opsional pada composer;
- tambah badge ticker pada feed;
- tests unit dan API.

### Phase 2: Stock discussion

- tambah tombol watchlist pada stock header;
- tambah tab Ringkasan dan Diskusi;
- gunakan GET posts dengan query symbol;
- perbaiki responsive dan UI states;
- component dan E2E tests.

### Phase 3: Call lifecycle

- migration `CallStatus` dan `closedAt`;
- filter GET calls;
- tambah PATCH close call;
- update UI admin dan member;
- API dan E2E tests.

### Phase 4: Simplification dan QA

- ubah label Dashboard menjadi Home;
- hapus ticker berjalan global;
- buat bottom navigation mobile;
- konsolidasikan API client frontend;
- accessibility, visual regression, build, dan Anti-Slop Delivery Gate.

Setiap phase harus menjadi migration yang forward-only. Jangan memakai
`prisma db push` di production.

## 18. Definition of Done

Sebuah requirement selesai hanya jika:

- acceptance criteria terpenuhi;
- backend authorization diuji;
- request dan response sesuai contract;
- migration dapat diterapkan pada database berisi data lama;
- loading, empty, error, disabled, dan success state tersedia;
- mobile 390px, tablet 768px, dan desktop 1280px diverifikasi;
- keyboard dan WCAG AA diverifikasi;
- tidak ada console error;
- `npm run check` dan `npm run build` lulus;
- critical E2E journey lulus;
- Anti-Slop Delivery Gate PASS dengan bukti;
- dokumentasi berubah jika contract berubah.

## 19. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Yahoo berubah atau gagal | Quote dan chart tidak tersedia. | Provider boundary, cache, partial failure, dan 502 terstruktur. |
| Hak data untuk paid product belum jelas | Risiko komersial. | Closed beta, label delayed, review lisensi sebelum monetisasi. |
| Feed menjadi chat tidak terstruktur | Analisis sulit dicari. | Ticker opsional, stock discussion, content limits. |
| Scope berkembang terlalu cepat | Produk sulit dipahami. | P0 dibatasi empat area dan fitur out-of-scope eksplisit. |
| UI kembali generik | Brand tidak terasa. | `DESIGN.md`, `ANTISLOP.md`, delivery gate, visual regression. |
| Rate limit in-memory | Tidak konsisten multi-instance. | Single instance P0, shared store sebelum scale-out. |
| API contract drift | Frontend mudah rusak. | Shared types, API integration test, contract test. |

## 20. Keputusan Terbuka Sebelum Paid Launch

Keputusan berikut tidak menghalangi P0:

- provider dan lisensi commercial display;
- disclaimer final hasil review legal;
- pricing membership;
- metode pembayaran;
- kebijakan moderasi dan penghapusan konten;
- retention dan backup database;
- provider email untuk approval dan activation;
- analytics yang digunakan dan consent yang diperlukan.

## 21. Referensi Internal

- `README.md`: setup dan status teknis saat ini.
- `prisma/schema.prisma`: model database aktif.
- `DESIGN.md`: arah visual Velox.
- `ANTISLOP.md`: filter desain dan delivery gate.
- `ANTISLOP-LICENSE.md`: lisensi sumber anti-slop.
- `ORDERBOOK_IMPLEMENTATION.md`: eksperimen lama, bukan scope P0 production.
- `PROJECT_REQUIREMENTS.md`: requirement landing lama, konteks historis.
