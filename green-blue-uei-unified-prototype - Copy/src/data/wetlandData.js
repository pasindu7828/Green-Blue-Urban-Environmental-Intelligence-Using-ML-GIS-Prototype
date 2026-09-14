// ============================================================
// KADUWELA WETLAND INTELLIGENCE SYSTEM
// Prototype / mock data only.
// These values are for UI demonstration and must later be
// replaced by validated research outputs.
// ============================================================


// ============================================================
// 1. KNOWN / MAPPED WETLAND INVENTORY
// Used by:
// - Dashboard
// - Wetland Inventory
// - History & Change
// - Future Projection
// ============================================================

export const wetlands = [
  {
    wetlandId: 'W-01',
    name: 'Kaduwela Marsh',
    zone: 'Kaduwela',
    currentArea: 42.8,
    currentYear: 2026,
    condition: 'Persistent Loss',
    patchCount: 3,
    lpi: 61.2,
    confidence: 'High',
    source: 'Prototype reference inventory',
  },
  {
    wetlandId: 'W-02',
    name: 'Welivita Wetland',
    zone: 'Welivita',
    currentArea: 31.4,
    currentYear: 2026,
    condition: 'Fragmented',
    patchCount: 4,
    lpi: 52.8,
    confidence: 'High',
    source: 'Prototype reference inventory',
  },
  {
    wetlandId: 'W-03',
    name: 'Ranala Wetland',
    zone: 'Ranala',
    currentArea: 27.9,
    currentYear: 2026,
    condition: 'Seasonally Variable',
    patchCount: 2,
    lpi: 78.4,
    confidence: 'Moderate',
    source: 'Prototype reference inventory',
  },
  {
    wetlandId: 'W-04',
    name: 'Hewagama Wetland',
    zone: 'Hewagama',
    currentArea: 18.7,
    currentYear: 2026,
    condition: 'Persistent Loss',
    patchCount: 5,
    lpi: 43.7,
    confidence: 'Moderate',
    source: 'Prototype reference inventory',
  },
  {
    wetlandId: 'W-05',
    name: 'Nawagamuwa Lowland Wetland',
    zone: 'Nawagamuwa',
    currentArea: 23.5,
    currentYear: 2026,
    condition: 'Relatively Stable',
    patchCount: 2,
    lpi: 82.1,
    confidence: 'High',
    source: 'Prototype reference inventory',
  },
  {
    wetlandId: 'W-06',
    name: 'Bomiriya Wetland Complex',
    zone: 'Bomiriya',
    currentArea: 37.6,
    currentYear: 2026,
    condition: 'Relatively Stable',
    patchCount: 2,
    lpi: 86.3,
    confidence: 'High',
    source: 'Prototype reference inventory',
  },
]


// ============================================================
// 2. OVERALL HISTORICAL WETLAND EXTENT
// Dashboard overview chart.
// ============================================================

export const wetlandExtentTrend = [
  { year: 2012, extent: 214.8 },
  { year: 2016, extent: 207.6 },
  { year: 2020, extent: 198.9 },
  { year: 2023, extent: 191.7 },
  { year: 2026, extent: 181.9 },
]


// ============================================================
// 3. HISTORICAL WETLAND OBSERVATIONS
// Represents the future wetland_history.csv structure.
// Used by History & Change.
// ============================================================

