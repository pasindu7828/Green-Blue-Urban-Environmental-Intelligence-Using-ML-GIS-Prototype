// ============================================================
// URBAN MULTI-YEAR FORECAST UTILITIES
//
// Historical period: 2015–2025
// Baseline: 2025
// Forecast horizon: 2026–2035
// Default displayed year: 2030
//
// IMPORTANT:
// These functions generate deterministic PROTOTYPE forecasts.
// The final research system should replace these prototype
// trajectories with outputs from the validated ML model.
// ============================================================

// ============================================================
// YEARS
// ============================================================

export const BASELINE_YEAR = 2025

export const FORECAST_START_YEAR = 2026

export const FORECAST_END_YEAR = 2035

export const DEFAULT_FORECAST_YEAR = 2030

export const FORECAST_YEARS = Array.from(
  {
    length:
      FORECAST_END_YEAR -
      FORECAST_START_YEAR +
      1,
  },
  (_, index) =>
    FORECAST_START_YEAR +
    index,
)

// ============================================================
// BASIC HELPERS
// ============================================================

function clamp(
  value,
  minimum,
  maximum,
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  )
}

function clamp01(value) {
  return clamp(
    value,
    0,
    1,
  )
}

function safeNumber(
  value,
  fallback = 0,
) {
  const number =
    Number(value)

  return Number.isFinite(
    number,
  )
    ? number
    : fallback
}

function sigmoid(value) {
  return (
    1 /
    (1 +
      Math.exp(-value))
  )
}

function logit(
  probability,
) {
  const safeProbability =
    clamp(
      probability,
      0.02,
      0.98,
    )

  return Math.log(
    safeProbability /
      (1 -
        safeProbability),
  )
}

// ============================================================
// ANNUAL URBANIZATION TREND
// ============================================================
//
// The existing cell.pressureProbability is treated as the
// prototype 2030 anchor.
//
// The selected year moves backward or forward from 2030 using
// a spatially varying growth rate.
//
// This produces:
// - lower pressure in earlier forecast years
// - stronger pressure toward 2035
// - different trajectories between grid cells
//
// The annual increase is intentionally moderate so the whole
// study area does not become Very High too quickly.
// ============================================================

function getAnnualTrendSignal(
  cell,
) {
  const roadAccess =
    safeNumber(
      cell.roadAccess,
    ) / 100

  const nearbyBuilt =
    safeNumber(
      cell.nearbyBuilt2025,
    ) / 100

  const previousGrowth =
    safeNumber(
      cell.previousGrowth,
    ) / 100

  const buildingDensity =
    safeNumber(
      cell.buildingDensity,
    ) / 100

  const greenLoss =
    safeNumber(
      cell.greenLoss,
    ) / 100

  const builtGrowth =
    safeNumber(
      cell.builtGrowth,
    ) / 100

  const spatialSignal =
    roadAccess * 0.22 +
    nearbyBuilt * 0.24 +
    previousGrowth * 0.2 +
    buildingDensity * 0.14 +
    greenLoss * 0.1 +
    builtGrowth * 0.1

  // Recalibrated for a growing urban area,
  // while avoiding unrealistically rapid saturation.
  return (
    0.07 +
    clamp01(
      spatialSignal,
    ) *
      0.11
  )
}

// ============================================================
// FORECAST PROBABILITY
// ============================================================

export function getForecastProbability(
  cell,
  year = DEFAULT_FORECAST_YEAR,
) {
  const safeYear =
    clamp(
      Number(year),
      FORECAST_START_YEAR,
      FORECAST_END_YEAR,
    )

  const probability2030 =
    clamp01(
      safeNumber(
        cell.pressureProbability,
        safeNumber(
          cell.pressureScore,
          50,
        ) / 100,
      ),
    )

  // Preserve the generated 2030 anchor.
  if (
    safeYear ===
    DEFAULT_FORECAST_YEAR
  ) {
    return Number(
      probability2030.toFixed(
        3,
      ),
    )
  }

  const annualTrend =
    getAnnualTrendSignal(
      cell,
    )

  const yearDifference =
    safeYear -
    DEFAULT_FORECAST_YEAR

  const futureLogit =
    logit(
      probability2030,
    ) +
    yearDifference *
      annualTrend

  const probability =
    sigmoid(
      futureLogit,
    )

  return Number(
    clamp01(
      probability,
    ).toFixed(3),
  )
}

// ============================================================
// PRESSURE SCORE
// ============================================================

export function getForecastPressureScore(
  cell,
  year = DEFAULT_FORECAST_YEAR,
) {
  return Math.round(
    getForecastProbability(
      cell,
      year,
    ) * 100,
  )
}

// ============================================================
// PRESSURE CLASS
// ============================================================

