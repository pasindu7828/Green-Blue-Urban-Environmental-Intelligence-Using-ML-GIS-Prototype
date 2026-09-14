// ============================================================
// URBAN GREEN INTELLIGENCE — PROTOTYPE DATA
//
// Pilot area: Kaduwela
// Analytical grid: 12 rows × 16 columns = 192 cells
//
// IMPORTANT:
// All values in this file are deterministic mock/demo values.
// GN/locality groups are illustrative prototype groupings and
// are NOT official GN administrative boundaries.
// ============================================================

// ============================================================
// GRID SETTINGS
// ============================================================

export const GRID_ROWS = 12
export const GRID_COLS = 16
export const GRID_CELL_COUNT =
  GRID_ROWS * GRID_COLS

// ============================================================
// PROTOTYPE META
// ============================================================

export const prototypeMeta = {
  studyArea: 'Kaduwela',
  baselineYear: 2025,
  historicalYears: [2015, 2020, 2025],
  forecastStartYear: 2026,
  defaultForecastYear: 2030,
  forecastEndYear: 2035,
  gridRows: GRID_ROWS,
  gridColumns: GRID_COLS,
  gridCells: GRID_CELL_COUNT,
  note:
    'Prototype analytical data only. Replace with validated geospatial data in the final research.',
}

// ============================================================
// GN / LOCALITY-STYLE GROUPS
//
// These groups exist only to demonstrate administrative-style
// aggregation in the prototype.
// ============================================================

export const gnProfiles = [
  {
    id: 'malabe',
    name: 'Malabe',
    urbanIntensity: 0.82,
    greenBase: 0.58,
    roadInfluence: 0.88,
    constraint: 0.38,
  },
  {
    id: 'athurugiriya',
    name: 'Athurugiriya',
    urbanIntensity: 0.78,
    greenBase: 0.62,
    roadInfluence: 0.84,
    constraint: 0.34,
  },
  {
    id: 'hokandara',
    name: 'Hokandara',
    urbanIntensity: 0.69,
    greenBase: 0.67,
    roadInfluence: 0.72,
    constraint: 0.42,
  },
  {
    id: 'talangama',
    name: 'Talangama',
    urbanIntensity: 0.63,
    greenBase: 0.72,
    roadInfluence: 0.67,
    constraint: 0.58,
  },
  {
    id: 'kaduwela',
    name: 'Kaduwela',
    urbanIntensity: 0.88,
    greenBase: 0.49,
    roadInfluence: 0.94,
    constraint: 0.31,
  },
  {
    id: 'welivita',
    name: 'Welivita',
    urbanIntensity: 0.57,
    greenBase: 0.75,
    roadInfluence: 0.62,
    constraint: 0.52,
  },
  {
    id: 'ranala',
    name: 'Ranala',
    urbanIntensity: 0.53,
    greenBase: 0.79,
    roadInfluence: 0.58,
    constraint: 0.46,
  },
  {
    id: 'nawagamuwa',
    name: 'Nawagamuwa',
    urbanIntensity: 0.47,
    greenBase: 0.83,
    roadInfluence: 0.54,
    constraint: 0.61,
  },
]

// ============================================================
// HELPERS
// ============================================================

function clamp(value, min, max) {
  return Math.min(
    max,
    Math.max(min, value),
  )
}

function round(value, digits = 1) {
  return Number(
    Number(value).toFixed(digits),
  )
}

function seededNoise(row, col, seed = 1) {
  const x =
    Math.sin(
      row * 12.9898 +
        col * 78.233 +
        seed * 31.719,
    ) * 43758.5453

  return x - Math.floor(x)
}

function distance(
  rowA,
  colA,
  rowB,
  colB,
) {
  return Math.sqrt(
    (rowA - rowB) ** 2 +
      (colA - colB) ** 2,
  )
}

// ============================================================
// PROTOTYPE GN ASSIGNMENT
//
// The grid remains uniform.
// GN/locality assignment is a separate aggregation layer.
// ============================================================