export const wetlandHistory = [
  // W-01
  {
    wetlandId: 'W-01',
    year: 2012,
    imageDate: '2012-03-12',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 52.4,
    perimeter: 4120,
    patchCount: 1,
    largestPatch: 50.2,
    meanPatch: 52.4,
    lpi: 95.8,
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    year: 2016,
    imageDate: '2016-02-18',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 50.1,
    perimeter: 4390,
    patchCount: 1,
    largestPatch: 47.2,
    meanPatch: 50.1,
    lpi: 94.2,
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    year: 2020,
    imageDate: '2020-03-05',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Wet Vegetation',
    area: 47.3,
    perimeter: 4680,
    patchCount: 2,
    largestPatch: 38.7,
    meanPatch: 23.65,
    lpi: 81.8,
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    year: 2023,
    imageDate: '2023-02-22',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Fragmented Wetland',
    area: 45.1,
    perimeter: 4930,
    patchCount: 3,
    largestPatch: 31.4,
    meanPatch: 15.03,
    lpi: 69.6,
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    year: 2026,
    imageDate: '2026-03-08',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Fragmented Wetland',
    area: 42.8,
    perimeter: 5110,
    patchCount: 3,
    largestPatch: 26.2,
    meanPatch: 14.27,
    lpi: 61.2,
    confidence: 'High',
  },

  // W-02
  {
    wetlandId: 'W-02',
    year: 2012,
    imageDate: '2012-02-16',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 39.8,
    perimeter: 3510,
    patchCount: 1,
    largestPatch: 38.3,
    meanPatch: 39.8,
    lpi: 96.2,
    confidence: 'High',
  },
  {
    wetlandId: 'W-02',
    year: 2016,
    imageDate: '2016-03-02',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 38.2,
    perimeter: 3660,
    patchCount: 2,
    largestPatch: 31.9,
    meanPatch: 19.1,
    lpi: 83.5,
    confidence: 'High',
  },
  {
    wetlandId: 'W-02',
    year: 2020,
    imageDate: '2020-02-27',
    season: 'Dry',
    imageQuality: 'Moderate',
    dominantCondition: 'Fragmented Wetland',
    area: 35.7,
    perimeter: 4020,
    patchCount: 3,
    largestPatch: 24.8,
    meanPatch: 11.9,
    lpi: 69.5,
    confidence: 'Moderate',
  },
  {
    wetlandId: 'W-02',
    year: 2023,
    imageDate: '2023-03-11',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Fragmented Wetland',
    area: 33.2,
    perimeter: 4190,
    patchCount: 3,
    largestPatch: 20.5,
    meanPatch: 11.07,
    lpi: 61.7,
    confidence: 'High',
  },
  {
    wetlandId: 'W-02',
    year: 2026,
    imageDate: '2026-03-04',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Fragmented Wetland',
    area: 31.4,
    perimeter: 4410,
    patchCount: 4,
    largestPatch: 16.6,
    meanPatch: 7.85,
    lpi: 52.8,
    confidence: 'High',
  },

    // =========================================================
  // W-03
  // =========================================================
  {
    wetlandId: 'W-03',
    year: 2012,
    imageDate: '2012-03-08',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 32.8,
    perimeter: 2980,
    patchCount: 1,
    largestPatch: 31.2,
    meanPatch: 32.8,
    lpi: 95.1,
    confidence: 'High',
  },
  {
    wetlandId: 'W-03',
    year: 2016,
    imageDate: '2016-02-25',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 31.5,
    perimeter: 3070,
    patchCount: 1,
    largestPatch: 29.7,
    meanPatch: 31.5,
    lpi: 94.3,
    confidence: 'High',
  },
  {
    wetlandId: 'W-03',
    year: 2020,
    imageDate: '2020-03-10',
    season: 'Dry',
    imageQuality: 'Moderate',
    dominantCondition: 'Seasonally Variable',
    area: 30.2,
    perimeter: 3220,
    patchCount: 2,
    largestPatch: 25.8,
    meanPatch: 15.1,
    lpi: 85.4,
    confidence: 'Moderate',
  },
  {
    wetlandId: 'W-03',
    year: 2023,
    imageDate: '2023-02-28',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Seasonally Variable',
    area: 28.8,
    perimeter: 3310,
    patchCount: 2,
    largestPatch: 23.4,
    meanPatch: 14.4,
    lpi: 81.3,
    confidence: 'Moderate',
  },
  {
    wetlandId: 'W-03',
    year: 2026,
    imageDate: '2026-03-06',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Seasonally Variable',
    area: 27.9,
    perimeter: 3390,
    patchCount: 2,
    largestPatch: 21.9,
    meanPatch: 13.95,
    lpi: 78.4,
    confidence: 'Moderate',
  },

  // =========================================================
  // W-04
  // =========================================================
  {
    wetlandId: 'W-04',
    year: 2012,
    imageDate: '2012-02-21',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 28.6,
    perimeter: 2710,
    patchCount: 1,
    largestPatch: 27.5,
    meanPatch: 28.6,
    lpi: 96.2,
    confidence: 'High',
  },
  {
    wetlandId: 'W-04',
    year: 2016,
    imageDate: '2016-03-04',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 26.4,
    perimeter: 2980,
    patchCount: 2,
    largestPatch: 21.8,
    meanPatch: 13.2,
    lpi: 82.6,
    confidence: 'High',
  },
  {
    wetlandId: 'W-04',
    year: 2020,
    imageDate: '2020-02-19',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Fragmented Wetland',
    area: 23.7,
    perimeter: 3310,
    patchCount: 3,
    largestPatch: 15.9,
    meanPatch: 7.9,
    lpi: 67.1,
    confidence: 'High',
  },
  {
    wetlandId: 'W-04',
    year: 2023,
    imageDate: '2023-03-07',
    season: 'Dry',
    imageQuality: 'Moderate',
    dominantCondition: 'Fragmented Wetland',
    area: 21.1,
    perimeter: 3590,
    patchCount: 4,
    largestPatch: 11.9,
    meanPatch: 5.28,
    lpi: 56.4,
    confidence: 'Moderate',
  },
  {
    wetlandId: 'W-04',
    year: 2026,
    imageDate: '2026-03-11',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Persistent Loss',
    area: 18.7,
    perimeter: 3810,
    patchCount: 5,
    largestPatch: 8.2,
    meanPatch: 3.74,
    lpi: 43.7,
    confidence: 'Moderate',
  },

  // =========================================================
  // W-05
  // =========================================================
  {
    wetlandId: 'W-05',
    year: 2012,
    imageDate: '2012-03-15',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 25.6,
    perimeter: 2540,
    patchCount: 1,
    largestPatch: 24.4,
    meanPatch: 25.6,
    lpi: 95.3,
    confidence: 'High',
  },
  {
    wetlandId: 'W-05',
    year: 2016,
    imageDate: '2016-03-08',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 25.1,
    perimeter: 2590,
    patchCount: 1,
    largestPatch: 23.7,
    meanPatch: 25.1,
    lpi: 94.4,
    confidence: 'High',
  },
  {
    wetlandId: 'W-05',
    year: 2020,
    imageDate: '2020-03-14',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Relatively Stable',
    area: 24.7,
    perimeter: 2670,
    patchCount: 2,
    largestPatch: 21.2,
    meanPatch: 12.35,
    lpi: 85.8,
    confidence: 'High',
  },
  {
    wetlandId: 'W-05',
    year: 2023,
    imageDate: '2023-03-02',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Relatively Stable',
    area: 24.1,
    perimeter: 2710,
    patchCount: 2,
    largestPatch: 20.1,
    meanPatch: 12.05,
    lpi: 83.4,
    confidence: 'High',
  },
  {
    wetlandId: 'W-05',
    year: 2026,
    imageDate: '2026-03-09',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Relatively Stable',
    area: 23.5,
    perimeter: 2790,
    patchCount: 2,
    largestPatch: 19.3,
    meanPatch: 11.75,
    lpi: 82.1,
    confidence: 'High',
  },

  // =========================================================
  // W-06
  // =========================================================
  {
    wetlandId: 'W-06',
    year: 2012,
    imageDate: '2012-02-24',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 40.2,
    perimeter: 3460,
    patchCount: 1,
    largestPatch: 38.7,
    meanPatch: 40.2,
    lpi: 96.3,
    confidence: 'High',
  },
  {
    wetlandId: 'W-06',
    year: 2016,
    imageDate: '2016-03-12',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Mixed Wetland',
    area: 39.8,
    perimeter: 3510,
    patchCount: 1,
    largestPatch: 38.0,
    meanPatch: 39.8,
    lpi: 95.5,
    confidence: 'High',
  },
  {
    wetlandId: 'W-06',
    year: 2020,
    imageDate: '2020-03-01',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Relatively Stable',
    area: 39.1,
    perimeter: 3590,
    patchCount: 2,
    largestPatch: 34.8,
    meanPatch: 19.55,
    lpi: 89.0,
    confidence: 'High',
  },
  {
    wetlandId: 'W-06',
    year: 2023,
    imageDate: '2023-02-18',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Relatively Stable',
    area: 38.4,
    perimeter: 3640,
    patchCount: 2,
    largestPatch: 33.6,
    meanPatch: 19.2,
    lpi: 87.5,
    confidence: 'High',
  },
  {
    wetlandId: 'W-06',
    year: 2026,
    imageDate: '2026-03-05',
    season: 'Dry',
    imageQuality: 'High',
    dominantCondition: 'Relatively Stable',
    area: 37.6,
    perimeter: 3710,
    patchCount: 2,
    largestPatch: 32.4,
    meanPatch: 18.8,
    lpi: 86.3,
    confidence: 'High',
  },
]


