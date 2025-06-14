# 🥗 NutriSnap Financial Forecast Calculator v2.0

A comprehensive, professional-grade financial modeling tool for SaaS businesses, specifically designed for nutrition apps like NutriSnap. This browser-based calculator provides detailed financial projections, interactive visualizations, and robust export capabilities.

## 🚀 Quick Start

### Local Setup
1. **Clone/Download** this repository to your local machine
2. **Navigate** to the project directory in your terminal
3. **Start a local server**:
   ```bash
   python3 -m http.server 8000
   # OR
   npx serve .
   # OR
   php -S localhost:8000
   ```
4. **Open** your browser and go to `http://localhost:8000`

### Alternative: Direct Browser Access
Simply open `index.html` directly in your browser (some features may be limited without a server).

---

## 📊 Core Features

### **Advanced Financial Modeling**
- **📈 Dynamic Projections**: Generate monthly forecasts for 1-5 years (12-60 months)
- **🎯 Multi-Tier Pricing**: Flexible pricing models with unlimited premium tiers
- **💰 Revenue Streams**: Subscription, advertising, and B2B partnership revenue
- **📉 Smart Cost Modeling**: Fixed and variable costs with scaling logic
- **🔄 Churn & Growth**: Sophisticated user retention and growth modeling

### **Interactive Dashboard**
- **📊 Real-Time Charts**: Multiple interactive chart types with hover details
- **🎥 Presentation Mode**: Full-screen presentation for investor meetings  
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🎨 Professional UI**: Modern dark theme with intuitive controls

### **Data Management**
- **💾 Auto-Backup System**: Automatic projection backups with recovery tools
- **📂 Save/Load Projects**: Persistent storage with version compatibility
- **📤 Multiple Export Formats**: PDF reports, CSV data, and screenshots
- **🔄 Import/Export**: Share projections between devices and users

---

## 🛠️ How to Use

### **1. Core Setup**
1. **📱 App Parameters**: Set starting MAU, projection period (12-60 months)
2. **🚀 Beta Period**: Configure 3-month pre-launch costs and user counts
3. **💰 Investment**: Enter seed funding and equity details

### **2. Pricing Configuration**
1. **Click "Add Premium Tier"** to create pricing tiers
2. **Configure each tier**: Set name, monthly price, and user distribution weight
3. **Annual Subscriptions**: Set discount percentage and adoption rate
4. **Enable/Disable tiers** with checkboxes as needed

### **3. Growth & Retention**
- **Growth Rates**: Set different monthly growth rates for Year 1, 2, and 3+
- **Conversion Rates**: Define initial and target conversion rates (free → paid)
- **Churn Rates**: Set monthly churn for free and paid users
- **Churn Improvement**: Annual reduction in churn rates

### **4. Revenue Streams**

#### **Advertising Revenue** (Optional)
- **📺 Banner Ads**: Low eCPM, high frequency (£1-3 per 1000 impressions)
- **🎯 Interstitial Ads**: Medium eCPM, medium frequency (£5-15 per 1000)
- **🎁 Rewarded Video**: High eCPM, low frequency (£10-40 per 1000)
- **Quick Presets**: Conservative, Balanced, Aggressive, or Premium strategies

#### **B2B Partnerships** (Optional)
- **Start Month**: When partnerships begin contributing revenue
- **Revenue Boost**: Percentage increase on consumer revenue

### **5. Cost Structure**
- **👥 Team Costs**: Salaries, benefits, contractors (by year)
- **🔧 Tech Costs**: Infrastructure, tools, licenses (by year)  
- **📢 Marketing Costs**: Customer acquisition spend (by year)
- **⚙️ Variable Costs**: Support, infrastructure, transaction fees (per user)

### **6. Advanced Features**
- **📊 Cohort Tracking**: User retention analysis by signup month
- **💼 Multiple Funding Rounds**: Series A, B, C planning
- **🎯 Scenario Planning**: Pre-built Conservative, Realistic, Optimistic scenarios

---

## 📈 Key Metrics Calculated

