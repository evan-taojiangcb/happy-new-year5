"use client";

import { useAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { CNY_RELEASE_TIME, MAX_WISH_PER_USER } from "@/lib/config";
import {
  hasMoreAtom,
  loadingAtom,
  nextTokenAtom,
  releasePlayingAtom,
  userIdAtom,
  wishCountAtom,
  wishesAtom
} from "@/lib/client-state";
import type { Wish } from "@/lib/types";
import { Countdown } from "./countdown";
import { ReleaseOverlay } from "./release-overlay";
import { WishCard } from "./wish-card";
import { WishFormModal } from "./wish-form-modal";

function getOrCreateUserId(): string {
  const key = "wish_user_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(key, id);
  window.localStorage.setItem("wish_count", "0");
  return id;
}

export function WishWallClient(): React.JSX.Element {
  const [userId, setUserId] = useAtom(userIdAtom);
  const [wishCount, setWishCount] = useAtom(wishCountAtom);
  const [wishes, setWishes] = useAtom(wishesAtom);
  const [nextToken, setNextToken] = useAtom(nextTokenAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [hasMore, setHasMore] = useAtom(hasMoreAtom);
  const [releasePlaying, setReleasePlaying] = useAtom(releasePlayingAtom);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"latest" | "hot" | "mine">("latest");
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    setWishCount(Number(window.localStorage.getItem("wish_count") || "0"));
  }, [setUserId, setWishCount]);

  useEffect(() => {
    void fetchList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const shouldRelease = Date.now() >= CNY_RELEASE_TIME.getTime() && sessionStorage.getItem("release_shown") !== "1";
    if (!shouldRelease) return;

    setReleasePlaying(true);
    sessionStorage.setItem("release_shown", "1");
    void fetch("/api/wishes/release", {
      method: "POST",
      headers: process.env.NEXT_PUBLIC_RELEASE_API_KEY ? { "x-release-key": process.env.NEXT_PUBLIC_RELEASE_API_KEY } : undefined
    }).catch(() => undefined);

    const timer = setTimeout(() => {
      setReleasePlaying(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, [setReleasePlaying]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          void fetchList(false);
        }
      });
    }, { rootMargin: "300px" });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, nextToken]);

  async function fetchList(reset: boolean): Promise<void> {
    if (loading) return;
    setLoading(true);

    try {
      const url = new URL("/api/wishes", window.location.origin);
      url.searchParams.set("limit", "20");
      if (!reset && nextToken) url.searchParams.set("nextToken", nextToken);

      const res = await fetch(url.toString());
      const data = await res.json();
      const list = (data.wishes || []) as Wish[];

      if (reset) {
        setWishes(list);
      } else {
        setWishes((prev) => [...prev, ...list]);
      }
      setNextToken(data.nextToken || null);
      setHasMore(Boolean(data.nextToken));
    } finally {
      setLoading(false);
    }
  }

  function onCreated(wish: Wish): void {
    setWishes((prev) => [wish, ...prev]);
    const nextCount = wishCount + 1;
    setWishCount(nextCount);
    window.localStorage.setItem("wish_count", String(nextCount));
    alert("愿望已写下");
  }

  const filtered = useMemo(() => {
    if (tab === "mine") return wishes.filter((w) => w.userId === userId);
    if (tab === "hot") return [...wishes].sort((a, b) => a.content.length - b.content.length);
    return wishes;
  }, [tab, wishes, userId]);

  const canCreate = wishCount < MAX_WISH_PER_USER;

  return (
    <main className="wish-wall-bg relative min-h-screen pb-28 text-white">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="snowflake" style={{ left: `${i * 13 + 4}%`, animationDelay: `${(i % 4) * 1.2}s`, fontSize: `${12 + (i % 3) * 4}px` }}>❄</span>
      ))}

      <section className="mx-auto max-w-md px-4 pt-6 text-center sm:max-w-lg md:max-w-4xl">
        <div className="inline-flex rounded-full border border-[#d2323255] bg-[#d2323233] px-4 py-1 text-xs uppercase tracking-wider text-[#ffd700]">
          Chinese New Year 2026
        </div>
        <h1 className="cny-title mt-4 text-6xl leading-none">2026</h1>
        <h2 className="cny-title text-5xl">除夕许愿墙</h2>
        <p className="mt-3 text-sm text-white/60">距离新年还有</p>
        <div className="mt-3">
          <Countdown />
        </div>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-md gap-3 px-4 sm:max-w-lg md:max-w-4xl">
        {[
          { key: "latest", label: "最新愿望" },
          { key: "hot", label: "热门祝福" },
          { key: "mine", label: "我的愿望" }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key as "latest" | "hot" | "mine")}
            className={`rounded-full px-4 py-2 text-sm ${tab === item.key ? "border border-[#b01f1f] bg-[#d23232] text-white" : "border border-white/10 bg-[#1a0f0f] text-white/70"}`}
          >
            {item.label}
          </button>
        ))}
      </section>

      <section className="mx-auto mt-5 w-full max-w-md px-4 sm:max-w-lg md:max-w-4xl">
        <div className="masonry">
          {filtered.map((wish) => (
            <WishCard key={wish.wishId} wish={wish} />
          ))}
        </div>

        {!loading && filtered.length === 0 ? <p className="py-8 text-center text-sm text-white/70">暂时还没有愿望，快来写下第一个吧。</p> : null}

        {hasMore ? <div ref={loaderRef} className="py-4 text-center text-sm text-white/60">{loading ? "加载中..." : "下拉加载更多"}</div> : <div className="py-4 text-center text-sm text-white/45">没有更多愿望了</div>}
      </section>

      <button
        onClick={() => {
          if (!canCreate) {
            alert("您最多只能许3个愿望哦");
            return;
          }
          setOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ffd700] bg-[#d23232] text-3xl text-[#ffd700] shadow-[0_18px_30px_rgba(210,50,50,0.45)] animate-pulseGlow"
        aria-label="写愿望"
      >
        ✎
      </button>

      <WishFormModal open={open} onClose={() => setOpen(false)} userId={userId || ""} onCreated={onCreated} />
      <ReleaseOverlay show={releasePlaying} />
    </main>
  );
}
