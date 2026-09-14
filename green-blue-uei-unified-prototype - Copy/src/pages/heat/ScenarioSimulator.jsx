import { useMemo, useState } from 'react'

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
  Info,
  MapPin,
  MousePointer2,
  Play,
  RotateCcw,
  Thermometer,
} from 'lucide-react'

import Slider from '../../components/ui/Slider'
import Button from '../../components/ui/Button'
import HeatGridMap from '../../components/maps/HeatGridMap'

import { heatZones, scenarioPrototype } from '../../data/heatData'
import { useApp } from '../../contexts/AppContext'


export default function ScenarioSimulator() {
  const { showToast } = useApp()

  const [zoneId, setZoneId] =
    useState('KD-0065')

  const [green, setGreen] =
    useState(20)

  const [built, setBuilt] =
    useState(0)

  const [log, setLog] =
    useState([])


  // =========================================================
  // SELECTED ZONE
  // =========================================================
  const zone = useMemo(() => {
    return (
      heatZones.find(
        (item) =>
          item.zoneId === zoneId,
      ) || heatZones[64]
    )
  }, [zoneId])


  // =========================================================
  // SCENARIO CALCULATION
  // Prototype-only direct feature perturbation. Final system
  // will call the validated trained NGBoost scenario model.
  // =========================================================
  const current = zone.lst2025
  const scenario = scenarioPrototype(zone,{greenPP:green,builtPP:built})
  const simulated = scenario.predicted
  const change = scenario.change
  const uncertainty = scenario.uncertainty
  const interval = `${scenario.low}–${scenario.high}°C`


  const chart = [
    {
      name: 'Current predicted LST',
      value: current,
    },
    {
      name: 'Simulated LST',
      value: simulated,
    },
  ]


  // =========================================================
  // RUN SIMULATION
  // =========================================================
  const run = () => {
    setLog((currentLog) => [
      {
        zone: zone.zoneId,

        area: zone.areaName,

        change:
          `Green ${
            green > 0 ? '+' : ''
          }${green} pp · ` +
          `Built ${
            built > 0 ? '+' : ''
          }${built} pp`,

        result:
          `${simulated}°C · demo interval ${interval}`,

        timestamp:
          new Date().toLocaleTimeString(),
      },

      ...currentLog,
    ])

    showToast(
      `Scenario simulation for ${zone.zoneId} added to session log.`,
    )
  }


  // =========================================================
  // MAP CELL CLICK
  // =========================================================
  const handleMapZoneSelect = (
    selectedZone,
  ) => {
    setZoneId(
      selectedZone.zoneId,
    )

    showToast(
      `Scenario target changed to ${selectedZone.zoneId} — ${selectedZone.areaName}.`,
    )
  }


  // =========================================================
  // RESET
  // =========================================================
  const resetScenario = () => {
    setGreen(0)
    setBuilt(0)

    showToast(
      'Scenario intervention values reset.',
    )
  }


  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="mb-5">
        <h1 className="text-[24px] font-bold">
          Scenario Simulator
        </h1>

        <p className="text-[11px] text-slate-500">
          Test cooling interventions before
          committing budget · simulated
          sensitivity tool
        </p>
      </div>


      {/* =====================================================
          INTERVENTION SETTINGS + LOCATION MAP
      ===================================================== */}
      <div className="grid gap-5 xl:grid-cols-[.72fr_1.5fr]">
        {/* =================================================
            LEFT — SETTINGS
        ================================================= */}
        <div className="card-pad">
          <h2 className="section-title">
            Intervention settings
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            Choose a target grid zone and
            change the proposed vegetation
            or built-up conditions.
          </p>


          {/* TARGET ZONE */}
          <label className="mt-4 block text-[10px] font-semibold text-slate-500">
            TARGET ZONE

            <select
              className="control mt-1"
              value={zoneId}
              onChange={(event) =>
                setZoneId(
                  event.target.value,
                )
              }
            >
              {heatZones.map(
                (item) => (
                  <option
                    key={item.zoneId}
                    value={item.zoneId}
                  >
                    {item.zoneId} —{' '}
                    {item.areaName}
                  </option>
                ),
              )}
            </select>
          </label>


          {/* SELECTED ZONE SUMMARY */}
          <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
            <div className="flex items-start gap-3">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-teal-700"
              />

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-teal-700">
                  Current Target Zone
                </p>

                <p className="mt-1 text-[12px] font-bold text-slate-900">
                  {zone.zoneId}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  {zone.areaName}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-white/70 px-3 py-2">
              <span className="text-[10px] text-slate-500">
                Baseline 2025 LST
              </span>

              <span className="text-[14px] font-bold text-[#E0472B]">
                {current}°C
              </span>
            </div>
          </div>


          {/* SLIDERS */}
          <div className="mt-6 space-y-6">
            <Slider
              label="Green cover change"
              value={green}
              onChange={setGreen}
              min={-20}
              max={30}
              suffix=" pp"
              helper="-20 to +30 percentage points"
            />

            <Slider
              label="Built-up density change"
              value={built}
              onChange={setBuilt}
              min={-20}
              max={30}
              suffix=" pp"
              helper="-20 to +30 percentage points"
            />
          </div>


          {/* BUTTONS */}
          <div className="mt-6 flex gap-2">
            <Button
              className="flex-1"
              onClick={run}
            >
              <Play size={15} />

              Run simulation
            </Button>

            <Button
              variant="secondary"
              onClick={resetScenario}
              title="Reset intervention values"
            >
              <RotateCcw size={15} />
            </Button>
          </div>


          {/* PROTOTYPE NOTE */}
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <Info
                size={14}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="text-[10px] leading-5 text-amber-800">
                This screen demonstrates direct feature perturbation on a real grid cell. Values are prototype sensitivity estimates only. Final outputs will come from the validated NGBoost model with a calibrated predictive distribution; they are not guaranteed causal or physical cooling outcomes.
              </p>
            </div>
          </div>
        </div>


        {/* =================================================
            RIGHT — TARGET ZONE LOCATION MAP
        ================================================= */}
        <div className="card-pad">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <MapPin
                  size={17}
                  className="text-teal-700"
                />

                <h2 className="section-title">
                  Target zone location
                </h2>
              </div>

              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                Click any grid cell to
                switch the target zone for
                scenario simulation.
              </p>
            </div>


            <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-teal-700">
                Selected
              </p>

              <p className="mt-0.5 text-[11px] font-bold text-slate-800">
                {zone.zoneId}
              </p>
            </div>
          </div>


          {/* CLICK INSTRUCTION */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <MousePointer2
              size={14}
              className="text-teal-700"
            />

            <p className="text-[10px] text-slate-500">
              Map selection and target-zone
              dropdown are synchronized.
            </p>
          </div>


          {/* MAP */}
          <div className="mt-4">
            <HeatGridMap
              mode="lst"
              height={470}
              selectedId={
                zone.zoneId
              }
              onSelect={
                handleMapZoneSelect
              }
            />
          </div>


          {/* MAP LEGEND */}
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

            <div className="ml-auto text-slate-400">
              2025 demo LST
            </div>
          </div>
        </div>
      </div>


      {/* =====================================================
          PREDICTED IMPACT
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <Thermometer
                size={17}
                className="text-[#E0472B]"
              />

              <h2 className="section-title">
                Predicted impact
              </h2>
            </div>

            <p className="mt-1 text-[10px] text-slate-400">
              {zone.zoneId} —{' '}
              {zone.areaName}
            </p>
          </div>


          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] text-slate-500">
            Prototype placeholder · final: NGBoost predictive output
          </span>
        </div>


        {/* KPI CARDS */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="soft-panel">
            <div className="text-[10px] text-slate-400">
              Current LST
            </div>

            <div className="mt-1 text-xl font-bold">
              {current}°C
            </div>

            <div className="mt-1 text-[9px] text-slate-400">
              Demo 2025 baseline
            </div>
          </div>


          <div className="soft-panel">
            <div className="text-[10px] text-slate-400">
              Simulated LST
            </div>

            <div
              className={`mt-1 text-xl font-bold ${
                simulated < current
                  ? 'text-emerald-600'
                  : simulated > current
                    ? 'text-red-600'
                    : 'text-slate-800'
              }`}
            >
              {simulated}°C
            </div>

            <div className="mt-1 text-[9px] text-slate-400">
              Based on percentage-point perturbations
            </div>
          </div>


          <div className="soft-panel">
            <div className="text-[10px] text-slate-400">
              Change + predictive interval concept
            </div>

            <div
              className={`mt-1 text-xl font-bold ${
                change < 0
                  ? 'text-emerald-600'
                  : change > 0
                    ? 'text-red-600'
                    : 'text-slate-800'
              }`}
            >
              {change > 0
                ? '+'
                : ''}
              {change}°C
            </div>

            <div className="mt-1 text-[9px] text-slate-400">
              Demo interval: {interval} · not calibrated
            </div>
          </div>
        </div>


        {/* BAR CHART */}
        <div className="mt-5 h-[270px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chart}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 10,
                  fill: '#64748b',
                }}
              />

              <YAxis
                domain={[
                  Math.min(
                    simulated,
                    current,
                  ) - 3,

                  Math.max(
                    simulated,
                    current,
                  ) + 2,
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
                  ).toFixed(1)}°C`,
                  'LST',
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border:
                    '1px solid #e2e8f0',
                }}
              />

              <Bar
                dataKey="value"
                fill="#E0472B"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* DISCLAIMER */}
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] leading-5 text-slate-500">
          Results represent modeled statistical
          sensitivity based on historical
          relationships in Kaduwela&apos;s demo
          data. Actual outcomes depend on
          implementation factors such as
          species, placement, design,
          maintenance and surrounding urban
          conditions.
        </div>
      </div>


      {/* =====================================================
          SCENARIO LOG
      ===================================================== */}
      <div className="mt-5 table-shell">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="section-title">
            Scenario log
          </h2>

          <p className="text-[10px] text-slate-400">
            Simulations run in this session
          </p>
        </div>


        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Zone</th>

                <th>Area</th>

                <th>
                  Change Applied
                </th>

                <th>
                  Predicted Result
                </th>

                <th>Timestamp</th>
              </tr>
            </thead>


            <tbody>
              {log.length ? (
                log.map(
                  (record, index) => (
                    <tr
                      key={`${record.zone}-${record.timestamp}-${index}`}
                    >
                      <td className="font-semibold">
                        {record.zone}
                      </td>

                      <td>
                        {record.area}
                      </td>

                      <td>
                        {record.change}
                      </td>

                      <td>
                        {record.result}
                      </td>

                      <td>
                        {record.timestamp}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-slate-400"
                  >
                    No scenarios run yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}