export function getForecastPressureClass(
  cell,
  year = DEFAULT_FORECAST_YEAR,
) {
  const probability =
    getForecastProbability(
      cell,
      year,
    )

  if (
    probability >= 0.8
  ) {
    return 'Very High'
  }

  if (
    probability >= 0.6
  ) {
    return 'High'
  }

  if (
    probability >= 0.4
  ) {
    return 'Medium'
  }

  return 'Low'
}

// ============================================================
// FORECAST SERIES
// ============================================================

export function getForecastSeries(
  cell,
) {
  return FORECAST_YEARS.map(
    (year) => ({
      year,

      probability:
        getForecastProbability(
          cell,
          year,
        ),

      probabilityPercent:
        getForecastPressureScore(
          cell,
          year,
        ),

      pressureClass:
        getForecastPressureClass(
          cell,
          year,
        ),
    }),
  )
}

// ============================================================
// CHANGE FROM 2026
// ============================================================

export function getForecastChange(
  cell,
  year,
) {
  const selected =
    getForecastPressureScore(
      cell,
      year,
    )

  const start =
    getForecastPressureScore(
      cell,
      FORECAST_START_YEAR,
    )

  return (
    selected - start
  )
}

// ============================================================
// HISTORICAL DEVELOPMENT THREAT
// ============================================================
//
// Historical green loss is also important for conservation.
//
// Example:
// A green area that already experienced substantial loss
// should not be considered "safe" simply because its earliest
// forecast-year pressure is still moderate.
// ============================================================

function getHistoricalThreatScore(
  cell,
) {
  const greenLoss =
    safeNumber(
      cell.greenLoss,
    )

  const greenToBuilt =
    safeNumber(
      cell.greenToBuilt,
    )

  const builtGrowth =
    safeNumber(
      cell.builtGrowth,
    )

  return Math.round(
    clamp(
      greenLoss * 2.5 +
        greenToBuilt *
          1.6 +
        builtGrowth *
          0.8,
      0,
      100,
    ),
  )
}

// ============================================================
// FORECAST-INFORMED CONSERVATION SCORE
// ============================================================
//
// Conservation is NOT based only on future pressure.
//
// It combines:
//
// 1. Green value
// 2. Future urbanization pressure
// 3. Historical development threat
// 4. Interaction between green value and pressure
//
// This prevents low-green urban locations from automatically
// becoming "critical conservation" simply because pressure is
// high.
// ============================================================

export function getForecastConservationScore(
  cell,
  year = DEFAULT_FORECAST_YEAR,
) {
  const greenValue =
    safeNumber(
      cell.greenValue,
      50,
    )

  const pressure =
    getForecastPressureScore(
      cell,
      year,
    )

  const historicalThreat =
    getHistoricalThreatScore(
      cell,
    )

  const interaction =
    (greenValue / 100) *
    (pressure / 100)

  const score =
    greenValue * 0.55 +
    pressure * 0.35 +
    historicalThreat *
      0.1 +
    interaction * 6

  return Math.round(
    clamp(
      score,
      0,
      100,
    ),
  )
}

// ============================================================
// CONSERVATION CLASS
// ============================================================
//
// Important safeguard:
//
// A cell needs meaningful green value before it can become
// High or Critical conservation priority.
//
// This prevents highly urbanized / low-green cells from being
// classified as conservation hotspots only because they have
// high development pressure.
// ============================================================

export function getForecastConservationClass(
  cell,
  year = DEFAULT_FORECAST_YEAR,
) {
  const score =
    getForecastConservationScore(
      cell,
      year,
    )

  const pressure =
    getForecastPressureScore(
      cell,
      year,
    )

  const greenValue =
    safeNumber(
      cell.greenValue,
      50,
    )

  if (
    score >= 78 &&
    greenValue >= 58
  ) {
    return 'Critical'
  }

  if (
    score >= 61 &&
    greenValue >= 50
  ) {
    return 'High'
  }

  if (
    greenValue >= 66 &&
    pressure < 45
  ) {
    return 'Stable Green'
  }

  if (
    score >= 44
  ) {
    return 'Monitoring'
  }

  return 'Lower Current Threat'
}

// ============================================================
// FORECAST–PLANNING CONFLICT
// ============================================================
//
// IMPORTANT:
//
// Pressure and suitability remain separate.
//
// High pressure does NOT automatically mean conflict.
//
// Conflict becomes important when pressure is strong AND:
//
// - suitability is lower, OR
// - important green areas are threatened.
// ============================================================