function getGnProfile(row, col) {
  // Upper-left
  if (row < 3 && col < 8) {
    return gnProfiles[0] // Malabe
  }

  // Upper-right
  if (row < 3 && col >= 8) {
    return gnProfiles[1] // Athurugiriya
  }

  // Mid-upper left
  if (
    row >= 3 &&
    row < 6 &&
    col < 8
  ) {
    return gnProfiles[2] // Hokandara
  }

  // Mid-upper right
  if (
    row >= 3 &&
    row < 6 &&
    col >= 8
  ) {
    return gnProfiles[3] // Talangama
  }

  // Mid-lower left
  if (
    row >= 6 &&
    row < 9 &&
    col < 8
  ) {
    return gnProfiles[4] // Kaduwela
  }

  // Mid-lower right
  if (
    row >= 6 &&
    row < 9 &&
    col >= 8
  ) {
    return gnProfiles[5] // Welivita
  }

  // Bottom-left
  if (row >= 9 && col < 8) {
    return gnProfiles[6] // Ranala
  }

  return gnProfiles[7] // Nawagamuwa
}

// ============================================================
// PRESSURE CLASS
// ============================================================

function pressureClass(score) {
  if (score >= 80) {
    return 'Very High'
  }

  if (score >= 60) {
    return 'High'
  }

  if (score >= 40) {
    return 'Medium'
  }

  return 'Low'
}

// ============================================================
// SUITABILITY CLASS
// ============================================================

function suitabilityClass(score) {
  if (score >= 72) {
    return 'Highly suitable'
  }

  if (score >= 55) {
    return 'Moderately suitable'
  }

  if (score >= 38) {
    return 'Low suitability'
  }

  return 'Caution / conservation-sensitive'
}

// ============================================================
// CONSERVATION CLASS
// ============================================================

function conservationClass(
  score,
  greenValue,
  pressure,
) {
  if (score >= 80) {
    return 'Critical'
  }

  if (score >= 65) {
    return 'High'
  }

  if (
    greenValue >= 65 &&
    pressure < 45
  ) {
    return 'Stable Green'
  }

  if (score >= 45) {
    return 'Monitoring'
  }

  return 'Lower Current Threat'
}

// ============================================================
// CONFLICT CLASS — 2030 PROTOTYPE
// ============================================================

function conflictClass(
  pressure,
  suitability,
  conservation,
) {
  const importantGreen =
    conservation === 'Critical' ||
    conservation === 'High'

  if (
    pressure >= 80 &&
    (suitability < 50 ||
      importantGreen)
  ) {
    return 'Critical Forecast–Planning Conflict'
  }

  if (
    pressure >= 60 &&
    suitability < 60
  ) {
    return 'Development Caution'
  }

  if (
    importantGreen &&
    pressure >= 45
  ) {
    return 'Conservation Priority'
  }

  if (
    pressure >= 60 &&
    suitability >= 65
  ) {
    return 'Managed Growth Opportunity'
  }

  return 'Monitoring / Low Urgency'
}

// ============================================================
// INTERVENTION PRIORITY
// ============================================================

function interventionPriority(
  conflict,
  conservation,
) {
  if (
    conflict ===
      'Critical Forecast–Planning Conflict' &&
    conservation === 'Critical'
  ) {
    return 'Critical'
  }

  if (
    conflict ===
    'Critical Forecast–Planning Conflict'
  ) {
    return 'Very High'
  }

  if (
    conflict ===
      'Development Caution' ||
    conservation === 'Critical'
  ) {
    return 'High'
  }

  if (
    conflict ===
    'Managed Growth Opportunity'
  ) {
    return 'Medium'
  }

  return 'Monitoring'
}

// ============================================================
// DRIVER BUILDER
// ============================================================

function buildPressureDrivers({
  roadAccess,
  nearbyBuilt,
  previousGrowth,
  buildingDensity,
  slope,
}) {
  const values = [
    {
      feature:
        'Nearby built-up growth',
      score: nearbyBuilt,
      direction: 'increase',
    },
    {
      feature:
        'Road accessibility',
      score: roadAccess,
      direction: 'increase',
    },
    {
      feature:
        'Previous neighbourhood growth',
      score: previousGrowth,
      direction: 'increase',
    },
    {
      feature:
        'Building density',
      score: buildingDensity,
      direction: 'increase',
    },
    {
      feature: 'Slope',
      score: Math.max(
        0,
        100 - slope * 6,
      ),
      direction:
        slope > 7
          ? 'decrease'
          : 'increase',
    },
  ]

  return values
    .sort(
      (a, b) =>
        b.score - a.score,
    )
    .slice(0, 4)
}

// ============================================================
// GENERATE ONE GRID CELL
// ============================================================

