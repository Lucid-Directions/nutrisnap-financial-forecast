# NutriSnap Financial Forecast Calculator

This document serves as a comprehensive guide and Product Requirements Document (PRD) for the NutriSnap Financial Forecast Calculator. It is a standalone web-based tool designed for startups and businesses to model financial projections for a SaaS application, specifically tailored to a nutrition app like NutriSnap.

The calculator is built with HTML, CSS, and vanilla JavaScript, and it runs entirely in the browser without needing a backend server.

## How to Run Locally

Since this is a client-side application, you only need a simple local web server.
1.  Navigate to the project's root directory in your terminal.
2.  Run the following command:
    ```bash
    python3 -m http.server
    ```
3.  Open your web browser and go to `http://localhost:8000`.

## Core Features

-   **Dynamic Financial Projections:** Generates monthly financial forecasts for up to 5 years.
-   **Flexible Revenue Modeling:** Supports both a simple single-price model and a flexible four-tier freemium model.
-   **Advertising Revenue Stream:** Granular controls to model revenue from banner, interstitial, and rewarded video ads.
-   **Detailed Cost Structure:** Models fixed yearly costs (Team, Tech, Marketing) with optional monthly overrides for precision.
-   **Variable Cost Modeling:** Accounts for costs that scale with user growth, like support and infrastructure.
-   **Key Performance Indicators (KPIs):** Calculates and displays essential SaaS metrics, including MAU, ARR, LTV, CAC, LTV:CAC Ratio, Runway, and more.
-   **Interactive Charts:** Visualizes revenue, costs, and net income over time, plus a revenue composition doughnut chart.
-   **Scenario Planning:** Includes pre-defined scenarios (Conservative, Realistic, etc.) and allows users to save and load their own custom projections.
-   **Data Export:** Users can export their full financial model to CSV, a summary report to PDF, or capture a screenshot of the dashboard.

---

## Detailed Feature Breakdown

### 1. Calculation Engine (`js/core.js`)

This is the heart of the calculator. The `calculateProjections` function orchestrates the entire financial model.

#### Inputs & Core Parameters

-   **Monthly Price:** The base subscription price for the single-tier model.
-   **Average Discount:** The average discount applied across all plans (e.g., from annual subscriptions). This is used to calculate a more realistic ARPU.
-   **Starting MAU:** The number of Monthly Active Users at the start of the projection.
-   **Projection Period:** A selectable timeframe for the forecast (1 to 5 years).
-   **Beta Period:** A mandatory 3-month pre-launch period where users can define initial user counts and costs, which are factored into the starting cash balance but not operational revenue.

#### Growth & Retention Logic

-   **User Growth:** Modeled with separate monthly growth rates for Year 1, Year 2, and Year 3+, acknowledging that growth typically slows as a product matures. New users are calculated based on the previous month's total MAU.
-   **User Churn:** Modeled with separate monthly churn rates for Free and Paid users. A "Churn Improvement" factor reduces churn annually, simulating product improvements and better user retention over time.
-   **B2B Revenue:** A simple model to add a percentage-based revenue boost on top of consumer revenue, starting from a specified month.

#### Revenue Models

The calculator supports two primary revenue models, controlled by a toggle.

1.  **Single-Tier Subscription Model:**
    -   When "Enable Tiered Pricing" is off.
    -   Uses the main "Monthly Price" and "Average Discount" inputs.
    -   The conversion rate from free to paid ramps up linearly over the projection period, from a defined "Initial Conversion Rate" to a "Final Conversion Rate."

2.  **Flexible Tiered-Pricing Model:**
    -   When "Enable Tiered Pricing" is on.
    -   This model presents four distinct user tiers:
        -   **Tier 1 (Free):** The base tier for all non-paying users.
        -   **Tier 2 (Premium):** The first paid tier.
        -   **Tier 3 (Pro):** The mid-level paid tier.
        -   **Tier 4 (Max):** The highest-level paid tier.
    -   **Flexibility:** Each of the three paid tiers (Premium, Pro, Max) can be individually **enabled or disabled** with a checkbox. This allows the user to model a business with one, two, or three paid tiers.
    -   **Granular Control:** Each enabled tier has its own inputs for **Price** and **Conversion Rate** (from the free user pool).
    -   The calculation logic iterates through the enabled tiers, converting free users to each tier based on its specific conversion rate. The total monthly revenue is the sum of (users in each tier * price of that tier).

#### Advertising Revenue Model (`enableAdvertisingRevenue`)

