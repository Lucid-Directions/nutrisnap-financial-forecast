// Enhanced Export Functionality
// Comprehensive CSV, PDF export, and screenshot features with all parameters and professional formatting

function exportToCSV() {
    console.log('🔄 Generating comprehensive CSV export...');
    
    if (!globalMonthlyData || !globalParams || !globalSummary) {
        alert('No data available to export. Please run calculations first.');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // === HEADER SECTION ===
    csvContent += '"NutriSnap Financial Forecast - Comprehensive Report"\n';
    csvContent += '"Generated on","' + new Date().toLocaleString() + '"\n';
    csvContent += '"Report Type","Complete Financial Model with Parameters"\n';
    csvContent += '"";\n'; // Empty line
    
    // === EXECUTIVE SUMMARY ===
    csvContent += '"EXECUTIVE SUMMARY"\n';
    csvContent += '"Metric","Value","Description"\n';
    csvContent += '"Final MAU","' + (globalSummary.finalMAU?.toLocaleString() || 'N/A') + '","Monthly Active Users at end of projection"\n';
    csvContent += '"Final ARR","' + formatCurrency(globalSummary.finalARR || 0) + '","Annual Recurring Revenue"\n';
    csvContent += '"Break-even Month","' + (globalSummary.breakEvenMonth || 'N/A') + '","When monthly net income becomes positive"\n';
    csvContent += '"Exit Valuation","' + formatCurrency(globalSummary.exitValuation || 0) + '","Based on ' + (globalParams.valuationMultiple || 8) + 'x ARR multiple"\n';
    csvContent += '"Total Revenue","' + formatCurrency(globalSummary.totalRevenue || 0) + '","Sum of all revenue over projection period"\n';
    csvContent += '"Total Costs","' + formatCurrency(globalSummary.totalCosts || 0) + '","Sum of all costs over projection period"\n';
    csvContent += '"Net Profit","' + formatCurrency(globalSummary.netProfit || 0) + '","Total Revenue - Total Costs"\n';
    csvContent += '"LTV:CAC Ratio","' + (globalSummary.ltvCacRatio || 'N/A') + '","Customer Lifetime Value to Acquisition Cost ratio"\n';
    csvContent += '"Customer LTV","' + formatCurrency(globalSummary.customerLTV || 0) + '","Average customer lifetime value"\n';
    csvContent += '"Customer CAC","' + formatCurrency(globalSummary.customerCAC || 0) + '","Customer acquisition cost"\n';
    csvContent += '"Monthly ARPU","' + formatCurrency(globalSummary.monthlyARPU || 0) + '","Average Revenue Per User per month"\n';
    csvContent += '"Cash Runway","' + (globalSummary.runway || 'N/A') + '","Months until cash runs out at current burn rate"\n';
    csvContent += '"";\n';
    
    // === INPUT PARAMETERS ===
    csvContent += '"INPUT PARAMETERS"\n';
    csvContent += '"Category","Parameter","Value","Description"\n';
    
    // Core Parameters
    csvContent += '"Core","Starting MAU","' + (globalParams.startingMAU?.toLocaleString() || 0) + '","Monthly active users at launch"\n';
    csvContent += '"Core","Projection Period","' + (globalParams.projectionPeriod || 36) + ' months","Total forecast timeline"\n';
    csvContent += '"Core","Seed Investment","' + formatCurrency(globalParams.seedInvestment || 0) + '","Initial funding amount"\n';
    csvContent += '"Core","Equity Offered","' + ((globalParams.equityOffered || 0) * 100).toFixed(1) + '%","Percentage given to investors"\n';
    csvContent += '"Core","Annual Discount","' + ((globalParams.annualDiscount || 0) * 100).toFixed(1) + '%","Discount for annual subscriptions"\n';
    
    // Pricing Tiers
    if (globalParams.tiers && globalParams.tiers.length > 0) {
        globalParams.tiers.forEach((tier, index) => {
            csvContent += '"Pricing","Tier ' + (index + 1) + ' - ' + tier.name + '","' + formatCurrency(tier.price) + '/month","Price for ' + tier.name + ' tier"\n';
            csvContent += '"Pricing","Tier ' + (index + 1) + ' Conversion","' + ((tier.conversion || 0) * 100).toFixed(1) + '%","Percentage of premium users choosing this tier"\n';
        });
    }
    
    // Growth Parameters
    csvContent += '"Growth","Year 1 Monthly Growth","' + ((globalParams.growthRates?.[1] || 0) * 100).toFixed(1) + '%","Monthly user growth rate in year 1"\n';
    csvContent += '"Growth","Year 2 Monthly Growth","' + ((globalParams.growthRates?.[2] || 0) * 100).toFixed(1) + '%","Monthly user growth rate in year 2"\n';
    csvContent += '"Growth","Year 3+ Monthly Growth","' + ((globalParams.growthRates?.[3] || 0) * 100).toFixed(1) + '%","Monthly user growth rate in year 3+"\n';
    
    // Conversion & Churn
    csvContent += '"Conversion","Initial Conversion Rate","' + ((globalParams.initialConversion || 0) * 100).toFixed(2) + '%","Starting free-to-paid conversion rate"\n';
    csvContent += '"Conversion","Final Conversion Rate","' + ((globalParams.finalConversion || 0) * 100).toFixed(2) + '%","Target conversion rate at end of period"\n';
    csvContent += '"Churn","Free User Churn Rate","' + ((globalParams.freeChurnRate || 0) * 100).toFixed(1) + '%","Monthly churn rate for free users"\n';
    csvContent += '"Churn","Paid User Churn Rate","' + ((globalParams.paidChurnRate || 0) * 100).toFixed(1) + '%","Monthly churn rate for premium users"\n';
    csvContent += '"Churn","Churn Improvement","' + ((globalParams.churnImprovement || 0) * 100).toFixed(1) + '%","Annual improvement in churn rates"\n';
    
    // Cost Structure
    csvContent += '"Costs","Team Cost Year 1","' + formatCurrency(globalParams.teamCosts?.[1] || 0) + '/month","Monthly team costs in year 1"\n';
    csvContent += '"Costs","Team Cost Year 2","' + formatCurrency(globalParams.teamCosts?.[2] || 0) + '/month","Monthly team costs in year 2"\n';
    csvContent += '"Costs","Team Cost Year 3+","' + formatCurrency(globalParams.teamCosts?.[3] || 0) + '/month","Monthly team costs in year 3+"\n';
    csvContent += '"Costs","Tech Cost Year 1","' + formatCurrency(globalParams.techCosts?.[1] || 0) + '/month","Monthly tech costs in year 1"\n';
    csvContent += '"Costs","Tech Cost Year 2","' + formatCurrency(globalParams.techCosts?.[2] || 0) + '/month","Monthly tech costs in year 2"\n';
    csvContent += '"Costs","Tech Cost Year 3+","' + formatCurrency(globalParams.techCosts?.[3] || 0) + '/month","Monthly tech costs in year 3+"\n';
    csvContent += '"Costs","Marketing Cost Year 1","' + formatCurrency(globalParams.marketingCosts?.[1] || 0) + '/month","Monthly marketing costs in year 1"\n';
    csvContent += '"Costs","Marketing Cost Year 2","' + formatCurrency(globalParams.marketingCosts?.[2] || 0) + '/month","Monthly marketing costs in year 2"\n';
    csvContent += '"Costs","Marketing Cost Year 3+","' + formatCurrency(globalParams.marketingCosts?.[3] || 0) + '/month","Monthly marketing costs in year 3+"\n';
    
    // Variable Costs (if enabled)
    if (globalParams.variableCosts?.enabled) {
        csvContent += '"Variable Costs","Support Cost per User","' + formatCurrency(globalParams.variableCosts.supportCostPerUser || 0) + '/month","Monthly support cost per user"\n';
        csvContent += '"Variable Costs","Infrastructure Cost per User","' + formatCurrency(globalParams.variableCosts.infraCostPerUser || 0) + '/month","Monthly infrastructure cost per user"\n';
        csvContent += '"Variable Costs","Transaction Fees","' + ((globalParams.variableCosts.transactionFees || 0) * 100).toFixed(1) + '%","Payment processing fees"\n';
    }
    
    // B2B Revenue (if enabled)
    if (globalParams.b2b?.percentage > 0) {
        csvContent += '"B2B","B2B Start Month","Month ' + (globalParams.b2b.startMonth || 18) + '","When B2B partnerships begin"\n';
        csvContent += '"B2B","B2B Revenue Boost","' + ((globalParams.b2b.percentage || 0) * 100).toFixed(1) + '%","Additional revenue from B2B partnerships"\n';
    }
    
    // Advertising Revenue (if enabled)
    if (globalParams.ads?.enableBanner || globalParams.ads?.enableInterstitial || globalParams.ads?.enableRewarded) {
        csvContent += '"Advertising","Ad Revenue Start Month","Month ' + (globalParams.ads.startMonth || 6) + '","When advertising revenue begins"\n';
        if (globalParams.ads.enableBanner) csvContent += '"Advertising","Banner eCPM","' + formatCurrency(globalParams.ads.bannerECPM || 0) + '","Revenue per 1000 banner ad impressions"\n';
        if (globalParams.ads.enableInterstitial) csvContent += '"Advertising","Interstitial eCPM","' + formatCurrency(globalParams.ads.interstitialECPM || 0) + '","Revenue per 1000 interstitial ad impressions"\n';
        if (globalParams.ads.enableRewarded) csvContent += '"Advertising","Rewarded eCPM","' + formatCurrency(globalParams.ads.rewardedECPM || 0) + '","Revenue per 1000 rewarded ad impressions"\n';
    }
    
    csvContent += '"";\n';
    
    // === BETA PERIOD DATA ===
    const betaData = globalMonthlyData.filter(m => m.isBeta);
    if (betaData.length > 0) {
        csvContent += '"BETA PERIOD (3 MONTHS)"\n';
        csvContent += '"Month","Users","Team Cost","Tech Cost","Marketing Cost","Total Cost"\n';
        betaData.forEach(month => {
            csvContent += '"' + month.month + '","' + (month.mau || 0) + '","' + formatCurrency(month.teamCost || 0) + '","' + formatCurrency(month.techCost || 0) + '","' + formatCurrency(month.marketingCost || 0) + '","' + formatCurrency(month.monthlyCosts || 0) + '"\n';
        });
        csvContent += '"";\n';
    }
    
    // === DETAILED MONTHLY PROJECTIONS ===
    csvContent += '"DETAILED MONTHLY PROJECTIONS"\n';
    
    // Build dynamic headers based on active tiers
    let headers = ['Month', 'MAU', 'Growth Rate %', 'Free Users'];
    if (globalParams.tiers) {
        globalParams.tiers.forEach(tier => {
            headers.push(tier.name + ' Users');
        });
    }
    headers = headers.concat([
        'Total Premium Users', 'Conversion Rate %', 'Monthly Revenue', 'ARR',
        'Team Cost', 'Tech Cost', 'Marketing Cost'
    ]);
    
    if (globalParams.variableCosts?.enabled) {
        headers = headers.concat(['Support Cost', 'Infrastructure Cost', 'Transaction Fees', 'Total Variable Cost']);
    }
    
    headers = headers.concat(['Total Costs', 'Net Income']);
    
    if (globalParams.ads?.enableBanner || globalParams.ads?.enableInterstitial || globalParams.ads?.enableRewarded) {
        headers.push('Ad Revenue');
    }
    
    if (globalParams.b2b?.percentage > 0) {
        headers.push('B2B Revenue');
    }
    
    csvContent += '"' + headers.join('","') + '"\n';
    
    // Add all monthly data
    const projectionData = globalMonthlyData.filter(m => !m.isBeta);
    projectionData.forEach(month => {
        let row = [
            'Month ' + month.month,
            month.mau?.toLocaleString() || '0',
            ((month.growthRate || 0) / 100).toFixed(3),
            month.freeUsers?.toLocaleString() || '0'
        ];
        
        // Add tier user counts
        if (globalParams.tiers) {
            globalParams.tiers.forEach(tier => {
                const tierUsers = month.tierUsers?.[tier.id] || 0;
                row.push(tierUsers.toLocaleString());
            });
        }
        
        row = row.concat([
            month.premiumUsers?.toLocaleString() || '0',
            ((month.conversionRate || 0) / 100).toFixed(4),
            (month.monthlyRevenue || 0).toFixed(2),
            (month.arr || 0).toFixed(2),
            (month.teamCost || 0).toFixed(2),
            (month.techCost || 0).toFixed(2),
            (month.marketingCost || 0).toFixed(2)
        ]);
        
        if (globalParams.variableCosts?.enabled) {
            row = row.concat([
                (month.supportCost || 0).toFixed(2),
                (month.infraCost || 0).toFixed(2),
                (month.transactionFees || 0).toFixed(2),
                (month.variableCosts || 0).toFixed(2)
            ]);
        }
        
        row = row.concat([
            (month.monthlyCosts || 0).toFixed(2),
            (month.netIncome || 0).toFixed(2)
        ]);
        
        if (globalParams.ads?.enableBanner || globalParams.ads?.enableInterstitial || globalParams.ads?.enableRewarded) {
            row.push((month.adRevenue || 0).toFixed(2));
        }
        
        if (globalParams.b2b?.percentage > 0) {
            row.push((month.b2bRevenue || 0).toFixed(2));
        }
        
        csvContent += '"' + row.join('","') + '"\n';
    });
    
    csvContent += '"";\n';
    
    // === KEY METRICS BREAKDOWN ===
    csvContent += '"KEY METRICS BREAKDOWN"\n';
    csvContent += '"Category","Metric","Value","Formula/Notes"\n';
    
    // Calculate some derived metrics
    const totalMarketingSpend = projectionData.reduce((sum, m) => sum + (m.marketingCost || 0), 0);
    const totalUsers = projectionData[projectionData.length - 1]?.mau || 0;
    const avgMonthlyRevenue = projectionData.length > 0 ? projectionData.reduce((sum, m) => sum + (m.monthlyRevenue || 0), 0) / projectionData.length : 0;
    
    csvContent += '"Unit Economics","Customer LTV","' + formatCurrency(globalSummary.customerLTV || 0) + '","Monthly ARPU ÷ Monthly Churn Rate"\n';
    csvContent += '"Unit Economics","Customer CAC","' + formatCurrency(globalSummary.customerCAC || 0) + '","Total Marketing Spend ÷ Total Users Acquired"\n';
    csvContent += '"Unit Economics","LTV:CAC Ratio","' + (globalSummary.ltvCacRatio || 'N/A') + '","Target: >3:1 for healthy unit economics"\n';
    csvContent += '"Unit Economics","Monthly ARPU","' + formatCurrency(globalSummary.monthlyARPU || 0) + '","Average Revenue Per User per month"\n';
    csvContent += '"Unit Economics","Payback Period","' + ((globalSummary.customerCAC || 0) / (globalSummary.monthlyARPU || 1)).toFixed(1) + ' months","Time to recover customer acquisition cost"\n';
    
    csvContent += '"Growth","Total Marketing Spend","' + formatCurrency(totalMarketingSpend) + '","Sum of all marketing costs"\n';
    csvContent += '"Growth","Marketing Efficiency","' + formatCurrency(totalUsers > 0 ? totalMarketingSpend / totalUsers : 0) + ' per user","Marketing cost per user acquired"\n';
    csvContent += '"Growth","Revenue Growth","' + ((projectionData.length > 1 ? (projectionData[projectionData.length-1].monthlyRevenue / (projectionData[0].monthlyRevenue || 1) - 1) * 100 : 0)).toFixed(1) + '%","First month to last month revenue growth"\n';
    
    csvContent += '"Financial","Gross Margin","N/A","Revenue - Variable Costs (if applicable)"\n';
    csvContent += '"Financial","Cash Efficiency","' + formatCurrency((globalSummary.totalRevenue || 0) / (globalParams.seedInvestment || 1)) + '","Revenue generated per £1 invested"\n';
    csvContent += '"Financial","Break-even Efficiency","' + (globalSummary.breakEvenMonth || 'N/A') + '","Months to achieve positive net income"\n';
    
    csvContent += '"";\n';
    csvContent += '"END OF REPORT"\n';
    csvContent += '"Generated by NutriSnap Financial Forecast Tool - ' + new Date().toISOString() + '"\n';
    
    // Create and download file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nutrisnap-comprehensive-forecast-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Comprehensive CSV export completed');
}

function exportToPDF() {
    console.log('🔄 Generating comprehensive PDF report...');
    
    if (!globalMonthlyData || !globalParams || !globalSummary) {
        alert('No data available to export. Please run calculations first.');
        return;
    }

    try {
        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            console.error('jsPDF not loaded');
            alert('PDF export library not loaded. Please refresh the page and try again.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Document settings
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPosition = margin;
        const lineHeight = 6;
        
        // Helper functions
        const addPage = () => {
            doc.addPage();
            yPosition = margin;
        };
        
        const checkSpace = (needed = 20) => {
            if (yPosition > pageHeight - needed) {
                addPage();
            }
        };
        
        const addSection = (title, fontSize = 14) => {
            checkSpace(25);
            doc.setFontSize(fontSize);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(66, 126, 234); // Blue color
            doc.text(title, margin, yPosition);
            yPosition += fontSize * 0.6;
            
            // Add underline
            doc.setDrawColor(66, 126, 234);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, margin + 60, yPosition);
            yPosition += 8;
            doc.setTextColor(0, 0, 0); // Reset to black
        };
        
        const addText = (label, value = '', fontSize = 10, bold = false) => {
            checkSpace(8);
            doc.setFontSize(fontSize);
            doc.setFont(undefined, bold ? 'bold' : 'normal');
            doc.text(label, margin, yPosition);
            if (value) {
                doc.setFont(undefined, 'normal');
                doc.text(value, margin + 80, yPosition);
            }
            yPosition += lineHeight;
        };
        
        const addKeyValue = (key, value, description = '') => {
            checkSpace(10);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(key + ':', margin, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(value, margin + 50, yPosition);
            if (description) {
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(description, margin + 105, yPosition);
                doc.setTextColor(0, 0, 0);
            }
            yPosition += lineHeight;
        };
        
        // === TITLE PAGE ===
        doc.setFontSize(28);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(66, 126, 234);
        doc.text('NutriSnap Financial Forecast', margin, yPosition);
        yPosition += 20;
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text('Comprehensive Financial Model & Projections', margin, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition);
        doc.text(`Projection Period: ${globalParams.projectionPeriod || 36} months`, margin, yPosition + 6);
        doc.text(`Model Version: v2.0 Professional`, margin, yPosition + 12);
        yPosition += 30;
        
        // === EXECUTIVE SUMMARY ===
        addSection('Executive Summary', 16);
        
        addKeyValue('Final MAU', (globalSummary.finalMAU?.toLocaleString() || 'N/A'), 'Total monthly active users');
        addKeyValue('Final ARR', formatCurrency(globalSummary.finalARR || 0), 'Annual recurring revenue');
        addKeyValue('Break-even', globalSummary.breakEvenMonth || 'N/A', 'Month when net income turns positive');
        addKeyValue('Exit Valuation', formatCurrency(globalSummary.exitValuation || 0), `Based on ${globalParams.valuationMultiple || 8}x ARR multiple`);
        addKeyValue('Total Revenue', formatCurrency(globalSummary.totalRevenue || 0), 'Sum over entire projection period');
        addKeyValue('Total Costs', formatCurrency(globalSummary.totalCosts || 0), 'Sum over entire projection period');
        addKeyValue('Net Profit', formatCurrency(globalSummary.netProfit || 0), 'Total revenue minus total costs');
        addKeyValue('LTV:CAC Ratio', globalSummary.ltvCacRatio || 'N/A', 'Target: >3:1 for healthy unit economics');
        addKeyValue('Customer LTV', formatCurrency(globalSummary.customerLTV || 0), 'Average customer lifetime value');
        addKeyValue('Customer CAC', formatCurrency(globalSummary.customerCAC || 0), 'Customer acquisition cost');
        addKeyValue('Monthly ARPU', formatCurrency(globalSummary.monthlyARPU || 0), 'Average revenue per user');
        addKeyValue('Cash Runway', globalSummary.runway || 'N/A', 'Months until cash depletion');
        yPosition += 5;
        
        // === KEY ASSUMPTIONS ===
        addSection('Key Model Assumptions', 16);
        
        // Core Parameters
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Core Parameters:', margin, yPosition);
        yPosition += 8;
        
        addKeyValue('Starting MAU', (globalParams.startingMAU?.toLocaleString() || '0'), 'Initial user base at launch');
        addKeyValue('Seed Investment', formatCurrency(globalParams.seedInvestment || 0), 'Initial funding amount');
        addKeyValue('Equity Given', ((globalParams.equityOffered || 0) * 100).toFixed(1) + '%', 'Percentage to investors');
        addKeyValue('Annual Discount', ((globalParams.annualDiscount || 0) * 100).toFixed(1) + '%', 'Annual subscription discount');
        yPosition += 3;
        
        // Pricing Tiers
        if (globalParams.tiers && globalParams.tiers.length > 0) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Pricing Tiers:', margin, yPosition);
            yPosition += 8;
            
            globalParams.tiers.forEach((tier, index) => {
                addKeyValue(`Tier ${index + 1} (${tier.name})`, formatCurrency(tier.price) + '/month', `${((tier.conversion || 0) * 100).toFixed(1)}% of premium users`);
            });
            yPosition += 3;
        }
        
        // Growth Parameters
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Growth Parameters:', margin, yPosition);
        yPosition += 8;
        
        addKeyValue('Year 1 Growth', ((globalParams.growthRates?.[1] || 0) * 100).toFixed(1) + '%/month', 'Monthly user growth rate');
        addKeyValue('Year 2 Growth', ((globalParams.growthRates?.[2] || 0) * 100).toFixed(1) + '%/month', 'Slower growth as market matures');
        addKeyValue('Year 3+ Growth', ((globalParams.growthRates?.[3] || 0) * 100).toFixed(1) + '%/month', 'Sustainable long-term growth');
        yPosition += 3;
        
        // Conversion & Churn
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Conversion & Retention:', margin, yPosition);
        yPosition += 8;
        
        addKeyValue('Initial Conversion', ((globalParams.initialConversion || 0) * 100).toFixed(2) + '%', 'Starting free-to-paid rate');
        addKeyValue('Target Conversion', ((globalParams.finalConversion || 0) * 100).toFixed(2) + '%', 'Goal conversion rate');
        addKeyValue('Free User Churn', ((globalParams.freeChurnRate || 0) * 100).toFixed(1) + '%/month', 'Monthly free user churn');
        addKeyValue('Paid User Churn', ((globalParams.paidChurnRate || 0) * 100).toFixed(1) + '%/month', 'Monthly premium churn');
        yPosition += 3;
        
        // Cost Structure
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Cost Structure:', margin, yPosition);
        yPosition += 8;
        
        addKeyValue('Year 1 Team Costs', formatCurrency(globalParams.teamCosts?.[1] || 0) + '/month', 'Salaries and benefits');
        addKeyValue('Year 1 Tech Costs', formatCurrency(globalParams.techCosts?.[1] || 0) + '/month', 'Infrastructure and tools');
        addKeyValue('Year 1 Marketing', formatCurrency(globalParams.marketingCosts?.[1] || 0) + '/month', 'Customer acquisition');
        
        if (globalParams.variableCosts?.enabled) {
            addKeyValue('Support Cost', formatCurrency(globalParams.variableCosts.supportCostPerUser || 0) + '/user/month', 'Customer support scaling');
            addKeyValue('Infrastructure', formatCurrency(globalParams.variableCosts.infraCostPerUser || 0) + '/user/month', 'Variable hosting costs');
            addKeyValue('Transaction Fees', ((globalParams.variableCosts.transactionFees || 0) * 100).toFixed(1) + '%', 'Payment processing');
        }
        
        // === NEW PAGE FOR PROJECTIONS ===
        addPage();
        
        // === MONTHLY PROJECTIONS SUMMARY ===
        addSection('Monthly Projections Summary', 16);
        
        // Show key months and milestones
        const projectionData = globalMonthlyData.filter(m => !m.isBeta);
        const keyMonths = projectionData.filter((month, index) => {
            return index === 0 || // First month
                   index === 5 || // Month 6
                   index === 11 || // Month 12
                   index === 23 || // Month 24
                   index === 35 || // Month 36
                   month.month % 12 === 0 || // Year markers
                   (month.netIncome >= 0 && projectionData[index-1]?.netIncome < 0); // Break-even month
        }).slice(0, 15); // Limit for space
        
        if (typeof window.jsPDFAutoTable !== 'undefined' || doc.autoTable) {
            const tableData = keyMonths.map(month => {
                const row = [
                    `M${month.month}`,
                    (month.mau || 0).toLocaleString(),
                    ((month.growthRate || 0)).toFixed(1) + '%',
                    (month.premiumUsers || 0).toLocaleString(),
                    ((month.conversionRate || 0)).toFixed(2) + '%',
                    formatCurrency(month.monthlyRevenue || 0),
                    formatCurrency(month.monthlyCosts || 0),
                    formatCurrency(month.netIncome || 0)
                ];
                return row;
            });
            
            try {
                doc.autoTable({
                    head: [['Month', 'MAU', 'Growth%', 'Premium', 'Conv%', 'Revenue', 'Costs', 'Net Income']],
                    body: tableData,
                    startY: yPosition,
                    styles: { fontSize: 8, cellPadding: 1.5 },
                    headStyles: { fillColor: [66, 126, 234], fontSize: 9, textColor: 255 },
                    alternateRowStyles: { fillColor: [248, 249, 250] },
                    margin: { left: margin, right: margin },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 22 },
                        2: { cellWidth: 18 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 15 },
                        5: { cellWidth: 25 },
                        6: { cellWidth: 25 },
                        7: { cellWidth: 25 }
                    }
                });
                
                yPosition = doc.lastAutoTable.finalY + 10;
            } catch (tableError) {
                console.warn('AutoTable failed:', tableError);
                addText('Detailed monthly data available in CSV export.');
            }
        }
        
        // === UNIT ECONOMICS ANALYSIS ===
        addSection('Unit Economics Analysis', 16);
        
        const totalMarketingSpend = projectionData.reduce((sum, m) => sum + (m.marketingCost || 0), 0);
        const finalMonth = projectionData[projectionData.length - 1];
        const paybackPeriod = (globalSummary.customerCAC || 0) / (globalSummary.monthlyARPU || 1);
        
        addKeyValue('Customer LTV', formatCurrency(globalSummary.customerLTV || 0), 'Lifetime value per customer');
        addKeyValue('Customer CAC', formatCurrency(globalSummary.customerCAC || 0), 'Cost to acquire one customer');
        addKeyValue('LTV:CAC Ratio', globalSummary.ltvCacRatio || 'N/A', 'Health: >3:1 excellent, >2:1 good');
        addKeyValue('Payback Period', paybackPeriod.toFixed(1) + ' months', 'Time to recover acquisition cost');
        addKeyValue('Monthly ARPU', formatCurrency(globalSummary.monthlyARPU || 0), 'Average revenue per user');
        addKeyValue('Total Marketing', formatCurrency(totalMarketingSpend), 'Sum of all marketing spend');
        addKeyValue('Marketing ROI', ((globalSummary.totalRevenue || 0) / Math.max(totalMarketingSpend, 1)).toFixed(1) + 'x', 'Revenue multiple on marketing');
        yPosition += 5;
        
        // === RISK ANALYSIS ===
        addSection('Risk Analysis & Scenarios', 16);
        
        // Calculate some risk metrics
        const breakEvenMonth = parseInt((globalSummary.breakEvenMonth || 'Month 999').replace('Month ', ''));
        const runwayMonths = parseInt((globalSummary.runway || '0').replace(' mo', ''));
        
        addText('Business Risks:', '', 12, true);
        yPosition += 2;
        
        if (breakEvenMonth > 24) {
            addText('- Late Break-even:', `${breakEvenMonth} months - Consider faster growth strategies`);
        } else if (breakEvenMonth <= 12) {
            addText('- Early Break-even:', `${breakEvenMonth} months - Strong business model`);
        }
        
        if (runwayMonths < 18) {
            addText('- Short Runway:', `${runwayMonths} months - May need additional funding`);
        }
        
        const ltvCacRatio = parseFloat((globalSummary.ltvCacRatio || '0:1').split(':')[0]);
        if (ltvCacRatio < 2) {
            addText('- Low LTV:CAC:', 'Below 2:1 - Optimize pricing or reduce acquisition costs');
        } else if (ltvCacRatio > 3) {
            addText('- Strong LTV:CAC:', 'Above 3:1 - Excellent unit economics');
        }
        
        if ((globalParams.paidChurnRate || 0) > 0.08) {
            addText('- High Churn Risk:', `${((globalParams.paidChurnRate || 0) * 100).toFixed(1)}%/month - Focus on retention`);
        }
        
        yPosition += 5;
        
        // === RECOMMENDATIONS ===
        addSection('Strategic Recommendations', 16);
        
        addText('Based on this financial model:', '', 12, true);
        yPosition += 2;
        
        addText('- Growth Strategy:', 'Focus on sustainable user acquisition with strong unit economics');
        addText('- Pricing Optimization:', 'Test pricing tiers to maximize LTV while maintaining conversion');
        addText('- Cost Management:', 'Monitor team scaling vs. revenue growth ratios');
        addText('- Funding Timeline:', `Plan next funding round ${Math.max(6, runwayMonths - 6)} months from now`);
        addText('- Key Metrics:', 'Track MRR growth, churn rates, and CAC payback period monthly');
        yPosition += 5;
        
        // === FOOTER ===
        checkSpace(20);
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('This report was generated by NutriSnap Financial Forecast Tool', margin, yPosition);
        yPosition += 4;
        doc.text(`Model assumptions and projections are based on inputs provided on ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += 4;
        doc.text('For detailed monthly breakdown and parameters, please refer to the CSV export.', margin, yPosition);
        
        // Save the PDF
        const fileName = `nutrisnap-comprehensive-forecast-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        console.log('✅ Comprehensive PDF export completed:', fileName);
        
    } catch (error) {
        console.error('❌ PDF export error:', error);
        alert('Error generating PDF. Please try again or use CSV export.');
    }
}