function createGridCell(
  row,
  col,
  index,
) {
  const gn =
    getGnProfile(row, col)

  const rowNorm =
    row /
    (GRID_ROWS - 1)

  const colNorm =
    col /
    (GRID_COLS - 1)

  // ----------------------------------------------------------
  // PROTOTYPE URBAN HOTSPOTS
  //
  // Creates clustered spatial patterns rather than random data.
  // ----------------------------------------------------------

  const hotspot1 =
    Math.max(
      0,
      1 -
        distance(
          row,
          col,
          5,
          8,
        ) /
          7,
    )

  const hotspot2 =
    Math.max(
      0,
      1 -
        distance(
          row,
          col,
          2,
          11,
        ) /
          6,
    )

  const hotspot3 =
    Math.max(
      0,
      1 -
        distance(
          row,
          col,
          7,
          4,
        ) /
          6,
    )

  const urbanCluster =
    clamp(
      hotspot1 * 0.44 +
        hotspot2 * 0.31 +
        hotspot3 * 0.25,
      0,
      1,
    )

  const noiseA =
    seededNoise(
      row,
      col,
      1,
    )

  const noiseB =
    seededNoise(
      row,
      col,
      2,
    )

  const noiseC =
    seededNoise(
      row,
      col,
      3,
    )

  // ----------------------------------------------------------
  // HISTORICAL GREEN COVER
  // ----------------------------------------------------------

  const green2015 =
    clamp(
      36 +
        gn.greenBase * 43 -
        urbanCluster * 13 +
        (noiseA - 0.5) * 9,
      22,
      82,
    )

  const loss2015to2020 =
    clamp(
      2.5 +
        urbanCluster * 8 +
        gn.urbanIntensity * 4 +
        noiseB * 2.5,
      1.5,
      15,
    )

  const loss2020to2025 =
    clamp(
      3 +
        urbanCluster * 9 +
        gn.urbanIntensity * 4.5 +
        noiseC * 3,
      2,
      17,
    )

  const green2020 =
    clamp(
      green2015 -
        loss2015to2020,
      10,
      78,
    )

  const green2025 =
    clamp(
      green2020 -
        loss2020to2025,
      6,
      75,
    )

  // ----------------------------------------------------------
  // BUILT-UP
  // ----------------------------------------------------------

  const built2015 =
    clamp(
      18 +
        gn.urbanIntensity * 24 +
        urbanCluster * 12 +
        colNorm * 4 +
        (noiseB - 0.5) * 5,
      12,
      60,
    )

  const builtGrowth1 =
    clamp(
      2 +
        urbanCluster * 7 +
        gn.urbanIntensity * 3 +
        noiseA * 2,
      1.5,
      13,
    )

  const builtGrowth2 =
    clamp(
      2.5 +
        urbanCluster * 8 +
        gn.urbanIntensity * 3.5 +
        noiseB * 2,
      2,
      15,
    )

  const built2020 =
    clamp(
      built2015 +
        builtGrowth1,
      15,
      72,
    )

  const built2025 =
    clamp(
      built2020 +
        builtGrowth2,
      18,
      82,
    )

  // ----------------------------------------------------------
  // WATER / OTHER
  // ----------------------------------------------------------

  const water2015 =
    clamp(
      3 +
        rowNorm * 2 +
        seededNoise(
          row,
          col,
          5,
        ) *
          2,
      2,
      7,
    )

  const water2020 =
    water2015

  const water2025 =
    water2015

  // ----------------------------------------------------------
  // OPEN LAND
  // ----------------------------------------------------------

  const open2015 =
    Math.max(
      2,
      100 -
        green2015 -
        built2015 -
        water2015,
    )

  const open2020 =
    Math.max(
      2,
      100 -
        green2020 -
        built2020 -
        water2020,
    )

  const open2025 =
    Math.max(
      2,
      100 -
        green2025 -
        built2025 -
        water2025,
    )

  // ----------------------------------------------------------
  // TRANSITION
  // ----------------------------------------------------------

  const greenLoss =
    Math.max(
      0,
      green2015 -
        green2025,
    )

  const builtGrowth =
    Math.max(
      0,
      built2025 -
        built2015,
    )

  const greenToBuilt =
    clamp(
      greenLoss * 0.55 +
        builtGrowth * 0.28 +
        urbanCluster * 3,
      1,
      22,
    )

  // ----------------------------------------------------------
  // REMOTE SENSING
  // ----------------------------------------------------------

  const ndvi2015 =
    clamp(
      0.18 +
        green2015 /
          100 *
          0.68,
      0.18,
      0.82,
    )

  const ndvi2020 =
    clamp(
      0.18 +
        green2020 /
          100 *
          0.68,
      0.15,
      0.79,
    )

  const ndvi2025 =
    clamp(
      0.16 +
        green2025 /
          100 *
          0.67,
      0.12,
      0.75,
    )

  const ndbi2015 =
    clamp(
      -0.16 +
        built2015 /
          100 *
          0.58,
      -0.12,
      0.36,
    )

  const ndbi2020 =
    clamp(
      -0.15 +
        built2020 /
          100 *
          0.58,
      -0.1,
      0.4,
    )

  const ndbi2025 =
    clamp(
      -0.14 +
        built2025 /
          100 *
          0.6,
      -0.08,
      0.45,
    )

  // ----------------------------------------------------------
  // ACCESSIBILITY / URBAN FEATURES
  // ----------------------------------------------------------

  const roadDistance =
    clamp(
      950 -
        gn.roadInfluence *
          650 -
        urbanCluster *
          230 +
        noiseA * 130,
      40,
      1000,
    )

  const roadAccess =
    clamp(
      100 -
        roadDistance /
          12 +
        urbanCluster * 12,
      25,
      98,
    )

  const roadDensity =
    clamp(
      22 +
        gn.roadInfluence *
          52 +
        urbanCluster *
          22 +
        noiseC * 5,
      20,
      96,
    )

  const distanceToTown =
    clamp(
      0.6 +
        distance(
          row,
          col,
          6,
          7,
        ) *
          0.48 +
        noiseB *
          0.4,
      0.4,
      8.5,
    )

  const buildingDensity =
    clamp(
      built2025 *
        0.95 +
        urbanCluster *
          20,
      20,
      96,
    )

  const nearbyBuilt2025 =
    clamp(
      built2025 +
        urbanCluster *
          17 +
        noiseA *
          5,
      20,
      96,
    )

  const distanceBuiltEdge =
    clamp(
      650 -
        nearbyBuilt2025 *
          5.2 +
        noiseB *
          100,
      35,
      700,
    )

  const previousGrowth =
    clamp(
      builtGrowth *
        3.1 +
        urbanCluster *
          25,
      8,
      92,
    )

  // ----------------------------------------------------------
  // TERRAIN
  // ----------------------------------------------------------

  const elevation =
    clamp(
      8 +
        rowNorm * 29 +
        seededNoise(
          row,
          col,
          7,
        ) *
          10,
      6,
      48,
    )

  const slope =
    clamp(
      1 +
        seededNoise(
          row,
          col,
          8,
        ) *
          8 +
        rowNorm *
          2,
      1,
      12,
    )

  // ----------------------------------------------------------
  // 2030 URBANIZATION PRESSURE ANCHOR
  //
  // Multi-year utility later expands this to 2026–2035.
  // ----------------------------------------------------------

  const pressureRaw =
    roadAccess * 0.2 +
    nearbyBuilt2025 *
      0.24 +
    previousGrowth *
      0.18 +
    buildingDensity *
      0.12 +
    greenToBuilt *
      1.05 +
    urbanCluster *
      16 -
    slope *
      0.65

  const pressureScore =
    Math.round(
      clamp(
        pressureRaw,
        18,
        96,
      ),
    )

  const pressureProbability =
    pressureScore / 100

  const pClass =
    pressureClass(
      pressureScore,
    )

  // ----------------------------------------------------------
  // PLANNING CONSTRAINT
  // ----------------------------------------------------------

  const planningConstraint =
    Math.round(
      clamp(
        gn.constraint *
          65 +
          green2025 *
            0.25 +
          slope *
            1.5 +
          noiseC *
            8,
        18,
        90,
      ),
    )

  // ----------------------------------------------------------
  // DEVELOPMENT SUITABILITY
  //
  // Kept independent from pressure.
  // ----------------------------------------------------------

  const suitabilityScore =
    Math.round(
      clamp(
        roadAccess *
          0.26 +
          roadDensity *
            0.13 +
          (100 -
            Math.min(
              distanceToTown *
                11,
              100,
            )) *
            0.18 +
          (100 -
            planningConstraint) *
            0.27 +
          (100 -
            slope * 6) *
            0.16,
        18,
        92,
      ),
    )

  const sClass =
    suitabilityClass(
      suitabilityScore,
    )

  // ----------------------------------------------------------
  // GREEN VALUE
  // ----------------------------------------------------------

  const greenPersistence =
    Math.round(
      clamp(
        green2025 *
          1.12 +
          green2015 *
            0.24 -
          greenLoss *
            0.35,
        20,
        96,
      ),
    )

  const greenConnectivity =
    Math.round(
      clamp(
        green2025 *
          0.8 +
          (1 -
            urbanCluster) *
            32 +
          noiseB *
            8,
        22,
        96,
      ),
    )

  const greenValue =
    Math.round(
      clamp(
        green2025 *
          0.38 +
          greenPersistence *
            0.31 +
          greenConnectivity *
            0.31,
        20,
        96,
      ),
    )

  // ----------------------------------------------------------
  // 2030 CONSERVATION ANCHOR
  // ----------------------------------------------------------

  const conservationScore =
    Math.round(
      clamp(
        greenValue *
          0.58 +
          pressureScore *
            0.42,
        18,
        96,
      ),
    )

  const cClass =
    conservationClass(
      conservationScore,
      greenValue,
      pressureScore,
    )

  // ----------------------------------------------------------
  // CONFLICT
  // ----------------------------------------------------------

  const cflClass =
    conflictClass(
      pressureScore,
      suitabilityScore,
      cClass,
    )

  const intervention =
    interventionPriority(
      cflClass,
      cClass,
    )

  // ----------------------------------------------------------
  // DRIVERS
  // ----------------------------------------------------------

  const pressureDrivers =
    buildPressureDrivers({
      roadAccess,
      nearbyBuilt:
        nearbyBuilt2025,
      previousGrowth,
      buildingDensity,
      slope,
    })

  const topDriver =
    pressureDrivers[0]
      ?.feature ||
    'Road accessibility'

  // ----------------------------------------------------------
  // RECOMMENDATION
  // ----------------------------------------------------------

  let recommendation =
    'Continue monitoring future land-development pressure.'

  if (
    cflClass ===
    'Critical Forecast–Planning Conflict'
  ) {
    recommendation =
      'Prioritize planning review and green-conservation action before further development.'
  } else if (
    cClass === 'Critical'
  ) {
    recommendation =
      'Prioritize conservation of remaining connected green cover.'
  } else if (
    sClass ===
      'Highly suitable' &&
    pressureScore >= 60
  ) {
    recommendation =
      'Consider managed development while retaining required green buffers.'
  } else if (
    sClass ===
    'Caution / conservation-sensitive'
  ) {
    recommendation =
      'Apply strong development controls and conservation-focused review.'
  }

  // ----------------------------------------------------------
  // RESULT
  // ----------------------------------------------------------

  return {
    gridId: `KDW-${String(
      index + 1,
    ).padStart(3, '0')}`,

    row,
    col,

    gnId: gn.id,
    gnDivision: gn.name,

    // Historical land cover
    green2015:
      round(
        green2015,
        1,
      ),

    green2020:
      round(
        green2020,
        1,
      ),

    green2025:
      round(
        green2025,
        1,
      ),

    built2015:
      round(
        built2015,
        1,
      ),

    built2020:
      round(
        built2020,
        1,
      ),

    built2025:
      round(
        built2025,
        1,
      ),

    open2015:
      round(
        open2015,
        1,
      ),

    open2020:
      round(
        open2020,
        1,
      ),

    open2025:
      round(
        open2025,
        1,
      ),

    water2015:
      round(
        water2015,
        1,
      ),

    water2020:
      round(
        water2020,
        1,
      ),

    water2025:
      round(
        water2025,
        1,
      ),

    // Transition
    greenLoss:
      round(
        greenLoss,
        1,
      ),

    builtGrowth:
      round(
        builtGrowth,
        1,
      ),

    greenToBuilt:
      round(
        greenToBuilt,
        1,
      ),

    // Remote sensing
    ndvi2015:
      round(
        ndvi2015,
        2,
      ),

    ndvi2020:
      round(
        ndvi2020,
        2,
      ),

    ndvi2025:
      round(
        ndvi2025,
        2,
      ),

    ndbi2015:
      round(
        ndbi2015,
        2,
      ),

    ndbi2020:
      round(
        ndbi2020,
        2,
      ),

    ndbi2025:
      round(
        ndbi2025,
        2,
      ),

    // Urban features
    roadDistance:
      Math.round(
        roadDistance,
      ),

    roadAccess:
      Math.round(
        roadAccess,
      ),

    roadDensity:
      Math.round(
        roadDensity,
      ),

    distanceToTown:
      round(
        distanceToTown,
        1,
      ),

    buildingDensity:
      Math.round(
        buildingDensity,
      ),

    nearbyBuilt2025:
      Math.round(
        nearbyBuilt2025,
      ),

    distanceBuiltEdge:
      Math.round(
        distanceBuiltEdge,
      ),

    previousGrowth:
      Math.round(
        previousGrowth,
      ),

    // Terrain
    elevation:
      Math.round(
        elevation,
      ),

    slope:
      round(
        slope,
        1,
      ),

    // ML pressure anchor
    pressureProbability:
      round(
        pressureProbability,
        3,
      ),

    pressureScore,

    pressureClass:
      pClass,

    topDriver,

    pressureDrivers,

    // Planning
    planningConstraint,

    suitabilityScore,

    suitabilityClass:
      sClass,

    suitabilityReasons: [
      `Road accessibility: ${Math.round(
        roadAccess,
      )}/100`,

      `Planning constraint: ${planningConstraint}/100`,

      `Slope: ${round(
        slope,
        1,
      )}°`,
    ],

    // Conservation
    greenPersistence,

    greenConnectivity,

    greenValue,

    conservationScore,

    conservationClass:
      cClass,

    // Conflict
    conflictClass:
      cflClass,

    interventionPriority:
      intervention,

    recommendation,
  }
}