// ============================================================
// 4. HISTORICAL CHANGE BETWEEN OBSERVATION PERIODS
// Represents wetland_change.csv.
// ============================================================

export const wetlandChanges = [
  {
    wetlandId: 'W-01',
    fromYear: 2012,
    toYear: 2016,
    startArea: 52.4,
    endArea: 50.1,
    grossLoss: 3.1,
    grossGain: 0.8,
    netChange: -2.3,
    changePercent: -4.4,
    changeType: 'Loss',
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    fromYear: 2016,
    toYear: 2020,
    startArea: 50.1,
    endArea: 47.3,
    grossLoss: 3.6,
    grossGain: 0.8,
    netChange: -2.8,
    changePercent: -5.6,
    changeType: 'Loss + Fragmentation',
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    fromYear: 2020,
    toYear: 2023,
    startArea: 47.3,
    endArea: 45.1,
    grossLoss: 2.9,
    grossGain: 0.7,
    netChange: -2.2,
    changePercent: -4.7,
    changeType: 'Loss + Fragmentation',
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    fromYear: 2023,
    toYear: 2026,
    startArea: 45.1,
    endArea: 42.8,
    grossLoss: 2.8,
    grossGain: 0.5,
    netChange: -2.3,
    changePercent: -5.1,
    changeType: 'Persistent Loss',
    confidence: 'High',
  },

  {
    wetlandId: 'W-02',
    fromYear: 2012,
    toYear: 2016,
    startArea: 39.8,
    endArea: 38.2,
    grossLoss: 2.1,
    grossGain: 0.5,
    netChange: -1.6,
    changePercent: -4.0,
    changeType: 'Loss + Fragmentation',
    confidence: 'High',
  },
  {
    wetlandId: 'W-02',
    fromYear: 2016,
    toYear: 2020,
    startArea: 38.2,
    endArea: 35.7,
    grossLoss: 3.0,
    grossGain: 0.5,
    netChange: -2.5,
    changePercent: -6.5,
    changeType: 'Fragmentation',
    confidence: 'Moderate',
  },
]