-   This entire revenue stream can be toggled on or off.
-   Revenue is calculated based on the number of **free users**.
-   **Granular Ad Type Control:** Users can enable/disable and configure three standard ad types:
    -   **Banner Ads:** Low eCPM, high impression volume.
    -   **Interstitial Ads:** Medium eCPM, medium impression volume.
    -   **Rewarded Video Ads:** High eCPM, low impression volume.
-   **Configuration:** For each enabled ad type, users can set:
    -   `eCPM` (effective Cost Per Mille, or revenue per 1000 impressions).
    -   `Impressions per User per Month`.
-   **Growth:** An "Annual eCPM Growth" rate increases the eCPM for all ad types each year to model optimization.

#### Cost Models

1.  **Fixed Costs:**
    -   Defined on a per-year basis for **Team, Tech, and Marketing**.
    -   The calculator applies the corresponding monthly average for each year of the projection.
    -   **Monthly Override:** Users can optionally enable a "Monthly Detail View" for each cost category. This allows them to override the annual average and input a specific cost for every single month of the projection, providing maximum flexibility for planning hiring, marketing campaigns, or infrastructure upgrades.

2.  **Variable Costs (`enableVariableCosts`):**
    -   An optional feature that adds costs scaling with growth.
    -   **Infrastructure Cost per User:** A small monthly cost applied to every active user (free and paid).
    -   **Support Cost per User:** A monthly cost applied only to **paid users**.
    -   **Transaction Fees:** A percentage-based fee (e.g., for Stripe/Apple/Google) applied to all subscription revenue.

#### Investment & Valuation

-   **Seed Investment:** The initial cash injection into the business.
-   **Equity & Valuation:** An exit valuation is calculated based on the final year's ARR multiplied by a user-defined **Exit Multiple**. Investor return is then calculated based on the **Equity Offered**.

### 2. User Interface (`index.html`, `js/ui.js`, `style.css`)

The UI is designed to be intuitive, grouping related parameters into cards.

-   **Dynamic UI Toggles:** Checkboxes for "Enable Tiered Pricing," "Enable Advertising Revenue," and "Enable Variable Costs" show and hide their respective configuration sections, keeping the interface clean.
-   **Tier Visibility:** The checkboxes within the tiered pricing section dynamically show/hide the controls for each tier and, crucially, also show/hide the corresponding columns in the monthly data table.
-   **Slider Controls:** Most percentage and rate-based inputs use sliders for intuitive control, with a live text display of the current value.
-   **Outputs:**
    -   **Summary Dashboard:** A grid of cards displaying the most important top-level KPIs.
    -   **Breakdown Cards:** Smaller, focused cards that provide a deeper look into specific areas like CAC, Variable Costs, Advertising Revenue, etc.
    -   **Monthly Data Table:** A detailed, scrollable table showing the full financial model month by month.
-   **Tooltips:** Info icons provide helpful tooltips explaining what each parameter means.

### 3. Data Visualization (`js/charts.js`)

-   **Main Projection Chart:** A line chart that plots Monthly Revenue, Total Costs, and Net Income over the entire projection period.
-   **Revenue Composition Chart:** A doughnut chart that appears only when there is revenue. It visualizes the breakdown of revenue sources: Subscription vs. each enabled Advertising type (Banner, Interstitial, Rewarded).

### 4. Scenarios & Data Persistence (`js/scenarios.js`)

-   **Quick Scenarios:** Buttons to instantly load pre-configured parameters for "Conservative," "Realistic," "Optimistic," and "Investor Ready" models.
-   **Save/Load Projections:** Users can name and save their current set of parameters. These are stored in the browser's `localStorage`, allowing them to be reloaded in future sessions. The list of saved projections is displayed in the UI, with options to load or delete each one.

### 5. Exporting (`js/export.js`)

-   **Export to CSV:** Generates a CSV file containing the full, detailed monthly projection data. The columns in the CSV dynamically adjust to match the enabled/disabled state of the pricing tiers.
-   **Export to PDF:** Generates a professional, multi-page PDF summary report including the executive summary, key parameters, CAC breakdown, and a summary of the monthly data table.
-   **Export Screenshot:** Uses the `html2canvas` library to capture a PNG image of the entire output dashboard.

### 6. File Structure

-   `index.html`: The main and only HTML file, containing the entire UI structure.
-   `style.css`: All styles for the application.
-   `js/`: Directory for all JavaScript files.
    -   `core.js`: The main calculation engine.
    -   `ui.js`: Handles all DOM manipulation, UI state changes, and displaying results.
    -   `charts.js`: Manages the Chart.js integration.
    -   `export.js`: Contains logic for CSV, PDF, and screenshot exports.
    -   `scenarios.js`: Manages the pre-defined scenarios and the save/load functionality.
    -   `utils.js`: Contains shared helper functions, primarily for formatting and handling the monthly cost override feature.
