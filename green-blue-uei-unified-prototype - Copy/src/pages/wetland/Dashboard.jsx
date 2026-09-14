import { useMemo, useState } from 'react'

import {
  AlertTriangle,
  Droplets,
  History,
  Map,
  Radar,
  TrendingDown,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import MetricCard from '../../components/shared/MetricCard'
import WetlandMap from '../../components/maps/WetlandMap'
import Badge from '../../components/ui/Badge'

import {
  candidateConfidenceDistribution,
  candidateWetlands,
  futureProjections,
  waterloggingDistribution,
  waterloggingZones,
  wetlandExtentTrend,
  wetlandHistory,
  wetlands,
  wetlandTransitions,
} from '../../data/wetlandData'


export default function Dashboard() {
  const [wetlandId, setWetlandId] =
    useState('All Wetlands')


  // =========================================================
  // SELECTED WETLAND
  // =========================================================
  const selectedWetland = useMemo(() => {
    if (wetlandId === 'All Wetlands') {
      return null
    }

    return (
      wetlands.find(
        (wetland) =>
          wetland.wetlandId === wetlandId,
      ) || null
    )
  }, [wetlandId])


  // =========================================================
  // SELECTED WETLAND HISTORY
  // =========================================================
  const selectedHistory = useMemo(() => {
    if (!selectedWetland) {
      return []
    }

    return wetlandHistory
      .filter(
        (item) =>
          item.wetlandId ===
          selectedWetland.wetlandId,
      )
      .sort((a, b) => a.year - b.year)
  }, [selectedWetland])


  // =========================================================
  // SELECTED FUTURE PROJECTION
  // =========================================================
  const selectedFuture = useMemo(() => {
    if (!selectedWetland) {
      return null
    }

    return (
      futureProjections.find(
        (item) =>
          item.wetlandId ===
          selectedWetland.wetlandId,
      ) || null
    )
  }, [selectedWetland])


  // =========================================================
  // STUDY-AREA SUMMARY VALUES
  // =========================================================
  const totalCurrentArea = useMemo(() => {
    return wetlands.reduce(
      (sum, wetland) =>
        sum + wetland.currentArea,
      0,
    )
  }, [])


  const persistentLossCount =
    wetlands.filter(
      (wetland) =>
        wetland.condition ===
        'Persistent Loss',
    ).length


  const highConfidenceCandidates =
    candidateWetlands.filter(
      (candidate) =>
        candidate.confidence === 'High',
    ).length


  const highWaterloggingZones =
    waterloggingZones.filter(
      (zone) =>
        zone.susceptibility === 'High' ||
        zone.susceptibility ===
          'Very High',
    ).length


  // =========================================================
  // HISTORICAL CHANGE FOR SELECTED WETLAND
  // =========================================================
  const selectedHistoricalChange =
    useMemo(() => {
      if (selectedHistory.length < 2) {
        return null
      }

      const first =
        selectedHistory[0]

      const latest =
        selectedHistory[
          selectedHistory.length - 1
        ]

      const change =
        latest.area - first.area

      const percent =
        (change / first.area) * 100

      return {
        change,
        percent,
      }
    }, [selectedHistory])


  // =========================================================
  // DASHBOARD METRICS
  // =========================================================
  const dashboardMetrics =
    selectedWetland
      ? [
          {
            title: 'Selected Wetland',
            value:
              selectedWetland.wetlandId,
            subtitle:
              selectedWetland.name,
            icon: Map,
            tone: 'teal',
          },

          {
            title: 'Current Area',
            value:
              `${selectedWetland.currentArea.toFixed(1)} ha`,
            subtitle:
              `Mapped ${selectedWetland.currentYear}`,
            icon: Droplets,
            tone: 'blue',
          },

          {
            title: 'Current Patches',
            value:
              selectedWetland.patchCount,
            subtitle:
              `LPI ${selectedWetland.lpi}%`,
            icon: History,
            tone:
              selectedWetland.patchCount >= 4
                ? 'orange'
                : 'slate',
          },

          {
            title: 'Historical Change',
            value:
              selectedHistoricalChange
                ? `${selectedHistoricalChange.percent.toFixed(1)}%`
                : '—',
            subtitle:
              selectedHistoricalChange
                ? 'Earliest to latest mapped year'
                : 'Historical series not yet available',
            icon: TrendingDown,
            tone:
              selectedHistoricalChange &&
              selectedHistoricalChange.percent < 0
                ? 'orange'
                : 'slate',
          },

          {
            title: '2030 Projection',
            value:
              selectedFuture
                ? `${selectedFuture.projectedArea.toFixed(1)} ha`
                : '—',
            subtitle:
              selectedFuture
                ? `${selectedFuture.scenario} · ${selectedFuture.confidence} confidence`
                : 'Projection not yet available',
            icon: Radar,
            tone: 'purple',
          },
        ]
      : [
          {
            title: 'Known Wetlands',
            value: wetlands.length,
            subtitle:
              'Prototype reference inventory',
            icon: Map,
            tone: 'teal',
          },

          {
            title:
              'Current Mapped Area',
            value:
              `${totalCurrentArea.toFixed(1)} ha`,
            subtitle:
              'Across prototype wetlands',
            icon: Droplets,
            tone: 'blue',
          },

          {
            title:
              'Persistent Loss',
            value:
              persistentLossCount,
            subtitle:
              'Wetlands currently classified',
            icon: TrendingDown,
            tone: 'orange',
          },

          {
            title:
              'Candidate Wetlands',
            value:
              candidateWetlands.length,
            subtitle:
              `${highConfidenceCandidates} high-confidence candidates`,
            icon: Radar,
            tone: 'purple',
          },

          {
            title:
              'High Waterlogging Zones',
            value:
              highWaterloggingZones,
            subtitle:
              'High + Very High susceptibility',
            icon: AlertTriangle,
            tone: 'red',
          },
        ]


  // =========================================================
  // MAIN HISTORICAL CHART DATA
  // =========================================================
  const mainTrendData =
    selectedWetland
      ? selectedHistory.map(
          (item) => ({
            year: item.year,
            extent: item.area,
          }),
        )
      : wetlandExtentTrend


  // =========================================================
  // MAP SELECT
  // =========================================================
  const handleMapSelect = (wetland) => {
    setWetlandId(wetland.wetlandId)
  }


  // =========================================================
  // CONDITION BADGE
  // =========================================================
  const conditionVariant = (condition) => {
    if (
      condition === 'Persistent Loss'
    ) {
      return 'red'
    }

    if (condition === 'Fragmented') {
      return 'amber'
    }

    if (
      condition === 'Seasonally Variable'
    ) {
      return 'blue'
    }

    return 'green'
  }


  return (
    <div>
      {/* =====================================================
          HEADER + SELECTOR
      ===================================================== */}
      <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="eyebrow">
            Wetland Intelligence
          </div>

          <h1 className="mt-1 text-[24px] font-bold tracking-[-.03em] text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-500">
            Overview of historical wetland change,
            candidate wetland detection, future spatial
            projection and seasonal waterlogging
            susceptibility across Kaduwela.
          </p>
        </div>


        <div className="w-full xl:w-[340px]">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Dashboard Wetland

            <select
              className="control mt-1"
              value={wetlandId}
              onChange={(event) =>
                setWetlandId(
                  event.target.value,
                )
              }
            >
              <option value="All Wetlands">
                All Wetlands — Area Overview
              </option>

              {wetlands.map(
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
        </div>
      </div>


      {/* =====================================================
          CURRENT SCOPE
      ===================================================== */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <Map
          size={14}
          className="text-teal-700"
        />

        <span className="text-[10px] font-semibold text-slate-500">
          Dashboard scope:
        </span>

        <span className="text-[11px] font-bold text-slate-800">
          {selectedWetland
            ? `${selectedWetland.wetlandId} — ${selectedWetland.name}`
            : 'All mapped Kaduwela wetlands'}
        </span>

        {selectedWetland && (
          <>
            <Badge
              variant={conditionVariant(
                selectedWetland.condition,
              )}
            >
              {selectedWetland.condition}
            </Badge>

            <Badge
              variant={
                selectedWetland.confidence ===
                'High'
                  ? 'green'
                  : 'amber'
              }
            >
              {selectedWetland.confidence}{' '}
              confidence
            </Badge>
          </>
        )}
      </div>


      {/* =====================================================
          KPI CARDS
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardMetrics.map(
          (metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
              tone={metric.tone}
              compact
            />
          ),
        )}
      </div>


      {/* =====================================================
          MAP + HISTORICAL TREND
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
        <div className="card-pad">
          <div className="mb-4">
            <h2 className="section-title">
              {selectedWetland
                ? `${selectedWetland.wetlandId} Wetland Location`
                : 'Kaduwela Wetland Overview'}
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Prototype wetland locations and current
              condition classification.
            </p>
          </div>

          <WetlandMap
            selected={selectedWetland}
            onSelect={handleMapSelect}
            height={390}
          />

          <p className="mt-3 text-[10px] leading-4 text-slate-500">
            Click a wetland polygon to switch the
            dashboard to that wetland. The current map is
            schematic and will later be replaced by QGIS
            GeoJSON outputs.
          </p>
        </div>


        <div className="card-pad">
          <div className="mb-4">
            <h2 className="section-title">
              {selectedWetland
                ? 'Historical Wetland Area'
                : 'Total Wetland Extent Trend'}
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              {selectedWetland
                ? `${selectedWetland.wetlandId} mapped area across available historical observations.`
                : 'Prototype total mapped wetland extent across selected observation years.'}
            </p>
          </div>


          {mainTrendData.length > 0 ? (
            <div className="h-[330px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={mainTrendData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: -10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 5"
                  />

                  <XAxis
                    dataKey="year"
                  />

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
                    dataKey="extent"
                    stroke="#0F766E"
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
          ) : (
            <div className="grid h-[330px] place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
              <div>
                <History
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Historical observations not yet added
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  This prototype wetland currently has
                  inventory data only.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* =====================================================
          SECONDARY ANALYTICS
      ===================================================== */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* LAND TRANSITIONS */}
        <div className="card-pad">
          <h2 className="section-title">
            Wetland Loss Transitions
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Prototype distribution of land uses
            subsequently observed within mapped wetland
            loss areas.
          </p>

          <div className="mt-4 h-[260px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={wetlandTransitions}
                layout="vertical"
                margin={{
                  left: 10,
                  right: 10,
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
                  width={100}
                  tick={{
                    fontSize: 9,
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value}%`,
                    'Share',
                  ]}
                />

                <Bar
                  dataKey="percentage"
                  fill="#0F766E"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* CANDIDATES */}
        <div className="card-pad">
          <h2 className="section-title">
            Candidate Wetland Confidence
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Current prototype candidate-wetland
            confidence distribution.
          </p>

          <div className="mt-4 h-[240px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    candidateConfidenceDistribution
                  }
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {candidateConfidenceDistribution.map(
                    (entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={
                          [
                            '#0F766E',
                            '#F59E0B',
                            '#94A3B8',
                          ][index]
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {candidateConfidenceDistribution.map(
              (item) => (
                <div
                  key={item.name}
                  className="rounded-xl bg-slate-50 px-2 py-2"
                >
                  <p className="text-[10px] text-slate-500">
                    {item.name}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>


        {/* WATERLOGGING */}
        <div className="card-pad">
          <h2 className="section-title">
            Waterlogging Susceptibility
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Prototype distribution of susceptibility
            classes across current analysis zones.
          </p>

          <div className="mt-4 h-[240px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    waterloggingDistribution
                  }
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {waterloggingDistribution.map(
                    (entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={
                          [
                            '#22C55E',
                            '#EAB308',
                            '#F97316',
                            '#DC2626',
                          ][index]
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            {waterloggingDistribution.map(
              (item) => (
                <div
                  key={item.name}
                  className="rounded-xl bg-slate-50 px-3 py-2"
                >
                  <p className="text-[10px] text-slate-500">
                    {item.name}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {item.value} zones
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>


      {/* =====================================================
          SELECTED WETLAND DETAILS
      ===================================================== */}
      {selectedWetland && (
        <div className="mt-5 card-pad">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="eyebrow">
                Selected Wetland
              </div>

              <h2 className="mt-1 section-title">
                {selectedWetland.wetlandId} —{' '}
                {selectedWetland.name}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                {selectedWetland.zone} · Current mapped
                year {selectedWetland.currentYear}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={conditionVariant(
                  selectedWetland.condition,
                )}
              >
                {selectedWetland.condition}
              </Badge>

              <Badge
                variant={
                  selectedWetland.confidence ===
                    'High'
                    ? 'green'
                    : 'amber'
                }
              >
                {selectedWetland.confidence}{' '}
                confidence
              </Badge>
            </div>
          </div>


          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="soft-panel">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Current Area
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {selectedWetland.currentArea.toFixed(
                  1,
                )}{' '}
                ha
              </p>
            </div>


            <div className="soft-panel">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Patch Count
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {selectedWetland.patchCount}
              </p>
            </div>


            <div className="soft-panel">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Largest Patch Index
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {selectedWetland.lpi}%
              </p>
            </div>


            <div className="soft-panel">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                2030 Projected Area
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {selectedFuture
                  ? `${selectedFuture.projectedArea.toFixed(1)} ha`
                  : 'Not available'}
              </p>
            </div>
          </div>
        </div>
      )}


      {/* =====================================================
          PROTOTYPE NOTICE
      ===================================================== */}
      <div className="mt-5 data-note">
        <b>Prototype Demo —</b> all wetland areas,
        historical changes, candidate probabilities,
        future projections, model metrics and
        waterlogging values shown on this page are mock
        demonstration data. They must be replaced by
        validated research outputs during implementation.
      </div>
    </div>
  )
}