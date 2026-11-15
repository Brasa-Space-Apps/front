// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import AnomalyPanel from "@/components/AnomalyPanel";
import ExportButton from "@/components/ExportButton";
import IndicatorCards from "@/components/IndicatorCards";
import PeriodPicker from "@/components/PeriodPicker";
import Warnings from "@/components/Warnings";
import { useAnalysis } from "@/hooks/useAnalysis";
import { formatDate } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import { PANTANAL_BOUNDARY } from "@/lib/pantanal-boundary";
import type { Locale } from "@/lib/types";

// Browser-only pieces: never rendered on the server
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-2" />,
});
const CalendarHeatmap = dynamic(() => import("@/components/CalendarHeatmap"), { ssr: false });
const YearBars = dynamic(() => import("@/components/YearBars"), { ssr: false });

function Skeleton({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  return (
    <div className="animate-fade-in space-y-4" aria-busy="true" aria-label={t.loading}>
      <p role="status" className="text-xs text-muted">{t.analysingArea}</p>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-2" />)}
      </div>
      <div className="h-24 animate-pulse rounded-lg bg-surface-2" />
      <div className="h-80 animate-pulse rounded-lg bg-surface-2" />
    </div>
  );
}

function GuideIcon({ step }: { step: 1 | 2 | 3 }) {
  const paths = {
    1: <><path d="M5 5h14v14H5z" /><path d="m8 15 3-3 2 2 3-4" /></>,
    2: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /><path d="M8 14h2M14 14h2M8 17h2" /></>,
    3: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h4" /><path d="m15 17 2 2 4-4" /></>,
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[step]}
    </svg>
  );
}

function monthBounds(year: number, month: number, min?: string, max?: string) {
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let start = `${year}-${mm}-01`;
  let end = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;
  if (min && start < min) start = min;
  if (max && end > max) end = max;
  return { start, end };
}

