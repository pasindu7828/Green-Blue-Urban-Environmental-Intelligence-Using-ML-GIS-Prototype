import { useMemo, useState } from 'react'

import {
  AlertTriangle,
  ArrowRight,
  Gauge,
  Leaf,
  ShieldCheck,
  Target,
  Trees,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
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

import { useUrbanForecast } from '../../contexts/UrbanForecastContext'

import {
  getForecastConservationClass,
  getForecastConservationScore,
  getForecastConflictClass,
  getForecastInterventionPriority,
  getForecastPressureClass,
  getForecastPressureScore,
} from '../../utils/urbanForecast'

import { urbanGridCells } from '../../data/urbanData'

// ============================================================
// MAP MODES
// ============================================================

const mapModes = [
  {
    key: 'greenLoss',
    label: 'Green Loss',
  },
  {
    key: 'pressure',
    label: 'Pressure',
  },
  {
    key: 'suitability',
    label: 'Suitability',
  },
  {
    key: 'conservation',
    label: 'Conservation',
  },
  {
    key: 'conflict',
    label: 'Conflict',
  },
]

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Overview() {
  const { forecastYear } = useUrbanForecast()

  const [mapMode, setMapMode] = useState('pressure')
  const [selectedCell, setSelectedCell] = useState(null)

  // ==========================================================
  // OVERALL SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const total = urbanGridCells.length

    const avgGreenLoss =
      urbanGridCells.reduce(
        (sum, cell) =>
          sum + Number(cell.greenLoss || 0),
        0,
      ) / total

    const highPressure = urbanGridCells.filter((cell) => {
      const pressureClass =
        getForecastPressureClass(
          cell,
          forecastYear,
        )

      return (
        pressureClass === 'High' ||
        pressureClass === 'Very High'
      )
    }).length

    const highConservation = urbanGridCells.filter((cell) => {
      const conservationClass =
        getForecastConservationClass(
          cell,
          forecastYear,
        )

      return (
        conservationClass === 'Critical' ||
        conservationClass === 'High'
      )
    }).length

    const lowSuitability = urbanGridCells.filter(
      (cell) =>
        cell.suitabilityClass === 'Low suitability' ||
        cell.suitabilityClass ===
          'Caution / conservation-sensitive',
    ).length

    const highConflict = urbanGridCells.filter((cell) => {
      const conflict =
        getForecastConflictClass(
          cell,
          forecastYear,
        )

      return (
        conflict === 'High Planning Conflict' ||
        conflict ===
          'Critical Forecast–Planning Conflict'
      )
    }).length

    const highIntervention = urbanGridCells.filter((cell) => {
      const priority =
        getForecastInterventionPriority(
          cell,
          forecastYear,
        )

      return (
        priority === 'Critical' ||
        priority === 'Very High' ||
        priority === 'High'
      )
    }).length

    return {
      total,
      avgGreenLoss,
      highPressure,
      highConservation,
      lowSuitability,
      highConflict,
      highIntervention,
    }
  }, [forecastYear])

  // ==========================================================
  // PLANNING SNAPSHOT
  // ==========================================================

  const planningSnapshot = useMemo(
    () => [
      {
        category: 'High pressure',
        cells: summary.highPressure,
      },
      {
        category: 'Lower suitability',
        cells: summary.lowSuitability,
      },
      {
        category: 'High conservation',
        cells: summary.highConservation,
      },
      {
        category: 'High conflict',
        cells: summary.highConflict,
      },
      {
        category: 'High intervention',
        cells: summary.highIntervention,
      },
    ],
    [summary],
  )

  // ==========================================================
  // PRIORITY CELLS
  // ==========================================================

  const priorityCells = useMemo(() => {
    return [...urbanGridCells]
      .sort((a, b) => {
        const scoreA =
          getForecastPressureScore(
            a,
            forecastYear,
          ) +
          getForecastConservationScore(
            a,
            forecastYear,
          ) +
          Number(a.planningConstraint || 0)

        const scoreB =
          getForecastPressureScore(
            b,
            forecastYear,
          ) +
          getForecastConservationScore(
            b,
            forecastYear,
          ) +
          Number(b.planningConstraint || 0)

        return scoreB - scoreA
      })
      .slice(0, 5)
  }, [forecastYear])

  const activeCell =
    selectedCell ||
    priorityCells[0] ||
    urbanGridCells[0]

  return (
    <div>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <PageHeader
        eyebrow="Kaduwela Urban-Green Intelligence"
        title="Urban Growth & Green Conservation Dashboard"
        subtitle={`Historical green change and future planning intelligence using a 2025 baseline with forecasts from 2026–2035. Currently viewing ${forecastYear}.`}
        right={<ForecastYearSelector compact />}
      />

      <DisclaimerBadges />

      {/* ===================================================== */}
      {/* KPI CARDS */}
      {/* ===================================================== */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          icon={Leaf}
          label="Average Green Loss"
          value={`${summary.avgGreenLoss.toFixed(1)}%`}
          text="Historical · 2015–2025"
          tone="green"
        />

        <DashboardMetric
          icon={Gauge}
          label={`${forecastYear} High Pressure`}
          value={summary.highPressure}
          text={`of ${summary.total} grid cells`}
          tone="orange"
        />

        <DashboardMetric
          icon={Trees}
          label={`${forecastYear} Conservation`}
          value={summary.highConservation}
          text="High or critical priority"
          tone="green"
        />

        <DashboardMetric
          icon={Target}
          label={`${forecastYear} Intervention`}
          value={summary.highIntervention}
          text="High-priority planning attention"
          tone="red"
        />
      </div>

      {/* ===================================================== */}
      {/* RESEARCH STORY */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <StoryStage
            number="01"
            icon={Leaf}
            title="Green Change"
            subtitle="2015–2025"
          />

          <StoryArrow />

          <StoryStage
            number="02"
            icon={Gauge}
            title="Urban Pressure"
            subtitle={`${forecastYear} forecast`}
          />

          <StoryArrow />

          <StoryStage
            number="03"
            icon={ShieldCheck}
            title="Suitability"
            subtitle="Planning conditions"
          />

          <StoryArrow />

          <StoryStage
            number="04"
            icon={Trees}
            title="Conservation"
            subtitle={`${forecastYear} threat`}
          />

          <StoryArrow />

          <StoryStage
            number="05"
            icon={Target}
            title="Intervention"
            subtitle="Where act first?"
            highlight
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* MAIN MAP */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="section-title">
              Kaduwela Planning Intelligence Map
            </h2>

            <p className="muted mt-1 max-w-3xl">
              Historical layers remain fixed, while pressure,
              conservation and conflict respond to the selected
              forecast year.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {mapModes.map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => {
                  setMapMode(mode.key)
                  setSelectedCell(null)
                }}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  mapMode === mode.key
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:h-[470px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <UrbanIntelligenceMap
            mode={mapMode}
            viewMode="grid"
            selectedId={activeCell?.gridId}
            onSelect={setSelectedCell}
            forecastYear={forecastYear}
            height={470}
          />

          <SelectedAreaPanel
            cell={activeCell}
            forecastYear={forecastYear}
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* PLANNING SNAPSHOT */}
      {/* ===================================================== */}

      <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="card-pad">
          <div>
            <h2 className="section-title">
              {forecastYear} Planning Snapshot
            </h2>

            <p className="muted mt-1">
              Number of grid cells appearing in important
              planning-attention categories.
            </p>
          </div>

          <div className="mt-5 h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={planningSnapshot}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 25,
                  left: 30,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fontSize: 10,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  width={115}
                  tick={{
                    fontSize: 10,
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="cells"
                  name="Grid cells"
                  fill="#0f766e"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* =================================================== */}
        {/* CORE PRINCIPLE */}
        {/* =================================================== */}

        <div className="card-pad">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-700">
            <AlertTriangle size={20} />
          </div>

          <div className="mt-4 text-[10px] font-bold uppercase tracking-wide text-orange-700">
            Core Research Principle
          </div>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            High pressure ≠ high suitability
          </h2>

          <div className="mt-5 space-y-4">
            <ConceptRow
              label={`${forecastYear} Pressure`}
              value="What may happen?"
            />

            <ConceptRow
              label="Suitability"
              value="What is appropriate?"
            />

            <ConceptRow
              label={`${forecastYear} Conservation`}
              value="What is threatened?"
            />

            <ConceptRow
              label="Intervention"
              value="Where act first?"
            />
          </div>

          <Link
            to="/urban/conflict"
            className="btn-secondary mt-6 w-full justify-center"
          >
            Explore Planning Conflict
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ===================================================== */}
      {/* OUTPUT LINKS */}
      {/* ===================================================== */}

      <section className="mt-7">
        <div>
          <h2 className="section-title">
            Explore the Research Outputs
          </h2>

          <p className="muted mt-1">
            Move from historical evidence to future planning
            intelligence.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OutputCard
            icon={Leaf}
            title="Green Transition"
            value="2015–2025"
            text="Historical green loss and green-to-built conversion."
            link="/urban/green-transition"
          />

          <OutputCard
            icon={Gauge}
            title="Urbanization Pressure"
            value={forecastYear}
            text="Selectable future conversion-pressure forecast."
            link="/urban/pressure"
          />

          <OutputCard
            icon={ShieldCheck}
            title="Development Suitability"
            value="GIS-MCDA"
            text="Independent responsible development assessment."
            link="/urban/suitability"
          />

          <OutputCard
            icon={Trees}
            title="Green Conservation"
            value={forecastYear}
            text="Green areas threatened by future development pressure."
            link="/urban/conservation"
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* TOP PRIORITY CELLS */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="section-title">
              {forecastYear} Priority Areas
            </h2>

            <p className="muted mt-1">
              Locations requiring closer attention based on
              future pressure, conservation importance and
              planning constraints.
            </p>
          </div>

          <Link
            to="/urban/conflict"
            className="btn-secondary w-fit"
          >
            View Intervention Analysis
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Grid</th>
                <th>Area</th>
                <th>{forecastYear} Pressure</th>
                <th>Suitability</th>
                <th>Conservation</th>
                <th>Intervention</th>
              </tr>
            </thead>

            <tbody>
              {priorityCells.map((cell) => {
                const pressureClass =
                  getForecastPressureClass(
                    cell,
                    forecastYear,
                  )

                const conservationClass =
                  getForecastConservationClass(
                    cell,
                    forecastYear,
                  )

                const intervention =
                  getForecastInterventionPriority(
                    cell,
                    forecastYear,
                  )

                return (
                  <tr key={cell.gridId}>
                    <td className="font-bold text-slate-900">
                      {cell.gridId}
                    </td>

                    <td>{cell.gnDivision}</td>

                    <td>
                      <PressureBadge
                        level={pressureClass}
                      />
                    </td>

                    <td>
                      <SuitabilityBadge
                        value={cell.suitabilityClass}
                      />
                    </td>

                    <td>
                      <ConservationBadge
                        value={conservationClass}
                      />
                    </td>

                    <td>
                      <InterventionBadge
                        value={intervention}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ============================================================
// SELECTED AREA PANEL
// ============================================================

function SelectedAreaPanel({
  cell,
  forecastYear,
}) {
  if (!cell) return null

  const pressureScore =
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

  const conflictClass =
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
    <div className="card-pad h-full min-h-0 overflow-y-auto">
      <div className="eyebrow">
        Selected Grid Cell
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {cell.gridId}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {cell.gnDivision}
          </p>
        </div>

        <PressureBadge
          level={pressureClass}
        />
      </div>

      {/* HISTORICAL */}

      <div className="mt-5">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Historical Change
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniMetric
            label="Green 2015"
            value={`${cell.green2015}%`}
          />

          <MiniMetric
            label="Green 2025"
            value={`${cell.green2025}%`}
          />

          <MiniMetric
            label="Green Loss"
            value={`-${cell.greenLoss}%`}
          />

          <MiniMetric
            label="Green → Built"
            value={`${cell.greenToBuilt}%`}
          />
        </div>
      </div>

      {/* FORECAST */}

      <div className="mt-5">
        <div className="text-[10px] font-bold uppercase tracking-wide text-orange-600">
          {forecastYear} Forecast
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniMetric
            label="Pressure"
            value={`${pressureScore}/100`}
          />

          <MiniMetric
            label="Conservation"
            value={`${conservationScore}/100`}
          />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <InfoRow
          label="Suitability"
          value={`${cell.suitabilityScore}/100`}
        />

        <InfoRow
          label="Conflict"
          value={conflictClass}
        />

        <InfoRow
          label="Intervention"
          value={intervention}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <SuitabilityBadge
          value={cell.suitabilityClass}
        />

        <ConservationBadge
          value={conservationClass}
        />
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Planning Outlook
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          {buildPlanningMessage(
            pressureClass,
            conservationClass,
            cell.suitabilityClass,
            forecastYear,
          )}
        </p>
      </div>
    </div>
  )
}

// ============================================================
// PLANNING MESSAGE
// ============================================================

function buildPlanningMessage(
  pressure,
  conservation,
  suitability,
  year,
) {
  const highPressure =
    pressure === 'High' ||
    pressure === 'Very High'

  const highConservation =
    conservation === 'High' ||
    conservation === 'Critical'

  const lowerSuitability =
    suitability === 'Low suitability' ||
    suitability ===
      'Caution / conservation-sensitive'

  if (
    highPressure &&
    highConservation &&
    lowerSuitability
  ) {
    return `By ${year}, this location combines stronger urbanization pressure, important green-conservation value and lower development suitability. It should receive closer planning attention.`
  }

  if (
    highPressure &&
    highConservation
  ) {
    return `By ${year}, this location faces stronger urbanization pressure while retaining important green value, increasing conservation priority.`
  }

  if (
    highPressure &&
    lowerSuitability
  ) {
    return `By ${year}, development pressure is relatively strong but suitability is lower, indicating a possible planning conflict.`
  }

  if (highPressure) {
    return `By ${year}, this location shows stronger predicted urbanization pressure and should be monitored together with planning suitability.`
  }

  return `By ${year}, forecasted urbanization pressure is comparatively lower. Continue monitoring historical change, suitability and green value.`
}

// ============================================================
// DASHBOARD METRIC
// ============================================================

function DashboardMetric({
  icon: Icon,
  label,
  value,
  text,
  tone,
}) {
  const tones = {
    green:
      'bg-emerald-50 text-emerald-700',

    orange:
      'bg-orange-50 text-orange-700',

    red:
      'bg-red-50 text-red-700',
  }

  return (
    <div className="card-pad">
      <div
        className={`grid h-10 w-10 place-items-center rounded-2xl ${
          tones[tone]
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {text}
      </p>
    </div>
  )
}

// ============================================================
// STORY STAGE
// ============================================================

function StoryStage({
  number,
  icon: Icon,
  title,
  subtitle,
  highlight = false,
}) {
  return (
    <div
      className={`min-w-0 flex-1 rounded-2xl border p-4 ${
        highlight
          ? 'border-orange-200 bg-orange-50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl bg-white ${
            highlight
              ? 'text-orange-700'
              : 'text-emerald-700'
          }`}
        >
          <Icon size={17} />
        </div>

        <span className="text-[10px] font-bold text-slate-400">
          {number}
        </span>
      </div>

      <div className="mt-3 text-sm font-bold text-slate-900">
        {title}
      </div>

      <div className="mt-1 text-[11px] text-slate-500">
        {subtitle}
      </div>
    </div>
  )
}

function StoryArrow() {
  return (
    <div className="hidden shrink-0 items-center justify-center lg:flex">
      <ArrowRight
        size={18}
        className="text-slate-400"
      />
    </div>
  )
}

// ============================================================
// OUTPUT CARD
// ============================================================

function OutputCard({
  icon: Icon,
  title,
  value,
  text,
  link,
}) {
  return (
    <Link
      to={link}
      className="card-pad group block transition hover:-translate-y-0.5 hover:border-emerald-300"
    >
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon size={18} />
        </div>

        <ArrowRight
          size={16}
          className="text-slate-300 transition group-hover:text-emerald-600"
        />
      </div>

      <div className="mt-4 text-xs font-bold uppercase tracking-wide text-emerald-700">
        {value}
      </div>

      <h3 className="mt-1 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </Link>
  )
}

// ============================================================
// CONCEPT ROW
// ============================================================

function ConceptRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-xs font-semibold text-slate-600">
        {label}
      </span>

      <span className="text-right text-xs font-bold text-slate-900">
        {value}
      </span>
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
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="max-w-[175px] text-right text-xs font-bold text-slate-800">
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
    value || 'Monitoring'

  const lower =
    text.toLowerCase()

  let classes =
    'border-slate-200 bg-slate-50 text-slate-600'

  if (
    lower.includes('critical')
  ) {
    classes =
      'border-red-200 bg-red-50 text-red-700'
  } else if (
    lower === 'high'
  ) {
    classes =
      'border-orange-200 bg-orange-50 text-orange-700'
  } else if (
    lower.includes('monitor')
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
// INTERVENTION BADGE
// ============================================================

function InterventionBadge({
  value,
}) {
  const text =
    value || 'Monitoring'

  const lower =
    text.toLowerCase()

  let classes =
    'border-slate-200 bg-slate-50 text-slate-600'

  if (
    lower.includes('critical') ||
    lower.includes('very high')
  ) {
    classes =
      'border-red-200 bg-red-50 text-red-700'
  } else if (
    lower === 'high'
  ) {
    classes =
      'border-orange-200 bg-orange-50 text-orange-700'
  } else if (
    lower.includes('medium') ||
    lower.includes('moderate')
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