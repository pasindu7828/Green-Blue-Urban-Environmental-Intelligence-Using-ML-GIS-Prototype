# Forecast Explanation Button Fix

- Both Forecast explanation buttons now open a large modal directly on the Forecast page.
- Buttons are explicitly `type="button"` and do not depend on React Router navigation.
- The modal compares previous-year vs selected-year LST, feature changes, and prototype SHAP-style contribution changes.
- Explainable AI page wording was clarified into:
  1. future forecast explanation, and
  2. historical/trend SHAP explanation.
- No Urban, Wetland, or River research pages were edited.
- All explanation values remain clearly labelled prototype/demo values.
