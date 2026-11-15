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

// Browser-only pieces: never rendered on the server
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-stone-200" />,
});
const CalendarHeatmap = dynamic(() => import("@/components/CalendarHeatmap"), { ssr: false });
const YearBars = dynamic(() => import("@/components/YearBars"), { ssr: false });

function Skeleton() {
  return (
    <div className="animate-fade-in space-y-4" aria-busy="true" aria-label="Loading analysis">
      <p role="status" className="text-xs text-stone-600">
        Analysing selected area…
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-stone-200" />)}
      </div>
      <div className="h-24 animate-pulse rounded-lg bg-stone-200" />
      <div className="h-80 animate-pulse rounded-lg bg-stone-200" />
    </div>
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

export default function Dashboard() {
  const a = useAnalysis();
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

  return (
    <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <section
        aria-label="Map of the Brazilian Pantanal"
        className="h-[50vh] overflow-hidden bg-stone-100 lg:h-full lg:w-3/5"
      >
        <Map
          boundary={a.meta?.pantanal_boundary ?? null}
          drawn={a.geometry}
          density={a.density}
          onDraw={a.setGeometry}
          onClear={() => { setMonthFilter(null); a.clear(); }}
        />
      </section>

      <aside aria-label="Analysis panel" className="panel-scroll space-y-4 p-4 lg:h-full lg:w-2/5 lg:overflow-y-auto">
        {a.metaError && (
          <p role="alert" className="animate-fade-in text-sm text-[#B4441B]">
            Could not reach the API ({a.metaError}). It may be waking up: try again in a minute.
          </p>
        )}

        {a.meta && (
          <PeriodPicker
            min={a.meta.period.start}
            max={a.meta.period.end}
            start={a.startDate}
            end={a.endDate}
            onChange={(s, e) => { setMonthFilter(null); a.setStartDate(s); a.setEndDate(e); }}
          />
        )}

        {a.status === "idle" && (
          <div className="animate-fade-in rounded-lg border border-dashed border-stone-300 bg-white/50 p-4 text-sm text-stone-700">
            <p className="font-medium text-[#1C1A17]">Draw an area to see its fire history</p>
            <p className="mt-1.5 leading-relaxed">
              Use <span className="rounded bg-stone-200/80 px-1.5 py-0.5 text-xs font-medium text-[#1C1A17]">Polygon</span> or{" "}
              <span className="rounded bg-stone-200/80 px-1.5 py-0.5 text-xs font-medium text-[#1C1A17]">Rectangle</span> on the map,
              inside the green outline of the Brazilian Pantanal, or click{" "}
              <span className="rounded bg-stone-200/80 px-1.5 py-0.5 text-xs font-medium text-[#1C1A17]">Whole Pantanal</span>.
            </p>
          </div>
        )}

        {a.status === "loading" && (
          <>
            {a.slow && (
              <p role="status" className="text-sm text-stone-600">
                Waking up the server. The first request can take up to a minute…
              </p>
            )}
            <Skeleton />
          </>
        )}

        {(a.status === "outside" || a.status === "error") && (
          <div role="alert" className="animate-fade-in-up rounded-lg border border-[#D4501C]/40 bg-[#FBF1EC] p-4 text-sm text-[#1C1A17]">
            <p className="font-medium">
              {a.status === "outside" ? "This area can't be analysed" : "Something went wrong"}
            </p>
            <p className="mt-1">{a.error}</p>
            <button
              onClick={a.retry}
              className="mt-3 rounded-md bg-[#D4501C] px-3 py-1.5 font-medium text-white hover:bg-[#B4441B]"
            >
              Try again
            </button>
          </div>
        )}

        {a.status === "no_fire" && (
          <div role="status" className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-[#1C1A17]">
            <p className="font-medium">No fire recorded</p>
            <p className="mt-1">
              No fire was detected in this area during the selected period. Try a longer period or a larger area.
            </p>
          </div>
        )}

        {(a.status === "result" || a.status === "no_fire") && a.stats && a.query && (
          <div className="animate-fade-in-up space-y-4">
            {a.status === "no_fire" && (
              <p role="status" className="rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-700">
                No fire activity was recorded in this area during the selected period.
              </p>
            )}
            <Warnings items={a.stats.warnings} />
            <IndicatorCards stats={a.stats} />
            <AnomalyPanel lastMonth={a.stats.last_month} anomalies={a.stats.anomalies} />
            <CalendarHeatmap
              calendar={a.stats.calendar}
              lastMonth={a.stats.last_month}
              activeMonth={monthFilter ? { year: monthFilter.year, month: monthFilter.month } : null}
              onSelectMonth={handleSelectMonth}
              onClearMonth={handleClearMonth}
            />
            <YearBars calendar={a.stats.calendar} worstYear={a.stats.indicators.worst_year?.year ?? null} />
            <ExportButton query={a.query} />
          </div>
        )}

        {a.meta && (
          <p className="border-t border-stone-200 pt-3 text-xs text-stone-600">
            Data up to {formatDate(a.meta.data_cutoff)} · Unit: {a.meta.unit} · Source: NASA FIRMS
            (MODIS Aqua and VIIRS S-NPP), harmonized.
          </p>
        )}
      </aside>
    </main>
  );
}