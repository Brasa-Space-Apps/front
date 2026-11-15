// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import { useEffect, useState } from "react";

import { MONTHS_LONG, fmt, fmt0, monthLabel } from "@/lib/format";
import type { Stats } from "@/lib/types";

function AnimatedInt({ target, suffix = "" }: { target: number; suffix?: string }) {
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

  return <>{fmt0(val)}{suffix}</>;
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
      className="animate-fade-in-up rounded-lg border border-stone-200 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs text-stone-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[#1C1A17]">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-stone-600">{detail}</p>}
    </div>
  );
}

export default function IndicatorCards({ stats }: { stats: Stats }) {
  const { indicators: ind, area } = stats;
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        delay={0}
        label="Fire days in the period"
        value={<AnimatedInt target={ind.total} />}
        detail={`${fmt(ind.annual_mean)} per year on average`}
      />
      <Card
        delay={50}
        label="Worst year"
        value={ind.worst_year ? String(ind.worst_year.year) : "—"}
        detail={ind.worst_year ? `${fmt0(ind.worst_year.value)} fire days` : "no fire in the period"}
      />
      <Card
        delay={100}
        label="Peak month"
        value={ind.peak_month ? monthLabel(ind.peak_month.year, ind.peak_month.month) : "—"}
        detail={ind.typical_peak_month ? `Fire season usually peaks in ${MONTHS_LONG[ind.typical_peak_month - 1]}` : undefined}
      />
      <Card
        delay={150}
        label="Area"
        value={<AnimatedInt target={area.km2} suffix=" km²" />}
        detail={`${fmt0(area.n_cells)} hexagons of ~5 km²`}
      />
    </div>
  );
}
