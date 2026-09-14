# Heat Component — Panel Update Notes

This build keeps the existing unified prototype structure and updates the Heat component to align more closely with the research methodology document.

## Updated
- Scenario intervention units changed from ambiguous `%` to **percentage points (pp)**.
- Scenario screen explicitly labels current calculations as **prototype placeholders**, with final output intended to come from a validated **NGBoost predictive distribution**.
- Scenario result shows a **demo predictive-interval concept** and explicitly states it is not calibrated/final.
- Added prototype schema fields: **NDVI_ADJ, NDBI_ADJ, green fraction, distance to main road**.
- Explainable AI includes **all five trend categories**: Persistent Hot, Intensifying, Emerging, Diminishing, Persistent Cool.
- Cooling Priority now uses a **Stage 9-style scenario-derived impact potential** (standardized +10 pp green-cover demo intervention) rather than an unrelated NDBI–NDVI proxy.
- Added a **Heat Methodology** page linking data acquisition → grid aggregation → Moran’s I/spatial validation → trends → ML → SHAP → forecasting → scenario testing → cooling priority.
- Added explicit wording that prototype values are not final validated research results or guaranteed causal intervention effects.

## Important for panel presentation
The displayed numerical outputs remain simulated/demo values. Do not present them as final trained-model results. The final implementation should replace prototype calculations with validated GEE/GIS inputs, trained models, calibrated NGBoost uncertainty, and finalized priority/CAPI weights.


## Forecast explanation update
- Forecast target-year selector now includes every year from 2026 to 2035, including 2030.
- For a selected grid, Forecast flags the largest year-to-year projected change as a **Notable forecast change**. This is explicitly a prototype flag, not a validated anomaly detector.
- Added **Explain this change** and **Explain [year] prediction** actions that carry the selected zone, year, comparison year and model into Explainable AI.
- Explainable AI now includes a forecast-explanation panel comparing the selected forecast year with the previous year. It shows prototype changes in forecasted features and SHAP-style model-contribution changes.
- Historical temporal SHAP (2015/2020/2025) is kept separate from future-forecast explanation.
- All new explanation values remain clearly marked as prototype/demo values; final values must come from the validated forecasting + SHAP pipeline.
- No Urbanization, Wetland, or River research logic/pages were changed for this update.
