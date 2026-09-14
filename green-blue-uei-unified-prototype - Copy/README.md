# Green-Blue UEI — Unified 4-Component Research Prototype

A frontend-only **React + Vite + Tailwind CSS** university final-year research proposal prototype for a unified **Green-Blue Urban Environmental Intelligence** system.

The project combines four member research components into one application while keeping each component's analytical scope and terminology separate.

## Unified flow

1. Prototype Login
2. Project Home / 4-Component Selection
3. Component-specific dashboards
4. Back to Project Home from every component sidebar

## Component 1 — Urbanization Intelligence

**Urban Green-Cover Transition, Urbanization Pattern, Urbanization Pressure and Land Development Suitability Prediction**

Routes/pages:

- Overview
- Map Dashboard
- Green-Cover Transition
- Urbanization Pattern
- Pressure Prediction
- Development Suitability
- Scenario / What-if
- Methodology

This module preserves the visual direction of the previously approved Green-Blue UEI prototype: dark green sidebar, pale environmental background, white rounded cards, green/blue/amber planning accents, GIS-style mock polygons, and Kaduwela pilot wording.

## Component 2 — Urban Heat Intelligence / KaduwelaHeat-XAI

Routes/pages:

- Dashboard
- Heat Map
- Trend Analysis
- Forecast
- Scenario Simulator
- Explainable AI
- Cooling Priority
- Zone Details
- Dataset
- Settings

Included prototype functionality:

- 2,194 locally generated heat grid zones
- 11 historical years per grid zone (24,134 generated dataset rows)
- 20 human-readable demo locality names for area search
- Heat / NDVI / NDBI / trend / priority map modes
- React Leaflet grid visualization using `CRS.Simple` with **no external map tiles or API keys**
- Historical trend and forecast charts
- Model-comparison cards
- SHAP-style local and over-time explanation charts
- Scenario simulator with session log
- Cooling-priority ranking
- PDF, CSV, Excel, and print export actions on Cooling Priority / Dataset
- Profile editing
- Notification panel
- Reviewed / not-reviewed trend workflow
- Generate Action Plan prototype action
- Data-grounded local AI Planning Assistant that answers selected questions directly from the generated dummy dataset

## Component 3 — Kaduwela Wetland Intelligence System

Routes/pages:

- Overview
- Wetland Degradation
- Seasonal Waterlogging Susceptibility
- Flood-Retention Priority
- Methodology
- Reports

Research-safe terminology is preserved throughout, including:

- candidate wetland
- seasonal variability
- recurring seasonal waterlogging susceptibility
- flood-retention potential
- conservation priority
- restoration priority
- planning-support recommendation
- data confidence / uncertainty

The prototype does **not** claim exact flood depth, exact flood timing, exact wetland storage capacity, final model accuracy, or confirmed municipal datasets that have not yet been obtained.

## Component 4 — Kelani River Corridor Intelligence

Routes/pages:

- Overview
- River Corridor Map
- Morphological Change
- Riverbank Movement
- Vegetation Buffer
- Built-up Encroachment
- Risk Intelligence
- Scenario / What-if
- Methodology

Safe wording is used throughout:

- riverbank movement indicator
- widening / narrowing pattern
- erosion-like change
- deposition-like change
- planning-level risk intelligence
- protection-priority zones

The prototype does **not** claim final engineering erosion measurement, exact flood depth/timing, or legal development approval.

## Technology

- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React
- React Leaflet + Leaflet
- jsPDF + jspdf-autotable
- SheetJS (`xlsx`)
- Local mock/demo data only

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

### Login

This is a frontend prototype. Any non-empty username and password will work.

A prefilled demo login is included.

## Important prototype disclaimer

All figures, scores, confidence values, forecasts, maps, model comparisons, rankings, and recommendations are simulated/demo values created only to demonstrate the proposed research system. They are **not final validated research results**.

No backend, real model, real Google Maps key, paid API, legal approval logic, exact flood model, or engineering erosion model is connected.

## Validation performed during generation

- JSX/JavaScript syntax parsed successfully across the complete `src/` tree using TypeScript's JSX parser.
- All local relative imports were checked and resolve to existing project files.
- Heat demo data checks:
  - 2,194 grid zones generated
  - exactly 187 zones marked High cooling priority
  - 24,134 historical zone-year rows generated
  - 20 locality names available for search
  - KD-1203 is the highest 2025 demo LST at 39.1°C
  - KD-0847 2030 demo forecast is produced by the local forecast function
- River demo risk distribution matches the proposal specification: 1 Low, 2 Medium, 3 High, 2 Very High.

The sandbox environment used to generate this project could not complete `npm install` within the execution timeout, so the final Vite production build should be run on your local machine after dependency installation.
