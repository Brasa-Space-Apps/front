// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
import { MONTHS_LONG, fmt, fmt0, monthLabel } from "@/lib/format";
import type { Stats } from "@/lib/types";

function Card({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      <p className="text-xs text-stone-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[#1C1A17]">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-stone-600">{detail}</p>}
    </div>
  );
}

export default function IndicatorCards({ stats }: { stats: Stats }) {
  const { indicators: ind, area } = stats;
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card label="Fire days in the period" value={fmt0(ind.total)}
            detail={`${fmt(ind.annual_mean)} per year on average`} />
      <Card label="Worst year" value={ind.worst_year ? String(ind.worst_year.year) : "—"}
            detail={ind.worst_year ? `${fmt0(ind.worst_year.value)} fire days` : "no fire in the period"} />
      <Card label="Peak month"
            value={ind.peak_month ? monthLabel(ind.peak_month.year, ind.peak_month.month) : "—"}
            detail={ind.typical_peak_month ? `Fire season usually peaks in ${MONTHS_LONG[ind.typical_peak_month - 1]}` : undefined} />
      <Card label="Area" value={`${fmt0(area.km2)} km²`}
            detail={`${fmt0(area.n_cells)} hexagons of ~5 km²`} />
    </div>
  );
}
