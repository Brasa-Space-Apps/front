// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, getMeta, postDensity, postStats } from "@/lib/api";
import type { AreaQuery, Density, Geometry, Meta, Stats } from "@/lib/types";

export type Status = "idle" | "loading" | "result" | "no_fire" | "outside" | "error";
export type MetaStatus = "loading" | "waking" | "ready" | "failed";

const DEBOUNCE_MS = 300;
const META_RETRY_DELAYS = [2000, 5000, 10000, 20000, 30000];
const ANALYSIS_RETRY_DELAY = 1000;

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function isNetworkError(error: unknown) {
  return !isAbortError(error) && !(error instanceof ApiError);
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("The operation was aborted", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
  });
}

/**
 * Holds the whole analysis state: /meta, the drawn area, the period,
 * and the /stats + /density results. Re-runs the analysis whenever the
 * area or the dates change (debounced), cancelling the previous request.
 */
export function useAnalysis() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaStatus, setMetaStatus] = useState<MetaStatus>("loading");
  const [metaRetry, setMetaRetry] = useState(0);

  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [stats, setStats] = useState<Stats | null>(null);
  const [density, setDensity] = useState<Density | null>(null);
  const [error, setError] = useState<string | null>(null);

  const controller = useRef<AbortController | null>(null);

  // 1. /meta with bounded retries for sleeping/unreachable servers
  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    async function loadMeta() {
      setMetaStatus("loading");
      setMetaError(null);
      for (let attempt = 0; attempt <= META_RETRY_DELAYS.length; attempt += 1) {
        try {
          const m = await getMeta(ctrl.signal);
          if (cancelled) return;
          setMeta(m);
          setStartDate(m.period.start);
          setEndDate(m.period.end);
          setMetaStatus("ready");
          return;
        } catch (e) {
          if (cancelled || isAbortError(e)) return;
          const delay = META_RETRY_DELAYS[attempt];
          if (!isNetworkError(e) || delay === undefined) {
            setMetaError(e instanceof Error ? e.message : String(e));
            setMetaStatus("failed");
            return;
          }
          setMetaStatus("waking");
          try {
            await wait(delay, ctrl.signal);
          } catch {
            return;
          }
        }
      }
    }

    void loadMeta();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [metaRetry]);

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
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const [s, d] = await Promise.all([
            postStats(query, ctrl.signal),
            postDensity(query, ctrl.signal),
          ]);
          if (ctrl.signal.aborted) return;
          setStats(s);
          setDensity(d);
          setStatus(s.indicators.total === 0 ? "no_fire" : "result");
          return;
        } catch (e) {
          if (isAbortError(e)) return;
          if (attempt === 0 && isNetworkError(e)) {
            try {
              await wait(ANALYSIS_RETRY_DELAY, ctrl.signal);
              continue;
            } catch {
              return;
            }
          }
          setStats(null);
          setDensity(null);
          setError(e instanceof Error ? e.message : String(e));
          setStatus(e instanceof ApiError && e.status === 400 ? "outside" : "error");
          return;
        }
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
    meta, metaError, metaStatus, retryMeta: () => setMetaRetry((value) => value + 1),
    geometry, setGeometry,
    startDate, setStartDate, endDate, setEndDate,
    status, stats, density, error,
    query, clear,
  };
}
