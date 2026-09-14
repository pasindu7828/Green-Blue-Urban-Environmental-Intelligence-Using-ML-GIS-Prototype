import {
  useMemo,
  useState,
} from 'react'

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  MapPinned,
  ShieldAlert,
  Target,
} from 'lucide-react'

import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  DisclaimerBadges,
  PageHeader,
  PressureBadge,
  SuitabilityBadge,
} from '../../components/shared/UrbanUI'

import UrbanIntelligenceMap from '../../components/maps/UrbanIntelligenceMap'

import ForecastYearSelector from '../../components/urban/ForecastYearSelector'

import {
  useUrbanForecast,
} from '../../contexts/UrbanForecastContext'

import {
  getForecastConservationClass,
  getForecastConservationScore,
  getForecastConflictClass,
  getForecastInterventionPriority,
  getForecastPressureClass,
  getForecastPressureScore,
} from '../../utils/urbanForecast'

import {
  gnSummaries,
  urbanGridCells,
} from '../../data/urbanData'

// ============================================================
// CONFLICT COLOURS
// ============================================================

const conflictColours = {
  'Critical Forecast–Planning Conflict':
    '#bd3f42',

  'Development Caution':
    '#e58a43',

  'Conservation Priority':
    '#4b9b66',

  'Managed Growth Opportunity':
    '#4e9ec0',

  'Monitoring / Low Urgency':
    '#b9c5c2',
}

// ============================================================
// BASIC HELPERS
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

