"use client";

import { useEffect, useMemo, useState } from "react";
import { CNY_COUNTDOWN_TARGET } from "@/lib/config";

function splitTime(ms: number): { d: string; h: string; m: string; s: string } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    d: String(d),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0")
  };
}

export function Countdown(): React.JSX.Element {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parts = useMemo(() => splitTime(CNY_COUNTDOWN_TARGET.getTime() - now), [now]);

  return (
    <div className="flex items-end justify-center gap-2 text-center">
      {[{ v: parts.d, l: "天" }, { v: parts.h, l: "时" }, { v: parts.m, l: "分" }, { v: parts.s, l: "秒" }].map((item, idx) => (
        <div key={item.l} className="flex items-end gap-2">
          <div>
            <div className="min-w-14 rounded-2xl border-b-4 border-[#7d1515] bg-gradient-to-b from-[#d23232] to-[#b01f1f] px-3 py-2 font-mono text-2xl font-bold text-white shadow-lg">
              {item.v}
            </div>
            <div className="pt-1 text-[10px] text-white/60">{item.l}</div>
          </div>
          {idx < 3 ? <span className="pb-5 text-xl font-bold text-[#ffd700]">:</span> : null}
        </div>
      ))}
    </div>
  );
}
