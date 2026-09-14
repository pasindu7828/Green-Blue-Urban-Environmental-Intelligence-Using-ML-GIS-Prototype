import { useMemo, useState } from 'react'

import {
  useNavigate,
  useOutletContext,
} from 'react-router-dom'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Activity,
  Building2,
  Droplets,
  Leaf,
  MapPin,
  Navigation,
  Route,
  SlidersHorizontal,
  Thermometer,
  TrendingUp,
  Waves,
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import HeatGridMap from '../../components/maps/HeatGridMap'
import AreaSearchSuggestions from '../../components/shared/AreaSearchSuggestions'

import {
  forecastZone,
  heatZones,
  shapFeatures,
  zoneHistory,
} from '../../data/heatData'


const trendVariant = (trend) =>
  trend === 'Persistent Hot'
    ? 'red'
    : trend === 'Intensifying'
      ? 'orange'
      : trend === 'Emerging'
        ? 'amber'
        : trend === 'Diminishing'
          ? 'green'
          : 'blue'


const priorityVariant = (priority) =>
  priority === 'High'
    ? 'red'
    : priority === 'Medium'
      ? 'amber'
      : 'green'


function MetricBox({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'slate',
}) {
  const toneStyles = {
    slate:
      'bg-slate-50 text-slate-700 border-slate-200',

    red:
      'bg-red-50 text-red-700 border-red-200',

    blue:
      'bg-blue-50 text-blue-700 border-blue-200',

    green:
      'bg-emerald-50 text-emerald-700 border-emerald-200',

    amber:
      'bg-amber-50 text-amber-700 border-amber-200',

    teal:
      'bg-teal-50 text-teal-700 border-teal-200',
  }

  return (
    <div
      className={`rounded-2xl border p-4 ${toneStyles[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide opacity-70">
            {label}
          </p>

          <p className="mt-1 text-[20px] font-bold">
            {value}
          </p>

          {helper && (
            <p className="mt-1 text-[9px] leading-4 opacity-70">
              {helper}
            </p>
          )}
        </div>

        {Icon && (
          <Icon
            size={18}
            className="shrink-0 opacity-80"
          />
        )}
      </div>
    </div>
  )
}


function FeatureTile({
  label,
  value,
}) {
  return (
    <div className="soft-panel">
      <div className="text-[9px] uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-[12px] font-semibold text-slate-800">
        {value}
      </div>
    </div>
  )
}


export default function ZoneDetails() {
  const nav = useNavigate()

  const {
    globalSearch,
    setGlobalSearch,
  } = useOutletContext()

  const [zoneId, setZoneId] =
    useState('KD-0847')


  // =========================================================
  // SELECTED ZONE
  // Supports both:
  // 1. global area-name search
  // 2. direct zone selector / map click
  // =========================================================
  const zone = useMemo(() => {
    const areaMatch =
      globalSearch &&
      heatZones.find(
        (item) =>
          item.areaName.toLowerCase() ===
          globalSearch.toLowerCase(),
      )

    return (
      areaMatch ||
      heatZones.find(
        (item) =>
          item.zoneId === zoneId,
      ) ||
      heatZones[846]
    )
  }, [
    zoneId,
    globalSearch,
  ])


  // =========================================================
  // DRY / WET LST
  // Use real seasonal fields if they exist.
  // Otherwise create a clearly demo wet-season composite.
  // =========================================================
  const dryLst =
    zone.dryLst2025 ??
    zone.lst2025

  const wetLst =
    zone.wetLst2025 ??
    Number(
      (
        zone.lst2025 - 2.3
      ).toFixed(1),
    )


  // =========================================================
  // HISTORICAL SERIES
  // =========================================================
  const hist =
    zoneHistory(zone)


  // =========================================================
  // FORECAST SERIES
  // =========================================================
  const fc = Array.from(
    {
      length: 10,
    },
    (_, index) => {
      const year =
        2026 + index

      return {
        year,

        lst:
          forecastZone(
            zone,
            year,
            'XGBoost',
          ).predicted,
      }
    },
  )


  const forecast2030 =
    forecastZone(
      zone,
      2030,
      'XGBoost',
    )


  // =========================================================
  // ZONE SELECTOR
  // =========================================================
  const handleZoneChange = (
    value,
  ) => {
    setGlobalSearch('')
    setZoneId(value)
  }


  // =========================================================
  // MAP CLICK
  // =========================================================
  const handleMapSelect = (
    selectedZone,
  ) => {
    setGlobalSearch('')
    setZoneId(
      selectedZone.zoneId,
    )
  }


  return (
    <div>
      {/* =====================================================
          AREA SEARCH SUGGESTIONS
      ===================================================== */}
      <AreaSearchSuggestions
        query={globalSearch}
        onSelect={
          setGlobalSearch
        }
      />


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-[24px] font-bold">
              Zone Details
            </h1>

            <p className="text-[11px] text-slate-500">
              Detailed grid profile,
              environmental indicators,
              historical heat evidence,
              forecast and XAI explanation
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={trendVariant(
                zone.trend,
              )}
            >
              {zone.trend}
            </Badge>

            <Badge
              variant={priorityVariant(
                zone.priority,
              )}
            >
              {zone.priority} Priority
            </Badge>
          </div>
        </div>
      </div>


      {/* =====================================================
          STRONG ZONE SELECTOR
      ===================================================== */}
      <div className="card-pad">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <MapPin
                size={17}
                className="text-teal-700"
              />

              <h2 className="section-title">
                Zone Selector
              </h2>
            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              Select any Kaduwela demo grid
              cell or use the area-name
              search in the top header.
            </p>
          </div>


          <label className="block min-w-[320px] text-[10px] font-semibold text-slate-500">
            SELECT GRID ZONE

            <select
              className="control mt-1"
              value={zone.zoneId}
              onChange={(event) =>
                handleZoneChange(
                  event.target.value,
                )
              }
            >
              {heatZones.map(
                (item) => (
                  <option
                    key={item.zoneId}
                    value={
                      item.zoneId
                    }
                  >
                    {item.zoneId} —{' '}
                    {item.areaName}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>


        {/* SELECTED ZONE TAGS */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[10px] font-semibold text-teal-700">
            {zone.zoneId}
          </span>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] text-slate-600">
            {zone.areaName}
          </span>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] text-slate-600">
            {zone.lat.toFixed(4)},{' '}
            {zone.lng.toFixed(4)}
          </span>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] text-slate-600">
            LCZ {zone.lcz}
          </span>
        </div>
      </div>


      {/* =====================================================
          TOP SUMMARY CARDS
      ===================================================== */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricBox
          label="Dry Season LST"
          value={`${dryLst}°C`}
          helper="2025 demo dry-season composite"
          icon={Thermometer}
          tone="red"
        />

        <MetricBox
          label="Wet Season LST"
          value={`${wetLst}°C`}
          helper="Prototype wet-season composite"
          icon={Droplets}
          tone="blue"
        />

        <MetricBox
          label="2030 Forecast"
          value={`${forecast2030.predicted}°C`}
          helper="Projected — not measured"
          icon={TrendingUp}
          tone="amber"
        />

        <MetricBox
          label="NDVI"
          value={zone.ndvi}
          helper="Vegetation indicator"
          icon={Leaf}
          tone="green"
        />

        <MetricBox
          label="Built-up Density"
          value={`${zone.buildingDensity}/100`}
          helper="Demo urban-surface intensity"
          icon={Building2}
          tone="slate"
        />
      </div>


      {/* =====================================================
          LOCATION MAP + ZONE OVERVIEW
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        {/* LOCATION MAP */}
        <div className="card-pad">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <Navigation
                  size={17}
                  className="text-teal-700"
                />

                <h2 className="section-title">
                  Selected zone location
                </h2>
              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                Click another grid cell to
                switch the Zone Details
                profile.
              </p>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-teal-700">
                Selected
              </p>

              <p className="mt-0.5 text-[11px] font-bold text-slate-900">
                {zone.zoneId}
              </p>
            </div>
          </div>


          <div className="mt-4">
            <HeatGridMap
              mode="lst"
              height={470}
              selectedId={
                zone.zoneId
              }
              onSelect={
                handleMapSelect
              }
            />
          </div>


          <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#2B6CB0]" />
              Cool
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#D9A441]" />
              Moderate
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#EA7C2B]" />
              High
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#E0472B]" />
              Very High
            </div>

            <span className="ml-auto text-slate-400">
              2025 demo LST
            </span>
          </div>
        </div>


        {/* ZONE PROFILE */}
        <div className="card-pad">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Selected Grid Zone
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {zone.zoneId}
              </div>

              <div className="mt-1 text-[11px] text-slate-500">
                {zone.areaName}
              </div>
            </div>

            <Badge
              variant={priorityVariant(
                zone.priority,
              )}
            >
              {zone.priority}
            </Badge>
          </div>


          <div className="mt-5 space-y-3">
            <div className="soft-panel">
              <p className="text-[9px] text-slate-400">
                Coordinates
              </p>

              <p className="mt-1 text-[12px] font-semibold">
                {zone.lat.toFixed(4)},{' '}
                {zone.lng.toFixed(4)}
              </p>
            </div>

            <div className="soft-panel">
              <p className="text-[9px] text-slate-400">
                Trend classification
              </p>

              <div className="mt-2">
                <Badge
                  variant={trendVariant(
                    zone.trend,
                  )}
                >
                  {zone.trend}
                </Badge>
              </div>
            </div>

            <div className="soft-panel">
              <p className="text-[9px] text-slate-400">
                Cooling priority
              </p>

              <div className="mt-2">
                <Badge
                  variant={priorityVariant(
                    zone.priority,
                  )}
                >
                  {zone.priority} Priority
                </Badge>
              </div>
            </div>

            <div className="soft-panel">
              <p className="text-[9px] text-slate-400">
                LCZ classification
              </p>

              <p className="mt-1 text-[12px] font-semibold">
                {zone.lcz}
              </p>
            </div>

            <div className="soft-panel">
              <p className="text-[9px] text-slate-400">
                NightLights
              </p>

              <p className="mt-1 text-[12px] font-semibold">
                {zone.nightLights}
              </p>
            </div>
          </div>


          <Button
            className="mt-5 w-full"
            onClick={() =>
              nav('/heat/scenario')
            }
          >
            <SlidersHorizontal
              size={15}
            />

            Open scenario simulation
          </Button>
        </div>
      </div>


      {/* =====================================================
          ENVIRONMENTAL INDICES
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex items-center gap-2">
          <Leaf
            size={17}
            className="text-emerald-700"
          />

          <h2 className="section-title">
            Environmental indices
          </h2>
        </div>

        <p className="mt-1 text-[10px] text-slate-500">
          Spectral and environmental
          indicators associated with the
          selected grid zone.
        </p>


        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FeatureTile
            label="NDVI"
            value={zone.ndvi}
          />

          <FeatureTile
            label="NDBI"
            value={zone.ndbi}
          />

          <FeatureTile
            label="NDWI"
            value={zone.ndwi}
          />

          <FeatureTile
            label="EVI"
            value={zone.evi}
          />

          <FeatureTile
            label="Albedo"
            value={zone.albedo}
          />
        </div>
      </div>


      {/* =====================================================
          BUILT ENVIRONMENT / ACCESSIBILITY
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex items-center gap-2">
          <Route
            size={17}
            className="text-slate-700"
          />

          <h2 className="section-title">
            Built environment & proximity indicators
          </h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <FeatureTile
            label="Building Density"
            value={`${zone.buildingDensity}/100`}
          />

          <FeatureTile
            label="Road Density"
            value={`${zone.roadDensity}/100`}
          />

          <FeatureTile
            label="Distance to Water"
            value={`${zone.distanceToWater} m`}
          />

          <FeatureTile
            label="Distance to Any Road"
            value={`${zone.distanceToRoad} m`}
          />

          <FeatureTile
            label="Distance to Main Road"
            value={`${zone.distanceToMainRoad} m`}
          />

          <FeatureTile
            label="NightLights"
            value={zone.nightLights}
          />
        </div>
      </div>


      {/* =====================================================
          SHAP EXPLANATION
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex items-center gap-2">
          <Activity
            size={17}
            className="text-violet-700"
          />

          <h2 className="section-title">
            SHAP explanation
          </h2>
        </div>

        <p className="mt-1 text-[11px] text-slate-500">
          Main demo drivers for this
          zone&apos;s heat classification
        </p>


        <div className="mt-4 space-y-3">
          {shapFeatures.map(
            (feature) => (
              <div
                key={feature.name}
              >
                <div className="flex justify-between gap-3 text-[11px]">
                  <span>
                    {feature.name}
                  </span>

                  <b>
                    {feature.value}%
                  </b>
                </div>

                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:
                        `${feature.value}%`,

                      background:
                        feature.color,
                    }}
                  />
                </div>
              </div>
            ),
          )}
        </div>


        <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-[10px] leading-5 text-slate-600">
          Feature contributions shown are
          prototype explanation values used
          to demonstrate the proposed XAI
          interface. They are not final
          validated SHAP research results.
        </div>
      </div>


      {/* =====================================================
          HISTORICAL + FORECAST CHARTS
      ===================================================== */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* HISTORICAL */}
        <div className="card-pad">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Waves
                  size={17}
                  className="text-[#2B6CB0]"
                />

                <h2 className="section-title">
                  Historical LST
                </h2>
              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                {zone.zoneId} · 2015–2025
              </p>
            </div>

            <Badge variant="blue">
              Historical
            </Badge>
          </div>


          <div className="mt-4 h-[280px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={hist}
                margin={{
                  top: 10,
                  right: 20,
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
                  unit="°C"
                  tick={{
                    fontSize: 10,
                    fill: '#64748b',
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(
                      value,
                    ).toFixed(2)}°C`,
                    'Historical LST',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border:
                      '1px solid #e2e8f0',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="lst"
                  stroke="#2B6CB0"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: '#2B6CB0',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* FORECAST */}
        <div className="card-pad">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={17}
                  className="text-[#E0472B]"
                />

                <h2 className="section-title">
                  Forecast 2026–2035
                </h2>
              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                XGBoost demo projection
              </p>
            </div>

            <Badge variant="red">
              Projected — not measured
            </Badge>
          </div>


          <div className="mt-4 h-[280px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={fc}
                margin={{
                  top: 10,
                  right: 20,
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
                  unit="°C"
                  tick={{
                    fontSize: 10,
                    fill: '#64748b',
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(
                      value,
                    ).toFixed(2)}°C`,
                    'Projected LST',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border:
                      '1px solid #e2e8f0',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="lst"
                  stroke="#E0472B"
                  strokeDasharray="6 4"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: '#E0472B',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>


          <div className="mt-3 text-[10px] leading-4 text-slate-500">
            Forecast values are simulated
            prototype outputs and are not
            measured future temperatures.
          </div>
        </div>
      </div>
    </div>
  )
}