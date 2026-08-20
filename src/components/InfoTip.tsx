import { useId, useState } from "react";

/** Circled-i hint. Text comes from the payload; renders nothing when absent. */
export default function InfoTip({ text }: { text?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!text) return null;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="More information"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="grid h-3.5 w-3.5 place-items-center rounded-full border border-line text-[9px] font-semibold leading-none text-muted transition-colors hover:border-muted hover:text-ink"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-2 w-60 -translate-x-1/2 rounded-lg border border-line bg-white p-2.5 text-xs font-normal leading-relaxed text-muted shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
