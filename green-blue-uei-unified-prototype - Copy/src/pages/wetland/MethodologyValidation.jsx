import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Database,
  Eye,
  Map,
  Satellite,
  ShieldCheck,
  Workflow,
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

import {
  candidateModelMetrics,
  futureValidation,
  methodologySummary,
  waterloggingModelMetrics,
} from '../../data/wetlandData'


export default function MethodologyValidation() {
  const candidateChartData = candidateModelMetrics.map(
    (item) => ({
      model: item.model,
      F1: Number((item.f1 * 100).toFixed(1)),
      'PR-AUC': Number(
        (item.prAuc * 100).toFixed(1),
      ),
    }),
  )


  const waterloggingChartData =
    waterloggingModelMetrics.map((item) => ({
      model: item.model,
      F1: Number((item.f1 * 100).toFixed(1)),
      'PR-AUC': Number(
        (item.prAuc * 100).toFixed(1),
      ),
    }))


  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="eyebrow">
          Research Design
        </div>

        <h1 className="mt-1 text-[24px] font-bold tracking-[-.03em] text-slate-900">
          Methodology & Validation
        </h1>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          Overview of the data sources, GIS processing,
          Machine Learning models, spatial modelling,
          validation procedures, explainability and
          uncertainty used within the Kaduwela Wetland
          Intelligence System.
        </p>
      </div>


      {/* =====================================================
          OVERALL RESEARCH WORKFLOW
      ===================================================== */}
      <div className="card-pad">
        <div className="flex items-center gap-2">
          <Workflow
            size={17}
            className="text-teal-700"
          />

          <h2 className="section-title">
            Overall Research Framework
          </h2>
        </div>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          The study combines historical wetland analysis,
          automated candidate detection, future spatial
          projection and seasonal waterlogging susceptibility
          within one municipal-scale geospatial framework.
        </p>


        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          <ResearchPart
            number="Part 1A"
            title="Historical Wetland Change"
            description="Reconstruct multi-temporal wetland boundaries and quantify area change, fragmentation, loss, gain and observed land transitions."
            steps={[
              'Google Earth Pro',
              'Historical polygons',
              'QGIS',
              'Area + fragmentation',
              'Gain / loss overlay',
              'Land transitions',
            ]}
          />

          <ResearchPart
            number="Part 1B"
            title="Candidate Wetland Detection"
            description="Train supervised models using known wetland and non-wetland reference samples and predict wetland probability across Kaduwela."
            steps={[
              'Reference polygons',
              'QGIS sampling',
              'Feature engineering',
              'RF / SVM / XGBoost',
              'Site validation',
              'Candidate map',
            ]}
          />

          <ResearchPart
            number="Part 1C"
            title="Future Wetland Projection"
            description="Model spatial land transitions and generate scenario-based future wetland boundaries after historical hindcast validation."
            steps={[
              'Historical land maps',
              'Raster alignment',
              'Transition matrix',
              'CA-Markov',
              'Hindcasting',
              'Future polygon',
            ]}
          />

          <ResearchPart
            number="Part 2"
            title="Waterlogging Susceptibility"
            description="Estimate recurring seasonal waterlogging susceptibility using terrain, drainage, urban, rainfall and historical event evidence."
            steps={[
              'Terrain features',
              'Drainage',
              'Urban context',
              'Rainfall + events',
              'ML prediction',
              'SHAP explanation',
            ]}
          />
        </div>
      </div>


      {/* =====================================================
          DATA SOURCES
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex items-center gap-2">
          <Database
            size={17}
            className="text-teal-700"
          />

          <h2 className="section-title">
            Main Data Sources
          </h2>
        </div>


        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DataSource
            icon={Satellite}
            title="Google Earth Pro"
            role="High-resolution historical and current visual reference for wetland-boundary interpretation."
          />

          <DataSource
            icon={Map}
            title="KMC GIS Data"
            role="Wetlands, land use, drainage, lowlands, roads and supporting municipal spatial information where available."
          />

          <DataSource
            icon={Map}
            title="DEM / DTM"
            role="Elevation source used to derive slope, relative elevation, flow accumulation, TWI and depression indicators."
          />

          <DataSource
            icon={Database}
            title="Historical Waterlogging Records"
            role="Municipal event locations, dates, complaints or recurrent problem-area evidence where available."
          />

          <DataSource
            icon={Database}
            title="Rainfall"
            role="Observed historical rainfall and antecedent rainfall variables for event-based waterlogging modelling."
          />

          <DataSource
            icon={Map}
            title="Urban & Drainage Context"
            role="Built-up surfaces, roads, canals, drains, outlets and related contextual predictors."
          />
        </div>
      </div>


      {/* =====================================================
          SOFTWARE / PROCESSING RESPONSIBILITY
      ===================================================== */}
      <div className="mt-5 card-pad">
        <h2 className="section-title">
          Software & Processing Responsibilities
        </h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <ToolCard
            title="Google Earth Pro"
            badge="Visual Interpretation"
            items={[
              'Historical imagery inspection',
              'Image-date selection',
              'Wetland-boundary digitization',
              'Multi-date visual evidence',
            ]}
          />

          <ToolCard
            title="QGIS"
            badge="Spatial Data Engineering"
            items={[
              'CRS and geometry preparation',
              'Area and fragmentation metrics',
              'Spatial overlay and land transitions',
              'DEM terrain derivatives',
              'Sampling and feature extraction',
              'Prediction-map post-processing',
            ]}
          />

          <ToolCard
            title="Python / VS Code"
            badge="Data Science"
            items={[
              'Data cleaning',
              'Model training',
              'Hyperparameter tuning',
              'Model comparison',
              'Spatial validation',
              'Probability prediction',
              'Explainability',
              'Future spatial modelling support',
            ]}
          />
        </div>
      </div>


      {/* =====================================================
          DATASET ARCHITECTURE
      ===================================================== */}
      <div className="mt-5 card-pad">
        <h2 className="section-title">
          Research Dataset Architecture
        </h2>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          The project does not use one large CSV. Different
          spatial and tabular datasets are maintained for
          different analytical tasks.
        </p>


        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DatasetCard
            file="wetland_history.csv"
            role="Historical wetland observations, area and fragmentation."
          />

          <DatasetCard
            file="wetland_change.csv"
            role="Gross loss, gain, net change and interval change."
          />

          <DatasetCard
            file="wetland_transitions.csv"
            role="Observed land-use transitions within wetland-loss areas."
          />

          <DatasetCard
            file="candidate_wetland_samples.csv"
            role="Labelled training samples for candidate-wetland classification."
          />

          <DatasetCard
            file="terrain_lowland_features.csv"
            role="Static terrain, drainage and urban-context variables."
          />

          <DatasetCard
            file="waterlogging_model_dataset.csv"
            role="Event/zone-level predictors and waterlogging labels."
          />
        </div>


        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-700">
            Spatial outputs
          </p>

          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Historical wetland polygons, candidate-wetland
            probability outputs, future projection rasters,
            future wetland polygons and waterlogging
            susceptibility layers are retained as GIS
            datasets such as GeoPackage, raster and GeoJSON,
            rather than reducing every spatial result to CSV.
          </p>
        </div>
      </div>


      {/* =====================================================
          MODEL DESIGN
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="card-pad">
          <div className="flex items-center gap-2">
            <BrainCircuit
              size={16}
              className="text-purple-700"
            />

            <h2 className="section-title">
              Candidate Wetland Models
            </h2>
          </div>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Prototype supervised-model comparison for Part
            1B. Final model selection depends on validated
            research results.
          </p>


          <div className="mt-4 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={candidateChartData}
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
                  formatter={(value) =>
                    `${value}%`
                  }
                />

                <Legend />

                <Bar
                  dataKey="F1"
                  fill="#0F766E"
                />

                <Bar
                  dataKey="PR-AUC"
                  fill="#7C3AED"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>


          <div className="mt-3 flex flex-wrap gap-2">
            {methodologySummary.part1B.models.map(
              (model) => (
                <Badge
                  key={model}
                  variant="blue"
                >
                  {model}
                </Badge>
              ),
            )}
          </div>
        </div>


        <div className="card-pad">
          <div className="flex items-center gap-2">
            <BrainCircuit
              size={16}
              className="text-purple-700"
            />

            <h2 className="section-title">
              Waterlogging Models
            </h2>
          </div>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Prototype comparison of classification methods
            used to estimate seasonal waterlogging
            susceptibility.
          </p>


          <div className="mt-4 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={waterloggingChartData}
              >
                <CartesianGrid
                  strokeDasharray="4 5"
                />

                <XAxis
                  dataKey="model"
                  tick={{ fontSize: 8 }}
                />

                <YAxis
                  domain={[0, 100]}
                  unit="%"
                />

                <Tooltip
                  formatter={(value) =>
                    `${value}%`
                  }
                />

                <Legend />

                <Bar
                  dataKey="F1"
                  fill="#0F766E"
                />

                <Bar
                  dataKey="PR-AUC"
                  fill="#7C3AED"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>


          <div className="mt-3 flex flex-wrap gap-2">
            {methodologySummary.part2.models.map(
              (model) => (
                <Badge
                  key={model}
                  variant="blue"
                >
                  {model}
                </Badge>
              ),
            )}
          </div>
        </div>
      </div>


      {/* =====================================================
          VALIDATION STRATEGY
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={17}
            className="text-green-700"
          />

          <h2 className="section-title">
            Validation Strategy
          </h2>
        </div>


        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ValidationCard
            number="01"
            title="Historical Wetland Evidence"
            description="Image quality, seasonal comparability, multi-date consistency and KMC or expert evidence where available."
          />

          <ValidationCard
            number="02"
            title="Candidate Wetland Detection"
            description="Hold out complete sites or wetland locations rather than randomly splitting nearby pixels from the same location."
          />

          <ValidationCard
            number="03"
            title="Future Projection"
            description="Predict a historical year that is already known and compare the simulated spatial boundary against the observed boundary."
          />

          <ValidationCard
            number="04"
            title="Waterlogging"
            description="Use spatial validation and temporal validation when event history is sufficient, avoiding leakage between neighbouring zones."
          />
        </div>
      </div>


      {/* =====================================================
          FUTURE HINDCAST EXAMPLE
      ===================================================== */}
      <div className="mt-5 card-pad">
        <h2 className="section-title">
          Future-Projection Hindcast Evidence
        </h2>

        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-slate-500">
          Prototype hindcast metrics demonstrate how future
          spatial projections will be evaluated before they
          are presented as planning evidence.
        </p>


        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[9px] uppercase tracking-wide text-slate-500">
                <th className="pb-3">
                  Wetland
                </th>

                <th className="pb-3">
                  Hindcast
                </th>

                <th className="pb-3">
                  IoU
                </th>

                <th className="pb-3">
                  Precision
                </th>

                <th className="pb-3">
                  Recall
                </th>

                <th className="pb-3">
                  F1
                </th>

                <th className="pb-3">
                  Area Error
                </th>
              </tr>
            </thead>


            <tbody>
              {futureValidation.map(
                (item) => (
                  <tr
                    key={item.wetlandId}
                    className="border-b border-slate-100 text-[10px] text-slate-700"
                  >
                    <td className="py-3 font-bold">
                      {item.wetlandId}
                    </td>

                    <td className="py-3">
                      {item.hindcastYear}
                    </td>

                    <td className="py-3">
                      {(
                        item.iou * 100
                      ).toFixed(1)}
                      %
                    </td>

                    <td className="py-3">
                      {(
                        item.precision * 100
                      ).toFixed(1)}
                      %
                    </td>

                    <td className="py-3">
                      {(
                        item.recall * 100
                      ).toFixed(1)}
                      %
                    </td>

                    <td className="py-3">
                      {(
                        item.f1 * 100
                      ).toFixed(1)}
                      %
                    </td>

                    <td className="py-3">
                      {item.areaErrorPercent.toFixed(
                        1,
                      )}
                      %
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* =====================================================
          EXPLAINABILITY
      ===================================================== */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card-pad">
          <div className="flex items-center gap-2">
            <Eye
              size={16}
              className="text-purple-700"
            />

            <h2 className="section-title">
              Model Explainability
            </h2>
          </div>


          <div className="mt-4 space-y-3">
            <MethodItem
              title="Feature-set experiments"
              description="Compare terrain-only models with models that additionally include drainage and land-context variables."
            />

            <MethodItem
              title="Feature importance"
              description="Identify variables that contribute most strongly to prediction at the overall model level."
            />

            <MethodItem
              title="SHAP"
              description="Explain both global model behaviour and why an individual waterlogging zone receives a particular prediction."
            />

            <MethodItem
              title="Probability-based outputs"
              description="Retain continuous model probability before converting predictions into communication-friendly classes."
            />
          </div>
        </div>


        <div className="card-pad">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-teal-700"
            />

            <h2 className="section-title">
              Confidence & Uncertainty
            </h2>
          </div>


          <div className="mt-4 space-y-3">
            <MethodItem
              title="Historical boundaries"
              description="Confidence considers imagery clarity, seasonal context, multi-date consistency and supporting reference evidence."
            />

            <MethodItem
              title="Candidate wetlands"
              description="Model probability and verification status are kept separate. High probability does not mean officially verified wetland."
            />

            <MethodItem
              title="Future projection"
              description="Projection confidence depends on hindcast performance and the quality and consistency of historical land-change data."
            />

            <MethodItem
              title="Waterlogging"
              description="Susceptibility probability and model confidence are communicated separately from exact event occurrence."
            />
          </div>
        </div>
      </div>


      {/* =====================================================
          SAFE INTERPRETATION
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="flex items-center gap-2">
          <AlertTriangle
            size={17}
            className="text-amber-600"
          />

          <h2 className="section-title">
            Interpretation Boundaries
          </h2>
        </div>


        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SafeClaim
            title="Candidate Wetland"
            description="A model-discovered location with wetland-like characteristics, not an automatically confirmed or legally designated wetland."
          />

          <SafeClaim
            title="Historical Transition"
            description="Shows what land cover is subsequently observed in a mapped loss area; it does not independently establish causation."
          />

          <SafeClaim
            title="Future Boundary"
            description="A spatial projection under a defined scenario, not an exact or guaranteed future wetland boundary."
          />

          <SafeClaim
            title="Waterlogging Susceptibility"
            description="Represents relative tendency or susceptibility, not exact flood depth, duration or event timing."
          />
        </div>
      </div>


      {/* =====================================================
          LIMITATIONS
      ===================================================== */}
      <div className="mt-5 card-pad">
        <h2 className="section-title">
          Key Research Limitations
        </h2>


        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <Limitation
            title="Historical imagery"
            text="Google Earth Pro dates, image quality and seasonal conditions are not completely uniform across all years."
          />

          <Limitation
            title="DEM resolution"
            text="Public coarse-resolution elevation data may describe broad lowlands but may miss curbs, culverts, narrow drains and urban micro-depressions."
          />

          <Limitation
            title="Municipal event records"
            text="Reported waterlogging locations may be incomplete. Absence of a complaint or record should not automatically be interpreted as absence of waterlogging."
          />

          <Limitation
            title="Future uncertainty"
            text="Future land-change patterns depend on development, policy, drainage modifications and other conditions that may differ from historical trends."
          />
        </div>
      </div>


      {/* =====================================================
          DS POSITION
      ===================================================== */}
      <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
        <div className="flex items-center gap-2">
          <BrainCircuit
            size={16}
            className="text-purple-700"
          />

          <p className="text-[10px] font-bold uppercase tracking-wide text-purple-800">
            Data Science Contribution
          </p>
        </div>

        <p className="mt-2 max-w-5xl text-[10px] leading-5 text-purple-800">
          The component operates as a Spatial Data Science
          workflow combining spatial feature engineering,
          supervised classification, model comparison,
          hyperparameter tuning, site-based and spatial
          validation, probability prediction, feature-set
          experiments, future spatial modelling and
          explainable waterlogging susceptibility analysis.
          GIS tools support spatial data preparation and
          visualization, while predictive modelling and
          evaluation form the main Data Science layer.
        </p>
      </div>


      {/* =====================================================
          PROTOTYPE NOTICE
      ===================================================== */}
      <div className="mt-5 data-note">
        <b>Prototype Demo —</b> model-performance values,
        hindcast metrics and other numerical results displayed
        on this page are mock demonstration values. The final
        methodology remains subject to data availability,
        pilot testing and validation using actual research
        datasets.
      </div>
    </div>
  )
}


// ===========================================================
// SMALL COMPONENTS
// ===========================================================

function ResearchPart({
  number,
  title,
  description,
  steps,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <Badge variant="blue">
        {number}
      </Badge>

      <h3 className="mt-3 text-[12px] font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-[9px] leading-5 text-slate-500">
        {description}
      </p>


      <div className="mt-4 space-y-1.5">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-2 text-[9px] text-slate-600"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white font-bold text-teal-700">
              {index + 1}
            </span>

            {step}
          </div>
        ))}
      </div>
    </div>
  )
}


