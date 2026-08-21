import { createContext, useContext, useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SheetCtx = createContext<{ close: () => void }>({ close: () => {} });

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;
  return (
    <SheetCtx.Provider value={{ close: () => onOpenChange(false) }}>
      {children}
    </SheetCtx.Provider>
  );
}

interface SheetContentProps {
  side?: "right" | "left";
  className?: string;
  children: ReactNode;
}

export function SheetContent({ side = "right", className, children }: SheetContentProps) {
  const { close } = useContext(SheetCtx);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 flex w-full max-w-md flex-col gap-4 overflow-y-auto bg-white p-6 shadow-xl",
          side === "right" ? "right-0" : "left-0",
          className,
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close panel"
          className="absolute right-4 top-4 rounded p-1 text-muted hover:bg-black/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-1 pr-8", className)}>{children}</div>;
}

export function SheetTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-[15px] font-semibold text-ink", className)}>{children}</h2>;
}