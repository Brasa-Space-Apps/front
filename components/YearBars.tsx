// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import ReactECharts from "echarts-for-react";

import { BRAND, fmt, fmt0 } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import type { Locale, MonthValue } from "@/lib/types";

export default function YearBars({ calendar, worstYear, locale }: { calendar: MonthValue[]; worstYear: number | null; locale: Locale }) {
  const t = getCopy(locale);
  const byYear = new globalThis.Map<number, number>();
  for (const c of calendar) byYear.set(c.year, (byYear.get(c.year) ?? 0) + c.value);
  const years = Array.from(byYear.keys()).sort((a, b) => a - b);

  const option = {
    animation: false,
    grid: { left: 48, right: 12, top: 12, bottom: 28 },
    tooltip: {
      trigger: "axis",
      formatter: (ps: { name: string; value: number }[]) => `<b>${ps[0].name}</b><br/>${fmt(ps[0].value, locale)} ${t.fireDaysMetric}`,
    },
    xAxis: { type: "category", data: years.map(String), axisTick: { show: false }, axisLabel: { interval: 1 } },
    yAxis: { type: "value", min: 0, axisLabel: { formatter: (v: number) => fmt0(v, locale) } },
    series: [{
      type: "bar",
      data: years.map((y) => ({
        value: Math.round((byYear.get(y) ?? 0) * 10) / 10,
        itemStyle: { color: y === worstYear ? BRAND.orange : BRAND.grey },
      })),
      barMaxWidth: 18,
    }],
  };

  return (
    <figure>
      <figcaption className="mb-2 text-sm font-semibold text-[#1C1A17]">{t.activityPerYear}</figcaption>
      <ReactECharts option={option} style={{ height: 220 }} notMerge
                    opts={{ renderer: "svg" }} aria-label={t.chartYearLabel} />
    </figure>
  );
}