export default function ConflictIntervention() {
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
  // CONFLICT SUMMARY
  // ==========================================================

  const conflictSummary =
    useMemo(() => {
      const counts = {
        critical: 0,
        caution: 0,
        conservation: 0,
        managed: 0,
        monitoring: 0,
      }

      urbanGridCells.forEach(
        (cell) => {
          const conflict =
            getForecastConflictClass(
              cell,
              forecastYear,
            )

          if (
            conflict ===
            'Critical Forecast–Planning Conflict'
          ) {
            counts.critical += 1
          } else if (
            conflict ===
            'Development Caution'
          ) {
            counts.caution += 1
          } else if (
            conflict ===
            'Conservation Priority'
          ) {
            counts.conservation += 1
          } else if (
            conflict ===
            'Managed Growth Opportunity'
          ) {
            counts.managed += 1
          } else {
            counts.monitoring += 1
          }
        },
      )

      return counts
    }, [forecastYear])

  // ==========================================================
  // INTERVENTION RANKING
  // ==========================================================

  const rankedCells =
    useMemo(() => {
      const priorityWeight = {
        Critical: 5,
        'Very High': 4,
        High: 3,
        Medium: 2,
        Monitoring: 1,
      }

      return [
        ...urbanGridCells,
      ].sort(
        (a, b) => {
          const priorityA =
            getForecastInterventionPriority(
              a,
              forecastYear,
            )

          const priorityB =
            getForecastInterventionPriority(
              b,
              forecastYear,
            )

          const weightDifference =
            (priorityWeight[
              priorityB
            ] || 0) -
            (priorityWeight[
              priorityA
            ] || 0)

          if (
            weightDifference !== 0
          ) {
            return weightDifference
          }

          const combinedA =
            getForecastPressureScore(
              a,
              forecastYear,
            ) +
            getForecastConservationScore(
              a,
              forecastYear,
            ) -
            Number(
              a.suitabilityScore ||
                0,
            )

          const combinedB =
            getForecastPressureScore(
              b,
              forecastYear,
            ) +
            getForecastConservationScore(
              b,
              forecastYear,
            ) -
            Number(
              b.suitabilityScore ||
                0,
            )

          return (
            combinedB -
            combinedA
          )
        },
      )
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

          const pressureScore =
            Math.round(
              average(
                cells,
                (cell) =>
                  getForecastPressureScore(
                    cell,
                    forecastYear,
                  ),
              ),
            )

          const suitabilityScore =
            Math.round(
              average(
                cells,
                (cell) =>
                  cell.suitabilityScore,
              ),
            )

          const conservationScore =
            Math.round(
              average(
                cells,
                (cell) =>
                  getForecastConservationScore(
                    cell,
                    forecastYear,
                  ),
              ),
            )

          const conflicts =
            cells.map(
              (cell) =>
                getForecastConflictClass(
                  cell,
                  forecastYear,
                ),
            )

          const conflictClass =
            getDominantValue(
              conflicts,
            )

          const interventions =
            cells.map(
              (cell) =>
                getForecastInterventionPriority(
                  cell,
                  forecastYear,
                ),
            )

          const interventionPriority =
            getHighestIntervention(
              interventions,
            )

          const criticalCells =
            cells.filter(
              (cell) =>
                getForecastConflictClass(
                  cell,
                  forecastYear,
                ) ===
                'Critical Forecast–Planning Conflict',
            ).length

          return {
            ...summary,

            pressureScore,

            suitabilityScore,

            conservationScore,

            conflictClass,

            interventionPriority,

            criticalConflictCells:
              criticalCells,
          }
        },
      )
    }, [forecastYear])

  // ==========================================================
  // SELECTED ITEM
  // ==========================================================

  const selectedItem =
    selected ||
    (viewMode === 'grid'
      ? rankedCells[0]
      : dynamicGnSummaries
          .slice()
          .sort(
            (a, b) =>
              b.criticalConflictCells -
              a.criticalConflictCells,
          )[0])

  const selectedId =
    viewMode === 'grid'
      ? selectedItem?.gridId
      : selectedItem?.id

  // ==========================================================
  // DECISION SCATTER DATA
  // ==========================================================

  const decisionData =
    useMemo(() => {
      return urbanGridCells.map(
        (cell) => {
          const pressure =
            getForecastPressureScore(
              cell,
              forecastYear,
            )

          const conflict =
            getForecastConflictClass(
              cell,
              forecastYear,
            )

          return {
            grid:
              cell.gridId,

            area:
              cell.gnDivision,

            pressure,

            suitability:
              Number(
                cell.suitabilityScore ||
                  0,
              ),

            conservation:
              getForecastConservationScore(
                cell,
                forecastYear,
              ),

            conflict,
          }
        },
      )
    }, [forecastYear])

  // ==========================================================
  // CHANGE VIEW
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
        eyebrow="Forecast–Planning Conflict & Intervention"
        title="Where Does Future Growth Need Planning Attention?"
        subtitle={`Compare ${forecastYear} urbanization pressure with development suitability and green-conservation importance.`}
        right={
          <ForecastYearSelector
            compact
          />
        }
      />

      <DisclaimerBadges />

      {/* ===================================================== */}
      {/* SUMMARY CARDS */}
      {/* ===================================================== */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <ConflictSummaryCard
          label="Critical Conflict"
          value={
            conflictSummary.critical
          }
          total={
            urbanGridCells.length
          }
          color="#bd3f42"
        />

        <ConflictSummaryCard
          label="Development Caution"
          value={
            conflictSummary.caution
          }
          total={
            urbanGridCells.length
          }
          color="#e58a43"
        />

        <ConflictSummaryCard
          label="Conservation Priority"
          value={
            conflictSummary.conservation
          }
          total={
            urbanGridCells.length
          }
          color="#4b9b66"
        />

        <ConflictSummaryCard
          label="Managed Growth"
          value={
            conflictSummary.managed
          }
          total={
            urbanGridCells.length
          }
          color="#4e9ec0"
        />

        <ConflictSummaryCard
          label="Lower Urgency"
          value={
            conflictSummary.monitoring
          }
          total={
            urbanGridCells.length
          }
          color="#9aa9a6"
        />
      </div>

      {/* ===================================================== */}
      {/* CONFLICT MAP */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="section-title">
              {forecastYear}{' '}
              Forecast–Planning Conflict
              Map
            </h2>

            <p className="muted mt-1 max-w-3xl">
              Highlights locations where
              future development pressure
              may conflict with lower
              suitability or important
              green-conservation needs.
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
                  ? 'bg-[#0F2E28] text-white shadow-sm'
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
                  ? 'bg-[#0F2E28] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              GN Summary
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:h-[470px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <UrbanIntelligenceMap
            mode="conflict"
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

          <SelectedConflictPanel
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
      </section>

      {/* ===================================================== */}
      {/* PRESSURE × SUITABILITY */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            Pressure vs Development
            Suitability
          </h2>

          <p className="muted mt-1">
            This helps distinguish areas
            where future growth pressure
            is more compatible with
            development from areas that
            need greater planning
            caution.
          </p>
        </div>

        <div className="mt-5 h-[400px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <ScatterChart
              margin={{
                top: 15,
                right: 30,
                bottom: 25,
                left: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                type="number"
                dataKey="pressure"
                name="Urbanization Pressure"
                domain={[
                  0,
                  100,
                ]}
                unit="%"
                tick={{
                  fontSize: 10,
                }}
                label={{
                  value: `${forecastYear} Urbanization Pressure`,
                  position:
                    'insideBottom',
                  offset: -12,
                  fontSize: 11,
                }}
              />

              <YAxis
                type="number"
                dataKey="suitability"
                name="Development Suitability"
                domain={[
                  0,
                  100,
                ]}
                tick={{
                  fontSize: 10,
                }}
                label={{
                  value:
                    'Development Suitability',
                  angle: -90,
                  position:
                    'insideLeft',
                  fontSize: 11,
                }}
              />

              <Tooltip
                content={
                  <DecisionTooltip />
                }
              />

              {/* HIGH PRESSURE */}

              <ReferenceLine
                x={60}
                stroke="#d97706"
                strokeDasharray="5 5"
              />

              {/* HIGHER SUITABILITY */}

              <ReferenceLine
                y={60}
                stroke="#0284c7"
                strokeDasharray="5 5"
              />

              <Scatter
                data={
                  decisionData
                }
                name="Grid Cells"
              >
                {decisionData.map(
                  (item) => (
                    <Cell
                      key={
                        item.grid
                      }
                      fill={
                        conflictColours[
                          item.conflict
                        ] ||
                        '#9aa9a6'
                      }
                    />
                  ),
                )}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* SIMPLE INTERPRETATION */}

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DecisionMeaning
            title="Strong Conflict"
            subtitle="High pressure · Lower suitability"
            text="Needs closer planning review."
            tone="red"
          />

          <DecisionMeaning
            title="Managed Growth"
            subtitle="High pressure · Higher suitability"
            text="More compatible with managed development."
            tone="blue"
          />

          <DecisionMeaning
            title="Lower Immediate Pressure"
            subtitle="Lower pressure · Higher suitability"
            text="Less urgent future development pressure."
            tone="green"
          />

          <DecisionMeaning
            title="Monitor Carefully"
            subtitle="Lower pressure · Lower suitability"
            text="Not urgent, but constraints remain."
            tone="slate"
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* INTERVENTION PRIORITY */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            Where Should Planners Look
            First?
          </h2>

          <p className="muted mt-1">
            Intervention priority combines
            forecast conflict and
            conservation concern to rank
            locations needing closer
            attention.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Grid</th>

                <th>Area</th>

                <th>
                  {forecastYear}{' '}
                  Pressure
                </th>

                <th>
                  Suitability
                </th>

                <th>
                  Conservation
                </th>

                <th>
                  Conflict
                </th>

                <th>
                  Intervention
                </th>
              </tr>
            </thead>

            <tbody>
              {rankedCells
                .slice(
                  0,
                  10,
                )
                .map(
                  (cell) => {
                    const pressureClass =
                      getForecastPressureClass(
                        cell,
                        forecastYear,
                      )

                    const pressureScore =
                      getForecastPressureScore(
                        cell,
                        forecastYear,
                      )

                    const conservation =
                      getForecastConservationClass(
                        cell,
                        forecastYear,
                      )

                    const conflict =
                      getForecastConflictClass(
                        cell,
                        forecastYear,
                      )

                    const intervention =
                      getForecastInterventionPriority(
                        cell,
                        forecastYear,
                      )

                    return (
                      <tr
                        key={
                          cell.gridId
                        }
                      >
                        <td className="font-bold text-slate-900">
                          {
                            cell.gridId
                          }
                        </td>

                        <td>
                          {
                            cell.gnDivision
                          }
                        </td>

                        <td>
                          <div className="flex items-center gap-2">
                            <PressureBadge
                              level={
                                pressureClass
                              }
                            />

                            <span className="text-xs font-bold text-slate-700">
                              {
                                pressureScore
                              }
                              %
                            </span>
                          </div>
                        </td>

                        <td>
                          <SuitabilityBadge
                            value={
                              cell.suitabilityClass
                            }
                          />
                        </td>

                        <td>
                          <ConservationBadge
                            value={
                              conservation
                            }
                          />
                        </td>

                        <td>
                          <ConflictBadge
                            value={
                              conflict
                            }
                          />
                        </td>

                        <td>
                          <InterventionBadge
                            value={
                              intervention
                            }
                          />
                        </td>
                      </tr>
                    )
                  },
                )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FINAL SIMPLE TAKEAWAY */}
      {/* ===================================================== */}

      <section className="mt-7 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-orange-700">
              <Target
                size={18}
              />
            </div>

            <div>
              <div className="text-sm font-bold text-orange-950">
                High development pressure
                does not automatically mean
                development should happen.
              </div>

              <p className="mt-1 text-xs leading-5 text-orange-800">
                The system compares future
                pressure with suitability and
                conservation importance before
                identifying planning
                intervention priorities.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-white px-4 py-3">
            <span className="text-xs font-semibold text-orange-700">
              Pressure
            </span>

            <span className="text-slate-400">
              +
            </span>

            <span className="text-xs font-semibold text-blue-700">
              Suitability
            </span>

            <span className="text-slate-400">
              +
            </span>

            <span className="text-xs font-semibold text-emerald-700">
              Conservation
            </span>

            <ArrowRight
              size={14}
              className="text-slate-400"
            />

            <span className="text-xs font-bold text-slate-900">
              Intervention
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

// ============================================================
// SUMMARY CARD
// ============================================================

function ConflictSummaryCard({
  label,
  value,
  total,
  color,
}) {
  const percent =
    total > 0
      ? (value / total) *
        100
      : 0

  return (
    <div className="card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="max-w-[150px] text-xs font-semibold text-slate-500">
            {label}
          </div>

          <div className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </div>

          <div className="mt-1 text-[10px] text-slate-400">
            {percent.toFixed(
              0,
            )}
            % of grid cells
          </div>
        </div>

        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white"
          style={{
            backgroundColor:
              color,
          }}
        >
          <AlertTriangle
            size={17}
          />
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(
              4,
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
// SELECTED CONFLICT PANEL
// ============================================================

function SelectedConflictPanel({
  item,
  viewMode,
  forecastYear,
}) {
  if (!item) {
    return null
  }

  // ==========================================================
  // GN VIEW
  // ==========================================================

  if (
    viewMode === 'gn'
  ) {
    return (
      <div className="card-pad h-full min-h-0 overflow-y-auto">
        <div className="eyebrow">
          Selected GN / Locality
        </div>

        <h3 className="mt-2 text-xl font-bold text-slate-900">
          {item.gnDivision}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {item.cellCount}{' '}
          fine-scale grid cells
        </p>

        <div className="mt-4">
          <ConflictBadge
            value={
              item.conflictClass
            }
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <SimpleValue
            label="Pressure"
            value={`${item.pressureScore}/100`}
          />

          <SimpleValue
            label="Suitability"
            value={`${item.suitabilityScore}/100`}
          />

          <SimpleValue
            label="Conservation"
            value={`${item.conservationScore}/100`}
          />
        </div>

        <div className="mt-5">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Planning Attention
          </div>

          <div className="mt-3">
            <InterventionBadge
              value={
                item.interventionPriority
              }
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Critical conflict cells
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {
              item.criticalConflictCells
            }
          </div>

          <div className="mt-1 text-[10px] text-slate-500">
            within this summary area
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================
  // GRID VIEW
  // ==========================================================

  const pressure =
    getForecastPressureScore(
      item,
      forecastYear,
    )

  const pressureClass =
    getForecastPressureClass(
      item,
      forecastYear,
    )

  const conservation =
    getForecastConservationScore(
      item,
      forecastYear,
    )

  const conservationClass =
    getForecastConservationClass(
      item,
      forecastYear,
    )

  const conflict =
    getForecastConflictClass(
      item,
      forecastYear,
    )

  const intervention =
    getForecastInterventionPriority(
      item,
      forecastYear,
    )

  return (
    <div className="card-pad h-full min-h-0 overflow-y-auto">
      {/* GRID */}

      <div className="eyebrow">
        Selected Grid Cell
      </div>

      <h3 className="mt-2 text-xl font-bold text-slate-900">
        {item.gridId}
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {item.gnDivision}
      </p>

      {/* CONFLICT */}

      <div className="mt-4">
        <ConflictBadge
          value={
            conflict
          }
        />
      </div>

      {/* THREE INPUTS */}

      <div className="mt-5 grid grid-cols-3 gap-2">
        <SimpleValue
          label={`${forecastYear} Pressure`}
          value={`${pressure}/100`}
        />

        <SimpleValue
          label="Suitability"
          value={`${item.suitabilityScore}/100`}
        />

        <SimpleValue
          label="Conservation"
          value={`${conservation}/100`}
        />
      </div>

      {/* CLASSES */}

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Urban pressure
          </span>

          <PressureBadge
            level={
              pressureClass
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Development suitability
          </span>

          <SuitabilityBadge
            value={
              item.suitabilityClass
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Green conservation
          </span>

          <ConservationBadge
            value={
              conservationClass
            }
          />
        </div>
      </div>

      {/* INTERVENTION */}

      <div className="mt-5 rounded-2xl bg-orange-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700">
          Intervention Priority
        </div>

        <div className="mt-3">
          <InterventionBadge
            value={
              intervention
            }
          />
        </div>
      </div>

      {/* EXPLANATION */}

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          What does this mean?
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          {buildConflictMessage(
            conflict,
            pressure,
            item.suitabilityScore,
            conservationClass,
            forecastYear,
          )}
        </p>
      </div>
    </div>
  )
}

// ============================================================
// SIMPLE VALUE
// ============================================================

function SimpleValue({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-2 text-sm font-bold text-slate-900">
        {value}
      </div>
    </div>
  )
}

// ============================================================
// DECISION TOOLTIP
// ============================================================

function DecisionTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null
  }

  const item =
    payload[0]?.payload

  if (!item) {
    return null
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <div className="font-bold text-slate-900">
        {item.grid}
      </div>

      <div className="mt-1 text-slate-500">
        {item.area}
      </div>

      <div className="mt-3 space-y-1.5 text-slate-600">
        <div>
          Pressure:{' '}
          <b>
            {item.pressure}/100
          </b>
        </div>

        <div>
          Suitability:{' '}
          <b>
            {item.suitability}/100
          </b>
        </div>

        <div>
          Conservation:{' '}
          <b>
            {item.conservation}/100
          </b>
        </div>

        <div>
          Result:{' '}
          <b>
            {item.conflict}
          </b>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// DECISION MEANING
// ============================================================

function DecisionMeaning({
  title,
  subtitle,
  text,
  tone,
}) {
  const tones = {
    red:
      'border-red-200 bg-red-50 text-red-800',

    blue:
      'border-blue-200 bg-blue-50 text-blue-800',

    green:
      'border-emerald-200 bg-emerald-50 text-emerald-800',

    slate:
      'border-slate-200 bg-slate-50 text-slate-700',
  }

  return (
    <div
      className={`rounded-xl border p-4 ${tones[tone]}`}
    >
      <div className="text-xs font-bold">
        {title}
      </div>

      <div className="mt-1 text-[10px] font-semibold opacity-80">
        {subtitle}
      </div>

      <p className="mt-2 text-[10px] leading-4 opacity-80">
        {text}
      </p>
    </div>
  )
}

// ============================================================
// CONFLICT BADGE
// ============================================================

function ConflictBadge({
  value,
}) {
  let classes =
    'border-slate-200 bg-slate-50 text-slate-600'

  let text =
    value ||
    'Monitoring / Low Urgency'

  if (
    value ===
    'Critical Forecast–Planning Conflict'
  ) {
    classes =
      'border-red-200 bg-red-50 text-red-700'

    text =
      'Critical Conflict'
  } else if (
    value ===
    'Development Caution'
  ) {
    classes =
      'border-orange-200 bg-orange-50 text-orange-700'
  } else if (
    value ===
    'Conservation Priority'
  ) {
    classes =
      'border-emerald-200 bg-emerald-50 text-emerald-700'
  } else if (
    value ===
    'Managed Growth Opportunity'
  ) {
    classes =
      'border-blue-200 bg-blue-50 text-blue-700'

    text =
      'Managed Growth'
  } else {
    text =
      'Lower Urgency'
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${classes}`}
    >
      {text}
    </span>
  )
}

// ============================================================
// CONSERVATION BADGE
// ============================================================

function ConservationBadge({
  value,
}) {
  let classes =
    'border-slate-200 bg-slate-50 text-slate-600'

  if (
    value === 'Critical'
  ) {
    classes =
      'border-red-200 bg-red-50 text-red-700'
  } else if (
    value === 'High'
  ) {
    classes =
      'border-orange-200 bg-orange-50 text-orange-700'
  } else if (
    value === 'Monitoring'
  ) {
    classes =
      'border-amber-200 bg-amber-50 text-amber-700'
  } else {
    classes =
      'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${classes}`}
    >
      {value}
    </span>
  )
}

// ============================================================
// INTERVENTION BADGE
// ============================================================

function InterventionBadge({
  value,
}) {
  let classes =
    'border-slate-200 bg-slate-50 text-slate-600'

  if (
    value === 'Critical'
  ) {
    classes =
      'border-red-300 bg-red-100 text-red-800'
  } else if (
    value === 'Very High'
  ) {
    classes =
      'border-red-200 bg-red-50 text-red-700'
  } else if (
    value === 'High'
  ) {
    classes =
      'border-orange-200 bg-orange-50 text-orange-700'
  } else if (
    value === 'Medium'
  ) {
    classes =
      'border-blue-200 bg-blue-50 text-blue-700'
  } else {
    classes =
      'border-slate-200 bg-slate-50 text-slate-600'
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${classes}`}
    >
      {value}
    </span>
  )
}

// ============================================================
// DOMINANT VALUE
// ============================================================

function getDominantValue(
  values,
) {
  if (!values.length) {
    return null
  }

  const counts = {}

  values.forEach(
    (value) => {
      counts[value] =
        (counts[value] ||
          0) + 1
    },
  )

  return Object.entries(
    counts,
  ).sort(
    (a, b) =>
      b[1] - a[1],
  )[0]?.[0]
}

// ============================================================
// HIGHEST INTERVENTION
// ============================================================

function getHighestIntervention(
  values,
) {
  const order = [
    'Critical',
    'Very High',
    'High',
    'Medium',
    'Monitoring',
  ]

  return (
    order.find(
      (priority) =>
        values.includes(
          priority,
        ),
    ) ||
    'Monitoring'
  )
}

// ============================================================
// CONFLICT MESSAGE
// ============================================================

function buildConflictMessage(
  conflict,
  pressure,
  suitability,
  conservation,
  year,
) {
  if (
    conflict ===
    'Critical Forecast–Planning Conflict'
  ) {
    return `By ${year}, this location shows strong urbanization pressure (${pressure}/100), while its suitability or conservation conditions indicate that development needs close planning review.`
  }

  if (
    conflict ===
    'Development Caution'
  ) {
    return `By ${year}, development pressure is increasing, but the suitability conditions are not strong enough to treat this location as a straightforward growth area.`
  }

  if (
    conflict ===
    'Conservation Priority'
  ) {
    return `This location contains important green value. Even if immediate planning conflict is lower, conservation should remain an important consideration for ${year}.`
  }

  if (
    conflict ===
    'Managed Growth Opportunity'
  ) {
    return `This location has stronger ${year} development pressure together with comparatively favorable suitability conditions. It may be considered for managed growth subject to normal planning review.`
  }

  return `This location currently shows lower immediate forecast–planning conflict for ${year}. Continue monitoring future pressure, suitability and conservation conditions.`
}