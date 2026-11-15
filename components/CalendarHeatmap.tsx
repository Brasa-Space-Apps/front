// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

import { MONTHS, MONTHS_PT, VIRIDIS, fmt, monthLabel } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import { readThemeColors, subscribeToTheme, type ThemeColors } from "@/lib/theme";
import type { Anomaly, Locale, MonthValue } from "@/lib/types";

interface Props {
  calendar: MonthValue[];
  lastMonth: Anomaly | null;
  locale: Locale;
  activeMonth?: { year: number; month: number } | null;
  onSelectMonth?: (year: number, month: number) => void;
  onClearMonth?: () => void;
}

/** Year x month heatmap. Colour uses log10(1 + value) so quiet months stay readable. */
export default function CalendarHeatmap({
  calendar,
  lastMonth,
  locale,
  activeMonth,
  onSelectMonth,
  onClearMonth,
}: Props) {
  const t = getCopy(locale);
  const [colors, setColors] = useState<ThemeColors>(readThemeColors);
  useEffect(() => {
    const update = () => setColors(readThemeColors());
    update();
    return subscribeToTheme(update);
  }, []);

  const years = Array.from(new Set(calendar.map((c) => c.year))).sort((a, b) => a - b);
  const max = calendar.reduce((m, c) => Math.max(m, c.value), 0);
  const logMax = Math.log10(1 + max) || 1;

  const data = calendar.map((c) => {
    const isLast = lastMonth && c.year === lastMonth.year && c.month === lastMonth.month;
    return {
      value: [c.month - 1, years.indexOf(c.year), Math.log10(1 + c.value), c.value, c.year, c.month],
      itemStyle: isLast ? { borderColor: colors.accent, borderWidth: 2 } : undefined,
    };
  });

  const option = {
    animation: false,
    grid: { left: 44, right: 12, top: 8, bottom: 64 },
    tooltip: {
      formatter: (p: { value: number[] }) => {
        const head = `<b>${monthLabel(p.value[4], p.value[5], locale)}</b><br/>${fmt(p.value[3], locale)} ${t.fireDaysMetric}`;
        if (!onSelectMonth) return head;
        const isSelected = activeMonth && p.value[4] === activeMonth.year && p.value[5] === activeMonth.month;
        return `${head}<br/><span style="opacity:0.75;font-size:11px">${isSelected ? t.clickToRestore : t.clickToFilter}</span>`;
      },
    },
    textStyle: { color: colors.text },
    xAxis: {
      type: "category", data: locale === "pt-BR" ? MONTHS_PT : MONTHS, splitArea: { show: false },
      axisTick: { show: false }, axisLabel: { color: colors.muted }, axisLine: { lineStyle: { color: colors.border } },
    },
    yAxis: {
      type: "category", data: years.map(String), inverse: true, axisTick: { show: false },
      axisLabel: { color: colors.muted }, axisLine: { lineStyle: { color: colors.border } },
    },
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
      textStyle: { color: colors.muted },
      calculable: false,
      formatter: (v: number) => fmt(10 ** v - 1, locale),
    },
    series: [{
      type: "heatmap",
      cursor: onSelectMonth ? "pointer" : "default",
      data,
      itemStyle: { borderColor: colors.surface, borderWidth: 1 },
      emphasis: { itemStyle: { borderColor: colors.text, borderWidth: 1.5 } },
    }],
  };

  const onEvents = onSelectMonth
    ? {
        click: (params: { componentType?: string; value?: unknown }) => {
          if (params.componentType !== "series" || !Array.isArray(params.value)) return;
          const year = Number(params.value[4]);
          const month = Number(params.value[5]);
          if (Number.isFinite(year) && Number.isFinite(month)) {
            onSelectMonth(year, month);
          }
        },
      }
    : undefined;

  const height = Math.max(220, years.length * 18 + 90);

  return (
    <figure className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-xs font-semibold uppercase tracking-[0.12em] text-fg">{t.calendar}</figcaption>
        {activeMonth && onClearMonth && (
          <button
            type="button"
            onClick={onClearMonth}
            className="animate-fade-in cursor-pointer rounded-full border border-[#D4501C]/40 bg-[#FBF1EC] px-2.5 py-0.5 text-xs font-medium text-[#B4441B] transition-colors hover:bg-[#F5E1D6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4501C]"
          >
            {monthLabel(activeMonth.year, activeMonth.month, locale)} · {t.backToPrevious} <span aria-hidden>✕</span>
          </button>
        )}
      </div>
      <p className="mb-2 text-xs text-muted">{t.calendarHelp}</p>
      <ReactECharts option={option} onEvents={onEvents} style={{ height }} notMerge
                    opts={{ renderer: "svg" }} aria-label={`${t.calendar}: ${t.fireDaysMetric}`} />
    </figure>
  );
}