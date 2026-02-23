import { RELEASE_MESSAGE } from "@/lib/config";

interface ReleaseOverlayProps {
  show: boolean;
}

export function ReleaseOverlay({ show }: ReleaseOverlayProps): React.JSX.Element | null {
  if (!show) return null;

  return (
    <div className="release-layer bg-gradient-to-b from-[#0f172acc] via-[#2a1215cc] to-[#4a0404dd]">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="release-card"
          style={{
            left: `${(i * 7) % 92}%`,
            bottom: `${(i * 13) % 30}%`,
            animationDelay: `${(i % 6) * 120}ms`
          }}
        />
      ))}
      <div className="absolute inset-x-0 top-[30%] text-center">
        <h2 className="cny-title text-6xl leading-tight">新年快乐</h2>
        <p className="mt-4 text-xl text-white/90">{RELEASE_MESSAGE}</p>
      </div>
    </div>
  );
}
