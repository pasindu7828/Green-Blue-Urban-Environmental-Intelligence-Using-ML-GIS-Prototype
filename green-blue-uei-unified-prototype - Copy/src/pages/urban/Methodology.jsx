import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileCheck2,
  GitBranch,
  Layers3,
  Map,
  MapPinned,
  Network,
  Route,
  Satellite,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Split,
  Target,
  Trees,
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

import {
  DisclaimerBadges,
  PageHeader,
} from '../../components/shared/UrbanUI'

import {
  modelPerformance,
} from '../../data/urbanData'

// ============================================================
// MODEL COMPARISON
// ============================================================

const fallbackModelData = [
  {
    model: 'Logistic Regression',
    rocAuc: 78,
    f1: 73,
  },

  {
    model: 'Random Forest',
    rocAuc: 86,
    f1: 81,
  },

  {
    model: 'XGBoost',
    rocAuc: 90,
    f1: 85,
  },
]

function normalizeModelPerformance() {
  if (
    !Array.isArray(
      modelPerformance,
    ) ||
    !modelPerformance.length
  ) {
    return fallbackModelData
  }

  return modelPerformance.map(
    (item) => {
      const rawName =
        item.model ||
        item.name ||
        'Model'

      const model =
        rawName === 'LR'
          ? 'Logistic Regression'
          : rawName === 'RF'
            ? 'Random Forest'
            : rawName === 'XGB'
              ? 'XGBoost'
              : rawName

      const rawRoc =
        Number(
          item.rocAuc ??
            item.auc ??
            0,
        )

      const rawF1 =
        Number(
          item.f1 ??
            item.f1Score ??
            0,
        )

      return {
        model,

        rocAuc:
          rawRoc <= 1
            ? Math.round(
                rawRoc *
                  100,
              )
            : Math.round(
                rawRoc,
              ),

        f1:
          rawF1 <= 1
            ? Math.round(
                rawF1 *
                  100,
              )
            : Math.round(
                rawF1,
              ),
      }
    },
  )
}

// ============================================================
// DATA SOURCES
// ============================================================

const dataSources = [
  {
    icon: Satellite,
    title:
      'Satellite Images',
    source:
      'Sentinel / Landsat',
    text:
      'Used to identify green cover, built-up areas and historical land-cover change.',
  },

  {
    icon: MapPinned,
    title:
      'Roads & Buildings',
    source:
      'OSM / Local Planning Data',
    text:
      'Used to represent accessibility, surrounding development and urban structure.',
  },

  {
    icon: Layers3,
    title:
      'Planning Information',
    source:
      'KMC / UDA',
    text:
      'Used for development suitability and planning-constraint assessment.',
  },

  {
    icon: Map,
    title:
      'Terrain Data',
    source:
      'Digital Elevation Model',
    text:
      'Used to calculate elevation and slope conditions.',
  },

  {
    icon: Trees,
    title:
      'Green Characteristics',
    source:
      'Derived Spatial Indicators',
    text:
      'Used to measure remaining green value, persistence, connectivity and historical loss.',
  },
]

// ============================================================
// WORKFLOW
// ============================================================

const workflow = [
  {
    number: '01',
    icon: Database,
    title:
      'Prepare Spatial Data',
    text:
      'Collect satellite, road, building, terrain and planning information for the study area.',
  },

  {
    number: '02',
    icon: Satellite,
    title:
      'Measure Past Change',
    text:
      'Compare 2015, 2020 and 2025 to identify green loss, built-up growth and green-to-built transition.',
  },

  {
    number: '03',
    icon: Network,
    title:
      'Create Model Features',
    text:
      'Calculate road access, building density, nearby built-up development, previous growth and other spatial indicators.',
  },

  {
    number: '04',
    icon: BrainCircuit,
    title:
      'Predict Future Pressure',
    text:
      'Train and compare machine-learning models to estimate urbanization pressure for 2026–2035.',
  },

  {
    number: '05',
    icon: Scale,
    title:
      'Assess Suitability',
    text:
      'Evaluate where development is more appropriate using GIS-based multi-criteria analysis.',
  },

  {
    number: '06',
    icon: Target,
    title:
      'Create Planning Intelligence',
    text:
      'Combine forecast pressure, suitability and green value to identify conservation, conflict and intervention priorities.',
  },
]

