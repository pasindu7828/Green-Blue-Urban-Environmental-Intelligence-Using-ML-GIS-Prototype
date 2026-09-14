import {
  useMemo,
  useState,
} from 'react'

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  Building2,
  ChevronDown,
  Leaf,
  Lightbulb,
  MapPinned,
  Search,
  TrendingUp,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

import ForecastYearSelector from '../../components/urban/ForecastYearSelector'

import {
  useUrbanForecast,
} from '../../contexts/UrbanForecastContext'

import {
  getForecastPressureClass,
  getForecastPressureScore,
} from '../../utils/urbanForecast'

import {
  featureImportance,
  urbanGridCells,
} from '../../data/urbanData'

// ============================================================
// FRIENDLY FEATURE NAMES
// ============================================================

function friendlyFeatureName(value) {
  const names = {
    'Nearby built-up growth':
      'Nearby urban growth',

    'Previous neighbourhood growth':
      'Previous local growth',

    'Road accessibility':
      'Road accessibility',

    'Building density':
      'Nearby buildings',

    'Distance to built-up edge':
      'Closeness to existing development',

    'Green-to-built conversion':
      'Previous green-to-built change',

    Slope:
      'Terrain slope',
  }

  return names[value] || value
}

// ============================================================
// HELPERS
// ============================================================

