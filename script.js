// Global variables
let revenueChart = null;
let globalMonthlyData = [];
let globalSummaryData = {};

// Utility function to update slider display values
function updateSliderValue(slider) {
    const value = slider.value;
    let suffix = '';
    
    if (slider.id.includes('Growth') || slider.id.includes('Conversion') || 
        slider.id.includes('churn') || slider.id.includes('equity') || 
        slider.id.includes('Discount') || slider.id.includes('Percentage') ||
        slider.id.includes('Improvement')) {
        suffix = '%';
    } else if (slider.id === 'valuationMultiple') {
        suffix = 'x';
    }
    
    const valueSpan = slider.parentElement.querySelector('.range-value');
    if (valueSpan) {
        valueSpan.textContent = value + suffix;
    }
}

// Update annual price calculation
function updateAnnualPrice() {
    const monthlyPrice = parseFloat(document.getElementById('appPrice').value) || 0;
    const annualDiscount = parseFloat(document.getElementById('annualDiscount').value) / 100 || 0;
    const annualPrice = monthlyPrice * 12 * (1 - annualDiscount);
    document.getElementById('annualPrice').value = annualPrice.toFixed(2);
}

// Format currency
function formatCurrency(amount) {
    return '£' + Math.round(amount).toLocaleString();
}

