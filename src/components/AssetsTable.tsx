import { useState } from "react";
import type { AssetRow } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AssetReportPanel from "@/components/AssetReportPanel";

const ACTION_STYLE: Record<string, { dot: string; text: string }> = {
  GREEN: { dot: "#16a34a", text: "text-ink" },
  GREY: { dot: "#c9c9c2", text: "text-muted" },
  BLACK: { dot: "#111111", text: "text-ink" },
};

function assetUrl(a: AssetRow) {
  return a.post_url ?? a.url ?? "";
}

function trustLabel(a: AssetRow) {
  return (a.trust_action ?? a.action ?? "").toUpperCase();
}

export default function AssetsTable({ assets }: { assets: AssetRow[] }) {
  const [selected, setSelected] = useState<AssetRow | null>(null);

  if (!assets.length) return null;

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h2 className="text-[15px] font-semibold text-ink">Assessed assets</h2>
        <p className="mt-0.5 text-xs text-muted">{assets.length} assets in the assessment window</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium sm:px-6">Asset</th>
              <th className="px-3 py-3 font-medium">Trust</th>
              <th className="px-5 py-3 text-right font-medium sm:px-6">View Report</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => {
              const url = assetUrl(a);
              const label = trustLabel(a);
              const style = ACTION_STYLE[label] ?? ACTION_STYLE["GREY"]!;
              return (
                <tr key={a.id} className="border-b border-line/70 last:border-0">
                  <td className="max-w-[420px] px-5 py-3 sm:px-6">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-xs font-medium text-good hover:underline"
                      >
                        {url}
                      </a>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`flex items-center gap-2 text-xs font-medium ${style.text}`}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: style.dot }} />
                      {label || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => setSelected(a)}
                      className="text-xs font-medium text-good hover:underline"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Score Report</SheetTitle>
          </SheetHeader>
          {selected ? <AssetReportPanel asset={selected} /> : null}
        </SheetContent>
      </Sheet>
    </div>

  );
}