// ============================================================
// CREATE ALL 192 CELLS
// ============================================================

export const urbanGridCells =
  Array.from(
    {
      length:
        GRID_CELL_COUNT,
    },
    (_, index) => {
      const row =
        Math.floor(
          index /
            GRID_COLS,
        )

      const col =
        index %
        GRID_COLS

      return createGridCell(
        row,
        col,
        index,
      )
    },
  )

// ============================================================
// GN SUMMARIES
// ============================================================

export const gnSummaries =
  gnProfiles.map(
    (profile) => {
      const cells =
        urbanGridCells.filter(
          (cell) =>
            cell.gnId ===
            profile.id,
        )

      const avg = (key) =>
        cells.length
          ? cells.reduce(
              (
                sum,
                cell,
              ) =>
                sum +
                Number(
                  cell[
                    key
                  ] || 0,
                ),
              0,
            ) /
            cells.length
          : 0

      const green2015 =
        avg(
          'green2015',
        )

      const green2020 =
        avg(
          'green2020',
        )

      const green2025 =
        avg(
          'green2025',
        )

      const pressureScore =
        Math.round(
          avg(
            'pressureScore',
          ),
        )

      const suitabilityScore =
        Math.round(
          avg(
            'suitabilityScore',
          ),
        )

      const conservationScore =
        Math.round(
          avg(
            'conservationScore',
          ),
        )

      const criticalConflictCells =
        cells.filter(
          (cell) =>
            cell.conflictClass ===
            'Critical Forecast–Planning Conflict',
        ).length

      return {
        id:
          profile.id,

        gnId:
          profile.id,

        gnDivision:
          profile.name,

        cellCount:
          cells.length,

        green2015:
          round(
            green2015,
            1,
          ),

        green2020:
          round(
            green2020,
            1,
          ),

        green2025:
          round(
            green2025,
            1,
          ),

        greenChange:
          round(
            green2025 -
              green2015,
            1,
          ),

        greenToBuilt:
          round(
            avg(
              'greenToBuilt',
            ),
            1,
          ),

        roadAccess:
          Math.round(
            avg(
              'roadAccess',
            ),
          ),

        buildingDensity:
          Math.round(
            avg(
              'buildingDensity',
            ),
          ),

        distanceToTown:
          round(
            avg(
              'distanceToTown',
            ),
            1,
          ),

        pressureScore,

        pressureProbability:
          round(
            pressureScore /
              100,
            3,
          ),

        pressureClass:
          pressureClass(
            pressureScore,
          ),

        suitabilityScore,

        suitabilityClass:
          suitabilityClass(
            suitabilityScore,
          ),

        greenValue:
          Math.round(
            avg(
              'greenValue',
            ),
          ),

        conservationScore,

        conservationClass:
          conservationClass(
            conservationScore,
            Math.round(
              avg(
                'greenValue',
              ),
            ),
            pressureScore,
          ),

        criticalConflictCells,
      }
    },
  )

