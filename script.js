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
    const initialChurnRate = parseFloat(document.getElementById('churnRate').value) / 100; // Legacy for compatibility
    const freeChurnRate = parseFloat(document.getElementById('freeChurnRate')?.value || '6') / 100;
    const paidChurnRate = parseFloat(document.getElementById('paidChurnRate')?.value || '3') / 100;
    const churnImprovement = parseFloat(document.getElementById('churnImprovement').value) / 100;
    
    // Validation to prevent NaN issues
    if (isNaN(freeChurnRate) || isNaN(paidChurnRate) || isNaN(churnImprovement) || isNaN(startingMAU) || isNaN(projectionMonths)) {
        console.error('Invalid input values:', { freeChurnRate, paidChurnRate, churnImprovement, startingMAU, projectionMonths });
        return;
    }
    
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
    
    // Collect beta period parameters
    const betaUsersM0 = parseInt(document.getElementById('betaUsersM0').value) || 50;
    const betaUsersM1 = parseInt(document.getElementById('betaUsersM1').value) || 120;
    const betaUsersM2 = parseInt(document.getElementById('betaUsersM2').value) || 200;
    const betaTeamCostM0 = isNaN(parseFloat(document.getElementById('betaTeamCostM0').value)) ? 0 : parseFloat(document.getElementById('betaTeamCostM0').value);
    const betaTeamCostM1 = isNaN(parseFloat(document.getElementById('betaTeamCostM1').value)) ? 0 : parseFloat(document.getElementById('betaTeamCostM1').value);
    const betaTeamCostM2 = isNaN(parseFloat(document.getElementById('betaTeamCostM2').value)) ? 0 : parseFloat(document.getElementById('betaTeamCostM2').value);
    const betaTechCostM0 = isNaN(parseFloat(document.getElementById('betaTechCostM0').value)) ? 0 : parseFloat(document.getElementById('betaTechCostM0').value);
    const betaTechCostM1 = isNaN(parseFloat(document.getElementById('betaTechCostM1').value)) ? 0 : parseFloat(document.getElementById('betaTechCostM1').value);
    const betaTechCostM2 = isNaN(parseFloat(document.getElementById('betaTechCostM2').value)) ? 0 : parseFloat(document.getElementById('betaTechCostM2').value);
    const betaMarketingCostM0 = isNaN(parseFloat(document.getElementById('betaMarketingCostM0').value)) ? 0 : parseFloat(document.getElementById('betaMarketingCostM0').value);
    const betaMarketingCostM1 = isNaN(parseFloat(document.getElementById('betaMarketingCostM1').value)) ? 0 : parseFloat(document.getElementById('betaMarketingCostM1').value);
    const betaMarketingCostM2 = isNaN(parseFloat(document.getElementById('betaMarketingCostM2').value)) ? 0 : parseFloat(document.getElementById('betaMarketingCostM2').value);

    const parameters = {
        appPrice, annualDiscount, annualPlanPercentage, projectionMonths, startingMAU,
        growthRates, initialConversion, conversionGrowth, initialChurnRate, freeChurnRate, paidChurnRate, churnImprovement,
        b2bStartMonth, b2bPercentage, teamCosts, techCosts, marketingCosts,
        seedInvestment, equityOffered, valuationMultiple,
        // Beta period parameters
        betaUsersM0, betaUsersM1, betaUsersM2,
        betaTeamCostM0, betaTeamCostM1, betaTeamCostM2,
        betaTechCostM0, betaTechCostM1, betaTechCostM2,
        betaMarketingCostM0, betaMarketingCostM1, betaMarketingCostM2
    };
    populateParametersSummary(parameters);
    
    // Calculate projections
    let monthlyData = [];
    let mau = startingMAU;
    let premiumUsers = 0;
    let tierUserCounts = {}; // For tiered pricing
    let newPremiumUsersByMonth = {}; // For cohort analysis
    let totalRevenue = 0;
    let totalCosts = 0;
    let breakEvenMonth = null;
    let cashBalance = seedInvestment;
    let currentBurnRate = 0;
    
    // Year-by-year cost tracking
    let yearCosts = {};
    
    // Start from -2 to include 3 beta development months before Month 1
    for (let monthIndex = -2; monthIndex <= projectionMonths; monthIndex++) {
        // Calculate display month (months -2, -1, 0 all show as "Month 0", then Month 1, 2, 3...)
        const displayMonth = monthIndex < 1 ? 0 : monthIndex;
        
        // Adjust year calculation - Year 1 starts from Month 1 onwards
        const year = monthIndex < 1 ? 1 : Math.ceil(monthIndex / 12);
        // Use the appropriate growth rate, fallback to last available if year exceeds available rates
        const lastAvailableGrowthYear = Math.max(...Object.keys(growthRates).map(Number));
        const growthRate = growthRates[Math.min(year, lastAvailableGrowthYear)] || growthRates[lastAvailableGrowthYear];
        
        const yearsElapsed = Math.max(0, (monthIndex - 1) / 12); // Start counting from month 1
        const conversionRate = Math.min(initialConversion + (conversionGrowth * yearsElapsed), 0.25);
        const churnRate = Math.max(initialChurnRate - (churnImprovement * yearsElapsed), 0.015);
        
        // PROPER MAU WATERFALL CALCULATION
        let freeUsers, newMAU, churnedMAU;
        
        if (monthIndex < 1) {
            // Beta development months (-2, -1, 0): Use beta development values
            const betaUsersM0 = parseInt(document.getElementById('betaUsersM0').value) || 50;
            const betaUsersM1 = parseInt(document.getElementById('betaUsersM1').value) || 120;
            const betaUsersM2 = parseInt(document.getElementById('betaUsersM2').value) || 200;
            
            if (monthIndex === -2) {
                mau = betaUsersM0;
            } else if (monthIndex === -1) {
                mau = betaUsersM1;
            } else if (monthIndex === 0) {
                mau = betaUsersM2;
            }
            
            premiumUsers = 0;
            freeUsers = mau;
        } else if (monthIndex === 1) {
            // Month 1: App launch - start with designated MAU from slider
            mau = startingMAU;
            premiumUsers = 0; // No premium users yet from beta months
            freeUsers = mau;
        } else {
            // Apply churn to existing users FIRST (before any growth)
            // Use separate churn rates with annual improvement
            const currentFreeChurnRate = Math.max(freeChurnRate - (churnImprovement * yearsElapsed), 0.02);
            const currentPaidChurnRate = Math.max(paidChurnRate - (churnImprovement * yearsElapsed), 0.01);
            
            // Calculate churn for each segment
            const existingFreeUsers = mau - premiumUsers;
            const churnedFreeUsers = Math.round(existingFreeUsers * currentFreeChurnRate);
            const churnedPremiumUsers = Math.round(premiumUsers * currentPaidChurnRate);
            churnedMAU = churnedFreeUsers + churnedPremiumUsers;
            
            // Apply churn first
            const retainedFreeUsers = existingFreeUsers - churnedFreeUsers;
            const retainedPremiumUsers = premiumUsers - churnedPremiumUsers;
            const retainedMAU = retainedFreeUsers + retainedPremiumUsers;
            
            // Calculate new user acquisition based on retained user base
            newMAU = Math.round(retainedMAU * growthRate);
            
            // Update totals
            freeUsers = retainedFreeUsers + newMAU; // All new users start as free
            premiumUsers = retainedPremiumUsers; // Premium users only from retention + conversion
            mau = freeUsers + premiumUsers;
        }
        
        let monthlyRevenue = 0;
        let totalNewPremiumUsersThisMonth = 0;
        let monthlyTierRevenue = {}; // To track revenue per tier for this month

        // Calculate combined conversion rate for tiered pricing
        let combinedConversionRate = conversionRate; // Default to single-tier rate
        
        // CONVERSION FROM FREE TO PREMIUM (only from free user pool, starts in month 1)
        if (monthIndex >= 1 && document.getElementById('enableTieredPricing').checked) {
            const activeTiers = getActiveTiers();
            
            // Calculate combined conversion rate from all active tiers
            combinedConversionRate = activeTiers.reduce((sum, tier) => sum + tier.conversionRate, 0);
            
            // Apply tier-specific churn to existing tier users (already done above for total premium)
            if (monthIndex > 1) {
                // Proportionally reduce each tier based on overall premium churn
                const currentPaidChurnRate = Math.max(paidChurnRate - (churnImprovement * yearsElapsed), 0.01);
                for (const tier of activeTiers) {
                    if (tierUserCounts[tier.name]) {
                        tierUserCounts[tier.name] = Math.round(tierUserCounts[tier.name] * (1 - currentPaidChurnRate));
                    }
                }
            }

            // Convert free users to premium tiers
            activeTiers.forEach(tier => {
                const newUsersForTier = Math.round(freeUsers * tier.conversionRate);
                tierUserCounts[tier.name] = (tierUserCounts[tier.name] || 0) + newUsersForTier;
                totalNewPremiumUsersThisMonth += newUsersForTier;
            });
            
            // Calculate total premium users and adjust free users
            premiumUsers = 0;
            for (const tier of activeTiers) {
                premiumUsers += tierUserCounts[tier.name] || 0;
            }
            
            // Update free users after conversions
            freeUsers = Math.max(0, mau - premiumUsers);

            // Calculate revenue for each tier
            monthlyRevenue = 0;
            for (const tier of activeTiers) {
                const tierUsers = tierUserCounts[tier.name] || 0;

                const tierMonthlyUsers = Math.round(tierUsers * (1 - annualPlanPercentage));
                const tierAnnualUsers = tierUsers - tierMonthlyUsers;
                const tierAnnualPrice = tier.price * 12 * (1 - annualDiscount);
                
                const revenueForTier = (tierMonthlyUsers * tier.price) + (tierAnnualUsers * (tierAnnualPrice / 12));
                monthlyRevenue += revenueForTier;
                monthlyTierRevenue[tier.name] = revenueForTier;
            }
        } else if (monthIndex >= 1) {
            // Standard single-tier pricing - convert from free user pool (starts in month 1)
            tierUserCounts = {}; // Clear any stale tiered data
            
            // Convert free users to premium
            const newPremiumUsers = Math.round(freeUsers * conversionRate);
            premiumUsers += newPremiumUsers;
            totalNewPremiumUsersThisMonth = newPremiumUsers;
            
            // Update free users after conversion
            freeUsers = Math.max(0, mau - premiumUsers);
            
            const monthlyUsers = Math.round(premiumUsers * (1 - annualPlanPercentage));
            const annualUsers = premiumUsers - monthlyUsers;
            monthlyRevenue = (monthlyUsers * appPrice) + (annualUsers * (annualPrice / 12));
        } else {
            // Beta development period: no paid conversions, no revenue
            tierUserCounts = {}; // Clear any stale tiered data
            premiumUsers = 0;
            totalNewPremiumUsersThisMonth = 0;
            monthlyRevenue = 0;
        }

        newPremiumUsersByMonth[monthIndex] = totalNewPremiumUsersThisMonth;
        // Premium users are now properly calculated above - no need to constrain again
        
        let b2bRevenue = 0;
        if (monthIndex >= 1 && monthIndex >= b2bStartMonth && b2bPercentage > 0) {
            b2bRevenue = monthlyRevenue * b2bPercentage;
        }
        
        const totalMonthlyRevenue = monthlyRevenue + b2bRevenue;
        const arr = totalMonthlyRevenue * 12;
        totalRevenue += totalMonthlyRevenue;
        
        // Cost calculation with beta period handling
        let monthlyTeamCost, monthlyTechCost, monthlyMarketingCost;
        
        if (monthIndex < 1) {
            // Beta development costs - use specific beta cost inputs (respect zero values)
            if (monthIndex === -2) {
                monthlyTeamCost = isNaN(parseFloat(document.getElementById('betaTeamCostM0').value)) ? 0 : parseFloat(document.getElementById('betaTeamCostM0').value);
                monthlyTechCost = isNaN(parseFloat(document.getElementById('betaTechCostM0').value)) ? 0 : parseFloat(document.getElementById('betaTechCostM0').value);
                monthlyMarketingCost = isNaN(parseFloat(document.getElementById('betaMarketingCostM0').value)) ? 0 : parseFloat(document.getElementById('betaMarketingCostM0').value);
            } else if (monthIndex === -1) {
                monthlyTeamCost = isNaN(parseFloat(document.getElementById('betaTeamCostM1').value)) ? 0 : parseFloat(document.getElementById('betaTeamCostM1').value);
                monthlyTechCost = isNaN(parseFloat(document.getElementById('betaTechCostM1').value)) ? 0 : parseFloat(document.getElementById('betaTechCostM1').value);
                monthlyMarketingCost = isNaN(parseFloat(document.getElementById('betaMarketingCostM1').value)) ? 0 : parseFloat(document.getElementById('betaMarketingCostM1').value);
            } else if (monthIndex === 0) {
                monthlyTeamCost = isNaN(parseFloat(document.getElementById('betaTeamCostM2').value)) ? 0 : parseFloat(document.getElementById('betaTeamCostM2').value);
                monthlyTechCost = isNaN(parseFloat(document.getElementById('betaTechCostM2').value)) ? 0 : parseFloat(document.getElementById('betaTechCostM2').value);
                monthlyMarketingCost = isNaN(parseFloat(document.getElementById('betaMarketingCostM2').value)) ? 0 : parseFloat(document.getElementById('betaMarketingCostM2').value);
            }
        } else {
            // Regular production costs for month 1+
            const currentYear = Math.ceil(monthIndex / 12);
            const lastAvailableCostYear = Math.max(...Object.keys(teamCosts).map(Number));
            const costYear = Math.min(currentYear, lastAvailableCostYear);
            const baseTeamCost = teamCosts[costYear] || teamCosts[lastAvailableCostYear] || 0;
            const baseTechCost = techCosts[costYear] || techCosts[lastAvailableCostYear] || 0;
            const baseMarketingCost = marketingCosts[costYear] || marketingCosts[lastAvailableCostYear] || 0;
            
            // Apply enhanced cost management (escalations and marketing phases)
            const adjustedCosts = applyCostEscalations(baseTeamCost, baseTechCost, baseMarketingCost, monthIndex);
            monthlyTeamCost = adjustedCosts.teamCost;
            monthlyTechCost = adjustedCosts.techCost;
            monthlyMarketingCost = adjustedCosts.marketingCost;
        }
        
        // Add variable costs if enabled (but not during beta development months)
        let monthlyVariableCosts = 0;
        if (monthIndex >= 1 && document.getElementById('enableVariableCosts').checked) {
            const costPerUser = parseFloat(document.getElementById('costPerUser').value) || 0;
            const supportCostPerUser = parseFloat(document.getElementById('supportCostPerUser').value) || 0;
            const infraScaling = parseFloat(document.getElementById('infraScaling').value) || 1;
            
            // Calculate costs separately for free and paid users (ensure no negative free users)
            const freeUsers = Math.max(0, mau - premiumUsers);
            const basicUserCosts = freeUsers * costPerUser;
            const premiumUserCosts = premiumUsers * supportCostPerUser;
            
            // Apply infrastructure scaling
            monthlyVariableCosts = (basicUserCosts + premiumUserCosts) * infraScaling;
        }
        
        const monthlyCosts = monthlyTeamCost + monthlyTechCost + monthlyMarketingCost + monthlyVariableCosts;
        totalCosts += monthlyCosts;
        
        const netIncome = totalMonthlyRevenue - monthlyCosts;
        cashBalance += netIncome;
        
        // Add funding rounds if enabled (starts in month 1)
        if (monthIndex >= 1 && document.getElementById('enableMultipleRounds').checked) {
            const seriesAMonth = parseInt(document.getElementById('seriesAMonth').value);
            const seriesAAmount = parseFloat(document.getElementById('seriesAAmount').value);
            const seriesBMonth = parseInt(document.getElementById('seriesBMonth').value);
            const seriesBAmount = parseFloat(document.getElementById('seriesBAmount').value);
            const seriesCMonth = parseInt(document.getElementById('seriesCMonth').value);
            const seriesCAmount = parseFloat(document.getElementById('seriesCAmount').value);
            
            if (monthIndex === seriesAMonth && seriesAMonth <= projectionMonths) {
                cashBalance += seriesAAmount;
            }
            if (monthIndex === seriesBMonth && seriesBMonth <= projectionMonths) {
                cashBalance += seriesBAmount;
            }
            if (monthIndex === seriesCMonth && seriesCMonth <= projectionMonths) {
                cashBalance += seriesCAmount;
            }
        }
        
        // Track current burn rate (negative net income)
        if (netIncome < 0) {
            currentBurnRate = -netIncome;
        }
        
        if (breakEvenMonth === null && netIncome > 0) {
            breakEvenMonth = monthIndex >= 1 ? monthIndex : 1;
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
            month: displayMonth,
            mau: mau,
            growthRate: growthRate,
            premiumUsers: premiumUsers,
            tierUserCounts: { ...tierUserCounts }, // Store a snapshot of tier counts for this month
            monthlyTierRevenue: { ...monthlyTierRevenue }, // Store revenue breakdown
            conversionRate: combinedConversionRate, // Use combined rate for tiered pricing
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
    
    // Calculate LTV more accurately using paid user churn rate
    const avgPaidChurnRate = Math.max(paidChurnRate - (churnImprovement * (projectionMonths / 12)), 0.01);
    const avgLifespan = 1 / avgPaidChurnRate; // months
    
    let avgMonthlyRevenue;
    if (document.getElementById('enableTieredPricing').checked) {
        // Calculate weighted average based on active tiers and their conversion rates
        const activeTiers = getActiveTiers();
        let totalWeightedRevenue = 0;
        let totalConversionWeight = 0;
        
        activeTiers.forEach(tier => {
            const tierPrice = (tier.price * (1 - annualPlanPercentage)) + ((tier.price * 12 * (1 - annualDiscount)) / 12 * annualPlanPercentage);
            totalWeightedRevenue += tierPrice * tier.conversionRate;
            totalConversionWeight += tier.conversionRate;
        });
        
        avgMonthlyRevenue = totalConversionWeight > 0 ? totalWeightedRevenue / totalConversionWeight : 0;
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
    const totalUsersAcquired = Object.values(newPremiumUsersByMonth).reduce((a, b) => a + b, 0);
    
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
        const activeTiers = getActiveTiers();
        
        tieredData = [];
        let totalFinalMonthRevenue = 0;

        // Use the accurately tracked user counts and revenue from the final month
        activeTiers.forEach(tier => {
            const finalUsers = finalMonthData.tierUserCounts[tier.name] || 0;
            const finalRevenue = finalMonthData.monthlyTierRevenue[tier.name] || 0;
            totalFinalMonthRevenue += finalRevenue;

            tieredData.push({
                name: tier.name,
                users: finalUsers,
                revenue: finalRevenue,
                price: tier.price,
                percentage: 0 // Will be calculated based on revenue
            });
        });
        
        // Calculate revenue percentages based on the final month's revenue
        tieredData.forEach(tier => {
            tier.percentage = totalFinalMonthRevenue > 0 ? (tier.revenue / totalFinalMonthRevenue) * 100 : 0;
        });
    }
    
    // Process Cohort Analysis
    if (document.getElementById('enableCohortTracking').checked) {
        const retentionDecay = parseFloat(document.getElementById('retentionDecay').value) / 100 || 0.015;
        
        cohortData = [];
        
        // Track each monthly cohort of newly acquired premium users (starting from month 1)
        for (let cohortMonth = 1; cohortMonth <= Math.min(projectionMonths, 12); cohortMonth++) {
            // Calculate new users acquired in this cohort month
            const newUsersAcquired = newPremiumUsersByMonth[cohortMonth] || 0;
            
            // Calculate how many of this cohort remain at the end of the projection
            const monthsElapsed = projectionMonths - cohortMonth;
            if (monthsElapsed >= 0) {
                // Apply churn over time with decay (older cohorts have worse retention)
                const baseChurnRate = Math.max(initialChurnRate - (churnImprovement * ((cohortMonth - 1) / 12)), 0.015);
                const decayedChurnRate = baseChurnRate + (retentionDecay * (monthsElapsed / 12));
                const finalChurnRate = Math.min(decayedChurnRate, 0.15); // Cap at 15% monthly churn
                
                // Calculate retention rate after monthsElapsed
                const retentionRate = Math.pow(1 - finalChurnRate, monthsElapsed);
                const remainingUsers = Math.round(newUsersAcquired * retentionRate);
                
                // Calculate LTV for this cohort based on their retention
                const cohortAvgLifespan = 1 / finalChurnRate; // months
                const cohortLtv = avgMonthlyRevenue * cohortAvgLifespan;
                
                cohortData.push({
                    month: cohortMonth,
                    initialUsers: newUsersAcquired,
                    monthsElapsed: monthsElapsed,
                    retentionRate: retentionRate,
                    currentUsers: remainingUsers,
                    avgLtv: cohortLtv,
                    churnRate: finalChurnRate
                });
            }
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
    
    // Always show sensitivity analysis with actual input parameters
    updateSensitivityAnalysis(acquisitionMetrics, ltv, initialChurnRate, finalARR, netProfit, totalRevenue, totalCosts);
    
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
        monthlyARPU: avgMonthlyRevenue,
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
    
    // Show free vs paid breakdown if tiered pricing is enabled
    const freeUsersBreakdownElement = document.getElementById('freeUsersBreakdown');
    const freeVsPaidElement = document.getElementById('freeVsPaid');
    
    if (document.getElementById('enableTieredPricing').checked && freeUsersBreakdownElement && freeVsPaidElement) {
        const finalPaidUsers = finalData.premiumUsers;
        const finalFreeUsers = finalData.mau - finalPaidUsers;
        const paidPercentage = ((finalPaidUsers / finalData.mau) * 100).toFixed(1);
        
        freeUsersBreakdownElement.style.display = 'block';
        freeVsPaidElement.innerHTML = `
            <div style="font-size: 0.85rem; line-height: 1.4;">
                <div style="color: #4ade80;">FREE: ${finalFreeUsers.toLocaleString()} users</div>
                <div style="color: #667eea;">PAID: ${finalPaidUsers.toLocaleString()} users (${paidPercentage}%)</div>
            </div>
        `;
    } else if (freeUsersBreakdownElement) {
        freeUsersBreakdownElement.style.display = 'none';
    }
    
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
    
    // Update ARPU
    const monthlyARPUElement = document.getElementById('monthlyARPU');
    if (monthlyARPUElement) monthlyARPUElement.textContent = formatCurrency(avgMonthlyRevenue);
    
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
    
    // Update table header visibility for Enterprise tier
    const enterpriseHeader = document.getElementById('enterpriseHeader');
    if (enterpriseHeader) {
        enterpriseHeader.style.display = document.getElementById('enableEnterpriseTier').checked ? 'table-cell' : 'none';
    }
    
    // Update table
    const tbody = document.getElementById('monthlyTableBody');
    if (!tbody) return; // Add null check
    
    tbody.innerHTML = '';
    
    monthlyData.forEach(data => {
        const row = tbody.insertRow();
        
        if (data.month === 12 || data.month === 24 || data.month === 36 || data.month === 48 || data.month === 60) {
            row.className = 'year-highlight';
        }
        
        // Calculate tier breakdown for this month using the stored snapshot
        const freeUsers = Math.max(0, data.mau - data.premiumUsers);
        
        let basicUsers = 0;
        let proUsers = 0; 
        let enterpriseUsers = 0;
        
        if (document.getElementById('enableTieredPricing').checked && data.tierUserCounts) {
            basicUsers = data.tierUserCounts['Basic'] || 0;
            proUsers = data.tierUserCounts['Pro'] || 0;
            enterpriseUsers = data.tierUserCounts['Enterprise'] || 0;
        } else {
            // Simple pricing - show all premium users as "Pro" since that's the default
            // To avoid confusion, let's put them in the Basic tier column, as it's the most fundamental paid tier.
            basicUsers = data.premiumUsers;
            proUsers = 0;
            enterpriseUsers = 0;
        }
        
        // Check if Enterprise tier is enabled
        const isEnterpriseEnabled = document.getElementById('enableEnterpriseTier').checked;
        const enterpriseColumn = isEnterpriseEnabled ? `<td>${enterpriseUsers.toLocaleString()}</td>` : '';
        
        // Calculate actual monthly conversion rate: (paid users) / MAU
        const totalPaidUsers = basicUsers + proUsers + enterpriseUsers;
        const actualConversionRate = data.mau > 0 ? (totalPaidUsers / data.mau) : 0;
        
        row.innerHTML = `
            <td>${data.month}${data.month === 12 ? ' (Year 1)' : data.month === 24 ? ' (Year 2)' : data.month === 36 ? ' (Year 3)' : data.month === 48 ? ' (Year 4)' : data.month === 60 ? ' (Year 5)' : ''}</td>
            <td>${data.mau.toLocaleString()}</td>
            <td>${(data.growthRate * 100).toFixed(0)}%</td>
            <td style="color: #4ade80;">${freeUsers.toLocaleString()}</td>
            <td style="color: #667eea;">${basicUsers.toLocaleString()}</td>
            <td style="color: #a855f7;">${proUsers.toLocaleString()}</td>
            ${enterpriseColumn}
            <td>${(actualConversionRate * 100).toFixed(1)}%</td>
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
    
    // Check if enhanced cost management is enabled
    const hasEscalations = document.getElementById('enableCostEscalation')?.checked && costEscalations.length > 0;
    const hasMarketingPhases = document.getElementById('enableMarketingPhases')?.checked;
    
    // Add summary note if enhanced features are active
    if (hasEscalations || hasMarketingPhases) {
        html += `
            <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 3px solid #667eea;">
                <div style="color: #667eea; font-weight: 600; margin-bottom: 5px;">📊 Enhanced Cost Management Active</div>
                <div style="font-size: 0.85rem; color: #ccc;">
                    ${hasEscalations ? `• ${costEscalations.length} cost escalation${costEscalations.length > 1 ? 's' : ''} applied` : ''}
                    ${hasEscalations && hasMarketingPhases ? '<br>' : ''}
                    ${hasMarketingPhases ? '• Marketing campaign phases override baseline costs' : ''}
                </div>
                <div style="font-size: 0.8rem; color: #999; margin-top: 5px;">
                    Costs shown below include all enhanced cost management adjustments
                </div>
            </div>
        `;
    }
    
    Object.keys(yearCosts).forEach(year => {
        const costs = yearCosts[year];
        const avgMonthlyTeam = costs.team / costs.months;
        const avgMonthlyTech = costs.tech / costs.months;
        const avgMonthlyMarketing = costs.marketing / costs.months;
        const avgMonthlyVariable = costs.variable / costs.months;
        const avgMonthlyTotal = costs.total / costs.months;
        
        // Check if this year has any cost variations due to enhanced features
        let hasVariations = false;
        if (hasEscalations || hasMarketingPhases) {
            // We'll assume there are variations if enhanced features are active
            hasVariations = true;
        }
        
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #667eea; margin-bottom: 10px;">
                    Year ${year}
                    ${hasVariations ? '<span style="color: #f59e0b; font-size: 0.8rem; margin-left: 8px;">📈 Enhanced</span>' : ''}
                </h4>
                <div class="cost-item">
                    <span class="cost-label">Team Costs
                        ${hasEscalations ? '<span class="info-icon" style="color: #667eea;">?</span><span class="tooltip">Includes cost escalations and baseline adjustments</span>' : ''}
                    </span>
                    <span class="cost-value">${formatCurrency(costs.team)} total (avg ${formatCurrency(avgMonthlyTeam)}/mo)</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Tech Costs
                        ${hasEscalations ? '<span class="info-icon" style="color: #667eea;">?</span><span class="tooltip">Includes cost escalations and baseline adjustments</span>' : ''}
                    </span>
                    <span class="cost-value">${formatCurrency(costs.tech)} total (avg ${formatCurrency(avgMonthlyTech)}/mo)</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Marketing Costs
                        ${hasMarketingPhases ? '<span class="info-icon" style="color: #f59e0b;">?</span><span class="tooltip">Uses marketing campaign phases instead of baseline costs</span>' : 
                          hasEscalations ? '<span class="info-icon" style="color: #667eea;">?</span><span class="tooltip">Includes cost escalations and baseline adjustments</span>' : ''}
                    </span>
                    <span class="cost-value">${formatCurrency(costs.marketing)} total (avg ${formatCurrency(avgMonthlyMarketing)}/mo)</span>
                </div>
                ${costs.variable > 0 ? `
                <div class="cost-item">
                    <span class="cost-label">Variable Costs</span>
                    <span class="cost-value">${formatCurrency(costs.variable)} total (avg ${formatCurrency(avgMonthlyVariable)}/mo)</span>
                </div>
                ` : ''}
                <div class="cost-item" style="border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold;">
                    <span class="cost-label">Total Costs</span>
                    <span class="cost-value">${formatCurrency(costs.total)} total (avg ${formatCurrency(avgMonthlyTotal)}/mo)</span>
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
    
    // Build pricing section based on tiered vs single pricing
    let pricingHTML = '';
    const isTieredPricingEnabled = document.getElementById('enableTieredPricing')?.checked;
    
    if (isTieredPricingEnabled) {
        const activeTiers = getActiveTiers();
        pricingHTML = `<div class="param-item"><span class="param-label">Pricing Model</span><span class="param-value">Tiered Pricing</span></div>`;
        
        // Show all active tier prices
        activeTiers.forEach(tier => {
            pricingHTML += `<div class="param-item"><span class="param-label">${tier.name} Tier Price</span><span class="param-value">${formatCurrency(tier.price)}</span></div>`;
        });
        
        // Show conversion rates for each tier
        activeTiers.forEach(tier => {
            pricingHTML += `<div class="param-item"><span class="param-label">${tier.name} Conversion</span><span class="param-value">${(tier.conversionRate * 100).toFixed(1)}%</span></div>`;
        });
    } else {
        pricingHTML = `<div class="param-item"><span class="param-label">Monthly Price</span><span class="param-value">${formatCurrency(params.appPrice)}</span></div>`;
    }
    
    container.innerHTML = `
        <div class="param-group">
            <h4>Beta Development Period (Months 0-2)</h4>
            <div class="param-item"><span class="param-label">Month 0 Beta Users</span><span class="param-value">${params.betaUsersM0.toLocaleString()}</span></div>
            <div class="param-item"><span class="param-label">Month 1 Beta Users</span><span class="param-value">${params.betaUsersM1.toLocaleString()}</span></div>
            <div class="param-item"><span class="param-label">Month 2 Beta Users</span><span class="param-value">${params.betaUsersM2.toLocaleString()}</span></div>
            <div class="param-item"><span class="param-label">Month 0 Total Costs</span><span class="param-value">${formatCurrency(params.betaTeamCostM0 + params.betaTechCostM0 + params.betaMarketingCostM0)}</span></div>
            <div class="param-item"><span class="param-label">Month 1 Total Costs</span><span class="param-value">${formatCurrency(params.betaTeamCostM1 + params.betaTechCostM1 + params.betaMarketingCostM1)}</span></div>
            <div class="param-item"><span class="param-label">Month 2 Total Costs</span><span class="param-value">${formatCurrency(params.betaTeamCostM2 + params.betaTechCostM2 + params.betaMarketingCostM2)}</span></div>
        </div>
        <div class="param-group">
            <h4>Revenue (App Launch Month 1+)</h4>
            ${pricingHTML}
            <div class="param-item"><span class="param-label">Annual Discount</span><span class="param-value">${(params.annualDiscount * 100).toFixed(0)}%</span></div>
            <div class="param-item"><span class="param-label">Annual Plan Uptake</span><span class="param-value">${(params.annualPlanPercentage * 100).toFixed(0)}%</span></div>
            <div class="param-item"><span class="param-label">Month 1 Launch MAU</span><span class="param-value">${params.startingMAU.toLocaleString()}</span></div>
            <div class="param-item"><span class="param-label">Projection Period</span><span class="param-value">${params.projectionMonths} months</span></div>
        </div>
        <div class="param-group">
            <h4>Growth</h4>
            ${growthHTML}
        </div>
        <div class="param-group">
            <h4>Conversion & Retention</h4>
            ${!isTieredPricingEnabled ? `
            <div class="param-item"><span class="param-label">Initial Conversion</span><span class="param-value">${(params.initialConversion * 100).toFixed(1)}%</span></div>
            <div class="param-item"><span class="param-label">Conversion Growth</span><span class="param-value">${(params.conversionGrowth * 100).toFixed(2)}%/yr</span></div>` : ''}
            <div class="param-item"><span class="param-label">Free User Churn</span><span class="param-value">${(params.freeChurnRate * 100).toFixed(1)}%/mo</span></div>
            <div class="param-item"><span class="param-label">Paid User Churn</span><span class="param-value">${(params.paidChurnRate * 100).toFixed(1)}%/mo</span></div>
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
    try {
        // Check if calculations have been run first
        if (!globalMonthlyData || globalMonthlyData.length === 0) {
            alert("Please run calculations first before exporting to PDF.");
            return;
        }

        // Check if jsPDF is available
        if (!window.jspdf) {
            alert('PDF library not loaded. Please refresh the page and try again.');
            return;
        }

        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('PDF library not properly initialized. Please refresh the page and try again.');
            return;
        }

        // Create PDF document
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Check if autoTable is available
        if (typeof doc.autoTable !== 'function') {
            // Create a simple PDF without tables
            doc.setFontSize(20);
            doc.text('NutriSnap Financial Forecast', 20, 20);
            
            doc.setFontSize(12);
            doc.text('PDF generated without table support.', 20, 40);
            doc.text('Please try a different browser or check your internet connection.', 20, 50);
            
            const timestamp = new Date().toISOString().split('T')[0];
            doc.save(`nutrisnap-simple-forecast-${timestamp}.pdf`);
            return;
        }

        // Continue with full PDF generation...
        
        // Helper functions - defined first to avoid hoisting issues
        const getElementText = (id) => {
            const el = document.getElementById(id);
            return el ? (el.textContent || el.innerText || 'N/A').trim() : 'N/A';
        };

        const getInputValue = (id) => {
            const el = document.getElementById(id);
            return el ? (el.value || 'N/A') : 'N/A';
        };

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Balanced margins and spacing for readability and space utilization
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        const lineHeight = 6;
        const sectionSpacing = 6;
        
        // Professional color palette
        const colors = {
            darkBlue: [30, 58, 138],
            lightBlue: [59, 130, 246], 
            darkGray: [55, 65, 81],
            lightGray: [156, 163, 175],
            green: [16, 185, 129],
            red: [239, 68, 68],
            background: [248, 250, 252]
        };

        let currentY = margin;

        // Get actual projection period
        const projectionMonths = parseInt(getInputValue('projectionMonths')) || 36;
        const projectionYears = Math.ceil(projectionMonths / 12);

            const checkPageBreak = (spaceNeeded = 20, keepTogether = false) => {
            if (currentY + spaceNeeded > pageHeight - margin) {
                doc.addPage();
                currentY = margin;
                return true;
            }
            return false;
        };

        const checkSectionPageBreak = (estimatedContentHeight) => {
            // Keep entire sections together but use more space efficiently
            if (currentY + estimatedContentHeight > pageHeight - margin - 8) {
                doc.addPage();
                currentY = margin;
                return true;
            }
            return false;
        };

        const estimateSectionSize = (rowCount, hasDescription = false) => {
            let size = 16; // Section header with better spacing
            if (hasDescription) size += 10; // Description text with better spacing
            size += (rowCount * 6.5); // Metric rows (actual row height with new spacing)
            size += 6; // Better bottom padding
            return size;
        };

        const getRemainingPageSpace = () => {
            return pageHeight - margin - currentY;
        };

        const canFitOnCurrentPage = (contentHeight) => {
            return getRemainingPageSpace() >= contentHeight + 12; // Reasonable safety margin
        };

            const addTitle = (text, fontSize = 20) => {
            checkPageBreak(fontSize + 8);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(fontSize);
            doc.setTextColor(...colors.darkBlue);
            doc.text(text, margin, currentY);
            currentY += fontSize + 6;
        };

        const addSection = (title, fontSize = 14, estimatedContentHeight = 40) => {
            // Check if entire section will fit, but be more aggressive with space usage
            if (!canFitOnCurrentPage(estimatedContentHeight)) {
                doc.addPage();
                currentY = margin;
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(fontSize);
            doc.setTextColor(...colors.lightBlue);
            doc.text(title, margin, currentY);
            currentY += fontSize + 3;
        };

            const addMetricRow = (label, value, isHeader = false) => {
            // Don't check page break here - let sections handle it
            
            if (isHeader) {
                // Header row with background
                doc.setFillColor(...colors.background);
                doc.rect(margin, currentY - 4, contentWidth, 7, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...colors.darkGray);
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...colors.darkGray);
            }
            
            doc.text(label, margin + 3, currentY);
            
            if (!isHeader) {
                doc.setFont('helvetica', 'bold');
                // Determine color based on value
                if (value.includes('£') && value.includes('-')) {
                    doc.setTextColor(...colors.red);
                } else if (value.includes('£') || value.includes('%')) {
                    doc.setTextColor(...colors.green);
                } else {
                    doc.setTextColor(...colors.darkGray);
                }
            }
            
            // Use more of the available width for the value
            doc.text(value, margin + 120, currentY);
            currentY += 6.5;
        };

    // PAGE 1: EXECUTIVE SUMMARY
            // Professional header
        doc.setFillColor(...colors.darkBlue);
        doc.rect(0, 0, pageWidth, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('NutriSnap Financial Forecast', margin, 18);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Professional Business Analysis & Financial Projections', margin, 25);
        
        currentY = 40;

            // Executive Summary
        addSection('Executive Summary');
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...colors.darkGray);
        const summaryText = `This comprehensive financial forecast analyzes NutriSnap's projected performance over a ${projectionYears}-year period (${projectionMonths} months), including revenue growth, customer acquisition metrics, and operational costs.`;
        const wrappedSummary = doc.splitTextToSize(summaryText, contentWidth);
        wrappedSummary.forEach(line => {
            checkPageBreak();
            doc.text(line, margin, currentY);
            currentY += 4.5;
        });
        currentY += 3;

            // Key Financial Metrics
        const keyMetricsSize = estimateSectionSize(10, false);
        addSection('Key Financial Metrics', 14, keyMetricsSize);
        
        addMetricRow('Metric', 'Value', true);
        addMetricRow(`Total Revenue (${projectionYears} years)`, getElementText('totalRevenue'));
        addMetricRow(`Total Costs (${projectionYears} years)`, getElementText('totalCosts'));
        addMetricRow(`Net Profit/Loss (${projectionYears} years)`, getElementText('netProfit'));
        addMetricRow('Final ARR', getElementText('finalARR'));
        addMetricRow('Break-even Month', getElementText('breakEvenMonth'));
        addMetricRow('Customer LTV', getElementText('customerLTV'));
        addMetricRow('Monthly ARPU', getElementText('monthlyARPU'));
        addMetricRow('Customer CAC', getElementText('customerCAC'));
        addMetricRow('LTV:CAC Ratio', getElementText('ltvCacRatio'));
        addMetricRow('Current Runway', getElementText('runway') + ' months');
        
        currentY += 4;

            // PRICING MODEL SECTION
        const isTieredPricingEnabled = document.getElementById('enableTieredPricing')?.checked;
        
        if (isTieredPricingEnabled) {
            try {
                const activeTiers = getActiveTiers();
                const tieredPricingSize = estimateSectionSize(activeTiers.length * 2 + 2, true) + 6;
                addSection('Tiered Pricing Model', 14, tieredPricingSize);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...colors.darkGray);
                const pricingDesc = "NutriSnap operates a freemium model with multiple subscription tiers.";
                doc.text(pricingDesc, margin, currentY);
                currentY += 10;

                addMetricRow('Tier', 'Monthly Price', true);
                activeTiers.forEach(tier => {
                    addMetricRow(`${tier.name} Tier`, formatCurrency(tier.price));
                });
                
                currentY += 3;
                addMetricRow('Tier', 'Conversion Rate', true);
                activeTiers.forEach(tier => {
                    addMetricRow(`${tier.name} Tier`, (tier.conversionRate * 100).toFixed(1) + '%');
                });

                currentY += 2;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...colors.darkGray);
                const conversionDesc = "Conversion rates represent % of MAU upgrading to each tier monthly.";
                doc.text(conversionDesc, margin, currentY);
                currentY += 6;
            } catch (error) {
                console.error('Error getting active tiers:', error);
                const fallbackSize = estimateSectionSize(2, true);
                addSection('Tiered Pricing Model', 14, fallbackSize);
                addMetricRow('Pricing Model', 'Tiered pricing enabled');
                currentY += 4;
            }
        
            } else {
            const singlePricingSize = estimateSectionSize(4, true);
            addSection('Pricing Model', 14, singlePricingSize);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...colors.darkGray);
            const singlePricingDesc = "Single-tier subscription model.";
            doc.text(singlePricingDesc, margin, currentY);
            currentY += 8;
            
            addMetricRow('Parameter', 'Value', true);
            addMetricRow('Monthly Subscription Price', formatCurrency(getInputValue('appPrice')));
            addMetricRow('Free-to-Paid Conversion Rate', getInputValue('initialConversion') + '%');
            currentY += 4;
        }

        // Core Business Parameters
        const coreParamsSize = estimateSectionSize(5, false);
        addSection('Core Business Parameters', 14, coreParamsSize);
        
        addMetricRow('Parameter', 'Value', true);
        addMetricRow('Monthly Customer Churn Rate', getInputValue('churnRate') + '%');
        addMetricRow('Year 1 Monthly Growth Rate', getInputValue('year1Growth') + '%');
        addMetricRow('Annual Plan Discount', getInputValue('annualDiscount') + '%');
        addMetricRow('Annual Plan Adoption Rate', getInputValue('annualPlanPercentage') + '%');

        // PAGE 2: MONTHLY PROJECTIONS
        // Check if we can fit the Core Business Parameters and start of next section on same page
        const remainingSpace = getRemainingPageSpace();
        const projectionSummarySize = estimateSectionSize(8, false);
        
        if (remainingSpace < projectionSummarySize + 60) {
            doc.addPage();
            currentY = margin;
        } else {
            currentY += 8; // Small gap before next section
        }
         
        // Header only if we're on a new page
        if (currentY <= margin + 10) {
            doc.setFillColor(...colors.darkBlue);
            doc.rect(0, 0, pageWidth, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('Monthly Financial Projections', margin, 17);
            
            currentY = 35;
        }

        // Monthly Projections Summary
        addSection('Projection Summary', 14, projectionSummarySize);
    
    if (globalMonthlyData && globalMonthlyData.length > 0) {
        const firstMonth = globalMonthlyData[0];
        const lastMonth = globalMonthlyData[globalMonthlyData.length - 1];
        const totalRevenue = globalMonthlyData.reduce((sum, month) => sum + month.monthlyRevenue, 0);
        
        addMetricRow('Summary', 'Value', true);
        addMetricRow('Projection Period', globalMonthlyData.length + ' months');
        addMetricRow('Starting MAU', firstMonth.mau.toLocaleString());
        addMetricRow('Final MAU', lastMonth.mau.toLocaleString());
        addMetricRow('MAU Growth', ((lastMonth.mau / firstMonth.mau - 1) * 100).toFixed(1) + '%');
        addMetricRow('Final Monthly Revenue', formatCurrency(lastMonth.monthlyRevenue));
        addMetricRow('Final Cash Balance', formatCurrency(lastMonth.cashBalance));
        addMetricRow('Total Revenue Generated', formatCurrency(totalRevenue));
        
        // Add paid penetration note if it's high
        const finalPaidUsers = lastMonth.premiumUsers;
        const paidPenetration = ((finalPaidUsers / lastMonth.mau) * 100).toFixed(1);
        if (paidPenetration > 60) {
            currentY += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...colors.darkGray);
            const penetrationNote = `Note: ${paidPenetration}% paid penetration reflects NutriSnap's unique value as a health-tracking platform with strong habit formation, professional dietitian integration, and enterprise wellness partnerships.`;
            const lines = doc.splitTextToSize(penetrationNote, pageWidth - 2 * margin);
            doc.text(lines, margin, currentY);
            currentY += lines.length * 4 + 4;
        }
    }

    currentY += sectionSpacing;

    // Key Monthly Milestones
    addSection('Key Monthly Milestones');
    
    if (typeof doc.autoTable === 'function' && globalMonthlyData.length > 0) {
        try {
            // Show key milestones (every 6 months and final month)
            const milestones = globalMonthlyData.filter((_, index) => index % 6 === 0 || index === globalMonthlyData.length - 1);
            
            const tableData = milestones.map(data => [
                'Month ' + data.month,
                data.mau.toLocaleString(),
                data.premiumUsers.toLocaleString(),
                formatCurrency(Math.round(data.monthlyRevenue)),
                formatCurrency(Math.round(data.cashBalance))
            ]);

                            doc.autoTable({
                    head: [['Period', 'Total MAU', 'Premium Users', 'Monthly Revenue', 'Cash Balance']],
                    body: tableData,
                    startY: currentY,
                    theme: 'striped',
                    headStyles: {
                        fillColor: colors.lightBlue,
                        textColor: [255, 255, 255],
                        fontSize: 9,
                        fontStyle: 'bold',
                        cellPadding: 2
                    },
                    bodyStyles: {
                        fontSize: 8.5,
                        cellPadding: 2.5
                    },
                    columnStyles: {
                        0: { cellWidth: 24 },
                        1: { cellWidth: 30 },
                        2: { cellWidth: 35 },
                        3: { cellWidth: 38 },
                        4: { cellWidth: 38 }
                    },
                    margin: { left: margin, right: margin }
                });
            
            currentY = doc.lastAutoTable.finalY + 15;
        } catch (error) {
            console.error('Error creating milestones table:', error);
            addSection('Key Milestones');
            addMetricRow('Note', 'Milestone table could not be generated');
            currentY += 20;
        }
    }

    // COMPLETE MONTHLY BREAKDOWN
    checkPageBreak(40);
    addSection('Complete Monthly Breakdown');
    
    if (typeof doc.autoTable === 'function' && globalMonthlyData.length > 0) {
        try {
            // Determine headers based on tiered pricing - include ALL columns like web interface
            let headers = ['Month', 'MAU', 'Growth %'];
            
            if (isTieredPricingEnabled) {
                headers.push('Free', 'Basic', 'Pro');
                if (document.getElementById('enableEnterpriseTier')?.checked) {
                    headers.push('Enterprise');
                }
            } else {
                headers.push('Free', 'Premium');
            }
            
            headers.push('Conv %', 'Revenue', 'ARR', 'Team', 'Tech', 'Marketing', 'Variable', 'Total Costs', 'Net Income', 'Cash');

            const monthlyTableData = globalMonthlyData.map(data => {
                const freeUsers = Math.max(0, data.mau - data.premiumUsers);
                
                // Declare tier user variables at proper scope
                let basicUsers = 0;
                let proUsers = 0;
                let enterpriseUsers = 0;
                
                let row = [
                    data.month,
                    data.mau.toLocaleString(),
                    (data.growthRate * 100).toFixed(1) + '%'
                ];

                if (isTieredPricingEnabled) {
                    basicUsers = data.tierUserCounts?.['Basic'] || 0;
                    proUsers = data.tierUserCounts?.['Pro'] || 0;
                    enterpriseUsers = data.tierUserCounts?.['Enterprise'] || 0;
                    
                    row.push(freeUsers.toLocaleString());
                    row.push(basicUsers.toLocaleString());
                    row.push(proUsers.toLocaleString());
                    
                    if (document.getElementById('enableEnterpriseTier')?.checked) {
                        row.push(enterpriseUsers.toLocaleString());
                    }
                } else {
                    basicUsers = data.premiumUsers; // For single-tier, put all premium users in basic
                    row.push(freeUsers.toLocaleString());
                    row.push(data.premiumUsers.toLocaleString());
                }

                // Calculate actual conversion rate: (paid users) / MAU
                let actualConversionRate = 0;
                if (data.mau > 0) {
                    const totalPaidUsers = basicUsers + proUsers + enterpriseUsers;
                    actualConversionRate = totalPaidUsers / data.mau;
                }

                // Add all the missing columns
                row.push(
                    (actualConversionRate * 100).toFixed(1) + '%',
                    formatCurrency(Math.round(data.monthlyRevenue)).replace('£', ''),
                    formatCurrency(Math.round(data.arr)).replace('£', ''),
                    formatCurrency(Math.round(data.teamCost)).replace('£', ''),
                    formatCurrency(Math.round(data.techCost)).replace('£', ''),
                    formatCurrency(Math.round(data.marketingCost)).replace('£', ''),
                    formatCurrency(Math.round(data.variableCosts || 0)).replace('£', ''),
                    formatCurrency(Math.round(data.monthlyCosts)).replace('£', ''),
                    formatCurrency(Math.round(data.netIncome)).replace('£', ''),
                    formatCurrency(Math.round(data.cashBalance)).replace('£', '')
                );

                return row;
            });

            doc.autoTable({
                head: [headers],
                body: monthlyTableData,
                startY: currentY,
                theme: 'striped',
                headStyles: {
                    fillColor: colors.lightBlue,
                    textColor: [255, 255, 255],
                    fontSize: 6,
                    fontStyle: 'bold',
                    cellPadding: 1
                },
                bodyStyles: {
                    fontSize: 5.5,
                    cellPadding: 1
                },
                columnStyles: {
                    0: { cellWidth: 8 }, // Month
                    1: { cellWidth: 10 }, // MAU
                    2: { cellWidth: 8 }, // Growth %
                    3: { cellWidth: 9 }, // Free/Basic
                    4: { cellWidth: 9 }, // Basic/Premium/Pro
                    5: { cellWidth: 9 }, // Pro
                    6: { cellWidth: 9 }, // Enterprise (if enabled)
                    7: { cellWidth: 8 }, // Conv %
                    8: { cellWidth: 11 }, // Revenue
                    9: { cellWidth: 11 }, // ARR
                    10: { cellWidth: 9 }, // Team
                    11: { cellWidth: 9 }, // Tech
                    12: { cellWidth: 9 }, // Marketing
                    13: { cellWidth: 9 }, // Variable
                    14: { cellWidth: 11 }, // Total Costs
                    15: { cellWidth: 11 }, // Net Income
                    16: { cellWidth: 11 } // Cash
                },
                margin: { left: margin, right: margin },
                styles: {
                    fontSize: 5.5,
                    cellPadding: 1
                }
            });
        } catch (error) {
            console.error('Error creating monthly breakdown table:', error);
            addSection('Monthly Breakdown');
            addMetricRow('Note', 'Monthly breakdown table could not be generated');
            currentY += 20;
        }
    }

     // PAGE 3: COST ANALYSIS
     doc.addPage();
     currentY = margin;
     
     doc.setFillColor(...colors.darkBlue);
     doc.rect(0, 0, pageWidth, 30, 'F');
     doc.setTextColor(255, 255, 255);
     doc.setFont('helvetica', 'bold');
     doc.setFontSize(18);
     doc.text('Cost Structure & Customer Acquisition Analysis', margin, 20);
     
     currentY = 45;

     // Cost Breakdown
     addSection('Annual Cost Structure');
     
     const costBreakdownContent = document.getElementById('costBreakdownContent');
     if (costBreakdownContent) {
         addMetricRow('Cost Category', 'Annual Amount', true);
         
         const costItems = costBreakdownContent.querySelectorAll('.cost-item');
         costItems.forEach(item => {
             const label = item.querySelector('.cost-label')?.textContent?.replace(/\?/g, '').trim();
             const value = item.querySelector('.cost-value')?.textContent?.trim();
             if (label && value && label.length < 50) {
                 addMetricRow(label, value);
             }
         });
     }
     
     currentY += sectionSpacing;

     // CAC Analysis
     addSection('Customer Acquisition Cost Analysis');
     
     const cacBreakdownContent = document.getElementById('cacBreakdownContent');
     if (cacBreakdownContent) {
         addMetricRow('CAC Component', 'Value', true);
         
         const cacItems = cacBreakdownContent.querySelectorAll('.cost-item');
         cacItems.forEach(item => {
             const label = item.querySelector('.cost-label')?.textContent?.replace(/\?/g, '').trim();
             const value = item.querySelector('.cost-value')?.textContent?.trim();
             if (label && value && label.length < 50) {
                 addMetricRow(label, value);
             }
         });
     }

     currentY += sectionSpacing;

        // Add professional footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
     for (let i = 1; i <= pageCount; i++) {
         doc.setPage(i);
         
         // Footer line
         doc.setDrawColor(...colors.lightGray);
         doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
         
         doc.setFont('helvetica', 'normal');
         doc.setFontSize(8);
         doc.setTextColor(...colors.lightGray);
         
         // Left footer
         doc.text('NutriSnap Financial Forecast', margin, pageHeight - 12);
         doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, pageHeight - 8);
         
         // Right footer
         doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 12);
         doc.text('Confidential', pageWidth - margin - 20, pageHeight - 8);
     }

        // Save
        const timestamp = new Date().toISOString().split('T')[0];
        doc.save(`nutrisnap-professional-forecast-${timestamp}.pdf`);
        
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Error creating PDF: ' + error.message + '\n\nPlease try refreshing the page and ensuring you have a stable internet connection.');
    }
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
    
    // Show pricing based on whether tiered pricing is enabled
    const isTieredPricingEnabled = document.getElementById('enableTieredPricing')?.checked;
    if (isTieredPricingEnabled) {
        csv += 'Pricing Model,Tiered Pricing\n';
        const activeTiers = getActiveTiers();
        activeTiers.forEach(tier => {
            csv += `${tier.name} Tier Price,${formatCurrency(tier.price)}\n`;
            csv += `${tier.name} Conversion Rate,${(tier.conversionRate * 100).toFixed(1)}%\n`;
        });
    } else {
        csv += `Monthly Price,${formatCurrency(params.appPrice)}\n`;
    }
    csv += `Annual Discount,${(params.annualDiscount * 100).toFixed(0)}%\n`;
    csv += `Annual Plan Uptake,${(params.annualPlanPercentage * 100).toFixed(0)}%\n`;
    csv += `Starting MAU,${params.startingMAU.toLocaleString()}\n`;
    csv += `Projection Period,${params.projectionMonths} months\n`;
    
    // Growth Parameters (dynamic based on available years)
    Object.keys(params.growthRates).forEach(year => {
        csv += `Year ${year} Growth,${(params.growthRates[year] * 100).toFixed(0)}%/mo\n`;
    });
    
    if (!isTieredPricingEnabled) {
        csv += `Initial Conversion,${(params.initialConversion * 100).toFixed(1)}%\n`;
        csv += `Conversion Growth,${(params.conversionGrowth * 100).toFixed(2)}%/yr\n`;
    }
    csv += `Free User Churn,${(params.freeChurnRate * 100).toFixed(1)}%/mo\n`;
    csv += `Paid User Churn,${(params.paidChurnRate * 100).toFixed(1)}%/mo\n`;
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
    csv += `Monthly ARPU,${formatCurrency(summary.monthlyARPU)}\n`;
    csv += `Runway,${summary.runway} months\n`;
    csv += `Current Burn Rate,${summary.currentBurnRate > 0 ? formatCurrency(summary.currentBurnRate) : 'Profitable'}\n\n`;
    
    // Monthly Data Section
    csv += 'MONTHLY BREAKDOWN\n';
    
    // Dynamic headers based on whether Enterprise tier is enabled
    const isEnterpriseEnabled = document.getElementById('enableEnterpriseTier').checked;
    const enterpriseHeader = isEnterpriseEnabled ? ',Enterprise Users' : '';
    csv += `Month,Total MAU,Growth Rate,Free Users,Basic Users,Pro Users${enterpriseHeader},Conversion Rate,Monthly Revenue,ARR,Team Costs,Tech Costs,Marketing Costs,Variable Costs,Total Costs,Net Income,Cash Balance\n`;
    
    globalMonthlyData.forEach(data => {
        // Calculate tier breakdown for CSV export using stored snapshot
        const freeUsers = Math.max(0, data.mau - data.premiumUsers);
        
        let basicUsers = 0;
        let proUsers = 0; 
        let enterpriseUsers = 0;
        
        if (document.getElementById('enableTieredPricing').checked && data.tierUserCounts) {
            basicUsers = data.tierUserCounts['Basic'] || 0;
            proUsers = data.tierUserCounts['Pro'] || 0;
            enterpriseUsers = data.tierUserCounts['Enterprise'] || 0;
        } else {
            basicUsers = data.premiumUsers;
            proUsers = 0;
            enterpriseUsers = 0;
        }
        
        const enterpriseColumn = isEnterpriseEnabled ? `,${enterpriseUsers}` : '';
        
        // Calculate actual monthly conversion rate: (paid users) / MAU
        let actualConversionRate = 0;
        if (data.mau > 0) {
            if (isTieredPricingEnabled) {
                const totalPaidUsers = basicUsers + proUsers + enterpriseUsers;
                actualConversionRate = totalPaidUsers / data.mau;
            } else {
                actualConversionRate = data.premiumUsers / data.mau;
            }
        }
        
        csv += `${data.month},${data.mau},${(data.growthRate * 100).toFixed(1)}%,${freeUsers},${basicUsers},${proUsers}${enterpriseColumn},`;
        csv += `${(actualConversionRate * 100).toFixed(1)}%,${data.monthlyRevenue.toFixed(2)},${data.arr.toFixed(2)},`;
        csv += `${data.teamCost.toFixed(2)},${data.techCost.toFixed(2)},${data.marketingCost.toFixed(2)},${(data.variableCosts || 0).toFixed(2)},`;
        csv += `${data.monthlyCosts.toFixed(2)},${data.netIncome.toFixed(2)},${data.cashBalance.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nutrisnap_forecast.csv';
    a.click();
}

// Save & Load Projections Functions
function saveCurrentProjection() {
    try {
        const nameInput = document.getElementById('saveProjectionName');
        if (!nameInput) {
            alert('Error: Save input field not found.');
            return;
        }
        
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a name for your projection.');
            return;
        }
        
        // Test localStorage availability
        if (typeof(Storage) === "undefined") {
            alert('Error: Your browser does not support local storage.');
            return;
        }
        
        // Capture all current form values
        const projection = {
            id: Date.now().toString(),
            name: name,
            createdAt: new Date().toISOString(),
            data: getCurrentProjectionData()
        };
        
        // Get existing saved projections
        const savedProjections = getSavedProjections();
        
        // Check for duplicate names
        if (savedProjections.some(p => p.name === name)) {
            if (!confirm(`A projection named "${name}" already exists. Do you want to overwrite it?`)) {
                return;
            }
            // Remove existing projection with same name
            const filteredProjections = savedProjections.filter(p => p.name !== name);
            localStorage.setItem('nutrisnap_saved_projections', JSON.stringify([...filteredProjections, projection]));
        } else {
            // Add new projection
            savedProjections.push(projection);
            localStorage.setItem('nutrisnap_saved_projections', JSON.stringify(savedProjections));
        }
        
        // Clear input and refresh display
        nameInput.value = '';
        displaySavedProjections();
        
        // Show success message
        alert(`Projection "${name}" saved successfully!`);
        
    } catch (error) {
        console.error('Error saving projection:', error);
        alert('Error saving projection: ' + error.message);
    }
}

function getCurrentProjectionData() {
    try {
        // Helper function to safely get element value
        function getElementValue(id, defaultValue = '') {
            const element = document.getElementById(id);
            if (!element) {
                return defaultValue;
            }
            return element.type === 'checkbox' ? element.checked : element.value;
        }
        
        return {
            // Basic Parameters
            appPrice: getElementValue('appPrice', '15'),
            annualDiscount: getElementValue('annualDiscount', '20'),
            annualPlanPercentage: getElementValue('annualPlanPercentage', '30'),
            startingMAU: getElementValue('startingMAU', '1000'),
            projectionMonths: getElementValue('projectionMonths', '36'),
        
            // Growth Rates
            year1Growth: getElementValue('year1Growth', '16'),
            year2Growth: getElementValue('year2Growth', '12'),
            year3Growth: getElementValue('year3Growth', '9'),
            year4Growth: getElementValue('year4Growth', '7'),
            year5Growth: getElementValue('year5Growth', '5'),
            // Legacy field names for backward compatibility
            growthY1: getElementValue('year1Growth', '16'),
            growthY2: getElementValue('year2Growth', '12'),
            growthY3: getElementValue('year3Growth', '9'),
            growthY4: getElementValue('year4Growth', '7'),
            growthY5: getElementValue('year5Growth', '5'),
            
            // Conversion & Churn
            initialConversion: getElementValue('initialConversion', '6'),
            conversionGrowth: getElementValue('conversionGrowth', '1.25'),
            churnRate: getElementValue('churnRate', '5'),
            initialChurnRate: getElementValue('churnRate', '5'), // Legacy field name
            freeChurnRate: getElementValue('freeChurnRate', '6'),
            paidChurnRate: getElementValue('paidChurnRate', '3'),
            churnImprovement: getElementValue('churnImprovement', '0.75'),
            
            // B2B Parameters
            b2bStartMonth: getElementValue('b2bStartMonth', '6'),
            b2bPercentage: getElementValue('b2bPercentage', '25'),
            
            // Cost Structure
            teamCostY1: getElementValue('teamCostY1', '4500'),
            teamCostY2: getElementValue('teamCostY2', '12000'),
            teamCostY3: getElementValue('teamCostY3', '25000'),
            techCostY1: getElementValue('techCostY1', '800'),
            techCostY2: getElementValue('techCostY2', '1800'),
            techCostY3: getElementValue('techCostY3', '4000'),
            marketingCostY1: getElementValue('marketingCostY1', '1200'),
            marketingCostY2: getElementValue('marketingCostY2', '3500'),
            marketingCostY3: getElementValue('marketingCostY3', '8000'),
            
            // Investment Parameters
            seedInvestment: getElementValue('seedInvestment', '200000'),
            equityOffered: getElementValue('equityOffered', '12'),
            valuationMultiple: getElementValue('valuationMultiple', '5.5'),
            
            // Beta Period Parameters
            betaUsersM0: getElementValue('betaUsersM0', '50'),
            betaUsersM1: getElementValue('betaUsersM1', '120'),
            betaUsersM2: getElementValue('betaUsersM2', '200'),
            betaTeamCostM0: getElementValue('betaTeamCostM0', '8000'),
            betaTeamCostM1: getElementValue('betaTeamCostM1', '12000'),
            betaTeamCostM2: getElementValue('betaTeamCostM2', '15000'),
            betaTechCostM0: getElementValue('betaTechCostM0', '300'),
            betaTechCostM1: getElementValue('betaTechCostM1', '400'),
            betaTechCostM2: getElementValue('betaTechCostM2', '600'),
            betaMarketingCostM0: getElementValue('betaMarketingCostM0', '500'),
            betaMarketingCostM1: getElementValue('betaMarketingCostM1', '800'),
            betaMarketingCostM2: getElementValue('betaMarketingCostM2', '1200'),
            
            // Advanced Features
            enableTieredPricing: getElementValue('enableTieredPricing', false),
            enableProTier: getElementValue('enableProTier', false),
            enableEnterpriseTier: getElementValue('enableEnterpriseTier', false),
            basicPrice: getElementValue('basicPrice', '5'),
            basicConversion: getElementValue('basicConversion', '8'),
            proPrice: getElementValue('proPrice', '15'),
            proConversion: getElementValue('proConversion', '5'),
            enterprisePrice: getElementValue('enterprisePrice', '50'),
            enterpriseConversion: getElementValue('enterpriseConversion', '2'),
            
            enableCohortTracking: getElementValue('enableCohortTracking', false),
            enableVariableCosts: getElementValue('enableVariableCosts', false),
            enableMultipleRounds: getElementValue('enableMultipleRounds', false),
            
            // Variable Costs (if enabled)
            costPerUser: getElementValue('costPerUser', '0.25'),
            supportCostPerUser: getElementValue('supportCostPerUser', '2'),
            infraScaling: getElementValue('infraScaling', '0.85'),
            
            // Multiple Funding Rounds (if enabled)
            seriesAMonth: getElementValue('seriesAMonth', '18'),
            seriesAAmount: getElementValue('seriesAAmount', '1000000'),
            seriesAEquity: getElementValue('seriesAEquity', '15'),
            seriesBMonth: getElementValue('seriesBMonth', '30'),
            seriesBAmount: getElementValue('seriesBAmount', '5000000'),
            seriesBEquity: getElementValue('seriesBEquity', '20'),
            
            // Enhanced Cost Management
            enableCostEscalation: getElementValue('enableCostEscalation', false),
            enableMarketingPhases: getElementValue('enableMarketingPhases', false),
            costEscalations: JSON.parse(JSON.stringify(costEscalations)), // Deep copy
            
            // Marketing Phase Data
            launchPhaseStart: getElementValue('launchPhaseStart', '1'),
            launchPhaseEnd: getElementValue('launchPhaseEnd', '6'),
            launchPhaseBudget: getElementValue('launchPhaseBudget', '1500'),
            growthPhaseStart: getElementValue('growthPhaseStart', '7'),
            growthPhaseEnd: getElementValue('growthPhaseEnd', '18'),
            growthPhaseBudget: getElementValue('growthPhaseBudget', '3000'),
            scalePhaseStart: getElementValue('scalePhaseStart', '19'),
            scalePhaseEnd: getElementValue('scalePhaseEnd', '60'),
            scalePhaseBudget: getElementValue('scalePhaseBudget', '5000')
        };
    } catch (error) {
        console.error('Error getting projection data:', error);
        throw error;
    }
}

function loadProjection(projectionId) {
    const savedProjections = getSavedProjections();
    const projection = savedProjections.find(p => p.id === projectionId);
    
    if (!projection) {
        alert('Projection not found.');
        return;
    }
    
    const data = projection.data;
    
    // Load Basic Parameters
    document.getElementById('appPrice').value = data.appPrice || '15';
    document.getElementById('annualDiscount').value = data.annualDiscount || '20';
    document.getElementById('annualPlanPercentage').value = data.annualPlanPercentage || '30';
    document.getElementById('startingMAU').value = data.startingMAU || '1000';
    document.getElementById('projectionMonths').value = data.projectionMonths || '36';
    
    // Load Growth Rates
    document.getElementById('year1Growth').value = data.year1Growth || data.growthY1 || '16';
    document.getElementById('year2Growth').value = data.year2Growth || data.growthY2 || '12';
    document.getElementById('year3Growth').value = data.year3Growth || data.growthY3 || '8';
    document.getElementById('year4Growth').value = data.year4Growth || data.growthY4 || '5';
    document.getElementById('year5Growth').value = data.year5Growth || data.growthY5 || '3';
    
    // Load Conversion & Churn
    document.getElementById('initialConversion').value = data.initialConversion || '2.5';
    document.getElementById('conversionGrowth').value = data.conversionGrowth || '20';
    document.getElementById('churnRate').value = data.churnRate || data.initialChurnRate || '5';
    if (document.getElementById('freeChurnRate')) {
        document.getElementById('freeChurnRate').value = data.freeChurnRate || '6';
    }
    if (document.getElementById('paidChurnRate')) {
        document.getElementById('paidChurnRate').value = data.paidChurnRate || '3';
    }
    document.getElementById('churnImprovement').value = data.churnImprovement || '25';
    
    // Load B2B Parameters
    document.getElementById('b2bStartMonth').value = data.b2bStartMonth || '6';
    document.getElementById('b2bPercentage').value = data.b2bPercentage || '25';
    
    // Load Cost Structure
    document.getElementById('teamCostY1').value = data.teamCostY1 || '4500';
    document.getElementById('teamCostY2').value = data.teamCostY2 || '12000';
    document.getElementById('teamCostY3').value = data.teamCostY3 || '25000';
    document.getElementById('techCostY1').value = data.techCostY1 || '800';
    document.getElementById('techCostY2').value = data.techCostY2 || '1800';
    document.getElementById('techCostY3').value = data.techCostY3 || '4000';
    document.getElementById('marketingCostY1').value = data.marketingCostY1 || '1200';
    document.getElementById('marketingCostY2').value = data.marketingCostY2 || '3500';
    document.getElementById('marketingCostY3').value = data.marketingCostY3 || '8000';
    
    // Load Investment Parameters
    document.getElementById('seedInvestment').value = data.seedInvestment || '200000';
    document.getElementById('equityOffered').value = data.equityOffered || '12';
    document.getElementById('valuationMultiple').value = data.valuationMultiple || '5.5';
    
    // Load Beta Period Parameters
    if (document.getElementById('betaUsersM0')) {
        document.getElementById('betaUsersM0').value = data.betaUsersM0 || '50';
    }
    if (document.getElementById('betaUsersM1')) {
        document.getElementById('betaUsersM1').value = data.betaUsersM1 || '120';
    }
    if (document.getElementById('betaUsersM2')) {
        document.getElementById('betaUsersM2').value = data.betaUsersM2 || '200';
    }
    if (document.getElementById('betaTeamCostM0')) {
        document.getElementById('betaTeamCostM0').value = data.betaTeamCostM0 || '8000';
    }
    if (document.getElementById('betaTeamCostM1')) {
        document.getElementById('betaTeamCostM1').value = data.betaTeamCostM1 || '12000';
    }
    if (document.getElementById('betaTeamCostM2')) {
        document.getElementById('betaTeamCostM2').value = data.betaTeamCostM2 || '15000';
    }
    if (document.getElementById('betaTechCostM0')) {
        document.getElementById('betaTechCostM0').value = data.betaTechCostM0 || '300';
    }
    if (document.getElementById('betaTechCostM1')) {
        document.getElementById('betaTechCostM1').value = data.betaTechCostM1 || '400';
    }
    if (document.getElementById('betaTechCostM2')) {
        document.getElementById('betaTechCostM2').value = data.betaTechCostM2 || '600';
    }
    if (document.getElementById('betaMarketingCostM0')) {
        document.getElementById('betaMarketingCostM0').value = data.betaMarketingCostM0 || '500';
    }
    if (document.getElementById('betaMarketingCostM1')) {
        document.getElementById('betaMarketingCostM1').value = data.betaMarketingCostM1 || '800';
    }
    if (document.getElementById('betaMarketingCostM2')) {
        document.getElementById('betaMarketingCostM2').value = data.betaMarketingCostM2 || '1200';
    }
    
    // Load Advanced Features
    document.getElementById('enableTieredPricing').checked = data.enableTieredPricing || false;
    document.getElementById('enableCohortTracking').checked = data.enableCohortTracking || false;
    document.getElementById('enableVariableCosts').checked = data.enableVariableCosts || false;
    document.getElementById('enableMultipleRounds').checked = data.enableMultipleRounds || false;
    
    // Load Tiered Pricing Details
    if (data.enableTieredPricing) {
        if (document.getElementById('enableProTier')) {
            document.getElementById('enableProTier').checked = data.enableProTier !== false;
        }
        if (document.getElementById('enableEnterpriseTier')) {
            document.getElementById('enableEnterpriseTier').checked = data.enableEnterpriseTier || false;
        }
        if (document.getElementById('basicPrice')) {
            document.getElementById('basicPrice').value = data.basicPrice || '5';
        }
        if (document.getElementById('basicConversion')) {
            document.getElementById('basicConversion').value = data.basicConversion || '8';
        }
        if (document.getElementById('proPrice')) {
            document.getElementById('proPrice').value = data.proPrice || '15';
        }
        if (document.getElementById('proConversion')) {
            document.getElementById('proConversion').value = data.proConversion || '5';
        }
        if (document.getElementById('enterprisePrice')) {
            document.getElementById('enterprisePrice').value = data.enterprisePrice || '50';
        }
        if (document.getElementById('enterpriseConversion')) {
            document.getElementById('enterpriseConversion').value = data.enterpriseConversion || '2';
        }
    }
    
    // Load Variable Costs Details
    if (data.enableVariableCosts) {
        if (document.getElementById('costPerUser')) {
            document.getElementById('costPerUser').value = data.costPerUser || '0.25';
        }
        if (document.getElementById('supportCostPerUser')) {
            document.getElementById('supportCostPerUser').value = data.supportCostPerUser || '2';
        }
        if (document.getElementById('infraScaling')) {
            document.getElementById('infraScaling').value = data.infraScaling || '0.85';
        }
    }
    
    // Load Multiple Funding Rounds Details
    if (data.enableMultipleRounds) {
        if (document.getElementById('seriesAMonth')) {
            document.getElementById('seriesAMonth').value = data.seriesAMonth || '18';
        }
        if (document.getElementById('seriesAAmount')) {
            document.getElementById('seriesAAmount').value = data.seriesAAmount || '1000000';
        }
        if (document.getElementById('seriesAEquity')) {
            document.getElementById('seriesAEquity').value = data.seriesAEquity || '15';
        }
        if (document.getElementById('seriesBMonth')) {
            document.getElementById('seriesBMonth').value = data.seriesBMonth || '30';
        }
        if (document.getElementById('seriesBAmount')) {
            document.getElementById('seriesBAmount').value = data.seriesBAmount || '5000000';
        }
        if (document.getElementById('seriesBEquity')) {
            document.getElementById('seriesBEquity').value = data.seriesBEquity || '20';
        }
    }
    
    // Load Enhanced Cost Management
    if (data.enableCostEscalation !== undefined) {
        document.getElementById('enableCostEscalation').checked = data.enableCostEscalation;
    }
    if (data.enableMarketingPhases !== undefined) {
        document.getElementById('enableMarketingPhases').checked = data.enableMarketingPhases;
    }
    
    // Load cost escalations data
    if (data.costEscalations && Array.isArray(data.costEscalations)) {
        costEscalations = [...data.costEscalations]; // Copy array
    }
    
    // Load marketing phase data
    if (document.getElementById('launchPhaseStart')) {
        document.getElementById('launchPhaseStart').value = data.launchPhaseStart || '1';
    }
    if (document.getElementById('launchPhaseEnd')) {
        document.getElementById('launchPhaseEnd').value = data.launchPhaseEnd || '6';
    }
    if (document.getElementById('launchPhaseBudget')) {
        document.getElementById('launchPhaseBudget').value = data.launchPhaseBudget || '1500';
    }
    if (document.getElementById('growthPhaseStart')) {
        document.getElementById('growthPhaseStart').value = data.growthPhaseStart || '7';
    }
    if (document.getElementById('growthPhaseEnd')) {
        document.getElementById('growthPhaseEnd').value = data.growthPhaseEnd || '18';
    }
    if (document.getElementById('growthPhaseBudget')) {
        document.getElementById('growthPhaseBudget').value = data.growthPhaseBudget || '3000';
    }
    if (document.getElementById('scalePhaseStart')) {
        document.getElementById('scalePhaseStart').value = data.scalePhaseStart || '19';
    }
    if (document.getElementById('scalePhaseEnd')) {
        document.getElementById('scalePhaseEnd').value = data.scalePhaseEnd || '60';
    }
    if (document.getElementById('scalePhaseBudget')) {
        document.getElementById('scalePhaseBudget').value = data.scalePhaseBudget || '5000';
    }

    // Update displays and toggle sections
    updateSliderValue(document.getElementById('annualPlanPercentage'));
    updateSliderValue(document.getElementById('equityOffered'));
    updateSliderValue(document.getElementById('valuationMultiple'));
    updateAnnualPrice();
    updateAnnualCostDisplays();
    
    // Toggle advanced feature sections
    toggleTieredPricing();
    toggleCohortTracking();
    toggleVariableCosts();
    toggleMultipleRounds();
    toggleCostEscalation();
    toggleMarketingPhases();
    
    // Display loaded cost escalations
    displayCostEscalations();
    
    alert(`Projection "${projection.name}" loaded successfully!`);
    
    // Auto-calculate if we have data
    calculateProjections();
}

function deleteProjection(projectionId) {
    const savedProjections = getSavedProjections();
    const projection = savedProjections.find(p => p.id === projectionId);
    
    if (!projection) {
        alert('Projection not found.');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete "${projection.name}"?`)) {
        return;
    }
    
    const filteredProjections = savedProjections.filter(p => p.id !== projectionId);
    localStorage.setItem('nutrisnap_saved_projections', JSON.stringify(filteredProjections));
    
    displaySavedProjections();
    alert(`Projection "${projection.name}" deleted.`);
}

