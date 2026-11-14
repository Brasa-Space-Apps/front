import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";

export type Geometry = Polygon | MultiPolygon;

export interface AreaQuery {
  geometry: Geometry;
  start_date: string;
  end_date: string;
}

export interface Period {
  start: string;
  end: string;
}

export interface Meta {
  period: Period;
  data_cutoff: string;
  unit: string;
  pantanal_boundary: Feature<GeoJSON.Polygon | MultiPolygon>;
  factors: Record<string, number>; // "1".."12"
}

export interface MonthValue {
  year: number;
  month: number;
  value: number;
}

export interface Anomaly extends MonthValue {
  median: number;
  ratio: number | null;
  percentile: number;
}

export interface Stats {
  area: { km2: number; clipped: boolean; n_cells: number };
  period: Period;
  indicators: {
    total: number;
    annual_mean: number;
    worst_year: { year: number; value: number } | null;
    peak_month: MonthValue | null;
    typical_peak_month: number | null;
  };
  calendar: MonthValue[];
  anomalies: Anomaly[]; // every month in the period
  last_month: Anomaly | null;
  warnings: string[];
}

export type Density = FeatureCollection<
  Polygon,
  { h3: string; value: number }
>;