// ============================================================
// DASHBOARD SUMMARY
// ============================================================

export const dashboardSummary = {
  gridCells:
    urbanGridCells.length,

  averageGreen2015:
    round(
      urbanGridCells.reduce(
        (sum, cell) =>
          sum +
          cell.green2015,
        0,
      ) /
        urbanGridCells.length,
      1,
    ),

  averageGreen2025:
    round(
      urbanGridCells.reduce(
        (sum, cell) =>
          sum +
          cell.green2025,
        0,
      ) /
        urbanGridCells.length,
      1,
    ),

  averageGreenLoss:
    round(
      urbanGridCells.reduce(
        (sum, cell) =>
          sum +
          cell.greenLoss,
        0,
      ) /
        urbanGridCells.length,
      1,
    ),

  averageGreenToBuilt:
    round(
      urbanGridCells.reduce(
        (sum, cell) =>
          sum +
          cell.greenToBuilt,
        0,
      ) /
        urbanGridCells.length,
      1,
    ),
}

// ============================================================
// SIMPLE CLASS SUMMARIES
// ============================================================

export const pressureSummary = [
  'Low',
  'Medium',
  'High',
  'Very High',
].map((label) => ({
  label,
  count:
    urbanGridCells.filter(
      (cell) =>
        cell.pressureClass ===
        label,
    ).length,
}))