function average(
  items,
  getter,
) {
  if (!items.length) {
    return 0
  }

  return (
    items.reduce(
      (sum, item) =>
        sum +
        Number(
          getter(item) || 0,
        ),
      0,
    ) / items.length
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ExplainableAI() {
  const {
    forecastYear,
  } = useUrbanForecast()

  const [
    selectedCell,
    setSelectedCell,
  ] = useState(null)

  // ==========================================================
  // SORT GRID CELLS
  // ==========================================================

  const sortedCells =
    useMemo(() => {
      return [
        ...urbanGridCells,
      ].sort(
        (a, b) =>
          a.gridId.localeCompare(
            b.gridId,
          ),
      )
    }, [])

  // ==========================================================
  // DEFAULT LOCATION
  // ==========================================================

  const defaultCell =
    useMemo(() => {
      return [
        ...urbanGridCells,
      ].sort(
        (a, b) =>
          getForecastPressureScore(
            b,
            forecastYear,
          ) -
          getForecastPressureScore(
            a,
            forecastYear,
          ),
      )[0]
    }, [forecastYear])

  const activeCell =
    selectedCell ||
    defaultCell ||
    urbanGridCells[0]

  // ==========================================================
  // PREDICTION
  // ==========================================================

  const pressureScore =
    getForecastPressureScore(
      activeCell,
      forecastYear,
    )

  const pressureClass =
    getForecastPressureClass(
      activeCell,
      forecastYear,
    )

  // ==========================================================
  // LOCAL PREDICTION REASONS
  // ==========================================================

  const localDrivers =
    useMemo(() => {
      const drivers =
        activeCell?.pressureDrivers ||
        []

      return drivers
        .slice(0, 4)
        .map(
          (
            driver,
            index,
          ) => ({
            ...driver,

            rank:
              index + 1,

            displayName:
              friendlyFeatureName(
                driver.feature,
              ),

            strength:
              Math.round(
                Math.min(
                  100,
                  Number(
                    driver.score ||
                      0,
                  ),
                ),
              ),
          }),
        )
    }, [activeCell])

  // ==========================================================
  // KADUWELA AVERAGES
  // ==========================================================

  const kaduwelaAverage =
    useMemo(() => {
      return {
        roadAccess:
          Math.round(
            average(
              urbanGridCells,
              (cell) =>
                cell.roadAccess,
            ),
          ),

        nearbyBuilt:
          Math.round(
            average(
              urbanGridCells,
              (cell) =>
                cell.nearbyBuilt2025,
            ),
          ),

        previousGrowth:
          Math.round(
            average(
              urbanGridCells,
              (cell) =>
                cell.previousGrowth,
            ),
          ),

        buildingDensity:
          Math.round(
            average(
              urbanGridCells,
              (cell) =>
                cell.buildingDensity,
            ),
          ),
      }
    }, [])

  // ==========================================================
  // SELECTED LOCATION VS KADUWELA
  // ==========================================================

  const comparisonData =
    useMemo(() => {
      return [
        {
          factor:
            'Road Access',

          selected:
            Number(
              activeCell.roadAccess ||
                0,
            ),

          average:
            kaduwelaAverage.roadAccess,
        },

        {
          factor:
            'Nearby Built-Up',

          selected:
            Number(
              activeCell.nearbyBuilt2025 ||
                0,
            ),

          average:
            kaduwelaAverage.nearbyBuilt,
        },

        {
          factor:
            'Previous Growth',

          selected:
            Number(
              activeCell.previousGrowth ||
                0,
            ),

          average:
            kaduwelaAverage.previousGrowth,
        },

        {
          factor:
            'Building Density',

          selected:
            Number(
              activeCell.buildingDensity ||
                0,
            ),

          average:
            kaduwelaAverage.buildingDensity,
        },
      ]
    }, [
      activeCell,
      kaduwelaAverage,
    ])

  // ==========================================================
  // GLOBAL MODEL IMPORTANCE
  // ==========================================================

  const globalImportance =
    useMemo(() => {
      return featureImportance
        .slice(0, 6)
        .map(
          (item) => ({
            factor:
              friendlyFeatureName(
                item.name,
              ),

            importance:
              Number(
                item.value || 0,
              ),
          }),
        )
    }, [])

  // ==========================================================
  // DROPDOWN
  // ==========================================================

  function selectGrid(
    gridId,
  ) {
    const cell =
      urbanGridCells.find(
        (item) =>
          item.gridId ===
          gridId,
      )

    if (cell) {
      setSelectedCell(cell)
    }
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
        eyebrow="Prediction Explanation"
        title="Why Did the Model Predict This?"
        subtitle={`Understand the main reasons behind the ${forecastYear} urbanization-pressure prediction for a selected location.`}
        right={
          <ForecastYearSelector
            compact
          />
        }
      />

      <DisclaimerBadges />

      {/* ===================================================== */}
      {/* SELECT LOCATION */}
      {/* ===================================================== */}

      <section className="card-pad mt-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="section-title">
              Select a Location
            </h2>

            <p className="muted mt-1">
              Choose a grid cell to
              understand its future
              urbanization-pressure
              prediction.
            </p>
          </div>

          <div className="relative min-w-[285px]">
            <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Grid Cell
            </div>

            <div className="relative">
              <select
                value={
                  activeCell?.gridId ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  selectGrid(
                    event.target.value,
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {sortedCells.map(
                  (cell) => (
                    <option
                      key={
                        cell.gridId
                      }
                      value={
                        cell.gridId
                      }
                    >
                      {cell.gridId} ·{' '}
                      {
                        cell.gnDivision
                      }
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* SIMPLE LOCATION SNAPSHOT */}
      {/* ===================================================== */}

      <section className="card-pad mt-6">
        <LocationSnapshot
          cell={
            activeCell
          }
          forecastYear={
            forecastYear
          }
          pressureScore={
            pressureScore
          }
          pressureClass={
            pressureClass
          }
          localDrivers={
            localDrivers
          }
        />
      </section>

      {/* ===================================================== */}
      {/* HISTORICAL STORY */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            What Has Happened Here?
          </h2>

          <p className="muted mt-1">
            Historical green-cover and
            built-up change provide
            useful context for the
            future prediction.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
          <HistoryCard
            icon={Leaf}
            label="Green Cover"
            year="2015"
            value={`${activeCell.green2015}%`}
            tone="green"
          />

          <FlowArrow />

          <HistoryCard
            icon={Leaf}
            label="Green Cover"
            year="2025"
            value={`${activeCell.green2025}%`}
            tone="green"
          />

          <FlowArrow />

          <HistoryCard
            icon={Building2}
            label="Green → Built"
            year="2015–2025"
            value={`${activeCell.greenToBuilt}%`}
            tone="orange"
          />

          <FlowArrow />

          <HistoryCard
            icon={TrendingUp}
            label="Predicted Pressure"
            year={forecastYear}
            value={`${pressureScore}%`}
            tone="red"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SmallMetric
            label="Historical Green Loss"
            value={`${activeCell.greenLoss}%`}
          />

          <SmallMetric
            label="Built-Up Growth"
            value={`+${activeCell.builtGrowth}%`}
          />

          <SmallMetric
            label="NDVI · 2025"
            value={
              activeCell.ndvi2025
            }
          />

          <SmallMetric
            label="NDBI · 2025"
            value={
              activeCell.ndbi2025
            }
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* LOCAL REASONS */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="section-title">
              Why This Prediction?
            </h2>

            <p className="muted mt-1">
              These are the strongest
              factors influencing the
              prediction for{' '}
              {activeCell.gridId}.
            </p>
          </div>

          <div className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-[10px] font-bold text-purple-700">
            Explainable AI · SHAP
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {localDrivers.map(
            (driver) => (
              <DriverCard
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

        {/* SIMPLE EXPLANATION */}

        <div className="mt-5 rounded-2xl border border-purple-100 bg-purple-50 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-purple-700">
              <Lightbulb
                size={17}
              />
            </div>

            <div>
              <div className="text-sm font-bold text-purple-950">
                Simple Explanation
              </div>

              <p className="mt-1 text-xs leading-5 text-purple-800">
                {buildSimpleExplanation(
                  activeCell,
                  pressureScore,
                  pressureClass,
                  forecastYear,
                  localDrivers,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* SELECTED LOCATION VS KADUWELA */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            How Is This Location
            Different From Kaduwela
            Overall?
          </h2>

          <p className="muted mt-1">
            Compare important
            urban-development
            conditions in this location
            with the average across the
            study area.
          </p>
        </div>

        <div className="mt-5 h-[350px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={
                comparisonData
              }
              layout="vertical"
              margin={{
                top: 5,
                right: 35,
                left: 45,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                domain={[
                  0,
                  100,
                ]}
                tick={{
                  fontSize: 10,
                }}
              />

              <YAxis
                type="category"
                dataKey="factor"
                width={125}
                tick={{
                  fontSize: 10,
                }}
              />

              <Tooltip
                formatter={(
                  value,
                ) =>
                  `${value}/100`
                }
              />

              <Legend />

              <Bar
                dataKey="selected"
                name="Selected Location"
                fill="#d87845"
                radius={[
                  0,
                  5,
                  5,
                  0,
                ]}
              />

              <Bar
                dataKey="average"
                name="Kaduwela Average"
                fill="#8ca0ad"
                radius={[
                  0,
                  5,
                  5,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <MapPinned
              size={17}
              className="mt-0.5 shrink-0 text-slate-500"
            />

            <p className="text-xs leading-5 text-slate-600">
              {buildComparisonMessage(
                activeCell,
                kaduwelaAverage,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* GLOBAL IMPORTANCE */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            What Usually Influences
            Urbanization Pressure?
          </h2>

          <p className="muted mt-1">
            These are the factors that
            are generally important to
            the model across the whole
            study area.
          </p>
        </div>

        <div className="mt-5 h-[350px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={
                globalImportance
              }
              layout="vertical"
              margin={{
                top: 5,
                right: 35,
                left: 65,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                domain={[
                  0,
                  100,
                ]}
                tick={{
                  fontSize: 10,
                }}
              />

              <YAxis
                type="category"
                dataKey="factor"
                width={165}
                tick={{
                  fontSize: 10,
                }}
              />

              <Tooltip
                formatter={(
                  value,
                ) =>
                  `${value}/100 relative importance`
                }
              />

              <Bar
                dataKey="importance"
                name="Relative Importance"
                fill="#6d8298"
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

        <div className="mt-3 text-center text-[10px] text-slate-400">
          These values show prototype
          model importance, not
          development-suitability
          importance.
        </div>
      </section>

      {/* ===================================================== */}
      {/* SIMPLE INTERPRETATION */}
      {/* ===================================================== */}

      <section className="mt-7">
        <div>
          <h2 className="section-title">
            What Should Planners
            Understand?
          </h2>

          <p className="muted mt-1">
            The explanation helps users
            understand the prediction
            without needing to
            understand the internal
            machine-learning model.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <UnderstandingCard
            icon={TrendingUp}
            title={`${pressureClass} Predicted Pressure`}
            text={`${activeCell.gridId} has a ${forecastYear} urbanization-pressure score of ${pressureScore}%.`}
            tone="orange"
          />

          <UnderstandingCard
            icon={BrainCircuit}
            title="Main Prediction Reasons"
            text={
              buildReasonCardText(
                localDrivers,
              )
            }
            tone="purple"
          />

          <UnderstandingCard
            icon={Search}
            title="Separate Planning Assessments"
            text="These reasons explain urbanization pressure only. Development suitability and green-conservation priority are assessed separately."
            tone="blue"
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* FINAL TAKEAWAY */}
      {/* ===================================================== */}

      <section className="mt-7 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-purple-700">
              <BrainCircuit
                size={18}
              />
            </div>

            <div>
              <div className="text-sm font-bold text-purple-950">
                The system shows both
                the prediction and the
                reasons behind it.
              </div>

              <p className="mt-1 text-xs leading-5 text-purple-800">
                Instead of giving only a
                forecast percentage,
                users can also understand
                which local conditions
                influenced that result.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
            <span className="text-xs font-semibold text-orange-700">
              Prediction
            </span>

            <span className="text-slate-400">
              +
            </span>

            <span className="text-xs font-semibold text-purple-700">
              Reasons
            </span>

            <ArrowRight
              size={14}
              className="text-slate-400"
            />

            <span className="text-xs font-bold text-slate-900">
              Better Understanding
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

// ============================================================
// LOCATION SNAPSHOT
// ============================================================

function LocationSnapshot({
  cell,
  forecastYear,
  pressureScore,
  pressureClass,
  localDrivers,
}) {
  if (!cell) {
    return null
  }

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="eyebrow">
            Selected Location
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">
              {cell.gridId}
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {cell.gnDivision}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Future urbanization-pressure
            explanation for{' '}
            {forecastYear}.
          </p>
        </div>

        <PressureBadge
          level={
            pressureClass
          }
        />
      </div>

      {/* MAIN SNAPSHOT */}

      <div className="mt-6 grid gap-7 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* PRESSURE */}

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-700">
            {forecastYear}{' '}
            Urbanization Pressure
          </div>

          <div className="mt-4 text-6xl font-black text-orange-950">
            {pressureScore}
            <span className="text-2xl text-orange-700">
              %
            </span>
          </div>

          <div className="mt-2 text-sm font-bold text-orange-800">
            {pressureClass}{' '}
            Pressure
          </div>

          {/* PRESSURE BAR */}

          <div className="mt-6">
            <div className="relative h-4 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{
                  width: `${pressureScore}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[9px] font-semibold text-slate-400">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
              <span>Very High</span>
            </div>
          </div>
        </div>

        {/* KEY CONDITIONS */}

        <div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Key Conditions in This
              Location
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              A quick view of the local
              conditions considered by
              the prediction model.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SnapshotMetric
              label="Road Accessibility"
              value={
                cell.roadAccess
              }
              suffix="/100"
            />

            <SnapshotMetric
              label="Nearby Built-Up"
              value={
                cell.nearbyBuilt2025
              }
              suffix="%"
            />

            <SnapshotMetric
              label="Previous Local Growth"
              value={
                cell.previousGrowth
              }
              suffix="/100"
            />

            <SnapshotMetric
              label="Building Density"
              value={
                cell.buildingDensity
              }
              suffix="/100"
            />
          </div>

          {/* ONE-LINE REASON */}

          <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <BrainCircuit
                size={16}
                className="mt-0.5 shrink-0 text-purple-600"
              />

              <p className="text-xs leading-5 text-purple-800">
                {buildShortSnapshotMessage(
                  pressureClass,
                  localDrivers,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SNAPSHOT METRIC
// ============================================================

function SnapshotMetric({
  label,
  value,
  suffix,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-2 text-xl font-bold text-slate-900">
        {value}
        <span className="ml-1 text-xs font-semibold text-slate-400">
          {suffix}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-600"
          style={{
            width: `${Math.min(
              100,
              Number(value || 0),
            )}%`,
          }}
        />
      </div>
    </div>
  )
}

// ============================================================
// HISTORY CARD
// ============================================================

function HistoryCard({
  icon: Icon,
  label,
  year,
  value,
  tone,
}) {
  const tones = {
    green:
      'border-emerald-200 bg-emerald-50 text-emerald-800',

    orange:
      'border-orange-200 bg-orange-50 text-orange-800',

    red:
      'border-red-200 bg-red-50 text-red-800',
  }

  return (
    <div
      className={`rounded-2xl border p-4 ${tones[tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white">
          <Icon
            size={16}
          />
        </div>

        <span className="text-[10px] font-bold opacity-70">
          {year}
        </span>
      </div>

      <div className="mt-4 text-[10px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </div>

      <div className="mt-1 text-2xl font-bold">
        {value}
      </div>
    </div>
  )
}

// ============================================================
// FLOW ARROW
// ============================================================

function FlowArrow() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <ArrowRight
        size={18}
        className="text-slate-400"
      />
    </div>
  )
}

// ============================================================
// SMALL METRIC
// ============================================================

function SmallMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
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
// DRIVER CARD
// ============================================================

function DriverCard({
  driver,
}) {
  const increasing =
    driver.direction ===
    'increase'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        {/* ICON */}

        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            increasing
              ? 'bg-red-50 text-red-600'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {increasing ? (
            <ArrowUp
              size={18}
            />
          ) : (
            <ArrowDown
              size={18}
            />
          )}
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900">
                {
                  driver.displayName
                }
              </div>

              <div
                className={`mt-1 text-[10px] font-semibold ${
                  increasing
                    ? 'text-red-600'
                    : 'text-emerald-700'
                }`}
              >
                {increasing
                  ? 'Increases predicted pressure'
                  : 'Reduces predicted pressure'}
              </div>
            </div>

            <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-400">
              #{driver.rank}
            </span>
          </div>

          {/* STRENGTH */}

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[9px] text-slate-400">
                Influence strength
              </span>

              <span className="text-[10px] font-bold text-slate-600">
                {
                  driver.strength
                }
                /100
              </span>
            </div>

            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  increasing
                    ? 'bg-red-500'
                    : 'bg-emerald-600'
                }`}
                style={{
                  width: `${driver.strength}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// UNDERSTANDING CARD
// ============================================================

function UnderstandingCard({
  icon: Icon,
  title,
  text,
  tone,
}) {
  const tones = {
    orange:
      'border-orange-200 bg-orange-50 text-orange-800',

    purple:
      'border-purple-200 bg-purple-50 text-purple-800',

    blue:
      'border-blue-200 bg-blue-50 text-blue-800',
  }

  return (
    <div
      className={`rounded-2xl border p-5 ${tones[tone]}`}
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white">
        <Icon
          size={17}
        />
      </div>

      <h3 className="mt-4 text-sm font-bold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 opacity-85">
        {text}
      </p>
    </div>
  )
}

// ============================================================
// SIMPLE EXPLANATION
// ============================================================

function buildSimpleExplanation(
  cell,
  pressureScore,
  pressureClass,
  year,
  drivers,
) {
  if (!drivers.length) {
    return `The model estimates ${pressureClass.toLowerCase()} urbanization pressure (${pressureScore}%) for ${cell.gridId} in ${year}, based on the combination of local spatial conditions.`
  }

  const increasingDrivers =
    drivers.filter(
      (driver) =>
        driver.direction ===
        'increase',
    )

  const reducingDrivers =
    drivers.filter(
      (driver) =>
        driver.direction !==
        'increase',
    )

  const first =
    increasingDrivers[0]
      ?.displayName

  const second =
    increasingDrivers[1]
      ?.displayName

  let message =
    `The model estimates ${pressureClass.toLowerCase()} urbanization pressure (${pressureScore}%) for ${cell.gridId} in ${year}.`

  if (first && second) {
    message += ` The strongest factors increasing this prediction are ${first.toLowerCase()} and ${second.toLowerCase()}.`
  } else if (first) {
    message += ` One of the strongest factors increasing the prediction is ${first.toLowerCase()}.`
  }

  if (
    reducingDrivers.length
  ) {
    message += ` ${reducingDrivers[0].displayName} helps reduce the predicted pressure.`
  }

  return message
}

// ============================================================
// SHORT SNAPSHOT MESSAGE
// ============================================================

function buildShortSnapshotMessage(
  pressureClass,
  drivers,
) {
  if (!drivers.length) {
    return `This location currently receives ${pressureClass.toLowerCase()} predicted pressure based on the combined effect of its spatial conditions.`
  }

  const increasing =
    drivers.filter(
      (driver) =>
        driver.direction ===
        'increase',
    )

  if (
    increasing.length >= 2
  ) {
    return `This location receives ${pressureClass.toLowerCase()} predicted pressure mainly because of ${increasing[0].displayName.toLowerCase()} and ${increasing[1].displayName.toLowerCase()}.`
  }

  if (
    increasing.length === 1
  ) {
    return `This location receives ${pressureClass.toLowerCase()} predicted pressure, with ${increasing[0].displayName.toLowerCase()} as one of the main influences.`
  }

  return `This location receives ${pressureClass.toLowerCase()} predicted pressure based on several combined spatial conditions.`
}

// ============================================================
// COMPARISON MESSAGE
// ============================================================

function buildComparisonMessage(
  cell,
  averages,
) {
  const higher = []

  if (
    Number(
      cell.roadAccess || 0,
    ) >
    averages.roadAccess + 5
  ) {
    higher.push(
      'road accessibility',
    )
  }

  if (
    Number(
      cell.nearbyBuilt2025 ||
        0,
    ) >
    averages.nearbyBuilt + 5
  ) {
    higher.push(
      'nearby built-up development',
    )
  }

  if (
    Number(
      cell.previousGrowth ||
        0,
    ) >
    averages.previousGrowth + 5
  ) {
    higher.push(
      'previous local growth',
    )
  }

  if (
    Number(
      cell.buildingDensity ||
        0,
    ) >
    averages.buildingDensity + 5
  ) {
    higher.push(
      'building density',
    )
  }

  if (
    higher.length >= 2
  ) {
    return `${cell.gridId} has stronger ${higher
      .slice(0, 3)
      .join(', ')} than the Kaduwela average. This helps explain why the model may assign greater urbanization pressure to this location.`
  }

  if (
    higher.length === 1
  ) {
    return `${cell.gridId} is above the Kaduwela average mainly for ${higher[0]}. The other compared conditions are closer to the overall study-area average.`
  }

  return `${cell.gridId} is close to or below the Kaduwela average for these major indicators. Its prediction therefore comes from the combined effect of several spatial conditions rather than one unusually strong factor.`
}

// ============================================================
// REASON CARD TEXT
// ============================================================

function buildReasonCardText(
  drivers,
) {
  if (!drivers.length) {
    return 'The prediction is influenced by several surrounding spatial conditions.'
  }

  const names =
    drivers
      .slice(0, 3)
      .map(
        (driver) =>
          driver.displayName.toLowerCase(),
      )

  if (
    names.length >= 3
  ) {
    return `The strongest influences are ${names[0]}, ${names[1]} and ${names[2]}.`
  }

  if (
    names.length === 2
  ) {
    return `The strongest influences are ${names[0]} and ${names[1]}.`
  }

  return `The strongest influence is ${names[0]}.`
}