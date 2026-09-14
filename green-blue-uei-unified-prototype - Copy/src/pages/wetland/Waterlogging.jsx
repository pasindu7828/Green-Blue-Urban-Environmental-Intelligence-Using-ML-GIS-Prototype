import { useMemo, useState } from 'react'

import {
  AlertTriangle,
  BrainCircuit,
  CloudRain,
  Droplets,
  MapPinned,
  Waves,
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

import Badge from '../../components/ui/Badge'
import WaterloggingMap from '../../components/maps/WaterloggingMap'

import {
  waterloggingModelMetrics,
  waterloggingScaleExperiments,
  waterloggingZones,
} from '../../data/wetlandData'


export default function Waterlogging() {
  const [selectedZone, setSelectedZone] =
    useState(waterloggingZones[0] || null)

  const [susceptibilityFilter, setSusceptibilityFilter] =
    useState('All')

  const [showSusceptibility, setShowSusceptibility] =
    useState(true)

  const [showDrainage, setShowDrainage] =
    useState(true)

  const [showEvents, setShowEvents] =
    useState(true)


  // =========================================================
  // FILTER
  // =========================================================
  const filteredZones = useMemo(() => {
    if (susceptibilityFilter === 'All') {
      return waterloggingZones
    }

    return waterloggingZones.filter(
      (zone) =>
        zone.susceptibility === susceptibilityFilter,
    )
  }, [susceptibilityFilter])


  // =========================================================
  // COUNTS
  // =========================================================
  const lowCount = waterloggingZones.filter(
    (zone) => zone.susceptibility === 'Low',
  ).length

  const moderateCount = waterloggingZones.filter(
    (zone) => zone.susceptibility === 'Moderate',
  ).length

  const highCount = waterloggingZones.filter(
    (zone) => zone.susceptibility === 'High',
  ).length

  const veryHighCount = waterloggingZones.filter(
    (zone) => zone.susceptibility === 'Very High',
  ).length

  const historicalEventCount =
    waterloggingZones.reduce(
      (sum, zone) =>
        sum + zone.historicalEvents,
      0,
    )


  // =========================================================
  // BEST MODEL
  // =========================================================
  const bestModel = useMemo(() => {
    return [...waterloggingModelMetrics].sort(
      (a, b) => b.f1 - a.f1,
    )[0]
  }, [])


  // =========================================================
  // MODEL CHART
  // =========================================================
  const modelChartData =
    waterloggingModelMetrics.map((item) => ({
      model: item.model,
      Precision: Number(
        (item.precision * 100).toFixed(1),
      ),
      Recall: Number(
        (item.recall * 100).toFixed(1),
      ),
      F1: Number(
        (item.f1 * 100).toFixed(1),
      ),
      'PR-AUC': Number(
        (item.prAuc * 100).toFixed(1),
      ),
    }))


  const scaleChartData =
    waterloggingScaleExperiments.map((item) => ({
      scale: item.scale,
      F1: Number(
        (item.f1 * 100).toFixed(1),
      ),
      'PR-AUC': Number(
        (item.prAuc * 100).toFixed(1),
      ),
    }))


  const susceptibilityVariant = (level) => {
    if (level === 'Very High') return 'red'
    if (level === 'High') return 'amber'
    if (level === 'Moderate') return 'yellow'
    return 'green'
  }


  const confidenceVariant = (level) => {
    if (level === 'High') return 'green'
    if (level === 'Moderate') return 'amber'
    return 'slate'
  }


  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="eyebrow">
          Part 2 · Machine Learning
        </div>

        <h1 className="mt-1 text-[24px] font-bold tracking-[-.03em] text-slate-900">
          Waterlogging Susceptibility
        </h1>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          Identify areas more susceptible to recurring
          seasonal waterlogging using terrain, drainage,
          urban-surface, rainfall and historical municipal
          evidence.
        </p>
      </div>


      {/* =====================================================
          KPI CARDS
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={Droplets}
          label="Low Zones"
          value={lowCount}
          subtitle="Prototype susceptibility"
        />

        <SummaryCard
          icon={Waves}
          label="Moderate Zones"
          value={moderateCount}
          subtitle="Prototype susceptibility"
        />

        <SummaryCard
          icon={AlertTriangle}
          label="High Zones"
          value={highCount}
          subtitle="Higher susceptibility"
        />

        <SummaryCard
          icon={AlertTriangle}
          label="Very High Zones"
          value={veryHighCount}
          subtitle="Highest susceptibility"
          alert
        />

        <SummaryCard
          icon={MapPinned}
          label="Historical Events"
          value={historicalEventCount}
          subtitle="Prototype event evidence"
        />
      </div>


      {/* =====================================================
          WORKFLOW
      ===================================================== */}
      <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-800">
          Waterlogging Modelling Workflow
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-700">
          <WorkflowStep text="DEM / Terrain" />
          <span>+</span>

          <WorkflowStep text="Drainage" />
          <span>+</span>

          <WorkflowStep text="Urban Surfaces" />
          <span>+</span>

          <WorkflowStep text="Rainfall" />
          <span>+</span>

          <WorkflowStep text="Historical Events" />
          <span>→</span>

          <WorkflowStep text="Feature Engineering" />
          <span>→</span>

          <WorkflowStep text="LR / RF / XGBoost / CatBoost" />
          <span>→</span>

          <WorkflowStep text="Spatial Validation" />
          <span>→</span>

          <WorkflowStep text="Susceptibility Map" />
        </div>
      </div>


      {/* =====================================================
          CONTROLS
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
          <label>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Susceptibility Filter
            </span>

            <select
              value={susceptibilityFilter}
              onChange={(event) =>
                setSusceptibilityFilter(event.target.value)
              }
              className="control mt-1"
            >
              <option value="All">All Zones</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
            </select>
          </label>


          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Map Layers
            </span>

            <div className="mt-2 flex flex-wrap gap-2">
              <LayerToggle
                label="Susceptibility"
                active={showSusceptibility}
                onClick={() =>
                  setShowSusceptibility((value) => !value)
                }
              />

              <LayerToggle
                label="Drainage"
                active={showDrainage}
                onClick={() =>
                  setShowDrainage((value) => !value)
                }
              />

              <LayerToggle
                label="Historical Events"
                active={showEvents}
                onClick={() =>
                  setShowEvents((value) => !value)
                }
              />
            </div>
          </div>
        </div>
      </div>


      {/* =====================================================
          MAP + ZONE LIST
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="card-pad">
          <div className="mb-4">
            <h2 className="section-title">
              Seasonal Waterlogging Susceptibility Map
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Select a susceptibility zone to inspect its
              probability, environmental conditions,
              rainfall context and historical evidence.
            </p>
          </div>

          <WaterloggingMap
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            showSusceptibility={showSusceptibility}
            showDrainage={showDrainage}
            showEvents={showEvents}
          />
        </div>


        <div className="card-pad">
          <div className="mb-4">
            <h2 className="section-title">
              Susceptibility Zones
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              {filteredZones.length} zone
              {filteredZones.length !== 1 ? 's' : ''} shown
            </p>
          </div>


          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {filteredZones.map((zone) => {
              const selected =
                selectedZone?.zoneId === zone.zoneId

              return (
                <button
                  key={zone.zoneId}
                  type="button"
                  onClick={() =>
                    setSelectedZone(zone)
                  }
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                        {zone.zoneId}
                      </p>

                      <p className="mt-1 text-[11px] font-bold text-slate-900">
                        {zone.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {(zone.probability * 100).toFixed(0)}%
                      </p>

                      <p className="text-[8px] uppercase tracking-wide text-slate-400">
                        probability
                      </p>
                    </div>
                  </div>


                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      variant={susceptibilityVariant(
                        zone.susceptibility,
                      )}
                    >
                      {zone.susceptibility}
                    </Badge>

                    <Badge
                      variant={confidenceVariant(
                        zone.confidence,
                      )}
                    >
                      {zone.confidence} confidence
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>


      {/* =====================================================
          SELECTED ZONE DETAILS
      ===================================================== */}
      {selectedZone && (
        <div className="mt-5 card-pad">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="eyebrow">
                Selected Waterlogging Zone
              </div>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {selectedZone.zoneId} — {selectedZone.name}
              </h2>
            </div>


            <div className="flex flex-wrap gap-2">
              <Badge
                variant={susceptibilityVariant(
                  selectedZone.susceptibility,
                )}
              >
                {selectedZone.susceptibility}
              </Badge>

              <Badge
                variant={confidenceVariant(
                  selectedZone.confidence,
                )}
              >
                {selectedZone.confidence} confidence
              </Badge>
            </div>
          </div>


          {/* Main Metrics */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <ZoneMetric
              label="Probability"
              value={`${(
                selectedZone.probability * 100
              ).toFixed(0)}%`}
            />

            <ZoneMetric
              label="Relative Elevation"
              value={`${selectedZone.relativeElevation} m`}
            />

            <ZoneMetric
              label="TWI"
              value={selectedZone.twi}
            />

            <ZoneMetric
              label="Drain Distance"
              value={`${selectedZone.drainDistance} m`}
            />

            <ZoneMetric
              label="Historical Events"
              value={selectedZone.historicalEvents}
            />
          </div>


          {/* Terrain / Urban / Rainfall */}
          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <EvidencePanel
              icon={Waves}
              title="Terrain Evidence"
              rows={[
                [
                  'Mean elevation',
                  `${selectedZone.meanElevation} m`,
                ],
                [
                  'Relative elevation',
                  `${selectedZone.relativeElevation} m`,
                ],
                [
                  'Mean slope',
                  `${selectedZone.meanSlope}°`,
                ],
                ['TWI', selectedZone.twi],
                [
                  'Flow accumulation',
                  selectedZone.flowAccumulation,
                ],
                [
                  'Depression index',
                  selectedZone.depressionIndex,
                ],
              ]}
            />


            <EvidencePanel
              icon={MapPinned}
              title="Drainage & Urban Context"
              rows={[
                [
                  'Drain distance',
                  `${selectedZone.drainDistance} m`,
                ],
                [
                  'Drainage density',
                  selectedZone.drainageDensity,
                ],
                [
                  'Built-up',
                  `${selectedZone.builtupPct}%`,
                ],
                [
                  'Road density',
                  selectedZone.roadDensity,
                ],
              ]}
            />


            <EvidencePanel
              icon={CloudRain}
              title="Rainfall & Event Context"
              rows={[
                [
                  'Rainfall 24 h',
                  `${selectedZone.rain24h} mm`,
                ],
                [
                  'Rainfall 3 day',
                  `${selectedZone.rain3d} mm`,
                ],
                [
                  'Rainfall 7 day',
                  `${selectedZone.rain7d} mm`,
                ],
                [
                  'Historical events',
                  selectedZone.historicalEvents,
                ],
              ]}
            />
          </div>


          {/* WHY THIS ZONE */}
          <div className="mt-5">
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={16}
                className="text-purple-700"
              />

              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Why this susceptibility level?
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {selectedZone.drivers.map(
                (driver, index) => (
                  <div
                    key={`${driver}-${index}`}
                    className="rounded-xl border border-purple-100 bg-purple-50/60 px-3 py-3"
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-purple-600">
                      Factor {index + 1}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-700">
                      {driver}
                    </p>
                  </div>
                ),
              )}
            </div>

            <p className="mt-3 text-[9px] leading-4 text-slate-400">
              Final local explanations will be generated from
              validated model explainability outputs such as
              SHAP rather than manually assigned factors.
            </p>
          </div>
        </div>
      )}


      {/* =====================================================
          MODEL COMPARISON
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="card-pad">
          <h2 className="section-title">
            Waterlogging Model Comparison
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Prototype comparison of Logistic Regression,
            Random Forest, XGBoost and CatBoost.
          </p>


          <div className="mt-4 h-[330px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={modelChartData}
                margin={{
                  top: 10,
                  right: 15,
                  left: -5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 5"
                />

                <XAxis
                  dataKey="model"
                  tick={{ fontSize: 8 }}
                />

                <YAxis
                  domain={[0, 100]}
                  unit="%"
                />

                <Tooltip
                  formatter={(value) => `${value}%`}
                />

                <Legend />

                <Bar
                  dataKey="Precision"
                  fill="#0F766E"
                />

                <Bar
                  dataKey="Recall"
                  fill="#3B82F6"
                />

                <Bar
                  dataKey="F1"
                  fill="#F59E0B"
                />

                <Bar
                  dataKey="PR-AUC"
                  fill="#7C3AED"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>


          {bestModel && (
            <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50 p-3">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-teal-700">
                Best Prototype Model
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {bestModel.model}
              </p>

              <p className="mt-1 text-[10px] text-slate-600">
                F1 = {(bestModel.f1 * 100).toFixed(1)}% ·
                PR-AUC ={' '}
                {(bestModel.prAuc * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>


        {/* ANALYSIS SCALE */}
        <div className="card-pad">
          <h2 className="section-title">
            Analysis-Unit Scale Experiment
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            The final spatial unit should be selected through
            testing rather than choosing a grid size
            arbitrarily.
          </p>


          <div className="mt-4 h-[330px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={scaleChartData}
                margin={{
                  top: 10,
                  right: 15,
                  left: -5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 5"
                />

                <XAxis
                  dataKey="scale"
                  tick={{ fontSize: 9 }}
                />

                <YAxis
                  domain={[0, 100]}
                  unit="%"
                />

                <Tooltip
                  formatter={(value) => `${value}%`}
                />

                <Legend />

                <Bar
                  dataKey="F1"
                  fill="#0F766E"
                />

                <Bar
                  dataKey="PR-AUC"
                  fill="#7C3AED"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>


          <div className="mt-3 space-y-2">
            {waterloggingScaleExperiments.map(
              (experiment) => (
                <div
                  key={experiment.scale}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-bold text-slate-800">
                      {experiment.scale}
                    </p>

                    <p className="text-[9px] font-semibold text-teal-700">
                      {experiment.exampleSize}
                    </p>
                  </div>

                  <p className="mt-1 text-[9px] leading-4 text-slate-500">
                    {experiment.note}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>


      {/* =====================================================
          INTERPRETATION NOTICE
      ===================================================== */}
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-[10px] font-bold text-amber-900">
          Susceptibility ≠ Guaranteed Waterlogging
        </p>

        <p className="mt-2 max-w-5xl text-[10px] leading-5 text-amber-800">
          A High or Very High susceptibility zone means that
          the available terrain, drainage, rainfall, urban
          context and historical evidence are associated with
          a greater tendency for seasonal waterlogging. It
          does not predict exact flood depth, duration or an
          exact future event time.
        </p>
      </div>


      {/* =====================================================
          NOTICE
      ===================================================== */}
      <div className="mt-5 data-note">
        <b>Prototype Demo —</b> susceptibility classes,
        probabilities, rainfall values, historical-event
        counts, model metrics and contributing factors shown
        here are mock demonstration values. Final results will
        be generated from the validated Part 2 dataset and
        Machine Learning workflow.
      </div>
    </div>
  )
}


// ===========================================================
// SMALL COMPONENTS
// ===========================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtitle,
  alert = false,
}) {
  return (
    <div className="card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-xl font-bold ${
              alert
                ? 'text-red-700'
                : 'text-slate-900'
            }`}
          >
            {value}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {subtitle}
          </p>
        </div>

        <Icon
          size={20}
          className={
            alert
              ? 'text-red-600'
              : 'text-teal-700'
          }
        />
      </div>
    </div>
  )
}


function WorkflowStep({ text }) {
  return (
    <span className="rounded-lg border border-white bg-white px-3 py-2 shadow-sm">
      {text}
    </span>
  )
}


function LayerToggle({
  label,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-[10px] font-semibold transition ${
        active
          ? 'border-teal-500 bg-teal-50 text-teal-800'
          : 'border-slate-200 bg-white text-slate-500'
      }`}
    >
      {active ? '✓ ' : ''}
      {label}
    </button>
  )
}


function ZoneMetric({
  label,
  value,
}) {
  return (
    <div className="soft-panel">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}


function EvidencePanel({
  icon: Icon,
  title,
  rows,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-teal-700"
        />

        <p className="text-[11px] font-bold text-slate-800">
          {title}
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-0"
          >
            <span className="text-[9px] text-slate-500">
              {label}
            </span>

            <span className="text-[10px] font-semibold text-slate-800">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}