import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export const metadata: Metadata = {
  title: "How it works · brasa",
  description: "How brasa builds the fire history of the Brazilian Pantanal.",
};

/**
 * Folder inside public/ where the images live.
 * public/how-it-works/fig5_validation.png  ->  "/how-it-works/fig5_validation.png"
 * If you put the files directly in public/, set this to "".
 */
const IMG = "/how-it-works";

/* ------------------------------------------------------------------ */
/* Small building blocks (kept in this file to keep the page simple)   */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-6 space-y-3">
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/80">{children}</p>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 text-lg font-semibold">{children}</h3>;
}

/** Formula block. tabIndex lets keyboard users scroll it on small screens. */
function Formula({ children }: { children: React.ReactNode }) {
  return (
    <pre
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-foreground/20 bg-foreground/5 p-4 font-mono text-sm leading-relaxed"
    >
      {children}
    </pre>
  );
}

function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-foreground/30">
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-foreground/15">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top text-foreground/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Figure with a placeholder.
 * - Without `src`: shows a dashed box saying what goes there.
 * - With `src` (a file in public/): shows the image at full column width,
 *   keeping its own proportions (no need to know width/height).
 * The alt text is how screen readers describe the picture, so always fill it.
 */
function Figure({
  src,
  alt,
  placeholder,
  caption,
}: {
  src?: string;
  alt: string;
  placeholder?: string;
  caption?: string;
}) {
  return (
    <figure className="space-y-2">
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="(min-width: 768px) 768px, 100vw"
          unoptimized={src.endsWith(".svg")}
          className="h-auto w-full rounded-lg border border-foreground/15"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex h-56 items-center justify-center rounded-lg border border-dashed border-foreground/30 px-4 text-center text-sm text-foreground/80"
        >
          {placeholder}
        </div>
      )}
      {caption && (
        <figcaption className="text-sm text-foreground/70">{caption}</figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

const FACTORS: [string, string][] = [
  ["Jan", "3.52"],
  ["Feb", "4.67"],
  ["Mar", "4.19"],
  ["Apr", "4.29"],
  ["May", "3.93"],
  ["Jun", "3.48"],
  ["Jul", "2.69"],
  ["Aug", "2.61"],
  ["Sep", "2.90"],
  ["Oct", "3.39"],
  ["Nov", "4.10"],
  ["Dec", "4.05"],
];

const TOC = [
  ["why-harmonize", "Why we harmonize the data"],
  ["data", "The data"],
  ["c1-day-factor", "The C1-day factor"],
  ["validation", "Validation"],
  ["from-data-to-dashboard", "From data to dashboard"],
  ["how-to-use", "How to use brasa"],
  ["limitations", "Limitations and next steps"],
] as const;

export default function HowItWorks() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 p-4 py-8">
        {/* ---------- Intro ---------- */}
        <div>
          <Link href="/" className="text-sm font-medium underline">
            ← Back to the map
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">How it works</h1>
          <p className="mt-3 text-foreground/80">
            brasa turns two NASA fire sensors into one consistent fire history of
            the Brazilian Pantanal, from January 2003 to today, for any area you
            draw on the map. The data comes from NASA FIRMS, using the MODIS
            (Aqua) and VIIRS (S-NPP) satellites, harmonized into a single series.
            The unit is fire days (per ~5 km² area).
          </p>

          <nav aria-label="On this page" className="mt-6">
            <p className="text-sm font-semibold">On this page</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {TOC.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="underline">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ---------- Why harmonize ---------- */}
        <Section id="why-harmonize" title="Why we harmonize the data">
          <P>
            NASA FIRMS publishes active-fire detections from two instrument
            families. MODIS (1 km pixels) has been running since 2000. VIIRS
            (375 m pixels) has been running since 2012 and sees many more,
            smaller fires.
          </P>
          <P>
            Gluing them together naively creates a false jump in 2012: fire would
            seem to triple overnight just because the sensor changed. That would
            make any comparison between old and recent years meaningless.
          </P>
          <P>
            Our answer, in one line: we count fire on a common grid of ~5 km²
            cells, and convert the older MODIS counts into “VIIRS equivalents”
            with one calibrated factor per calendar month. The result is a single
            series, in a single unit, that you can compare across all years.
          </P>
          {/* fig9 — TODO: replace this alt with the one written for the final image */}
          <Figure
            src={`${IMG}/fig9_raw_vs_harmonized.svg`}
            alt="Chart comparing the raw yearly series, which jumps in 2012 when the sensor changes from MODIS to VIIRS, with the harmonized series, which stays continuous across 2012."
            caption="Raw detections jump when the sensor changes in 2012; the harmonized series does not."
          />
        </Section>

        {/* ---------- Data ---------- */}
        <Section id="data" title="The data">
          <P>
            We use one reference satellite per sensor, so the series never
            changes because a satellite was added or removed.
          </P>
          <DataTable
            caption="Sensors and satellites used in the series"
            head={["Sensor", "Satellite", "Pixel", "Years used", "Passes used"]}
            rows={[
              [
                "MODIS Collection 6.1",
                "Aqua",
                "1 km",
                "2003–2011 in the series; 2012–2021 for calibration",
                "Daytime only",
              ],
              [
                "VIIRS 375 m",
                "Suomi NPP (S-NPP)",
                "375 m",
                "2012 onwards",
                "Day and night",
              ],
            ]}
          />
          <P>
            Why only these two: Terra (MODIS), NOAA-20 and NOAA-21 (VIIRS)
            entered or left the record at different dates. Adding them would
            create artificial steps, for example in 2018. The series starts in
            January 2003 because Aqua only has data from July 2002.
          </P>

          <H3>Filters applied to every detection</H3>
          <P>
            All detections come from the NASA FIRMS archive (Brazil country
            files).
          </P>
          <ul className="list-disc space-y-1 pl-6 text-foreground/80">
            <li>
              <strong>Type 0 only:</strong> presumed vegetation fire. Volcanoes,
              static land sources and offshore detections are removed.
            </li>
            <li>
              <strong>MODIS:</strong> confidence of 30 or more.
            </li>
            <li>
              <strong>VIIRS:</strong> confidence nominal or high (low is
              removed).
            </li>
            <li>
              <strong>Location:</strong> inside the IBGE 2019 Pantanal biome
              boundary plus a 2 km buffer, so fires on the edge are not lost to
              rounding.
            </li>
            <li>
              <strong>Scope:</strong> the Brazilian Pantanal only. Both sensors
              come from the same Brazil files, so the border cut is identical for
              both and does not bias the conversion.
            </li>
          </ul>
        </Section>

        {/* ---------- C1-day factor ---------- */}
        <Section id="c1-day-factor" title="The C1-day factor">
          <P>
            Three steps turn raw detections into one series: a common grid, a
            monthly conversion factor, and a switch date.
          </P>

          <H3>Step A · Count cell-days, not detections</H3>
          <P>
            We cover the Pantanal with the H3 hexagonal grid at resolution 7
            (cells of about 5 km²). For each sensor, cell and day we record only
            whether there was fire:
          </P>
          <Formula>
            {`x(s, c, d) = 1  if sensor s detected at least one fire in cell c on day d
           0  otherwise`}
          </Formula>
          <P>
            Why: a VIIRS pixel is about 7 times smaller than a MODIS pixel, so one
            fire produces many more VIIRS detections. Counting detections
            exaggerates the gap between sensors. In 2020, the VIIRS/MODIS ratio
            was 7.2 counting pixels but only 2.7 counting cell-days. A 5 km² cell
            is larger than both pixels, so both sensors “see” a burning cell in a
            similar way.
          </P>
          {/* fig7 */}
          <Figure
            src={`${IMG}/fig7_cell_day.png`}
            alt="Schematic of one hexagonal H3 cell of about 5 km² with the same fire seen by two sensors. On the left, MODIS with 1 km pixels lights 2 pixels; on the right, VIIRS with 375 m pixels lights 9 pixels. In both cases the cell counts as 1 cell-day with fire."
            caption="The same fire seen by two sensors: different pixel counts, but always 1 cell-day."
          />

          <H3>Step B · One conversion factor per calendar month</H3>
          <P>
            From 2012 to 2021 both satellites observed the Pantanal at the same
            time. For each calendar month m we divide what VIIRS saw by what MODIS
            Aqua saw:
          </P>
          <Formula>
            {`R(m) = sum of x(VIIRS) over years, cells and days of month m
       ──────────────────────────────────────────────────
       sum of x(Aqua, day) over the same years, cells and days

calibration years = 2012–2018 and 2021`}
          </Formula>
          <ul className="list-disc space-y-1 pl-6 text-foreground/80">
            <li>
              The numerator uses VIIRS day and night passes. The denominator uses
              only Aqua daytime passes: Aqua’s night detections are too sparse
              and made the factors unstable (separate day/night factors gave 38%
              and 41% bias in testing).
            </li>
            <li>
              Calibration stops in 2021: from 2022 Aqua’s orbit drifts and its
              overpass time changes.
            </li>
            <li>
              2019 and 2020 are left out on purpose. They are the test years (see
              Validation).
            </li>
            <li>
              If a month has fewer than 30 Aqua cell-days, we use the ratio of its
              season instead (dry: Jul–Oct; wet: Nov–Jun).
            </li>
          </ul>

          <P>The 12 factors:</P>
          <DataTable
            caption="Conversion factor R for each calendar month"
            head={["Month", ...FACTORS.map(([m]) => m)]}
            rows={[["R(m)", ...FACTORS.map(([, v]) => v)]]}
          />
          <P>
            Factors are lowest in the dry season (Jul–Sep). Big, hot fires are
            visible to both sensors, so VIIRS has less of an advantage. In the wet
            season fires are small and only VIIRS catches most of them.
          </P>
          {/* fig6 — confirm the exact file name/extension */}
          <Figure
            src={`${IMG}/fig6_monthly_factors.png`}
            alt="Bar chart of the 12 monthly conversion factors from MODIS Aqua to VIIRS. January 3.52, February 4.67, March 4.19, April 4.29, May 3.93, June 3.48, July 2.69, August 2.61, September 2.90, October 3.39, November 4.10, December 4.05. July to September, the dry season, are labelled and have the lowest factors."
            caption="Monthly conversion factors. The dry season (Jul–Sep) has the lowest values."
          />

          <H3>Step C · Apply and switch</H3>
          <Formula>
            {`H(c, d) = R(month of d) × x(Aqua, day)   if d < 2012-01-01
H(c, d) = x(VIIRS)                      if d ≥ 2012-01-01`}
          </Formula>
          <P>
            Every cell-day with fire gets a harmonized value H and the factor
            used (R before 2012, 1 after). Values before 2012 are expected
            VIIRS-equivalent counts, so they can be fractional.
          </P>
          <P>
            The unit everywhere in brasa is{" "}
            <strong>fire days per ~5 km² cell (VIIRS equivalent)</strong>. For an
            area, we sum H over its cells. So 3,000 in one year means, for
            example, 300 cells with fire on 10 days each. It is not the number of
            calendar days, and it is not comparable to INPE’s “focos” (hotspot)
            counts.
          </P>
        </Section>

        {/* ---------- Validation ---------- */}
        <Section id="validation" title="Validation chart">
          <P>
            Calibrated without 2019 and 2020, the conversion predicts the real
            VIIRS count of those years within 12.5%, and the series shows no jump
            at the 2012 switch.
          </P>
          {/* fig5 */}
          <Figure
            src={`${IMG}/fig5_validation.png`}
            alt="Bar chart of the yearly difference between converted MODIS and real VIIRS fire days, 2012 to 2025. Calibration years stay between −10.9% and +8.9%. The test years, left out of calibration, are +12.5% in 2019 and −4.2% in 2020. After 2021, when the Aqua orbit drifts, differences reach +25.7% in 2023; those years are not used for calibration and the series uses real VIIRS from 2012."
            caption="Yearly difference between MODIS Aqua × monthly factor and the real VIIRS S-NPP count (0 = perfect match). Test years: 2019 +12.5%, 2020 −4.2%. 2022 onwards: Aqua orbit drift, not used. From 2012 the series uses real VIIRS, so these gaps only test the conversion."
          />

          <H3>How we tested</H3>
          <P>
            The 12 factors were computed only from 2012–2018 and 2021. We then
            multiplied the MODIS counts of 2019 and 2020 by those factors and
            compared them with what VIIRS actually saw. Month by month, the
            correlation was 0.99 or higher and the fire-season peak fell in the
            right month in both years.
          </P>
          <P>We compared four ways of converting, on the same test:</P>
          <DataTable
            caption="Comparison of four conversion methods on the 2019 and 2020 test years"
            head={["Method", "2019", "2020", "Mean absolute bias", "Monthly NRMSE"]}
            rows={[
              [
                <strong key="a">Monthly factor, Aqua daytime (chosen)</strong>,
                "+12.5%",
                "−4.2%",
                "8.4%",
                "0.18",
              ],
              ["Monthly factor, Aqua day + night", "+15.5%", "+3.8%", "9.7%", "0.21"],
              ["Regression on logs (plan B)", "+1.9%", "−18.6%", "10.3%", "0.19"],
              ["Separate day and night factors", "+37.7%", "+40.9%", "39.3%", "0.68"],
            ]}
          />
          <P>
            We chose the monthly daytime factor: lowest average error, and simple
            enough to explain in one sentence.
          </P>

          <H3>Yearly ranking</H3>
          <P>
            Yearly ranking of the harmonized series for the whole Brazilian
            Pantanal: 2020 &gt; 2005 &gt; 2024 &gt; 2007 &gt; 2019. Two of the five
            worst years were measured by MODIS and three by VIIRS, so both eras
            compete on the same scale. A comparison with INPE’s reference-satellite
            ranking is still pending.
          </P>
        </Section>

        {/* ---------- From data to dashboard ---------- */}
        <Section id="from-data-to-dashboard" title="From data to dashboard">
          <P>
            The heavy work happens once, offline; each click on the map only sums
            pre-computed cell-days.
          </P>
          <ol className="list-decimal space-y-2 pl-6 text-foreground/80">
            <li>
              <strong>Offline pipeline</strong> (Python: pandas, GeoPandas,
              h3-py). Clips and filters the FIRMS files, builds the cell-day
              table, calibrates the 12 factors and applies them. Output: 231,014
              harmonized cell-days with fire, 2003–2025.
            </li>
            <li>
              <strong>Database</strong> (PostgreSQL + PostGIS). Four tables:{" "}
              <code>cell_days</code> (feeds every statistic),{" "}
              <code>raw_hotspots</code> (the original detections plus the factor
              of their cell-day; feeds the CSV export),{" "}
              <code>pantanal_boundary</code> (the IBGE polygon) and{" "}
              <code>factors</code> (the 12 values of R).
            </li>
            <li>
              <strong>API</strong> (FastAPI). At startup it keeps the boundary,
              the data period and the factors in memory. Every request carries the
              same body: a GeoJSON polygon, a start date and an end date.
            </li>
            <li>
              <strong>Web app</strong> (Next.js, MapLibre, ECharts). Draws the
              map, sends the area, and turns the answer into cards and charts.
            </li>
          </ol>
          {/* fig8 — last sentence adjusted: PostGIS and the API are always live */}
          <Figure
            src={`${IMG}/fig8_architecture.png`}
            alt="Architecture diagram in five steps from left to right: NASA FIRMS archive and IBGE boundary, then an offline Python pipeline that filters, builds H3 cells and harmonizes, then a PostGIS database, then a FastAPI API with the meta, stats, density and export endpoints, then the Next.js web app with the map and dashboard. The first two steps run once; the last three are always live and answer every click."
            caption="The offline part runs once; the last three blocks are the live system."
          />

          <H3>What happens when you draw an area</H3>
          <ol className="list-decimal space-y-2 pl-6 text-foreground/80">
            <li>
              <strong>Validate.</strong> The shape must be a polygon and the start
              date must not be after the end date.
            </li>
            <li>
              <strong>Clip.</strong> The shape is repaired if needed and
              intersected with the Pantanal boundary. If part of it was outside,
              the panel says so. If nothing is left, you get “This area can’t be
              analysed”.
            </li>
            <li>
              <strong>Measure.</strong> The area in km² is computed on the
              ellipsoid (geodesic), not on flat degrees.
            </li>
            <li>
              <strong>Cover.</strong> The area is filled with the H3 cells whose
              centre falls inside it. A very small area that contains no centre
              gets the single cell under it.
            </li>
            <li>
              <strong>Query.</strong> The database returns the full history of
              those cells, not just the selected period, because anomalies compare
              against every year.
            </li>
            <li>
              <strong>Summarize.</strong> The API computes the indicators below
              and sends them back as JSON.
            </li>
          </ol>

          <H3>How each indicator is computed</H3>
          <P>
            Let V(y, m) be the sum of H over the selected cells in month m of year
            y.
          </P>
          <DataTable
            caption="Definition of each indicator"
            head={["Indicator", "Definition"]}
            rows={[
              [
                "Fire days in the period",
                "Sum of H over all cells and days between the start and end dates.",
              ],
              ["Year × month calendar", "V(y, m) for every month of the period."],
              ["Worst year", "Year with the largest sum of V(y, m)."],
              [
                "Peak month",
                "Month with the largest V(y, m). The typical peak is the calendar month with the largest median.",
              ],
              [
                "Anomaly",
                "V(y, m) divided by the median of the same calendar month over all years of the area’s history, plus the percentile of V(y, m) among those years.",
              ],
              [
                "Last month",
                "The anomaly of the most recent month in the database, highlighted on the calendar.",
              ],
              [
                "Density map",
                "Sum of H per cell in the period. Large areas are grouped into bigger H3 cells so the map stays fast.",
              ],
            ]}
          />
          <P>
            The median uses the whole history even when you pick a shorter period.
            That way “above normal” always means above the area’s long-term
            normal.
          </P>
          <P>
            Colour scales are colour-blind safe: viridis for counts (on a log
            scale in the calendar, so quiet years stay visible next to 2020) and
            blue–orange for anomalies.
          </P>
        </Section>

        {/* ---------- How to use ---------- */}
        <Section id="how-to-use" title="How to use brasa">
          <P>
            Draw an area, pick a period, read the panel. No login, nothing to
            install.
          </P>
          {/* TODO print 1: full dashboard. Take it with the real API (USE_MOCK off).
              Then add src={`${IMG}/print-dashboard.png`} and review the alt. */}
          <Figure
            alt="Screenshot of the brasa dashboard with an area drawn on the map and the results panel open."
            placeholder="Screenshot: full dashboard with an area drawn and the panel filled in"
            caption="Overview of the screen: map on the left, results panel on the right."
          />

          <H3>1. Choose an area</H3>
          <P>Use the buttons on the map:</P>
          <ul className="list-disc space-y-1 pl-6 text-foreground/80">
            <li>
              <strong>Polygon:</strong> click to add points; double-click, or
              click the first point, to close. Press Esc to cancel.
            </li>
            <li>
              <strong>Rectangle:</strong> click two opposite corners.
            </li>
            <li>
              <strong>Whole Pantanal:</strong> analyses the entire Brazilian
              Pantanal at once.
            </li>
            <li>
              <strong>Clear:</strong> removes the area and resets the panel.
            </li>
          </ul>
          {/* TODO print 2: drawing buttons -> `${IMG}/print-draw-tools.png` */}
          <Figure
            alt="Screenshot of the drawing buttons on the map: polygon, rectangle and clear."
            placeholder="Screenshot: drawing tools (polygon, rectangle, clear)"
          />

          <H3>2. Set the period</H3>
          <P>
            Pick a start and an end date. By default brasa shows the whole series,
            from January 2003 to the latest data.
          </P>

          <H3>3. Wait a moment</H3>
          <P>
            The panel shows grey placeholders while it loads. On the free server
            the first request after a pause can take up to a minute.
          </P>

          <H3>4. Read the results, top to bottom</H3>
          <ul className="list-disc space-y-2 pl-6 text-foreground/80">
            <li>
              <strong>Warnings:</strong> the area was clipped by the Pantanal
              outline, or it is small (under 500 km²), where yearly numbers swing
              more and should be read with care.
            </li>
            <li>
              <strong>Indicator cards:</strong> total fire days, the worst year,
              the peak month next to the usual peak month, and the area analysed
              (km² and number of cells).
            </li>
            <li>
              <strong>Anomaly:</strong> how the last loaded month compares with
              its normal, and the most unusual months of the period (for example
              “3.2× the median, 98th percentile”).
            </li>
            <li>
              <strong>Calendar (year × month):</strong> each square is one month;
              brighter means more fire. It shows both the fire season (Jul–Oct)
              and the exceptional years. The last month loaded has an orange
              outline.
            </li>
            <li>
              <strong>Fire days per year:</strong> one bar per year; the worst
              year is orange.
            </li>
            <li>
              <strong>Map density:</strong> cells coloured by fire days in the
              period, to see where fire concentrates.
            </li>
          </ul>
          {/* TODO print 3: results panel -> `${IMG}/print-results-panel.png` */}
          <Figure
            alt="Screenshot of the results panel: indicator cards, anomaly sentence, year by month calendar and bars per year."
            placeholder="Screenshot: results panel (cards, anomaly, calendar, bars)"
          />
          {/* TODO print 4: density layer -> `${IMG}/print-density.png` */}
          <Figure
            alt="Screenshot of the map with the density layer: hexagons coloured by fire days inside the drawn area, with a legend."
            placeholder="Screenshot: density layer (hexagons) with legend"
          />

          <H3>5. Download the data</H3>
          <P>
            “Download hotspots (CSV)” gives the raw NASA detections inside your
            area and period, with the harmonization factor of each one, so anyone
            can redo the numbers.
          </P>

          <div className="rounded-lg border border-foreground/20 bg-foreground/5 p-4">
            <p className="text-sm font-semibold">Example question</p>
            <p className="mt-1 text-foreground/80">
              “Was September 2024 unusual for this ranch, compared with every
              September since 2003?” brasa answers it in one click.
            </p>
          </div>
        </Section>

        {/* ---------- Limitations ---------- */}
        <Section id="limitations" title="Limitations and next steps">
          <P>
            brasa measures how often fire was detected, not how much area burned.
          </P>
          <ul className="list-disc space-y-2 pl-6 text-foreground/80">
            <li>
              <strong>Detections, not burned area.</strong> A cell-day says a
              satellite saw an active fire at overpass time. Fires under clouds or
              between overpasses are missed by both sensors.
            </li>
            <li>
              <strong>Saturation in extreme years.</strong> The VIIRS/MODIS ratio
              falls when there is a lot of fire (correlation 0.79 between yearly
              fire and yearly ratio), so a fixed factor can overestimate extreme
              years before 2012. In testing this stayed small (2020: 4.2%), but a
              log-scale regression (method C2) is kept as a plan B.
            </li>
            <li>
              <strong>Small areas.</strong> Under about 500 km², monthly values
              depend on few cells and are noisy.
            </li>
            <li>
              <strong>No automatic updates yet.</strong> The database is a
              one-time load of the FIRMS archive; the cut-off date is shown under
              the panel.
            </li>
            <li>
              <strong>Not comparable to INPE “focos”.</strong> INPE counts
              hotspots from its own reference satellite; brasa counts harmonized
              cell-days.
            </li>
          </ul>

          <H3>Next steps</H3>
          <ul className="list-disc space-y-1 pl-6 text-foreground/80">
            <li>Daily updates from the FIRMS near-real-time feed.</li>
            <li>
              Compare our yearly ranking with INPE’s BDQueimadas reference
              satellite series.
            </li>
            <li>
              Convert fire days into estimated burned area with the MODIS/VIIRS
              burned-area products.
            </li>
            <li>Pixel-level pairing of MODIS and VIIRS detections with FRP correction.</li>
            <li>Extend to the Bolivian and Paraguayan Pantanal.</li>
          </ul>
        </Section>

        <p className="border-t border-foreground/15 pt-4 text-sm text-foreground/70">
          Data: NASA FIRMS (MODIS C6.1 and VIIRS 375 m active fires) · Boundary:
          IBGE Biomas 2019 · Grid: H3.
        </p>
      </main>

      <Footer />
    </div>
  );
}
