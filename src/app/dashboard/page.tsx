"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import PostComposer from "@/components/feed/PostComposer";
import SocialFeed from "@/components/feed/SocialFeed";
import IHSGChartCard from "@/components/charts/IHSGChartCard";
import SearchPane from "@/components/search/SearchPane";
import WatchlistBox from "@/components/watchlist/WatchlistBox";
import RecentCalls from "@/components/RecentCalls";
import MarketPulse from "@/components/MarketPulse";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [refreshTick, setRefreshTick] = useState(0);
  const [feedRefresh, setFeedRefresh] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !session?.user?.id) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [router, session?.user?.id, status]);

  if (status === "loading") {
    return (
      <AppShell>
        <div className="text-[var(--text-muted)]">Memuat…</div>
      </AppShell>
    );
  }
  if (status === "unauthenticated") {
    return null;
  }
  if (!session?.user?.id) {
    return null;
  }

  function onWatchlistChanged() {
    setRefreshTick((t) => t + 1);
  }

  return (
    <AppShell userName={session.user.name} userRole={session.user.role}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Home</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Percakapan terbaru dari circle, dengan konteks saham saat diperlukan.
          {postCount > 0 && (
            <span className="ml-1 text-[var(--text-muted)]">({postCount} postingan)</span>
          )}
        </p>
        </div>
        <MarketPulse compact className="hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,65fr)_minmax(300px,35fr)]">
        {/* Feed */}
        <div className="min-w-0 space-y-4">
          <PostComposer
            onCreated={() => setFeedRefresh((t) => t + 1)}
          />
          <SocialFeed
            refreshTick={feedRefresh}
            onCountChange={setPostCount}
          />
        </div>

        {/* Sidebar: search column */}
        <div className="min-w-0 space-y-4">
          <IHSGChartCard refreshTick={refreshTick} />
          <SearchPane
            selectedSymbol={selectedSymbol}
            onSelect={setSelectedSymbol}
            onWatchlistChanged={onWatchlistChanged}
          />
          <WatchlistBox refreshTick={refreshTick} onSelect={setSelectedSymbol} />
          <RecentCalls />
        </div>
      </div>
    </AppShell>
  );
}
