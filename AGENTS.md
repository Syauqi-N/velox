<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- OMX:VELOX:WORKFLOW-NOTES:START -->

# OMX Workflow Notes (Velox)

Aturan singkat untuk menghindari workflow OMX yang macet ("kayak ga bisa di-run"):

- **Jangan tekan Stop saat workflow OMX aktif** (`$autopilot`, `$ralph`, dll). Stop
  akan diblokir sementara fase belum selesai. Untuk menghentikan, gunakan
  `omx cancel` (jalankan dari repo ini) atau perintah `$cancel`.
- **`$autopilot` WAJIB melewati gate** `deep-interview` -> `ralplan` -> `ultragoal`
  -> `code-review` -> `ultraqa`. Kalau promptnya ambigu/keluhan, autopilot berhenti
  di `deep-interview` dan TIDAK menyentuh kode sampai pertanyaannya dijawab.
- **Untuk perbaikan fokus** (mis. UI/satu halaman), jangan pakai `$autopilot`.
  Beri instruksi langsung atau `$ultragoal`. Autopilot overkill & lambat untuk itu.
- **Cek status dulu** kalau ragu macet: `omx status` / `omx state list-active --json`.
  Jika mode terlihat aktif padahal sesi sudah mati, jalankan `omx cancel` lalu lanjut.
- **Satu sesi Codex OMX per repo dalam satu waktu.** Dua sesi di repo yang sama
  berebut `.omx/state/session.json` -> error `session.json is present but unusable`.
- Pastikan state terminal (`active:false` / `cancelled`) sebelum run workflow baru.

<!-- OMX:VELOX:WORKFLOW-NOTES:END -->
