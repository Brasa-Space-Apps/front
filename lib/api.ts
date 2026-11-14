import type { Density, Meta, Query, Stats } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "1";

export class ApiError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Returns a mock after 400 ms to simulate the network
async function mock<T>(load: () => Promise<{ default: unknown }>): Promise<T> {
  await wait(400);
  return (await load()).default as T;
}

async function post<T>(route: string, body: Query, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(res.status, error.detail ?? "Erro inesperado");
  }
  return res.json();
}

export async function getMeta(): Promise<Meta> {
  if (USE_MOCK) return mock<Meta>(() => import("@/mocks/meta.json"));
  const res = await fetch(`${API}/meta`);
  if (!res.ok) throw new ApiError(res.status, "Falha ao carregar os metadados");
  return res.json();
}

export const postStats = (q: Query, signal?: AbortSignal): Promise<Stats> =>
  USE_MOCK
    ? mock<Stats>(() => import("@/mocks/stats.json"))
    : post<Stats>("/stats", q, signal);

export const postDensity = (q: Query, signal?: AbortSignal): Promise<Density> =>
  USE_MOCK
    ? mock<Density>(() => import("@/mocks/density.json"))
    : post<Density>("/density", q, signal);

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
  });
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadCsv(q: Query) {
  const filename = `brasa_${q.start_date}_${q.end_date}.csv`;

  if (USE_MOCK) {
    await wait(400);
    const csv =
      "data,hora_utc,latitude,longitude,satelite,confianca,frp,dia_noite,h3,fator\n" +
      "2020-09-14,1712,-18.9123,-57.3310,SNPP,n,12.4,D,8761a4b2cffffff,1.0\n";
    return saveBlob(new Blob([csv], { type: "text/csv" }), filename);
  }

  const res = await fetch(`${API}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(q),
  });
  if (!res.ok) throw new ApiError(res.status, "Falha ao gerar o CSV");
  saveBlob(await res.blob(), filename);
}