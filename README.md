![Brasa logo: a green leaf and a tongue of fire forming one flame (AI-generated)](public/brasa-logo.svg)

# brasa — web app

**The Pantanal's fire history, in one click.**
NASA Space Apps Challenge 2026 · Challenge: _Harmonization of MODIS and VIIRS Hot Spots_

[GitHub organization](https://github.com/Brasa-Space-Apps) · [Back end & data pipeline](https://github.com/Brasa-Space-Apps/back) · [API](https://back-mrhi.onrender.com/meta)

---

Draw an area on the map of the Brazilian Pantanal and get its fire history from **January 2003 to the latest data**, as one series that joins two generations of NASA satellites: **MODIS (Aqua)** and **VIIRS (Suomi NPP)**. The harmonization method and its validation are explained in the [back-end README](https://github.com/Brasa-Space-Apps/back) and on the app's _How it works_ page.

This repository holds the **front end** (Next.js). It talks to the Brasa API, which serves the pre-computed harmonized data.

## Features

- **Choose an area:** polygon, rectangle or the whole Pantanal. Areas that cross the outline are clipped to the Brazilian Pantanal.
- **Choose a period:** any date range inside the data period, with a one-click reset.
- **Dashboard:**
  - indicator cards (fire days, worst year, peak month vs usual peak, area analysed);
  - anomaly of the latest month against its own history (ratio to the median and percentile);
  - year × month calendar (click a month to filter the map to it);
  - fire activity per year;
  - density map of H3 hexagons (~5 km²) with a draggable legend;
  - CSV download of the raw NASA detections, each with its harmonization factor.
- **Accessible by design:** English and Portuguese, light and dark themes, colour-vision filters, colour-blind-safe palettes (viridis, blue–orange), keyboard drawing shortcuts, reduced-motion support.

> **Unit.** Everything is shown in **fire days per ~5 km² cell (VIIRS equivalent)**: for each hexagon, the number of days with at least one fire, summed over the area. It is not the number of calendar days, and it is not comparable to INPE's hotspot ("focos") counts.

## Stack

| Piece     | Tool                                                  |
| --------- | ----------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React, TypeScript |
| Styling   | Tailwind CSS 4 with theme tokens (`app/globals.css`)  |
| Map       | MapLibre GL 6 + OpenFreeMap basemap (no API key)      |
| Charts    | ECharts (`echarts-for-react`), SVG renderer           |
| Hosting   | Vercel                                                |

## Try it

The app is not deployed yet. You can run it in a few minutes against the live API (below), or see it in action in the screenshot above and in the project demo.

## Run it locally

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/Brasa-Space-Apps/front.git
cd front
npm install          # postinstall copies the MapLibre worker files to public/
cp .env.example .env.local   # or create it as below
npm run dev          # http://localhost:3000
```

`.env.local` (no trailing slash, no quotes):

```bash
NEXT_PUBLIC_API_URL=https://back-mrhi.onrender.com   # or http://localhost:8000 for a local API
NEXT_PUBLIC_USE_MOCK=0                               # 1 = use the JSON files in mocks/, no API needed
# NEXT_PUBLIC_MAP_STYLE=...        optional: custom basemap style URL
# NEXT_PUBLIC_MAP_STYLE_DARK=...   optional: basemap for the dark theme
```

Next.js reads `NEXT_PUBLIC_*` variables only when the server starts: restart `npm run dev` after changing them.

The API runs on a free plan and sleeps after 15 minutes without use. The first request after a pause can take up to a minute; the app shows a "waking up the server" message and retries on its own.

### Scripts

| Command            | What it does                    |
| ------------------ | ------------------------------- |
| `npm run dev`      | Development server on port 3000 |
| `npm run build`    | Production build                |
| `npm run start`    | Serve the production build      |
| `npx tsc --noEmit` | Type check                      |

### Troubleshooting

- **"Worker failed to load" / blank map:** run `npm install` again so `postinstall` copies `maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs` into `public/`.
- **NetworkError / CORS:** the API only accepts the origins listed in its `FRONT_ORIGIN` variable. Use port 3000 locally, or add your domain there.
- **Stale styles after a merge:** stop the server, `rm -rf .next`, start again.

## API contract

All `POST` endpoints take the same body; the geometry is always GeoJSON.

```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-57.8, -19.2],
        [-57.4, -19.2],
        [-57.4, -18.8],
        [-57.8, -18.8],
        [-57.8, -19.2]
      ]
    ]
  },
  "start_date": "2003-01-01",
  "end_date": "2025-12-31"
}
```

| Endpoint        | Returns                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `GET /meta`     | Pantanal outline, data period, data cut-off date, unit, the 12 monthly factors                  |
| `POST /stats`   | Indicators, calendar, anomalies, latest month, warnings, clipped area (km²) and number of cells |
| `POST /density` | GeoJSON FeatureCollection of H3 cells with their fire days                                      |
| `POST /export`  | CSV of the raw detections in the area and period, with the harmonization factor of each         |

An area outside the Pantanal, or dates outside the data period, return `400` with a message the app shows to the user.

## Project structure

```
app/            pages (home, How it works), layout, globals.css (theme tokens)
components/     Map, Dashboard, Header, SettingsMenu, charts, cards, panels
hooks/          useAnalysis: /meta, /stats and /density state, retries, debounce
lib/            api client, types, i18n (EN / PT-BR), formatting, theme, Pantanal outline
mocks/          sample API responses for offline work (NEXT_PUBLIC_USE_MOCK=1)
public/         MapLibre worker files, logo, icons
```

## Deploy (Vercel, optional)

1. Import this repository in Vercel (framework preset: Next.js).
2. Set `NEXT_PUBLIC_API_URL=https://back-mrhi.onrender.com` and `NEXT_PUBLIC_USE_MOCK=0`.
3. After the first deploy, add the Vercel domain to the API's `FRONT_ORIGIN` (comma-separated) on Render.

## Data and credits

- Fire detections: [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) — MODIS Collection 6.1 (Aqua) and VIIRS 375 m (Suomi NPP).
- Pantanal boundary: IBGE, _Biomas do Brasil_ 2019.
- Grid: [H3](https://h3geo.org/) (Uber, Apache 2.0).
- Basemap: [OpenFreeMap](https://openfreemap.org/), © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

## Use of AI

We used **Claude (Anthropic)** as a coding and writing assistant. The team chose the method, made the design decisions, and reviewed and tested every AI-assisted output.

- **Code:** AI-assisted source files start with the comment `AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team`, and commits list Claude as co-author.
- **Text:** parts of this README and of the in-app texts were drafted with AI assistance.
- **Images:** the Brasa logo and the explanatory figures were generated with AI assistance and are labelled as such.
- All numbers shown in the app are computed by our code from NASA FIRMS data, not produced by the AI.

## Team

[ADD TEAM NAME] — NASA Space Apps Challenge 2026, [ADD LOCAL EVENT]

- [Name] — [role]
- [Name] — [role]

## License

[ADD LICENSE, e.g. MIT]
