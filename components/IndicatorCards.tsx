// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
import { MONTHS_LONG, fmt, fmt0, monthLabel } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import type { Stats } from "@/lib/types";

function Card({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="border-l border-line p-3 first:border-l-0">
      <p className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
    </div>
  );
}

export default function IndicatorCards({ stats, locale }: { stats: Stats; locale: Locale }) {
  const t = getCopy(locale);
  const { indicators: ind, area } = stats;
  return (
    <div className="grid grid-cols-2 divide-y divide-line border-y border-line sm:grid-cols-4 sm:divide-y-0">
      <Card label={t.fireDaysInPeriod} value={fmt0(ind.total, locale)}
            detail={`${fmt(ind.annual_mean, locale)} ${t.perYear}`} />
      <Card label={t.worstYear} value={ind.worst_year ? String(ind.worst_year.year) : "—"}
            detail={ind.worst_year ? `${fmt0(ind.worst_year.value, locale)} ${t.fireDaysMetric}` : t.noFirePeriod} />
      <Card label={t.peakMonth}
            value={ind.peak_month ? monthLabel(ind.peak_month.year, ind.peak_month.month, locale) : "—"}
            detail={ind.typical_peak_month ? `${t.typicalPeak} ${locale === "pt-BR" ? ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][ind.typical_peak_month - 1] : MONTHS_LONG[ind.typical_peak_month - 1]}` : undefined} />
      <Card label={t.area} value={`${fmt0(area.km2, locale)} km²`}
            detail={`${fmt0(area.n_cells, locale)} ${t.cells}`} />
    </div>
  );
}
