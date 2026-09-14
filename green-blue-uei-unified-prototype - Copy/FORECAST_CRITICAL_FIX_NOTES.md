# Forecast Critical Fix

Fixed two issues reported from the panel prototype:

1. Forecast explanation buttons
   - Corrected the `previousPred` ReferenceError in `forecastExplanation()`.
   - Both "Explain this change" and "Explain <year> prediction" can now produce the prototype explanation modal.
   - Direct function test completed for KD-0009, 2033 vs 2032.

2. Predicted heat map
   - Restored the full "Projected LST Map — <year>" section.
   - Forecast colors use the selected target year and selected model.
   - Clicking a grid selects that forecast zone.
   - Restored target-year summary, projected area mean, change vs 2025, highest projected cell, legend, and selected-zone forecast card.

No Urban, Wetland, or River research pages were changed by this fix.
