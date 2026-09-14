import { useMemo, useState } from 'react'

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
  Download,
  Info,
  MapPin,
  Play,
  Thermometer,
} from 'lucide-react'

import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import HeatGridMap from '../../components/maps/HeatGridMap'

import {
  forecastArea,
  forecastZone,
  forecastExplanation,
  heatZones,
  modelComparison,
  zoneHistory,
} from '../../data/heatData'

import { exportCSV } from '../../utils/exportUtils'
import { useApp } from '../../contexts/AppContext'


export default function Forecast() {
  const { showToast } = useApp()
  const [year, setYear] = useState(2033)
  const [zoneId, setZoneId] = useState('All Zones')
  const [model, setModel] = useState('XGBoost')
  const [forecastWhy, setForecastWhy] = useState(null)



  // =========================================================
  // SELECTED ZONE
  // =========================================================
  const selectedZone = useMemo(() => {
    if (zoneId === 'All Zones') {
      return null
    }

    return (
      heatZones.find(
        (zone) => zone.zoneId === zoneId,
      ) || null
    )
  }, [zoneId])


  // =========================================================
  // HISTORICAL + FORECAST SERIES
  //
  // All Zones:
  //   area-wide 2015–2035 timeline
  //
  // Specific Zone:
  //   selected-zone 2015–2035 timeline
  //
  // The target year does NOT truncate this chart.
  // =========================================================
  const forecastSeries = useMemo(() => {
  // =========================================================
  // ALL ZONES — AREA-WIDE SERIES
  // =========================================================
  if (!selectedZone) {
    return forecastArea
      .filter(
        (item) =>
          item.year <= year,
      )
      .map((item) => ({
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
      }))
  }


  // =========================================================
  // SELECTED ZONE — HISTORICAL 2015–2025
  // =========================================================
  const historical =
    zoneHistory(
      selectedZone,
    ).map((item) => ({
      year: item.year,

      historical: item.lst,

      // Connect historical and forecast
      // at 2025.
      forecast:
        item.year === 2025
          ? item.lst
          : null,
    }))


  // =========================================================
  // SELECTED ZONE — FORECAST ONLY TO TARGET YEAR
  // =========================================================
  const future = []

  for (
    let targetYear = 2026;
    targetYear <= year;
    targetYear += 1
  ) {
    const result =
      forecastZone(
        selectedZone,
        targetYear,
        model,
      )

    future.push({
      year: targetYear,
      historical: null,
      forecast:
        result.predicted,
    })
  }


  return [
    ...historical,
    ...future,
  ]
}, [
  selectedZone,
  model,
  year,
])


  // =========================================================
  // SELECTED-YEAR PREDICTION TABLE
  // =========================================================
  const rows = useMemo(() => {
    const source =
      zoneId === 'All Zones'
        ? heatZones
        : heatZones.filter(
            (zone) =>
              zone.zoneId === zoneId,
          )


    return source
      .slice()
      .sort(
        (a, b) =>
          forecastZone(
            b,
            year,
            model,
          ).predicted -
          forecastZone(
            a,
            year,
            model,
          ).predicted,
      )
      .slice(0, 25)
      .map((zone) => {
        const result = forecastZone(
          zone,
          year,
          model,
        )

        return {
          ...zone,
          ...result,
        }
      })
  }, [
    year,
    model,
    zoneId,
  ])


  // =========================================================
  // SELECTED-YEAR MAP SUMMARY
  //
  // Recalculates whenever:
  // - year changes
  // - model changes
  // =========================================================
  const mapSummary = useMemo(() => {
    const projected = heatZones.map(
      (zone) =>
        Number(
          forecastZone(
            zone,
            year,
            model,
          ).predicted,
        ),
    )


    const mean =
      projected.reduce(
        (sum, value) =>
          sum + value,
        0,
      ) / projected.length


    const maximum = Math.max(
      ...projected,
    )


    const currentMean =
      heatZones.reduce(
        (sum, zone) =>
          sum +
          Number(zone.lst2025),
        0,
      ) / heatZones.length


    const increase =
      mean - currentMean


    return {
      mean:
        mean.toFixed(1),

      maximum:
        maximum.toFixed(1),

      currentMean:
        currentMean.toFixed(1),

      increase:
        increase.toFixed(1),
    }
  }, [
    year,
    model,
  ])


  // =========================================================
  // SELECTED ZONE FORECAST SNAPSHOT
  // =========================================================
  const selectedZoneForecast =
    useMemo(() => {
      if (!selectedZone) {
        return null
      }

      return forecastZone(
        selectedZone,
        year,
        model,
      )
    }, [
      selectedZone,
      year,
      model,
    ])


  // =========================================================
  // NOTABLE FORECAST CHANGE
  // Finds the largest year-to-year projected LST change for the selected
  // zone. This is a prototype flag for panel demonstration, not a formal
  // anomaly detector.
  // =========================================================
  const notableChange = useMemo(() => {
    if (!selectedZone || year < 2026) return null
    let best = null
    let previous = selectedZone.lst2025
    for (let targetYear=2026; targetYear<=year; targetYear+=1) {
      const predicted = forecastZone(selectedZone,targetYear,model).predicted
      const change = Number((predicted-previous).toFixed(2))
      if (!best || Math.abs(change) > Math.abs(best.change)) {
        best={year:targetYear,compareYear:targetYear-1,predicted,previous,change}
      }
      previous=predicted
    }
    return best
  },[selectedZone,year,model])

  const explainForecast = (targetYear=year, compareYear=Math.max(2025,targetYear-1)) => {
    if (!selectedZone) {
      showToast('Select a grid zone first to explain a forecast prediction.')
      return
    }

    try {
      const explanation = forecastExplanation(
        selectedZone,
        targetYear,
        compareYear,
        model,
      )

      setForecastWhy(explanation)
    } catch (error) {
      console.error('Forecast explanation failed:', error)
      showToast('Could not open the prototype explanation. Please select the zone again.')
    }
  }

  // =========================================================
  // GENERATE FORECAST
  // =========================================================
  const handleGenerateForecast = () => {
    const scope =
      selectedZone
        ? `${selectedZone.zoneId} — ${selectedZone.areaName}`
        : 'all grid zones'

    showToast(
      `Generated ${year} demo forecast for ${scope} using ${model}.`,
    )
  }


  // =========================================================
  // MAP CELL CLICK
  // =========================================================
  const handleMapZoneSelect = (
    zone,
  ) => {
    setZoneId(zone.zoneId)

    showToast(
      `Selected ${zone.zoneId} — ${zone.areaName}.`,
    )
  }


  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="mb-5">
        <h1 className="text-[24px] font-bold">
          Forecast
        </h1>

        <p className="text-[11px] text-slate-500">
          ML projections of land surface
          temperature to 2035 · simulated
          research prototype
        </p>
      </div>


      {/* =====================================================
          FORECAST SETTINGS
      ===================================================== */}
      <div className="card-pad">
        <div className="mb-4">
          <h2 className="section-title">
            Forecast settings
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Select the target year, grid
            zone and demonstration model.
          </p>
        </div>


        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {/* TARGET YEAR */}
          <label className="text-[10px] font-semibold text-slate-500">
            TARGET YEAR

            <select
              className="control mt-1"
              value={year}
              onChange={(event) =>
                setYear(
                  Number(
                    event.target.value,
                  ),
                )
              }
            >
              {Array.from({length:10},(_,i)=>2026+i).map(
                (targetYear) => (
                  <option
                    key={targetYear}
                    value={targetYear}
                  >
                    {targetYear}
                  </option>
                ),
              )}
            </select>
          </label>


          {/* ZONE */}
          <label className="text-[10px] font-semibold text-slate-500">
            ZONE

            <select
              className="control mt-1"
              value={zoneId}
              onChange={(event) =>
                setZoneId(
                  event.target.value,
                )
              }
            >
              <option value="All Zones">
                All Zones
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


          {/* MODEL */}
          <label className="text-[10px] font-semibold text-slate-500">
            MODEL

            <select
              className="control mt-1"
              value={model}
              onChange={(event) =>
                setModel(
                  event.target.value,
                )
              }
            >
              {modelComparison.map(
                (item) => (
                  <option
                    key={item.model}
                    value={item.model}
                  >
                    {item.model}
                  </option>
                ),
              )}
            </select>
          </label>


          {/* GENERATE */}
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={
                handleGenerateForecast
              }
            >
              <Play size={15} />

              Generate Forecast
            </Button>
          </div>
        </div>


        {/* CURRENT FORECAST SCOPE */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <MapPin
            size={14}
            className="text-teal-700"
          />

          <span className="text-[10px] font-semibold text-slate-500">
            Forecast scope:
          </span>

          <span className="text-[11px] font-semibold text-slate-800">
            {selectedZone
              ? `${selectedZone.zoneId} — ${selectedZone.areaName}`
              : 'All Kaduwela grid zones'}
          </span>

          <span className="text-[10px] text-slate-400">
            · {year} · {model}
          </span>
        </div>
      </div>


      {/* =====================================================
          MODEL COMPARISON + TIMELINE CHART
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.45fr]">
        {/* MODEL COMPARISON */}
        <div className="card-pad">
          <h2 className="section-title">
            Model comparison
          </h2>

          <p className="text-[11px] text-slate-500">
            Held-out validation
            (2024–2025) · demo benchmark
            values
          </p>


          <div className="mt-4 space-y-3">
            {modelComparison.map(
              (item) => (
                <div
                  key={item.model}
                  className={`rounded-xl border p-3 ${
                    model === item.model
                      ? 'border-teal-300 bg-teal-50/40'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <b className="text-[12px]">
                      {item.model}
                    </b>

                    {item.best && (
                      <Badge variant="green">
                        Best Performance
                      </Badge>
                    )}
                  </div>


                  <div className="mt-2 flex flex-wrap gap-4 text-[10px] text-slate-500">
                    <span>
                      R² {item.r2}
                    </span>

                    <span>
                      RMSE {item.rmse}°C
                    </span>

                    <span>
                      MAE {item.mae}°C
                      {item.uncertainty
                        ? ' ± uncertainty'
                        : ''}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>


          <div className="mt-4 text-[10px] leading-4 text-slate-400">
            Models shown are proposal-demo
            benchmark values and are not
            final validated research
            results.
          </div>
        </div>


        {/* HISTORICAL + FORECAST */}
        <div className="card-pad">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
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
                projected 2026–{year}
                </p>
            </div>

            <Badge variant="red">
              Projected — not measured data
            </Badge>
          </div>


          <div className="mt-4 h-[310px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={forecastSeries}
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
                  contentStyle={{
                    borderRadius: 12,
                    border:
                      '1px solid #e2e8f0',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="historical"
                  name="Historical"
                  stroke="#2B6CB0"
                  strokeWidth={2.2}
                  dot={false}
                  connectNulls={false}
                />

                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast"
                  stroke="#E0472B"
                  strokeDasharray="6 5"
                  strokeWidth={2.2}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>


          <div className="data-note mt-4">
            The forecast line is shown only up to the selected target year.
            Projected values are simulated prototype outputs and are not
            measured future temperatures.
        </div>
        </div>
      </div>


      {selectedZone && notableChange && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Info size={16} className="text-amber-700" />
                <h2 className="section-title">Notable forecast change</h2>
              </div>
              <p className="mt-2 text-[11px] text-slate-600">
                Largest year-to-year projected change for <b>{selectedZone.zoneId}</b> up to {year}: <b>{notableChange.compareYear} → {notableChange.year}</b> · <b className={notableChange.change>=0?'text-[#E0472B]':'text-emerald-700'}>{notableChange.change>=0?'+':''}{notableChange.change}°C</b>.
              </p>
              <p className="mt-1 text-[10px] text-slate-500">Prototype flag only. The final research system should define and validate the threshold used to call a change unusual.</p>
            </div>
            <Button type="button" onClick={() => explainForecast(notableChange.year, notableChange.compareYear)}>
              Explain this change
            </Button>
          </div>
        </div>
      )}

      {/* =====================================================
          PROJECTED LST MAP
      ===================================================== */}
      <div className="mt-5 card-pad">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <Thermometer
                size={18}
                className="text-[#E0472B]"
              />

              <h2 className="section-title">
                Projected LST Map — {year}
              </h2>
            </div>

            <p className="mt-1 text-[11px] text-slate-500">
              Spatial visualization of
              simulated {model} land surface
              temperature projections for{' '}
              {year}.
            </p>
          </div>


          <Badge variant="red">
            Projected — not measured data
          </Badge>
        </div>


        {/* DISCLAIMER */}
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <Info
              size={17}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <div>
              <p className="text-[11px] font-semibold text-amber-900">
                Projected — not measured
                data
              </p>

              <p className="mt-1 text-[10px] leading-5 text-amber-700">
                Grid colours represent
                simulated prototype
                forecasts for {year}. They
                are not observed future
                temperatures or final
                validated model outputs.
              </p>
            </div>
          </div>
        </div>


        {/* =================================================
            SELECTED-YEAR SUMMARY
        ================================================= */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* TARGET YEAR */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[9px] font-semibold uppercase text-slate-400">
              Target Year
            </p>

            <p className="mt-1 text-[16px] font-bold text-slate-900">
              {year}
            </p>
          </div>


          {/* MODEL */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[9px] font-semibold uppercase text-slate-400">
              Model
            </p>

            <p className="mt-1 text-[16px] font-bold text-slate-900">
              {model}
            </p>
          </div>


          {/* AREA MEAN */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[9px] font-semibold uppercase text-slate-400">
              Projected Area Mean
            </p>

            <p className="mt-1 text-[16px] font-bold text-slate-900">
              {mapSummary.mean}°C
            </p>
          </div>


          {/* CHANGE VS 2025 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[9px] font-semibold uppercase text-slate-400">
              Change vs 2025 Mean
            </p>

            <p
              className={`mt-1 text-[16px] font-bold ${
                Number(
                  mapSummary.increase,
                ) > 0
                  ? 'text-[#E0472B]'
                  : 'text-emerald-600'
              }`}
            >
              {Number(
                mapSummary.increase,
              ) > 0
                ? '+'
                : ''}
              {mapSummary.increase}°C
            </p>
          </div>


          {/* MAXIMUM */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[9px] font-semibold uppercase text-slate-400">
              Highest Projected Cell
            </p>

            <p className="mt-1 text-[16px] font-bold text-[#E0472B]">
              {mapSummary.maximum}°C
            </p>
          </div>
        </div>


        {/* MAP */}
        <div className="mt-4">
          <HeatGridMap
            key={`forecast-${year}-${model}`}
            mode="forecast"
            height={520}
            forecastYear={year}
            forecastModel={model}
            selectedId={
              selectedZone?.zoneId
            }
            onSelect={
              handleMapZoneSelect
            }
          />
        </div>


        {/* LEGEND */}
        <div className="mt-4 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-4 text-[10px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#2B6CB0]" />
              Cool
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#4A99B8]" />
              Lower Heat
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
          </div>


          <p className="text-[10px] text-slate-500">
            Click any grid cell to switch
            the selected forecast zone.
          </p>
        </div>


        {/* =================================================
            SELECTED FORECAST ZONE
        ================================================= */}
        {selectedZone &&
          selectedZoneForecast && (
            <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-4">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-teal-700">
                    Selected Forecast Zone
                  </p>

                  <p className="mt-1 text-[13px] font-bold text-slate-900">
                    {selectedZone.zoneId} —{' '}
                    {
                      selectedZone.areaName
                    }
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {model} prototype
                    projection for {year}
                  </p>
                </div>


                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-teal-100 bg-white px-4 py-3">
                    <p className="text-[9px] text-slate-400">
                      2025 LST
                    </p>

                    <p className="mt-1 text-[16px] font-bold text-slate-800">
                      {
                        selectedZone.lst2025
                      }
                      °C
                    </p>
                  </div>


                  <div className="rounded-xl border border-red-100 bg-white px-4 py-3">
                    <p className="text-[9px] text-slate-400">
                      Projected {year}
                    </p>

                    <p className="mt-1 text-[16px] font-bold text-[#E0472B]">
                      {
                        selectedZoneForecast.predicted
                      }
                      °C
                    </p>
                  </div>


                  <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
                    <p className="text-[9px] text-slate-400">
                      Prediction Range
                    </p>

                    <p className="mt-1 text-[13px] font-bold text-slate-800">
                      {
                        selectedZoneForecast.low
                      }
                      {' – '}
                      {
                        selectedZoneForecast.high
                      }
                      °C
                    </p>
                  </div>
                </div>
                <Button type="button" variant="secondary" onClick={() => explainForecast(year, 2025)}>
                  Explain {year} prediction
                </Button>
              </div>
            </div>
          )}
      </div>


      {/* =====================================================
          ZONE PREDICTION TABLE
      ===================================================== */}
      <div className="mt-5 table-shell">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">
              Zone predictions — {year}
            </h2>

            <p className="text-[10px] text-slate-500">
              {model}
              {' · '}
              {selectedZone
                ? `${selectedZone.zoneId} — ${selectedZone.areaName}`
                : 'top 25 hottest demo zones'}
            </p>
          </div>


          <Button
            variant="secondary"
            onClick={() =>
              exportCSV(
                rows.map(
                  (row) => ({
                    zoneId:
                      row.zoneId,

                    area:
                      row.areaName,

                    targetYear:
                      year,

                    model,

                    currentLST:
                      row.lst2025,

                    predicted:
                      row.predicted,

                    range:
                      `${row.low}-${row.high}`,

                    confidence:
                      row.confidence,
                  }),
                ),

                `heat-forecast-${year}-${model
                  .toLowerCase()
                  .replaceAll(
                    ' ',
                    '-',
                  )}.csv`,
              )
            }
          >
            <Download size={14} />

            CSV
          </Button>
        </div>


        <div className="max-h-[430px] overflow-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Zone ID</th>

                <th>Area</th>

                <th>
                  Current 2025 LST
                </th>

                <th>
                  Predicted {year}
                </th>

                <th>
                  Prediction Range
                </th>

                <th>
                  Confidence
                </th>
              </tr>
            </thead>


            <tbody>
              {rows.map((row) => (
                <tr key={row.zoneId}>
                  <td className="font-semibold">
                    {row.zoneId}
                  </td>

                  <td>
                    {row.areaName}
                  </td>

                  <td>
                    {row.lst2025}°C
                  </td>

                  <td className="font-semibold text-[#E0472B]">
                    {row.predicted}°C
                  </td>

                  <td>
                    {row.low}
                    {' – '}
                    {row.high}°C
                  </td>

                  <td>
                    <Badge variant="amber">
                      {row.confidence}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedZone && forecastWhy && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Forecast explanation"
          onClick={() => setForecastWhy(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-teal-200 bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-teal-700">
                  Forecast explanation · prototype SHAP-style output
                </p>
                <h2 className="mt-1 text-[20px] font-bold text-slate-900">
                  Why did {selectedZone.zoneId} change in {forecastWhy.year}?
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Comparing {forecastWhy.compareYear} with {forecastWhy.year} using {forecastWhy.model} prototype forecast inputs. {forecastWhy.compareYear === 2025 ? 'This shows how the selected future prediction differs from the latest observed year.' : 'This shows what changed between consecutive forecast years.'}
                </p>
              </div>

              <Button type="button" variant="secondary" onClick={() => setForecastWhy(null)}>
                Close
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[9px] text-slate-400">{forecastWhy.compareYear} LST</p>
                <p className="mt-1 text-[18px] font-bold text-slate-900">
                  {forecastWhy.previousPred}°C
                </p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                <p className="text-[9px] text-slate-400">{forecastWhy.year} predicted LST</p>
                <p className="mt-1 text-[18px] font-bold text-[#E0472B]">
                  {forecastWhy.predicted}°C
                </p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-[9px] text-slate-400">Prediction change</p>
                <p className={`mt-1 text-[18px] font-bold ${forecastWhy.change >= 0 ? 'text-[#E0472B]' : 'text-emerald-700'}`}>
                  {forecastWhy.change >= 0 ? '+' : ''}{forecastWhy.change}°C
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-[13px] font-bold text-slate-900">What changed in the model inputs?</h3>
              <p className="mt-1 text-[10px] text-slate-500">
                The table compares the forecasted feature values and their prototype contribution changes.
              </p>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Factor</th>
                    <th>{forecastWhy.compareYear}</th>
                    <th>{forecastWhy.year}</th>
                    <th>Feature change</th>
                    <th>Model contribution change</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastWhy.factors.map((factor) => {
                    const delta = Number((factor.current - factor.previous).toFixed(3))
                    return (
                      <tr key={factor.feature}>
                        <td><b>{factor.name}</b></td>
                        <td>{factor.previous}</td>
                        <td>{factor.current}</td>
                        <td className={delta > 0 ? 'text-[#E0472B]' : delta < 0 ? 'text-emerald-700' : ''}>
                          {delta > 0 ? '↑ ' : delta < 0 ? '↓ ' : ''}{delta}
                        </td>
                        <td>
                          {factor.contribution > 0
                            ? '↑ stronger warming contribution'
                            : factor.contribution < 0
                              ? '↓ weaker warming contribution'
                              : 'little change'}{' '}
                          ({factor.contribution > 0 ? '+' : ''}{factor.contribution})
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-4 text-[10px] leading-5 text-slate-600">
              <b>How to explain this to the panel:</b> the forecast shows <b>what</b> the model predicts.
              This explanation compares the selected year with the previous year and shows which forecasted
              features changed and how their model contributions changed. It explains the <b>model prediction</b>,
              not a guaranteed real-world causal event.
            </div>
          </div>
        </div>
      )}

    </div>
  )
}