function renameProjection(projectionId) {
    const savedProjections = getSavedProjections();
    const projection = savedProjections.find(p => p.id === projectionId);
    
    if (!projection) {
        alert('Projection not found.');
        return;
    }
    
    const newName = prompt(`Enter new name for "${projection.name}":`, projection.name);
    
    if (!newName || newName.trim() === '') {
        return;
    }
    
    if (newName.trim() === projection.name) {
        return;
    }
    
    // Check for duplicate names
    if (savedProjections.some(p => p.name === newName.trim() && p.id !== projectionId)) {
        alert(`A projection named "${newName.trim()}" already exists.`);
        return;
    }
    
    projection.name = newName.trim();
    localStorage.setItem('nutrisnap_saved_projections', JSON.stringify(savedProjections));
    
    displaySavedProjections();
    alert(`Projection renamed to "${newName.trim()}".`);
}

function getSavedProjections() {
    try {
        const saved = localStorage.getItem('nutrisnap_saved_projections');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error reading saved projections:', error);
        return [];
    }
}

function displaySavedProjections() {
    try {
        const savedProjections = getSavedProjections();
        const listContainer = document.getElementById('savedProjectionsList');
        const noProjectionsMsg = document.getElementById('noSavedProjections');
        
        if (!listContainer) {
            console.error('Saved projections list container not found');
            return;
        }
        
        if (savedProjections.length === 0) {
            if (noProjectionsMsg) {
                noProjectionsMsg.style.display = 'block';
                listContainer.innerHTML = '';
                listContainer.appendChild(noProjectionsMsg);
            } else {
                listContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 20px; font-style: italic;">No saved projections yet. Save your current configuration above.</div>';
            }
            return;
        }
        
        if (noProjectionsMsg) {
            noProjectionsMsg.style.display = 'none';
        }
        
        // Sort by creation date (newest first)
        savedProjections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        listContainer.innerHTML = savedProjections.map(projection => `
            <div class="saved-projection-item">
                <div class="saved-projection-info">
                    <div class="saved-projection-name">${projection.name}</div>
                    <div class="saved-projection-details">
                        Saved: ${new Date(projection.createdAt).toLocaleDateString()} • 
                        ${projection.data.projectionMonths} months • 
                        ${projection.data.enableTieredPricing ? 'Tiered Model' : (projection.data.appPrice ? '£' + projection.data.appPrice + '/mo' : 'N/A')} • 
                        ${projection.data.startingMAU ? parseInt(projection.data.startingMAU).toLocaleString() : '0'} MAU
                    </div>
                </div>
                <div class="saved-projection-actions">
                    <button class="saved-projection-btn load-btn" onclick="loadProjection('${projection.id}')">Load</button>
                    <button class="saved-projection-btn rename-btn" onclick="renameProjection('${projection.id}')">Rename</button>
                    <button class="saved-projection-btn delete-btn" onclick="deleteProjection('${projection.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error displaying saved projections:', error);
        const listContainer = document.getElementById('savedProjectionsList');
        if (listContainer) {
            listContainer.innerHTML = '<div style="text-align: center; color: #f87171; padding: 20px;">Error loading saved projections.</div>';
        }
    }
}

function exportSavedProjections() {
    const savedProjections = getSavedProjections();
    
    if (savedProjections.length === 0) {
        alert('No saved projections to export.');
        return;
    }
    
    const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: 'NutriSnap Financial Forecast v2.0',
        totalProjections: savedProjections.length,
        projections: savedProjections
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrisnap_saved_projections_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    alert(`${savedProjections.length} projections exported successfully!`);
}

function clearAllProjections() {
    const savedProjections = getSavedProjections();
    
    if (savedProjections.length === 0) {
        alert('No saved projections to clear.');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete all ${savedProjections.length} saved projections? This cannot be undone.`)) {
        return;
    }
    
    localStorage.removeItem('nutrisnap_saved_projections');
    displaySavedProjections();
    alert('All saved projections have been cleared.');
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
        // Initialize tier toggles
        updateTiersGridLayout();
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

// Individual tier visibility control
function toggleTierVisibility(tier) {
    const checkbox = document.getElementById(`enable${tier.charAt(0).toUpperCase() + tier.slice(1)}Tier`);
    const section = document.getElementById(`${tier}TierSection`);
    
    if (checkbox.checked) {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
    
    // Update grid layout based on visible tiers
    updateTiersGridLayout();
    
    // Recalculate projections when tiers change
    calculateProjections();
}

function updateTiersGridLayout() {
    const basicVisible = true; // Basic tier is always visible
    const proTierElement = document.getElementById('enableProTier');
    const enterpriseTierElement = document.getElementById('enableEnterpriseTier');
    
    const proVisible = proTierElement ? proTierElement.checked : false;
    const enterpriseVisible = enterpriseTierElement ? enterpriseTierElement.checked : false;
    
    const visibleTiers = [basicVisible, proVisible, enterpriseVisible].filter(Boolean).length;
    const grid = document.getElementById('tiersGrid');
    
    if (grid) {
        if (visibleTiers === 1) {
            grid.style.gridTemplateColumns = '1fr';
        } else if (visibleTiers === 2) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }
}

function getActiveTiers() {
    const tiers = [];
    
    // Basic tier is always included when tiered pricing is enabled
    const basicPriceElement = document.getElementById('basicPrice');
    const basicConversionElement = document.getElementById('basicConversion');
    if (basicPriceElement && basicConversionElement) {
        const basicConversionRate = parseFloat(basicConversionElement.value) / 100 || 0.08;
        tiers.push({
            name: 'Basic',
            enabled: true,
            price: parseFloat(basicPriceElement.value) || 5,
            conversionRate: basicConversionRate,
            percentage: 0.6 // Default distribution, will be adjusted below
        });
    }
    
    // Check if Pro tier is enabled
    const proTierElement = document.getElementById('enableProTier');
    const proPriceElement = document.getElementById('proPrice');
    const proConversionElement = document.getElementById('proConversion');
    if (proTierElement && proTierElement.checked && proPriceElement && proConversionElement) {
        const proConversionRate = parseFloat(proConversionElement.value) / 100 || 0.05;
        tiers.push({
            name: 'Pro',
            enabled: true,
            price: parseFloat(proPriceElement.value) || 15,
            conversionRate: proConversionRate,
            percentage: 0.3
        });
    }
    
    // Check if Enterprise tier is enabled
    const enterpriseTierElement = document.getElementById('enableEnterpriseTier');
    const enterprisePriceElement = document.getElementById('enterprisePrice');
    const enterpriseConversionElement = document.getElementById('enterpriseConversion');
    if (enterpriseTierElement && enterpriseTierElement.checked && enterprisePriceElement && enterpriseConversionElement) {
        const enterpriseConversionRate = parseFloat(enterpriseConversionElement.value) / 100 || 0.02;
        tiers.push({
            name: 'Enterprise',
            enabled: true,
            price: parseFloat(enterprisePriceElement.value) || 50,
            conversionRate: enterpriseConversionRate,
            percentage: 0.1
        });
    }
    
    // Calculate actual tier distribution based on conversion rates
    if (tiers.length > 1) {
        const totalConversionWeight = tiers.reduce((sum, tier) => sum + tier.conversionRate, 0);
        
        if (totalConversionWeight > 0) {
            tiers.forEach(tier => {
                tier.percentage = tier.conversionRate / totalConversionWeight;
            });
        }
    } else if (tiers.length === 1) {
        tiers[0].percentage = 1.0;
    }
    
    return tiers;
}

// Advanced Analytics Functions
function updateTieredRevenueAnalysis(tieredData) {
    const container = document.getElementById('tieredRevenueContent');
    if (!container || !tieredData || tieredData.length === 0) {
        container.innerHTML = '<p>Enable tiered pricing and calculate projections to see this analysis.</p>';
        return;
    }
    
    // Calculate total revenue across all projection period for each tier
    const activeTiers = getActiveTiers();
    let totalProjectionRevenue = 0;
    const tierProjectionRevenue = {};
    
    // Calculate cumulative revenue for each tier across all months using ACCURATE stored data
    globalMonthlyData.forEach(monthData => {
        if (monthData.monthlyTierRevenue) {
            for (const tierName in monthData.monthlyTierRevenue) {
                if (!tierProjectionRevenue[tierName]) {
                    tierProjectionRevenue[tierName] = 0;
                }
                const revenueForTier = monthData.monthlyTierRevenue[tierName];
                tierProjectionRevenue[tierName] += revenueForTier;
                totalProjectionRevenue += revenueForTier;
            }
        }
    });
    
    // Calculate average monthly metrics for display
    const projectionMonths = globalMonthlyData.length;
    const finalMonthData = globalMonthlyData[globalMonthlyData.length - 1];
    
    let html = '<div class="tier-breakdown">';
    
    // Add summary header
    html += `
        <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 3px solid #667eea;">
            <h5 style="color: #667eea; margin-bottom: 10px;">Tier Performance Summary</h5>
            <div class="cost-item">
                <span class="cost-label">Total Revenue Over ${projectionMonths} Months</span>
                <span class="cost-value">${formatCurrency(totalProjectionRevenue)}</span>
            </div>
            <div class="cost-item">
                <span class="cost-label">Final Month Paid Users</span>
                <span class="cost-value">${(finalMonthData.premiumUsers || 0).toLocaleString()}</span>
            </div>
        </div>
    `;
    
    tieredData.forEach(tier => {
        const totalTierRevenue = tierProjectionRevenue[tier.name] || 0;
        const avgMonthlyRevenue = projectionMonths > 0 ? totalTierRevenue / projectionMonths : 0;
        const revenuePercentage = totalProjectionRevenue > 0 ? (totalTierRevenue / totalProjectionRevenue) * 100 : 0;
        
        // Color coding for tiers
        let borderColor = '#667eea';
        if (tier.name === 'Pro') borderColor = '#a855f7';
        if (tier.name === 'Enterprise') borderColor = '#f59e0b';
        
        html += `
            <div class="tier-card" style="border-left: 3px solid ${borderColor};">
                <h5 style="color: ${borderColor};">${tier.name} Tier</h5>
                <div class="cost-item">
                    <span class="cost-label">Price per User</span>
                    <span class="cost-value">${formatCurrency(tier.price)}/month</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Final Month Users</span>
                    <span class="cost-value">${(tier.users || 0).toLocaleString()}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Final Month Revenue</span>
                    <span class="cost-value">${formatCurrency(tier.revenue)}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Avg Monthly Revenue</span>
                    <span class="cost-value">${formatCurrency(avgMonthlyRevenue)}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Total Revenue (${projectionMonths} months)</span>
                    <span class="cost-value">${formatCurrency(totalTierRevenue)}</span>
                </div>
                <div class="cost-item" style="border-top: 1px solid #333; padding-top: 8px; margin-top: 8px;">
                    <span class="cost-label">% of Total Revenue</span>
                    <span class="cost-value" style="color: ${borderColor}; font-weight: bold;">${revenuePercentage.toFixed(1)}%</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function updateCohortAnalysis(cohortData) {
    const container = document.getElementById('cohortAnalysisContent');
    if (!cohortData || cohortData.length === 0) {
        container.innerHTML = '<p>Enable cohort tracking and calculate projections to see this analysis.</p>';
        return;
    }
    
    // Calculate summary metrics
    const totalUsersAcquired = cohortData.reduce((sum, cohort) => sum + cohort.initialUsers, 0);
    const totalUsersRemaining = cohortData.reduce((sum, cohort) => sum + cohort.currentUsers, 0);
    const avgRetentionRate = totalUsersAcquired > 0 ? totalUsersRemaining / totalUsersAcquired : 0;
    const weightedAvgLtv = totalUsersAcquired > 0 ? cohortData.reduce((sum, cohort) => sum + (cohort.avgLtv * cohort.initialUsers), 0) / totalUsersAcquired : 0;
    
    let html = `
        <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 3px solid #667eea;">
            <h5 style="color: #667eea; margin-bottom: 10px;">Cohort Summary</h5>
            <div class="cost-item">
                <span class="cost-label">Total New Paid Users Acquired
                    <span class="info-icon">?</span>
                    <span class="tooltip">The total number of new paying subscribers from the cohorts being analyzed.</span>
                </span>
                <span class="cost-value">${totalUsersAcquired.toLocaleString()}</span>
            </div>
            <div class="cost-item">
                <span class="cost-label">Users Still Active at End
                    <span class="info-icon">?</span>
                    <span class="tooltip">The total number of users from these cohorts who remain subscribed at the end of the projection period.</span>
                </span>
                <span class="cost-value">${totalUsersRemaining.toLocaleString()}</span>
            </div>
            <div class="cost-item">
                <span class="cost-label">Overall Retention Rate
                    <span class="info-icon">?</span>
                    <span class="tooltip">The weighted average retention rate across all cohorts, indicating the long-term stickiness of the product.</span>
                </span>
                <span class="cost-value" style="color: ${avgRetentionRate > 0.5 ? '#4ade80' : avgRetentionRate > 0.3 ? '#f59e0b' : '#f87171'};">
                    ${(avgRetentionRate * 100).toFixed(1)}%
                </span>
            </div>
            <div class="cost-item">
                <span class="cost-label">Weighted Average LTV
                    <span class="info-icon">?</span>
                    <span class="tooltip">The average Lifetime Value (LTV) weighted by the size of each cohort, providing a more accurate overall LTV.</span>
                </span>
                <span class="cost-value">${formatCurrency(weightedAvgLtv)}</span>
            </div>
        </div>
        
        <table class="cohort-table" style="width: 100%; border-collapse: collapse; background: #1a1a1a; border-radius: 8px; overflow: hidden;">
            <thead>
                <tr style="background: #667eea; color: white;">
                    <th style="padding: 12px; text-align: left;">Acquisition Month</th>
                    <th style="padding: 12px; text-align: right;">New Users</th>
                    <th style="padding: 12px; text-align: right;">Months Elapsed</th>
                    <th style="padding: 12px; text-align: right;">Retention Rate</th>
                    <th style="padding: 12px; text-align: right;">Users Remaining</th>
                    <th style="padding: 12px; text-align: right;">Final Churn Rate</th>
                    <th style="padding: 12px; text-align: right;">Cohort LTV</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    cohortData.forEach((cohort, index) => {
        const isEvenRow = index % 2 === 0;
        const rowColor = isEvenRow ? '#1e1e1e' : '#252525';
        const retentionColor = cohort.retentionRate > 0.5 ? '#4ade80' : cohort.retentionRate > 0.3 ? '#f59e0b' : '#f87171';
        
        html += `
            <tr style="background: ${rowColor};">
                <td style="padding: 10px; color: #667eea; font-weight: 600;">Month ${cohort.month}</td>
                <td style="padding: 10px; text-align: right; color: #ccc;">${cohort.initialUsers.toLocaleString()}</td>
                <td style="padding: 10px; text-align: right; color: #999;">${cohort.monthsElapsed}</td>
                <td style="padding: 10px; text-align: right; color: ${retentionColor}; font-weight: 600;">
                    ${(cohort.retentionRate * 100).toFixed(1)}%
                </td>
                <td style="padding: 10px; text-align: right; color: #ccc;">${cohort.currentUsers.toLocaleString()}</td>
                <td style="padding: 10px; text-align: right; color: #f87171;">${(cohort.churnRate * 100).toFixed(1)}%</td>
                <td style="padding: 10px; text-align: right; color: #4ade80; font-weight: 600;">${formatCurrency(cohort.avgLtv)}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        
        <div style="background: #1e1e1e; padding: 10px; border-radius: 4px; margin-top: 15px; font-size: 0.85rem; color: #999;">
            <strong style="color: #667eea;">How to Read This:</strong> Each row shows a monthly cohort of new paid users. "Retention Rate" shows what percentage of that cohort is still active at the end of your projection period. Higher retention rates indicate better product stickiness and lower churn over time.
        </div>
    `;
    
    container.innerHTML = html;
}

function updateVariableCostAnalysis(variableData) {
    const container = document.getElementById('variableCostContent');
    if (!variableData) {
        container.innerHTML = '<p>Enable variable costs and calculate projections to see this analysis.</p>';
        return;
    }
    
    // Calculate comprehensive variable cost breakdown
    const finalMonthData = globalMonthlyData[globalMonthlyData.length - 1];
    const costPerUser = parseFloat(document.getElementById('costPerUser').value) || 0;
    const supportCostPerUser = parseFloat(document.getElementById('supportCostPerUser').value) || 0;
    const infraScaling = parseFloat(document.getElementById('infraScaling').value) || 1;
    
    // Calculate total costs over projection period
    let totalPaidUserCosts = 0;
    let totalFreeUserCosts = 0;
    
    globalMonthlyData.forEach((monthData, index) => {
        const freeUsers = Math.max(0, monthData.mau - monthData.premiumUsers);
        const basicUserCosts = freeUsers * costPerUser;
        const premiumUserCosts = monthData.premiumUsers * supportCostPerUser;
        
        totalFreeUserCosts += basicUserCosts * infraScaling;
        totalPaidUserCosts += premiumUserCosts * infraScaling;
    });
    
    const totalVariableCosts = totalPaidUserCosts + totalFreeUserCosts;
    const avgMonthlyCost = totalVariableCosts / globalMonthlyData.length;
    const finalMonthFreeUsers = Math.max(0, finalMonthData.mau - finalMonthData.premiumUsers);
    
    // Generate detailed breakdown
    let html = `
        <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 3px solid #667eea;">
            <h5 style="color: #667eea; margin-bottom: 10px;">Variable Cost Summary</h5>
            <div class="cost-item">
                <span class="cost-label">Total Variable Costs (${globalMonthlyData.length} months)</span>
                <span class="cost-value">${formatCurrency(totalVariableCosts)}</span>
            </div>
            <div class="cost-item">
                <span class="cost-label">Average Monthly Variable Costs</span>
                <span class="cost-value">${formatCurrency(avgMonthlyCost)}</span>
            </div>
        </div>
        
        <div class="variable-cost-breakdown">
            <div class="variable-cost-item" style="background: #1a1a1a; padding: 12px; border-radius: 6px; border-left: 3px solid #667eea;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="cost-label" style="color: #667eea; font-weight: bold;">PREMIUM User Support Costs</span>
                    <span class="cost-value" style="color: #667eea;">${formatCurrency(totalPaidUserCosts)}</span>
                </div>
                <div style="font-size: 0.85rem; color: #999;">
                    <div>• Rate: ${formatCurrency(supportCostPerUser)}/user/month</div>
                    <div>• Final Month Users: ${finalMonthData.premiumUsers.toLocaleString()}</div>
                    <div>• Avg Monthly Cost: ${formatCurrency(totalPaidUserCosts / globalMonthlyData.length)}</div>
                </div>
            </div>
            
            <div class="variable-cost-item" style="background: #1a1a1a; padding: 12px; border-radius: 6px; border-left: 3px solid #4ade80; margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="cost-label" style="color: #4ade80; font-weight: bold;">FREE User Infrastructure Costs</span>
                    <span class="cost-value" style="color: #4ade80;">${formatCurrency(totalFreeUserCosts)}</span>
                </div>
                <div style="font-size: 0.85rem; color: #999;">
                    <div>• Rate: ${formatCurrency(costPerUser)}/user/month</div>
                    <div>• Final Month Users: ${finalMonthFreeUsers.toLocaleString()}</div>
                    <div>• Avg Monthly Cost: ${formatCurrency(totalFreeUserCosts / globalMonthlyData.length)}</div>
                </div>
            </div>
            
            <div class="variable-cost-item" style="background: #1a1a1a; padding: 12px; border-radius: 6px; border-left: 3px solid #f59e0b; margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="cost-label" style="color: #f59e0b; font-weight: bold;">Infrastructure Scaling Factor</span>
                    <span class="cost-value" style="color: #f59e0b;">${infraScaling}x</span>
                </div>
                <div style="font-size: 0.85rem; color: #999;">
                    <div>• Applied to all variable costs</div>
                    <div>• Values < 1.0 indicate economies of scale</div>
                    <div>• Values > 1.0 indicate scaling challenges</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function updateFundingRoundsAnalysis(fundingData) {
    const container = document.getElementById('fundingRoundsContent');
    if (!fundingData) {
        container.innerHTML = '<p>Enable multiple funding rounds and calculate projections to see this analysis.</p>';
        return;
    }
    
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

function updateSensitivityAnalysis(acquisitionMetrics, ltv, inputChurnRate, finalARR, netProfit, totalRevenue, totalCosts) {
    const container = document.getElementById('sensitivityAnalysisContent');
    if (!container) return;

    // Base values from the main calculation
    const baseCAC = acquisitionMetrics.averageCAC;
    const baseLTV = ltv;
    const baseChurnRate = inputChurnRate;
    const baseLifespan = 1 / Math.max(baseChurnRate, 0.001);
    const baseConversionRate = parseFloat(document.getElementById('initialConversion').value) / 100;

    const scenarios = [
        { name: 'Optimistic', factor: -0.2, color: '#4ade80' },
        { name: 'Pessimistic', factor: 0.2, color: '#f87171' },
    ];

    let html = scenarios.map(scenario => {
        // Adjust key variables based on the scenario factor
        const adjustedCAC = baseCAC * (1 + scenario.factor); // Pessimistic scenario has higher CAC
        const adjustedChurnRate = Math.max(0.001, baseChurnRate * (1 + scenario.factor)); // Pessimistic has higher churn
        const adjustedConversionRate = baseConversionRate * (1 - scenario.factor); // Pessimistic has lower conversion

        // Recalculate LTV based on adjusted churn
        const adjustedLifespan = 1 / Math.max(adjustedChurnRate, 0.001);
        const adjustedLTV = baseLTV * (adjustedLifespan / baseLifespan);

        // Recalculate key metrics
        const adjustedLTVCAC = adjustedCAC > 0 ? adjustedLTV / adjustedCAC : 0;
        const adjustedPaybackPeriod = adjustedLTV > 0 ? Math.round(adjustedCAC / (adjustedLTV / adjustedLifespan)) : 0;

        // Estimate revenue and profit impact
        const revenueImpactFactor = baseConversionRate > 0 ? (adjustedConversionRate / baseConversionRate) : 1;
        const adjustedARR = finalARR * revenueImpactFactor;

        const costImpactFactor = baseCAC > 0 ? adjustedCAC / baseCAC : 1;
        const acquisitionCosts = acquisitionMetrics.totalAcquisitionCosts;
        const nonAcquisitionCosts = totalCosts - acquisitionCosts;
        const adjustedTotalCosts = nonAcquisitionCosts + (acquisitionCosts * costImpactFactor);
        const adjustedProfit = (totalRevenue * revenueImpactFactor) - adjustedTotalCosts;

        // Determine status based on LTV:CAC ratio
        let status = 'Good';
        let statusColor = '#4ade80';
        const ratio = parseFloat(adjustedLTVCAC);
        if (ratio < 3) {
            status = 'Needs Improvement';
            statusColor = '#f59e0b';
        }
        if (ratio < 1) {
            status = 'Unsustainable';
            statusColor = '#f87171';
        }

        return `
            <div style="border-left: 3px solid ${scenario.color}; padding: 15px; background: #1a1a1a; border-radius: 8px; margin-bottom: 15px;">
                <h5 style="color: ${scenario.color}; margin-bottom: 15px;">${scenario.name} Scenario</h5>
                <div class="cost-item" style="margin-bottom: 8px;">
                    <span class="cost-label">LTV:CAC Ratio
                        <span class="info-icon">?</span>
                        <span class="tooltip">The estimated LTV:CAC ratio in this scenario. This shows the return on investment for acquiring new customers.</span>
                    </span>
                    <span class="cost-value" style="color: ${statusColor};">${ratio.toFixed(1)}:1</span>
                </div>
                <div class="cost-item" style="margin-bottom: 8px;">
                    <span class="cost-label">Payback Period
                        <span class="info-icon">?</span>
                        <span class="tooltip">The estimated time in months to recover the Customer Acquisition Cost (CAC) in this scenario.</span>
                    </span>
                    <span class="cost-value">${adjustedPaybackPeriod} months</span>
                </div>
                 <div class="cost-item" style="margin-bottom: 8px;">
                    <span class="cost-label">Final ARR
                        <span class="info-icon">?</span>
                        <span class="tooltip">The estimated Annual Recurring Revenue (ARR) at the end of the projection period in this scenario.</span>
                    </span>
                    <span class="cost-value">${formatCurrency(adjustedARR)}</span>
                </div>
                <div class="cost-item" style="border-top: 1px solid #333; padding-top: 8px; margin-top: 12px;">
                    <span class="cost-label">Net Profit
                        <span class="info-icon">?</span>
                        <span class="tooltip">The estimated total Net Profit over the entire projection period in this scenario.</span>
                    </span>
                    <span class="cost-value" style="color: ${adjustedProfit >= 0 ? '#4ade80' : '#f87171'};">${formatCurrency(adjustedProfit)}</span>
                </div>
                <div style="margin-top: 10px; padding: 8px; background: ${statusColor}20; border-radius: 4px; text-align: center;">
                    <span style="color: ${statusColor}; font-weight: bold; font-size: 0.85rem;">Business Model: ${status}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    updateAnnualPrice();
    updateAnnualCostDisplays();
    updateCostStructureVisibility();
    displaySavedProjections();
    
    // Initialize slider values
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        updateSliderValue(slider);
    });
    
    // Run initial calculation
    calculateProjections();
});

// Initialize on page load (fallback)
window.onload = function() {
    updateAnnualPrice();
    updateAnnualCostDisplays();
    updateCostStructureVisibility();
    displaySavedProjections();
    calculateProjections();
    
    // Set up event listeners for save/load functionality
    const saveBtn = document.querySelector('button[onclick="saveCurrentProjection()"]');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveCurrentProjection();
        });
        // Also remove the onclick to avoid double calls
        saveBtn.removeAttribute('onclick');
    }
}; 

