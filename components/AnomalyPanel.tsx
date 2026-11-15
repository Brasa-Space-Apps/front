// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
import { BRAND, fmt, fmt0, monthLabel } from "@/lib/format";
import type { Anomaly } from "@/lib/types";

function ratioText(a: Anomaly) {
  if (a.ratio === null) return a.value === 0 ? "no fire, as usual" : "fire in a month that usually has none";
  if (a.ratio >= 0.9 && a.ratio <= 1.1) return "about normal";
  return `${fmt(a.ratio)}× the median`;
}

function chipColor(a: Anomaly) {
  if (a.ratio === null) return a.value > 0 ? BRAND.orange : BRAND.grey;
  if (a.ratio >= 1.5) return BRAND.orange;
  if (a.ratio <= 0.67) return BRAND.blue;
  return BRAND.grey;
}

export default function AnomalyPanel({ lastMonth, anomalies }: { lastMonth: Anomaly | null; anomalies: Anomaly[] }) {
  // the most unusual months of the period: highest percentile, then highest ratio
  const top = anomalies
    .filter((a) => a.value > 0 && a.percentile >= 90)
    .sort((a, b) => b.percentile - a.percentile || (b.ratio ?? Infinity) - (a.ratio ?? Infinity))
    .slice(0, 3);

  const isElevated = (a: Anomaly) =>
    (a.ratio === null && a.value > 0) || (a.ratio !== null && a.ratio >= 1.5);

  return (
    <section
      aria-labelledby="anomaly-title"
      className="animate-fade-in-up rounded-lg border border-stone-200 bg-white p-3 transition-colors duration-200 hover:border-stone-300"
      style={{ animationDelay: "120ms" }}
    >
      <h2 id="anomaly-title" className="text-sm font-semibold text-[#1C1A17]">Compared with history</h2>

      {lastMonth && (
        <div className="mt-2 flex items-start gap-3">
          <span className="relative mt-1.5 flex h-3 w-3 shrink-0">
            {isElevated(lastMonth) && (
              <span
                aria-hidden
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                style={{ background: chipColor(lastMonth), animationDuration: "2.4s" }}
              />
            )}
            <span aria-hidden className="relative inline-flex h-3 w-3 rounded-full" style={{ background: chipColor(lastMonth) }} />
          </span>
          <p className="text-sm text-[#1C1A17]">
            <b>{monthLabel(lastMonth.year, lastMonth.month)}</b> (latest month): {fmt0(lastMonth.value)} fire days,{" "}
            {ratioText(lastMonth)}. Typical for this month: {fmt0(lastMonth.median)}.{" "}
            <span className="text-stone-600">Percentile {lastMonth.percentile}.</span>
          </p>
        </div>
      )}

      {top.length > 0 && (
        <>
          <p className="mt-3 text-xs font-medium text-stone-600">Most unusual months in the period</p>
          <ul className="mt-1 space-y-1">
            {top.map((a, i) => (
              <li
                key={`${a.year}-${a.month}`}
                className="animate-fade-in-up -mx-1.5 flex items-center gap-2 rounded px-1.5 py-0.5 text-sm text-[#1C1A17] transition-colors hover:bg-stone-50"
                style={{ animationDelay: `${160 + i * 50}ms` }}
              >
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: chipColor(a) }} />
                <span className="w-20 font-medium">{monthLabel(a.year, a.month)}</span>
                <span className="tabular-nums">{fmt0(a.value)}</span>
                <span className="text-stone-600">· {ratioText(a)} · p{a.percentile}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
