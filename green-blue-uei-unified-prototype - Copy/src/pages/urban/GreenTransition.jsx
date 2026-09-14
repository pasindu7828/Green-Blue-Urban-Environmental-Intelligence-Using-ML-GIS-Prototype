import {
  useMemo,
  useState,
} from 'react'

import {
  ArrowRight,
  Building2,
  ChevronDown,
  Leaf,
  MapPinned,
  Navigation,
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

import {
  DisclaimerBadges,
  PageHeader,
} from '../../components/shared/UrbanUI'

import UrbanIntelligenceMap from '../../components/maps/UrbanIntelligenceMap'

import {
  GRID_COLS,
  urbanGridCells,
} from '../../data/urbanData'

// ============================================================
// BASIC HELPERS
// ============================================================

function average(items, key) {
  if (!items.length) {
    return 0
  }

  return (
    items.reduce(
      (sum, item) =>
        sum +
        Number(item[key] || 0),
      0,
    ) / items.length
  )
}

// ============================================================
// GREEN COLOUR
// ============================================================

function getGreenColour(value) {
  const number =
    Number(value || 0)

  if (number >= 65) {
    return '#3f8f58'
  }

  if (number >= 50) {
    return '#69ad72'
  }

  if (number >= 35) {
    return '#9ac783'
  }

  if (number >= 20) {
    return '#d5d98a'
  }

  return '#e4b56b'
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function GreenTransition() {
  const [
    transitionMode,
    setTransitionMode,
  ] = useState('greenLoss')

  // ----------------------------------------------------------
  // GN OPTIONS
  // ----------------------------------------------------------

  const gnOptions =
    useMemo(() => {
      const unique =
        new Map()

      urbanGridCells.forEach(
        (cell) => {
          if (
            !unique.has(
              cell.gnId,
            )
          ) {
            unique.set(
              cell.gnId,
              {
                id:
                  cell.gnId,

                name:
                  cell.gnDivision,
              },
            )
          }
        },
      )

      return Array.from(
        unique.values(),
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
          ),
      )
    }, [])

  // ----------------------------------------------------------
  // DEFAULT GN
  // ----------------------------------------------------------

  const defaultGnId =
    gnOptions[0]?.id || ''

  const [
    selectedGnId,
    setSelectedGnId,
  ] = useState(
    defaultGnId,
  )

  const [
    selectedCell,
    setSelectedCell,
  ] = useState(null)

  // ----------------------------------------------------------
  // HISTORICAL STUDY-AREA AVERAGES
  // ----------------------------------------------------------

  const historicalData =
    useMemo(() => {
      return [
        {
          year: '2015',

          green: Number(
            average(
              urbanGridCells,
              'green2015',
            ).toFixed(1),
          ),

          built: Number(
            average(
              urbanGridCells,
              'built2015',
            ).toFixed(1),
          ),
        },

        {
          year: '2020',

          green: Number(
            average(
              urbanGridCells,
              'green2020',
            ).toFixed(1),
          ),

          built: Number(
            average(
              urbanGridCells,
              'built2020',
            ).toFixed(1),
          ),
        },

        {
          year: '2025',

          green: Number(
            average(
              urbanGridCells,
              'green2025',
            ).toFixed(1),
          ),

          built: Number(
            average(
              urbanGridCells,
              'built2025',
            ).toFixed(1),
          ),
        },
      ]
    }, [])

  // ----------------------------------------------------------
  // OVERALL SUMMARY
  // ----------------------------------------------------------

  const summary =
    useMemo(() => {
      const green2015 =
        average(
          urbanGridCells,
          'green2015',
        )

      const green2025 =
        average(
          urbanGridCells,
          'green2025',
        )

      const built2015 =
        average(
          urbanGridCells,
          'built2015',
        )

      const built2025 =
        average(
          urbanGridCells,
          'built2025',
        )

      const greenToBuilt =
        average(
          urbanGridCells,
          'greenToBuilt',
        )

      return {
        greenChange:
          green2025 -
          green2015,

        builtChange:
          built2025 -
          built2015,

        greenToBuilt,
      }
    }, [])

  // ----------------------------------------------------------
  // SELECTED GN CELLS
  // ----------------------------------------------------------

  const selectedGnCells =
    useMemo(() => {
      return urbanGridCells.filter(
        (cell) =>
          cell.gnId ===
          selectedGnId,
      )
    }, [selectedGnId])

  // ----------------------------------------------------------
  // SELECTED GN NAME
  // ----------------------------------------------------------

  const selectedGnName =
    useMemo(() => {
      return (
        gnOptions.find(
          (item) =>
            item.id ===
            selectedGnId,
        )?.name ||
        'Select GN Division'
      )
    }, [
      gnOptions,
      selectedGnId,
    ])

  // ----------------------------------------------------------
  // SELECTED GN SUMMARY
  // ----------------------------------------------------------

  const selectedGnSummary =
    useMemo(() => {
      if (
        !selectedGnCells.length
      ) {
        return {
          green2015: 0,
          green2020: 0,
          green2025: 0,
          greenLoss: 0,
          builtGrowth: 0,
          greenToBuilt: 0,
          cellCount: 0,
        }
      }

      return {
        green2015:
          average(
            selectedGnCells,
            'green2015',
          ),

        green2020:
          average(
            selectedGnCells,
            'green2020',
          ),

        green2025:
          average(
            selectedGnCells,
            'green2025',
          ),

        greenLoss:
          average(
            selectedGnCells,
            'greenLoss',
          ),

        builtGrowth:
          average(
            selectedGnCells,
            'builtGrowth',
          ),

        greenToBuilt:
          average(
            selectedGnCells,
            'greenToBuilt',
          ),

        cellCount:
          selectedGnCells.length,
      }
    }, [selectedGnCells])

  // ----------------------------------------------------------
  // HIGHEST LOSS CELLS
  // ----------------------------------------------------------

  const highestLossCells =
    useMemo(() => {
      return [
        ...urbanGridCells,
      ]
        .sort(
          (a, b) =>
            Number(
              b.greenLoss ||
                0,
            ) -
            Number(
              a.greenLoss ||
                0,
            ),
        )
        .slice(0, 5)
    }, [])

  // ----------------------------------------------------------
  // RANKING CHART
  // ----------------------------------------------------------

  const rankingData =
    useMemo(() => {
      return highestLossCells.map(
        (cell) => ({
          grid:
            cell.gridId,

          area:
            cell.gnDivision,

          loss:
            Number(
              cell.greenLoss ||
                0,
            ),
        }),
      )
    }, [highestLossCells])

  // ----------------------------------------------------------
  // ACTIVE CELL
  // ----------------------------------------------------------

  const activeCell =
    useMemo(() => {
      if (
        selectedCell &&
        selectedCell.gnId ===
          selectedGnId
      ) {
        return selectedCell
      }

      if (
        selectedGnCells.length
      ) {
        return [
          ...selectedGnCells,
        ].sort(
          (a, b) =>
            Number(
              b.greenLoss ||
                0,
            ) -
            Number(
              a.greenLoss ||
                0,
            ),
        )[0]
      }

      return (
        highestLossCells[0] ||
        urbanGridCells[0]
      )
    }, [
      selectedCell,
      selectedGnId,
      selectedGnCells,
      highestLossCells,
    ])

  // ==========================================================
  // HANDLE CELL SELECTION
  // ==========================================================

  function handleCellSelect(
    cell,
  ) {
    if (!cell) {
      return
    }

    setSelectedCell(cell)

    if (cell.gnId) {
      setSelectedGnId(
        cell.gnId,
      )
    }
  }

  // ==========================================================
  // HANDLE GN DROPDOWN
  // ==========================================================

  function handleGnChange(
    gnId,
  ) {
    setSelectedGnId(gnId)

    const cells =
      urbanGridCells.filter(
        (cell) =>
          cell.gnId ===
          gnId,
      )

    const representative =
      [...cells].sort(
        (a, b) =>
          Number(
            b.greenLoss ||
              0,
          ) -
          Number(
            a.greenLoss ||
              0,
          ),
      )[0]

    setSelectedCell(
      representative ||
        null,
    )
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
        eyebrow="Historical Green-Cover Transition"
        title="How Has Green Cover Changed?"
        subtitle="Compare historical green cover from 2015 to 2025 and identify where vegetation was lost or converted into built-up land."
        right={
          <span className="badge-green">
            2015 → 2025
          </span>
        }
      />

      <DisclaimerBadges />

      {/* ===================================================== */}
      {/* KPI SUMMARY */}
      {/* ===================================================== */}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SimpleMetric
          icon={Leaf}
          label="Net Green Change"
          value={`${summary.greenChange.toFixed(
            1,
          )}%`}
          text="2015 → 2025"
          negative={
            summary.greenChange <
            0
          }
        />

        <SimpleMetric
          icon={Building2}
          label="Built-Up Growth"
          value={`+${summary.builtChange.toFixed(
            1,
          )}%`}
          text="2015 → 2025"
        />

        <SimpleMetric
          icon={MapPinned}
          label="Green → Built"
          value={`${summary.greenToBuilt.toFixed(
            1,
          )}%`}
          text="Average historical conversion"
        />
      </div>

      {/* ===================================================== */}
      {/* HISTORICAL COMPARISON */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        {/* --------------------------------------------------- */}
        {/* TITLE + GN SELECTOR */}
        {/* --------------------------------------------------- */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="section-title">
              Green Cover Through Time
            </h2>

            <p className="muted mt-1">
              Select a GN/locality area
              and compare the same
              location across 2015,
              2020 and 2025.
            </p>
          </div>

          {/* GN DROPDOWN */}

          <div className="relative min-w-[250px]">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Select GN / Locality
            </div>

            <div className="relative">
              <select
                value={
                  selectedGnId
                }
                onChange={(
                  event,
                ) =>
                  handleGnChange(
                    event.target
                      .value,
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {gnOptions.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
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

        {/* --------------------------------------------------- */}
        {/* SELECTED GN SUMMARY */}
        {/* --------------------------------------------------- */}

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Navigation
                size={18}
              />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                Selected GN /
                Locality
              </div>

              <div className="mt-0.5 text-lg font-bold text-emerald-950">
                {selectedGnName}
              </div>

              <div className="text-[10px] text-emerald-700">
                {
                  selectedGnSummary.cellCount
                }{' '}
                fine-scale grid
                cells
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <GnYearValue
              year="2015"
              value={`${selectedGnSummary.green2015.toFixed(
                1,
              )}%`}
            />

            <ArrowRight
              size={14}
              className="text-emerald-500"
            />

            <GnYearValue
              year="2020"
              value={`${selectedGnSummary.green2020.toFixed(
                1,
              )}%`}
            />

            <ArrowRight
              size={14}
              className="text-emerald-500"
            />

            <GnYearValue
              year="2025"
              value={`${selectedGnSummary.green2025.toFixed(
                1,
              )}%`}
            />
          </div>
        </div>

        {/* --------------------------------------------------- */}
        {/* THREE SYNCHRONIZED GRIDS */}
        {/* --------------------------------------------------- */}

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_auto_1fr_auto_1fr] xl:items-center">
          <HistoricalGrid
            year="2015"
            dataKey="green2015"
            averageGreen={
              historicalData[0]
                .green
            }
            selectedGnId={
              selectedGnId
            }
            selectedCellId={
              activeCell?.gridId
            }
            selectedGnName={
              selectedGnName
            }
            onSelect={
              handleCellSelect
            }
          />

          <ComparisonArrow />

          <HistoricalGrid
            year="2020"
            dataKey="green2020"
            averageGreen={
              historicalData[1]
                .green
            }
            selectedGnId={
              selectedGnId
            }
            selectedCellId={
              activeCell?.gridId
            }
            selectedGnName={
              selectedGnName
            }
            onSelect={
              handleCellSelect
            }
          />

          <ComparisonArrow />

          <HistoricalGrid
            year="2025"
            dataKey="green2025"
            averageGreen={
              historicalData[2]
                .green
            }
            selectedGnId={
              selectedGnId
            }
            selectedCellId={
              activeCell?.gridId
            }
            selectedGnName={
              selectedGnName
            }
            onSelect={
              handleCellSelect
            }
          />
        </div>

        {/* --------------------------------------------------- */}
        {/* LEGEND */}
        {/* --------------------------------------------------- */}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-xl bg-slate-50 px-4 py-3">
          <LegendItem
            color="#3f8f58"
            text="Very High"
          />

          <LegendItem
            color="#69ad72"
            text="High"
          />

          <LegendItem
            color="#9ac783"
            text="Moderate"
          />

          <LegendItem
            color="#d5d98a"
            text="Low"
          />

          <LegendItem
            color="#e4b56b"
            text="Very Low"
          />
        </div>

        {/* --------------------------------------------------- */}
        {/* OVERALL CHANGE */}
        {/* --------------------------------------------------- */}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100">
          <span className="text-xs font-semibold text-slate-500">
            Kaduwela average
          </span>

          <strong className="text-sm text-slate-900">
            {
              historicalData[0]
                .green
            }
            %
          </strong>

          <ArrowRight
            size={14}
            className="text-slate-300"
          />

          <strong className="text-sm text-slate-900">
            {
              historicalData[1]
                .green
            }
            %
          </strong>

          <ArrowRight
            size={14}
            className="text-slate-300"
          />

          <strong className="text-sm text-slate-900">
            {
              historicalData[2]
                .green
            }
            %
          </strong>

          <span className="ml-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
            ↓{' '}
            {Math.abs(
              summary.greenChange,
            ).toFixed(1)}{' '}
            percentage points
          </span>
        </div>
      </section>

      {/* ===================================================== */}
      {/* TRANSITION MAP */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="section-title">
              Where Did Green Change
              Occur?
            </h2>

            <p className="muted mt-1 max-w-3xl">
              The same selected GN is
              highlighted below while
              individual fine-grid cells
              remain clickable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SELECTED GN BADGE */}

            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
              {selectedGnName}
            </div>

            {/* MAP MODE */}

            <div className="flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() =>
                  setTransitionMode(
                    'greenLoss',
                  )
                }
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  transitionMode ===
                  'greenLoss'
                    ? 'bg-[#0F2E28] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                Green Loss
              </button>

              <button
                type="button"
                onClick={() =>
                  setTransitionMode(
                    'greenToBuilt',
                  )
                }
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  transitionMode ===
                  'greenToBuilt'
                    ? 'bg-[#0F2E28] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                Green → Built
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:h-[470px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <UrbanIntelligenceMap
            mode={
              transitionMode
            }
            viewMode="grid"
            selectedId={
              activeCell?.gridId
            }
            highlightGnId={
              selectedGnId
            }
            onSelect={
              handleCellSelect
            }
            height={470}
          />

          <SelectedAreaPanel
            cell={activeCell}
            gnName={
              selectedGnName
            }
            gnSummary={
              selectedGnSummary
            }
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* TREND + RANKING */}
      {/* ===================================================== */}

      <section className="mt-7 grid gap-5 xl:grid-cols-2">
        {/* --------------------------------------------------- */}
        {/* TREND */}
        {/* --------------------------------------------------- */}

        <div className="card-pad">
          <div>
            <h2 className="section-title">
              Green vs Built-Up Trend
            </h2>

            <p className="muted mt-1">
              Overall historical
              direction of land-cover
              change.
            </p>
          </div>

          <div className="mt-5 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={
                  historicalData
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
                  dataKey="year"
                  tick={{
                    fontSize: 11,
                  }}
                />

                <YAxis
                  unit="%"
                  tick={{
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  formatter={(
                    value,
                  ) =>
                    `${value}%`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="green"
                  name="Green Cover"
                  stroke="#2f8f5b"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="built"
                  name="Built-Up"
                  stroke="#d87845"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-7 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />

              <span className="text-slate-600">
                Green Cover
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />

              <span className="text-slate-600">
                Built-Up
              </span>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------- */}
        {/* RANKING */}
        {/* --------------------------------------------------- */}

        <div className="card-pad">
          <div>
            <h2 className="section-title">
              Highest Green-Loss
              Areas
            </h2>

            <p className="muted mt-1">
              Top five fine-grid
              locations with the
              strongest historical
              reduction.
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
                  top: 10,
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
                    `${value}% green loss`
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
                  dataKey="loss"
                  name="Green Loss"
                  fill="#d6674f"
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
    </div>
  )
}

// ============================================================
// HISTORICAL GRID
// ============================================================

function HistoricalGrid({
  year,
  dataKey,
  averageGreen,
  selectedGnId,
  selectedCellId,
  selectedGnName,
  onSelect,
}) {
  const cells =
    useMemo(() => {
      return [
        ...urbanGridCells,
      ].sort(
        (a, b) => {
          if (
            a.row !== b.row
          ) {
            return (
              a.row - b.row
            )
          }

          return (
            a.col - b.col
          )
        },
      )
    }, [])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {/* ----------------------------------------------------- */}
      {/* HEADER */}
      {/* ----------------------------------------------------- */}

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">
            {year}
          </div>

          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Historical state
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-700">
            {averageGreen}%
          </div>

          <div className="text-[10px] text-slate-400">
            Kaduwela average
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* GRID */}
      {/* ----------------------------------------------------- */}

      <div
        className="mt-4 grid gap-[3px] overflow-hidden rounded-xl bg-slate-100 p-1"
        style={{
          gridTemplateColumns:
            `repeat(${GRID_COLS}, minmax(0, 1fr))`,
        }}
      >
        {cells.map(
          (cell) => {
            const value =
              Number(
                cell[
                  dataKey
                ] || 0,
              )

            const inSelectedGn =
              cell.gnId ===
              selectedGnId

            const exactCell =
              cell.gridId ===
              selectedCellId

            return (
              <button
                key={
                  cell.gridId
                }
                type="button"
                title={`${cell.gridId} · ${cell.gnDivision} · ${value}% green`}
                onClick={() =>
                  onSelect?.(
                    cell,
                  )
                }
                className={`relative aspect-square min-w-0 transition ${
                  exactCell
                    ? 'z-10 ring-[3px] ring-slate-900 ring-offset-1'
                    : inSelectedGn
                      ? 'z-[5] ring-2 ring-emerald-700 ring-inset'
                      : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    getGreenColour(
                      value,
                    ),
                }}
              />
            )
          },
        )}
      </div>

      {/* ----------------------------------------------------- */}
      {/* SELECTED GN NAME */}
      {/* ----------------------------------------------------- */}

      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
        <Navigation
          size={12}
          className="shrink-0 text-emerald-600"
        />

        <span className="text-[10px] text-emerald-700">
          Selected:
        </span>

        <span className="truncate text-[10px] font-bold text-emerald-900">
          {selectedGnName}
        </span>
      </div>
    </div>
  )
}

// ============================================================
// COMPARISON ARROW
// ============================================================

function ComparisonArrow() {
  return (
    <div className="hidden items-center justify-center xl:flex">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700">
        <ArrowRight
          size={18}
        />
      </div>
    </div>
  )
}

// ============================================================
// SELECTED AREA PANEL
// ============================================================

function SelectedAreaPanel({
  cell,
  gnName,
  gnSummary,
}) {
  if (!cell) {
    return null
  }

  return (
    <div className="card-pad h-full min-h-0 overflow-y-auto">
      {/* ----------------------------------------------------- */}
      {/* GN */}
      {/* ----------------------------------------------------- */}

      <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
        Selected GN /
        Locality
      </div>

      <h3 className="mt-1 text-lg font-bold text-slate-900">
        {gnName}
      </h3>

      <p className="mt-1 text-[10px] text-slate-500">
        {gnSummary.cellCount}{' '}
        fine-scale cells
      </p>

      {/* ----------------------------------------------------- */}
      {/* GN SUMMARY */}
      {/* ----------------------------------------------------- */}

      <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
        <div className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">
          GN Average Green Cover
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <CompactYear
            year="2015"
            value={`${gnSummary.green2015.toFixed(
              1,
            )}%`}
          />

          <ArrowRight
            size={12}
            className="text-emerald-400"
          />

          <CompactYear
            year="2020"
            value={`${gnSummary.green2020.toFixed(
              1,
            )}%`}
          />

          <ArrowRight
            size={12}
            className="text-emerald-400"
          />

          <CompactYear
            year="2025"
            value={`${gnSummary.green2025.toFixed(
              1,
            )}%`}
          />
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* EXACT GRID */}
      {/* ----------------------------------------------------- */}

      <div className="mt-5 border-t border-slate-100 pt-5">
        <div className="eyebrow">
          Selected Grid Cell
        </div>

        <div className="mt-2 text-xl font-bold text-slate-900">
          {cell.gridId}
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* GRID GREEN COVER */}
      {/* ----------------------------------------------------- */}

      <div className="mt-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Grid Green Cover
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <YearValue
            year="2015"
            value={`${cell.green2015}%`}
          />

          <YearValue
            year="2020"
            value={`${cell.green2020}%`}
          />

          <YearValue
            year="2025"
            value={`${cell.green2025}%`}
          />
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* TRANSITION */}
      {/* ----------------------------------------------------- */}

      <div className="mt-5 space-y-4">
        <InfoRow
          label="Green loss"
          value={`-${cell.greenLoss}%`}
        />

        <InfoRow
          label="Built-up growth"
          value={`+${cell.builtGrowth}%`}
        />

        <InfoRow
          label="Green → Built"
          value={`${cell.greenToBuilt}%`}
        />
      </div>

      {/* ----------------------------------------------------- */}
      {/* REMOTE SENSING */}
      {/* ----------------------------------------------------- */}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniMetric
          label="NDVI · 2025"
          value={
            cell.ndvi2025
          }
        />

        <MiniMetric
          label="NDBI · 2025"
          value={
            cell.ndbi2025
          }
        />
      </div>
    </div>
  )
}

// ============================================================
// GN YEAR VALUE
// ============================================================

function GnYearValue({
  year,
  value,
}) {
  return (
    <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm">
      <div className="text-[9px] font-semibold text-slate-400">
        {year}
      </div>

      <div className="mt-0.5 text-sm font-bold text-emerald-800">
        {value}
      </div>
    </div>
  )
}

// ============================================================
// COMPACT YEAR
// ============================================================

function CompactYear({
  year,
  value,
}) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <div className="text-[8px] font-semibold text-emerald-600">
        {year}
      </div>

      <div className="mt-0.5 text-xs font-bold text-emerald-950">
        {value}
      </div>
    </div>
  )
}

// ============================================================
// YEAR VALUE
// ============================================================

function YearValue({
  year,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-[9px] font-semibold text-slate-400">
        {year}
      </div>

      <div className="mt-1 text-sm font-bold text-emerald-700">
        {value}
      </div>
    </div>
  )
}

// ============================================================
// LEGEND ITEM
// ============================================================

function LegendItem({
  color,
  text,
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-600">
      <span
        className="h-3 w-3 rounded-[3px] border border-black/10"
        style={{
          backgroundColor:
            color,
        }}
      />

      {text}
    </div>
  )
}

// ============================================================
// KPI
// ============================================================

function SimpleMetric({
  icon: Icon,
  label,
  value,
  text,
  negative = false,
}) {
  return (
    <div className="card-pad">
      <div className="flex items-center gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon
            size={19}
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-500">
            {label}
          </div>

          <div
            className={`mt-1 text-2xl font-bold ${
              negative
                ? 'text-red-600'
                : 'text-slate-900'
            }`}
          >
            {value}
          </div>

          <div className="mt-0.5 text-[10px] text-slate-400">
            {text}
          </div>
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
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-bold text-slate-800">
        {value}
      </span>
    </div>
  )
}