// Screenshot function
function takeScreenshot() {
    try {
        // Show loading state
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '📷 Capturing...';
        button.disabled = true;

        // Save original styles
        const body = document.body;
        const container = document.querySelector('.container');
        
        const originalBodyMinWidth = body.style.minWidth;
        const originalBodyWidth = body.style.width;
        const originalContainerMaxWidth = container.style.maxWidth;
        const originalContainerWidth = container.style.width;
        const originalContainerMinWidth = container.style.minWidth;
        
        // Force the entire page to render at desktop width
        body.style.minWidth = '1200px';
        body.style.width = '1200px';
        container.style.maxWidth = 'none';
        container.style.width = '1200px';
        container.style.minWidth = '1200px';
        
        // Wait for layout to adjust
        setTimeout(() => {
            // Configure html2canvas options
            const options = {
                allowTaint: true,
                useCORS: true,
                scale: 1,
                scrollX: 0,
                scrollY: 0,
                width: 1200, // Match the forced width
                height: document.documentElement.scrollHeight,
                backgroundColor: '#ffffff',
                logging: false,
                ignoreElements: (element) => {
                    return element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT';
                }
            };

            // Capture the entire document body
            html2canvas(document.body, options).then(canvas => {
                // Restore original styles
                body.style.minWidth = originalBodyMinWidth;
                body.style.width = originalBodyWidth;
                container.style.maxWidth = originalContainerMaxWidth;
                container.style.width = originalContainerWidth;
                container.style.minWidth = originalContainerMinWidth;
                
                // Create download link
                const link = document.createElement('a');
                link.download = `nutrisnap-forecast-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png', 0.9);
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Reset button
                button.textContent = originalText;
                button.disabled = false;
                
                // Show success message
                alert('Screenshot saved successfully!');
                
            }).catch(error => {
                // Restore original styles on error
                body.style.minWidth = originalBodyMinWidth;
                body.style.width = originalBodyWidth;
                container.style.maxWidth = originalContainerMaxWidth;
                container.style.width = originalContainerWidth;
                container.style.minWidth = originalContainerMinWidth;
                
                console.error('Screenshot error:', error);
                alert('Error taking screenshot: ' + error.message);
                
                // Reset button
                button.textContent = originalText;
                button.disabled = false;
            });
        }, 200); // Longer delay to ensure layout adjusts

    } catch (error) {
        console.error('Screenshot function error:', error);
        alert('Screenshot feature not available: ' + error.message);
    }
}

// Enhanced Cost Management Functions
let costEscalations = [];
let marketingPhases = [];

function toggleCostEscalation() {
    const section = document.getElementById('costEscalationSection');
    const enabled = document.getElementById('enableCostEscalation').checked;
    section.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        updateAdvancedAnalyticsVisibility();
    }
    calculateProjections();
}

function toggleMarketingPhases() {
    const section = document.getElementById('marketingPhasesSection');
    const enabled = document.getElementById('enableMarketingPhases').checked;
    section.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        updateMarketingPhases();
        updateAdvancedAnalyticsVisibility();
    }
    calculateProjections();
}

function addCostEscalation() {
    const month = parseInt(document.getElementById('newEscalationMonth').value);
    const teamChange = parseFloat(document.getElementById('newEscalationTeam').value) || 0;
    const techChange = parseFloat(document.getElementById('newEscalationTech').value) || 0;
    const marketingChange = parseFloat(document.getElementById('newEscalationMarketing').value) || 0;
    
    if (!month || month < 1) {
        alert('Please enter a valid month number.');
        return;
    }
    
    if (teamChange === 0 && techChange === 0 && marketingChange === 0) {
        alert('Please enter at least one cost change.');
        return;
    }
    
    // Remove existing escalation for this month if it exists
    costEscalations = costEscalations.filter(e => e.month !== month);
    
    // Add new escalation
    costEscalations.push({
        month: month,
        teamChange: teamChange,
        techChange: techChange,
        marketingChange: marketingChange
    });
    
    // Sort by month
    costEscalations.sort((a, b) => a.month - b.month);
    
    // Clear input fields
    document.getElementById('newEscalationMonth').value = '';
    document.getElementById('newEscalationTeam').value = '';
    document.getElementById('newEscalationTech').value = '';
    document.getElementById('newEscalationMarketing').value = '';
    
    displayCostEscalations();
    
    // Force recalculation to update all displays including cost breakdown
    setTimeout(() => {
        calculateProjections();
    }, 100);
}

function displayCostEscalations() {
    const container = document.getElementById('escalationList');
    
    if (costEscalations.length === 0) {
        container.innerHTML = '<div style="color: #666; font-style: italic; font-size: 0.85rem;">No cost escalations added yet. Add escalations above to see month-by-month cost changes.</div>';
        return;
    }
    
    let html = '';
    
    // Add summary header
    html += `
        <div style="background: #0f0f0f; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; border: 1px solid #333;">
            <div style="color: #667eea; font-weight: 600; font-size: 0.9rem;">📅 Active Cost Escalations (${costEscalations.length})</div>
        </div>
    `;
    
    costEscalations.forEach((escalation, index) => {
        const changes = [];
        if (escalation.teamChange !== 0) changes.push(`Team: ${escalation.teamChange > 0 ? '+' : ''}£${escalation.teamChange.toLocaleString()}`);
        if (escalation.techChange !== 0) changes.push(`Tech: ${escalation.techChange > 0 ? '+' : ''}£${escalation.techChange.toLocaleString()}`);
        if (escalation.marketingChange !== 0) changes.push(`Marketing: ${escalation.marketingChange > 0 ? '+' : ''}£${escalation.marketingChange.toLocaleString()}`);
        
        html += `
            <div style="background: #0a0a0a; padding: 10px; border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid #667eea;">
                <div>
                    <span style="color: #667eea; font-weight: 600;">Month ${escalation.month}:</span>
                    <span style="color: #ccc; margin-left: 8px;">${changes.join(', ')}</span>
                </div>
                <button onclick="removeCostEscalation(${index})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 0.8rem; cursor: pointer;">Remove</button>
            </div>
        `;
    });
    
    // Add impact preview
    const totalEscalations = costEscalations.reduce((sum, esc) => ({
        team: sum.team + esc.teamChange,
        tech: sum.tech + esc.techChange,
        marketing: sum.marketing + esc.marketingChange
    }), { team: 0, tech: 0, marketing: 0 });
    
    if (Math.abs(totalEscalations.team) > 0 || Math.abs(totalEscalations.tech) > 0 || Math.abs(totalEscalations.marketing) > 0) {
        html += `
            <div style="background: #1a1a1a; padding: 10px; border-radius: 4px; margin-top: 10px; border: 1px solid #333;">
                <div style="color: #f59e0b; font-weight: 600; font-size: 0.85rem; margin-bottom: 5px;">💡 Cumulative Impact by Final Month:</div>
                <div style="font-size: 0.8rem; color: #ccc;">
                    ${totalEscalations.team !== 0 ? `Team: ${totalEscalations.team > 0 ? '+' : ''}£${totalEscalations.team.toLocaleString()}` : ''}
                    ${totalEscalations.team !== 0 && (totalEscalations.tech !== 0 || totalEscalations.marketing !== 0) ? ' • ' : ''}
                    ${totalEscalations.tech !== 0 ? `Tech: ${totalEscalations.tech > 0 ? '+' : ''}£${totalEscalations.tech.toLocaleString()}` : ''}
                    ${totalEscalations.tech !== 0 && totalEscalations.marketing !== 0 ? ' • ' : ''}
                    ${totalEscalations.marketing !== 0 ? `Marketing: ${totalEscalations.marketing > 0 ? '+' : ''}£${totalEscalations.marketing.toLocaleString()}` : ''}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function removeCostEscalation(index) {
    costEscalations.splice(index, 1);
    displayCostEscalations();
    
    // Force recalculation to update all displays
    setTimeout(() => {
        calculateProjections();
    }, 100);
}

function updateMarketingPhases() {
    // This function is called when marketing phase inputs change
    // Force recalculation to update all displays including cost breakdown
    setTimeout(() => {
        calculateProjections();
    }, 100);
}

function getMarketingBudgetForMonth(month) {
    if (!document.getElementById('enableMarketingPhases').checked) {
        return null; // Use baseline yearly costs
    }
    
    const launchStart = parseInt(document.getElementById('launchPhaseStart').value) || 1;
    const launchEnd = parseInt(document.getElementById('launchPhaseEnd').value) || 6;
    const launchBudget = parseFloat(document.getElementById('launchPhaseBudget').value) || 0;
    
    const growthStart = parseInt(document.getElementById('growthPhaseStart').value) || 7;
    const growthEnd = parseInt(document.getElementById('growthPhaseEnd').value) || 18;
    const growthBudget = parseFloat(document.getElementById('growthPhaseBudget').value) || 0;
    
    const scaleStart = parseInt(document.getElementById('scalePhaseStart').value) || 19;
    const scaleEnd = parseInt(document.getElementById('scalePhaseEnd').value) || 60;
    const scaleBudget = parseFloat(document.getElementById('scalePhaseBudget').value) || 0;
    
    if (month >= launchStart && month <= launchEnd) {
        return launchBudget;
    } else if (month >= growthStart && month <= growthEnd) {
        return growthBudget;
    } else if (month >= scaleStart && month <= scaleEnd) {
        return scaleBudget;
    }
    
    return 0; // Default if month doesn't fall in any phase
}

function applyCostEscalations(baseTeamCost, baseTechCost, baseMarketingCost, month) {
    let adjustedTeamCost = baseTeamCost;
    let adjustedTechCost = baseTechCost;
    let adjustedMarketingCost = baseMarketingCost;
    
    // Apply all escalations that have occurred up to this month
    costEscalations.forEach(escalation => {
        if (escalation.month <= month) {
            adjustedTeamCost += escalation.teamChange;
            adjustedTechCost += escalation.techChange;
            adjustedMarketingCost += escalation.marketingChange;
        }
    });
    
    // Apply marketing phases if enabled (overrides baseline + escalations)
    const phaseBudget = getMarketingBudgetForMonth(month);
    if (phaseBudget !== null) {
        // Start with escalation changes but use phase budget as base
        adjustedMarketingCost = phaseBudget;
        costEscalations.forEach(escalation => {
            if (escalation.month <= month) {
                adjustedMarketingCost += escalation.marketingChange;
            }
        });
    }
    
    return {
        teamCost: Math.max(0, adjustedTeamCost),
        techCost: Math.max(0, adjustedTechCost),
        marketingCost: Math.max(0, adjustedMarketingCost)
    };
}

