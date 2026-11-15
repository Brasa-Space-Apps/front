// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import ReactECharts from "echarts-for-react";

import { BRAND, fmt, fmt0 } from "@/lib/format";
import type { MonthValue } from "@/lib/types";

export default function YearBars({ calendar, worstYear }: { calendar: MonthValue[]; worstYear: number | null }) {
  const byYear = new globalThis.Map<number, number>();
  for (const c of calendar) byYear.set(c.year, (byYear.get(c.year) ?? 0) + c.value);
  const years = Array.from(byYear.keys()).sort((a, b) => a - b);

  const option = {
    animationDuration: 550,
    animationEasing: "cubicOut",
    animationDelay: (idx: number) => idx * 20,
    grid: { left: 48, right: 12, top: 12, bottom: 28 },
    tooltip: {
      trigger: "axis",
      formatter: (ps: { name: string; value: number }[]) => `<b>${ps[0].name}</b><br/>${fmt(ps[0].value)} fire days`,
    },
    xAxis: { type: "category", data: years.map(String), axisTick: { show: false }, axisLabel: { interval: 1 } },
    yAxis: { type: "value", min: 0, axisLabel: { formatter: (v: number) => fmt0(v) } },
    series: [{
      type: "bar",
      data: years.map((y) => ({
        value: Math.round((byYear.get(y) ?? 0) * 10) / 10,
        itemStyle: { color: y === worstYear ? BRAND.orange : BRAND.grey, borderRadius: [2, 2, 0, 0] },
      })),
      emphasis: { itemStyle: { opacity: 0.85 } },
      barMaxWidth: 18,
    }],
  };

  return (
    <figure className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
      <figcaption className="mb-2 text-sm font-semibold text-[#1C1A17]">Fire activity per year</figcaption>
      <ReactECharts option={option} style={{ height: 220 }} notMerge
                    opts={{ renderer: "svg" }} aria-label="Sum of days with fire across all ~5 km² cells in the area" />
    </figure>
  );
}
