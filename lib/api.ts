// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
import type { AreaQuery, Density, Meta, Stats } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "1";
const MOCK_DELAY_MS = 400;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function mock<T>(load: () => Promise<{ default: unknown }>): Promise<T> {
  await wait(MOCK_DELAY_MS);
  return (await load()).default as T;
}

async function post<T>(route: string, body: AreaQuery, signal?: AbortSignal): Promise<T> {
  const r = await fetch(`${API}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    const message = typeof err.detail === "string" ? err.detail : "Unexpected error";
    throw new ApiError(r.status, message);
  }
  return r.json();
}

export async function getMeta(): Promise<Meta> {
  if (USE_MOCK) return mock<Meta>(() => import("@/mocks/meta.json"));
  const r = await fetch(`${API}/meta`);
  if (!r.ok) throw new ApiError(r.status, "Could not load /meta");
  return r.json();
}

export function postStats(q: AreaQuery, signal?: AbortSignal): Promise<Stats> {
  if (USE_MOCK) return mock<Stats>(() => import("@/mocks/stats.json"));
  return post<Stats>("/stats", q, signal);
}

export function postDensity(q: AreaQuery, signal?: AbortSignal): Promise<Density> {
  if (USE_MOCK) return mock<Density>(() => import("@/mocks/density.json"));
  return post<Density>("/density", q, signal);
}

export async function downloadCsv(q: AreaQuery): Promise<void> {
  let blob: Blob;
  if (USE_MOCK) {
    await wait(MOCK_DELAY_MS);
    blob = new Blob(
      [
        "date,time_utc,latitude,longitude,satellite,confidence,frp,day_night,h3,factor\n" +
          "2020-09-14,1712,-18.9123,-57.3310,SNPP,n,12.4,D,8761a4b2cffffff,1.0\n",
      ],
      { type: "text/csv" },
    );
  } else {
    const r = await fetch(`${API}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(q),
    });
    if (!r.ok) throw new ApiError(r.status, "Could not generate the CSV");
    blob = await r.blob();
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: `brasa_hotspots_${q.start_date}_${q.end_date}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}