// ============================================================
// 5. LAND-USE TRANSITIONS AFTER WETLAND LOSS
// Represents wetland_transitions.csv.
// ============================================================

export const wetlandTransitions = [
  {
    wetlandId: 'W-01',
    fromYear: 2020,
    toYear: 2026,
    toClass: 'Built-up',
    area: 2.1,
    percentage: 41,
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    fromYear: 2020,
    toYear: 2026,
    toClass: 'Fill / Bare Land',
    area: 1.3,
    percentage: 25,
    confidence: 'High',
  },
  {
    wetlandId: 'W-01',
    fromYear: 2020,
    toYear: 2026,
    toClass: 'Road / Infrastructure',
    area: 0.8,
    percentage: 16,
    confidence: 'Moderate',
  },
  {
    wetlandId: 'W-01',
    fromYear: 2020,
    toYear: 2026,
    toClass: 'Paddy / Agriculture',
    area: 0.5,
    percentage: 10,
    confidence: 'Moderate',
  },
  {
    wetlandId: 'W-01',
    fromYear: 2020,
    toYear: 2026,
    toClass: 'Other / Uncertain',
    area: 0.4,
    percentage: 8,
    confidence: 'Low',
  },
]


// ============================================================
// 6. AUTOMATIC CANDIDATE WETLAND DETECTION
// Prototype ML outputs.
// ============================================================

