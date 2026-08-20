import type { AssetRow } from "@/lib/types";
import { formatDate } from "@/lib/format";

const ACTION_COLOR: Record<string, string> = {
  green: "#16a34a",
  grey: "#c9c9c2",
  black: "#111111",
};

export default function AssetsTable({ assets }: { assets: AssetRow[] }) {
  if (!assets.length) return null;

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h2 className="text-[15px] font-semibold text-ink">Assessed assets</h2>
        <p className="mt-0.5 text-xs text-muted">{assets.length} assets in the assessment window</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium sm:px-6">Asset</th>
              <th className="px-3 py-3 font-medium">Published</th>
              <th className="px-3 py-3 font-medium">Language</th>
              <th className="px-3 py-3 text-right font-medium">AQS</th>
              <th className="px-3 py-3 text-right font-medium">WoW</th>
              <th className="px-3 py-3 font-medium">Finding</th>
              <th className="px-5 py-3 text-right font-medium sm:px-6">Link</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="border-b border-line/70 last:border-0 align-top">
                <td className="px-5 py-3 sm:px-6">
                  <div className="flex items-center gap-3">
                    {a.thumbnail_url ? (
                      <img src={a.thumbnail_url} alt="" className="h-10 w-8 rounded object-cover" loading="lazy" />
                    ) : (
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ACTION_COLOR[a.action ?? "grey"] }}
                      />
                    )}
                    <span className="tnum text-xs text-muted">{a.id}</span>
                  </div>
                </td>
                <td className="tnum px-3 py-3 text-xs text-muted">{formatDate(a.published_at)}</td>
                <td className="px-3 py-3 text-xs text-muted">{a.language ?? "—"}</td>
                <td className="tnum px-3 py-3 text-right font-semibold">{a.aqs ?? "—"}</td>
                <td className="tnum px-3 py-3 text-right font-semibold">{a.wow ?? "—"}</td>
                <td className="max-w-[280px] px-3 py-3 text-xs text-muted">{a.summary ?? "—"}</td>
                <td className="px-5 py-3 text-right sm:px-6">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-good hover:underline"
                  >
                    View post
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
