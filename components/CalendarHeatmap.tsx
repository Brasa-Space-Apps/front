// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import ReactECharts from "echarts-for-react";

import { BRAND, MONTHS, MONTHS_PT, VIRIDIS, fmt, monthLabel } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import type { Anomaly, Locale, MonthValue } from "@/lib/types";

interface Props {
  calendar: MonthValue[];
  lastMonth: Anomaly | null;
  locale: Locale;
}

/** Year x month heatmap. Colour uses log10(1 + value) so quiet months stay readable. */
export default function CalendarHeatmap({ calendar, lastMonth, locale }: Props) {
  const t = getCopy(locale);
  const years = Array.from(new Set(calendar.map((c) => c.year))).sort((a, b) => a - b);
  const max = calendar.reduce((m, c) => Math.max(m, c.value), 0);
  const logMax = Math.log10(1 + max) || 1;

  const data = calendar.map((c) => {
    const isLast = lastMonth && c.year === lastMonth.year && c.month === lastMonth.month;
    return {
      value: [c.month - 1, years.indexOf(c.year), Math.log10(1 + c.value), c.value, c.year, c.month],
      itemStyle: isLast ? { borderColor: BRAND.orange, borderWidth: 2 } : undefined,
    };
  });

  const option = {
    animation: false,
    grid: { left: 44, right: 12, top: 8, bottom: 64 },
    tooltip: {
      formatter: (p: { value: number[] }) =>
        `<b>${monthLabel(p.value[4], p.value[5], locale)}</b><br/>${fmt(p.value[3], locale)} ${t.fireDaysMetric}`,
    },
    xAxis: { type: "category", data: locale === "pt-BR" ? MONTHS_PT : MONTHS, splitArea: { show: false }, axisTick: { show: false } },
    yAxis: { type: "category", data: years.map(String), inverse: true, axisTick: { show: false } },
    visualMap: {
      type: "continuous",
      dimension: 2,
      min: 0,
      max: logMax,
      inRange: { color: VIRIDIS },
      orient: "horizontal",
      left: "center",
      bottom: 4,
      itemHeight: 160,
      text: [`${fmt(max, locale)} ${t.fireDaysMetric}`, "0"],
      calculable: false,
      formatter: (v: number) => fmt(10 ** v - 1, locale),
    },
    series: [{
      type: "heatmap",
      data,
      itemStyle: { borderColor: "#fff", borderWidth: 1 },
      emphasis: { itemStyle: { borderColor: BRAND.ink, borderWidth: 1.5 } },
    }],
  };

  const height = Math.max(220, years.length * 18 + 90);

  return (
    <figure>
      <figcaption className="mb-1 text-sm font-semibold text-[#1C1A17]">{t.calendar}</figcaption>
      <p className="mb-2 text-xs text-stone-600">
        {t.calendarHelp}
      </p>
      <ReactECharts option={option} style={{ height }} notMerge
                    opts={{ renderer: "svg" }} aria-label={`${t.calendar}: ${t.fireDaysMetric}`} />
    </figure>
  );
}