export const candidateWetlands = [
  {
    candidateId: 'CW-01',
    name: 'Candidate Lowland A',
    zone: 'Athurugiriya',
    area: 3.4,
    probability: 0.92,
    confidence: 'High',
    verificationStatus: 'Unverified Candidate',
    relativeElevation: -3.6,
    twi: 10.8,
    canalDistance: 72,
    mainEvidence: [
      'Low relative elevation',
      'High TWI',
      'Close drainage context',
      'Persistent lowland terrain',
    ],
  },
  {
    candidateId: 'CW-02',
    name: 'Candidate Lowland B',
    zone: 'Malabe',
    area: 2.1,
    probability: 0.85,
    confidence: 'High',
    verificationStatus: 'KMC Review Pending',
    relativeElevation: -2.9,
    twi: 9.7,
    canalDistance: 115,
    mainEvidence: [
      'Low relative elevation',
      'High terrain wetness tendency',
      'Vegetated lowland context',
    ],
  },
  {
    candidateId: 'CW-03',
    name: 'Candidate Lowland C',
    zone: 'Korathota',
    area: 1.7,
    probability: 0.74,
    confidence: 'Moderate',
    verificationStatus: 'Unverified Candidate',
    relativeElevation: -2.1,
    twi: 8.9,
    canalDistance: 181,
    mainEvidence: [
      'Moderate relative lowland',
      'Drainage proximity',
      'Suitable land-use context',
    ],
  },
  {
    candidateId: 'CW-04',
    name: 'Candidate Lowland D',
    zone: 'Pore',
    area: 1.2,
    probability: 0.66,
    confidence: 'Moderate',
    verificationStatus: 'Further Review Required',
    relativeElevation: -1.7,
    twi: 8.2,
    canalDistance: 240,
    mainEvidence: [
      'Local depression',
      'Moderate TWI',
    ],
  },
]


// ============================================================
// 7. CANDIDATE DETECTION MODEL COMPARISON
// ============================================================

export const candidateModelMetrics = [
  {
    model: 'Random Forest',
    precision: 0.84,
    recall: 0.82,
    f1: 0.83,
    prAuc: 0.86,
  },
  {
    model: 'SVM',
    precision: 0.80,
    recall: 0.77,
    f1: 0.78,
    prAuc: 0.81,
  },
  {
    model: 'XGBoost',
    precision: 0.88,
    recall: 0.85,
    f1: 0.86,
    prAuc: 0.90,
  },
]


export const candidateFeatureExperiments = [
  {
    featureSet: 'Terrain Only',
    f1: 0.74,
  },
  {
    featureSet: 'Terrain + Drainage',
    f1: 0.81,
  },
  {
    featureSet: 'Terrain + Drainage + Land Context',
    f1: 0.86,
  },
]


// ============================================================
// 8. FUTURE WETLAND PROJECTION
// Prototype CA-Markov / spatial projection outputs.
// ============================================================

export const futureProjections = [
  {
    wetlandId: 'W-01',
    currentYear: 2026,
    currentArea: 42.8,
    projectionYear: 2030,
    projectedArea: 39.7,
    projectedChange: -3.1,
    projectedChangePercent: -7.2,
    scenario: 'Historical Continuation',
    confidence: 'Moderate',
  },
  {
    wetlandId: 'W-02',
    currentYear: 2026,
    currentArea: 31.4,
    projectionYear: 2030,
    projectedArea: 28.9,
    projectedChange: -2.5,
    projectedChangePercent: -8.0,
    scenario: 'Historical Continuation',
    confidence: 'Moderate',
  },
  {
    wetlandId: 'W-03',
    currentYear: 2026,
    currentArea: 27.9,
    projectionYear: 2030,
    projectedArea: 27.1,
    projectedChange: -0.8,
    projectedChangePercent: -2.9,
    scenario: 'Historical Continuation',
    confidence: 'Low',
  },
]


export const futureValidation = [
  {
    wetlandId: 'W-01',
    hindcastYear: 2023,
    iou: 0.81,
    precision: 0.85,
    recall: 0.79,
    f1: 0.82,
    areaErrorPercent: 4.8,
  },
  {
    wetlandId: 'W-02',
    hindcastYear: 2023,
    iou: 0.76,
    precision: 0.81,
    recall: 0.75,
    f1: 0.78,
    areaErrorPercent: 6.3,
  },
  {
    wetlandId: 'W-03',
    hindcastYear: 2023,
    iou: 0.67,
    precision: 0.72,
    recall: 0.69,
    f1: 0.70,
    areaErrorPercent: 9.4,
  },
]


// ============================================================
// 9. TERRAIN / WATERLOGGING EVIDENCE
// Represents static terrain_lowland_features.csv style data.
// ============================================================

