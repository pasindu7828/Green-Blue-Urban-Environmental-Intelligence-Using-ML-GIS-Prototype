import {
  useMemo,
  useState,
} from 'react'

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  CalendarDays,
  Gauge,
  MapPinned,
  TrendingUp,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  DisclaimerBadges,
  PageHeader,
  PressureBadge,
} from '../../components/shared/UrbanUI'

import UrbanIntelligenceMap from '../../components/maps/UrbanIntelligenceMap'

import ForecastYearSelector from '../../components/urban/ForecastYearSelector'

import {
  useUrbanForecast,
} from '../../contexts/UrbanForecastContext'

import {
  FORECAST_START_YEAR,
  FORECAST_END_YEAR,
  getForecastChange,
  getForecastPressureClass,
  getForecastPressureScore,
  getForecastProbability,
  getForecastSeries,
} from '../../utils/urbanForecast'

import {
  gnSummaries,
  modelPerformance,
  urbanGridCells,
} from '../../data/urbanData'

// ============================================================
// PRESSURE COLOURS
// ============================================================

const pressureColours = {
  Low: '#58a978',
  Medium: '#dcc763',
  High: '#ec954f',
  'Very High': '#d95e5b',
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PressurePrediction() {
  const {
    forecastYear,
  } = useUrbanForecast()

  const [
    viewMode,
    setViewMode,
  ] = useState('grid')

  const [
    selected,
    setSelected,
  ] = useState(null)

  // ==========================================================
  // DYNAMIC PRESSURE SUMMARY
  // ==========================================================

  const pressureSummary =
    useMemo(() => {
      const classes = [
        'Low',
        'Medium',
        'High',
        'Very High',
      ]

      return classes.map(
        (label) => ({
          label,

          count:
            urbanGridCells.filter(
              (cell) =>
                getForecastPressureClass(
                  cell,
                  forecastYear,
                ) === label,
            ).length,
        }),
      )
    }, [forecastYear])

  // ==========================================================
  // HIGHEST PRESSURE CELLS
  // ==========================================================

  const highestPressureCells =
    useMemo(() => {
      return [
        ...urbanGridCells,
      ]
        .sort(
          (a, b) =>
            getForecastProbability(
              b,
              forecastYear,
            ) -
            getForecastProbability(
              a,
              forecastYear,
            ),
        )
        .slice(0, 7)
    }, [forecastYear])

  // ==========================================================
  // DYNAMIC GN SUMMARIES
  // ==========================================================

  const dynamicGnSummaries =
    useMemo(() => {
      return gnSummaries.map(
        (summary) => {
          const cells =
            urbanGridCells.filter(
              (cell) =>
                cell.gnId ===
                summary.id,
            )

          if (!cells.length) {
            return summary
          }

          const averagePressure =
            cells.reduce(
              (sum, cell) =>
                sum +
                getForecastPressureScore(
                  cell,
                  forecastYear,
                ),
              0,
            ) / cells.length

          const averageProbability =
            cells.reduce(
              (sum, cell) =>
                sum +
                getForecastProbability(
                  cell,
                  forecastYear,
                ),
              0,
            ) / cells.length

          const pressureScore =
            Math.round(
              averagePressure,
            )

          const pressureClass =
            scoreToPressureClass(
              pressureScore,
            )

          return {
            ...summary,

            pressureScore,

            pressureProbability:
              averageProbability,

            pressureClass,

            forecastYear,
          }
        },
      )
    }, [forecastYear])

  // ==========================================================
  // CURRENT SELECTED ITEM
  // ==========================================================

  const selectedItem =
    selected ||
    (viewMode === 'grid'
      ? highestPressureCells[0]
      : dynamicGnSummaries[0])

  const selectedId =
    viewMode === 'grid'
      ? selectedItem?.gridId
      : selectedItem?.id

  // ==========================================================
  // PROBABILITY DISTRIBUTION
  // ==========================================================

  const probabilityDistribution =
    useMemo(() => {
      const bins = [
        {
          range: '0–20%',
          min: 0,
          max: 0.2,
        },
        {
          range: '20–40%',
          min: 0.2,
          max: 0.4,
        },
        {
          range: '40–60%',
          min: 0.4,
          max: 0.6,
        },
        {
          range: '60–80%',
          min: 0.6,
          max: 0.8,
        },
        {
          range: '80–100%',
          min: 0.8,
          max: 1.01,
        },
      ]

      return bins.map(
        (bin) => ({
          range: bin.range,

          cells:
            urbanGridCells.filter(
              (cell) => {
                const probability =
                  getForecastProbability(
                    cell,
                    forecastYear,
                  )

                return (
                  probability >=
                    bin.min &&
                  probability <
                    bin.max
                )
              },
            ).length,
        }),
      )
    }, [forecastYear])

  // ==========================================================
  // HOTSPOT RANKING
  // ==========================================================

  const rankingData =
    useMemo(() => {
      return highestPressureCells.map(
        (cell) => ({
          grid: cell.gridId,

          area:
            cell.gnDivision,

          probability:
            getForecastPressureScore(
              cell,
              forecastYear,
            ),
        }),
      )
    }, [
      highestPressureCells,
      forecastYear,
    ])

  // ==========================================================
  // SELECTED AREA FORECAST SERIES
  // ==========================================================

  const selectedForecastSeries =
    useMemo(() => {
      if (!selectedItem) {
        return []
      }

      // -----------------------------------------------
      // GRID VIEW
      // -----------------------------------------------

      if (
        viewMode === 'grid'
      ) {
        return getForecastSeries(
          selectedItem,
        ).map(
          (item) => ({
            year:
              item.year,

            pressure:
              item.probabilityPercent,
          }),
        )
      }

      // -----------------------------------------------
      // GN SUMMARY VIEW
      // -----------------------------------------------

      const gnCells =
        urbanGridCells.filter(
          (cell) =>
            cell.gnId ===
            selectedItem.id,
        )

      return Array.from(
        {
          length:
            FORECAST_END_YEAR -
            FORECAST_START_YEAR +
            1,
        },
        (_, index) => {
          const year =
            FORECAST_START_YEAR +
            index

          const average =
            gnCells.length
              ? gnCells.reduce(
                  (
                    sum,
                    cell,
                  ) =>
                    sum +
                    getForecastPressureScore(
                      cell,
                      year,
                    ),
                  0,
                ) /
                gnCells.length
              : 0

          return {
            year,

            pressure:
              Math.round(
                average,
              ),
          }
        },
      )
    }, [
      selectedItem,
      viewMode,
    ])

  // ==========================================================
  // VIEW SWITCH
  // ==========================================================

  function changeView(mode) {
    setViewMode(mode)
    setSelected(null)
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <PageHeader
        eyebrow="Multi-Horizon Urbanization Pressure Forecasting"
        title="Where May Urban Development Pressure Increase?"
        subtitle={`Use the 2025 baseline to explore future urbanization-pressure forecasts from ${FORECAST_START_YEAR} to ${FORECAST_END_YEAR}.`}
        right={
          <span className="badge-orange">
            {forecastYear} Forecast
          </span>
        }
      />

      <DisclaimerBadges />

      {/* ===================================================== */}
      {/* FORECAST YEAR SELECTOR */}
      {/* ===================================================== */}

      <section className="mt-5">
        <ForecastYearSelector />
      </section>

      {/* ===================================================== */}
      {/* FORECAST TIMELINE */}
      {/* ===================================================== */}

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* BASELINE */}

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CalendarDays
                size={18}
              />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Observed baseline
              </div>

              <div className="text-lg font-bold text-slate-900">
                2025
              </div>
            </div>
          </div>

          <div className="hidden h-px flex-1 bg-slate-200 lg:block" />

          {/* FORECAST YEARS */}

          <div className="flex flex-wrap items-center gap-2">
            {Array.from(
              {
                length:
                  FORECAST_END_YEAR -
                  FORECAST_START_YEAR +
                  1,
              },
              (
                _,
                index,
              ) =>
                FORECAST_START_YEAR +
                index,
            ).map(
              (year) => (
                <div
                  key={year}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                    year ===
                    forecastYear
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {year}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* DYNAMIC PRESSURE SUMMARY */}
      {/* ===================================================== */}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pressureSummary.map(
          (item) => (
            <PressureSummaryCard
              key={item.label}
              label={item.label}
              count={item.count}
              total={
                urbanGridCells.length
              }
              color={
                pressureColours[
                  item.label
                ]
              }
            />
          ),
        )}
      </div>

      {/* ===================================================== */}
      {/* MAIN FORECAST MAP */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="section-title">
              {forecastYear}{' '}
              Urbanization Pressure
            </h2>

            <p className="muted mt-1">
              Higher probability means
              stronger predicted future
              non-built-to-built conversion
              pressure.
            </p>
          </div>

          {/* VIEW SWITCH */}

          <div className="flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() =>
                changeView(
                  'grid',
                )
              }
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                viewMode ===
                'grid'
                  ? 'bg-[#0F2E28] text-white'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              Grid View
            </button>

            <button
              type="button"
              onClick={() =>
                changeView(
                  'gn',
                )
              }
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                viewMode ===
                'gn'
                  ? 'bg-[#0F2E28] text-white'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              GN Summary
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:h-[470px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <UrbanIntelligenceMap
            mode="pressure"
            viewMode={
              viewMode
            }
            selectedId={
              selectedId
            }
            onSelect={
              setSelected
            }
            forecastYear={
              forecastYear
            }
            height={470}
          />

          <PressureDetailPanel
            item={
              selectedItem
            }
            viewMode={
              viewMode
            }
            forecastYear={
              forecastYear
            }
          />
        </div>

        {viewMode ===
          'gn' && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            GN/locality values are
            aggregated from the
            fine-grid forecast for the
            selected year. Fine-grid
            cells remain the main
            prediction unit.
          </div>
        )}
      </section>

      {/* ===================================================== */}
      {/* FORECAST TREND */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="section-title">
              2026–2035 Pressure Forecast
            </h2>

            <p className="muted mt-1">
              Shows how predicted
              urbanization pressure changes
              through the forecast horizon
              for the selected{' '}
              {viewMode ===
              'grid'
                ? 'grid cell'
                : 'summary area'}
              .
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 px-4 py-2 text-right">
            <div className="text-[9px] font-bold uppercase tracking-wide text-orange-600">
              Selected year
            </div>

            <div className="text-lg font-bold text-orange-900">
              {forecastYear}
            </div>
          </div>
        </div>

        <div className="mt-5 h-[330px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={
                selectedForecastSeries
              }
              margin={{
                top: 10,
                right: 25,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="year"
                tick={{
                  fontSize: 10,
                }}
              />

              <YAxis
                domain={[
                  0,
                  100,
                ]}
                unit="%"
                tick={{
                  fontSize: 10,
                }}
              />

              <Tooltip
                formatter={(
                  value,
                ) =>
                  `${value}%`
                }
                labelFormatter={(
                  year,
                ) =>
                  `Forecast year ${year}`
                }
              />

              <ReferenceLine
                x={
                  forecastYear
                }
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{
                  value:
                    'Selected',
                  position:
                    'insideTopRight',
                  fontSize: 10,
                }}
              />

              <Line
                type="monotone"
                dataKey="pressure"
                name="Urbanization Pressure"
                stroke="#d86651"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-slate-500">
            {FORECAST_START_YEAR}
          </span>

          <ArrowRight
            size={14}
            className="text-slate-300"
          />

          <span className="font-bold text-orange-700">
            {forecastYear}
          </span>

          <ArrowRight
            size={14}
            className="text-slate-300"
          />

          <span className="text-slate-500">
            {FORECAST_END_YEAR}
          </span>
        </div>
      </section>

      {/* ===================================================== */}
      {/* DISTRIBUTION + HOTSPOTS */}
      {/* ===================================================== */}

      <section className="mt-7 grid gap-5 xl:grid-cols-2">
        {/* --------------------------------------------------- */}
        {/* PROBABILITY DISTRIBUTION */}
        {/* --------------------------------------------------- */}

        <div className="card-pad">
          <div>
            <h2 className="section-title">
              {forecastYear}{' '}
              Probability Distribution
            </h2>

            <p className="muted mt-1">
              Distribution of predicted
              conversion probabilities
              across all grid cells.
            </p>
          </div>

          <div className="mt-5 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  probabilityDistribution
                }
                margin={{
                  top: 10,
                  right: 20,
                  left: -10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="range"
                  tick={{
                    fontSize: 10,
                  }}
                />

                <YAxis
                  allowDecimals={
                    false
                  }
                  tick={{
                    fontSize: 10,
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="cells"
                  name="Grid Cells"
                  fill="#c9824b"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --------------------------------------------------- */}
        {/* HOTSPOT RANKING */}
        {/* --------------------------------------------------- */}

        <div className="card-pad">
          <div>
            <h2 className="section-title">
              {forecastYear}{' '}
              Forecast Hotspots
            </h2>

            <p className="muted mt-1">
              Grid cells with the highest
              predicted future pressure.
            </p>
          </div>

          <div className="mt-5 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  rankingData
                }
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={
                    false
                  }
                />

                <XAxis
                  type="number"
                  domain={[
                    0,
                    100,
                  ]}
                  unit="%"
                  tick={{
                    fontSize: 10,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="grid"
                  width={65}
                  tick={{
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  formatter={(
                    value,
                  ) =>
                    `${value}%`
                  }
                  labelFormatter={(
                    grid,
                  ) => {
                    const row =
                      rankingData.find(
                        (
                          item,
                        ) =>
                          item.grid ===
                          grid,
                      )

                    return row
                      ? `${row.grid} · ${row.area}`
                      : grid
                  }}
                />

                <Bar
                  dataKey="probability"
                  name={`${forecastYear} Pressure`}
                  fill="#d86651"
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
        </div>
      </section>

      {/* ===================================================== */}
      {/* MODEL COMPARISON */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h2 className="section-title">
              Model Comparison
            </h2>

            <p className="muted mt-1">
              Candidate models are compared
              before selecting the final
              urbanization-pressure model.
            </p>

            <div className="mt-5 h-[285px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    modelPerformance
                  }
                  margin={{
                    top: 10,
                    right: 20,
                    left: -10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="model"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    domain={[
                      0,
                      1,
                    ]}
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="rocAuc"
                    name="ROC-AUC"
                    fill="#17846c"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="f1"
                    name="F1-Score"
                    fill="#518eaf"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MODEL SUMMARY */}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
              <BrainCircuit
                size={20}
              />
            </div>

            <div className="mt-4 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Prototype Model
            </div>

            <div className="mt-2 text-3xl font-bold text-emerald-950">
              XGBoost
            </div>

            <p className="mt-3 text-xs leading-5 text-emerald-700">
              Final model selection will
              consider temporal validation,
              spatial generalization and
              probability calibration.
            </p>

            <Link
              to="/urban/methodology"
              className="btn-secondary mt-5 w-full justify-center"
            >
              Methodology & Validation
              <ArrowRight
                size={15}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* IMPORTANT DISTINCTION */}
      {/* ===================================================== */}

      <section className="mt-7 rounded-2xl border border-orange-200 bg-orange-50 p-5">
        <div className="flex items-start gap-3">
          <MapPinned
            size={19}
            className="mt-0.5 shrink-0 text-orange-700"
          />

          <div>
            <div className="text-sm font-bold text-orange-950">
              Forecast pressure is not the
              same as development suitability
            </div>

            <p className="mt-1 text-sm leading-6 text-orange-800">
              The forecast estimates where
              urban conversion pressure may
              increase. Development
              suitability is evaluated
              independently using planning
              and environmental criteria.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// ============================================================
// PRESSURE SUMMARY CARD
// ============================================================

function PressureSummaryCard({
  label,
  count,
  total,
  color,
}) {
  const percent =
    total > 0
      ? (count / total) *
        100
      : 0

  return (
    <div className="card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">
            {label} Pressure
          </div>

          <div className="mt-2 text-3xl font-bold text-slate-900">
            {count}
          </div>

          <div className="mt-1 text-[10px] text-slate-400">
            {percent.toFixed(
              0,
            )}
            % of grid cells
          </div>
        </div>

        <div
          className="grid h-10 w-10 place-items-center rounded-full text-white"
          style={{
            backgroundColor:
              color,
          }}
        >
          <Gauge size={17} />
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(
              5,
              percent,
            )}%`,

            backgroundColor:
              color,
          }}
        />
      </div>
    </div>
  )
}

// ============================================================
// PRESSURE DETAIL PANEL
// ============================================================

function PressureDetailPanel({
  item,
  viewMode,
  forecastYear,
}) {
  if (!item) {
    return null
  }

  // ==========================================================
  // GN SUMMARY
  // ==========================================================

  if (
    viewMode === 'gn'
  ) {
    const pressureScore =
      Number(
        item.pressureScore ||
          0,
      )

    return (
      <div className="card-pad h-full min-h-0 overflow-y-auto">
        <div className="eyebrow">
          Selected Summary Area
        </div>

        <h3 className="mt-2 text-xl font-bold text-slate-900">
          {item.gnDivision}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {item.cellCount} grid
          cells
        </p>

        <div className="mt-5">
          <PressureBadge
            level={
              item.pressureClass
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-orange-50 p-5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700">
            {forecastYear}{' '}
            Pressure Score
          </div>

          <div className="mt-2 text-4xl font-bold text-orange-900">
            {pressureScore}
          </div>

          <div className="text-xs text-orange-700">
            / 100
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <InfoRow
            label="Road access"
            value={`${item.roadAccess}/100`}
          />

          <InfoRow
            label="Building density"
            value={`${item.buildingDensity}/100`}
          />

          <InfoRow
            label="Distance to town"
            value={`${item.distanceToTown} km`}
          />

          <InfoRow
            label="Green → Built"
            value={`${item.greenToBuilt}%`}
          />
        </div>
      </div>
    )
  }

  // ==========================================================
  // GRID CELL
  // ==========================================================

  const probability =
    getForecastProbability(
      item,
      forecastYear,
    )

  const pressureScore =
    getForecastPressureScore(
      item,
      forecastYear,
    )

  const pressureClass =
    getForecastPressureClass(
      item,
      forecastYear,
    )

  const change =
    getForecastChange(
      item,
      forecastYear,
    )

  const topDrivers =
    item.pressureDrivers?.slice(
      0,
      3,
    ) || []

  return (
    <div className="card-pad h-full min-h-0 overflow-y-auto">
      {/* GRID */}

      <div className="eyebrow">
        Selected Grid Cell
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {item.gridId}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {item.gnDivision}
          </p>
        </div>

        <PressureBadge
          level={
            pressureClass
          }
        />
      </div>

      {/* SELECTED YEAR */}

      <div className="mt-5 rounded-2xl bg-orange-50 p-5 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700">
          {forecastYear}{' '}
          Conversion Probability
        </div>

        <div className="mt-2 text-4xl font-bold text-orange-900">
          {Math.round(
            probability *
              100,
          )}
          %
        </div>

        <div className="mt-1 text-xs text-orange-700">
          {pressureClass}{' '}
          pressure
        </div>
      </div>

      {/* FORECAST CHANGE */}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Change from 2026
          </div>

          <div className="mt-1 text-sm font-bold text-slate-800">
            {change >= 0
              ? '+'
              : ''}
            {change} percentage
            points
          </div>
        </div>

        <TrendingUp
          size={17}
          className={
            change >= 0
              ? 'text-orange-600'
              : 'text-emerald-600'
          }
        />
      </div>

      {/* MAIN FEATURES */}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniMetric
          label="Road Access"
          value={`${item.roadAccess}/100`}
        />

        <MiniMetric
          label="Nearby Built"
          value={`${item.nearbyBuilt2025}%`}
        />

        <MiniMetric
          label="Built Edge"
          value={`${item.distanceBuiltEdge} m`}
        />

        <MiniMetric
          label="Previous Growth"
          value={`${item.previousGrowth}%`}
        />
      </div>

      {/* XAI PREVIEW */}

      <div className="mt-5">
        <div className="text-xs font-bold text-slate-700">
          Main pressure drivers
        </div>

        <div className="mt-3 space-y-2">
          {topDrivers.map(
            (driver) => (
              <DriverRow
                key={
                  driver.feature
                }
                driver={
                  driver
                }
              />
            ),
          )}
        </div>
      </div>

      <Link
        to="/urban/xai"
        className="btn-secondary mt-5 w-full justify-center"
      >
        Full XAI Explanation
        <ArrowRight
          size={15}
        />
      </Link>

      {/* SCORE FOR INTERNAL CONSISTENCY */}

      <div className="mt-4 text-center text-[9px] text-slate-400">
        Pressure score:{' '}
        {pressureScore}/100
      </div>
    </div>
  )
}

// ============================================================
// DRIVER ROW
// ============================================================

function DriverRow({
  driver,
}) {
  const increasing =
    driver.direction ===
    'increase'

  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
          increasing
            ? 'bg-red-50 text-red-600'
            : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        {increasing ? (
          <ArrowUp
            size={14}
          />
        ) : (
          <ArrowDown
            size={14}
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-700">
          {driver.feature}
        </div>

        <div className="mt-0.5 text-[10px] text-slate-500">
          {increasing
            ? 'Increases pressure'
            : 'Reduces pressure'}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MINI METRIC
// ============================================================

function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </div>
    </div>
  )
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-bold text-slate-800">
        {value}
      </span>
    </div>
  )
}

// ============================================================
// SCORE → PRESSURE CLASS
// ============================================================

function scoreToPressureClass(
  score,
) {
  if (score >= 80) {
    return 'Very High'
  }

  if (score >= 60) {
    return 'High'
  }

  if (score >= 40) {
    return 'Medium'
  }

  return 'Low'
}