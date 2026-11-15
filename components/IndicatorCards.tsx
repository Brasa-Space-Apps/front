// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import { useEffect, useState } from "react";

import { fmt, fmt0, monthLabel } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import type { Locale, Stats } from "@/lib/types";

function monthName(month: number, locale: Locale) {
  return new Date(Date.UTC(2000, month - 1, 1)).toLocaleString(locale, { month: "long", timeZone: "UTC" });
}

function AnimatedInt({ target, locale, suffix = "" }: { target: number; locale: Locale; suffix?: string }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 420;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <>{fmt0(val, locale)}{suffix}</>;
}

function Card({
  label,
  value,
  detail,
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-in-up border-l border-line p-3 first:border-l-0"
      style={{ animationDelay: `${delay}ms` }}
    >
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
      <Card
        delay={0}
        label={t.fireDaysInPeriod}
        value={<AnimatedInt target={ind.total} locale={locale} />}
        detail={`${fmt(ind.annual_mean, locale)} ${t.perYear}`}
      />
      <Card
        delay={50}
        label={t.worstYear}
        value={ind.worst_year ? String(ind.worst_year.year) : "—"}
        detail={ind.worst_year ? `${fmt0(ind.worst_year.value, locale)} ${t.fireDaysMetric}` : t.noFirePeriod}
      />
      <Card
        delay={100}
        label={t.peakMonth}
        value={ind.peak_month ? monthLabel(ind.peak_month.year, ind.peak_month.month, locale) : "—"}
        detail={ind.typical_peak_month ? `${t.typicalPeak} ${monthName(ind.typical_peak_month, locale)}` : undefined}
      />
      <Card
        delay={150}
        label={t.area}
        value={<AnimatedInt target={area.km2} locale={locale} suffix=" km²" />}
        detail={`${fmt0(area.n_cells, locale)} ${t.cells}`}
      />
    </div>
  );
}