// ============================================================
// VALIDATION METHODS
// ============================================================

const validationMethods = [
  {
    icon: Split,
    title:
      'Time-Based Validation',
    technical:
      'Temporal validation',
    text:
      'Older years are used for training and later years are used for testing. This better represents a real future prediction.',
  },

  {
    icon: MapPinned,
    title:
      'Location-Based Testing',
    technical:
      'Spatial validation',
    text:
      'The model is also checked on different locations to see whether it works beyond the areas it learned from.',
  },

  {
    icon: ShieldCheck,
    title:
      'Prevent Future Information Leakage',
    technical:
      'Leakage control',
    text:
      'Information from the future is not allowed to enter the training data used to predict that future.',
  },

  {
    icon: SlidersHorizontal,
    title:
      'Check Probability Reliability',
    technical:
      'Probability calibration',
    text:
      'Predicted probabilities are checked so that a higher probability represents genuinely higher observed risk.',
  },
]

// ============================================================
// EVALUATION METRICS
// ============================================================

const metrics = [
  {
    title: 'ROC-AUC',
    question:
      'Can the model separate higher-risk and lower-risk locations?',
  },

  {
    title: 'F1 Score',
    question:
      'Does the model balance finding risky areas with avoiding too many incorrect alerts?',
  },

  {
    title: 'Precision',
    question:
      'When the model identifies a risky area, how often is it correct?',
  },

  {
    title: 'Recall',
    question:
      'How many of the actual risky areas can the model successfully identify?',
  },
]

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function UrbanMethodology() {
  const modelData =
    normalizeModelPerformance()

  return (
    <div>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <PageHeader
        eyebrow="Research Methodology & Validation"
        title="How Is the System Built and Tested?"
        subtitle="A simple overview of the data, analysis, prediction, planning assessment and validation process used in this research component."
        right={
          <span className="badge-green">
            2015–2035 Framework
          </span>
        }
      />

      <DisclaimerBadges />

      {/* ===================================================== */}
      {/* SIMPLE RESEARCH FLOW */}
      {/* ===================================================== */}

      <section className="card-pad mt-4">
        <div>
          <h2 className="section-title">
            Research Process
          </h2>

          <p className="muted mt-1">
            The system moves from
            historical spatial data to
            future prediction and then
            converts those results into
            planning intelligence.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {workflow.map(
            (
              step,
              index,
            ) => (
              <div
                key={
                  step.number
                }
                className="relative"
              >
                <WorkflowCard
                  step={step}
                />

                {index <
                  workflow.length -
                    1 && (
                  <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 xl:block">
                    <div className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white">
                      <ArrowRight
                        size={11}
                        className="text-slate-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </section>

      {/* ===================================================== */}
      {/* TIMELINE */}
      {/* ===================================================== */}

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="section-title">
            Time Structure
          </h2>

          <p className="muted mt-1">
            Historical years are used
            to understand change and
            train the forecasting
            process. Future years are
            then predicted from the
            2025 baseline.
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          {/* HISTORICAL */}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Historical Analysis
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <YearBox
                year="2015"
              />

              <ArrowRight
                size={14}
                className="text-emerald-400"
              />

              <YearBox
                year="2020"
              />

              <ArrowRight
                size={14}
                className="text-emerald-400"
              />

              <YearBox
                year="2025"
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-emerald-800">
              Used to identify past
              green-cover transition,
              urban expansion and the
              spatial patterns linked
              with development.
            </p>
          </div>

          {/* TRANSITION */}

          <div className="hidden items-center justify-center lg:flex">
            <ArrowRight
              size={22}
              className="text-slate-300"
            />
          </div>

          {/* FORECAST */}

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700">
              Future Forecasting
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm">
                <div className="text-[9px] text-slate-400">
                  Baseline
                </div>

                <div className="mt-1 text-lg font-bold text-slate-900">
                  2025
                </div>
              </div>

              <ArrowRight
                size={15}
                className="text-orange-400"
              />

              <div className="flex-1 rounded-xl bg-white px-4 py-3 text-center shadow-sm">
                <div className="text-[9px] text-slate-400">
                  Forecast Years
                </div>

                <div className="mt-1 text-lg font-bold text-orange-800">
                  2026–2035
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-orange-800">
              The forecasting model
              estimates the probability
              of future urbanization
              pressure for each spatial
              grid cell.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* DATA SOURCES */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            What Data Is Used?
          </h2>

          <p className="muted mt-1">
            Different spatial data
            sources describe land-cover
            change, accessibility,
            existing development,
            terrain and planning
            conditions.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {dataSources.map(
            (item) => (
              <DataSourceCard
                key={
                  item.title
                }
                item={item}
              />
            ),
          )}
        </div>
      </section>

      {/* ===================================================== */}
      {/* FORECASTING METHOD */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="grid gap-7 xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* EXPLANATION */}

          <div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-700">
              <BrainCircuit
                size={20}
              />
            </div>

            <h2 className="mt-4 section-title">
              How Is Future Pressure
              Predicted?
            </h2>

            <p className="muted mt-2 leading-6">
              The research treats
              urbanization as a spatial
              prediction problem.
              Historical locations that
              changed from non-built
              land to built-up land are
              used to learn the patterns
              associated with future
              conversion.
            </p>

            <div className="mt-5 space-y-3">
              <MethodPoint
                number="1"
                title="Create the target"
                text="Identify whether a previously non-built location changed to built-up."
              />

              <MethodPoint
                number="2"
                title="Create predictor features"
                text="Use road access, nearby buildings, previous growth, land-cover indicators and other spatial characteristics."
              />

              <MethodPoint
                number="3"
                title="Compare models"
                text="Logistic Regression, Random Forest and XGBoost are compared."
              />

              <MethodPoint
                number="4"
                title="Generate probability"
                text="The selected model produces an urbanization-pressure probability for each grid cell."
              />
            </div>
          </div>

          {/* MODEL COMPARISON */}

          <div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Prototype Model
                Comparison
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Higher values indicate
                better prototype
                predictive performance.
              </p>
            </div>

            <div className="mt-5 h-[330px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    modelData
                  }
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="model"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    domain={[
                      0,
                      100,
                    ]}
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    formatter={(
                      value,
                    ) =>
                      `${value}%`
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="rocAuc"
                    name="ROC-AUC"
                    fill="#657f91"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="f1"
                    name="F1 Score"
                    fill="#7fae91"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-[10px] leading-5 text-slate-500">
              These values are
              prototype demonstration
              results. Final research
              performance must come from
              the completed training and
              validation process.
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* VALIDATION */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            How Do We Check That the
            Prediction Is Reliable?
          </h2>

          <p className="muted mt-1">
            The model is tested in ways
            that represent both future
            time periods and different
            geographic locations.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {validationMethods.map(
            (item) => (
              <ValidationCard
                key={
                  item.title
                }
                item={item}
              />
            ),
          )}
        </div>

        {/* SIMPLE VALIDATION FLOW */}

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex-1 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wide text-blue-600">
                Learn From
              </div>

              <div className="mt-2 text-lg font-bold text-blue-950">
                Older Data
              </div>
            </div>

            <ArrowRight
              className="mx-auto text-blue-400"
              size={18}
            />

            <div className="flex-1 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wide text-blue-600">
                Validate On
              </div>

              <div className="mt-2 text-lg font-bold text-blue-950">
                Later Data
              </div>
            </div>

            <ArrowRight
              className="mx-auto text-blue-400"
              size={18}
            />

            <div className="flex-1 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wide text-blue-600">
                Also Test
              </div>

              <div className="mt-2 text-lg font-bold text-blue-950">
                Different Locations
              </div>
            </div>

            <ArrowRight
              className="mx-auto text-blue-400"
              size={18}
            />

            <div className="flex-1 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wide text-blue-600">
                Final Goal
              </div>

              <div className="mt-2 text-lg font-bold text-blue-950">
                Reliable Future
                Prediction
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* METRICS */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            How Is Model Performance
            Measured?
          </h2>

          <p className="muted mt-1">
            Several measures are used
            because one score alone
            cannot fully describe model
            quality.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(
            (item) => (
              <MetricCard
                key={
                  item.title
                }
                item={item}
              />
            ),
          )}
        </div>
      </section>

      {/* ===================================================== */}
      {/* PLANNING METHODS */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            How Are the Planning
            Outputs Created?
          </h2>

          <p className="muted mt-1">
            Forecasting is only one part
            of the research. Separate
            planning assessments are
            combined afterwards.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <PlanningMethodCard
            icon={TrendingIcon}
            number="01"
            title="Urbanization Pressure"
            subtitle="What may happen?"
            text="Machine learning estimates where future urban development pressure is more likely."
            tone="orange"
          />

          <PlanningMethodCard
            icon={Scale}
            number="02"
            title="Development Suitability"
            subtitle="Where is development more appropriate?"
            text="GIS-MCDA/AHP evaluates planning conditions, accessibility, terrain and related factors independently from the forecast."
            tone="blue"
          />

          <PlanningMethodCard
            icon={Trees}
            number="03"
            title="Green Conservation Priority"
            subtitle="What green areas need attention?"
            text="Remaining green value is combined with future urbanization pressure to identify threatened green areas."
            tone="green"
          />

          <PlanningMethodCard
            icon={GitBranch}
            number="04"
            title="Conflict & Intervention"
            subtitle="Where should planners look first?"
            text="Forecast pressure, suitability and conservation information are compared to identify planning conflicts and intervention priorities."
            tone="red"
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* IMPORTANT PRINCIPLE */}
      {/* ===================================================== */}

      <section className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-700">
              <CheckCircle2
                size={20}
              />
            </div>

            <div>
              <div className="text-sm font-bold text-emerald-950">
                Prediction and planning
                suitability are kept
                separate.
              </div>

              <p className="mt-1 max-w-3xl text-xs leading-5 text-emerald-800">
                A location can have high
                future urbanization
                pressure without being a
                suitable place for
                development. Keeping
                these assessments
                independent makes the
                final planning
                intelligence more
                meaningful.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-white px-4 py-3">
            <span className="text-xs font-bold text-orange-700">
              What may happen?
            </span>

            <span className="text-slate-400">
              ≠
            </span>

            <span className="text-xs font-bold text-blue-700">
              What is appropriate?
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FINAL TAKEAWAY */}
      {/* ===================================================== */}

      <section className="mt-7 rounded-2xl border border-purple-200 bg-purple-50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-purple-700">
              <FileCheck2
                size={18}
              />
            </div>

            <div>
              <div className="text-sm font-bold text-purple-950">
                The goal is not only to
                create a prediction, but
                to create a prediction
                that can be tested,
                explained and used for
                planning.
              </div>

              <p className="mt-1 text-xs leading-5 text-purple-800">
                Historical evidence,
                machine learning,
                validation,
                explainability and
                independent planning
                assessments work
                together as one research
                framework.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-white px-4 py-3">
            <span className="text-xs font-semibold text-slate-700">
              Data
            </span>

            <ArrowRight
              size={12}
              className="text-slate-400"
            />

            <span className="text-xs font-semibold text-purple-700">
              Prediction
            </span>

            <ArrowRight
              size={12}
              className="text-slate-400"
            />

            <span className="text-xs font-semibold text-blue-700">
              Validation
            </span>

            <ArrowRight
              size={12}
              className="text-slate-400"
            />

            <span className="text-xs font-bold text-emerald-700">
              Planning Intelligence
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

// ============================================================
// WORKFLOW CARD
// ============================================================

function WorkflowCard({
  step,
}) {
  const Icon =
    step.icon

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
          <Icon
            size={16}
          />
        </div>

        <span className="text-[10px] font-black text-slate-300">
          {step.number}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {step.title}
      </h3>

      <p className="mt-2 text-[10px] leading-5 text-slate-500">
        {step.text}
      </p>
    </div>
  )
}

// ============================================================
// YEAR BOX
// ============================================================

function YearBox({
  year,
}) {
  return (
    <div className="flex-1 rounded-xl bg-white px-3 py-3 text-center shadow-sm">
      <div className="text-lg font-bold text-emerald-900">
        {year}
      </div>
    </div>
  )
}

// ============================================================
// DATA SOURCE CARD
// ============================================================

function DataSourceCard({
  item,
}) {
  const Icon =
    item.icon

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon
          size={17}
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {item.title}
      </h3>

      <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
        {item.source}
      </div>

      <p className="mt-3 text-[10px] leading-5 text-slate-500">
        {item.text}
      </p>
    </div>
  )
}

// ============================================================
// METHOD POINT
// ============================================================

function MethodPoint({
  number,
  title,
  text,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
        {number}
      </div>

      <div>
        <div className="text-xs font-bold text-slate-800">
          {title}
        </div>

        <p className="mt-1 text-[10px] leading-4 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  )
}

// ============================================================
// VALIDATION CARD
// ============================================================

function ValidationCard({
  item,
}) {
  const Icon =
    item.icon

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
        <Icon
          size={17}
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {item.title}
      </h3>

      <div className="mt-1 text-[9px] font-semibold text-blue-600">
        {item.technical}
      </div>

      <p className="mt-3 text-[10px] leading-5 text-slate-500">
        {item.text}
      </p>
    </div>
  )
}

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  item,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <BarChart3
            size={16}
          />
        </div>

        <div className="text-lg font-bold text-slate-900">
          {item.title}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-600">
        {item.question}
      </p>
    </div>
  )
}

// ============================================================
// PLANNING METHOD CARD
// ============================================================

function PlanningMethodCard({
  icon: Icon,
  number,
  title,
  subtitle,
  text,
  tone,
}) {
  const tones = {
    orange: {
      card:
        'border-orange-200 bg-orange-50',

      icon:
        'bg-white text-orange-700',

      label:
        'text-orange-700',
    },

    blue: {
      card:
        'border-blue-200 bg-blue-50',

      icon:
        'bg-white text-blue-700',

      label:
        'text-blue-700',
    },

    green: {
      card:
        'border-emerald-200 bg-emerald-50',

      icon:
        'bg-white text-emerald-700',

      label:
        'text-emerald-700',
    },

    red: {
      card:
        'border-red-200 bg-red-50',

      icon:
        'bg-white text-red-700',

      label:
        'text-red-700',
    },
  }

  const style =
    tones[tone]

  return (
    <div
      className={`rounded-2xl border p-5 ${style.card}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${style.icon}`}
        >
          <Icon
            size={17}
          />
        </div>

        <span className="text-[10px] font-black opacity-40">
          {number}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {title}
      </h3>

      <div
        className={`mt-1 text-[10px] font-bold ${style.label}`}
      >
        {subtitle}
      </div>

      <p className="mt-3 text-[10px] leading-5 text-slate-600">
        {text}
      </p>
    </div>
  )
}

// ============================================================
// SIMPLE ICON WRAPPER
// ============================================================

function TrendingIcon({
  size = 17,
}) {
  return (
    <BarChart3
      size={size}
    />
  )
}