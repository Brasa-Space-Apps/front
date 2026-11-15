// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";

import { BRAND, VIRIDIS, fmt } from "@/lib/format";
import { getCopy } from "@/lib/i18n";
import { PANTANAL_BOUNDARY } from "@/lib/pantanal-boundary";
import { readThemeColors } from "@/lib/theme";
import type { Density, Geometry, Locale, Meta } from "@/lib/types";

// MapLibre 6 loads its worker from a separate file, served from /public
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

// Free vector basemap, no API key. Check the provider's terms before the demo.
const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE ?? "https://tiles.openfreemap.org/styles/positron";
const DARK_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_DARK ?? STYLE_URL;

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

type Mode = "none" | "polygon" | "rectangle";
type LngLat = [number, number];
const FALLBACK_BOUNDS: [LngLat, LngLat] = [[-59.5, -22.5], [-54.5, -15.5]];
type ToolIconName = "polygon" | "rectangle" | "region" | "clear" | "undo" | "cancel";

interface Props {
  boundary: Meta["pantanal_boundary"] | null;
  drawn: Geometry | null;
  density: Density | null;
  onDraw: (geometry: Geometry) => void;
  onClear: () => void;
  locale: Locale;
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

function safeBbox(geometry: GeoJSON.Geometry): [LngLat, LngLat] {
  const bounds = bbox(geometry);
  return bounds.flat().every(Number.isFinite) ? bounds : FALLBACK_BOUNDS;
}

function ToolIcon({ name }: { name: ToolIconName }) {
  const content = {
    polygon: <><path d="m4 5 7-2 9 5-3 12-10-2-3-7Z" /><path d="m4 5 7 6 9-3M11 11l-1 7" /></>,
    rectangle: <><rect x="4" y="5" width="16" height="14" rx="1" /><path d="M8 5v14M16 5v14" /></>,
    region: <><path d="m4 6 5-2 4 2 6-2 1 14-6 2-5-2-5 2Z" /><path d="m9 4 1 14M13 6v14" /></>,
    clear: <><path d="M5 7h14M10 11v6M14 11v6" /><path d="m7 7 1 13h8l1-13M9 7l1-3h4l1 3" /></>,
    undo: <><path d="M9 8 5 12l4 4" /><path d="M5 12h8a5 5 0 0 1 5 5" /></>,
    cancel: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }[name];
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {content}
    </svg>
  );
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

function addOverlayLayers(map: maplibregl.Map) {
  const colors = readThemeColors();
  for (const id of ["boundary", "density", "drawn", "draft"]) {
    if (!map.getSource(id)) map.addSource(id, { type: "geojson", data: EMPTY });
  }
  if (!map.getLayer("density-fill")) {
    map.addLayer({
      id: "density-fill", type: "fill", source: "density",
      paint: { "fill-color": VIRIDIS[2], "fill-opacity": 0.75, "fill-outline-color": "transparent" },
    });
  }
  if (!map.getLayer("boundary-line")) {
    map.addLayer({
      id: "boundary-line", type: "line", source: "boundary",
      paint: { "line-color": BRAND.leaf, "line-width": 2 },
    });
  }
  if (!map.getLayer("drawn-fill")) {
    map.addLayer({
      id: "drawn-fill", type: "fill", source: "drawn",
      paint: { "fill-color": colors.accent, "fill-opacity": 0.06 },
    });
  }
  if (!map.getLayer("drawn-line")) {
    map.addLayer({
      id: "drawn-line", type: "line", source: "drawn",
      paint: { "line-color": colors.accent, "line-width": 2.5 },
    });
  }
  if (!map.getLayer("draft-line")) {
    map.addLayer({
      id: "draft-line", type: "line", source: "draft",
      paint: { "line-color": colors.accent, "line-width": 2, "line-dasharray": [2, 2] },
    });
  }
  if (!map.getLayer("draft-points")) {
    map.addLayer({
      id: "draft-points", type: "circle", source: "draft",
      filter: ["==", ["geometry-type"], "Point"],
      paint: { "circle-radius": 4, "circle-color": colors.surface, "circle-stroke-color": colors.accent, "circle-stroke-width": 2 },
    });
  }
}

export default function Map({ boundary, drawn, density, onDraw, onClear, locale }: Props) {
  const t = getCopy(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const initialBoundaryRef = useRef(boundary ?? PANTANAL_BOUNDARY);
  const lastBoundaryRef = useRef<Meta["pantanal_boundary"] | null>(null);
  const userInteractedRef = useRef(false);
  const styleLoadingRef = useRef(false);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("none");
  const [pointCount, setPointCount] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "dark"
      ? "dark"
      : "light",
  );

  // refs read inside map event handlers (registered once)
  const modeRef = useRef<Mode>("none");
  const pointsRef = useRef<LngLat[]>([]);
  const redrawDraftRef = useRef<() => void>(() => {});
  const onDrawRef = useRef(onDraw);
  const fittedRef = useRef(false);

  useEffect(() => {
    onDrawRef.current = onDraw;
  }, [onDraw]);

  // ------------------------------------------------------------- create the map once
  useEffect(() => {
    if (!containerRef.current) return;
    const initialBoundary = initialBoundaryRef.current;
    const initialBounds = safeBbox(initialBoundary.geometry);
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: document.documentElement.dataset.theme === "dark" ? DARK_STYLE_URL : STYLE_URL,
      bounds: initialBounds,
      fitBoundsOptions: { padding: 24, duration: 0 },
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    const markUserInteraction = () => { userInteractedRef.current = true; };
    map.on("dragstart", markUserInteraction);
    map.on("rotatestart", markUserInteraction);
    map.on("pitchstart", markUserInteraction);
    map.getCanvas().addEventListener("wheel", markUserInteraction);
    map.getCanvas().addEventListener("touchstart", markUserInteraction);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    map.on("load", () => {
      addOverlayLayers(map);
      styleLoadingRef.current = false;
      readyRef.current = true;
      setReady(true);
    });

    const finish = (geometry: Geometry) => {
      setData(map, "draft", EMPTY);
      pointsRef.current = [];
      setPointCount(0);
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
    redrawDraftRef.current = () => drawDraft();

    map.on("click", (e) => {
      const mode = modeRef.current;
      if (mode === "none") return;
      const p: LngLat = [e.lngLat.lng, e.lngLat.lat];
      const pts = pointsRef.current;

      if (mode === "rectangle") {
        if (pts.length === 0) {
          pointsRef.current = [p];
          setPointCount(1);
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
      setPointCount(pointsRef.current.length);
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
        setPointCount(0);
        setData(map, "draft", EMPTY);
        setMode("none");
        return;
      }
      const undo = e.key === "Backspace" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z");
      if (undo && modeRef.current !== "none" && pointsRef.current.length > 0) {
        e.preventDefault();
        pointsRef.current = pointsRef.current.slice(0, -1);
        setPointCount(pointsRef.current.length);
        redrawDraftRef.current();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      resizeObserver.disconnect();
      map.getCanvas().removeEventListener("wheel", markUserInteraction);
      map.getCanvas().removeEventListener("touchstart", markUserInteraction);
      window.removeEventListener("keydown", onKey);
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
      redrawDraftRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    const onThemeChange = () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    };
    window.addEventListener("brasa-theme", onThemeChange);
    return () => window.removeEventListener("brasa-theme", onThemeChange);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    styleLoadingRef.current = true;
    map.once("style.load", () => {
      addOverlayLayers(map);
      styleLoadingRef.current = false;
      setReady(true);
    });
    map.setStyle(theme === "dark" ? DARK_STYLE_URL : STYLE_URL);
  }, [theme]);

  // ------------------------------------------------------------- drawing mode
  useEffect(() => {
    modeRef.current = mode;
    pointsRef.current = [];
    const map = mapRef.current;
    if (!map || !ready || styleLoadingRef.current) return;
    setData(map, "draft", EMPTY);
    map.getCanvas().style.cursor = mode === "none" ? "" : "crosshair";
    if (mode === "none") map.doubleClickZoom.enable();
    else map.doubleClickZoom.disable();
  }, [mode, ready]);

  // ------------------------------------------------------------- Pantanal boundary
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || styleLoadingRef.current || !boundary) return;
    setData(map, "boundary", boundary);
    const boundaryChanged = lastBoundaryRef.current !== null && lastBoundaryRef.current !== boundary;
    if ((boundaryChanged || !fittedRef.current) && !userInteractedRef.current) {
      if (boundaryChanged || boundary === initialBoundaryRef.current) {
        map.fitBounds(safeBbox(boundary.geometry), { padding: 24, duration: 0 });
      }
    }
    lastBoundaryRef.current = boundary;
    if (!fittedRef.current) {
      fittedRef.current = true;
    }
  }, [boundary, ready]);

  // ------------------------------------------------------------- drawn area
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || styleLoadingRef.current) return;
    setData(map, "drawn", drawn ? { type: "Feature", properties: {}, geometry: drawn } : EMPTY);
  }, [drawn, ready]);

  // ------------------------------------------------------------- density
  const maxValue = density?.features.reduce((m, f) => Math.max(m, f.properties.value), 0) ?? 0;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || styleLoadingRef.current) return;
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

  const cancelDrawing = () => {
    pointsRef.current = [];
    setPointCount(0);
    const map = mapRef.current;
    if (map) setData(map, "draft", EMPTY);
    setMode("none");
  };

  const toolButton = (m: Mode, label: string, icon: ToolIconName) => (
    <button
      type="button"
      onClick={() => setMode(mode === m ? "none" : m)}
      aria-pressed={mode === m}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm font-medium transition focus:outline-2 focus:outline-offset-2 focus:outline-accent ${
        mode === m ? "bg-accent text-accent-text" : "bg-surface text-fg hover:bg-surface-2"
      }`}
    >
      <ToolIcon name={icon} />
      {label}
    </button>
  );

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} role="application" aria-label={t.mapAria} className="h-full w-full" />

      {/* drawing tools */}
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        {toolButton("polygon", t.polygon, "polygon")}
        {toolButton("rectangle", t.rectangle, "rectangle")}
        {boundary && (
          <button
            type="button"
            onClick={() => { cancelDrawing(); onDraw(boundary.geometry); }}
            aria-label={t.wholeRegion}
            className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-fg transition hover:bg-surface-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          >
            <ToolIcon name="region" />
            {t.wholeRegion}
          </button>
        )}
        {drawn && (
          <button
            type="button"
            onClick={() => { cancelDrawing(); onClear(); }}
            aria-label={t.clear}
            className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-fg transition hover:bg-surface-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          >
            <ToolIcon name="clear" />
            {t.clear}
          </button>
        )}
      </div>

      {/* hint while drawing */}
      {mode !== "none" && (
        <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-sm text-fg">
          <p>{mode === "polygon" ? t.clickPoints : t.clickCorners}</p>
          {pointCount > 0 && (
            <button
              type="button"
              onClick={() => {
                pointsRef.current = pointsRef.current.slice(0, -1);
                setPointCount(pointsRef.current.length);
                redrawDraftRef.current();
              }}
              aria-label={t.undoPoint}
              className="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs font-medium text-fg hover:bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-accent"
            >
              <ToolIcon name="undo" />
              {t.undoPoint}
            </button>
          )}
          <button
            type="button"
            onClick={cancelDrawing}
            aria-label={t.cancelDrawing}
            className="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs font-medium text-fg hover:bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          >
            <ToolIcon name="cancel" />
            {t.cancelDrawing}
          </button>
        </div>
      )}

      {/* density legend */}
      {legend.length > 0 && mode === "none" && (
        <div className="absolute bottom-8 right-3 rounded-md border border-line bg-surface p-2 text-xs text-fg">
          <p className="mb-1 font-medium">{t.legend}</p>
          <div className="flex items-center gap-1">
            {VIRIDIS.map((c, i) => (
              <div key={c} className="flex flex-col items-center">
                <span className="block h-3 w-8" style={{ background: c }} aria-hidden="true" />
                <span className="mt-0.5 tabular-nums">{fmt(legend[i])}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
