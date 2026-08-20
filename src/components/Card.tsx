import type { ReactNode } from "react";
import InfoTip from "./InfoTip";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`card p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardTitle({ children, tooltip }: { children: ReactNode; tooltip?: string }) {
  return (
    <h2 className="mb-5 flex items-center gap-1.5 text-[15px] font-semibold text-ink">
      {children}
      <InfoTip text={tooltip} />
    </h2>
  );
}
