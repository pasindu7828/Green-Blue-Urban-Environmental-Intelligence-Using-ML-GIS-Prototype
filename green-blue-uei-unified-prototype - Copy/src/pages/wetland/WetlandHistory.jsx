import { useMemo, useState } from 'react'

import {
  CalendarDays,
  GitCompare,
  History,
  Layers3,
  MapPinned,
  Split,
  TrendingDown,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import Badge from '../../components/ui/Badge'
import WetlandHistoryMap from '../../components/maps/WetlandHistoryMap'

import {
  wetlands,
  wetlandHistory,
  wetlandChanges,
  wetlandTransitions,
} from '../../data/wetlandData'


export default function WetlandHistory() {
  // Only show wetlands for which prototype
  // historical observations currently exist.
  const wetlandsWithHistory = useMemo(() => {
    const ids = new Set(
      wetlandHistory.map(
        (item) => item.wetlandId,
      ),
    )

    return wetlands.filter((wetland) =>
      ids.has(wetland.wetlandId),
    )
  }, [])


  const [wetlandId, setWetlandId] =
    useState(
      wetlandsWithHistory[0]?.wetlandId ||
        '',
    )


  const [mode, setMode] =
    useState('single')


  const selectedWetland =
    wetlandsWithHistory.find(
      (wetland) =>
        wetland.wetlandId === wetlandId,
    )


  const history = useMemo(() => {
    return wetlandHistory
      .filter(
        (item) =>
          item.wetlandId === wetlandId,
      )
      .sort((a, b) => a.year - b.year)
  }, [wetlandId])


  const availableYears = history.map(
    (item) => item.year,
  )


  const [selectedYear, setSelectedYear] =
    useState(2012)


  const [fromYear, setFromYear] =
    useState(2012)


  const [toYear, setToYear] =
    useState(2026)


  // When changing wetland, make sure selected
  // years exist for the new wetland.
  const normalizedSelectedYear =
    availableYears.includes(
      Number(selectedYear),
    )
      ? Number(selectedYear)
      : availableYears[0]


  const normalizedFromYear =
    availableYears.includes(
      Number(fromYear),
    )
      ? Number(fromYear)
      : availableYears[0]


  const normalizedToYear =
    availableYears.includes(
      Number(toYear),
    )
      ? Number(toYear)
      : availableYears[
          availableYears.length - 1
        ]


  const selectedObservation =
    history.find(
      (item) =>
        item.year ===
        normalizedSelectedYear,
    )


  const fromObservation =
    history.find(
      (item) =>
        item.year ===
        normalizedFromYear,
    )


  const toObservation =
    history.find(
      (item) =>
        item.year ===
        normalizedToYear,
    )


  // =========================================================
  // DIRECT PERIOD CHANGE RECORD
  // =========================================================
  const exactChangeRecord =
    wetlandChanges.find(
      (item) =>
        item.wetlandId === wetlandId &&
        item.fromYear ===
          normalizedFromYear &&
        item.toYear === normalizedToYear,
    )


  // =========================================================
  // GENERAL NET CHANGE
  // Works even if no direct gross-loss/gain record exists.
  // =========================================================
  const comparisonSummary =
    useMemo(() => {
      if (
        !fromObservation ||
        !toObservation
      ) {
        return null
      }

      const net =
        toObservation.area -
        fromObservation.area

      const percent =
        (net / fromObservation.area) *
        100

      const patchChange =
        toObservation.patchCount -
        fromObservation.patchCount

      const lpiChange =
        toObservation.lpi -
        fromObservation.lpi

      return {
        net,
        percent,
        patchChange,
        lpiChange,
      }
    }, [
      fromObservation,
      toObservation,
    ])


  // =========================================================
  // LAND TRANSITIONS
  // =========================================================
  const transitions =
    wetlandTransitions.filter(
      (item) =>
        item.wetlandId === wetlandId,
    )


  // =========================================================
  // CHART DATA
  // =========================================================
  const areaTrend = history.map(
    (item) => ({
      year: item.year,
      area: item.area,
    }),
  )


  const fragmentationTrend =
    history.map((item) => ({
      year: item.year,
      patches: item.patchCount,
      lpi: item.lpi,
    }))


  // =========================================================
  // BADGE HELPERS
  // =========================================================
  const confidenceVariant = (
    value,
  ) => {
    if (value === 'High') return 'green'
    if (value === 'Moderate')
      return 'amber'

    return 'slate'
  }


  const conditionVariant = (
    value,
  ) => {
    if (
      value
        .toLowerCase()
        .includes('fragment')
    ) {
      return 'amber'
    }

    if (
      value
        .toLowerCase()
        .includes('degraded')
    ) {
      return 'red'
    }

    return 'green'
  }


  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="eyebrow">
          Part 1A · Historical Wetland
          Change
        </div>

        <h1 className="mt-1 text-[24px] font-bold tracking-[-.03em] text-slate-900">
          Wetland History & Change
        </h1>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          Explore multi-temporal wetland
          boundaries, area change,
          fragmentation and observed land-use
          transitions using selected historical
          imagery dates.
        </p>
      </div>


      {/* =====================================================
          CONTROLS
      ===================================================== */}
      <div className="card-pad">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr_1.6fr]">
          {/* Wetland */}
          <label>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Select Wetland
            </span>

            <select
              value={wetlandId}
              onChange={(event) => {
                const nextId =
                  event.target.value

                setWetlandId(nextId)

                const nextHistory =
                  wetlandHistory
                    .filter(
                      (item) =>
                        item.wetlandId ===
                        nextId,
                    )
                    .sort(
                      (a, b) =>
                        a.year - b.year,
                    )

                if (
                  nextHistory.length
                ) {
                  setSelectedYear(
                    nextHistory[0].year,
                  )

                  setFromYear(
                    nextHistory[0].year,
                  )

                  setToYear(
                    nextHistory[
                      nextHistory.length -
                        1
                    ].year,
                  )
                }
              }}
              className="control mt-1"
            >
              {wetlandsWithHistory.map(
                (wetland) => (
                  <option
                    key={wetland.wetlandId}
                    value={
                      wetland.wetlandId
                    }
                  >
                    {wetland.wetlandId} —{' '}
                    {wetland.name}
                  </option>
                ),
              )}
            </select>
          </label>


          {/* Mode */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              View Mode
            </span>

            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setMode('single')
                }
                className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition ${
                  mode === 'single'
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Single Year
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode('compare')
                }
                className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition ${
                  mode === 'compare'
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Compare Years
              </button>
            </div>
          </div>


          {/* Year Controls */}
          {mode === 'single' ? (
            <label>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Historical Observation
              </span>

              <select
                value={
                  normalizedSelectedYear
                }
                onChange={(event) =>
                  setSelectedYear(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="control mt-1"
              >
                {availableYears.map(
                  (year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ),
                )}
              </select>
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  From Year
                </span>

                <select
                  value={
                    normalizedFromYear
                  }
                  onChange={(event) =>
                    setFromYear(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="control mt-1"
                >
                  {availableYears.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ),
                  )}
                </select>
              </label>


              <label>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  To Year
                </span>

                <select
                  value={
                    normalizedToYear
                  }
                  onChange={(event) =>
                    setToYear(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="control mt-1"
                >
                  {availableYears.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>


      {/* =====================================================
          HISTORICAL TIMELINE
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex items-center gap-2">
          <History
            size={15}
            className="text-teal-700"
          />

          <h2 className="section-title">
            Historical Observation Timeline
          </h2>
        </div>

        <div className="mt-5 flex items-center overflow-x-auto pb-2">
          {history.map(
            (observation, index) => {
              const isActive =
                mode === 'single'
                  ? observation.year ===
                    normalizedSelectedYear
                  : observation.year ===
                      normalizedFromYear ||
                    observation.year ===
                      normalizedToYear

              return (
                <div
                  key={observation.year}
                  className="flex min-w-[125px] flex-1 items-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        mode === 'single'
                      ) {
                        setSelectedYear(
                          observation.year,
                        )
                      }
                    }}
                    className="group flex flex-col items-center"
                  >
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 text-[10px] font-bold transition ${
                        isActive
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-300 bg-white text-slate-600 group-hover:border-teal-400'
                      }`}
                    >
                      {String(
                        observation.year,
                      ).slice(2)}
                    </div>

                    <p className="mt-2 text-[10px] font-bold text-slate-700">
                      {observation.year}
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {observation.area.toFixed(
                        1,
                      )}{' '}
                      ha
                    </p>
                  </button>

                  {index <
                    history.length - 1 && (
                    <div className="mx-2 h-[2px] flex-1 bg-slate-200" />
                  )}
                </div>
              )
            },
          )}
        </div>
      </div>


      {/* =====================================================
          MAP + OBSERVATION PANEL
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
        <div className="card-pad">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="section-title">
                {mode === 'single'
                  ? `${selectedWetland?.wetlandId} Historical Boundary`
                  : `${selectedWetland?.wetlandId} Boundary Comparison`}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                {mode === 'single'
                  ? `Mapped wetland extent for ${normalizedSelectedYear}.`
                  : `Comparison of mapped extent between ${normalizedFromYear} and ${normalizedToYear}.`}
              </p>
            </div>

            <Badge variant="blue">
              Prototype Map
            </Badge>
          </div>


          <WetlandHistoryMap
            history={history}
            mode={mode}
            selectedYear={
              normalizedSelectedYear
            }
            fromYear={
              normalizedFromYear
            }
            toYear={normalizedToYear}
          />
        </div>


        <div className="card-pad">
          {mode === 'single' &&
            selectedObservation && (
              <>
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={15}
                    className="text-teal-700"
                  />

                  <h2 className="section-title">
                    Observation Details
                  </h2>
                </div>


                <div className="mt-4 space-y-3">
                  <DetailRow
                    label="Image Date"
                    value={
                      selectedObservation.imageDate
                    }
                  />

                  <DetailRow
                    label="Mapped Area"
                    value={`${selectedObservation.area.toFixed(
                      1,
                    )} ha`}
                  />

                  <DetailRow
                    label="Season Context"
                    value={
                      selectedObservation.season
                    }
                  />

                  <DetailRow
                    label="Image Quality"
                    value={
                      selectedObservation.imageQuality
                    }
                  />

                  <DetailRow
                    label="Patch Count"
                    value={
                      selectedObservation.patchCount
                    }
                  />

                  <DetailRow
                    label="Largest Patch"
                    value={`${selectedObservation.largestPatch.toFixed(
                      1,
                    )} ha`}
                  />

                  <DetailRow
                    label="LPI"
                    value={`${selectedObservation.lpi}%`}
                  />
                </div>


                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge
                    variant={conditionVariant(
                      selectedObservation.dominantCondition,
                    )}
                  >
                    {
                      selectedObservation.dominantCondition
                    }
                  </Badge>

                  <Badge
                    variant={confidenceVariant(
                      selectedObservation.confidence,
                    )}
                  >
                    {
                      selectedObservation.confidence
                    }{' '}
                    confidence
                  </Badge>
                </div>


                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Interpretation Note
                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-slate-600">
                    Historical wetland extent
                    should be interpreted
                    together with image date,
                    seasonal context, image
                    quality and multi-date
                    consistency. Reduced visible
                    surface water alone is not
                    treated as permanent wetland
                    loss.
                  </p>
                </div>
              </>
            )}


          {mode === 'compare' &&
            comparisonSummary && (
              <>
                <div className="flex items-center gap-2">
                  <GitCompare
                    size={15}
                    className="text-teal-700"
                  />

                  <h2 className="section-title">
                    Change Summary
                  </h2>
                </div>


                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <ChangeCard
                    label="Start Area"
                    value={`${fromObservation.area.toFixed(
                      1,
                    )} ha`}
                  />

                  <ChangeCard
                    label="End Area"
                    value={`${toObservation.area.toFixed(
                      1,
                    )} ha`}
                  />

                  <ChangeCard
                    label="Net Change"
                    value={`${comparisonSummary.net.toFixed(
                      1,
                    )} ha`}
                    alert={
                      comparisonSummary.net <
                      0
                    }
                  />

                  <ChangeCard
                    label="Change"
                    value={`${comparisonSummary.percent.toFixed(
                      1,
                    )}%`}
                    alert={
                      comparisonSummary.percent <
                      0
                    }
                  />

                  <ChangeCard
                    label="Patch Change"
                    value={
                      comparisonSummary.patchChange >
                      0
                        ? `+${comparisonSummary.patchChange}`
                        : comparisonSummary.patchChange
                    }
                  />

                  <ChangeCard
                    label="LPI Change"
                    value={`${comparisonSummary.lpiChange.toFixed(
                      1,
                    )} pp`}
                  />
                </div>
              </>
            )}
        </div>
      </div>


      {/* =====================================================
          CHANGE METRICS
      ===================================================== */}
      {mode === 'compare' && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricBox
            icon={TrendingDown}
            label="Gross Loss"
            value={
              exactChangeRecord
                ? `${exactChangeRecord.grossLoss.toFixed(
                    1,
                  )} ha`
                : 'Not available'
            }
            subtitle={
              exactChangeRecord
                ? `${normalizedFromYear}–${normalizedToYear}`
                : 'Direct interval overlay not in mock dataset'
            }
          />

          <MetricBox
            icon={Layers3}
            label="Gross Gain"
            value={
              exactChangeRecord
                ? `${exactChangeRecord.grossGain.toFixed(
                    1,
                  )} ha`
                : 'Not available'
            }
            subtitle={
              exactChangeRecord
                ? `${normalizedFromYear}–${normalizedToYear}`
                : 'Direct interval overlay not in mock dataset'
            }
          />

          <MetricBox
            icon={Split}
            label="Patch Count"
            value={`${fromObservation?.patchCount ?? '—'} → ${toObservation?.patchCount ?? '—'}`}
            subtitle="Fragmentation indicator"
          />

          <MetricBox
            icon={MapPinned}
            label="LPI"
            value={`${fromObservation?.lpi ?? '—'}% → ${toObservation?.lpi ?? '—'}%`}
            subtitle="Largest Patch Index"
          />
        </div>
      )}


      {/* =====================================================
          AREA + FRAGMENTATION CHARTS
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* Area */}
        <div className="card-pad">
          <h2 className="section-title">
            Historical Area Trend
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Mapped wetland area across selected
            historical observations.
          </p>


          <div className="mt-4 h-[290px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={areaTrend}
                margin={{
                  top: 10,
                  right: 15,
                  left: -10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 5"
                />

                <XAxis dataKey="year" />

                <YAxis
                  domain={['auto', 'auto']}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value} ha`,
                    'Wetland Area',
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="area"
                  stroke="#0F766E"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* Fragmentation */}
        <div className="card-pad">
          <h2 className="section-title">
            Fragmentation Trend
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Patch count and Largest Patch
            Index across observation years.
          </p>


          <div className="mt-4 h-[290px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  fragmentationTrend
                }
                margin={{
                  top: 10,
                  right: 15,
                  left: -10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 5"
                />

                <XAxis dataKey="year" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="patches"
                  name="Patch Count"
                  fill="#F59E0B"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="lpi"
                  name="LPI (%)"
                  fill="#0F766E"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>


          <p className="mt-2 text-[9px] leading-4 text-slate-400">
            Final research reporting may use
            separate axes/plots because Patch
            Count and LPI have different units.
          </p>
        </div>
      </div>


      {/* =====================================================
          LAND TRANSITIONS
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div>
            <h2 className="section-title">
              Observed Land-Use Transitions
            </h2>

            <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-500">
              Land uses subsequently observed
              within mapped wetland-loss areas.
              These are spatial transition
              observations and should not
              automatically be interpreted as
              causal relationships.
            </p>
          </div>

          <Badge variant="slate">
            QGIS Overlay Output
          </Badge>
        </div>


        {transitions.length > 0 ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_.8fr]">
            <div className="h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={transitions}
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 5"
                  />

                  <XAxis
                    type="number"
                    unit="%"
                  />

                  <YAxis
                    type="category"
                    dataKey="toClass"
                    width={125}
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      'Share of Loss',
                    ]}
                  />

                  <Bar
                    dataKey="percentage"
                    fill="#0F766E"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>


            <div className="space-y-2">
              {transitions.map(
                (item) => (
                  <div
                    key={`${item.toClass}-${item.area}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-slate-500">
                          Wetland →
                        </p>

                        <p className="mt-0.5 text-[11px] font-bold text-slate-900">
                          {item.toClass}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[12px] font-bold text-slate-900">
                          {item.area.toFixed(
                            1,
                          )}{' '}
                          ha
                        </p>

                        <p className="text-[9px] text-slate-500">
                          {
                            item.percentage
                          }
                          % of mapped loss
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <Layers3
              size={26}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-[11px] font-semibold text-slate-700">
              Transition data not yet added
              for this prototype wetland.
            </p>
          </div>
        )}
      </div>


      {/* =====================================================
          METHODOLOGY NOTE
      ===================================================== */}
      <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-800">
          Historical Change Workflow
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-700">
          <span className="rounded-lg bg-white px-3 py-2">
            Google Earth Pro
          </span>

          <span>→</span>

          <span className="rounded-lg bg-white px-3 py-2">
            Historical Polygon Digitization
          </span>

          <span>→</span>

          <span className="rounded-lg bg-white px-3 py-2">
            QGIS
          </span>

          <span>→</span>

          <span className="rounded-lg bg-white px-3 py-2">
            Area + Fragmentation
          </span>

          <span>→</span>

          <span className="rounded-lg bg-white px-3 py-2">
            Gain / Loss Overlay
          </span>

          <span>→</span>

          <span className="rounded-lg bg-white px-3 py-2">
            Land-Use Transition
          </span>
        </div>
      </div>


      {/* =====================================================
          PROTOTYPE NOTICE
      ===================================================== */}
      <div className="mt-5 data-note">
        <b>Prototype Demo —</b> historical
        boundaries, areas, fragmentation,
        change values and land-use transitions
        shown here are mock demonstration data.
        Final values and map geometries will be
        generated from validated Google Earth
        Pro interpretation and QGIS spatial
        analysis.
      </div>
    </div>
  )
}


// ===========================================================
// SMALL COMPONENTS
// ===========================================================

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-[10px] text-slate-500">
        {label}
      </span>

      <span className="text-right text-[11px] font-semibold text-slate-800">
        {value}
      </span>
    </div>
  )
}


function ChangeCard({
  label,
  value,
  alert = false,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-[15px] font-bold ${
          alert
            ? 'text-orange-700'
            : 'text-slate-900'
        }`}
      >
        {value}
      </p>
    </div>
  )
}


function MetricBox({
  icon: Icon,
  label,
  value,
  subtitle,
}) {
  return (
    <div className="card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {subtitle}
          </p>
        </div>

        <Icon
          size={19}
          className="text-teal-700"
        />
      </div>
    </div>
  )
}