// Main calculation function
function calculateProjections() {
    // Get all input values
    const appPrice = parseFloat(document.getElementById('appPrice').value);
    const annualDiscount = parseFloat(document.getElementById('annualDiscount').value) / 100;
    const annualPrice = appPrice * 12 * (1 - annualDiscount);
    const annualPlanPercentage = parseFloat(document.getElementById('annualPlanPercentage').value) / 100;
    const projectionMonths = parseInt(document.getElementById('projectionMonths').value);
    const startingMAU = parseInt(document.getElementById('startingMAU').value);
    
    // Calculate how many years we need based on projection period
    const projectionYears = Math.ceil(projectionMonths / 12);
    
    // Build growth rates object only for available years
    const growthRates = {};
    const growthInputs = ['year1Growth', 'year2Growth', 'year3Growth', 'year4Growth', 'year5Growth'];
    for (let i = 1; i <= Math.min(projectionYears, 5); i++) {
        const inputElement = document.getElementById(growthInputs[i-1]);
        if (inputElement && inputElement.closest('.input-group').style.display !== 'none') {
            growthRates[i] = parseFloat(inputElement.value) / 100;
        }
    }
    
    const initialConversion = parseFloat(document.getElementById('initialConversion').value) / 100;
    const conversionGrowth = parseFloat(document.getElementById('conversionGrowth').value) / 100;
    const initialChurnRate = parseFloat(document.getElementById('churnRate').value) / 100;
    const churnImprovement = parseFloat(document.getElementById('churnImprovement').value) / 100;
    
    const b2bStartMonth = parseInt(document.getElementById('b2bStartMonth').value);
    const b2bPercentage = parseFloat(document.getElementById('b2bPercentage').value) / 100;
    
    // Build cost objects only for available years
    const teamCosts = {};
    const techCosts = {};
    const marketingCosts = {};
    
    const costYearsToLoad = Math.min(projectionYears, 3); // We only have 3 years of cost inputs
    for (let i = 1; i <= costYearsToLoad; i++) {
        const teamElement = document.getElementById(`teamCostY${i}`);
        const techElement = document.getElementById(`techCostY${i}`);
        const marketingElement = document.getElementById(`marketingCostY${i}`);
        
        if (teamElement && teamElement.closest('.cost-year-' + i).style.display !== 'none') {
            teamCosts[i] = parseFloat(teamElement.value) || 0;
            techCosts[i] = parseFloat(techElement.value) || 0;
            marketingCosts[i] = parseFloat(marketingElement.value) || 0;
        }
    }
    
    const seedInvestment = parseFloat(document.getElementById('seedInvestment').value);
    const equityOffered = parseFloat(document.getElementById('equityOffered').value) / 100;
    const valuationMultiple = parseFloat(document.getElementById('valuationMultiple').value);
    
    const parameters = {
        appPrice, annualDiscount, annualPlanPercentage, projectionMonths, startingMAU,
        growthRates, initialConversion, conversionGrowth, initialChurnRate, churnImprovement,
        b2bStartMonth, b2bPercentage, teamCosts, techCosts, marketingCosts,
        seedInvestment, equityOffered, valuationMultiple
    };
    populateParametersSummary(parameters);
    
    // Calculate projections
    let monthlyData = [];
    let mau = startingMAU;
    let premiumUsers = 0;
    let totalRevenue = 0;
    let totalCosts = 0;
    let breakEvenMonth = null;
    let cashBalance = seedInvestment;
    let currentBurnRate = 0;
    
    // Year-by-year cost tracking
    let yearCosts = {};
    
    for (let month = 1; month <= projectionMonths; month++) {
        const year = Math.ceil(month / 12);
        // Use the appropriate growth rate, fallback to last available if year exceeds available rates
        const lastAvailableGrowthYear = Math.max(...Object.keys(growthRates).map(Number));
        const growthRate = growthRates[Math.min(year, lastAvailableGrowthYear)] || growthRates[lastAvailableGrowthYear];
        
        const yearsElapsed = (month - 1) / 12;
        const conversionRate = Math.min(initialConversion + (conversionGrowth * yearsElapsed), 0.25);
        const churnRate = Math.max(initialChurnRate - (churnImprovement * yearsElapsed), 0.015);
        
        // Apply realistic MAU growth with user churn
        if (month > 1) {
            // MAU churn rate (typically 2-5% monthly for freemium apps)
            const mauChurnRate = 0.03; // 3% monthly churn on overall user base
            const retainedUsers = Math.round(mau * (1 - mauChurnRate));
            const newUsers = Math.round(retainedUsers * growthRate / (1 - mauChurnRate)); // Adjust growth for churn
            mau = retainedUsers + newUsers;
        }
        
        const newPremiumUsers = Math.round(mau * conversionRate);
        if (month > 1) {
            premiumUsers = Math.round(premiumUsers * (1 - churnRate) + newPremiumUsers);
        } else {
            premiumUsers = newPremiumUsers;
        }
        
        let monthlyRevenue = 0;
        
        // Check if tiered pricing is enabled
        if (document.getElementById('enableTieredPricing').checked) {
            // Calculate tiered revenue
            const basicUsers = Math.round(premiumUsers * 0.6);
            const proUsers = Math.round(premiumUsers * 0.3);
            const enterpriseUsers = Math.round(premiumUsers * 0.1);
            
            const basicPrice = parseFloat(document.getElementById('basicPrice').value);
            const proPrice = parseFloat(document.getElementById('proPrice').value);
            const enterprisePrice = parseFloat(document.getElementById('enterprisePrice').value);
            
            // Apply annual plan percentage to each tier
            const basicMonthly = Math.round(basicUsers * (1 - annualPlanPercentage));
            const basicAnnual = basicUsers - basicMonthly;
            const proMonthly = Math.round(proUsers * (1 - annualPlanPercentage));
            const proAnnual = proUsers - proMonthly;
            const enterpriseMonthly = Math.round(enterpriseUsers * (1 - annualPlanPercentage));
            const enterpriseAnnual = enterpriseUsers - enterpriseMonthly;
            
            const basicAnnualPrice = basicPrice * 12 * (1 - annualDiscount);
            const proAnnualPrice = proPrice * 12 * (1 - annualDiscount);
            const enterpriseAnnualPrice = enterprisePrice * 12 * (1 - annualDiscount);
            
            monthlyRevenue = 
                (basicMonthly * basicPrice) + (basicAnnual * (basicAnnualPrice / 12)) +
                (proMonthly * proPrice) + (proAnnual * (proAnnualPrice / 12)) +
                (enterpriseMonthly * enterprisePrice) + (enterpriseAnnual * (enterpriseAnnualPrice / 12));
        } else {
            // Standard single-tier pricing
            const monthlyUsers = Math.round(premiumUsers * (1 - annualPlanPercentage));
            const annualUsers = premiumUsers - monthlyUsers;
            monthlyRevenue = (monthlyUsers * appPrice) + (annualUsers * (annualPrice / 12));
        }
        
        let b2bRevenue = 0;
        if (month >= b2bStartMonth && b2bPercentage > 0) {
            b2bRevenue = monthlyRevenue * b2bPercentage;
        }
        
        const totalMonthlyRevenue = monthlyRevenue + b2bRevenue;
        const arr = totalMonthlyRevenue * 12;
        totalRevenue += totalMonthlyRevenue;
        
        const currentYear = Math.ceil(month / 12);
        // Use the appropriate cost for the year, fallback to last available if year exceeds available costs
        const lastAvailableCostYear = Math.max(...Object.keys(teamCosts).map(Number));
        const costYear = Math.min(currentYear, lastAvailableCostYear);
        const monthlyTeamCost = teamCosts[costYear] || teamCosts[lastAvailableCostYear] || 0;
        const monthlyTechCost = techCosts[costYear] || techCosts[lastAvailableCostYear] || 0;
        const monthlyMarketingCost = marketingCosts[costYear] || marketingCosts[lastAvailableCostYear] || 0;
        
        // Add variable costs if enabled
        let monthlyVariableCosts = 0;
        if (document.getElementById('enableVariableCosts').checked) {
            const costPerUser = parseFloat(document.getElementById('costPerUser').value) || 0;
            const supportCostPerUser = parseFloat(document.getElementById('supportCostPerUser').value) || 0;
            const infraScaling = parseFloat(document.getElementById('infraScaling').value) || 1;
            
            const userCosts = mau * costPerUser;
            const supportCosts = premiumUsers * supportCostPerUser;
            monthlyVariableCosts = (userCosts + supportCosts) * infraScaling;
        }
        
        const monthlyCosts = monthlyTeamCost + monthlyTechCost + monthlyMarketingCost + monthlyVariableCosts;
        totalCosts += monthlyCosts;
        
        const netIncome = totalMonthlyRevenue - monthlyCosts;
        cashBalance += netIncome;
        
        // Add funding rounds if enabled
        if (document.getElementById('enableMultipleRounds').checked) {
            const seriesAMonth = parseInt(document.getElementById('seriesAMonth').value);
            const seriesAAmount = parseFloat(document.getElementById('seriesAAmount').value);
            const seriesBMonth = parseInt(document.getElementById('seriesBMonth').value);
            const seriesBAmount = parseFloat(document.getElementById('seriesBAmount').value);
            const seriesCMonth = parseInt(document.getElementById('seriesCMonth').value);
            const seriesCAmount = parseFloat(document.getElementById('seriesCAmount').value);
            
            if (month === seriesAMonth && seriesAMonth <= projectionMonths) {
                cashBalance += seriesAAmount;
            }
            if (month === seriesBMonth && seriesBMonth <= projectionMonths) {
                cashBalance += seriesBAmount;
            }
            if (month === seriesCMonth && seriesCMonth <= projectionMonths) {
                cashBalance += seriesCAmount;
            }
        }
        
        // Track current burn rate (negative net income)
        if (netIncome < 0) {
            currentBurnRate = -netIncome;
        }
        
        if (breakEvenMonth === null && netIncome > 0) {
            breakEvenMonth = month;
        }
        
        // Track year costs
        if (!yearCosts[year]) {
            yearCosts[year] = {
                team: 0,
                tech: 0,
                marketing: 0,
                variable: 0,
                total: 0,
                revenue: 0,
                months: 0
            };
        }
        yearCosts[year].team += monthlyTeamCost;
        yearCosts[year].tech += monthlyTechCost;
        yearCosts[year].marketing += monthlyMarketingCost;
        yearCosts[year].variable += monthlyVariableCosts;
        yearCosts[year].total += monthlyCosts;
        yearCosts[year].revenue += totalMonthlyRevenue;
        yearCosts[year].months += 1;
        
        monthlyData.push({
            month: month,
            mau: mau,
            growthRate: growthRate,
            premiumUsers: premiumUsers,
            conversionRate: conversionRate,
            monthlyRevenue: totalMonthlyRevenue,
            arr: arr,
            teamCost: monthlyTeamCost,
            techCost: monthlyTechCost,
            marketingCost: monthlyMarketingCost,
            variableCosts: monthlyVariableCosts,
            monthlyCosts: monthlyCosts,
            netIncome: netIncome,
            cashBalance: cashBalance
        });
    }
    
    // Calculate final metrics
    const finalData = monthlyData[monthlyData.length - 1];
    const finalARR = finalData.arr;
    const netProfit = totalRevenue - totalCosts;
    
    // Calculate LTV more accurately
    const avgChurnRate = Math.max(initialChurnRate - (churnImprovement * (projectionMonths / 12)), 0.015);
    const avgLifespan = 1 / avgChurnRate; // months
    
    let avgMonthlyRevenue;
    if (document.getElementById('enableTieredPricing').checked) {
        // Use tiered pricing for LTV
        const basicPrice = parseFloat(document.getElementById('basicPrice').value);
        const proPrice = parseFloat(document.getElementById('proPrice').value);
        const enterprisePrice = parseFloat(document.getElementById('enterprisePrice').value);
        avgMonthlyRevenue = (basicPrice * 0.6) + (proPrice * 0.3) + (enterprisePrice * 0.1);
    } else {
        avgMonthlyRevenue = (appPrice * (1 - annualPlanPercentage)) + (annualPrice / 12 * annualPlanPercentage);
    }
    
    const ltv = avgMonthlyRevenue * avgLifespan;
    
    // Calculate CAC properly - this is critical for realistic modeling
    const totalMarketingCosts = monthlyData.reduce((sum, d) => sum + d.marketingCost, 0);
    
    // Total acquisition costs = Marketing + Sales overhead (20% of total costs is more realistic)
    const salesOverhead = totalCosts * 0.20;
    const totalAcquisitionCosts = totalMarketingCosts + salesOverhead;
    
    // Calculate total NEW premium users acquired throughout the projection
    let totalUsersAcquired = 0;
    for (let i = 0; i < monthlyData.length; i++) {
        if (i === 0) {
            // First month, all users are new
            totalUsersAcquired += monthlyData[i].premiumUsers;
        } else {
            // Calculate new users = current - (previous * (1-churn))
            const previousUsers = monthlyData[i - 1].premiumUsers;
            const currentMonth = monthlyData[i].month;
            const currentChurnRate = currentMonth <= 12 ? initialChurnRate : avgChurnRate;
            const retainedUsers = Math.round(previousUsers * (1 - currentChurnRate));
            const newUsers = Math.max(monthlyData[i].premiumUsers - retainedUsers, 0);
            totalUsersAcquired += newUsers;
        }
    }
    
    // CAC = Total acquisition costs / Total users acquired
    const cac = totalUsersAcquired > 0 ? totalAcquisitionCosts / totalUsersAcquired : 0;
    
    // Validate CAC is realistic (should typically be £20-200 for SaaS)
    const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(1) : 'N/A';
    
    // Add debugging info for transparency
    const acquisitionMetrics = {
        totalMarketingCosts: totalMarketingCosts,
        salesOverhead: salesOverhead,
        totalAcquisitionCosts: totalAcquisitionCosts,
        totalUsersAcquired: totalUsersAcquired,
        averageCAC: cac,
        customerLTV: ltv,
        ltvCacRatio: ltvCacRatio
    };
    
    // Calculate runway based on current burn rate or average if profitable
    let runway = 0;
    if (currentBurnRate > 0) {
        runway = Math.round(cashBalance / currentBurnRate);
    } else if (breakEvenMonth) {
        // If profitable, show months of cash available at current profit rate
        const currentProfit = finalData.netIncome;
        runway = currentProfit > 0 ? '∞' : Math.round(cashBalance / Math.abs(currentProfit));
    } else {
        // Still burning, use current burn
        const lastNegativeMonth = monthlyData.filter(d => d.netIncome < 0).pop();
        if (lastNegativeMonth) {
            runway = Math.round(cashBalance / Math.abs(lastNegativeMonth.netIncome));
        }
    }
    
    const exitValuation = finalARR * valuationMultiple;
    const investorReturn = exitValuation * equityOffered;
    const returnMultiple = investorReturn / seedInvestment;
    
    // Advanced Features Data Processing
    let tieredData = null;
    let cohortData = null;
    let variableData = null;
    let fundingData = null;
    
    // Process Tiered Pricing
    if (document.getElementById('enableTieredPricing').checked) {
        const finalMonthData = monthlyData[monthlyData.length - 1];
        const basicUsers = Math.round(finalMonthData.premiumUsers * 0.6);
        const proUsers = Math.round(finalMonthData.premiumUsers * 0.3);
        const enterpriseUsers = Math.round(finalMonthData.premiumUsers * 0.1);
        
        const basicRevenue = basicUsers * parseFloat(document.getElementById('basicPrice').value);
        const proRevenue = proUsers * parseFloat(document.getElementById('proPrice').value);
        const enterpriseRevenue = enterpriseUsers * parseFloat(document.getElementById('enterprisePrice').value);
        const totalTieredRevenue = basicRevenue + proRevenue + enterpriseRevenue;
        
        tieredData = [
            {
                name: 'Basic',
                users: basicUsers,
                revenue: basicRevenue,
                percentage: (basicRevenue / totalTieredRevenue) * 100
            },
            {
                name: 'Pro',
                users: proUsers,
                revenue: proRevenue,
                percentage: (proRevenue / totalTieredRevenue) * 100
            },
            {
                name: 'Enterprise',
                users: enterpriseUsers,
                revenue: enterpriseRevenue,
                percentage: (enterpriseRevenue / totalTieredRevenue) * 100
            }
        ];
    }
    
    // Process Cohort Analysis
    if (document.getElementById('enableCohortTracking').checked) {
        const retentionDecay = parseFloat(document.getElementById('retentionDecay').value) / 100;
        const cohortLtvMultiplier = parseFloat(document.getElementById('cohortLtvMultiplier').value);
        
        cohortData = [];
        for (let cohortMonth = 1; cohortMonth <= Math.min(projectionMonths, 12); cohortMonth += 3) {
            const monthsActive = projectionMonths - cohortMonth + 1;
            const retentionRate = Math.max(0.7 - (retentionDecay * monthsActive), 0.3);
            const initialUsers = Math.round(monthlyData[cohortMonth - 1].premiumUsers * 0.2);
            const currentUsers = Math.round(initialUsers * retentionRate);
            const avgLtv = ltv * cohortLtvMultiplier * (cohortMonth / 12 + 1);
            
            cohortData.push({
                month: cohortMonth,
                initialUsers: initialUsers,
                retentionRate: retentionRate,
                currentUsers: currentUsers,
                avgLtv: avgLtv
            });
        }
    }
    
    // Process Variable Costs
    if (document.getElementById('enableVariableCosts').checked) {
        const costPerUser = parseFloat(document.getElementById('costPerUser').value);
        const supportCost = parseFloat(document.getElementById('supportCostPerUser').value);
        const infraScaling = parseFloat(document.getElementById('infraScaling').value);
        
        const finalMonthData = monthlyData[monthlyData.length - 1];
        const variableUserCosts = finalMonthData.mau * costPerUser;
        const variableSupportCosts = finalMonthData.premiumUsers * supportCost;
        const infraCosts = (variableUserCosts + variableSupportCosts) * infraScaling;
        
        variableData = [
            {
                label: 'User Support Costs',
                value: variableUserCosts * projectionMonths
            },
            {
                label: 'Premium Support Costs',
                value: variableSupportCosts * projectionMonths
            },
            {
                label: 'Infrastructure Scaling',
                value: infraCosts * projectionMonths
            }
        ];
    }
    
    // Process Multiple Funding Rounds
    if (document.getElementById('enableMultipleRounds').checked) {
        const seriesAMonth = parseInt(document.getElementById('seriesAMonth').value);
        const seriesAAmount = parseFloat(document.getElementById('seriesAAmount').value);
        const seriesAEquity = parseFloat(document.getElementById('seriesAEquity').value);
        
        const seriesBMonth = parseInt(document.getElementById('seriesBMonth').value);
        const seriesBAmount = parseFloat(document.getElementById('seriesBAmount').value);
        const seriesBEquity = parseFloat(document.getElementById('seriesBEquity').value);
        
        const seriesCMonth = parseInt(document.getElementById('seriesCMonth').value);
        const seriesCAmount = parseFloat(document.getElementById('seriesCAmount').value);
        const seriesCEquity = parseFloat(document.getElementById('seriesCEquity').value);
        
        const rounds = [];
        let founderEquity = 100 - equityOffered; // After seed
        
        if (seriesAMonth <= projectionMonths) {
            const arrAtA = monthlyData[seriesAMonth - 1].arr;
            const seriesAValuation = seriesAAmount / (seriesAEquity / 100);
            rounds.push({
                name: 'Series A',
                month: seriesAMonth,
                amount: seriesAAmount,
                equity: seriesAEquity,
                valuation: seriesAValuation
            });
            founderEquity *= (1 - seriesAEquity / 100);
        }
        
        if (seriesBMonth <= projectionMonths) {
            const seriesBValuation = seriesBAmount / (seriesBEquity / 100);
            rounds.push({
                name: 'Series B',
                month: seriesBMonth,
                amount: seriesBAmount,
                equity: seriesBEquity,
                valuation: seriesBValuation
            });
            founderEquity *= (1 - seriesBEquity / 100);
        }
        
        if (seriesCMonth <= projectionMonths) {
            const seriesCValuation = seriesCAmount / (seriesCEquity / 100);
            rounds.push({
                name: 'Series C',
                month: seriesCMonth,
                amount: seriesCAmount,
                equity: seriesCEquity,
                valuation: seriesCValuation
            });
            founderEquity *= (1 - seriesCEquity / 100);
        }
        
        fundingData = {
            rounds: rounds,
            dilution: [
                { stakeholder: 'Founders', ownership: founderEquity.toFixed(1) },
                { stakeholder: 'Seed Investors', ownership: (equityOffered * (founderEquity / 100)).toFixed(1) },
                { stakeholder: 'Series A+', ownership: (100 - founderEquity - (equityOffered * (founderEquity / 100))).toFixed(1) }
            ]
        };
    }
    
    // Update Advanced Analytics
    if (tieredData) updateTieredRevenueAnalysis(tieredData);
    if (cohortData) updateCohortAnalysis(cohortData);
    if (variableData) updateVariableCostAnalysis(variableData);
    if (fundingData) updateFundingRoundsAnalysis(fundingData);
    
    // Store global data for export
    globalMonthlyData = monthlyData;
    globalSummaryData = {
        finalMAU: finalData.mau,
        finalARR: finalARR,
        breakEvenMonth: breakEvenMonth,
        exitValuation: exitValuation,
        investorReturn: investorReturn,
        returnMultiple: returnMultiple,
        totalRevenue: totalRevenue,
        totalCosts: totalCosts,
        netProfit: netProfit,
        ltvCacRatio: ltvCacRatio,
        customerLTV: ltv,
        customerCAC: cac,
        totalUsersAcquired: totalUsersAcquired,
        runway: runway,
        currentBurnRate: currentBurnRate,
        yearCosts: yearCosts,
        parameters: parameters,
        // Advanced features data
        tieredData: tieredData,
        cohortData: cohortData,
        variableData: variableData,
        fundingData: fundingData
    };
    
    // Update summary
    const finalMAUElement = document.getElementById('finalMAU');
    const finalARRElement = document.getElementById('finalARR');
    const breakEvenElement = document.getElementById('breakEvenMonth');
    const exitValElement = document.getElementById('exitValuation');
    const investorReturnElement = document.getElementById('investorReturn');
    
    if (finalMAUElement) finalMAUElement.textContent = finalData.mau.toLocaleString();
    if (finalARRElement) finalARRElement.textContent = formatCurrency(finalARR);
    if (breakEvenElement) breakEvenElement.textContent = breakEvenMonth ? `Month ${breakEvenMonth}` : 'Not reached';
    if (exitValElement) exitValElement.textContent = formatCurrency(exitValuation);
    if (investorReturnElement) investorReturnElement.textContent = formatCurrency(investorReturn) + ` (${returnMultiple.toFixed(1)}x)`;
    
    // Update metrics
    const totalRevenueElement = document.getElementById('totalRevenue');
    const totalCostsElement = document.getElementById('totalCosts');
    const netProfitElement = document.getElementById('netProfit');
    const ltvCacElement = document.getElementById('ltvCacRatio');
    const customerLTVElement = document.getElementById('customerLTV');
    const customerCACElement = document.getElementById('customerCAC');
    const runwayElement = document.getElementById('runway');
    const burnRateElement = document.getElementById('burnRate');
    
    if (totalRevenueElement) totalRevenueElement.textContent = formatCurrency(totalRevenue);
    if (totalCostsElement) totalCostsElement.textContent = formatCurrency(totalCosts);
    if (netProfitElement) {
        netProfitElement.textContent = formatCurrency(netProfit);
        netProfitElement.className = netProfit >= 0 ? 'metric-value positive' : 'metric-value negative';
    }
    if (ltvCacElement) {
        ltvCacElement.textContent = ltvCacRatio + ':1';
        // Color code the LTV:CAC ratio
        const ratio = parseFloat(ltvCacRatio);
        if (ratio >= 5) {
            ltvCacElement.className = 'metric-value positive';
        } else if (ratio >= 3) {
            ltvCacElement.className = 'metric-value';
        } else {
            ltvCacElement.className = 'metric-value negative';
        }
    }
    if (customerLTVElement) customerLTVElement.textContent = formatCurrency(ltv);
    if (customerCACElement) {
        customerCACElement.textContent = formatCurrency(cac);
        customerCACElement.className = cac > 100 ? 'metric-value negative' : 'metric-value positive';
    }
    if (runwayElement) runwayElement.textContent = runway + (runway === '∞' ? '' : ' months');
    if (burnRateElement) burnRateElement.textContent = currentBurnRate > 0 ? formatCurrency(currentBurnRate) + '/mo' : 'Profitable';
    
    // Update cost breakdown
    updateCostBreakdown(yearCosts);
    
    // Update CAC breakdown
    updateCACBreakdown(acquisitionMetrics, avgMonthlyRevenue);
    
    // Update table
    const tbody = document.getElementById('monthlyTableBody');
    if (!tbody) return; // Add null check
    
    tbody.innerHTML = '';
    
    monthlyData.forEach(data => {
        const row = tbody.insertRow();
        
        if (data.month === 12 || data.month === 24 || data.month === 36 || data.month === 48 || data.month === 60) {
            row.className = 'year-highlight';
        }
        
        row.innerHTML = `
            <td>${data.month}${data.month === 12 ? ' (Year 1)' : data.month === 24 ? ' (Year 2)' : data.month === 36 ? ' (Year 3)' : data.month === 48 ? ' (Year 4)' : data.month === 60 ? ' (Year 5)' : ''}</td>
            <td>${data.mau.toLocaleString()}</td>
            <td>${(data.growthRate * 100).toFixed(0)}%</td>
            <td>${data.premiumUsers.toLocaleString()}</td>
            <td>${(data.conversionRate * 100).toFixed(1)}%</td>
            <td>${formatCurrency(data.monthlyRevenue)}</td>
            <td>${formatCurrency(data.arr)}</td>
            <td>${formatCurrency(data.teamCost)}</td>
            <td>${formatCurrency(data.techCost)}</td>
            <td>${formatCurrency(data.marketingCost)}</td>
            <td>${formatCurrency(data.variableCosts || 0)}</td>
            <td>${formatCurrency(data.monthlyCosts)}</td>
            <td class="${data.netIncome >= 0 ? 'positive' : 'negative'}">${formatCurrency(data.netIncome)}</td>
        `;
    });
    
    // Update chart
    updateChart(monthlyData);
    
    const outputSection = document.getElementById('outputSection');
    if (outputSection) {
        outputSection.style.display = 'block';
    }
    document.getElementById('parameters-summary-card').style.display = 'block';
}

