// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";

import { BRAND, VIRIDIS, fmt } from "@/lib/format";
import type { Density, Geometry, Meta } from "@/lib/types";

// MapLibre 6 loads its worker from a separate file, served from /public
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

// Free vector basemap, no API key. Check the provider's terms before the demo.
const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE ?? "https://tiles.openfreemap.org/styles/positron";

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

type Mode = "none" | "polygon" | "rectangle";
type LngLat = [number, number];

interface Props {
  boundary: Meta["pantanal_boundary"] | null;
  drawn: Geometry | null;
  density: Density | null;
  onDraw: (geometry: Geometry) => void;
  onClear: () => void;
}

function bbox(geometry: GeoJSON.Geometry): [LngLat, LngLat] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (c: unknown): void => {
    if (Array.isArray(c) && typeof c[0] === "number") {
      const [x, y] = c as number[];
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    } else if (Array.isArray(c)) {
      c.forEach(visit);
    }
  };
  visit((geometry as GeoJSON.Polygon).coordinates);
  return [[minX, minY], [maxX, maxY]];
}

function rectangle(a: LngLat, b: LngLat): GeoJSON.Polygon {
  return {
    type: "Polygon",
    coordinates: [[a, [b[0], a[1]], b, [a[0], b[1]], a]],
  };
}

function setData(map: maplibregl.Map, id: string, data: GeoJSON.GeoJSON) {
  (map.getSource(id) as maplibregl.GeoJSONSource | undefined)?.setData(data);
}

