"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

interface Member {
  id: string;
  name: string | null;
  role: string;
  isAi: boolean;
  memberTags: string[];
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/members")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setMembers(data.members || []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell>
      <header className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <h1 className="text-lg font-bold text-[var(--foreground)]">Members</h1>
      </header>
      
      <div className="p-4">
        {loading ? (
          <div className="text-center text-sm text-[var(--muted)]">Memuat anggota...</div>
        ) : error ? (
          <div className="text-center text-sm text-[var(--down)]">{error}</div>
        ) : members.length === 0 ? (
          <div className="text-center text-sm text-[var(--muted)]">Belum ada anggota</div>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {members.map((member) => (
              <li key={member.id}>
                <Link 
                  href={`/members/${member.id}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition hover:border-[var(--accent)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] group-hover:border-[var(--accent)]">
                    {member.isAi ? (
                      <svg className="h-6 w-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <div className="text-xs font-semibold text-[var(--muted)]">
                        {(member.name?.charAt(0).toUpperCase() || "M")}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="truncate text-xs font-medium text-[var(--foreground)]">
                      {member.name || "Anonymous"}
                    </p>
                    {member.memberTags.length > 0 && (
                      <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">
                        {member.memberTags[0]}
                      </p>
                    )}
                    {member.isAi && (
                      <span className="mt-1 inline-block rounded-full bg-[var(--brand-navy-deep)] px-1.5 py-0.5 text-[9px] text-white">
                        AI
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