export const conservationSummary = [
  'Critical',
  'High',
  'Monitoring',
  'Stable Green',
  'Lower Current Threat',
].map((label) => ({
  label,
  count:
    urbanGridCells.filter(
      (cell) =>
        cell.conservationClass ===
        label,
    ).length,
}))

export const conflictSummary =
  [
    'Critical Forecast–Planning Conflict',
    'Development Caution',
    'Conservation Priority',
    'Managed Growth Opportunity',
    'Monitoring / Low Urgency',
  ].map((label) => ({
    label,
    count:
      urbanGridCells.filter(
        (cell) =>
          cell.conflictClass ===
          label,
      ).length,
  }))

// ============================================================
// HISTORICAL TREND
// ============================================================

function overallAverage(key) {
  return round(
    urbanGridCells.reduce(
      (sum, cell) =>
        sum +
        Number(
          cell[key] || 0,
        ),
      0,
    ) /
      urbanGridCells.length,
    1,
  )
}

export const greenTrend = [
  {
    year: '2015',
    green:
      overallAverage(
        'green2015',
      ),
    built:
      overallAverage(
        'built2015',
      ),
  },
  {
    year: '2020',
    green:
      overallAverage(
        'green2020',
      ),
    built:
      overallAverage(
        'built2020',
      ),
  },
  {
    year: '2025',
    green:
      overallAverage(
        'green2025',
      ),
    built:
      overallAverage(
        'built2025',
      ),
  },
]

