export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
        <span className="text-xl font-bold tracking-tight text-ink">
          To<span className="text-good">Be</span>
        </span>
      </div>
    </header>
  );
}
