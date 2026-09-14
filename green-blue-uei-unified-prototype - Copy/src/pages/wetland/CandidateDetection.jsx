import { useMemo, useState } from 'react'

import {
  BadgeCheck,
  BrainCircuit,
  Database,
  MapPinned,
  Radar,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import Badge from '../../components/ui/Badge'
import CandidateWetlandMap from '../../components/maps/CandidateWetlandMap'

import {
  candidateFeatureExperiments,
  candidateModelMetrics,
  candidateWetlands,
  wetlands,
} from '../../data/wetlandData'


export default function CandidateDetection() {
  const [selectedCandidate, setSelectedCandidate] =
    useState(candidateWetlands[0] || null)

  const [confidenceFilter, setConfidenceFilter] =
    useState('All')

  const [showKnown, setShowKnown] = useState(true)
  const [showCandidates, setShowCandidates] = useState(true)
  const [showProbability, setShowProbability] = useState(true)


  // =========================================================
  // FILTERED CANDIDATES
  // =========================================================
  const filteredCandidates = useMemo(() => {
    if (confidenceFilter === 'All') {
      return candidateWetlands
    }

    return candidateWetlands.filter(
      (candidate) =>
        candidate.confidence === confidenceFilter,
    )
  }, [confidenceFilter])


  // =========================================================
  // MODEL SUMMARY
  // =========================================================
  const bestModel = useMemo(() => {
    return [...candidateModelMetrics].sort(
      (a, b) => b.f1 - a.f1,
    )[0]
  }, [])


  const highConfidenceCandidates =
    candidateWetlands.filter(
      (candidate) => candidate.confidence === 'High',
    ).length


  const pendingVerification =
    candidateWetlands.filter(
      (candidate) =>
        !candidate.verificationStatus
          .toLowerCase()
          .includes('verified'),
    ).length


  const averageProbability =
    candidateWetlands.reduce(
      (sum, candidate) =>
        sum + candidate.probability,
      0,
    ) / candidateWetlands.length


  // =========================================================
  // CHART DATA
  // Convert metrics to percentages for easier display.
  // =========================================================
  const modelChartData =
    candidateModelMetrics.map((item) => ({
      model: item.model,
      Precision: Number(
        (item.precision * 100).toFixed(1),
      ),
      Recall: Number(
        (item.recall * 100).toFixed(1),
      ),
      F1: Number(
        (item.f1 * 100).toFixed(1),
      ),
      'PR-AUC': Number(
        (item.prAuc * 100).toFixed(1),
      ),
    }))


  const experimentData =
    candidateFeatureExperiments.map((item) => ({
      featureSet: item.featureSet,
      F1: Number(
        (item.f1 * 100).toFixed(1),
      ),
    }))


  const confidenceVariant = (value) => {
    if (value === 'High') return 'green'
    if (value === 'Moderate') return 'amber'
    return 'slate'
  }


  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="eyebrow">
          Part 1B · Machine Learning
        </div>

        <h1 className="mt-1 text-[24px] font-bold tracking-[-.03em] text-slate-900">
          Candidate Wetland Detection
        </h1>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          Identify additional locations with wetland-like
          environmental characteristics using supervised
          Machine Learning and Kaduwela-wide spatial
          prediction.
        </p>
      </div>


      {/* =====================================================
          KPI CARDS
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={Database}
          label="Reference Wetlands"
          value={wetlands.length}
          subtitle="Known prototype wetlands"
        />

        <SummaryCard
          icon={Radar}
          label="Detected Candidates"
          value={candidateWetlands.length}
          subtitle="Model-derived candidate areas"
        />

        <SummaryCard
          icon={BadgeCheck}
          label="High Confidence"
          value={highConfidenceCandidates}
          subtitle="Candidate confidence"
        />

        <SummaryCard
          icon={MapPinned}
          label="Pending Review"
          value={pendingVerification}
          subtitle="Require external verification"
        />

        <SummaryCard
          icon={BrainCircuit}
          label="Best Prototype Model"
          value={bestModel?.model || '—'}
          subtitle={
            bestModel
              ? `F1 ${(bestModel.f1 * 100).toFixed(1)}%`
              : 'Not available'
          }
        />
      </div>


      {/* =====================================================
          WORKFLOW STRIP
      ===================================================== */}
      <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-800">
          Candidate Detection Workflow
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-700">
          <WorkflowStep text="Reference Polygons" />
          <span>→</span>

          <WorkflowStep text="QGIS Samples" />
          <span>→</span>

          <WorkflowStep text="Feature Extraction" />
          <span>→</span>

          <WorkflowStep text="Training Dataset" />
          <span>→</span>

          <WorkflowStep text="RF / SVM / XGBoost" />
          <span>→</span>

          <WorkflowStep text="Site Validation" />
          <span>→</span>

          <WorkflowStep text="Kaduwela Prediction" />
          <span>→</span>

          <WorkflowStep text="Candidate Polygons" />
        </div>
      </div>


      {/* =====================================================
          FILTER / LAYER CONTROLS
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
          <label>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Confidence Filter
            </span>

            <select
              value={confidenceFilter}
              onChange={(event) =>
                setConfidenceFilter(event.target.value)
              }
              className="control mt-1"
            >
              <option value="All">All Candidates</option>
              <option value="High">High Confidence</option>
              <option value="Moderate">
                Moderate Confidence
              </option>
              <option value="Low">Low Confidence</option>
            </select>
          </label>


          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Map Layers
            </span>

            <div className="mt-2 flex flex-wrap gap-2">
              <LayerToggle
                label="Known Wetlands"
                active={showKnown}
                onClick={() =>
                  setShowKnown((value) => !value)
                }
              />

              <LayerToggle
                label="Candidate Wetlands"
                active={showCandidates}
                onClick={() =>
                  setShowCandidates((value) => !value)
                }
              />

              <LayerToggle
                label="Probability Halo"
                active={showProbability}
                onClick={() =>
                  setShowProbability((value) => !value)
                }
              />
            </div>
          </div>
        </div>
      </div>


      {/* =====================================================
          MAP + CANDIDATE LIST
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="card-pad">
          <div className="mb-4">
            <h2 className="section-title">
              Kaduwela Candidate Wetland Map
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Candidate locations are displayed with their
              prototype wetland probabilities. These areas
              are not treated as confirmed wetlands until
              external evidence supports them.
            </p>
          </div>

          <CandidateWetlandMap
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
            showKnown={showKnown}
            showCandidates={showCandidates}
            showProbability={showProbability}
          />
        </div>


        <div className="card-pad">
          <div className="mb-4">
            <h2 className="section-title">
              Candidate Inventory
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              {filteredCandidates.length} candidate
              {filteredCandidates.length !== 1 ? 's' : ''}{' '}
              shown
            </p>
          </div>


          <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
            {filteredCandidates.map((candidate) => {
              const selected =
                selectedCandidate?.candidateId ===
                candidate.candidateId

              return (
                <button
                  key={candidate.candidateId}
                  type="button"
                  onClick={() =>
                    setSelectedCandidate(candidate)
                  }
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                        {candidate.candidateId}
                      </p>

                      <p className="mt-1 text-[11px] font-bold text-slate-900">
                        {candidate.name}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-500">
                        {candidate.zone}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {(
                          candidate.probability * 100
                        ).toFixed(0)}
                        %
                      </p>

                      <p className="text-[8px] uppercase tracking-wide text-slate-400">
                        Probability
                      </p>
                    </div>
                  </div>


                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      variant={confidenceVariant(
                        candidate.confidence,
                      )}
                    >
                      {candidate.confidence}
                    </Badge>

                    <Badge variant="slate">
                      {candidate.verificationStatus}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>


      {/* =====================================================
          SELECTED CANDIDATE
      ===================================================== */}
      {selectedCandidate && (
        <div className="mt-5 card-pad">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="eyebrow">
                Selected Candidate
              </div>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {selectedCandidate.candidateId} —{' '}
                {selectedCandidate.name}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                {selectedCandidate.zone}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={confidenceVariant(
                  selectedCandidate.confidence,
                )}
              >
                {selectedCandidate.confidence} confidence
              </Badge>

              <Badge variant="blue">
                {selectedCandidate.verificationStatus}
              </Badge>
            </div>
          </div>


          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <CandidateMetric
              label="Wetland Probability"
              value={`${(
                selectedCandidate.probability * 100
              ).toFixed(0)}%`}
            />

            <CandidateMetric
              label="Candidate Area"
              value={`${selectedCandidate.area.toFixed(
                1,
              )} ha`}
            />

            <CandidateMetric
              label="Relative Elevation"
              value={`${selectedCandidate.relativeElevation} m`}
            />

            <CandidateMetric
              label="TWI"
              value={selectedCandidate.twi}
            />

            <CandidateMetric
              label="Canal Distance"
              value={`${selectedCandidate.canalDistance} m`}
            />
          </div>


          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Main Supporting Evidence
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {selectedCandidate.mainEvidence.map(
                (evidence) => (
                  <div
                    key={evidence}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <p className="text-[10px] font-semibold leading-4 text-slate-700">
                      {evidence}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>


          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[10px] font-semibold text-amber-900">
              Candidate ≠ Confirmed Wetland
            </p>

            <p className="mt-1 text-[10px] leading-5 text-amber-800">
              Model probability represents similarity to
              known wetland conditions. Verification status
              remains separate and should be updated using
              KMC GIS, multi-date imagery or field/expert
              evidence where available.
            </p>
          </div>
        </div>
      )}


      {/* =====================================================
          MODEL COMPARISON
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="card-pad">
          <h2 className="section-title">
            Candidate Detection Model Comparison
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Prototype comparison of supervised models using
            site-based validation.
          </p>


          <div className="mt-4 h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={modelChartData}
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
                  dataKey="model"
                  tick={{ fontSize: 9 }}
                />

                <YAxis
                  domain={[0, 100]}
                  unit="%"
                />

                <Tooltip
                  formatter={(value) => `${value}%`}
                />

                <Legend />

                <Bar
                  dataKey="Precision"
                  fill="#0F766E"
                  radius={[3, 3, 0, 0]}
                />

                <Bar
                  dataKey="Recall"
                  fill="#3B82F6"
                  radius={[3, 3, 0, 0]}
                />

                <Bar
                  dataKey="F1"
                  fill="#F59E0B"
                  radius={[3, 3, 0, 0]}
                />

                <Bar
                  dataKey="PR-AUC"
                  fill="#7C3AED"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>


          {bestModel && (
            <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-800">
                Best Prototype Model
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {bestModel.model}
              </p>

              <p className="mt-1 text-[10px] text-slate-600">
                F1 = {(bestModel.f1 * 100).toFixed(1)}% ·
                PR-AUC ={' '}
                {(bestModel.prAuc * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>


        {/* FEATURE ABLATION */}
        <div className="card-pad">
          <h2 className="section-title">
            Feature-Set Experiment
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Tests whether adding drainage and land-context
            information improves candidate-wetland
            classification beyond terrain alone.
          </p>


          <div className="mt-4 h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={experimentData}
                layout="vertical"
                margin={{
                  left: 20,
                  right: 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 5"
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                />

                <YAxis
                  type="category"
                  dataKey="featureSet"
                  width={150}
                  tick={{ fontSize: 9 }}
                />

                <Tooltip
                  formatter={(value) => `${value}%`}
                />

                <Bar
                  dataKey="F1"
                  fill="#0F766E"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>


          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold text-slate-700">
              Research question
            </p>

            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Does combining terrain, drainage and land-use
              context improve identification of urban wetland
              candidates compared with terrain information
              alone?
            </p>
          </div>
        </div>
      </div>


      {/* =====================================================
          TRAINING VS PREDICTION EXPLANATION
      ===================================================== */}
      <div className="mt-5 card-pad">
        <h2 className="section-title">
          Training Data vs Kaduwela-Wide Prediction
        </h2>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          The model is first trained using labelled reference
          samples. QGIS then calculates the same predictor
          features for unknown locations across the KMC area.
          These unlabeled locations are passed to the trained
          model to generate wetland probabilities.
        </p>


        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Database
                size={16}
                className="text-teal-700"
              />

              <p className="text-[11px] font-bold text-slate-900">
                Training Dataset
              </p>
            </div>

            <p className="mt-3 text-[10px] font-mono leading-5 text-slate-600">
              Sample_ID
              <br />
              Site_ID
              <br />
              Elevation
              <br />
              Slope
              <br />
              TWI
              <br />
              Relative_Elevation
              <br />
              Canal_Distance
              <br />
              Land_Context
              <br />
              <b>Label</b>
            </p>

            <p className="mt-3 text-[9px] text-slate-500">
              Contains known labels such as Wetland,
              Paddy, Built-up and other reference classes.
            </p>
          </div>


          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Radar
                size={16}
                className="text-purple-700"
              />

              <p className="text-[11px] font-bold text-slate-900">
                Prediction Dataset
              </p>
            </div>

            <p className="mt-3 text-[10px] font-mono leading-5 text-slate-600">
              Cell_ID
              <br />
              Elevation
              <br />
              Slope
              <br />
              TWI
              <br />
              Relative_Elevation
              <br />
              Canal_Distance
              <br />
              Land_Context
              <br />
              <b>Wetland_Probability</b>
            </p>

            <p className="mt-3 text-[9px] text-slate-500">
              No original wetland label is supplied. The
              validated model predicts probability for the
              unknown Kaduwela locations.
            </p>
          </div>
        </div>
      </div>


      {/* =====================================================
          NOTICE
      ===================================================== */}
      <div className="mt-5 data-note">
        <b>Prototype Demo —</b> candidate locations,
        probabilities, model metrics and feature-set results
        shown on this page are mock demonstration values.
        Final outputs will be produced from QGIS-derived
        features, site-based validation and Python Machine
        Learning experiments.
      </div>
    </div>
  )
}


// ===========================================================
// SMALL COMPONENTS
// ===========================================================

function SummaryCard({
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


function WorkflowStep({ text }) {
  return (
    <span className="rounded-lg border border-white bg-white px-3 py-2 shadow-sm">
      {text}
    </span>
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


function CandidateMetric({
  label,
  value,
}) {
  return (
    <div className="soft-panel">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}