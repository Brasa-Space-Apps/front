// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
import { BRAND, fmt, fmt0, monthLabel } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import type { Anomaly, Locale } from "@/lib/types";

function ratioText(a: Anomaly, locale: Locale) {
  const t = getCopy(locale);
  if (a.ratio === null) return a.value === 0 ? t.noFireUsual : t.fireUsuallyNone;
  if (a.ratio >= 0.9 && a.ratio <= 1.1) return t.aboutNormal;
  return `${fmt(a.ratio, locale)}× ${t.timesMedian}`;
}

function chipColor(a: Anomaly) {
  if (a.ratio === null) return a.value > 0 ? BRAND.orange : BRAND.grey;
  if (a.ratio >= 1.5) return BRAND.orange;
  if (a.ratio <= 0.67) return BRAND.blue;
  return BRAND.grey;
}

export default function AnomalyPanel({ lastMonth, anomalies, locale }: { lastMonth: Anomaly | null; anomalies: Anomaly[]; locale: Locale }) {
  const t = getCopy(locale);
  // the most unusual months of the period: highest percentile, then highest ratio
  const top = anomalies
    .filter((a) => a.value > 0 && a.percentile >= 90)
    .sort((a, b) => b.percentile - a.percentile || (b.ratio ?? Infinity) - (a.ratio ?? Infinity))
    .slice(0, 3);

  return (
    <section aria-labelledby="anomaly-title" className="rounded-lg border border-stone-200 bg-white p-3">
      <h2 id="anomaly-title" className="text-sm font-semibold text-[#1C1A17]">{t.comparedHistory}</h2>

      {lastMonth && (
        <div className="mt-2 flex items-start gap-3">
          <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: chipColor(lastMonth) }} />
          <p className="text-sm text-[#1C1A17]">
            <b>{monthLabel(lastMonth.year, lastMonth.month, locale)}</b> ({t.latestMonth}): {fmt0(lastMonth.value, locale)} {t.fireDaysMetric},{" "}
            {ratioText(lastMonth, locale)}. {t.typicalForMonth}: {fmt0(lastMonth.median, locale)} {t.fireDaysMetric}.{" "}
            <span className="text-stone-600">{t.percentile} {lastMonth.percentile}.</span>
          </p>
        </div>
      )}

      {top.length > 0 && (
        <>
          <p className="mt-3 text-xs font-medium text-stone-600">{t.mostUnusual}</p>
          <ul className="mt-1 space-y-1">
            {top.map((a) => (
              <li key={`${a.year}-${a.month}`} className="flex items-center gap-2 text-sm text-[#1C1A17]">
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: chipColor(a) }} />
                <span className="w-20 font-medium">{monthLabel(a.year, a.month, locale)}</span>
                <span className="tabular-nums">{fmt0(a.value, locale)} {t.fireDaysMetric}</span>
                <span className="text-stone-600">· {ratioText(a, locale)} · p{a.percentile}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