function exportScreenshot() {
    console.log('🔄 Generating full-screen screenshot with input parameters...');
    
    if (typeof html2canvas === 'undefined') {
        alert('Screenshot library not loaded. Please refresh the page and try again.');
        return;
    }
    
    // Show loading state
    const originalButton = event?.target;
    const originalText = originalButton?.textContent || '📸 Export Screenshot';
    if (originalButton) {
        originalButton.textContent = '📸 Capturing...';
        originalButton.disabled = true;
    }
    
    // Capture the entire page
    const targetElement = document.body;
    
    html2canvas(targetElement, {
        backgroundColor: '#0a0a0a',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: window.innerWidth,
        height: Math.max(document.body.scrollHeight, window.innerHeight),
        onclone: function(clonedDoc) {
            // Ensure all elements are visible in the clone
            const outputSection = clonedDoc.getElementById('outputSection');
            if (outputSection) {
                outputSection.style.display = 'block';
            }
        }
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `nutrisnap-full-forecast-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log('✅ Full-screen screenshot saved');
        
        // Reset button
        if (originalButton) {
            originalButton.textContent = originalText;
            originalButton.disabled = false;
        }
    }).catch(error => {
        console.error('❌ Screenshot error:', error);
        alert('Error taking screenshot. Please try again.');
        
        // Reset button
        if (originalButton) {
            originalButton.textContent = originalText;
            originalButton.disabled = false;
        }
    });
}

// Helper function for consistent currency formatting
function formatCurrency(value) {
    if (value === null || value === undefined) return '£0';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
    if (isNaN(numValue)) return '£0';
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numValue);
}

// Comprehensive report export function that combines all exports
function exportComprehensiveReport() {
    console.log('🔄 Generating comprehensive report package...');
    
    if (!globalMonthlyData || !globalParams || !globalSummary) {
        alert('No data available to export. Please run calculations first.');
        return;
    }
    
    // Generate all three export types
    exportToPDF();
    setTimeout(() => exportToCSV(), 500);
    setTimeout(() => exportScreenshot(), 1000);
    
    alert('Comprehensive report package generated! Three files have been downloaded: PDF, CSV, and Screenshot.');
}

// Test function to help debug export issues
function testExportFunctions() {
    console.log('🧪 Testing export functions...');
    
    // Check if global data exists
    console.log('Global data check:');
    console.log('- globalMonthlyData:', globalMonthlyData?.length || 0, 'months');
    console.log('- globalSummary:', Object.keys(globalSummary || {}).length, 'properties');
    console.log('- globalParams:', Object.keys(globalParams || {}).length, 'properties');
    
    // Check if libraries are loaded
    console.log('\nLibrary check:');
    console.log('- jsPDF:', typeof window.jspdf !== 'undefined' ? '✅ Loaded' : '❌ Missing');
    console.log('- html2canvas:', typeof window.html2canvas !== 'undefined' ? '✅ Loaded' : '❌ Missing');
    console.log('- Chart.js:', typeof window.Chart !== 'undefined' ? '✅ Loaded' : '❌ Missing');
    
    // Check function availability
    console.log('\nFunction check:');
    console.log('- exportToCSV:', typeof window.exportToCSV);
    console.log('- exportToPDF:', typeof window.exportToPDF);
    console.log('- exportScreenshot:', typeof window.exportScreenshot);
    
    // Try a simple test
    if (!globalMonthlyData || globalMonthlyData.length === 0) {
        alert('⚠️ No data found! Please run "Calculate Projections" first before testing exports.');
        return;
    }
    
    // Test CSV generation (safest)
    try {
        console.log('🔄 Testing CSV generation...');
        exportToCSV();
        console.log('✅ CSV test completed');
    } catch (error) {
        console.error('❌ CSV test failed:', error);
        alert('CSV export failed: ' + error.message);
    }
}

// Alias for compatibility
function takeScreenshot() {
    exportScreenshot();
}

// Make functions globally available
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.exportScreenshot = exportScreenshot;
window.exportComprehensiveReport = exportComprehensiveReport;
window.takeScreenshot = takeScreenshot;
window.testExportFunctions = testExportFunctions;

console.log('✅ Enhanced export functions loaded - now includes comprehensive parameter reporting');

// Debug: Check if functions are properly attached
setTimeout(() => {
    console.log('🔍 Export function availability check:');
    console.log('- exportToCSV:', typeof window.exportToCSV);
    console.log('- exportToPDF:', typeof window.exportToPDF);
    console.log('- exportScreenshot:', typeof window.exportScreenshot);
    console.log('- exportComprehensiveReport:', typeof window.exportComprehensiveReport);
    console.log('- jsPDF available:', typeof window.jspdf !== 'undefined');
    console.log('- html2canvas available:', typeof window.html2canvas !== 'undefined');
}, 1000);