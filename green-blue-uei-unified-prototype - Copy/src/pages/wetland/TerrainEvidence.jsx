import { useMemo, useState } from 'react'

import {
  Activity,
  ArrowDownToLine,
  Building2,
  Droplets,
  Gauge,
  Layers3,
  MapPinned,
  Mountain,
  Route,
  Waves,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import Badge from '../../components/ui/Badge'
import TerrainEvidenceMap from '../../components/maps/TerrainEvidenceMap'

import {
  terrainEvidenceZones,
} from '../../data/wetlandData'


const evidenceLayers = [
  {
    key: 'relativeElevation',
    label: 'Relative Lowland',
    description:
      'Local elevation relative to surrounding terrain.',
    icon: ArrowDownToLine,
  },

  {
    key: 'elevation',
    label: 'Elevation',
    description:
      'Mean absolute elevation within the analysis zone.',
    icon: Mountain,
  },

  {
    key: 'slope',
    label: 'Slope',
    description:
      'Mean terrain slope derived from the DEM.',
    icon: Activity,
  },

  {
    key: 'twi',
    label: 'TWI',
    description:
      'Topographic Wetness Index representing terrain wetness tendency.',
    icon: Droplets,
  },

  {
    key: 'flowAccumulation',
    label: 'Flow Accumulation',
    description:
      'Relative runoff convergence derived from terrain.',
    icon: Waves,
  },

  {
    key: 'depressionIndex',
    label: 'Depression',
    description:
      'Relative tendency for a zone to occupy a local terrain depression.',
    icon: Gauge,
  },

  {
    key: 'drainDistance',
    label: 'Drain Distance',
    description:
      'Distance to mapped drainage or canal features.',
    icon: Route,
  },

  {
    key: 'builtupPct',
    label: 'Built-up',
    description:
      'Built-up land percentage within the analysis zone.',
    icon: Building2,
  },
]


export default function TerrainEvidence() {
  const [selectedZone, setSelectedZone] =
    useState(terrainEvidenceZones[0] || null)

  const [activeLayer, setActiveLayer] =
    useState('relativeElevation')

  const [showDrainage, setShowDrainage] =
    useState(true)

  const [showEvents, setShowEvents] =
    useState(true)


  // =========================================================
  // ACTIVE LAYER INFORMATION
  // =========================================================
  const activeLayerInfo =
    evidenceLayers.find(
      (layer) => layer.key === activeLayer,
    )


  // =========================================================
  // LOWLAND SUMMARY
  // Prototype rule only for UI:
  // relativeElevation < 0
  // =========================================================
  const lowlandZoneCount =
    terrainEvidenceZones.filter(
      (zone) => zone.relativeElevation < 0,
    ).length


  const depressionZoneCount =
    terrainEvidenceZones.filter(
      (zone) => zone.depressionIndex >= 0.6,
    ).length


  const highFlowZoneCount =
    terrainEvidenceZones.filter(
      (zone) => zone.flowAccumulation >= 0.7,
    ).length


  const totalEvents =
    terrainEvidenceZones.reduce(
      (sum, zone) =>
        sum + zone.historicalEvents,
      0,
    )


  // =========================================================
  // COMPARATIVE CHART
  // Values are normalized only for visualization.
  // =========================================================
  const normalizedChartData =
    useMemo(() => {
      const normalize = (
        key,
        invert = false,
      ) => {
        const values =
          terrainEvidenceZones.map(
            (zone) => zone[key],
          )

        const min = Math.min(...values)
        const max = Math.max(...values)

        return terrainEvidenceZones.map(
          (zone) => {
            let value =
              max === min
                ? 50
                : ((zone[key] - min) /
                    (max - min)) *
                  100

            if (invert) {
              value = 100 - value
            }

            return {
              zoneId: zone.zoneId,
              value: Number(
                value.toFixed(1),
              ),
            }
          },
        )
      }


      const relative =
        normalize(
          'relativeElevation',
          true,
        )

      const twi =
        normalize('twi')

      const flow =
        normalize(
          'flowAccumulation',
        )

      const depression =
        normalize('depressionIndex')

      const drainage =
        normalize(
          'drainDistance',
          true,
        )


      return terrainEvidenceZones.map(
        (zone) => ({
          zoneId: zone.zoneId,

          'Relative Lowland':
            relative.find(
              (item) =>
                item.zoneId === zone.zoneId,
            )?.value || 0,

          TWI:
            twi.find(
              (item) =>
                item.zoneId === zone.zoneId,
            )?.value || 0,

          'Flow Accumulation':
            flow.find(
              (item) =>
                item.zoneId === zone.zoneId,
            )?.value || 0,

          Depression:
            depression.find(
              (item) =>
                item.zoneId === zone.zoneId,
            )?.value || 0,

          'Drainage Proximity':
            drainage.find(
              (item) =>
                item.zoneId === zone.zoneId,
            )?.value || 0,
        }),
      )
    }, [])


  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="eyebrow">
          Part 2 · Supporting Spatial Evidence
        </div>

        <h1 className="mt-1 text-[24px] font-bold tracking-[-.03em] text-slate-900">
          Terrain & Waterlogging Evidence
        </h1>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          Explore terrain, relative lowland position,
          runoff-convergence, drainage and urban-context
          variables used as supporting evidence within the
          seasonal waterlogging susceptibility framework.
        </p>
      </div>


      {/* =====================================================
          KPI CARDS
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EvidenceSummaryCard
          icon={ArrowDownToLine}
          label="Relative Lowland Zones"
          value={lowlandZoneCount}
          subtitle="Prototype zones below local surroundings"
        />

        <EvidenceSummaryCard
          icon={Gauge}
          label="Strong Depression Evidence"
          value={depressionZoneCount}
          subtitle="Prototype depression index ≥ 0.60"
        />

        <EvidenceSummaryCard
          icon={Waves}
          label="High Flow Accumulation"
          value={highFlowZoneCount}
          subtitle="Prototype terrain convergence"
        />

        <EvidenceSummaryCard
          icon={MapPinned}
          label="Historical Events"
          value={totalEvents}
          subtitle="Prototype supporting observations"
        />
      </div>


      {/* =====================================================
          IMPORTANT CONCEPT
      ===================================================== */}
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-800">
          Important Terrain Concept
        </p>

        <p className="mt-2 max-w-5xl text-[10px] leading-5 text-blue-800">
          Low-lying terrain is not defined only by absolute
          elevation. A location can have a relatively high
          elevation but still occupy a local depression
          compared with its surroundings. Therefore the
          analysis considers absolute elevation together with
          relative elevation, local relief, slope, flow
          accumulation, TWI and depression characteristics.
        </p>
      </div>


      {/* =====================================================
          EVIDENCE LAYER SELECTOR
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <h2 className="section-title">
              Evidence Layer
            </h2>

            <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500">
              Select one spatial variable to inspect its
              pattern across the prototype analysis zones.
            </p>
          </div>

          <Badge variant="blue">
            Supporting Evidence — Not Final Susceptibility
          </Badge>
        </div>


        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {evidenceLayers.map((layer) => {
            const Icon = layer.icon

            const active =
              activeLayer === layer.key

            return (
              <button
                key={layer.key}
                type="button"
                onClick={() =>
                  setActiveLayer(layer.key)
                }
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'
                }`}
              >
                <Icon
                  size={16}
                  className={
                    active
                      ? 'text-teal-700'
                      : 'text-slate-400'
                  }
                />

                <p
                  className={`mt-2 text-[10px] font-bold ${
                    active
                      ? 'text-teal-900'
                      : 'text-slate-700'
                  }`}
                >
                  {layer.label}
                </p>
              </button>
            )
          })}
        </div>


        {activeLayerInfo && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-800">
              {activeLayerInfo.label}
            </p>

            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              {activeLayerInfo.description}
            </p>
          </div>
        )}
      </div>


      {/* =====================================================
          MAP CONTROLS
      ===================================================== */}
      <div className="mt-5 card-pad">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Supporting Map Layers
        </span>

        <div className="mt-2 flex flex-wrap gap-2">
          <LayerToggle
            label="Drainage / Canals"
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


      {/* =====================================================
          MAP + ZONE LIST
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="card-pad">
          <div className="mb-4">
            <h2 className="section-title">
              {activeLayerInfo?.label || 'Terrain'} Map
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Click an analysis zone to inspect its terrain,
              drainage and urban-context attributes.
            </p>
          </div>


          <TerrainEvidenceMap
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            activeLayer={activeLayer}
            showDrainage={showDrainage}
            showEvents={showEvents}
          />
        </div>


        <div className="card-pad">
          <h2 className="section-title">
            Analysis Zones
          </h2>

          <p className="mt-1 text-[10px] text-slate-500">
            Prototype terrain and evidence records.
          </p>


          <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {terrainEvidenceZones.map((zone) => {
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
                      : 'border-slate-200 bg-white hover:bg-slate-50'
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

                    <Layers3
                      size={17}
                      className="text-slate-400"
                    />
                  </div>


                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MiniValue
                      label="Rel. Elev."
                      value={`${zone.relativeElevation} m`}
                    />

                    <MiniValue
                      label="TWI"
                      value={zone.twi}
                    />

                    <MiniValue
                      label="Depression"
                      value={zone.depressionIndex}
                    />

                    <MiniValue
                      label="Events"
                      value={zone.historicalEvents}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>


      {/* =====================================================
          SELECTED ZONE
      ===================================================== */}
      {selectedZone && (
        <div className="mt-5 card-pad">
          <div>
            <div className="eyebrow">
              Selected Terrain Zone
            </div>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {selectedZone.zoneId} — {selectedZone.name}
            </h2>
          </div>


          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            {/* Elevation / Lowland */}
            <EvidenceGroup
              icon={Mountain}
              title="Elevation & Local Relief"
              rows={[
                [
                  'Mean elevation',
                  `${selectedZone.meanElevation} m`,
                ],
                [
                  'Minimum elevation',
                  `${selectedZone.minElevation} m`,
                ],
                [
                  'Relative elevation',
                  `${selectedZone.relativeElevation} m`,
                ],
                [
                  'Local relief',
                  `${selectedZone.localRelief} m`,
                ],
              ]}
            />


            {/* Terrain hydrology */}
            <EvidenceGroup
              icon={Droplets}
              title="Terrain Hydrology"
              rows={[
                [
                  'Mean slope',
                  `${selectedZone.meanSlope}°`,
                ],
                [
                  'Slope variability',
                  selectedZone.slopeSd,
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


            {/* Drainage / Urban */}
            <EvidenceGroup
              icon={Building2}
              title="Drainage & Urban Context"
              rows={[
                [
                  'Drain distance',
                  `${selectedZone.drainDistance} m`,
                ],
                [
                  'Canal distance',
                  `${selectedZone.canalDistance} m`,
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
                [
                  'Historical events',
                  selectedZone.historicalEvents,
                ],
              ]}
            />
          </div>
        </div>
      )}


      {/* =====================================================
          COMPARATIVE TERRAIN PROFILE
      ===================================================== */}
      <div className="mt-5 card-pad">
        <h2 className="section-title">
          Comparative Terrain-Evidence Profile
        </h2>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          The following values are normalized only for
          prototype comparison. They are not the final
          waterlogging probability and should not be
          interpreted as model feature importance.
        </p>


        <div className="mt-4 h-[350px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={normalizedChartData}
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
                dataKey="zoneId"
              />

              <YAxis
                domain={[0, 100]}
                unit="%"
              />

              <Tooltip
                formatter={(value) =>
                  `${value}% normalized`
                }
              />

              <Bar
                dataKey="Relative Lowland"
                fill="#0F766E"
              />

              <Bar
                dataKey="TWI"
                fill="#3B82F6"
              />

              <Bar
                dataKey="Flow Accumulation"
                fill="#7C3AED"
              />

              <Bar
                dataKey="Depression"
                fill="#F97316"
              />

              <Bar
                dataKey="Drainage Proximity"
                fill="#64748B"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* =====================================================
          DEM WORKFLOW
      ===================================================== */}
      <div className="mt-5 card-pad">
        <h2 className="section-title">
          DEM-Derived Terrain Workflow
        </h2>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          The terrain indicators displayed here are derived
          from elevation data rather than manually assigned.
        </p>


        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-700">
          <WorkflowStep text="DEM / DTM" />
          <span>→</span>

          <WorkflowStep text="QGIS" />
          <span>→</span>

          <WorkflowStep text="Elevation" />
          <span>+</span>

          <WorkflowStep text="Relative Elevation" />
          <span>+</span>

          <WorkflowStep text="Slope" />
          <span>+</span>

          <WorkflowStep text="Flow Direction" />
          <span>+</span>

          <WorkflowStep text="Flow Accumulation" />
          <span>+</span>

          <WorkflowStep text="TWI" />
          <span>+</span>

          <WorkflowStep text="Depression Indicators" />
          <span>→</span>

          <WorkflowStep text="Terrain Feature Dataset" />
        </div>
      </div>


      {/* =====================================================
          IMPORTANT LIMITATIONS
      ===================================================== */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-bold text-amber-900">
            Low-Lying ≠ Waterlogged
          </p>

          <p className="mt-2 text-[10px] leading-5 text-amber-800">
            A relative depression or low terrain position
            indicates terrain susceptibility only. Final
            waterlogging prediction additionally considers
            drainage, urban surfaces, rainfall and historical
            event evidence.
          </p>
        </div>


        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold text-slate-800">
            DEM Resolution Limitation
          </p>

          <p className="mt-2 text-[10px] leading-5 text-slate-600">
            Public coarse-resolution DEMs may represent broad
            lowlands but may not capture curbs, small roadside
            depressions, culverts, narrow drains or other
            urban micro-topography. Final interpretation must
            document the terrain dataset's native resolution
            and limitations.
          </p>
        </div>
      </div>


      {/* =====================================================
          PROTOTYPE NOTICE
      ===================================================== */}
      <div className="mt-5 data-note">
        <b>Prototype Demo —</b> terrain values, event counts,
        normalized evidence intensities and schematic spatial
        zones shown here are mock demonstration data. Final
        layers will be derived from audited DEM/DTM data,
        drainage GIS, urban-context layers and KMC historical
        evidence.
      </div>
    </div>
  )
}


// ===========================================================
// SMALL COMPONENTS
// ===========================================================

function EvidenceSummaryCard({
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

          <p className="mt-2 text-xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {subtitle}
          </p>
        </div>

        <Icon
          size={20}
          className="text-teal-700"
        />
      </div>
    </div>
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


function MiniValue({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <p className="text-[8px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-[10px] font-bold text-slate-700">
        {value}
      </p>
    </div>
  )
}


function EvidenceGroup({
  icon: Icon,
  title,
  rows,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className="text-teal-700"
        />

        <p className="text-[11px] font-bold text-slate-900">
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


function WorkflowStep({ text }) {
  return (
    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      {text}
    </span>
  )
}