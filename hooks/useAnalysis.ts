// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, getMeta, postDensity, postStats } from "@/lib/api";
import type { AreaQuery, Density, Geometry, Meta, Stats } from "@/lib/types";

export type Status = "idle" | "loading" | "result" | "no_fire" | "outside" | "error";

const DEBOUNCE_MS = 300;

/**
 * Holds the whole analysis state: /meta, the drawn area, the period,
 * and the /stats + /density results. Re-runs the analysis whenever the
 * area or the dates change (debounced), cancelling the previous request.
 */
export function useAnalysis() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [stats, setStats] = useState<Stats | null>(null);
  const [density, setDensity] = useState<Density | null>(null);
  const [error, setError] = useState<string | null>(null);

  const controller = useRef<AbortController | null>(null);

  // 1. /meta once, when the page opens
  useEffect(() => {
    getMeta()
      .then((m) => {
        setMeta(m);
        setStartDate(m.period.start);
        setEndDate(m.period.end);
      })
      .catch((e: Error) => setMetaError(e.message));
  }, []);

  // 2. /stats + /density whenever the area or the period changes
  useEffect(() => {
    if (!geometry || !startDate || !endDate || startDate > endDate) return;

    const timer = setTimeout(async () => {
      controller.current?.abort();
      const ctrl = new AbortController();
      controller.current = ctrl;

      const query: AreaQuery = { geometry, start_date: startDate, end_date: endDate };
      setStatus("loading");
      setError(null);
      try {
        const [s, d] = await Promise.all([
          postStats(query, ctrl.signal),
          postDensity(query, ctrl.signal),
        ]);
        if (ctrl.signal.aborted) return;
        setStats(s);
        setDensity(d);
        setStatus(s.indicators.total === 0 ? "no_fire" : "result");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setStats(null);
        setDensity(null);
        setError((e as Error).message);
        setStatus(e instanceof ApiError && e.status === 400 ? "outside" : "error");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [geometry, startDate, endDate]);

  const clear = useCallback(() => {
    controller.current?.abort();
    setGeometry(null);
    setStats(null);
    setDensity(null);
    setError(null);
    setStatus("idle");
  }, []);

  const query: AreaQuery | null =
    geometry && startDate && endDate ? { geometry, start_date: startDate, end_date: endDate } : null;

  return {
    meta, metaError,
    geometry, setGeometry,
    startDate, setStartDate, endDate, setEndDate,
    status, stats, density, error,
    query, clear,
  };
}
