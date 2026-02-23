"use client";

import { useState } from "react";
import type { Gender, Wish } from "@/lib/types";

interface WishFormModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onCreated: (wish: Wish) => void;
}

export function WishFormModal({ open, onClose, userId, onCreated }: WishFormModalProps): React.JSX.Element | null {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [gender, setGender] = useState<Gender>("secret");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit(): Promise<void> {
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, nickname, content, contact, gender })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "提交失败");
        return;
      }

      onCreated(data.wish as Wish);
      setNickname("");
      setContent("");
      setContact("");
      setGender("secret");
      onClose();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-[3px] border-[#d93025] bg-white text-[#111827] shadow-2xl">
        <button className="absolute right-4 top-4 h-7 w-7 rounded-full bg-slate-100 text-slate-500" onClick={onClose} aria-label="关闭">
          ×
        </button>
        <div className="px-6 pb-4 pt-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 rotate-45 items-center justify-center rounded-2xl border-2 border-[#f2b90d66] bg-[#d93025]">
            <span className="-rotate-45 text-4xl text-[#ffd700]">福</span>
          </div>
          <h2 className="text-3xl font-medium">写下新年愿望</h2>
          <p className="text-sm text-[#6b7280]">Write your New Year Wish</p>
        </div>

        <div className="max-h-[60vh] overflow-auto px-6 pb-24">
          <label className="mb-2 block text-sm">昵称 <span className="text-[#d93025]">*</span></label>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} className="mb-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="e.g., 张三" />

          <label className="mb-2 block text-sm">性别</label>
          <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
            {[{ v: "male", t: "男" }, { v: "female", t: "女" }, { v: "secret", t: "保密" }].map((g) => (
              <button key={g.v} className={`rounded-xl px-2 py-2 text-sm ${gender === g.v ? "bg-white text-[#f2b90d] shadow" : "text-slate-500"}`} onClick={() => setGender(g.v as Gender)}>
                {g.t}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-sm">愿望内容 <span className="text-[#d93025]">*</span></label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={200} className="mb-1 h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="在这里写下你的新年愿望..." />
          <p className="mb-4 text-right text-xs text-slate-400">{content.length}/200</p>

          <label className="mb-2 block text-sm">联系方式 <span className="text-xs text-slate-400">(选填)</span></label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} maxLength={100} className="mb-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="微信号/手机号 (仅作展示)" />
          <p className="text-xs text-slate-400">* 信息仅供展示，请谨慎填写个人隐私</p>

          {error ? <p className="mt-3 text-sm text-[#d93025]">{error}</p> : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent p-4">
          <button onClick={submit} disabled={pending} className="w-full rounded-2xl bg-[#f2b90d] py-4 text-xl text-white shadow-lg disabled:opacity-60">
            {pending ? "提交中..." : "✦ 提交愿望"}
          </button>
        </div>
      </div>
    </div>
  );
}
