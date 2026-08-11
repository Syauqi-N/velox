"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import MemberAvatar from "@/components/MemberAvatar";
import { INVESTMENT_STYLES, SECTOR_OPTIONS, type InvestmentStyleValue, type SectorValue } from "@/lib/member-profile";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  memberTags: string[];
  investmentStyle: InvestmentStyleValue | null;
  favoriteSectors: SectorValue[];
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [memberTags, setMemberTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [investmentStyle, setInvestmentStyle] = useState<InvestmentStyleValue | "">("");
  const [favoriteSectors, setFavoriteSectors] = useState<SectorValue[]>([]);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !session?.user?.id) void signOut({ callbackUrl: "/login" });
  }, [router, session?.user?.id, status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    let cancelled = false;
    fetch("/api/profile")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Gagal memuat profil.");
        return data.profile as Profile;
      })
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setName(data.name ?? "");
        setBio(data.bio ?? "");
        setMemberTags(data.memberTags ?? []);
        setInvestmentStyle(data.investmentStyle ?? "");
        setFavoriteSectors(data.favoriteSectors ?? []);
        setError("");
      })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Gagal memuat profil."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session?.user?.id, status]);

  function addTag() {
    const tag = tagDraft.trim().replace(/\s+/g, " ");
    if (!tag) return;
    if (memberTags.length >= 3) { setError("Maksimal 3 member tag."); return; }
    if (tag.length > 30) { setError("Setiap member tag maksimal 30 karakter."); return; }
    if (memberTags.some((item) => item.toLocaleLowerCase("id-ID") === tag.toLocaleLowerCase("id-ID"))) { setTagDraft(""); return; }
    setMemberTags((items) => [...items, tag]);
    setTagDraft("");
    setError("");
    setSuccess("");
  }

  function toggleSector(value: SectorValue) {
    setSuccess("");
    if (favoriteSectors.includes(value)) {
      setFavoriteSectors((items) => items.filter((item) => item !== value));
      return;
    }
    if (favoriteSectors.length >= 5) { setError("Pilih maksimal 5 sektor favorit."); return; }
    setFavoriteSectors((items) => [...items, value]);
    setError("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    let nextTags = memberTags;
    const draft = tagDraft.trim().replace(/\s+/g, " ");
    if (draft && !nextTags.some((tag) => tag.toLocaleLowerCase("id-ID") === draft.toLocaleLowerCase("id-ID"))) {
      if (nextTags.length >= 3 || draft.length > 30) { setError("Maksimal 3 member tag, masing-masing 30 karakter."); setSaving(false); return; }
      nextTags = [...nextTags, draft];
    }
    try {
      const body = new FormData();
      body.set("name", name);
      body.set("bio", bio);
      body.set("investmentStyle", investmentStyle);
      body.set("removeAvatar", String(removeAvatar));
      nextTags.forEach((tag) => body.append("memberTags", tag));
      favoriteSectors.forEach((sector) => body.append("favoriteSectors", sector));
      if (avatar) body.set("avatar", avatar);
      const response = await fetch("/api/profile", { method: "PATCH", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan profil.");
      const updated = data.profile as Profile;
      setProfile(updated);
      setName(updated.name ?? "");
      setBio(updated.bio ?? "");
      setMemberTags(updated.memberTags ?? []);
      setTagDraft("");
      setInvestmentStyle(updated.investmentStyle ?? "");
      setFavoriteSectors(updated.favoriteSectors ?? []);
      setAvatar(null);
      setRemoveAvatar(false);
      setSuccess("Profil berhasil disimpan.");
      await update();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || (status === "authenticated" && loading)) return <AppShell><p className="text-sm text-[var(--muted)]">Memuat profil.</p></AppShell>;
  if (status === "unauthenticated" || !session?.user?.id) return null;

  return (
    <AppShell userName={session.user.name} userRole={session.user.role}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight">Profil</h1><p className="mt-1 text-sm text-[var(--muted)]">Atur identitas yang terlihat oleh member lain di dalam circle.</p></div>{profile && <Link href={`/members/${profile.id}`} className="btn-ghost inline-flex min-h-11 items-center px-3 text-sm">Lihat profil saya</Link>}</div>
        <form onSubmit={save} className="space-y-4">
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Identitas</h2>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row">
              <div className="shrink-0"><MemberAvatar author={{ name: name || profile?.name || null, email: profile?.email, avatarUrl: removeAvatar ? null : profile?.avatarUrl ?? null }} size="lg" /><label className="btn-ghost mt-3 inline-flex min-h-11 cursor-pointer items-center px-3 text-xs">Pilih avatar<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(event) => { setAvatar(event.target.files?.[0] ?? null); setRemoveAvatar(false); setSuccess(""); }} /></label>{profile?.avatarUrl && !removeAvatar && <button type="button" onClick={() => { setAvatar(null); setRemoveAvatar(true); setSuccess(""); }} className="mt-2 block text-xs font-medium text-[var(--muted)] underline">Hapus avatar</button>}{avatar && <p className="mt-2 max-w-40 truncate text-xs text-[var(--muted)]">{avatar.name}</p>}</div>
              <div className="min-w-0 flex-1 space-y-4"><label className="block text-sm font-medium"><span className="mb-1.5 block">Nama tampilan</span><input value={name} onChange={(event) => { setName(event.target.value); setSuccess(""); }} maxLength={80} className="input" /></label><label className="block text-sm font-medium"><span className="mb-1.5 block">Bio singkat <span className="font-normal text-[var(--muted)]">(opsional)</span></span><textarea value={bio} onChange={(event) => { setBio(event.target.value); setSuccess(""); }} maxLength={160} rows={3} className="input resize-none" placeholder="Ceritakan fokus analisis atau pendekatan investasimu." /><span className="mt-1 block text-right text-xs tabular-nums text-[var(--muted)]">{bio.length}/160</span></label></div>
            </div>
            <div className="mt-5 border-t border-[var(--border)] pt-5"><label htmlFor="member-tag" className="block text-sm font-medium">Member tags <span className="font-normal text-[var(--muted)]">(maksimal 3)</span></label><div className="mt-2 flex flex-wrap gap-2">{memberTags.map((tag) => <span key={tag} className="inline-flex min-h-8 items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--card-hover)] px-2 text-xs font-medium">{tag}<button type="button" onClick={() => { setMemberTags((items) => items.filter((item) => item !== tag)); setSuccess(""); }} aria-label={`Hapus tag ${tag}`} className="text-[var(--muted)] hover:text-[var(--down)]">×</button></span>)}</div>{memberTags.length < 3 && <div className="mt-3 flex max-w-lg gap-2"><input id="member-tag" value={tagDraft} onChange={(event) => { setTagDraft(event.target.value); setSuccess(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} maxLength={30} className="input" placeholder="Contoh: Portfolio Analysis" /><button type="button" onClick={addTag} className="btn-ghost min-h-11 shrink-0 px-3 text-sm">Tambah tag</button></div>}</div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Profil investor</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2"><label className="block text-sm font-medium"><span className="mb-1.5 block">Gaya investasi</span><select value={investmentStyle} onChange={(event) => { setInvestmentStyle(event.target.value as InvestmentStyleValue | ""); setSuccess(""); }} className="input"><option value="">Belum ditentukan</option>{INVESTMENT_STYLES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><div><p className="text-sm font-medium">Sektor favorit <span className="font-normal text-[var(--muted)]">(maksimal 5)</span></p><div className="mt-2 grid grid-cols-2 gap-2">{SECTOR_OPTIONS.map((option) => <label key={option.value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${favoriteSectors.includes(option.value) ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)]"}`}><input type="checkbox" checked={favoriteSectors.includes(option.value)} onChange={() => toggleSector(option.value)} className="accent-[var(--accent)]" />{option.label}</label>)}</div></div></div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3"><div>{error && <p role="alert" className="text-sm text-[var(--down)]">{error}</p>}{success && <p role="status" className="text-sm text-[var(--up)]">{success}</p>}</div><button type="submit" disabled={saving} className="btn-gold min-h-11 px-5 text-sm">{saving ? "Menyimpan" : "Simpan profil"}</button></div>
        </form>
      </div>
    </AppShell>
  );
}