### **Financial Performance**
- **ARR** (Annual Recurring Revenue): Monthly subscription revenue × 12
- **MRR** (Monthly Recurring Revenue): Real-time subscription revenue
- **Net Income**: Total revenue minus all costs
- **Break-Even Month**: When net income turns positive
- **Cash Runway**: Months until funding runs out

### **Unit Economics**
- **ARPU** (Average Revenue Per User): Subscription revenue ÷ premium users
- **LTV** (Customer Lifetime Value): ARPU ÷ monthly churn rate
- **CAC** (Customer Acquisition Cost): Marketing spend ÷ users acquired
- **LTV:CAC Ratio**: Health metric (target: >3:1)
- **Payback Period**: Months to recover customer acquisition cost

### **Growth Metrics**
- **MAU Growth**: Month-over-month active user growth
- **Conversion Rate**: Percentage of free users converting to paid
- **User Distribution**: Breakdown across pricing tiers
- **Revenue Composition**: Subscription vs advertising vs B2B

---

## 📊 Interactive Charts & Visualizations

### **Chart Types Available**
1. **💰 Revenue Growth Waterfall**: Month-by-month revenue building
2. **📈 Growth Metrics Dashboard**: MAU, conversions, and growth trends  
3. **🏃 Cash Flow & Runway**: Burn rate and funding runway analysis
4. **💎 Unit Economics**: LTV:CAC analysis with profitability metrics
5. **📊 Financial Overview**: Complete revenue, costs, and user trends

### **Chart Features**
- **Interactive Tooltips**: Hover for detailed breakdowns
- **🎥 Presentation Mode**: Full-screen charts for presentations
- **📱 Responsive Design**: Adapts to all screen sizes
- **🎨 Professional Styling**: Investor-ready visualizations

---

## 💾 Data Export & Backup

### **Export Formats**
1. **📄 Professional PDF Report**:
   - Executive summary with key metrics
   - Detailed assumptions and parameters
   - Monthly projections summary
   - Unit economics analysis
   - Risk assessment and recommendations

2. **📊 Comprehensive CSV Data**:
   - Complete monthly projections
   - All input parameters
   - Breakdown by revenue streams
   - Cost categories and calculations

3. **📸 Dashboard Screenshot**:
   - Full-screen capture of entire interface
   - Includes charts, tables, and parameters
   - High-resolution PNG format

### **Backup & Recovery System**
- **🔄 Automatic Backups**: Created every time you load the app
- **📂 Manual Backups**: Export individual or all projections
- **🛠️ Recovery Tool**: Dedicated tool to find and restore lost projections
- **📤 Import/Export**: Share projections between devices

---

## 🎯 Pre-Built Scenarios

### **Conservative Scenario**
- Lower growth rates (12-8-5% monthly)
- Higher churn rates (25% free, 8% paid)
- Minimal advertising (banner ads only)
- Conservative pricing (£7.99/month)

### **Realistic Scenario**  
- Balanced growth (16-12-8% monthly)
- Moderate churn (20% free, 5% paid)
- Mixed advertising (banner + interstitial)
- Standard pricing (£9.99/month)

### **Optimistic Scenario**
- High growth (22-18-12% monthly)
- Low churn (15% free, 3% paid)
- Full advertising suite (all ad types)
- Premium pricing (£12.99/month)

### **Investor Ready Scenario**
- Aggressive but achievable growth
- Strong unit economics
- Multiple revenue streams
- B2B partnerships included
- Designed for fundraising presentations

---

## 🔧 Technical Architecture

### **File Structure**
```
/
├── index.html              # Main application file
├── style.css              # Complete styling
├── recover-projections.html # Backup recovery tool
├── js/
│   ├── main.js            # Core calculation engine
│   ├── charts.js          # Chart.js integration
│   ├── interactive-charts.js # Advanced chart features
│   ├── export.js          # PDF/CSV/screenshot exports
│   ├── scenarios.js       # Save/load & preset scenarios
│   └── utils.js           # Helper functions
└── README.md              # This documentation
```

