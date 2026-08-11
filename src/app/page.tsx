import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import MarketPulse from "@/components/MarketPulse";

const capabilities = [
  ["Saham dan konteks", "Cari saham Indonesia, baca harga delayed, chart, dan informasi dasar sebelum masuk ke diskusi."],
  ["Watchlist pribadi", "Simpan ticker yang ingin dipantau. Daftar ini terpisah untuk setiap member."],
  ["Diskusi berticker", "Hubungkan analisis atau pertanyaan ke ticker agar percakapan mudah ditemukan kembali."],
  ["Calls yang transparan", "Admin dapat membuat dan menutup call dengan status, alasan, entry, dan target yang jelas."],
] as const;

export default async function HomePage() {
  const session = await auth();
  const hasSession = Boolean(session?.user?.id);
  return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
    <header className="border-b border-[var(--border)]"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"><Link href="/" aria-label="Velox"><Image src="/logos/velox-primary-horizontal.png" alt="Velox" width={180} height={44} className="h-10 w-auto" priority /></Link><nav className="flex items-center gap-3">{hasSession ? <Link href="/dashboard" className="btn-gold inline-flex min-h-11 items-center justify-center whitespace-nowrap px-5 text-sm leading-none"><span className="translate-y-px">Buka Home</span></Link> : <><Link href="/login" className="btn-ghost inline-flex min-h-11 items-center justify-center px-4 text-sm leading-none"><span className="translate-y-px">Masuk</span></Link><Link href="/signup" className="btn-gold inline-flex min-h-11 items-center justify-center whitespace-nowrap px-5 text-sm leading-none"><span className="translate-y-px">Ajukan Akses</span></Link></>}</nav></div></header>
    <main><section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:py-24"><div><p className="text-sm font-medium text-[var(--muted)]">Komunitas investasi saham Indonesia</p><h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Lihat saham, simpan yang menarik, lalu bahas bersama circle.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">Velox menyatukan data pasar delayed, watchlist pribadi, diskusi berbasis ticker, dan trading calls admin dalam satu alur sederhana.</p><div className="mt-8 flex flex-wrap gap-3">{hasSession ? <Link href="/dashboard" className="btn-gold inline-flex min-h-11 items-center px-5 text-sm">Buka Home</Link> : <><Link href="/signup" className="btn-gold inline-flex min-h-11 items-center px-5 text-sm">Ajukan keanggotaan</Link><Link href="/login" className="btn-ghost inline-flex min-h-11 items-center px-5 text-sm">Masuk ke Velox</Link></>}</div></div><aside className="border-l-2 border-[var(--accent)] pl-5"><MarketPulse /><p className="mt-4 text-sm font-semibold">Catatan data</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Harga pasar bersifat delayed dan disediakan Yahoo Finance. Konten komunitas dibuat untuk diskusi dan riset, bukan instruksi transaksi.</p></aside></section>
    <section className="border-y border-[var(--border)] bg-[var(--card)]"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><h2 className="max-w-xl text-2xl font-bold">Ruang yang dibangun untuk alur investor, bukan terminal yang ramai.</h2><div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">{capabilities.map(([title, description]) => <article key={title} className="border-t border-[var(--border)] pt-4"><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p></article>)}</div></div></section>
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><h2 className="text-2xl font-bold">Akses melalui persetujuan circle.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">Kirim pendaftaran, tunggu persetujuan admin, lalu aktifkan akun dengan kode yang diberikan.</p><Link href="/signup" className="btn-gold mt-6 inline-flex min-h-11 items-center px-5 text-sm">Ajukan keanggotaan</Link></section></main>
    <footer className="border-t border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--muted)]">Velox, komunitas investasi privat.</footer>
  </div>;
}
