import { useMemo, useState } from 'react'

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  MapPinned,
  TrendingDown,
} from 'lucide-react'

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import Badge from '../../components/ui/Badge'
import FutureWetlandMap from '../../components/maps/FutureWetlandMap'

import {
  futureProjections,
  futureValidation,
  wetlandHistory,
  wetlands,
} from '../../data/wetlandData'


export default function FutureProjection() {
  // =========================================================
  // ONLY WETLANDS WITH FUTURE PROJECTION DATA
  // =========================================================
  const availableWetlands = useMemo(() => {
    const ids = new Set(
      futureProjections.map(
        (item) => item.wetlandId,
      ),
    )

    return wetlands.filter((wetland) =>
      ids.has(wetland.wetlandId),
    )
  }, [])


  const [wetlandId, setWetlandId] =
    useState(
      availableWetlands[0]?.wetlandId || '',
    )


  const [scenario, setScenario] =
    useState('Historical Continuation')


  const selectedWetland =
    availableWetlands.find(
      (wetland) =>
        wetland.wetlandId === wetlandId,
    )


  const projection =
    futureProjections.find(
      (item) =>
        item.wetlandId === wetlandId &&
        item.scenario === scenario,
    ) ||
    futureProjections.find(
      (item) =>
        item.wetlandId === wetlandId,
    )


  const validation =
    futureValidation.find(
      (item) =>
        item.wetlandId === wetlandId,
    )


  // =========================================================
  // HISTORICAL + FUTURE TREND
  // =========================================================
  const trendData = useMemo(() => {
    if (!projection) return []

    const history = wetlandHistory
      .filter(
        (item) =>
          item.wetlandId === wetlandId,
      )
      .sort((a, b) => a.year - b.year)
      .map((item) => ({
        year: item.year,
        historical: item.area,
        projected: null,
      }))


    // If we have no detailed historical observations,
    // still show the current inventory year.
    if (!history.length) {
      history.push({
        year: projection.currentYear,
        historical: projection.currentArea,
        projected: projection.currentArea,
      })
    } else {
      const latest = history[
        history.length - 1
      ]

      latest.projected =
        latest.historical
    }


    history.push({
      year: projection.projectionYear,
      historical: null,
      projected: projection.projectedArea,
    })


    return history
  }, [wetlandId, projection])


  const confidenceVariant = (value) => {
    if (value === 'High') return 'green'
    if (value === 'Moderate') return 'amber'
    return 'slate'
  }


  if (!projection || !selectedWetland) {
    return (
      <div className="card-pad">
        Future projection data are not currently available.
      </div>
    )
  }


  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="eyebrow">
          Part 1C · Spatial Projection
        </div>

        <h1 className="mt-1 text-[24px] font-bold tracking-[-.03em] text-slate-900">
          Future Wetland Projection
        </h1>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          Explore scenario-based future wetland boundaries
          derived from historical spatial land-change patterns
          and validated through historical hindcasting.
        </p>
      </div>


      {/* =====================================================
          CONTROLS
      ===================================================== */}
      <div className="card-pad">
        <div className="grid gap-4 lg:grid-cols-3">
          <label>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Select Wetland
            </span>

            <select
              value={wetlandId}
              onChange={(event) =>
                setWetlandId(event.target.value)
              }
              className="control mt-1"
            >
              {availableWetlands.map(
                (wetland) => (
                  <option
                    key={wetland.wetlandId}
                    value={wetland.wetlandId}
                  >
                    {wetland.wetlandId} —{' '}
                    {wetland.name}
                  </option>
                ),
              )}
            </select>
          </label>


          <label>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Projection Scenario
            </span>

            <select
              value={scenario}
              onChange={(event) =>
                setScenario(event.target.value)
              }
              className="control mt-1"
            >
              <option value="Historical Continuation">
                Historical Continuation
              </option>
            </select>
          </label>


          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Projection Period
            </span>

            <div className="mt-1 flex h-[38px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold text-slate-700">
              {projection.currentYear}
              <span className="mx-2 text-slate-400">→</span>
              {projection.projectionYear}
            </div>
          </div>
        </div>
      </div>


      {/* =====================================================
          KPI CARDS
      ===================================================== */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ProjectionCard
          icon={MapPinned}
          label="Current Area"
          value={`${projection.currentArea.toFixed(1)} ha`}
          subtitle={`${projection.currentYear} mapped extent`}
        />

        <ProjectionCard
          icon={CalendarClock}
          label={`${projection.projectionYear} Projected Area`}
          value={`${projection.projectedArea.toFixed(1)} ha`}
          subtitle={projection.scenario}
        />

        <ProjectionCard
          icon={TrendingDown}
          label="Projected Change"
          value={`${projection.projectedChange.toFixed(1)} ha`}
          subtitle={`${projection.projectedChangePercent.toFixed(1)}%`}
          alert={projection.projectedChange < 0}
        />

        <ProjectionCard
          icon={CheckCircle2}
          label="Projection Confidence"
          value={projection.confidence}
          subtitle="Based on hindcast performance"
        />

        <ProjectionCard
          icon={AlertTriangle}
          label="Projection Type"
          value="Scenario"
          subtitle="Not a guaranteed future boundary"
        />
      </div>


      {/* =====================================================
          MAP + PROJECTION DETAILS
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="card-pad">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="section-title">
                Current vs Projected Boundary
              </h2>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                {selectedWetland.wetlandId} —{' '}
                {selectedWetland.name}
              </p>
            </div>

            <Badge
              variant={confidenceVariant(
                projection.confidence,
              )}
            >
              {projection.confidence} confidence
            </Badge>
          </div>


          <FutureWetlandMap
            currentArea={projection.currentArea}
            projectedArea={projection.projectedArea}
            currentYear={projection.currentYear}
            projectionYear={projection.projectionYear}
          />
        </div>


        <div className="card-pad">
          <h2 className="section-title">
            Projection Summary
          </h2>

          <div className="mt-4 space-y-3">
            <DetailRow
              label="Wetland"
              value={selectedWetland.wetlandId}
            />

            <DetailRow
              label="Current Year"
              value={projection.currentYear}
            />

            <DetailRow
              label="Projection Year"
              value={projection.projectionYear}
            />

            <DetailRow
              label="Current Area"
              value={`${projection.currentArea.toFixed(
                1,
              )} ha`}
            />

            <DetailRow
              label="Projected Area"
              value={`${projection.projectedArea.toFixed(
                1,
              )} ha`}
            />

            <DetailRow
              label="Projected Change"
              value={`${projection.projectedChange.toFixed(
                1,
              )} ha`}
            />

            <DetailRow
              label="Projected Change %"
              value={`${projection.projectedChangePercent.toFixed(
                1,
              )}%`}
            />

            <DetailRow
              label="Scenario"
              value={projection.scenario}
            />
          </div>


          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-[10px] font-bold text-amber-900">
              Important Interpretation
            </p>

            <p className="mt-2 text-[10px] leading-5 text-amber-800">
              This represents a modelled spatial future under
              the selected scenario. It should be interpreted
              as a planning projection rather than the exact
              future wetland boundary.
            </p>
          </div>
        </div>
      </div>


      {/* =====================================================
          HISTORICAL + FUTURE TREND
      ===================================================== */}
      <div className="mt-5 card-pad">
        <h2 className="section-title">
          Historical and Projected Wetland Area
        </h2>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          Historical observations are shown separately from
          the future scenario projection.
        </p>


        <div className="mt-4 h-[330px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={trendData}
              margin={{
                top: 10,
                right: 20,
                left: -5,
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
                formatter={(value, name) => [
                  value != null
                    ? `${value} ha`
                    : '—',
                  name === 'historical'
                    ? 'Historical Area'
                    : 'Projected Area',
                ]}
              />

              <ReferenceLine
                x={projection.currentYear}
                stroke="#94A3B8"
                strokeDasharray="5 5"
                label={{
                  value: 'Projection begins',
                  position: 'insideTopRight',
                  fontSize: 9,
                }}
              />

              <Line
                type="monotone"
                dataKey="historical"
                name="Historical"
                stroke="#0F766E"
                strokeWidth={3}
                connectNulls={false}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="projected"
                name="Projected"
                stroke="#F97316"
                strokeWidth={3}
                strokeDasharray="7 6"
                connectNulls
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>


        <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-[3px] w-7 bg-teal-700" />
            Historical observations
          </div>

          <div className="flex items-center gap-2">
            <span className="w-7 border-t-[3px] border-dashed border-orange-500" />
            Scenario projection
          </div>
        </div>
      </div>


      {/* =====================================================
          HINDCAST VALIDATION
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div>
            <h2 className="section-title">
              Historical Hindcast Validation
            </h2>

            <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-500">
              Before producing the future boundary, the spatial
              model is tested by predicting a historical year
              that is already known and comparing the
              prediction with the observed wetland extent.
            </p>
          </div>

          <Badge variant="blue">
            Spatial Validation
          </Badge>
        </div>


        {validation ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <ValidationMetric
                label="Hindcast Year"
                value={validation.hindcastYear}
              />

              <ValidationMetric
                label="IoU"
                value={`${(
                  validation.iou * 100
                ).toFixed(1)}%`}
              />

              <ValidationMetric
                label="Precision"
                value={`${(
                  validation.precision * 100
                ).toFixed(1)}%`}
              />

              <ValidationMetric
                label="Recall"
                value={`${(
                  validation.recall * 100
                ).toFixed(1)}%`}
              />

              <ValidationMetric
                label="F1"
                value={`${(
                  validation.f1 * 100
                ).toFixed(1)}%`}
              />

              <ValidationMetric
                label="Area Error"
                value={`${validation.areaErrorPercent.toFixed(
                  1,
                )}%`}
              />
            </div>


            <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
              <p className="text-[10px] font-semibold text-teal-900">
                Why hindcasting matters
              </p>

              <p className="mt-2 text-[10px] leading-5 text-teal-800">
                A future spatial boundary should not be shown
                simply because a model can generate one.
                Hindcasting checks whether the same modelling
                approach can reasonably reconstruct a known
                historical wetland pattern before it is used
                for future projection.
              </p>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-[11px] font-semibold text-slate-700">
              Hindcast validation data are not yet available
              for this prototype wetland.
            </p>
          </div>
        )}
      </div>


      {/* =====================================================
          MODEL WORKFLOW
      ===================================================== */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Future Spatial Modelling Workflow
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-700">
          <WorkflowStep text="Historical Wetland Maps" />
          <span>+</span>

          <WorkflowStep text="Historical Land-Use Maps" />
          <span>→</span>

          <WorkflowStep text="QGIS Raster Preparation" />
          <span>→</span>

          <WorkflowStep text="Transition Matrix" />
          <span>→</span>

          <WorkflowStep text="CA-Markov Spatial Simulation" />
          <span>→</span>

          <WorkflowStep text="Hindcast Validation" />
          <span>→</span>

          <WorkflowStep text="Future Scenario Raster" />
          <span>→</span>

          <WorkflowStep text="Projected Wetland Polygon" />
        </div>
      </div>


      {/* =====================================================
          PROTOTYPE NOTICE
      ===================================================== */}
      <div className="mt-5 data-note">
        <b>Prototype Demo —</b> projected boundaries,
        projected areas, hindcast metrics and scenario values
        on this page are mock demonstration outputs. Final
        projections will be generated from consistent
        historical spatial data and validated future
        land-change modelling.
      </div>
    </div>
  )
}


// ===========================================================
// SMALL COMPONENTS
// ===========================================================

function ProjectionCard({
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
            className={`mt-2 text-lg font-bold ${
              alert
                ? 'text-orange-700'
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
          size={19}
          className={
            alert
              ? 'text-orange-600'
              : 'text-teal-700'
          }
        />
      </div>
    </div>
  )
}


function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-2">
      <span className="text-[10px] text-slate-500">
        {label}
      </span>

      <span className="text-right text-[11px] font-semibold text-slate-800">
        {value}
      </span>
    </div>
  )
}


function ValidationMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}


function WorkflowStep({ text }) {
  return (
    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      {text}
    </span>
  )
}