export default function Map({ boundary, drawn, density, onDraw, onClear }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("none");

  // refs read inside map event handlers (registered once)
  const modeRef = useRef<Mode>("none");
  const pointsRef = useRef<LngLat[]>([]);
  const onDrawRef = useRef(onDraw);
  onDrawRef.current = onDraw;
  const fittedRef = useRef(false);

  // ------------------------------------------------------------- create the map once
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [-56.8, -18.5],
      zoom: 5.5,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      for (const id of ["boundary", "density", "drawn", "draft"]) {
        map.addSource(id, { type: "geojson", data: EMPTY });
      }
      map.addLayer({
        id: "density-fill", type: "fill", source: "density",
        paint: { "fill-color": VIRIDIS[2], "fill-opacity": 0.75, "fill-outline-color": "rgba(0,0,0,0)" },
      });
      map.addLayer({
        id: "boundary-line", type: "line", source: "boundary",
        paint: { "line-color": BRAND.leaf, "line-width": 2 },
      });
      map.addLayer({
        id: "drawn-fill", type: "fill", source: "drawn",
        paint: { "fill-color": BRAND.orange, "fill-opacity": 0.06 },
      });
      map.addLayer({
        id: "drawn-line", type: "line", source: "drawn",
        paint: { "line-color": BRAND.orange, "line-width": 2.5 },
      });
      map.addLayer({
        id: "draft-line", type: "line", source: "draft",
        paint: { "line-color": BRAND.orange, "line-width": 2, "line-dasharray": [2, 2] },
      });
      map.addLayer({
        id: "draft-points", type: "circle", source: "draft",
        filter: ["==", ["geometry-type"], "Point"],
        paint: { "circle-radius": 4, "circle-color": "#fff", "circle-stroke-color": BRAND.orange, "circle-stroke-width": 2 },
      });
      setReady(true);
    });

    const finish = (geometry: Geometry) => {
      setData(map, "draft", EMPTY);
      pointsRef.current = [];
      setMode("none");
      onDrawRef.current(geometry);
    };

    const drawDraft = (cursor?: LngLat) => {
      const pts = pointsRef.current;
      const features: GeoJSON.Feature[] = pts.map((p) => ({
        type: "Feature", properties: {}, geometry: { type: "Point", coordinates: p },
      }));
      if (modeRef.current === "polygon" && pts.length) {
        const line = cursor ? [...pts, cursor] : pts;
        if (line.length > 1) {
          features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: line } });
        }
      }
      if (modeRef.current === "rectangle" && pts.length === 1 && cursor) {
        features.push({ type: "Feature", properties: {}, geometry: rectangle(pts[0], cursor) });
      }
      setData(map, "draft", { type: "FeatureCollection", features });
    };

    map.on("click", (e) => {
      const mode = modeRef.current;
      if (mode === "none") return;
      const p: LngLat = [e.lngLat.lng, e.lngLat.lat];
      const pts = pointsRef.current;

      if (mode === "rectangle") {
        if (pts.length === 0) {
          pointsRef.current = [p];
          drawDraft(p);
        } else {
          finish(rectangle(pts[0], p));
        }
        return;
      }

      // polygon: ignore clicks on (almost) the same pixel as the previous point
      if (pts.length) {
        const last = map.project(pts[pts.length - 1]);
        if (Math.hypot(last.x - e.point.x, last.y - e.point.y) < 4) return;
        // clicking near the first point closes the polygon
        const first = map.project(pts[0]);
        if (pts.length >= 3 && Math.hypot(first.x - e.point.x, first.y - e.point.y) < 10) {
          finish({ type: "Polygon", coordinates: [[...pts, pts[0]]] });
          return;
        }
      }
      pointsRef.current = [...pts, p];
      drawDraft();
    });

    // double-click also closes the polygon
    map.on("dblclick", (e) => {
      if (modeRef.current !== "polygon") return;
      e.preventDefault();
      const pts = pointsRef.current;
      if (pts.length >= 3) finish({ type: "Polygon", coordinates: [[...pts, pts[0]]] });
    });

    map.on("mousemove", (e) => {
      if (modeRef.current === "none" || pointsRef.current.length === 0) return;
      drawDraft([e.lngLat.lng, e.lngLat.lat]);
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modeRef.current !== "none") {
        pointsRef.current = [];
        setData(map, "draft", EMPTY);
        setMode("none");
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ------------------------------------------------------------- drawing mode
  useEffect(() => {
    modeRef.current = mode;
    pointsRef.current = [];
    const map = mapRef.current;
    if (!map || !ready) return;
    setData(map, "draft", EMPTY);
    map.getCanvas().style.cursor = mode === "none" ? "" : "crosshair";
    if (mode === "none") map.doubleClickZoom.enable();
    else map.doubleClickZoom.disable();
  }, [mode, ready]);

  // ------------------------------------------------------------- Pantanal boundary
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !boundary) return;
    setData(map, "boundary", boundary);
    if (!fittedRef.current) {
      map.fitBounds(bbox(boundary.geometry), { padding: 24, duration: 0 });
      fittedRef.current = true;
    }
  }, [boundary, ready]);

  // ------------------------------------------------------------- drawn area
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    setData(map, "drawn", drawn ? { type: "Feature", properties: {}, geometry: drawn } : EMPTY);
  }, [drawn, ready]);

  // ------------------------------------------------------------- density
  const maxValue = density?.features.reduce((m, f) => Math.max(m, f.properties.value), 0) ?? 0;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    setData(map, "density", density ?? EMPTY);
    if (maxValue > 0) {
      // sqrt scale: a few very hot hexagons should not wash out the rest
      const s = Math.sqrt(maxValue);
      map.setPaintProperty("density-fill", "fill-color", [
        "interpolate", ["linear"], ["sqrt", ["get", "value"]],
        0, VIRIDIS[0], s * 0.25, VIRIDIS[1], s * 0.5, VIRIDIS[2], s * 0.75, VIRIDIS[3], s, VIRIDIS[4],
      ]);
    }
  }, [density, maxValue, ready]);

  const legend = maxValue > 0 ? [0, 0.25, 0.5, 0.75, 1].map((q) => (Math.sqrt(maxValue) * q) ** 2) : [];

  const toolButton = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(mode === m ? "none" : m)}
      aria-pressed={mode === m}
      className={`rounded-md px-3 py-2 text-sm font-medium shadow-sm transition ${
        mode === m ? "bg-[#D4501C] text-white" : "bg-white text-[#1C1A17] hover:bg-stone-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* drawing tools */}
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        {toolButton("polygon", "Polygon")}
        {toolButton("rectangle", "Rectangle")}
        {boundary && (
          <button
            type="button"
            onClick={() => { setMode("none"); onDraw(boundary.geometry); }}
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-[#1C1A17] shadow-sm hover:bg-stone-100"
          >
            Whole Pantanal
          </button>
        )}
        {drawn && (
          <button
            type="button"
            onClick={() => { setMode("none"); onClear(); }}
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-[#1C1A17] shadow-sm hover:bg-stone-100"
          >
            Clear
          </button>
        )}
      </div>

      {/* hint while drawing */}
      {mode !== "none" && (
        <p className="absolute bottom-3 left-3 rounded-md bg-[#1C1A17]/85 px-3 py-2 text-sm text-white">
          {mode === "polygon"
            ? "Click to add points. Double-click or click the first point to finish. Esc cancels."
            : "Click one corner, then the opposite corner. Esc cancels."}
        </p>
      )}

      {/* density legend */}
      {legend.length > 0 && mode === "none" && (
        <div className="absolute bottom-8 right-3 rounded-md bg-white/95 p-2 text-xs text-[#1C1A17] shadow-sm">
          <p className="mb-1 font-medium">Fire days per hexagon</p>
          <div className="flex items-center gap-1">
            {VIRIDIS.map((c, i) => (
              <div key={c} className="flex flex-col items-center">
                <span className="block h-3 w-8" style={{ background: c }} />
                <span className="mt-0.5 tabular-nums">{fmt(legend[i])}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
