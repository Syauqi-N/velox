import AppShell from "@/components/AppShell";

export default function NewsLoading() {
  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Market update</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">News</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Menyiapkan headline terbaru.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card h-64 animate-pulse bg-[var(--card-hover)] md:col-span-2" />
        <div className="card h-56 animate-pulse bg-[var(--card-hover)]" />
        <div className="card h-56 animate-pulse bg-[var(--card-hover)]" />
      </div>
    </AppShell>
  );
}