// ============================================================
// LAND-COVER COMPOSITION
// ============================================================

export const landClassData = [
  {
    year: '2015',
    Green:
      overallAverage(
        'green2015',
      ),
    'Built-up':
      overallAverage(
        'built2015',
      ),
    'Open/Bare':
      overallAverage(
        'open2015',
      ),
    'Water/Other':
      overallAverage(
        'water2015',
      ),
  },
  {
    year: '2020',
    Green:
      overallAverage(
        'green2020',
      ),
    'Built-up':
      overallAverage(
        'built2020',
      ),
    'Open/Bare':
      overallAverage(
        'open2020',
      ),
    'Water/Other':
      overallAverage(
        'water2020',
      ),
  },
  {
    year: '2025',
    Green:
      overallAverage(
        'green2025',
      ),
    'Built-up':
      overallAverage(
        'built2025',
      ),
    'Open/Bare':
      overallAverage(
        'open2025',
      ),
    'Water/Other':
      overallAverage(
        'water2025',
      ),
  },
]

// ============================================================
// MODEL PERFORMANCE — PROTOTYPE VALUES
// ============================================================

export const modelPerformance = [
  {
    model:
      'Logistic Regression',
    rocAuc: 0.78,
    f1: 0.73,
    prAuc: 0.7,
    balancedAccuracy: 0.74,
    brier: 0.18,
  },
  {
    model:
      'Random Forest',
    rocAuc: 0.86,
    f1: 0.81,
    prAuc: 0.79,
    balancedAccuracy: 0.82,
    brier: 0.14,
  },
  {
    model: 'XGBoost',
    rocAuc: 0.9,
    f1: 0.85,
    prAuc: 0.83,
    balancedAccuracy: 0.86,
    brier: 0.11,
  },
]

