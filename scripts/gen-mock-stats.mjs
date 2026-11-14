// scripts/gen-mock-stats.mjs
// Generates mocks/stats.json with fictional data in the same shape as the API's /stats response.
import { writeFileSync } from "node:fs";

const START_YEAR = 2003;
const END_YEAR = 2025;
const YEARS = END_YEAR - START_YEAR + 1; // 23

// Base value per month (Jan..Dec): weak early in the year, strong in Aug/Sep/Oct
const monthlyBase = [8, 4, 5, 10, 18, 40, 90, 260, 520, 410, 120, 21];

// Yearly multiplier: 2020 is forced to be the worst year, the others vary pseudo-randomly
const yearFactor = (year) =>
  year === 2020
    ? 2.7
    : 0.4 + ((((Math.sin(year * 12.9898) * 43758.5453) % 1) + 1) % 1) * 1.2;

const round1 = (n) => Math.round(n * 10) / 10;

// 1. Calendar: one cell per year and month (276 cells)
const calendar = [];
for (let year = START_YEAR; year <= END_YEAR; year++) {
  for (let month = 1; month <= 12; month++) {
    calendar.push({
      year,
      month,
      value: round1(monthlyBase[month - 1] * yearFactor(year)),
    });
  }
}

// 2. Sorted values of a given month across all years
const valuesOfMonth = (month) =>
  calendar
    .filter((cell) => cell.month === month)
    .map((cell) => cell.value)
    .sort((a, b) => a - b);

// Median of a sorted list (handles odd and even lengths)
const medianOf = (sorted) => {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// 3. Anomaly of a cell: ratio to the monthly median and percentile among the years
const toAnomaly = (cell) => {
  const sorted = valuesOfMonth(cell.month);
  const med = medianOf(sorted);
  return {
    ...cell,
    median: round1(med),
    ratio: med > 0 ? Math.round((cell.value / med) * 100) / 100 : null,
    percentile: Math.round(
      (sorted.filter((v) => v <= cell.value).length / sorted.length) * 100
    ),
  };
};

const allAnomalies = calendar.map(toAnomaly);

// 4. Indicators for the 4 cards
const total = calendar.reduce((sum, cell) => sum + cell.value, 0);

const totalByYear = {};
for (const cell of calendar) {
  totalByYear[cell.year] = (totalByYear[cell.year] ?? 0) + cell.value;
}
const [worstYear, worstYearValue] = Object.entries(totalByYear).sort(
  (a, b) => b[1] - a[1]
)[0];

const peakMonth = [...calendar].sort((a, b) => b.value - a.value)[0];

const typicalPeakMonth = [...Array(12).keys()]
  .map((m) => m + 1)
  .sort((a, b) => medianOf(valuesOfMonth(b)) - medianOf(valuesOfMonth(a)))[0];

// 5. Final object
const stats = {
  area: { km2: 3420.5, clipped: false, n_cells: 662 },
  period: { start: `${START_YEAR}-01-01`, end: `${END_YEAR}-12-31` },
  indicators: {
    total: round1(total),
    annual_mean: round1(total / YEARS),
    worst_year: { year: Number(worstYear), value: round1(worstYearValue) },
    peak_month: peakMonth,
    typical_peak_month: typicalPeakMonth,
  },
  calendar,
  // Contract: every month in the period (the front picks the most unusual ones)
  anomalies: allAnomalies,
  last_month: allAnomalies[allAnomalies.length - 1],
  // User-facing text stays in Portuguese
  warnings: ["Área pequena: os anos antes de 2012 têm incerteza maior."],
};

// 6. Write the file
writeFileSync("mocks/stats.json", JSON.stringify(stats, null, 2));
console.log("mocks/stats.json generated");