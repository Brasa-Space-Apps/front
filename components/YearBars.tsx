// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

import { fmt, fmt0 } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import { readThemeColors, subscribeToTheme, type ThemeColors } from "@/lib/theme";
import type { Locale, MonthValue } from "@/lib/types";

export default function YearBars({ calendar, worstYear, locale }: { calendar: MonthValue[]; worstYear: number | null; locale: Locale }) {
  const t = getCopy(locale);
  const [colors, setColors] = useState<ThemeColors>(readThemeColors);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const update = () => setColors(readThemeColors());
    update();
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return subscribeToTheme(update);
  }, []);
  const byYear = new globalThis.Map<number, number>();
  for (const c of calendar) byYear.set(c.year, (byYear.get(c.year) ?? 0) + c.value);
  const years = Array.from(byYear.keys()).sort((a, b) => a - b);

  const option = {
    animation: !reducedMotion,
    animationDuration: 550,
    animationEasing: "cubicOut",
    animationDelay: (idx: number) => idx * 20,
    textStyle: { color: colors.text },
    grid: { left: 48, right: 12, top: 12, bottom: 28 },
    tooltip: {
      trigger: "axis",
      formatter: (ps: { name: string; value: number }[]) => `<b>${ps[0].name}</b><br/>${fmt(ps[0].value, locale)} ${t.fireDaysMetric}`,
    },
    xAxis: {
      type: "category", data: years.map(String), axisTick: { show: false },
      axisLabel: { interval: 1, color: colors.muted }, axisLine: { lineStyle: { color: colors.border } },
    },
    yAxis: {
      type: "value", min: 0, axisLabel: { formatter: (v: number) => fmt0(v, locale), color: colors.muted },
      axisLine: { lineStyle: { color: colors.border } }, splitLine: { lineStyle: { color: colors.border } },
    },
    series: [{
      type: "bar",
      data: years.map((y) => ({
        value: Math.round((byYear.get(y) ?? 0) * 10) / 10,
        itemStyle: { color: y === worstYear ? colors.accent : colors.muted, borderRadius: [2, 2, 0, 0] },
      })),
      emphasis: { itemStyle: { opacity: 0.85 } },
      barMaxWidth: 18,
    }],
  };

  return (
    <figure className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
      <figcaption className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-fg">{t.activityPerYear}</figcaption>
      <ReactECharts option={option} style={{ height: 220 }} notMerge
                    opts={{ renderer: "svg" }} aria-label={t.chartYearLabel} />
    </figure>
  );
}