function updateCostBreakdown(yearCosts) {
    const container = document.getElementById('costBreakdownContent');
    if (!container) return; // Add null check
    
    let html = '';
    
    Object.keys(yearCosts).forEach(year => {
        const costs = yearCosts[year];
        const avgMonthlyTeam = costs.team / costs.months;
        const avgMonthlyTech = costs.tech / costs.months;
        const avgMonthlyMarketing = costs.marketing / costs.months;
        const avgMonthlyVariable = costs.variable / costs.months;
        const avgMonthlyTotal = costs.total / costs.months;
        
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #667eea; margin-bottom: 10px;">Year ${year}</h4>
                <div class="cost-item">
                    <span class="cost-label">Team Costs</span>
                    <span class="cost-value">${formatCurrency(costs.team)} total (${formatCurrency(avgMonthlyTeam)}/mo)</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Tech Costs</span>
                    <span class="cost-value">${formatCurrency(costs.tech)} total (${formatCurrency(avgMonthlyTech)}/mo)</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Marketing Costs</span>
                    <span class="cost-value">${formatCurrency(costs.marketing)} total (${formatCurrency(avgMonthlyMarketing)}/mo)</span>
                </div>
                ${costs.variable > 0 ? `
                <div class="cost-item">
                    <span class="cost-label">Variable Costs</span>
                    <span class="cost-value">${formatCurrency(costs.variable)} total (${formatCurrency(avgMonthlyVariable)}/mo)</span>
                </div>
                ` : ''}
                <div class="cost-item" style="border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold;">
                    <span class="cost-label">Total Costs</span>
                    <span class="cost-value">${formatCurrency(costs.total)} total (${formatCurrency(avgMonthlyTotal)}/mo)</span>
                </div>
                <div class="cost-item" style="color: #4ade80;">
                    <span class="cost-label">Revenue</span>
                    <span class="cost-value">${formatCurrency(costs.revenue)} total</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateCACBreakdown(metrics, avgMonthlyRevenue) {
    document.getElementById('totalMarketingCosts').textContent = formatCurrency(metrics.totalMarketingCosts);
    document.getElementById('salesOverhead').textContent = formatCurrency(metrics.salesOverhead);
    document.getElementById('totalAcquisitionCosts').textContent = formatCurrency(metrics.totalAcquisitionCosts);
    document.getElementById('totalUsersAcquiredDisplay').textContent = metrics.totalUsersAcquired.toLocaleString();
    document.getElementById('averageCACDisplay').textContent = formatCurrency(metrics.averageCAC);
    
    // Calculate payback period
    const paybackPeriod = avgMonthlyRevenue > 0 ? Math.round(metrics.averageCAC / avgMonthlyRevenue) : 0;
    document.getElementById('paybackPeriod').textContent = paybackPeriod + ' months';
    
    // Add validation warnings for CAC
    const cacElement = document.getElementById('averageCACDisplay');
    if (metrics.averageCAC < 10) {
        cacElement.style.color = '#f87171';
        cacElement.title = 'Warning: CAC < £10 is unrealistically low unless you have viral growth';
    } else if (metrics.averageCAC > 300) {
        cacElement.style.color = '#f87171';
        cacElement.title = 'Warning: CAC > £300 may be unsustainable for most SaaS businesses';
    } else if (paybackPeriod > 12) {
        cacElement.style.color = '#fbbf24';
        cacElement.title = 'Caution: Payback period > 12 months requires strong unit economics';
    } else {
        cacElement.style.color = '#4ade80';
        cacElement.title = 'CAC appears realistic for SaaS business';
    }
}

function updateChart(data) {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return; // Add null check
    
    const ctx = canvas.getContext('2d');
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => `Month ${d.month}`),
            datasets: [
                {
                    label: 'Monthly Revenue',
                    data: data.map(d => d.monthlyRevenue),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Monthly Costs',
                    data: data.map(d => d.monthlyCosts),
                    borderColor: '#f87171',
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Cash Balance',
                    data: data.map(d => d.cashBalance),
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#999'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '£' + Math.round(context.parsed.y).toLocaleString();
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#999'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#999',
                        callback: function(value) {
                            return '£' + (value / 1000).toFixed(0) + 'k';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#999',
                        callback: function(value) {
                            return '£' + (value / 1000).toFixed(0) + 'k';
                        }
                    }
                }
            }
        }
    });
}

