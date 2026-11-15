// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import dynamic from "next/dynamic";

import AnomalyPanel from "@/components/AnomalyPanel";
import ExportButton from "@/components/ExportButton";
import IndicatorCards from "@/components/IndicatorCards";
import PeriodPicker from "@/components/PeriodPicker";
import Warnings from "@/components/Warnings";
import { useAnalysis } from "@/hooks/useAnalysis";
import { formatDate } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

// Browser-only pieces: never rendered on the server
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-stone-200" />,
});
const CalendarHeatmap = dynamic(() => import("@/components/CalendarHeatmap"), { ssr: false });
const YearBars = dynamic(() => import("@/components/YearBars"), { ssr: false });

function Skeleton({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  return (
    <div className="space-y-3" aria-busy="true" aria-label={t.loading}>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-stone-200" />)}
      </div>
      <div className="h-24 animate-pulse rounded-lg bg-stone-200" />
      <div className="h-80 animate-pulse rounded-lg bg-stone-200" />
    </div>
  );
}

export default function Dashboard({ locale }: { locale: Locale }) {
  const a = useAnalysis();
  const t = getCopy(locale);

  return (
    <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      <section aria-label={t.map} className="h-[50vh] bg-stone-100 lg:h-auto lg:w-3/5">
        <Map
          boundary={a.meta?.pantanal_boundary ?? null}
          drawn={a.geometry}
          density={a.density}
          onDraw={a.setGeometry}
          onClear={a.clear}
          locale={locale}
        />
      </section>

      <aside aria-label={t.analysis} className="space-y-4 p-4 lg:w-2/5 lg:overflow-y-auto">
        {a.metaError && (
          <p role="alert" className="text-sm text-[#B4441B]">
            {t.apiError} ({a.metaError}). {t.waking}
          </p>
        )}

        {a.meta && (
          <PeriodPicker
            min={a.meta.period.start}
            max={a.meta.period.end}
            start={a.startDate}
            end={a.endDate}
            onChange={(s, e) => { a.setStartDate(s); a.setEndDate(e); }}
            locale={locale}
          />
        )}

        {a.status === "idle" && (
          <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-700">
            <p className="font-medium text-[#1C1A17]">{t.drawTitle}</p>
            <p className="mt-1">
              {t.drawHelp}
            </p>
          </div>
        )}

        {a.status === "loading" && <Skeleton locale={locale} />}

        {(a.status === "outside" || a.status === "error") && (
          <div role="alert" className="rounded-lg border border-[#A63C16]/40 bg-[#FBF1EC] p-4 text-sm text-[#1C1A17]">
            <p className="font-medium">
              {a.status === "outside" ? t.outside : t.error}
            </p>
            <p className="mt-1">{a.error}</p>
            {a.status === "outside" && <p className="mt-1">{t.drawInside}</p>}
          </div>
        )}

        {(a.status === "result" || a.status === "no_fire") && a.stats && a.query && (
          <>
            <Warnings items={a.stats.warnings} />
            <IndicatorCards stats={a.stats} locale={locale} />
            <AnomalyPanel lastMonth={a.stats.last_month} anomalies={a.stats.anomalies} locale={locale} />
            <CalendarHeatmap calendar={a.stats.calendar} lastMonth={a.stats.last_month} locale={locale} />
            <YearBars calendar={a.stats.calendar} worstYear={a.stats.indicators.worst_year?.year ?? null} locale={locale} />
            <ExportButton query={a.query} locale={locale} />
          </>
        )}

        {a.meta && (
          <p className="border-t border-stone-200 pt-3 text-xs text-stone-600">
            {t.dataUpTo} {formatDate(a.meta.data_cutoff, locale)} · {t.unit} · {t.source}: NASA FIRMS
            (MODIS Aqua and VIIRS S-NPP), {t.harmonized}.
          </p>
        )}
      </aside>
    </main>
  );
}