### **Technology Stack**
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Charts**: Chart.js v4.4.0 with plugins
- **PDF Generation**: jsPDF with AutoTable plugin
- **Screenshots**: html2canvas library  
- **Storage**: LocalStorage + IndexedDB for redundancy
- **No Backend Required**: Runs entirely in browser

### **Browser Compatibility**
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 📝 Validation & Accuracy

### **Financial Formula Validation**
The tool validates all financial calculations with transparent formulas:

- **Conversion Rate**: Premium Users ÷ Total MAU × 100%
- **ARR Calculation**: Monthly Subscription Revenue × 12
- **Net Income**: (Subscription + Ad + B2B Revenue) - Total Costs
- **ARPU**: Subscription Revenue ÷ Premium Users
- **LTV:CAC Ratio**: Customer LTV ÷ Customer CAC

### **Built-in Validation**
- ✅ Parameter range checking
- ✅ Logical consistency warnings
- ✅ Financial calculation verification
- ✅ Tier pricing validation
- ✅ Growth rate reasonableness checks

---

## 🚨 Troubleshooting

### **Common Issues**

**🔴 Projections Disappear After Updates**
- Use the **🛠️ Recovery Tool** button to find lost projections
- Click **🔄 Restore Backup** to recover from automatic backups
- Always **📤 Export All** before making changes

**🔴 Charts Not Loading**
- Refresh the page and wait for all libraries to load
- Check browser console for JavaScript errors
- Ensure you're using a supported browser

**🔴 Export Functions Not Working**
- Click **Test Functions** in the export section for diagnostics
- Ensure popup blockers are disabled
- Try a different browser if issues persist

**🔴 Mobile Display Issues**
- Use landscape orientation for better table viewing
- Charts are optimized for touch interaction
- Some features work better on larger screens

### **Getting Help**
1. Check the **Financial Validation Summary** for calculation details
2. Use the **Recovery Tool** for backup/restore issues
3. Export your data before making major changes
4. Keep backup files of important projections

---

## 🎯 Best Practices

### **For Accurate Projections**
1. **Start Conservative**: Use realistic growth and conversion rates
2. **Validate Assumptions**: Compare with industry benchmarks  
3. **Stress Test**: Try different scenarios to understand sensitivity
4. **Regular Updates**: Refresh projections with actual data
5. **Document Assumptions**: Save multiple scenarios with clear names

### **For Investor Presentations**
1. **Use Presentation Mode**: Full-screen charts for meetings
2. **Export Professional PDFs**: Include detailed assumptions
3. **Show Multiple Scenarios**: Conservative, realistic, optimistic
4. **Highlight Unit Economics**: Focus on LTV:CAC and payback period
5. **Explain Revenue Mix**: Show diversification across streams

### **For Business Planning**
1. **Monthly Reviews**: Update projections with actual performance
2. **Sensitivity Analysis**: Test impact of key assumption changes
3. **Cash Flow Planning**: Monitor runway and funding needs
4. **Team Planning**: Use cost projections for hiring decisions
5. **Goal Setting**: Use projections to set realistic targets

---

## 🔮 Future Enhancements

This tool is actively maintained with planned improvements:

- 🎯 **Advanced Analytics**: Cohort analysis and customer segments
- 📊 **More Chart Types**: Waterfall charts, heatmaps, and comparisons  
- 🔄 **API Integration**: Connect with actual business data
- 📱 **Mobile App**: Native iOS/Android versions
- 🤖 **AI Insights**: Automated recommendations and optimization
- 🌐 **Collaboration**: Multi-user editing and sharing
- 📈 **Advanced Modeling**: Monte Carlo simulations and scenario trees

---

## 📄 License & Credits

**Created for NutriSnap Financial Modeling**  
Built with ❤️ using modern web technologies

**Key Libraries:**
- Chart.js for interactive visualizations
- jsPDF for professional report generation
- html2canvas for screenshot capabilities

**No warranty is provided. Use at your own discretion for business planning.**

---

*Last Updated: $(date)*  
*Version: 2.0 Professional*