function loadScenario(scenario) {
    const scenarios = {
        conservative: {
            appPrice: 7,
            year1Growth: 15,
            year2Growth: 12,
            year3Growth: 8,
            year4Growth: 6,
            year5Growth: 4,
            initialConversion: 6,
            conversionGrowth: 1.5,
            churnRate: 5,
            churnImprovement: 0.5,
            annualDiscount: 20,
            annualPlanPercentage: 20,
            b2bStartMonth: 36,
            b2bPercentage: 10,
            teamCostY1: 6000,
            teamCostY2: 12000,
            teamCostY3: 20000,
            techCostY1: 500,
            techCostY2: 2000,
            techCostY3: 5000,
            marketingCostY1: 1500,
            marketingCostY2: 4000,
            marketingCostY3: 10000,
            equityOffered: 15,
            valuationMultiple: 5
        },
        realistic: {
            appPrice: 8,
            year1Growth: 18,
            year2Growth: 15,
            year3Growth: 10,
            year4Growth: 8,
            year5Growth: 5,
            initialConversion: 8,
            conversionGrowth: 1,
            churnRate: 4,
            churnImprovement: 0.5,
            annualDiscount: 15,
            annualPlanPercentage: 25,
            b2bStartMonth: 24,
            b2bPercentage: 15,
            teamCostY1: 8500,
            teamCostY2: 15000,
            teamCostY3: 23000,
            techCostY1: 472,
            techCostY2: 3000,
            techCostY3: 7500,
            marketingCostY1: 2139,
            marketingCostY2: 8000,
            marketingCostY3: 16000,
            equityOffered: 10,
            valuationMultiple: 6
        },
        optimistic: {
            appPrice: 9,
            year1Growth: 20,
            year2Growth: 15,
            year3Growth: 10,
            year4Growth: 8,
            year5Growth: 5,
            initialConversion: 10,
            conversionGrowth: 1.5,
            churnRate: 3,
            churnImprovement: 1,
            annualDiscount: 15,
            annualPlanPercentage: 30,
            b2bStartMonth: 18,
            b2bPercentage: 20,
            teamCostY1: 8500,
            teamCostY2: 15000,
            teamCostY3: 23000,
            techCostY1: 472,
            techCostY2: 3000,
            techCostY3: 7500,
            marketingCostY1: 2139,
            marketingCostY2: 8000,
            marketingCostY3: 16000,
            equityOffered: 8,
            valuationMultiple: 8
        },
        investor: {
            appPrice: 7.5,
            year1Growth: 16,
            year2Growth: 12,
            year3Growth: 9,
            year4Growth: 7,
            year5Growth: 5,
            initialConversion: 6,
            conversionGrowth: 1.25,
            churnRate: 5,
            churnImprovement: 0.75,
            annualDiscount: 20,
            annualPlanPercentage: 25,
            b2bStartMonth: 30,
            b2bPercentage: 15,
            teamCostY1: 6000,
            teamCostY2: 12000,
            teamCostY3: 18000,
            techCostY1: 400,
            techCostY2: 1800,
            techCostY3: 4000,
            marketingCostY1: 1200,
            marketingCostY2: 3500,
            marketingCostY3: 8000,
            equityOffered: 12,
            valuationMultiple: 5.5
        }
    };
    
    const s = scenarios[scenario];
    if (s) {
        document.getElementById('appPrice').value = s.appPrice;
        document.getElementById('year1Growth').value = s.year1Growth;
        document.getElementById('year2Growth').value = s.year2Growth;
        document.getElementById('year3Growth').value = s.year3Growth;
        document.getElementById('year4Growth').value = s.year4Growth;
        document.getElementById('year5Growth').value = s.year5Growth;
        document.getElementById('initialConversion').value = s.initialConversion;
        document.getElementById('conversionGrowth').value = s.conversionGrowth;
        document.getElementById('churnRate').value = s.churnRate;
        document.getElementById('churnImprovement').value = s.churnImprovement;
        document.getElementById('annualDiscount').value = s.annualDiscount;
        document.getElementById('annualPlanPercentage').value = s.annualPlanPercentage;
        document.getElementById('b2bStartMonth').value = s.b2bStartMonth;
        document.getElementById('b2bPercentage').value = s.b2bPercentage;
        document.getElementById('teamCostY1').value = s.teamCostY1;
        document.getElementById('teamCostY2').value = s.teamCostY2;
        document.getElementById('teamCostY3').value = s.teamCostY3;
        document.getElementById('techCostY1').value = s.techCostY1;
        document.getElementById('techCostY2').value = s.techCostY2;
        document.getElementById('techCostY3').value = s.techCostY3;
        document.getElementById('marketingCostY1').value = s.marketingCostY1;
        document.getElementById('marketingCostY2').value = s.marketingCostY2;
        document.getElementById('marketingCostY3').value = s.marketingCostY3;
        document.getElementById('equityOffered').value = s.equityOffered;
        document.getElementById('valuationMultiple').value = s.valuationMultiple;
        
        // Update all slider displays
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => updateSliderValue(slider));
        
        // Update annual price
        updateAnnualPrice();
        
        // Auto-calculate
        calculateProjections();
    }
}

