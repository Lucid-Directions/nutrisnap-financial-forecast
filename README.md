# NutriSnap Financial Forecast Calculator

A comprehensive SaaS financial modeling tool designed for startups and growing businesses to create detailed financial projections, analyze scenarios, and plan for fundraising.

## 🚀 Features

### Core Financial Modeling
- **Dynamic Projection Periods**: 18-66 months with adaptive UI
- **Revenue Modeling**: Monthly/annual subscriptions with B2B revenue streams
- **Cost Structure**: Team, technology, and marketing costs by year
- **Growth Analytics**: MAU growth, conversion rates, and churn modeling
- **Investment Tracking**: Seed funding, equity, and exit valuations

### Advanced Analytics (✅ COMPLETED)
- **✅ Advanced Pricing Models** (#2): Tiered pricing structures with different conversion rates ✅ **IMPLEMENTED**
- **✅ Cohort-Based User Analytics** (#3): Monthly cohort tracking and retention analysis ✅ **IMPLEMENTED**
- **✅ Advanced Cost Modeling** (#4): Variable costs that scale with user growth ✅ **IMPLEMENTED**
- **✅ Fundraising & Investment Modeling** (#5): Multiple funding rounds with dilution tracking ✅ **IMPLEMENTED**

### Export & Reporting
- **PDF Export**: Professional formatted reports with parameters and projections
- **CSV Export**: Comprehensive data export with all parameters and monthly breakdowns
- **Interactive Charts**: Real-time visualization of revenue, costs, and cash flow
- **Parameters Summary**: Complete audit trail of all model assumptions

## 📊 Strategic Improvements Roadmap

### Priority 1 (✅ COMPLETED)
2. **Advanced Pricing Models**: Tiered pricing structures with different conversion rates for Basic/Pro/Enterprise plans ✅ **IMPLEMENTED**
3. **Cohort-Based User Analytics**: Monthly cohort tracking and retention analysis to understand user behavior patterns ✅ **IMPLEMENTED**
4. **Advanced Cost Modeling**: Variable costs that scale with user growth including support and infrastructure costs ✅ **IMPLEMENTED**
5. **Fundraising & Investment Modeling**: Multiple funding rounds with dilution tracking through Series A, B, C ✅ **IMPLEMENTED**

### Priority 2 (Future Development)
1. **Multiple Scenarios & Sensitivity Analysis**: Monte Carlo simulations and scenario comparisons
6. **Customer Acquisition & Marketing**: Channel-specific CAC and marketing mix optimization
7. **Advanced Financial Controls**: Working capital, tax modeling, and currency support
8. **Competitive & Market Analysis**: Market share modeling and competitive response
9. **Operational Metrics & KPIs**: Real-time dashboards and automated alerts
10. **Advanced Export & Integration**: Live dashboards and API integrations

## 🛠 Technical Implementation

### File Structure
```
├── index.html          # Main application interface
├── style.css           # Styling and responsive design
├── script.js           # Core calculation engine and UI logic
└── README.md           # This documentation
```

### Key Technologies
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **PDF Export**: jsPDF with autoTable plugin
- **Responsive Design**: CSS Grid and Flexbox

## 🧮 Financial Model Accuracy

All calculations have been thoroughly reviewed and validated:

### ✅ Revenue Calculations
- Monthly/Annual subscription revenue with proper discount handling
- B2B revenue integration after specified launch month
- Accurate ARR (Annual Recurring Revenue) calculations

### ✅ User Growth & Conversion
- Compound MAU growth with year-specific rates
- Dynamic conversion rate improvements over time
- Churn rate optimization with retention modeling

### ✅ Cost & Cash Flow
- Year-specific cost allocation with proper fallbacks
- Accurate cash flow tracking and burn rate calculations
- Break-even analysis and runway projections

### ✅ Investment & Valuation
- LTV:CAC ratio calculations with weighted averages
- Exit valuation modeling with multiple scenarios
- Investor return analysis with equity dilution

## 📈 Advanced Features Detail (✅ IMPLEMENTED)

### 2. Advanced Pricing Models ✅ **COMPLETED**
- **Tiered Subscription Plans**: Basic, Pro, Enterprise with different pricing
- **Conversion Rate Variation**: Different conversion rates per tier
- **Revenue Mix Analysis**: Track revenue distribution across tiers
- **Price Testing**: Model impact of price changes on overall revenue

### 3. Cohort-Based User Analytics ✅ **COMPLETED**
- **Monthly Cohort Tracking**: Analyze user behavior by signup month
- **Retention Curves**: Visualize how different cohorts retain over time
- **Cohort LTV**: Calculate lifetime value for specific user groups
- **Seasonal Analysis**: Identify patterns in user acquisition and retention

### 4. Advanced Cost Modeling ✅ **COMPLETED**
- **Variable Cost Structure**: Costs that scale with user growth (support, infrastructure)
- **Fixed vs Variable**: Separate modeling for scalable and fixed costs
- **Cost Per User**: Calculate and track unit economics
- **Operational Efficiency**: Model how costs optimize with scale

### 5. Fundraising & Investment Modeling ✅ **COMPLETED**
- **Multiple Funding Rounds**: Seed, Series A, B, C with different terms
- **Dilution Calculator**: Track ownership through multiple rounds
- **Valuation Progression**: Model how valuation changes with growth
- **Investor Scenario Planning**: Different investment amounts and equity stakes

## 🎯 Usage Guide

### Basic Setup
1. **Revenue Parameters**: Set subscription pricing and discount structure
2. **Growth Parameters**: Define MAU growth rates by year
3. **Conversion & Retention**: Configure conversion rates and churn
4. **Cost Structure**: Input team, tech, and marketing costs
5. **Investment**: Add funding details and exit expectations

### Advanced Usage
1. **Projection Period**: Adjust timeframe based on planning needs
2. **Scenario Testing**: Use quick scenarios for different assumptions
3. **Export Analysis**: Generate PDF/CSV reports for stakeholders
4. **Parameters Review**: Validate all assumptions in summary section

### Key Metrics
- **Final ARR**: Annual Recurring Revenue at projection end
- **LTV:CAC Ratio**: Customer lifetime value to acquisition cost
- **Break-even Month**: When cumulative revenue exceeds costs
- **Runway**: Months of operation before funding needed
- **Exit Valuation**: Estimated company value at projection end

## 📋 Model Assumptions

### Default Settings
- **Starting MAU**: 200 users
- **Initial Conversion**: 6% freemium to premium
- **Monthly Churn**: 5% (improving over time)
- **Annual Discount**: 20% for yearly plans
- **Seed Investment**: £200,000 for 12% equity
- **Exit Multiple**: 5.5x ARR

### Validation Ranges
- Conversion rates capped at 25% maximum
- Churn rates floor at 1.5% minimum
- Growth rates vary by year (higher early, stabilizing later)
- Cost projections based on typical SaaS benchmarks

## 🔄 Development Notes

### Code Organization
- **Modular Functions**: Each feature has dedicated calculation functions
- **Error Handling**: Graceful fallbacks for missing or invalid inputs
- **Performance**: Optimized for real-time calculations on input changes
- **Maintainability**: Clean separation of concerns between UI and logic

### Formula Validation
All financial formulas have been validated against SaaS industry standards:
- Revenue recognition follows subscription accounting principles
- Growth calculations use compound interest methodology
- Cost allocation properly handles year-over-year scaling
- Investment math verified against standard VC term sheet calculations

## 🚀 Quick Start

1. **Local Development**:
   ```bash
   python3 -m http.server
   # Navigate to http://localhost:8000
   ```

2. **Input Parameters**: Start with the default values and adjust based on your business model

3. **Review Outputs**: Check the financial summary and monthly breakdown

4. **Export Results**: Use PDF for presentations, CSV for detailed analysis

5. **Scenario Testing**: Try the Conservative, Realistic, Optimistic, and Investor Ready presets

## 📞 Support & Contributing

For questions, feature requests, or bug reports, please ensure all financial assumptions are clearly documented and any modifications maintain the existing calculation accuracy.

### Testing Scenarios
- **Conservative**: Lower growth, higher churn - realistic downside case
- **Realistic**: Balanced assumptions - most likely scenario
- **Optimistic**: Higher growth, lower churn - best case scenario
- **Investor Ready**: Aggressive but achievable targets - fundraising presentation

## 📈 Current Status

### ✅ Implemented Features
- Dynamic projection periods with adaptive UI
- Comprehensive revenue modeling (monthly/annual/B2B)
- Advanced cost structure with year-specific inputs
- Investment and exit valuation calculations
- Professional PDF and CSV export with parameters
- Interactive charts and real-time calculations
- **✅ Advanced Pricing Models**: Tiered subscription plans with individual conversion rates
- **✅ Cohort Analytics**: Monthly cohort tracking and retention analysis
- **✅ Variable Cost Modeling**: Costs that scale with user growth
- **✅ Multiple Funding Rounds**: Series A, B, C with dilution tracking

### 🔄 In Development
- Enhanced analytics and reporting
- Additional export formats
- Priority 2 features from roadmap

---

**Last Updated**: June 2025  
**Version**: 2.0 (Core Features Complete)  
**Status**: Production Ready ✅

**Financial Model Validation**: All formulas thoroughly reviewed and accurate ✅ 