export default function Dashboard({ locale }: { locale: Locale }) {
  const a = useAnalysis();
  const t = getCopy(locale);
  const [monthFilter, setMonthFilter] = useState<{
    year: number;
    month: number;
    prevStart: string;
    prevEnd: string;
  } | null>(null);

  const handleSelectMonth = (year: number, month: number) => {
    if (monthFilter && monthFilter.year === year && monthFilter.month === month) {
      a.setStartDate(monthFilter.prevStart);
      a.setEndDate(monthFilter.prevEnd);
      setMonthFilter(null);
      return;
    }
    const prevStart = monthFilter ? monthFilter.prevStart : a.startDate;
    const prevEnd = monthFilter ? monthFilter.prevEnd : a.endDate;
    const { start, end } = monthBounds(year, month, a.meta?.period.start, a.meta?.period.end);
    setMonthFilter({ year, month, prevStart, prevEnd });
    a.setStartDate(start);
    a.setEndDate(end);
  };

  const handleClearMonth = () => {
    if (!monthFilter) return;
    a.setStartDate(monthFilter.prevStart);
    a.setEndDate(monthFilter.prevEnd);
    setMonthFilter(null);
  };

  const changePeriod = (s: string, e: string) => {
    setMonthFilter(null);
    a.setStartDate(s);
    a.setEndDate(e);
  };

  return (
    <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <section aria-label={t.map} className="h-[50vh] overflow-hidden bg-bg lg:h-full lg:w-3/5">
        <Map
          boundary={a.meta?.pantanal_boundary ?? PANTANAL_BOUNDARY}
          drawn={a.geometry}
          density={a.density}
          onDraw={a.setGeometry}
          onClear={() => { setMonthFilter(null); a.clear(); }}
          locale={locale}
        />
      </section>

      <aside aria-label={t.analysis} className="panel-scroll space-y-4 p-4 lg:h-full lg:w-2/5 lg:overflow-y-auto">
        {(a.metaStatus === "loading" || a.metaStatus === "waking") && (
          <p role="status" className="flex items-center gap-2 text-sm text-muted">
            <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-accent" />
            {t.wakingServer}
          </p>
        )}

        {a.metaStatus === "failed" && a.metaError && (
          <div role="alert" className="space-y-2 text-sm text-[var(--danger)]">
            <p>{t.apiError}: {a.metaError}</p>
            <button
              type="button"
              onClick={a.retryMeta}
              className="rounded-md border border-accent px-3 py-1.5 font-medium text-accent hover:bg-accent/10 focus:outline-2 focus:outline-accent"
            >
              {t.retry}
            </button>
          </div>
        )}

        {a.meta && a.status !== "idle" && (
          <PeriodPicker
            min={a.meta.period.start}
            max={a.meta.period.end}
            start={a.startDate}
            end={a.endDate}
            onChange={changePeriod}
            locale={locale}
          />
        )}

        {a.status === "idle" && (
          <div className="animate-fade-in space-y-4 rounded-lg border border-line bg-surface-2 p-4 text-sm text-fg">
            <div>
              <p className="font-medium text-fg">{t.guideTitle}</p>
              <div className="mt-3 space-y-3">
                {([1, 2, 3] as const).map((step) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="text-accent"><GuideIcon step={step} /></span>
                    <span>{t[`guideStep${step}`]}</span>
                  </div>
                ))}
              </div>
            </div>
            {a.meta && (
              <div className="rounded-md border border-line bg-surface p-3">
                <PeriodPicker
                  min={a.meta.period.start}
                  max={a.meta.period.end}
                  start={a.startDate}
                  end={a.endDate}
                  onChange={changePeriod}
                  locale={locale}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => a.setGeometry((a.meta?.pantanal_boundary ?? PANTANAL_BOUNDARY).geometry)}
              className="w-full rounded-md bg-accent px-3 py-2 font-medium text-accent-text transition hover:opacity-90 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
            >
              {t.wholeRegion}
            </button>
            <p className="text-xs text-muted">{t.guideSource}</p>
          </div>
        )}

        {a.status === "loading" && (
          <>
            {a.slow && (
              <p role="status" className="text-sm text-muted">{t.wakingServer}</p>
            )}
            <Skeleton locale={locale} />
          </>
        )}

        {a.status === "outside" && (
          <div role="alert" className="animate-fade-in-up rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-surface)] p-4 text-sm text-fg">
            <p className="font-medium">{t.outside}</p>
            <p className="mt-1">{a.error}</p>
            <p className="mt-1">{t.drawInside}</p>
          </div>
        )}

        {a.status === "error" && (
          <div role="alert" className="animate-fade-in-up rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-surface)] p-4 text-sm text-fg">
            <p className="font-medium">{t.error}</p>
            <p className="mt-1">{a.error}</p>
            <button
              type="button"
              onClick={a.retry}
              className="mt-3 rounded-md bg-accent px-3 py-1.5 font-medium text-accent-text transition hover:opacity-90 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
            >
              {t.retry}
            </button>
          </div>
        )}

        {a.status === "no_fire" && (
          <div role="status" className="rounded-lg border border-line bg-surface p-4 text-sm text-fg">
            <p className="font-medium">{t.noFireTitle}</p>
            <p className="mt-1">{t.noFireBody}</p>
          </div>
        )}

        {(a.status === "result" || a.status === "no_fire") && a.stats && a.query && (
          <div className="animate-fade-in-up space-y-4">
            <Warnings items={a.stats.warnings} />
            <IndicatorCards stats={a.stats} locale={locale} />
            <AnomalyPanel lastMonth={a.stats.last_month} anomalies={a.stats.anomalies} locale={locale} />
            <CalendarHeatmap
              calendar={a.stats.calendar}
              lastMonth={a.stats.last_month}
              locale={locale}
              activeMonth={monthFilter ? { year: monthFilter.year, month: monthFilter.month } : null}
              onSelectMonth={handleSelectMonth}
              onClearMonth={handleClearMonth}
            />
            <YearBars calendar={a.stats.calendar} worstYear={a.stats.indicators.worst_year?.year ?? null} locale={locale} />
            <ExportButton query={a.query} locale={locale} />
          </div>
        )}

        {a.meta && (
          <p className="border-t border-line pt-3 text-xs text-muted">
            {t.dataUpTo} {formatDate(a.meta.data_cutoff, locale)} · {t.unit} · {t.source}: NASA FIRMS
            (MODIS Aqua and VIIRS S-NPP), {t.harmonized}.
          </p>
        )}
      </aside>
    </main>
  );
}