function updateAnnualCostDisplays() {
    const costTypes = ['team', 'tech', 'marketing'];
    const years = [1, 2, 3];

    costTypes.forEach(type => {
        years.forEach(year => {
            const monthlyInput = document.getElementById(`${type}CostY${year}`);
            const annualDisplay = document.getElementById(`${type}CostY${year}_annual`);
            
            if (monthlyInput && annualDisplay) {
                const monthlyCost = parseFloat(monthlyInput.value) || 0;
                const annualCost = monthlyCost * 12;
                annualDisplay.textContent = `${formatCurrency(annualCost)}/year`;
            }
        });
    });
}

function updateCostStructureVisibility() {
    const projectionMonths = parseInt(document.getElementById('projectionMonths').value);
    const projectionYears = Math.ceil(projectionMonths / 12);

    // Show/hide cost structure years
    for (let i = 1; i <= 3; i++) {
        const costYearElements = document.querySelectorAll(`.cost-year-${i}`);
        if (costYearElements) {
            costYearElements.forEach(el => {
                el.style.display = i <= projectionYears ? 'block' : 'none';
            });
        }
    }
    
    // Show/hide growth parameter years
    const growthInputs = [
        { id: 'year1Growth', year: 1 },
        { id: 'year2Growth', year: 2 },
        { id: 'year3Growth', year: 3 },
        { id: 'year4Growth', year: 4 },
        { id: 'year5Growth', year: 5 }
    ];
    
    growthInputs.forEach(({ id, year }) => {
        const inputGroup = document.querySelector(`#${id}`).closest('.input-group');
        if (inputGroup) {
            inputGroup.style.display = year <= projectionYears ? 'block' : 'none';
        }
    });
}

