const LOGO = "https://asci.tobe.online/assets/tobe-logo-Apm8tT5J.png";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
        <img src={LOGO} alt="ToBe" className="h-7 w-auto" />
      </div>
    </header>
  );
}
