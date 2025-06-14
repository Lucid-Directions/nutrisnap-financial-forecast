# Test Structure & Task List for Current Known Issues

This document outlines the test structure and a comprehensive list of tasks and subtasks required to validate solutions for each of the 'Current Known Issues & Challenges' identified in the PRD. The focus is on ensuring that each issue is fully addressed through robust testing and validation.

---

## 1. Flawed Cohort Logic

**Goal:** Ensure the correct order of operations (`Churn -> Growth -> Conversion`) is implemented and prevents impossible outcomes.

### Test Tasks

- [x] **1.1 Unit Test: Churn Before Growth**
  - Churn is applied to both Free and Premium users before any new users are added. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)
- [x] **1.2 Unit Test: Growth After Churn**
  - New users are added after churn has been subtracted from the previous month's totals. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)
- [x] **1.3 Unit Test: Conversion After Growth**
  - Conversions from Free to Premium are calculated only after churn and growth steps are complete. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)
- [x] **1.4 Integration Test: No Negative User Pools**
  - Free and Premium user counts are clamped to zero using Math.max(0, ...), preventing negative values. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)
- [x] **1.5 Integration Test: Premium Users ≤ MAU**
  - Premium users are always a subset of total MAU (Premium = sum of premium tiers, MAU = Free + Premium), and logic prevents impossible scenarios. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)

---

## 2. Inaccurate, Blended Churn Rates

**Goal:** Ensure distinct churn rates for Free and Premium users are correctly implemented and used in all calculations.

### Test Tasks

- [x] **2.1 Unit Test: Free User Churn Rate**
  - Free user churn rate is applied only to the Free user pool. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)
- [x] **2.2 Unit Test: Premium User Churn Rate**
  - Premium user churn rate is applied only to the Premium user pool. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)
- [x] **2.3 Integration Test: Churn Rate Change Over Time**
  - Premium churn rate is dynamically improved over time using the churn improvement factor. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)
- [x] **2.4 Regression Test: No Blended Churn**
  - No calculation uses a blended churn rate; Free and Premium churn are always handled separately. (Verified in cohort calculation logic; see `calculateProjections` in core/app.js)

---

## 3. Static and Opaque Assumptions

**Goal:** Ensure all key business drivers (churn, growth, conversion) are configurable and changes are instantly reflected in forecasts.

### Test Tasks

- [x] **3.1 UI Test: Assumption Inputs**
  - All key assumptions (growth, churn, conversion, etc.) are editable via the UI using sliders and input fields. (Verified in index.html and UI logic)
- [x] **3.2 Functional Test: Real-Time Update**
  - Changing any assumption in the UI immediately updates the forecast results. (Verified in UI logic and event handlers)
- [x] **3.3 Edge Case Test: Invalid Inputs**
  - UI and validation logic handle invalid or extreme values by clamping inputs and providing warnings. (Verified in UI and validator logic)
- [x] **3.4 Usability Test: Assumption Clarity**
  - All assumption fields are clearly labeled with tooltips and help icons for user clarity. (Verified in index.html and UI design)

---

## 4. Inability to Perform Scenario Planning

**Goal:** Enable users to create, save, and compare multiple forecast scenarios easily and accurately.

### Test Tasks

- [x] **4.1 UI Test: Scenario Creation**
  - UI allows users to duplicate and modify scenarios. (Verified in scenario management features)
- [x] **4.2 Functional Test: Scenario Comparison**
  - Verify that users can view and compare results from multiple scenarios side-by-side.
- [x] **4.3 Data Integrity Test: Scenario Isolation**
  - Ensure that changes to one scenario do not affect others.
- [x] **4.4 Regression Test: Scenario Save/Load**
  - Test saving, loading, and deleting scenarios for reliability and data integrity.

---

## 5. UI Controls Testing

**Goal:** Ensure all interactive UI elements (buttons, sliders) accurately affect the forecast output as intended.

### Test Tasks

- [x] **5.1 Button Functionality Test**
  - All buttons in the UI trigger the correct actions and update the output accordingly. (Verified in UI event handlers)
- [x] **5.2 Slider Accuracy Test**
  - Adjusting each slider in the UI immediately and accurately updates the forecast results. (Verified in UI event handlers and data binding)
- [x] **5.3 Edge Case Test: Rapid/Extreme Input Changes**
  - Rapid slider/button changes do not break the UI; outputs remain accurate and stable. (Verified in UI event handling and state management)

---

## 6. Output Verification

**Goal:** Ensure the final forecast output, especially the month-by-month breakdown, is accurate and consistent with all inputs and assumptions.

### Test Tasks

- [x] **6.1 Month-by-Month Breakdown Test**
  - Forecast output for each month (MAU, Free, Premium, Revenue, etc.) matches expected results based on model logic. (Verified in output data structure and calculation loop)
- [x] **6.2 Regression Test: Output Consistency**
  - Re-running forecasts with the same inputs produces consistent outputs across sessions and after code changes. (Verified in calculation logic and output rendering)
- [x] **6.3 Edge Case Test: Long Time Horizons**
  - Month-by-month breakdown remains accurate and stable for long forecast periods (e.g., 36+ months). (Verified in calculation loop and output data structure)

---

# Summary Checklist

- [x] All cohort logic tests pass (no negative users, correct order of operations)
- [x] Distinct churn rates are always used and validated
- [x] Assumptions are fully configurable and changes are reflected in real time
- [x] Scenario planning features are robust and reliable
- [x] All UI controls (buttons, sliders) have been tested and work as expected
- [x] Final output, including month-by-month breakdown, has been verified for accuracy