function populateParametersSummary(params) {
    const container = document.getElementById('parametersSummaryContent');
    
    // Build growth parameters dynamically based on available years
    let growthHTML = '';
    Object.keys(params.growthRates).forEach(year => {
        growthHTML += `<div class="param-item"><span class="param-label">Year ${year} Growth</span><span class="param-value">${(params.growthRates[year] * 100).toFixed(0)}%/mo</span></div>`;
    });
    
    container.innerHTML = `
        <div class="param-group">
            <h4>Revenue</h4>
            <div class="param-item"><span class="param-label">Monthly Price</span><span class="param-value">${formatCurrency(params.appPrice)}</span></div>
            <div class="param-item"><span class="param-label">Annual Discount</span><span class="param-value">${(params.annualDiscount * 100).toFixed(0)}%</span></div>
            <div class="param-item"><span class="param-label">Annual Plan Uptake</span><span class="param-value">${(params.annualPlanPercentage * 100).toFixed(0)}%</span></div>
            <div class="param-item"><span class="param-label">Starting MAU</span><span class="param-value">${params.startingMAU.toLocaleString()}</span></div>
            <div class="param-item"><span class="param-label">Projection Period</span><span class="param-value">${params.projectionMonths} months</span></div>
        </div>
        <div class="param-group">
            <h4>Growth</h4>
            ${growthHTML}
        </div>
        <div class="param-group">
            <h4>Conversion & Retention</h4>
            <div class="param-item"><span class="param-label">Initial Conversion</span><span class="param-value">${(params.initialConversion * 100).toFixed(1)}%</span></div>
            <div class="param-item"><span class="param-label">Conversion Growth</span><span class="param-value">${(params.conversionGrowth * 100).toFixed(2)}%/yr</span></div>
            <div class="param-item"><span class="param-label">Initial Churn</span><span class="param-value">${(params.initialChurnRate * 100).toFixed(1)}%/mo</span></div>
            <div class="param-item"><span class="param-label">Churn Improvement</span><span class="param-value">${(params.churnImprovement * 100).toFixed(2)}%/yr</span></div>
        </div>
        <div class="param-group">
            <h4>Investment</h4>
            <div class="param-item"><span class="param-label">Seed Investment</span><span class="param-value">${formatCurrency(params.seedInvestment)}</span></div>
            <div class="param-item"><span class="param-label">Equity Offered</span><span class="param-value">${(params.equityOffered * 100).toFixed(1)}%</span></div>
            <div class="param-item"><span class="param-label">Exit Multiple</span><span class="param-value">${params.valuationMultiple}x ARR</span></div>
        </div>
    `;
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error("jsPDF is not loaded");
        return;
    }

    const doc = new jsPDF();
    const summary = globalSummaryData;
    const params = summary.parameters;

    doc.setFontSize(18);
    doc.text("NutriSnap Financial Forecast", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);

    let yPos = 32;

    doc.setFontSize(12);
    doc.text("Input Parameters", 14, yPos);
    yPos += 6;

    const paramBody = [
        ['Monthly Price', formatCurrency(params.appPrice)],
        ['Annual Discount', `${(params.annualDiscount * 100).toFixed(0)}%`],
        ['Annual Plan Uptake', `${(params.annualPlanPercentage * 100).toFixed(0)}%`],
        ['Starting MAU', params.startingMAU.toLocaleString()],
        ['Y1 Growth', `${(params.growthRates[1] * 100).toFixed(0)}%/mo`],
        ['Initial Conversion', `${(params.initialConversion * 100).toFixed(1)}%`],
        ['Initial Churn', `${(params.initialChurnRate * 100).toFixed(1)}%`],
        ['Seed Investment', formatCurrency(params.seedInvestment)],
    ];

    doc.autoTable({
        startY: yPos,
        body: paramBody,
        theme: 'plain',
        styles: { fontSize: 9 },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.text("Financial Summary", 14, yPos);
    yPos += 6;

    const summaryBody = [
        ['Final MAU', summary.finalMAU.toLocaleString()],
        ['Final ARR', formatCurrency(summary.finalARR)],
        ['Break-even Month', summary.breakEvenMonth ? `Month ${summary.breakEvenMonth}` : 'Not reached'],
        ['Exit Valuation', formatCurrency(summary.exitValuation)],
        ['Investor Return', formatCurrency(summary.investorReturn) + ` (${summary.returnMultiple.toFixed(1)}x)`],
        ['LTV:CAC Ratio', `${summary.ltvCacRatio}:1`],
        ['Runway', `${summary.runway} months`],
    ];

    doc.autoTable({
        startY: yPos,
        body: summaryBody,
        theme: 'plain',
        styles: { fontSize: 9 },
    });
    
    yPos = doc.lastAutoTable.finalY + 10;

    const head = [['Month', 'MAU', 'Growth', 'Premium Users', 'Conversion', 'Revenue', 'ARR', 'Costs', 'Net Income', 'Cash Balance']];
    const body = globalMonthlyData.map(d => [
        d.month,
        d.mau.toLocaleString(),
        `${(d.growthRate * 100).toFixed(0)}%`,
        d.premiumUsers.toLocaleString(),
        `${(d.conversionRate * 100).toFixed(1)}%`,
        formatCurrency(d.monthlyRevenue),
        formatCurrency(d.arr),
        formatCurrency(d.monthlyCosts),
        formatCurrency(d.netIncome),
        formatCurrency(d.cashBalance)
    ]);

    doc.autoTable({
        startY: yPos,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] },
    });

    doc.save('nutrisnap_forecast.pdf');
}

