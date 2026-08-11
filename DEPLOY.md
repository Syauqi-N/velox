# Deploy Velox ke VPS (Image-Only, Tanpa Source Code)

VPS **tidak perlu source code**. Cukup pull image dari GHCR + jalankan dengan `docker compose`. Yang dibutuhkan di VPS hanya **2 file**: `docker-compose.yml` dan `.env`.

## Prasyarat

- VPS (Ubuntu 22.04+ / Debian 12+) dengan akses root/sudo
- Port 80/443 terbuka (jika pakai reverse proxy + domain)
- Image sudah dibuild & push ke GHCR oleh GitHub Actions (otomatis saat push ke `main`)

## 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
docker --version
docker compose version
```

## 2. Login ke GHCR (Image Private)

Buat Personal Access Token (PAT) di GitHub:

**GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token**
- Scope: `read:packages`

```bash
echo "ghp_xxxxxxxxxxxxxxxxxxxx" | docker login ghcr.io -u Syauqi-N --password-stdin
```

## 3. Buat Folder & 2 File

```bash
mkdir -p /opt/velox && cd /opt/velox
```

### File 1: `docker-compose.yml`

```bash
cat > docker-compose.yml <<'EOF'
services:
  velox:
    image: ghcr.io/syauqi-n/velox:latest
    container_name: velox
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      NODE_ENV: production
      PORT: "3000"
      HOSTNAME: "0.0.0.0"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - velox-net

  postgres:
    image: postgres:17-alpine
    container_name: velox-postgres
    restart: always
    environment:
      POSTGRES_USER: velox
      POSTGRES_PASSWORD: ${DB_PASSWORD:-velox_secret}
      POSTGRES_DB: velox
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U velox -d velox"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - velox-net

volumes:
  pgdata:
    name: velox-pgdata

networks:
  velox-net:
    name: velox-net
EOF
```

### File 2: `.env`

```bash
cat > .env <<'EOF'
DATABASE_URL="postgresql://velox:GANTI_PASSWORD_KUAT@postgres:5432/velox?schema=public"
DB_PASSWORD="GANTI_PASSWORD_KUAT"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="GANTI_DENGAN_SECRET"
ADMIN_EMAIL="admin@veloxcapital.com"
ADMIN_PASSWORD="GANTI_PASSWORD_ADMIN"
NINEROUTER_URL="http://100.90.253.13:20128/v1"
NINEROUTER_KEY="sk-9router-key-kamu"
EOF
```

## 4. Edit `.env`

```bash
nano .env
```

**Wajib ganti semua nilai default:**

| Variable | Contoh | Catatan |
|---|---|---|
| `DATABASE_URL` | `postgresql://velox:MyStr0ngP4ss@postgres:5432/velox?schema=public` | Hostname **harus** `postgres` (nama service) |
| `DB_PASSWORD` | `MyStr0ngP4ss` | Harus sama dengan password di `DATABASE_URL` |
| `AUTH_SECRET` | output `openssl rand -base64 32` | WAJIB di-generate |
| `NEXTAUTH_URL` | `https://velox.example.com` atau `http://IP_VPS:3000` | Domain/IP VPS |
| `ADMIN_EMAIL` | `admin@veloxcapital.com` | Email admin pertama |
| `ADMIN_PASSWORD` | min. 12 karakter | Password admin untuk seeding |
| `NINEROUTER_KEY` | `sk-...` | API key 9Router untuk TRISTA AI |

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## 5. Jalankan

```bash
docker compose up -d
```

Cek status:

```bash
docker compose ps
docker compose logs -f velox
```

Container `velox` otomatis:
1. Run `prisma migrate deploy` (apply semua migrations ke database)
2. Start Next.js server di port 3000

## 6. Verifikasi

```bash
curl http://localhost:3000
# Harus return HTML (200 OK)
```

Buka browser: `http://IP_VPS:3000`

## 7. Setup Reverse Proxy + SSL (Opsional)

Untuk domain + HTTPS, pakai Caddy (auto-SSL paling mudah):

```bash
apt install -y caddy

cat > /etc/caddy/Caddyfile <<'EOF'
velox.example.com {
    reverse_proxy localhost:3000
}
EOF

systemctl reload caddy
```

Lalu update `.env`:

```bash
# .env
NEXTAUTH_URL="https://velox.example.com"
docker compose up -d
```

## 8. Update ke Versi Baru

Saat ada push baru ke `main`, GitHub Actions otomatis build & push image `:latest`. Untuk update di VPS:

```bash
cd /opt/velox
docker compose pull
docker compose up -d
docker image prune -f
```

## 9. Backup Database

```bash
# Backup
docker exec velox-postgres pg_dump -U velox velox > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20260101.sql | docker exec -i velox-postgres psql -U velox velox
```

## 10. Seeding Admin Pertama (Opsional)

```bash
docker compose exec velox node --experimental-strip-types prisma/seed.ts
```

## 11. Troubleshooting

| Masalah | Solusi |
|---|---|
| `401 Unauthorized` saat pull image | Login GHCR ulang: `docker login ghcr.io` |
| `Cannot connect to database` | Cek `DATABASE_URL` pakai hostname `postgres` (bukan `localhost`) |
| `prisma migrate` gagal | `docker compose logs velox` — cek `DATABASE_URL` & `DB_PASSWORD` match |
| App return 500 | `docker compose logs velox` — kemungkinan `AUTH_SECRET` kosong |
| Port 3000 dipakai | Ubah `ports: "3000:3000"` → `"8080:3000"` di compose |
| Container restart loop | `docker compose logs velox` — pastikan postgres healthy dulu |
