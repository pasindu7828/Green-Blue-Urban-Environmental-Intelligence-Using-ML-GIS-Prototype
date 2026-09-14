import { useMemo, useState } from 'react'

import {
  AlertTriangle,
  Bell,
  Grid3X3,
  Info,
  MapPin,
  Thermometer,
  TrendingUp,
} from 'lucide-react'

import {
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

import { useOutletContext } from 'react-router-dom'

import MetricCard from '../../components/shared/MetricCard'
import HeatGridMap from '../../components/maps/HeatGridMap'
import AreaSearchSuggestions from '../../components/shared/AreaSearchSuggestions'
import Badge from '../../components/ui/Badge'

import {
  forecastArea,
  forecastZone,
  heatSummary,
  heatZones,
  landCover,
  topPriorityZones,
  zoneHistory,
} from '../../data/heatData'


export default function Dashboard() {
  const {
    globalSearch,
    setGlobalSearch,
  } = useOutletContext()

  const [zoneId, setZoneId] =
    useState('All Zones')


  // =========================================================
  // SELECTED ZONE
  //
  // Priority:
  // 1. Area selected through global search
  // 2. Zone selected through dropdown / map
  // 3. Otherwise All Zones
  // =========================================================
  const selectedZone = useMemo(() => {
    if (globalSearch) {
      const areaMatch =
        heatZones.find(
          (zone) =>
            zone.areaName.toLowerCase() ===
            globalSearch.toLowerCase(),
        )

      if (areaMatch) {
        return areaMatch
      }
    }


    if (zoneId === 'All Zones') {
      return null
    }


    return (
      heatZones.find(
        (zone) =>
          zone.zoneId === zoneId,
      ) || null
    )
  }, [
    zoneId,
    globalSearch,
  ])


  // =========================================================
  // 2030 SELECTED-ZONE FORECAST
  // =========================================================
  const selected2030Forecast =
    useMemo(() => {
      if (!selectedZone) {
        return null
      }

      return forecastZone(
        selectedZone,
        2030,
        'XGBoost',
      )
    }, [selectedZone])


  const selected2030Change =
    useMemo(() => {
      if (
        !selectedZone ||
        !selected2030Forecast
      ) {
        return null
      }

      return Number(
        (
          selected2030Forecast.predicted -
          selectedZone.lst2025
        ).toFixed(1),
      )
    }, [
      selectedZone,
      selected2030Forecast,
    ])


  // =========================================================
  // HISTORICAL + FORECAST CHART
  //
  // All Zones:
  // area-wide 2015–2035
  //
  // Specific Zone:
  // selected-zone 2015–2035
  // =========================================================
  const forecastSeries =
    useMemo(() => {
      if (!selectedZone) {
        return forecastArea.map(
          (item) => ({
            year: item.year,

            historical:
              item.year <= 2025
                ? item.lst
                : null,

            forecast:
              item.year === 2025
                ? item.lst
                : item.forecast
                  ? item.lst
                  : null,
          }),
        )
      }


      const historical =
        zoneHistory(
          selectedZone,
        ).map((item) => ({
          year: item.year,

          historical:
            item.lst,

          // Connect forecast line
          // to historical line at 2025
          forecast:
            item.year === 2025
              ? item.lst
              : null,
        }))


      const future = []

      for (
        let year = 2026;
        year <= 2035;
        year += 1
      ) {
        const prediction =
          forecastZone(
            selectedZone,
            year,
            'XGBoost',
          )

        future.push({
          year,

          historical: null,

          forecast:
            prediction.predicted,
        })
      }


      return [
        ...historical,
        ...future,
      ]
    }, [selectedZone])


  // =========================================================
  // DROPDOWN SELECTION
  // =========================================================
  const handleZoneChange = (
    value,
  ) => {
    setGlobalSearch('')
    setZoneId(value)
  }


  // =========================================================
  // MAP CELL SELECTION
  // =========================================================
  const handleMapSelect = (
    zone,
  ) => {
    setGlobalSearch('')
    setZoneId(zone.zoneId)
  }


  // =========================================================
  // KPI CONTENT
  // =========================================================
  const dashboardMetrics =
    selectedZone
      ? [
          {
            title: 'Selected Zone',
            value:
              selectedZone.zoneId,
            subtitle:
              selectedZone.areaName,
            icon: Grid3X3,
            tone: 'slate',
          },

          {
            title: 'Cooling Priority',
            value:
              selectedZone.priority,
            subtitle:
              'Selected grid zone',
            icon: AlertTriangle,
            tone:
              selectedZone.priority ===
              'High'
                ? 'red'
                : selectedZone.priority ===
                    'Medium'
                  ? 'orange'
                  : 'slate',
          },

          {
            title: 'LST (2025)',
            value:
              `${selectedZone.lst2025}°C`,
            subtitle:
              'Selected zone',
            icon: Thermometer,
            tone: 'slate',
          },

          {
            title: 'Heat Trend',
            value:
              selectedZone.trend,
            subtitle:
              '2015–2025 classification',
            icon: TrendingUp,
            tone:
              selectedZone.trend ===
                'Persistent Hot' ||
              selectedZone.trend ===
                'Intensifying'
                ? 'orange'
                : 'slate',
          },

          {
            title:
              'Predicted 2030 Change',

            value:
              `${selected2030Change > 0 ? '+' : ''}${selected2030Change}°C`,

            subtitle:
              `${selected2030Forecast?.predicted}°C projected`,

            icon: Bell,

            tone:
              selected2030Change > 0
                ? 'red'
                : 'slate',
          },
        ]
      : [
          {
            title:
              'Total Grid Zones',

            value:
              heatSummary.totalZones,

            subtitle:
              '210m Cells',

            icon: Grid3X3,

            tone: 'slate',
          },

          {
            title:
              'High Priority Zones',

            value:
              heatSummary.highPriority,

            subtitle:
              'Cooling Priority',

            icon:
              AlertTriangle,

            tone: 'red',
          },

          {
            title:
              'Mean LST (2025)',

            value:
              `${heatSummary.meanLst}°C`,

            subtitle:
              'Study Area Average',

            icon:
              Thermometer,

            tone: 'slate',
          },

          {
            title:
              'Emerging Hot Zones',

            value:
              heatSummary.emerging,

            subtitle:
              'New Since 2022',

            icon:
              TrendingUp,

            tone: 'orange',
          },

          {
            title:
              'Predicted 2030 Increase',

            value:
              `+${heatSummary.predicted2030Increase}°C`,

            subtitle:
              'Area-wide Average',

            icon: Bell,

            tone: 'slate',
          },
        ]


  return (
    <div>
      {/* =====================================================
          GLOBAL AREA SEARCH
      ===================================================== */}
      <AreaSearchSuggestions
        query={globalSearch}
        onSelect={(area) => {
          setGlobalSearch(area)
          setZoneId('All Zones')
        }}
      />


      {/* =====================================================
          HEADER + ZONE SELECTOR
      ===================================================== */}
      <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-[24px] font-bold tracking-[-.03em] text-slate-900">
              Dashboard
            </h1>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Kaduwela Municipal Council —
              study area overview
            </p>
          </div>


          <div className="group relative ml-0 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[10px] font-semibold text-teal-700 md:ml-3">
            First ML-based urban heat
            forecasting and explainability
            system in Sri Lanka

            <Info
              size={12}
              className="ml-1 inline"
            />

            <div className="pointer-events-none absolute left-0 top-8 z-20 hidden w-[380px] rounded-xl bg-slate-900 p-3 text-[10px] font-normal leading-4 text-white shadow-xl group-hover:block">
              Prototype research framing:
              the proposed system integrates
              ML forecasting, explainability,
              and scenario simulation for
              urban heat planning. This is
              not a validated final research
              result.
            </div>
          </div>
        </div>


        {/* =================================================
            NEW — DASHBOARD ZONE SELECTOR
        ================================================= */}
        <div className="w-full xl:w-[330px]">
          <label className="text-[10px] font-semibold text-slate-500">
            DASHBOARD ZONE

            <select
              className="control mt-1"
              value={
                selectedZone
                  ? selectedZone.zoneId
                  : 'All Zones'
              }
              onChange={(event) =>
                handleZoneChange(
                  event.target.value,
                )
              }
            >
              <option value="All Zones">
                All Zones — Area Overview
              </option>

              {heatZones.map(
                (zone) => (
                  <option
                    key={zone.zoneId}
                    value={zone.zoneId}
                  >
                    {zone.zoneId} —{' '}
                    {zone.areaName}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
      </div>


      {/* =====================================================
          CURRENT DASHBOARD SCOPE
      ===================================================== */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <MapPin
          size={14}
          className="text-teal-700"
        />

        <span className="text-[10px] font-semibold text-slate-500">
          Dashboard scope:
        </span>

        <span className="text-[11px] font-bold text-slate-800">
          {selectedZone
            ? `${selectedZone.zoneId} — ${selectedZone.areaName}`
            : 'All Kaduwela grid zones'}
        </span>

        {selectedZone && (
          <>
            <Badge
              variant={
                selectedZone.priority ===
                'High'
                  ? 'red'
                  : selectedZone.priority ===
                      'Medium'
                    ? 'amber'
                    : 'green'
              }
            >
              {selectedZone.priority}{' '}
              Priority
            </Badge>

            <Badge
              variant={
                selectedZone.trend ===
                  'Persistent Hot' ||
                selectedZone.trend ===
                  'Intensifying'
                  ? 'red'
                  : selectedZone.trend ===
                      'Emerging'
                    ? 'amber'
                    : 'green'
              }
            >
              {selectedZone.trend}
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
              subtitle={
                metric.subtitle
              }
              icon={metric.icon}
              tone={metric.tone}
              compact
            />
          ),
        )}
      </div>


      {/* =====================================================
          MAP + PRIMARY FORECAST CHART
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.85fr]">
        {/* MAP */}
        <div className="card-pad">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <h2 className="section-title">
                {selectedZone
                  ? `${selectedZone.zoneId} Heat Grid Location`
                  : 'Kaduwela Heat Grid Map'}
              </h2>

              <p className="text-[11px] text-slate-500">
                Mean land surface
                temperature, 2025
                dry-season composite ·
                210 m prototype grid
              </p>
            </div>


            {selectedZone && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-teal-700">
                  Selected
                </p>

                <p className="mt-0.5 text-[11px] font-bold text-slate-800">
                  {selectedZone.zoneId}
                </p>
              </div>
            )}
          </div>


          <HeatGridMap
            height={390}
            highlightArea={
              globalSearch
            }
            selectedId={
              selectedZone?.zoneId
            }
            onSelect={
              handleMapSelect
            }
          />


          <div className="mt-3 text-[10px] text-slate-500">
            Click any grid cell to switch
            the dashboard to that zone.
          </div>
        </div>


        {/* PRIMARY CHART */}
        <div className="card-pad">
          <h2 className="section-title">
            {selectedZone
              ? `${selectedZone.zoneId} LST — Historical & Forecast`
              : 'Mean LST — Historical & Forecast'}
          </h2>

          <p className="text-[11px] text-slate-500">
            {selectedZone
              ? `${selectedZone.areaName} · `
              : 'Area-wide mean · '}
            Historical 2015–2025 ·
            Forecast 2026–2035
          </p>


          <div className="mt-4 h-[310px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={
                  forecastSeries
                }
              >
                <CartesianGrid />

                <XAxis
                  dataKey="year"
                />

                <YAxis
                  domain={[
                    'dataMin - 1',
                    'dataMax + 1',
                  ]}
                  unit="°C"
                />

                <Tooltip
                  formatter={(
                    value,
                    name,
                  ) => {
                    if (
                      value === null ||
                      value === undefined
                    ) {
                      return [
                        '—',
                        name,
                      ]
                    }

                    return [
                      `${Number(
                        value,
                      ).toFixed(2)}°C`,

                      name ===
                      'Historical'
                        ? 'Historical LST'
                        : 'Forecast LST',
                    ]
                  }}
                />

                <Line
                  dataKey="historical"
                  name="Historical"
                  stroke="#2B6CB0"
                  strokeWidth={2.2}
                  dot={false}
                  connectNulls={false}
                />

                <Line
                  dataKey="forecast"
                  name="Forecast"
                  stroke="#E0472B"
                  strokeWidth={2.2}
                  strokeDasharray="6 4"
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>


          <div className="mt-2 text-[10px] text-slate-400">
            Forecast values are simulated
            proposal outputs, not measured
            future data.
          </div>
        </div>
      </div>


      {/* =====================================================
          AREA-WIDE SUPPORTING INFORMATION
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr_.7fr]">
        {/* TOP PRIORITY */}
        <div className="card-pad">
          <h2 className="section-title">
            Top 5 Priority Zones
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Area-wide planning reference
          </p>


          <div className="mt-4 overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Zone ID</th>
                  <th>LST</th>
                  <th>Trend</th>
                  <th>Priority</th>
                </tr>
              </thead>

              <tbody>
                {topPriorityZones.map(
                  (zone, index) => (
                    <tr
                      key={
                        zone.zoneId
                      }
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td className="font-semibold">
                        {
                          zone.zoneId
                        }
                      </td>

                      <td>
                        {
                          zone.lst2025
                        }
                        °C
                      </td>

                      <td>
                        {zone.trend}
                      </td>

                      <td>
                        <Badge
                          variant={
                            zone.priority ===
                              'High'
                              ? 'red'
                              : 'amber'
                          }
                        >
                          {
                            zone.priority
                          }
                        </Badge>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* TREND ALERTS */}
        <div className="card-pad">
          <h2 className="section-title">
            Trend alerts
          </h2>

          <p className="mb-4 mt-1 text-[11px] text-slate-500">
            Zones requiring attention
          </p>


          <div className="space-y-3">
            {[
              [
                'KD-0847',
                'Intensifying — act now',
                'red',
              ],

              [
                'KD-0562',
                'Newly Emerging',
                'amber',
              ],

              [
                'KD-1203',
                'Persistent Hot — long-term plan needed',
                'red',
              ],

              [
                'KD-2011',
                'Diminishing — intervention working',
                'green',
              ],
            ].map(
              ([
                zone,
                text,
                variant,
              ]) => (
                <div
                  key={zone}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"
                >
                  <b className="text-[11px]">
                    {zone}
                  </b>

                  <Badge
                    variant={
                      variant
                    }
                  >
                    {text}
                  </Badge>
                </div>
              ),
            )}
          </div>
        </div>


        {/* LAND COVER */}
        <div className="card-pad">
          <h2 className="section-title">
            Land Cover Composition
          </h2>

          <p className="text-[10px] text-slate-400">
            Total area: 2194 zones
          </p>


          <div className="h-[180px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={landCover}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={66}
                >
                  {landCover.map(
                    (item) => (
                      <Cell
                        key={
                          item.name
                        }
                        fill={
                          item.color
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>


          <div className="space-y-2">
            {landCover.map(
              (item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{
                      background:
                        item.color,
                    }}
                  />

                  <span className="flex-1 text-slate-500">
                    {item.name}
                  </span>

                  <b>
                    {item.value}%
                  </b>
                </div>
              ),
            )}
          </div>
        </div>
      </div>


      {/* =====================================================
          LARGE HISTORICAL + FORECAST CHART
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="section-title">
              {selectedZone
                ? `${selectedZone.zoneId} LST, 2015–2035`
                : 'Area-wide mean LST, 2015–2035'}
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              {selectedZone
                ? `${selectedZone.areaName} · `
                : ''}
              Historical dry-season
              composites (2015–2025) with
              simulated forecast
              (2026–2035)
            </p>
          </div>


          <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-[3px] w-5 rounded-full bg-[#2B6CB0]" />

              Historical
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className="h-[3px] w-5 border-t-2 border-dashed"
                style={{
                  borderColor:
                    '#E0472B',
                }}
              />

              Forecast
            </div>
          </div>
        </div>


        <div className="mt-4 h-[300px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={forecastSeries}
              margin={{
                top: 10,
                right: 25,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="year"
                tick={{
                  fontSize: 10,
                  fill: '#64748b',
                }}
              />

              <YAxis
                domain={[
                  'dataMin - 1',
                  'dataMax + 1',
                ]}
                tick={{
                  fontSize: 10,
                  fill: '#64748b',
                }}
                tickFormatter={(
                  value,
                ) =>
                  `${value}°C`
                }
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border:
                    '1px solid #e2e8f0',

                  boxShadow:
                    '0 10px 25px rgba(15,23,42,0.08)',
                }}
                formatter={(
                  value,
                  name,
                ) => {
                  if (
                    value === null ||
                    value === undefined
                  ) {
                    return [
                      '—',
                      name,
                    ]
                  }

                  return [
                    `${Number(
                      value,
                    ).toFixed(2)}°C`,

                    name ===
                    'Historical'
                      ? 'Historical LST'
                      : 'Forecast LST',
                  ]
                }}
                labelFormatter={(
                  year,
                ) =>
                  `Year ${year}`
                }
              />

              <Line
                type="monotone"
                dataKey="historical"
                name="Historical"
                stroke="#2B6CB0"
                strokeWidth={2.5}
                dot={{
                  r: 2.5,
                  fill: '#2B6CB0',
                }}
                activeDot={{
                  r: 5,
                }}
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#E0472B"
                strokeWidth={2.5}
                strokeDasharray="7 5"
                dot={{
                  r: 2.5,
                  fill: '#E0472B',
                }}
                activeDot={{
                  r: 5,
                }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>


        <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-semibold text-amber-900">
              Forecast values are
              projected prototype outputs
            </p>

            <p className="mt-0.5 text-[10px] leading-4 text-amber-700">
              Values after 2025 are
              simulated proposal data and
              are not measured future
              temperatures.
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] font-semibold text-amber-700">
            Projected — not measured data
          </span>
        </div>
      </div>
    </div>
  )
}