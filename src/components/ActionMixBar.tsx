interface Props {
  mix: { green: number; grey: number; black: number };
}

const SEGMENTS = [
  { key: "green", color: "#16a34a", label: "Green" },
  { key: "grey", color: "#c9c9c2", label: "Grey" },
  { key: "black", color: "#111111", label: "Black" },
] as const;

export default function ActionMixBar({ mix }: Props) {
  const total = Math.max(1, mix.green + mix.grey + mix.black);

  return (
    <div>
      <p className="text-xs text-muted">Trust Action Mix</p>
      <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-[#eeeeea]">
        {SEGMENTS.map((s) => {
          const v = mix[s.key];
          if (!v) return null;
          return <div key={s.key} style={{ width: `${(v / total) * 100}%`, backgroundColor: s.color }} />;
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {SEGMENTS.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="tnum">{mix[s.key]}</span> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