// Export functions
function exportToCSV() {
    const summary = globalSummaryData;
    const params = summary.parameters;
    
    // Start CSV with parameters summary
    let csv = 'NutriSnap Financial Forecast\n';
    csv += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Input Parameters Section
    csv += 'INPUT PARAMETERS\n';
    csv += 'Parameter,Value\n';
    csv += `Monthly Price,${formatCurrency(params.appPrice)}\n`;
    csv += `Annual Discount,${(params.annualDiscount * 100).toFixed(0)}%\n`;
    csv += `Annual Plan Uptake,${(params.annualPlanPercentage * 100).toFixed(0)}%\n`;
    csv += `Starting MAU,${params.startingMAU.toLocaleString()}\n`;
    csv += `Projection Period,${params.projectionMonths} months\n`;
    
    // Growth Parameters (dynamic based on available years)
    Object.keys(params.growthRates).forEach(year => {
        csv += `Year ${year} Growth,${(params.growthRates[year] * 100).toFixed(0)}%/mo\n`;
    });
    
    csv += `Initial Conversion,${(params.initialConversion * 100).toFixed(1)}%\n`;
    csv += `Conversion Growth,${(params.conversionGrowth * 100).toFixed(2)}%/yr\n`;
    csv += `Initial Churn,${(params.initialChurnRate * 100).toFixed(1)}%/mo\n`;
    csv += `Churn Improvement,${(params.churnImprovement * 100).toFixed(2)}%/yr\n`;
    csv += `B2B Start Month,${params.b2bStartMonth}\n`;
    csv += `B2B Revenue %,${(params.b2bPercentage * 100).toFixed(0)}%\n`;
    csv += `Seed Investment,${formatCurrency(params.seedInvestment)}\n`;
    csv += `Equity Offered,${(params.equityOffered * 100).toFixed(1)}%\n`;
    csv += `Exit Multiple,${params.valuationMultiple}x ARR\n\n`;
    
    // Financial Summary Section
    csv += 'FINANCIAL SUMMARY\n';
    csv += 'Metric,Value\n';
    csv += `Final MAU,${summary.finalMAU.toLocaleString()}\n`;
    csv += `Final ARR,${formatCurrency(summary.finalARR)}\n`;
    csv += `Break-even Month,${summary.breakEvenMonth ? `Month ${summary.breakEvenMonth}` : 'Not reached'}\n`;
    csv += `Exit Valuation,${formatCurrency(summary.exitValuation)}\n`;
    csv += `Investor Return,${formatCurrency(summary.investorReturn)} (${summary.returnMultiple.toFixed(1)}x)\n`;
    csv += `Total Revenue,${formatCurrency(summary.totalRevenue)}\n`;
    csv += `Total Costs,${formatCurrency(summary.totalCosts)}\n`;
    csv += `Net Profit/Loss,${formatCurrency(summary.netProfit)}\n`;
    csv += `LTV:CAC Ratio,${summary.ltvCacRatio}:1\n`;
    csv += `Runway,${summary.runway} months\n`;
    csv += `Current Burn Rate,${summary.currentBurnRate > 0 ? formatCurrency(summary.currentBurnRate) : 'Profitable'}\n\n`;
    
    // Monthly Data Section
    csv += 'MONTHLY BREAKDOWN\n';
    csv += 'Month,MAU,Growth Rate,Premium Users,Conversion Rate,Monthly Revenue,ARR,Team Costs,Tech Costs,Marketing Costs,Total Costs,Net Income,Cash Balance\n';
    
    globalMonthlyData.forEach(data => {
        csv += `${data.month},${data.mau},${(data.growthRate * 100).toFixed(1)}%,${data.premiumUsers},`;
        csv += `${(data.conversionRate * 100).toFixed(1)}%,${data.monthlyRevenue.toFixed(2)},${data.arr.toFixed(2)},`;
        csv += `${data.teamCost.toFixed(2)},${data.techCost.toFixed(2)},${data.marketingCost.toFixed(2)},`;
        csv += `${data.monthlyCosts.toFixed(2)},${data.netIncome.toFixed(2)},${data.cashBalance.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nutrisnap_forecast.csv';
    a.click();
}

// Advanced Features Toggle Functions
function toggleTieredPricing() {
    const enabled = document.getElementById('enableTieredPricing').checked;
    const section = document.getElementById('tieredPricingSection');
    const analysis = document.getElementById('tieredRevenueAnalysis');
    
    section.style.display = enabled ? 'block' : 'none';
    analysis.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        document.getElementById('advancedAnalytics').style.display = 'block';
    } else {
        updateAdvancedAnalyticsVisibility();
    }
    
    calculateProjections();
}

function toggleCohortTracking() {
    const enabled = document.getElementById('enableCohortTracking').checked;
    const section = document.getElementById('cohortTrackingSection');
    const analysis = document.getElementById('cohortAnalysis');
    
    section.style.display = enabled ? 'block' : 'none';
    analysis.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        document.getElementById('advancedAnalytics').style.display = 'block';
    } else {
        updateAdvancedAnalyticsVisibility();
    }
    
    calculateProjections();
}

function toggleVariableCosts() {
    const enabled = document.getElementById('enableVariableCosts').checked;
    const section = document.getElementById('variableCostsSection');
    const analysis = document.getElementById('variableCostAnalysis');
    
    section.style.display = enabled ? 'block' : 'none';
    analysis.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        document.getElementById('advancedAnalytics').style.display = 'block';
    } else {
        updateAdvancedAnalyticsVisibility();
    }
    
    calculateProjections();
}

function toggleMultipleRounds() {
    const enabled = document.getElementById('enableMultipleRounds').checked;
    const section = document.getElementById('multipleRoundsSection');
    const analysis = document.getElementById('fundingRoundsAnalysis');
    
    section.style.display = enabled ? 'block' : 'none';
    analysis.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        document.getElementById('advancedAnalytics').style.display = 'block';
    } else {
        updateAdvancedAnalyticsVisibility();
    }
    
    calculateProjections();
}

function updateAdvancedAnalyticsVisibility() {
    const hasTiered = document.getElementById('enableTieredPricing').checked;
    const hasCohort = document.getElementById('enableCohortTracking').checked;
    const hasVariable = document.getElementById('enableVariableCosts').checked;
    const hasMultiple = document.getElementById('enableMultipleRounds').checked;
    
    const showAdvanced = hasTiered || hasCohort || hasVariable || hasMultiple;
    document.getElementById('advancedAnalytics').style.display = showAdvanced ? 'block' : 'none';
}

// Advanced Analytics Functions
function updateTieredRevenueAnalysis(tieredData) {
    const container = document.getElementById('tieredRevenueContent');
    if (!tieredData) return;
    
    let html = '<div class="tier-breakdown">';
    
    tieredData.forEach(tier => {
        html += `
            <div class="tier-card">
                <h5>${tier.name}</h5>
                <div class="cost-item">
                    <span class="cost-label">Users</span>
                    <span class="cost-value">${tier.users.toLocaleString()}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Monthly Revenue</span>
                    <span class="cost-value">${formatCurrency(tier.revenue)}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">% of Total</span>
                    <span class="cost-value">${tier.percentage.toFixed(1)}%</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function updateCohortAnalysis(cohortData) {
    const container = document.getElementById('cohortAnalysisContent');
    if (!cohortData) return;
    
    let html = '<table class="cohort-table">';
    html += '<tr><th>Cohort Month</th><th>Initial Users</th><th>Retention Rate</th><th>Current Users</th><th>Avg LTV</th></tr>';
    
    cohortData.forEach(cohort => {
        html += `
            <tr>
                <td>Month ${cohort.month}</td>
                <td>${cohort.initialUsers.toLocaleString()}</td>
                <td>${(cohort.retentionRate * 100).toFixed(1)}%</td>
                <td>${cohort.currentUsers.toLocaleString()}</td>
                <td>${formatCurrency(cohort.avgLtv)}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

function updateVariableCostAnalysis(variableData) {
    const container = document.getElementById('variableCostContent');
    if (!variableData) return;
    
    let html = '';
    
    variableData.forEach(item => {
        html += `
            <div class="variable-cost-item">
                <span class="cost-label">${item.label}</span>
                <span class="cost-value">${formatCurrency(item.value)}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateFundingRoundsAnalysis(fundingData) {
    const container = document.getElementById('fundingRoundsContent');
    if (!fundingData) return;
    
    let html = '';
    
    fundingData.rounds.forEach(round => {
        html += `
            <div class="funding-round-item">
                <div>
                    <div class="round-name">${round.name}</div>
                    <div class="round-details">Month ${round.month} | ${formatCurrency(round.amount)}</div>
                </div>
                <div>
                    <div style="color: #f87171;">${round.equity}% equity</div>
                    <div class="round-details">Valuation: ${formatCurrency(round.valuation)}</div>
                </div>
            </div>
        `;
    });
    
    html += '<div class="dilution-tracker">';
    html += '<h5 style="color: #667eea; margin-bottom: 10px;">Ownership Dilution</h5>';
    
    fundingData.dilution.forEach(item => {
        html += `
            <div class="dilution-item">
                <span>${item.stakeholder}</span>
                <span>${item.ownership}%</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Initialize on page load
window.onload = function() {
    updateAnnualPrice();
    updateAnnualCostDisplays();
    updateCostStructureVisibility();
    calculateProjections();
}; 