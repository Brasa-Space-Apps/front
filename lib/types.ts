import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";
export type Geometry = Polygon;

export interface Query {
  geometry: Geometry;
  start_date: string;
  end_date: string;
}

export interface Meta {
  period: { start: string; end: string };
  cutoff_date: string;
  unit: string;
  pantanal_boundary: Feature<Polygon | MultiPolygon>;
  c1day_factors: Record<string, number>;
}

export interface CalendarCell {
  year: number;
  month: number;
  value: number;
}

export interface Anomaly extends CalendarCell {
  median: number;
  ratio: number | null;
  percentile: number;
}

export interface Stats {
  area: { km2: number; clipped: boolean; n_cells: number };
  period: { start: string; end: string };
  indicators: {
    total: number;
    annual_mean: number;
    worst_year: { year: number; value: number };
    peak_month: { year: number; month: number; value: number };
    typical_peak_month: number;
  };
  calendar: CalendarCell[];
  anomalies: Anomaly[];
  last_month: Anomaly;
  warnings: string[];
}

export type Density = FeatureCollection<
  Polygon,
  { h3: string; value: number }
>;