function DataSource({
  icon: Icon,
  title,
  role,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <Icon
        size={18}
        className="text-teal-700"
      />

      <p className="mt-3 text-[11px] font-bold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-5 text-slate-500">
        {role}
      </p>
    </div>
  )
}


function ToolCard({
  title,
  badge,
  items,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[12px] font-bold text-slate-900">
        {title}
      </p>

      <div className="mt-2">
        <Badge variant="blue">
          {badge}
        </Badge>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2"
          >
            <CheckCircle2
              size={13}
              className="mt-[2px] shrink-0 text-teal-600"
            />

            <p className="text-[9px] leading-4 text-slate-600">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}


function DatasetCard({
  file,
  role,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <Database
        size={16}
        className="text-teal-700"
      />

      <p className="mt-3 break-all font-mono text-[10px] font-bold text-slate-800">
        {file}
      </p>

      <p className="mt-2 text-[9px] leading-4 text-slate-500">
        {role}
      </p>
    </div>
  )
}


function ValidationCard({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold text-teal-700">
        {number}
      </p>

      <p className="mt-2 text-[11px] font-bold text-slate-900">
        {title}
      </p>

      <p className="mt-2 text-[9px] leading-5 text-slate-500">
        {description}
      </p>
    </div>
  )
}


function MethodItem({
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-slate-500">
        {description}
      </p>
    </div>
  )
}


function SafeClaim({
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
      <p className="text-[10px] font-bold text-amber-900">
        {title}
      </p>

      <p className="mt-2 text-[9px] leading-5 text-amber-800">
        {description}
      </p>
    </div>
  )
}


function Limitation({
  title,
  text,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold text-slate-800">
        {title}
      </p>

      <p className="mt-2 text-[9px] leading-5 text-slate-500">
        {text}
      </p>
    </div>
  )
}