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

// Browser-only pieces: never rendered on the server
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-stone-200" />,
});
const CalendarHeatmap = dynamic(() => import("@/components/CalendarHeatmap"), { ssr: false });
const YearBars = dynamic(() => import("@/components/YearBars"), { ssr: false });

function Skeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-stone-200" />)}
      </div>
      <div className="h-24 animate-pulse rounded-lg bg-stone-200" />
      <div className="h-80 animate-pulse rounded-lg bg-stone-200" />
    </div>
  );
}

export default function Dashboard() {
  const a = useAnalysis();

  return (
    <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      <section aria-label="Map of the Brazilian Pantanal" className="h-[50vh] bg-stone-100 lg:h-auto lg:w-3/5">
        <Map
          boundary={a.meta?.pantanal_boundary ?? null}
          drawn={a.geometry}
          density={a.density}
          onDraw={a.setGeometry}
          onClear={a.clear}
        />
      </section>

      <aside aria-label="Analysis panel" className="space-y-4 p-4 lg:w-2/5 lg:overflow-y-auto">
        {a.metaError && (
          <p role="alert" className="text-sm text-[#B4441B]">
            Could not reach the API ({a.metaError}). It may be waking up: try again in a minute.
          </p>
        )}

        {a.meta && (
          <PeriodPicker
            min={a.meta.period.start}
            max={a.meta.period.end}
            start={a.startDate}
            end={a.endDate}
            onChange={(s, e) => { a.setStartDate(s); a.setEndDate(e); }}
          />
        )}

        {a.status === "idle" && (
          <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-700">
            <p className="font-medium text-[#1C1A17]">Draw an area to see its fire history</p>
            <p className="mt-1">
              Use <b>Polygon</b> or <b>Rectangle</b> on the map, inside the green outline of the Brazilian Pantanal,
              or click <b>Whole Pantanal</b>.
            </p>
          </div>
        )}

        {a.status === "loading" && <Skeleton />}

        {(a.status === "outside" || a.status === "error") && (
          <div role="alert" className="rounded-lg border border-[#D4501C]/40 bg-[#FBF1EC] p-4 text-sm text-[#1C1A17]">
            <p className="font-medium">
              {a.status === "outside" ? "This area can't be analysed" : "Something went wrong"}
            </p>
            <p className="mt-1">{a.error}</p>
            {a.status === "outside" && <p className="mt-1">Draw inside the green outline of the Brazilian Pantanal.</p>}
          </div>
        )}

        {(a.status === "result" || a.status === "no_fire") && a.stats && a.query && (
          <>
            <Warnings items={a.stats.warnings} />
            <IndicatorCards stats={a.stats} />
            <AnomalyPanel lastMonth={a.stats.last_month} anomalies={a.stats.anomalies} />
            <CalendarHeatmap calendar={a.stats.calendar} lastMonth={a.stats.last_month} />
            <YearBars calendar={a.stats.calendar} worstYear={a.stats.indicators.worst_year?.year ?? null} />
            <ExportButton query={a.query} />
          </>
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
