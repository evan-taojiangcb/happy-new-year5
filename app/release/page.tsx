export default function ReleasePreviewPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#2a1215] to-[#4a0404] px-6 py-16 text-center text-white">
      <div className="mx-auto max-w-md">
        <div className="mx-auto h-16 w-16 rounded-full border-2 border-[#f2b90d66] bg-[#ffd70033] shadow-[0_0_30px_rgba(242,185,13,.5)]" />
        <h1 className="cny-title mt-10 text-7xl leading-tight">新年快乐</h1>
        <p className="mt-5 text-2xl">愿所有美好如期而至</p>
        <p className="mt-2 text-sm tracking-[0.2em] text-[#f2b90daa]">MAY ALL BEAUTIFUL THINGS ARRIVE AS SCHEDULED</p>
      </div>
    </main>
  );
}