// ============================================================
// FEATURE IMPORTANCE — PROTOTYPE
// ============================================================

export const featureImportance = [
  {
    name:
      'Nearby built-up growth',
    value: 91,
  },
  {
    name:
      'Road accessibility',
    value: 86,
  },
  {
    name:
      'Previous neighbourhood growth',
    value: 81,
  },
  {
    name:
      'Building density',
    value: 75,
  },
  {
    name:
      'Distance to built-up edge',
    value: 69,
  },
  {
    name:
      'Green-to-built conversion',
    value: 64,
  },
  {
    name: 'Slope',
    value: 42,
  },
]

// ============================================================
// METHODOLOGY STEPS
// ============================================================

export const methodologySteps = [
  'Satellite and GIS data collection',
  'Spatial preprocessing and alignment',
  'Fine-scale grid creation',
  'Historical land-cover analysis',
  'Green-to-built transition extraction',
  'Spatial feature engineering',
  'Machine-learning model development',
  'Temporal and spatial validation',
  'Multi-horizon pressure forecasting',
  'SHAP explainability',
  'GIS-MCDA development suitability',
  'Green conservation priority',
  'Forecast–planning conflict',
  'Planning intervention ranking',
]

// ============================================================
// MAP LEGENDS
// ============================================================

export const mapLegends = {
  pressure: [
    {
      label: 'Low',
      color: '#77c593',
    },
    {
      label: 'Medium',
      color: '#e7d36f',
    },
    {
      label: 'High',
      color: '#ee9a55',
    },
    {
      label: 'Very High',
      color: '#dc6661',
    },
  ],

  suitability: [
    {
      label:
        'Highly suitable',
      color: '#72bddd',
    },
    {
      label:
        'Moderately suitable',
      color: '#8ccca6',
    },
    {
      label:
        'Low suitability',
      color: '#e6c96e',
    },
    {
      label:
        'Caution / conservation-sensitive',
      color: '#dd716c',
    },
  ],

  conservation: [
    {
      label: 'Critical',
      color: '#b83e3e',
    },
    {
      label: 'High',
      color: '#e47b45',
    },
    {
      label: 'Monitoring',
      color: '#e5c95e',
    },
    {
      label:
        'Stable Green',
      color: '#4ea76d',
    },
    {
      label:
        'Lower Current Threat',
      color: '#a8d8b7',
    },
  ],

  conflict: [
    {
      label:
        'Critical Forecast–Planning Conflict',
      color: '#bd3f42',
    },
    {
      label:
        'Development Caution',
      color: '#e58a43',
    },
    {
      label:
        'Conservation Priority',
      color: '#4b9b66',
    },
    {
      label:
        'Managed Growth Opportunity',
      color: '#4e9ec0',
    },
    {
      label:
        'Monitoring / Low Urgency',
      color: '#b9c5c2',
    },
  ],
}

// ============================================================
// BACKWARD-COMPATIBILITY EXPORTS
// ============================================================

export const zones =
  gnSummaries.map(
    (item) => ({
      id: item.id,

      zoneName:
        item.gnDivision,

      greenChange:
        item.greenChange,

      builtUpGrowth:
        round(
          urbanGridCells
            .filter(
              (cell) =>
                cell.gnId ===
                item.id,
            )
            .reduce(
              (
                sum,
                cell,
              ) =>
                sum +
                cell.builtGrowth,
              0,
            ) /
            item.cellCount,
          1,
        ),

      roadAccess:
        item.roadAccess,

      buildingDensity:
        item.buildingDensity,

      distanceToTown:
        item.distanceToTown,

      urbanPressure:
        item.pressureClass,

      pressureScore:
        item.pressureScore,

      suitabilityScore:
        item.suitabilityScore,

      suitabilityClass:
        item.suitabilityClass,

      conversionRate:
        item.greenToBuilt,
    }),
  )

export const modelScores =
  modelPerformance.map(
    (item) => ({
      model: item.model,
      metricA:
        item.rocAuc,
      metricB:
        item.f1,
    }),
  )

export const urbanGrowth =
  greenTrend.map(
    (item) => ({
      year: item.year,
      area: item.built,
    }),
  )