export const terrainEvidenceZones = [
  {
    zoneId: 'A-001',
    name: 'Hewagama Lowland',
    meanElevation: 7.8,
    minElevation: 6.5,
    relativeElevation: -3.2,
    localRelief: 3.7,
    meanSlope: 0.7,
    slopeSd: 0.4,
    twi: 10.1,
    flowAccumulation: 0.91,
    depressionIndex: 0.84,
    drainDistance: 90,
    canalDistance: 145,
    drainageDensity: 0.31,
    builtupPct: 78,
    roadDensity: 0.68,
    historicalEvents: 4,
  },
  {
    zoneId: 'A-002',
    name: 'Welivita Drainage Basin',
    meanElevation: 8.4,
    minElevation: 6.9,
    relativeElevation: -2.8,
    localRelief: 4.1,
    meanSlope: 0.9,
    slopeSd: 0.6,
    twi: 9.8,
    flowAccumulation: 0.88,
    depressionIndex: 0.79,
    drainDistance: 74,
    canalDistance: 118,
    drainageDensity: 0.36,
    builtupPct: 69,
    roadDensity: 0.61,
    historicalEvents: 5,
  },
  {
    zoneId: 'A-003',
    name: 'Malabe Urban Fringe',
    meanElevation: 11.2,
    minElevation: 9.1,
    relativeElevation: -1.9,
    localRelief: 5.3,
    meanSlope: 1.4,
    slopeSd: 0.8,
    twi: 8.7,
    flowAccumulation: 0.72,
    depressionIndex: 0.63,
    drainDistance: 132,
    canalDistance: 202,
    drainageDensity: 0.28,
    builtupPct: 84,
    roadDensity: 0.79,
    historicalEvents: 3,
  },
  {
    zoneId: 'A-004',
    name: 'Korathota Elevated Edge',
    meanElevation: 19.4,
    minElevation: 16.7,
    relativeElevation: 1.8,
    localRelief: 7.1,
    meanSlope: 3.2,
    slopeSd: 1.3,
    twi: 5.1,
    flowAccumulation: 0.31,
    depressionIndex: 0.22,
    drainDistance: 280,
    canalDistance: 360,
    drainageDensity: 0.19,
    builtupPct: 52,
    roadDensity: 0.44,
    historicalEvents: 0,
  },
]


// ============================================================
// 10. WATERLOGGING SUSCEPTIBILITY MODEL OUTPUTS
// Prototype only.
// ============================================================

export const waterloggingZones = [
  {
    zoneId: 'A-001',
    name: 'Hewagama Lowland',
    probability: 0.89,
    susceptibility: 'Very High',
    confidence: 'High',

    meanElevation: 7.8,
    relativeElevation: -3.2,
    meanSlope: 0.7,
    slopeSd: 0.4,
    twi: 10.1,
    flowAccumulation: 0.91,
    depressionIndex: 0.84,

    drainDistance: 90,
    drainageDensity: 0.31,
    builtupPct: 78,
    roadDensity: 0.68,

    rain24h: 43,
    rain3d: 92,
    rain7d: 138,

    historicalEvents: 4,

    drivers: [
      'Local depression',
      'Low relative elevation',
      'High flow accumulation',
      'High built-up percentage',
      'High antecedent rainfall',
    ],
  },
  {
    zoneId: 'A-002',
    name: 'Welivita Drainage Basin',
    probability: 0.84,
    susceptibility: 'Very High',
    confidence: 'High',

    meanElevation: 8.4,
    relativeElevation: -2.8,
    meanSlope: 0.9,
    slopeSd: 0.6,
    twi: 9.8,
    flowAccumulation: 0.88,
    depressionIndex: 0.79,

    drainDistance: 74,
    drainageDensity: 0.36,
    builtupPct: 69,
    roadDensity: 0.61,

    rain24h: 41,
    rain3d: 86,
    rain7d: 129,

    historicalEvents: 5,

    drivers: [
      'Low relative elevation',
      'High flow accumulation',
      'Drainage context',
      'High antecedent rainfall',
    ],
  },
  {
    zoneId: 'A-003',
    name: 'Malabe Urban Fringe',
    probability: 0.72,
    susceptibility: 'High',
    confidence: 'Moderate',

    meanElevation: 11.2,
    relativeElevation: -1.9,
    meanSlope: 1.4,
    slopeSd: 0.8,
    twi: 8.7,
    flowAccumulation: 0.72,
    depressionIndex: 0.63,

    drainDistance: 132,
    drainageDensity: 0.28,
    builtupPct: 84,
    roadDensity: 0.79,

    rain24h: 39,
    rain3d: 78,
    rain7d: 118,

    historicalEvents: 3,

    drivers: [
      'High built-up percentage',
      'Road density',
      'Moderate local depression',
      'Recent rainfall',
    ],
  },
  {
    zoneId: 'A-004',
    name: 'Korathota Elevated Edge',
    probability: 0.28,
    susceptibility: 'Low',
    confidence: 'Moderate',

    meanElevation: 19.4,
    relativeElevation: 1.8,
    meanSlope: 3.2,
    slopeSd: 1.3,
    twi: 5.1,
    flowAccumulation: 0.31,
    depressionIndex: 0.22,

    drainDistance: 280,
    drainageDensity: 0.19,
    builtupPct: 52,
    roadDensity: 0.44,

    rain24h: 35,
    rain3d: 70,
    rain7d: 105,

    historicalEvents: 0,

    drivers: [
      'Higher relative terrain position',
      'Lower flow accumulation',
      'Lower depression tendency',
    ],
  },
]


