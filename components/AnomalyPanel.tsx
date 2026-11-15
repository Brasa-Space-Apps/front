// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
import { fmt, fmt0, monthLabel } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import type { Anomaly, Locale } from "@/lib/types";

function ratioText(a: Anomaly, locale: Locale) {
  const t = getCopy(locale);
  if (a.ratio === null) return a.value === 0 ? t.noFireUsual : t.fireUsuallyNone;
  if (a.ratio >= 0.9 && a.ratio <= 1.1) return t.aboutNormal;
  return `${fmt(a.ratio, locale)}× ${t.timesMedian}`;
}

function chipColor(a: Anomaly) {
  if (a.ratio === null || a.ratio >= 1.5) return "var(--accent)";
  return "var(--text-muted)";
}

export default function AnomalyPanel({ lastMonth, anomalies, locale }: { lastMonth: Anomaly | null; anomalies: Anomaly[]; locale: Locale }) {
  const t = getCopy(locale);
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
      className="animate-fade-in-up rounded-lg border border-line bg-surface p-3 transition-colors duration-200 hover:border-fg/20"
      style={{ animationDelay: "120ms" }}
    >
      <h2 id="anomaly-title" className="text-xs font-semibold uppercase tracking-[0.12em] text-fg">{t.comparedHistory}</h2>

      {lastMonth && (
        <div className="mt-2 flex items-start gap-3">
          <span className="relative mt-1.5 flex h-3 w-3 shrink-0">
            {isElevated(lastMonth) && (
              <span
                aria-hidden
                className="absolute inline-flex h-full w-full rounded-full opacity-50 motion-safe:animate-ping"
                style={{ background: chipColor(lastMonth), animationDuration: "2.4s" }}
              />
            )}
            <span aria-hidden className="relative inline-flex h-3 w-3 rounded-full" style={{ background: chipColor(lastMonth) }} />
          </span>
          <p className="text-sm text-fg">
            <b>{monthLabel(lastMonth.year, lastMonth.month, locale)}</b> ({t.latestMonth}): {fmt0(lastMonth.value, locale)} {t.fireDaysMetric},{" "}
            {ratioText(lastMonth, locale)}. {t.typicalForMonth}: {fmt0(lastMonth.median, locale)} {t.fireDaysMetric}.{" "}
            <span className="text-muted">{t.percentile} {lastMonth.percentile}.</span>
          </p>
        </div>
      )}

      {top.length > 0 && (
        <>
          <p className="mt-3 text-xs font-medium text-muted">{t.mostUnusual}</p>
          <ul className="mt-1 space-y-1">
            {top.map((a, i) => (
              <li
                key={`${a.year}-${a.month}`}
                className="animate-fade-in-up -mx-1.5 flex items-center gap-2 rounded px-1.5 py-0.5 text-sm text-fg transition-colors hover:bg-fg/5"
                style={{ animationDelay: `${160 + i * 50}ms` }}
              >
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: chipColor(a) }} />
                <span className="w-20 font-medium">{monthLabel(a.year, a.month, locale)}</span>
                <span className="tabular-nums">{fmt0(a.value, locale)} {t.fireDaysMetric}</span>
                <span className="text-muted">· {ratioText(a, locale)} · p{a.percentile}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}