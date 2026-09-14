import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import {
  BASELINE_YEAR,
  DEFAULT_FORECAST_YEAR,
  FORECAST_END_YEAR,
  FORECAST_START_YEAR,
} from '../../utils/urbanForecast'

import {
  useUrbanForecast,
} from '../../contexts/UrbanForecastContext'

export default function ForecastYearSelector({
  compact = false,
}) {
  const {
    forecastYear,
    setForecastYear,
  } = useUrbanForecast()

  function previousYear() {
    if (
      forecastYear >
      FORECAST_START_YEAR
    ) {
      setForecastYear(
        forecastYear - 1,
      )
    }
  }

  function nextYear() {
    if (
      forecastYear <
      FORECAST_END_YEAR
    ) {
      setForecastYear(
        forecastYear + 1,
      )
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={previousYear}
          disabled={
            forecastYear ===
            FORECAST_START_YEAR
          }
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft
            size={15}
          />
        </button>

        <div className="min-w-[90px] text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Forecast
          </div>

          <div className="text-sm font-bold text-slate-900">
            {forecastYear}
          </div>
        </div>

        <button
          type="button"
          onClick={nextYear}
          disabled={
            forecastYear ===
            FORECAST_END_YEAR
          }
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight
            size={15}
          />
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* TITLE */}

        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-orange-700">
            <CalendarDays
              size={18}
            />
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">
              Forecast Year
            </div>

            <div className="mt-0.5 text-xs text-slate-500">
              Baseline {BASELINE_YEAR} ·
              Select any year from{' '}
              {FORECAST_START_YEAR} to{' '}
              {FORECAST_END_YEAR}
            </div>
          </div>
        </div>

        {/* SELECTED YEAR */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousYear}
            disabled={
              forecastYear ===
              FORECAST_START_YEAR
            }
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft
              size={17}
            />
          </button>

          <div className="min-w-[110px] rounded-xl bg-[#0F2E28] px-5 py-2 text-center text-white">
            <div className="text-[9px] font-bold uppercase tracking-wide text-emerald-200">
              Selected
            </div>

            <div className="text-xl font-bold">
              {forecastYear}
            </div>
          </div>

          <button
            type="button"
            onClick={nextYear}
            disabled={
              forecastYear ===
              FORECAST_END_YEAR
            }
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight
              size={17}
            />
          </button>
        </div>
      </div>

      {/* RANGE */}

      <div className="mt-5">
        <input
          type="range"
          min={
            FORECAST_START_YEAR
          }
          max={
            FORECAST_END_YEAR
          }
          step="1"
          value={forecastYear}
          onChange={(event) =>
            setForecastYear(
              Number(
                event.target.value,
              ),
            )
          }
          className="w-full cursor-pointer accent-emerald-700"
        />

        <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
          <span>
            {FORECAST_START_YEAR}
          </span>

          <span>
            {DEFAULT_FORECAST_YEAR}
          </span>

          <span>
            {FORECAST_END_YEAR}
          </span>
        </div>
      </div>

      {/* QUICK BUTTONS */}

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          2026,
          2028,
          2030,
          2032,
          2035,
        ].map((year) => (
          <button
            key={year}
            type="button"
            onClick={() =>
              setForecastYear(
                year,
              )
            }
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              forecastYear ===
              year
                ? 'border-emerald-700 bg-emerald-700 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  )
}