export function getForecastConflictClass(
  cell,
  year = DEFAULT_FORECAST_YEAR,
) {
  const pressure =
    getForecastPressureScore(
      cell,
      year,
    )

  const suitability =
    safeNumber(
      cell.suitabilityScore,
      50,
    )

  const conservation =
    getForecastConservationClass(
      cell,
      year,
    )

  const importantGreen =
    conservation ===
      'Critical' ||
    conservation ===
      'High'

  // ----------------------------------------------------------
  // STRONGEST CONFLICT
  // ----------------------------------------------------------

  if (
    pressure >= 70 &&
    (
      suitability < 60 ||
      importantGreen
    )
  ) {
    return 'Critical Forecast–Planning Conflict'
  }

  // ----------------------------------------------------------
  // DEVELOPMENT CAUTION
  // ----------------------------------------------------------

  if (
    pressure >= 55 &&
    (
      suitability < 66 ||
      importantGreen
    )
  ) {
    return 'Development Caution'
  }

  // ----------------------------------------------------------
  // MANAGED GROWTH
  // ----------------------------------------------------------

  if (
    pressure >= 60 &&
    suitability >= 68 &&
    !importantGreen
  ) {
    return 'Managed Growth Opportunity'
  }

  // ----------------------------------------------------------
  // GREEN AREA NEEDS ATTENTION
  // ----------------------------------------------------------

  if (
    importantGreen
  ) {
    return 'Conservation Priority'
  }

  // ----------------------------------------------------------
  // LOWER URGENCY
  // ----------------------------------------------------------

  return 'Monitoring / Low Urgency'
}

// ============================================================
// INTERVENTION PRIORITY
// ============================================================

export function getForecastInterventionPriority(
  cell,
  year = DEFAULT_FORECAST_YEAR,
) {
  const conflict =
    getForecastConflictClass(
      cell,
      year,
    )

  const conservation =
    getForecastConservationClass(
      cell,
      year,
    )

  // ----------------------------------------------------------
  // CRITICAL
  // ----------------------------------------------------------

  if (
    conflict ===
      'Critical Forecast–Planning Conflict' &&
    conservation ===
      'Critical'
  ) {
    return 'Critical'
  }

  // ----------------------------------------------------------
  // VERY HIGH
  // ----------------------------------------------------------

  if (
    conflict ===
    'Critical Forecast–Planning Conflict'
  ) {
    return 'Very High'
  }

  // ----------------------------------------------------------
  // HIGH
  // ----------------------------------------------------------

  if (
    conflict ===
      'Development Caution' ||
    conservation ===
      'Critical'
  ) {
    return 'High'
  }

  // ----------------------------------------------------------
  // MEDIUM
  // ----------------------------------------------------------

  if (
    conflict ===
    'Managed Growth Opportunity'
  ) {
    return 'Medium'
  }

  // ----------------------------------------------------------
  // MONITOR
  // ----------------------------------------------------------

  return 'Monitoring'
}

// ============================================================
// FULL FORECAST SNAPSHOT
// ============================================================

export function getForecastSnapshot(
  cell,
  year = DEFAULT_FORECAST_YEAR,
) {
  return {
    year,

    probability:
      getForecastProbability(
        cell,
        year,
      ),

    pressureScore:
      getForecastPressureScore(
        cell,
        year,
      ),

    pressureClass:
      getForecastPressureClass(
        cell,
        year,
      ),

    changeFrom2026:
      getForecastChange(
        cell,
        year,
      ),

    conservationScore:
      getForecastConservationScore(
        cell,
        year,
      ),

    conservationClass:
      getForecastConservationClass(
        cell,
        year,
      ),

    conflictClass:
      getForecastConflictClass(
        cell,
        year,
      ),

    interventionPriority:
      getForecastInterventionPriority(
        cell,
        year,
      ),
  }
}

// ============================================================
// WHOLE STUDY-AREA SUMMARY
// ============================================================

export function getForecastYearSummary(
  cells,
  year = DEFAULT_FORECAST_YEAR,
) {
  const pressureCounts = {
    Low: 0,
    Medium: 0,
    High: 0,
    'Very High': 0,
  }

  let totalProbability = 0
  let highPressure = 0
  let highConservation = 0
  let criticalConflict = 0
  let highIntervention = 0

  cells.forEach(
    (cell) => {
      const snapshot =
        getForecastSnapshot(
          cell,
          year,
        )

      totalProbability +=
        snapshot.probability

      pressureCounts[
        snapshot.pressureClass
      ] += 1

      if (
        snapshot.pressureClass ===
          'High' ||
        snapshot.pressureClass ===
          'Very High'
      ) {
        highPressure += 1
      }

      if (
        snapshot.conservationClass ===
          'High' ||
        snapshot.conservationClass ===
          'Critical'
      ) {
        highConservation += 1
      }

      if (
        snapshot.conflictClass ===
        'Critical Forecast–Planning Conflict'
      ) {
        criticalConflict += 1
      }

      if (
        snapshot.interventionPriority ===
          'High' ||
        snapshot.interventionPriority ===
          'Very High' ||
        snapshot.interventionPriority ===
          'Critical'
      ) {
        highIntervention += 1
      }
    },
  )

  return {
    year,

    averageProbability:
      cells.length
        ? totalProbability /
          cells.length
        : 0,

    averagePressurePercent:
      cells.length
        ? Math.round(
            (
              totalProbability /
              cells.length
            ) * 100,
          )
        : 0,

    pressureCounts,

    highPressure,

    highConservation,

    criticalConflict,

    highIntervention,
  }
}