// ============================================================
// 11. WATERLOGGING MODEL COMPARISON
// ============================================================

export const waterloggingModelMetrics = [
  {
    model: 'Logistic Regression',
    precision: 0.72,
    recall: 0.69,
    f1: 0.70,
    prAuc: 0.73,
  },
  {
    model: 'Random Forest',
    precision: 0.83,
    recall: 0.81,
    f1: 0.82,
    prAuc: 0.86,
  },
  {
    model: 'XGBoost',
    precision: 0.87,
    recall: 0.84,
    f1: 0.85,
    prAuc: 0.90,
  },
  {
    model: 'CatBoost',
    precision: 0.85,
    recall: 0.83,
    f1: 0.84,
    prAuc: 0.88,
  },
]


// ============================================================
// 12. ANALYSIS-UNIT SCALE PILOT
// Prototype values only.
// ============================================================

export const waterloggingScaleExperiments = [
  {
    scale: 'Fine Grid',
    exampleSize: '100 m',
    f1: 0.76,
    prAuc: 0.78,
    note: 'Detailed but more sensitive to sparse event labels',
  },
  {
    scale: 'Medium Grid',
    exampleSize: '250 m',
    f1: 0.85,
    prAuc: 0.88,
    note: 'Balanced spatial detail and label coverage',
  },
  {
    scale: 'Coarse Grid',
    exampleSize: '500 m',
    f1: 0.73,
    prAuc: 0.75,
    note: 'Some terrain and urban conditions become mixed',
  },
]


// ============================================================
// 13. DASHBOARD DISTRIBUTIONS
// ============================================================

export const candidateConfidenceDistribution = [
  { name: 'High', value: 2 },
  { name: 'Moderate', value: 2 },
  { name: 'Low', value: 0 },
]


export const waterloggingDistribution = [
  { name: 'Low', value: 1 },
  { name: 'Moderate', value: 0 },
  { name: 'High', value: 1 },
  { name: 'Very High', value: 2 },
]


export const wetlandConditionDistribution = [
  { name: 'Persistent Loss', value: 2 },
  { name: 'Fragmented', value: 1 },
  { name: 'Seasonally Variable', value: 1 },
  { name: 'Relatively Stable', value: 2 },
]


// ============================================================
// 14. RESEARCH / METHODOLOGY SUMMARY
// Used by Methodology & Validation page.
// ============================================================

export const methodologySummary = {
  part1A: {
    title: 'Historical Wetland Change',
    tools: ['Google Earth Pro', 'QGIS'],
    outputs: [
      'Historical wetland polygons',
      'Area change',
      'Fragmentation',
      'Gross loss and gain',
      'Land-use transitions',
    ],
  },

  part1B: {
    title: 'Candidate Wetland Detection',
    tools: ['QGIS', 'Python / VS Code'],
    models: ['Random Forest', 'SVM', 'XGBoost'],
    validation: 'Site-based spatial validation',
  },

  part1C: {
    title: 'Future Wetland Projection',
    tools: ['QGIS', 'Python / Spatial model'],
    model: 'CA-Markov-type spatial land-change modelling',
    validation: 'Historical spatial hindcasting',
  },

  part2: {
    title: 'Waterlogging Susceptibility',
    tools: ['QGIS', 'Python / VS Code'],
    models: [
      'Logistic Regression',
      'Random Forest',
      'XGBoost',
      'CatBoost',
    ],
    validation: [
      'Spatial validation',
      'Temporal validation where data allow',
      'SHAP explainability',
    ],
  },
}