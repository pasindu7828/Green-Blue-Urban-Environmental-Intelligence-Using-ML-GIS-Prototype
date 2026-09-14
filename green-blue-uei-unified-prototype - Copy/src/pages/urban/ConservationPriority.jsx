import {
  useMemo,
  useState,
} from 'react'

import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Trees,
  TrendingUp,
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
} from '../../components/shared/UrbanUI'

import UrbanIntelligenceMap from '../../components/maps/UrbanIntelligenceMap'

import ForecastYearSelector from '../../components/urban/ForecastYearSelector'

import {
  useUrbanForecast,
} from '../../contexts/UrbanForecastContext'

import {
  getForecastConservationClass,
  getForecastConservationScore,
  getForecastPressureClass,
  getForecastPressureScore,
} from '../../utils/urbanForecast'

import {
  gnSummaries,
  urbanGridCells,
} from '../../data/urbanData'

// ============================================================
// COLOURS
// ============================================================

const conservationColours = {
  Critical: '#b83e3e',
  High: '#e47b45',
  Monitoring: '#e5c95e',
  'Stable Green': '#4ea76d',
  'Lower Current Threat': '#a8d8b7',
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

export default function ConservationPriority() {
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
  // SUMMARY COUNTS
  // ==========================================================

  const summary =
    useMemo(() => {
      const counts = {
        Critical: 0,
        High: 0,
        Monitoring: 0,
        Stable: 0,
      }

      urbanGridCells.forEach(
        (cell) => {
          const cls =
            getForecastConservationClass(
              cell,
              forecastYear,
            )

          if (
            cls === 'Critical'
          ) {
            counts.Critical += 1
          } else if (
            cls === 'High'
          ) {
            counts.High += 1
          } else if (
            cls === 'Monitoring'
          ) {
            counts.Monitoring += 1
          } else {
            counts.Stable += 1
          }
        },
      )

      return counts
    }, [forecastYear])

  // ==========================================================
  // PRIORITY CELLS
  // ==========================================================

  const priorityCells =
    useMemo(() => {
      return [
        ...urbanGridCells,
      ]
        .sort(
          (a, b) =>
            getForecastConservationScore(
              b,
              forecastYear,
            ) -
            getForecastConservationScore(
              a,
              forecastYear,
            ),
        )
        .slice(0, 8)
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

          const greenValue =
            Math.round(
              average(
                cells,
                (cell) =>
                  cell.greenValue,
              ),
            )

          const green2025 =
            average(
              cells,
              (cell) =>
                cell.green2025,
            )

          const greenLoss =
            average(
              cells,
              (cell) =>
                cell.greenLoss,
            )

          const greenPersistence =
            Math.round(
              average(
                cells,
                (cell) =>
                  cell.greenPersistence,
              ),
            )

          const greenConnectivity =
            Math.round(
              average(
                cells,
                (cell) =>
                  cell.greenConnectivity,
              ),
            )

          const greenToBuilt =
            average(
              cells,
              (cell) =>
                cell.greenToBuilt,
            )

          const conservationClass =
            getSummaryConservationClass(
              conservationScore,
              greenValue,
              pressureScore,
            )

          const highPriorityCells =
            cells.filter(
              (cell) => {
                const cls =
                  getForecastConservationClass(
                    cell,
                    forecastYear,
                  )

                return (
                  cls ===
                    'Critical' ||
                  cls === 'High'
                )
              },
            ).length

          return {
            ...summary,

            pressureScore,

            conservationScore,

            conservationClass,

            greenValue,

            green2025:
              Number(
                green2025.toFixed(
                  1,
                ),
              ),

            greenLoss:
              Number(
                greenLoss.toFixed(
                  1,
                ),
              ),

            greenPersistence,

            greenConnectivity,

            greenToBuilt:
              Number(
                greenToBuilt.toFixed(
                  1,
                ),
              ),

            highPriorityCells,
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
      ? priorityCells[0]
      : dynamicGnSummaries
          .slice()
          .sort(
            (a, b) =>
              b.conservationScore -
              a.conservationScore,
          )[0])

  const selectedId =
    viewMode === 'grid'
      ? selectedItem?.gridId
      : selectedItem?.id

  // ==========================================================
  // SCATTER DATA
  // ==========================================================

  const threatData =
    useMemo(() => {
      return urbanGridCells.map(
        (cell) => {
          const pressure =
            getForecastPressureScore(
              cell,
              forecastYear,
            )

          const conservation =
            getForecastConservationScore(
              cell,
              forecastYear,
            )

          const conservationClass =
            getForecastConservationClass(
              cell,
              forecastYear,
            )

          return {
            grid:
              cell.gridId,

            area:
              cell.gnDivision,

            pressure,

            greenValue:
              Number(
                cell.greenValue ||
                  0,
              ),

            conservation,

            conservationClass,
          }
        },
      )
    }, [forecastYear])

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
        eyebrow="Forecast-Informed Green Conservation"
        title="Which Green Areas Should Be Protected First?"
        subtitle={`Identify valuable remaining green areas facing future urbanization pressure. Currently viewing ${forecastYear}.`}
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

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PrioritySummaryCard
          label="Critical Priority"
          value={
            summary.Critical
          }
          total={
            urbanGridCells.length
          }
          color="#b83e3e"
        />

        <PrioritySummaryCard
          label="High Priority"
          value={
            summary.High
          }
          total={
            urbanGridCells.length
          }
          color="#e47b45"
        />

        <PrioritySummaryCard
          label="Monitoring"
          value={
            summary.Monitoring
          }
          total={
            urbanGridCells.length
          }
          color="#e5c95e"
        />

        <PrioritySummaryCard
          label="Stable / Lower Threat"
          value={
            summary.Stable
          }
          total={
            urbanGridCells.length
          }
          color="#4ea76d"
        />
      </div>

      {/* ===================================================== */}
      {/* MAIN MAP */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="section-title">
              {forecastYear}{' '}
              Green Conservation
              Priority Map
            </h2>

            <p className="muted mt-1 max-w-3xl">
              Higher-priority areas
              combine important green
              characteristics with
              stronger future
              development pressure.
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

        {/* MAP + DETAIL */}

        <div className="mt-5 grid gap-5 xl:h-[470px] xl:grid-cols-[minmax(0,1fr)_330px]">
          <UrbanIntelligenceMap
            mode="conservation"
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

          <SelectedConservationPanel
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
      {/* THREAT VISUALIZATION */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            Which Green Areas Are
            Most Threatened?
          </h2>

          <p className="muted mt-1">
            Each point represents one
            grid cell. Areas toward the
            upper-right have both
            stronger green value and
            stronger future urbanization
            pressure.
          </p>
        </div>

        <div className="mt-5 h-[390px]">
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
                name="Future Pressure"
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
                dataKey="greenValue"
                name="Green Value"
                domain={[
                  0,
                  100,
                ]}
                tick={{
                  fontSize: 10,
                }}
                label={{
                  value:
                    'Green Value',
                  angle: -90,
                  position:
                    'insideLeft',
                  fontSize: 11,
                }}
              />

              <Tooltip
                content={
                  <ThreatTooltip />
                }
              />

              {/* HIGH PRESSURE */}

              <ReferenceLine
                x={60}
                stroke="#d97706"
                strokeDasharray="5 5"
              />

              {/* HIGH GREEN VALUE */}

              <ReferenceLine
                y={60}
                stroke="#059669"
                strokeDasharray="5 5"
              />

              <Scatter
                name="Grid Cells"
                data={
                  threatData
                }
              >
                {threatData.map(
                  (item) => (
                    <Cell
                      key={
                        item.grid
                      }
                      fill={
                        conservationColours[
                          item.conservationClass
                        ] ||
                        '#70a88a'
                      }
                    />
                  ),
                )}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* SIMPLE READING GUIDE */}

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ThreatMeaning
            title="Protect First"
            subtitle="High green + high pressure"
            text="Strongest conservation concern."
            tone="red"
          />

          <ThreatMeaning
            title="Important Green"
            subtitle="High green + lower pressure"
            text="Protect and continue monitoring."
            tone="green"
          />

          <ThreatMeaning
            title="Growth Pressure"
            subtitle="Lower green + high pressure"
            text="Review together with suitability."
            tone="orange"
          />

          <ThreatMeaning
            title="Lower Current Threat"
            subtitle="Lower green + lower pressure"
            text="Routine monitoring."
            tone="slate"
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* TOP PRIORITY AREAS */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            Highest Conservation
            Priorities
          </h2>

          <p className="muted mt-1">
            Areas ranked using green
            importance together with the{' '}
            {forecastYear} urbanization
            pressure forecast.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Grid</th>

                <th>Area</th>

                <th>
                  Green Value
                </th>

                <th>
                  {forecastYear}{' '}
                  Pressure
                </th>

                <th>
                  Priority Score
                </th>

                <th>
                  Conservation
                </th>
              </tr>
            </thead>

            <tbody>
              {priorityCells.map(
                (cell) => {
                  const pressure =
                    getForecastPressureScore(
                      cell,
                      forecastYear,
                    )

                  const pressureClass =
                    getForecastPressureClass(
                      cell,
                      forecastYear,
                    )

                  const conservationScore =
                    getForecastConservationScore(
                      cell,
                      forecastYear,
                    )

                  const conservationClass =
                    getForecastConservationClass(
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
                        <div className="font-bold text-emerald-700">
                          {
                            cell.greenValue
                          }
                          /100
                        </div>
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
                              pressure
                            }
                            %
                          </span>
                        </div>
                      </td>

                      <td className="font-bold text-slate-900">
                        {
                          conservationScore
                        }
                        /100
                      </td>

                      <td>
                        <ConservationBadge
                          value={
                            conservationClass
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
      {/* SIMPLE FINAL TAKEAWAY */}
      {/* ===================================================== */}

      <section className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700">
              <Trees size={18} />
            </div>

            <div>
              <div className="text-sm font-bold text-emerald-950">
                Green value + future development pressure = conservation priority
              </div>

              <p className="mt-1 text-xs leading-5 text-emerald-800">
                Valuable green areas facing stronger future urbanization pressure
                receive higher conservation priority.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
            <span className="text-xs font-semibold text-emerald-700">
              Green Value
            </span>

            <span className="text-emerald-500">
              +
            </span>

            <span className="text-xs font-semibold text-orange-700">
              {forecastYear} Pressure
            </span>

            <ArrowRight
              size={15}
              className="text-slate-400"
            />

            <span className="text-xs font-bold text-slate-900">
              Priority
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

function PrioritySummaryCard({
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
          <div className="text-xs font-semibold text-slate-500">
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
          <Trees
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
// SELECTED CONSERVATION PANEL
// ============================================================

function SelectedConservationPanel({
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
          <ConservationBadge
            value={
              item.conservationClass
            }
          />
        </div>

        {/* PRIORITY SCORE */}

        <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            {forecastYear}{' '}
            Conservation Priority
          </div>

          <div className="mt-2 text-4xl font-bold text-emerald-950">
            {
              item.conservationScore
            }
          </div>

          <div className="text-xs text-emerald-700">
            /100
          </div>
        </div>

        {/* TWO MAIN INPUTS */}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <SimpleValue
            label="Green Value"
            value={`${item.greenValue}/100`}
          />

          <SimpleValue
            label={`${forecastYear} Pressure`}
            value={`${item.pressureScore}/100`}
          />
        </div>

        {/* DETAILS */}

        <div className="mt-5 space-y-4">
          <InfoRow
            label="Green cover · 2025"
            value={`${item.green2025}%`}
          />

          <InfoRow
            label="Historical green loss"
            value={`${item.greenLoss}%`}
          />

          <InfoRow
            label="Green persistence"
            value={`${item.greenPersistence}/100`}
          />

          <InfoRow
            label="Green connectivity"
            value={`${item.greenConnectivity}/100`}
          />

          <InfoRow
            label="High priority cells"
            value={
              item.highPriorityCells
            }
          />
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

  const conservationScore =
    getForecastConservationScore(
      item,
      forecastYear,
    )

  const conservationClass =
    getForecastConservationClass(
      item,
      forecastYear,
    )

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

        <ConservationBadge
          value={
            conservationClass
          }
        />
      </div>

      {/* PRIORITY */}

      <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          {forecastYear}{' '}
          Conservation Priority
        </div>

        <div className="mt-2 text-4xl font-bold text-emerald-950">
          {
            conservationScore
          }
        </div>

        <div className="text-xs text-emerald-700">
          /100
        </div>
      </div>

      {/* CORE LOGIC */}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <SimpleValue
          label="Green Value"
          value={`${item.greenValue}/100`}
        />

        <SimpleValue
          label={`${forecastYear} Pressure`}
          value={`${pressure}/100`}
        />
      </div>

      <div className="mt-4">
        <PressureBadge
          level={
            pressureClass
          }
        />
      </div>

      {/* WHY IMPORTANT */}

      <div className="mt-5">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Why is this green area
          important?
        </div>

        <div className="mt-3 space-y-4">
          <InfoRow
            label="Green cover · 2025"
            value={`${item.green2025}%`}
          />

          <InfoRow
            label="Green persistence"
            value={`${item.greenPersistence}/100`}
          />

          <InfoRow
            label="Green connectivity"
            value={`${item.greenConnectivity}/100`}
          />

          <InfoRow
            label="Historical green loss"
            value={`${item.greenLoss}%`}
          />
        </div>
      </div>

      {/* INTERPRETATION */}

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          What does this mean?
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          {buildConservationMessage(
            conservationClass,
            item.greenValue,
            pressure,
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
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-lg font-bold text-slate-900">
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
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-right text-xs font-bold text-slate-800">
        {value}
      </span>
    </div>
  )
}

// ============================================================
// CONSERVATION BADGE
// ============================================================

function ConservationBadge({
  value,
}) {
  const text =
    value ||
    'Monitoring'

  let classes =
    'border-slate-200 bg-slate-50 text-slate-600'

  if (
    text === 'Critical'
  ) {
    classes =
      'border-red-200 bg-red-50 text-red-700'
  } else if (
    text === 'High'
  ) {
    classes =
      'border-orange-200 bg-orange-50 text-orange-700'
  } else if (
    text === 'Monitoring'
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
      {text}
    </span>
  )
}

// ============================================================
// THREAT TOOLTIP
// ============================================================

function ThreatTooltip({
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
          Green Value:{' '}
          <b>
            {
              item.greenValue
            }
            /100
          </b>
        </div>

        <div>
          Future Pressure:{' '}
          <b>
            {item.pressure}%
          </b>
        </div>

        <div>
          Conservation:{' '}
          <b>
            {
              item.conservation
            }
            /100
          </b>
        </div>

        <div>
          Priority:{' '}
          <b>
            {
              item.conservationClass
            }
          </b>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// THREAT MEANING
// ============================================================

function ThreatMeaning({
  title,
  subtitle,
  text,
  tone,
}) {
  const tones = {
    red:
      'border-red-200 bg-red-50 text-red-800',

    green:
      'border-emerald-200 bg-emerald-50 text-emerald-800',

    orange:
      'border-orange-200 bg-orange-50 text-orange-800',

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
// SUMMARY CONSERVATION CLASS
// ============================================================

function getSummaryConservationClass(
  score,
  greenValue,
  pressure,
) {
  if (
    score >= 78 &&
    greenValue >= 58
  ) {
    return 'Critical'
  }

  if (
    score >= 61 &&
    greenValue >= 50
  ) {
    return 'High'
  }

  if (
    greenValue >= 66 &&
    pressure < 45
  ) {
    return 'Stable Green'
  }

  if (score >= 44) {
    return 'Monitoring'
  }

  return 'Lower Current Threat'
}

// ============================================================
// CONSERVATION MESSAGE
// ============================================================

function buildConservationMessage(
  conservationClass,
  greenValue,
  pressure,
  year,
) {
  if (
    conservationClass ===
    'Critical'
  ) {
    return `This location has strong green value (${greenValue}/100) and faces strong ${year} urbanization pressure (${pressure}/100). It is a high-priority area for conservation attention.`
  }

  if (
    conservationClass ===
    'High'
  ) {
    return `This green area has meaningful environmental value and increasing ${year} development pressure. Early conservation action should be considered.`
  }

  if (
    conservationClass ===
    'Stable Green'
  ) {
    return `This area retains important green value while current ${year} development pressure is comparatively lower. Protection and monitoring can help maintain it.`
  }

  if (
    conservationClass ===
    'Monitoring'
  ) {
    return `This area does not currently show the strongest conservation threat, but future development pressure and green-cover change should continue to be monitored.`
  }

  return `This area currently shows lower conservation urgency compared with other locations, based on its green value and ${year} development pressure.`
}