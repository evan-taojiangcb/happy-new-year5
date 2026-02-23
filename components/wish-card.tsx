import type { Wish } from "@/lib/types";

const genderMap: Record<Wish["gender"], string> = {
  male: "♂",
  female: "♀",
  secret: "⚲"
};

function timeAgo(createdAt: number): string {
  const diffMin = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));
  if (diffMin < 60) return `${diffMin}分钟前`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}

export function WishCard({ wish }: { wish: Wish }): React.JSX.Element {
  return (
    <article className="wish-card rounded-3xl border-2 border-[#d2323233] bg-[#fff8e7] p-4 text-[#1f2937] shadow-lg" aria-label="愿望卡片">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d2323255] bg-[#ffedd5] text-xs font-bold text-[#d23232]">
          {wish.nickname.slice(0, 1)}
        </div>
        <div>
          <div className="text-sm font-semibold">{wish.nickname}</div>
          <div className="text-xs text-[#6b7280]">{timeAgo(wish.createdAt)}</div>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6">{wish.content}</p>
      {wish.contact ? <p className="mt-2 text-xs text-[#6b7280]">联系方式：{wish.contact}</p> : null}
      <div className="mt-3 flex items-center justify-between border-t border-[#d2323222] pt-2 text-xs text-[#d23232aa]">
        <span>{genderMap[wish.gender]}</span>
        <span>♡</span>
      </div>
    </article>
  );
}
