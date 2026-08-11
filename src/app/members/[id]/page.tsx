"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import MemberAvatar from "@/components/MemberAvatar";
import { investmentStyleLabel, sectorLabel } from "@/lib/member-profile";

interface MemberProfile {
  id: string;
  name: string | null;
  bio: string | null;
  memberTags: string[];
  investmentStyle: string | null;
  favoriteSectors: string[];
  avatarUrl: string | null;
  role: "admin" | "member";
  isAi: boolean;
  createdAt: string;
  stats: { posts: number; comments: number };
  isOwnProfile: boolean;
}

export default function MemberProfilePage() {
  const { data: session, status } = useSession();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !session?.user?.id) void signOut({ callbackUrl: "/login" });
  }, [router, session?.user?.id, status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !params.id) return;
    let cancelled = false;
    fetch(`/api/members/${encodeURIComponent(params.id)}`)
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Profil tidak tersedia."); return data.profile as MemberProfile; })
      .then((data) => { if (!cancelled) { setProfile(data); setError(""); } })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Profil tidak tersedia."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params.id, session?.user?.id, status]);

  if (status === "loading" || (status === "authenticated" && loading)) return <AppShell><p className="text-sm text-[var(--muted)]">Memuat profil member.</p></AppShell>;
  if (status === "unauthenticated" || !session?.user?.id) return null;

  return (
    <AppShell userName={session.user.name} userRole={session.user.role}>
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">Kembali ke Home</Link>
        {error ? <div className="card mt-5 p-8 text-center text-sm text-[var(--down)]">{error}</div> : profile && <>
          <section className="card mt-5 p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><MemberAvatar author={{ name: profile.name, avatarUrl: profile.avatarUrl }} size="lg" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">{profile.name?.trim() || "Member Velox"}</h1>{profile.isAi && <span className="rounded-md bg-[var(--brand-navy-deep)] px-2 py-1 text-xs font-semibold text-white">AI</span>}{profile.role === "admin" && <span className="rounded-md border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium">Admin</span>}</div>{profile.bio ? <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{profile.bio}</p> : <p className="mt-3 text-sm text-[var(--muted)]">Member ini belum menambahkan bio.</p>}{profile.memberTags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{profile.memberTags.map((tag) => <span key={tag} className="rounded-md border border-[var(--border-strong)] bg-[var(--card-hover)] px-2 py-1 text-xs font-medium">{tag}</span>)}</div>}</div>{profile.isOwnProfile && <Link href="/profile" className="btn-ghost inline-flex min-h-11 shrink-0 items-center px-3 text-sm">Edit profil</Link>}</div></section>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"><section className="card p-5"><h2 className="text-base font-semibold">Profil investor</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Gaya investasi</dt><dd className="mt-1 font-medium">{investmentStyleLabel(profile.investmentStyle) ?? "Belum ditentukan"}</dd></div><div><dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Sektor favorit</dt><dd className="mt-2 flex flex-wrap gap-2">{profile.favoriteSectors.length ? profile.favoriteSectors.map((sector) => <span key={sector} className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium">{sectorLabel(sector)}</span>) : <span className="text-[var(--muted)]">Belum ditentukan</span>}</dd></div></dl></section><section className="card p-5"><h2 className="text-base font-semibold">Aktivitas di circle</h2><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[var(--card-hover)] p-4"><p className="text-2xl font-bold tabular-nums">{profile.stats.posts}</p><p className="mt-1 text-xs text-[var(--muted)]">Postingan</p></div><div className="rounded-xl bg-[var(--card-hover)] p-4"><p className="text-2xl font-bold tabular-nums">{profile.stats.comments}</p><p className="mt-1 text-xs text-[var(--muted)]">Komentar</p></div></div><p className="mt-4 text-xs text-[var(--muted)]">Bergabung {new Date(profile.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p></section></div>
        </>}
      </div>
    </AppShell>
  );
}
