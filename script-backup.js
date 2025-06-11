// Global variables
let revenueChart = null;
let globalMonthlyData = [];
let globalSummaryData = {};
let costEscalations = [];
let monthlyCustomCosts = {};
let costManagementType = 'auto'; // 'auto' or 'manual'

// Marketing strategy data
const marketingStrategies = {
    launch_blitz: {
        name: 'Launch Blitz',
        description: 'Aggressive spending to build initial awareness and user base',
        multiplier: 1.5,
        bestFor: 'Strong pre-launch validation, early adopter market'
    },
    gradual_ramp: {
        name: 'Gradual Ramp-Up', 
        description: 'Conservative start with steady budget increases',
        multiplier: 0.8,
        bestFor: 'Limited funding, organic growth focus'
    },
    consistent_burn: {
        name: 'Consistent Burn',
        description: 'Steady marketing spend throughout the phase',
        multiplier: 1.0,
        bestFor: 'Balanced approach, proven channels'
    },
    viral_focus: {
        name: 'Viral Focus',
        description: 'Lower paid spend, heavy investment in viral mechanics',
        multiplier: 0.6,
        bestFor: 'Product with strong viral potential'
    },
    event_driven: {
        name: 'Event-Driven',
        description: 'Concentrated spending around key events and launches',
        multiplier: 1.3,
        bestFor: 'Seasonal products, major feature releases'
    },
    performance_scale: {
        name: 'Performance Scale',
        description: 'Data-driven scaling of proven channels',
        multiplier: 1.2,
        bestFor: 'Validated CAC, strong unit economics'
    },
    channel_diversify: {
        name: 'Channel Diversification',
        description: 'Testing and expanding across multiple channels',
        multiplier: 1.1,
        bestFor: 'Reducing platform risk, expanding reach'
    },
    content_amplify: {
        name: 'Content Amplification',
        description: 'Heavy investment in content marketing and SEO',
        multiplier: 0.9,
        bestFor: 'B2B markets, long sales cycles'
    },
    partnership_focus: {
        name: 'Partnership Focus',
        description: 'Channel partnerships and integration marketing',
        multiplier: 1.0,
        bestFor: 'Platform businesses, B2B integration'
    },
    retention_acquisition: {
        name: 'Retention + Acquisition',
        description: 'Balanced spend on both new users and retention',
        multiplier: 1.15,
        bestFor: 'High churn concerns, LTV optimization'
    },
    market_domination: {
        name: 'Market Domination',
        description: 'Aggressive spending to capture market share',
        multiplier: 1.6,
        bestFor: 'Winner-take-all markets, strong funding'
    },
    efficiency_focus: {
        name: 'Efficiency Focus',
        description: 'Optimize for lowest CAC and highest ROAS',
        multiplier: 0.8,
        bestFor: 'Capital efficient growth, profitability focus'
    },
    brand_building: {
        name: 'Brand Building',
        description: 'Investment in long-term brand and awareness',
        multiplier: 1.3,
        bestFor: 'Consumer products, differentiation needed'
    },
    global_expansion: {
        name: 'Global Expansion',
        description: 'Geographic expansion and localization',
        multiplier: 1.8,
        bestFor: 'Proven local market, expansion ready'
    },
    lifecycle_optimization: {
        name: 'Lifecycle Optimization',
        description: 'Full-funnel optimization and automation',
        multiplier: 1.1,
        bestFor: 'Mature funnel, automation infrastructure'
    }
};

// Marketing journey recommendations
const marketingJourneys = {
    launch_blitz: {
        recommendedGrowth: 'performance_scale',
        recommendedScale: 'market_domination',
        rationale: 'Aggressive launch → scale proven channels → dominate market'
    },
    gradual_ramp: {
        recommendedGrowth: 'channel_diversify', 
        recommendedScale: 'efficiency_focus',
        rationale: 'Conservative start → diversify risk → optimize efficiency'
    },
    consistent_burn: {
        recommendedGrowth: 'retention_acquisition',
        recommendedScale: 'lifecycle_optimization', 
        rationale: 'Steady foundation → balance growth & retention → optimize full funnel'
    },
    viral_focus: {
        recommendedGrowth: 'content_amplify',
        recommendedScale: 'brand_building',
        rationale: 'Viral mechanics → content scale → brand differentiation'
    },
    event_driven: {
        recommendedGrowth: 'partnership_focus',
        recommendedScale: 'global_expansion',
        rationale: 'Event momentum → strategic partnerships → geographic expansion'
    }
};

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
    
    const displayEl = document.getElementById('annualPriceDisplay');
    if (displayEl) {
        displayEl.innerHTML = `
            <strong>Effective Annual Price: £${annualPrice.toFixed(2)}</strong>
            <small>Blended rate considering discount adoption</small>
        `;
    }
}

// Format currency
function formatCurrency(amount) {
    return '£' + Math.round(amount).toLocaleString();
}

// Main calculation function
function calculateProjections(isManualTrigger = false) {
    console.log(`🚀 Starting calculateProjections... (Manual Trigger: ${isManualTrigger})`);
    
    try {
        const getEl = (id) => document.getElementById(id);
        const getVal = (id) => parseFloat(getEl(id)?.value) || 0;
        const getInt = (id) => parseInt(getEl(id)?.value) || 0;
        const getChecked = (id) => getEl(id)?.checked || false;

        // Get all input values
        const appPrice = getVal('appPrice');
        const annualDiscount = getVal('annualDiscount') / 100;
        const annualPrice = appPrice * 12 * (1 - annualDiscount);
        const annualPlanPercentage = getVal('annualPlanPercentage') / 100;
        const projectionMonths = getInt('projectionPeriod');
        const startingMAU = getInt('startingMAU');
        
        const growthRates = {
            1: getVal('year1Growth') / 100,
            2: getVal('year2Growth') / 100,
            3: getVal('year3Growth') / 100,
        };
        
        const initialConversion = getVal('initialConversion') / 100;
        const conversionGrowth = getVal('conversionGrowth') / 100;
        const freeChurnRate = getVal('freeChurnRate') / 100;
        const paidChurnRate = getVal('churnRate') / 100;
        const churnImprovement = getVal('churnImprovement') / 100;
        
        const b2bStartMonth = getInt('b2bStartMonth');
        const b2bPercentage = getVal('b2bPercentage') / 100;
        
        const teamCosts = {
            1: getVal('teamCostY1'),
            2: getVal('teamCostY2'),
            3: getVal('teamCostY3'),
        };
        const techCosts = {
            1: getVal('techCostY1'),
            2: getVal('techCostY2'),
            3: getVal('techCostY3'),
        };
        const marketingCosts = {
            1: getVal('marketingCostY1'),
            2: getVal('marketingCostY2'),
            3: getVal('marketingCostY3'),
        };
        
        const seedInvestment = getVal('seedInvestment');
        const equityOffered = getVal('equityOffered') / 100;
        const valuationMultiple = getVal('valuationMultiple');

        // Advanced Features Toggles
        const enableTieredPricing = getChecked('enableTieredPricing');
        const enableCohortTracking = getChecked('enableCohortTracking');
        const enableVariableCosts = getChecked('enableVariableCosts');
        const enableMultipleRounds = getChecked('enableMultipleRounds');
        
        const parameters = {
            appPrice, annualDiscount, annualPlanPercentage, projectionMonths, startingMAU,
            growthRates, initialConversion, conversionGrowth, freeChurnRate, paidChurnRate, churnImprovement,
            b2bStartMonth, b2bPercentage, teamCosts, techCosts, marketingCosts,
            seedInvestment, equityOffered, valuationMultiple,
            enableTieredPricing, enableCohortTracking, enableVariableCosts, enableMultipleRounds,
            costPerUser: getVal('costPerUser'),
            supportCostPerUser: getVal('supportCostPerUser'),
            infraScaling: getVal('infraScaling'),
            churnRate: getVal('churnRate'), // Paid churn
            churnImprovement: getVal('churnImprovement'),
            b2bPercentage: getVal('b2bPercentage'),
            teamCostY1: getVal('teamCostY1'),
            teamCostY2: getVal('teamCostY2'),
            teamCostY3: getVal('teamCostY3'),
            techCostY1: getVal('techCostY1'),
            techCostY2: getVal('techCostY2'),
            techCostY3: getVal('techCostY3'),
            marketingCostY1: getVal('marketingCostY1'),
            marketingCostY2: getVal('marketingCostY2'),
            marketingCostY3: getVal('marketingCostY3'),
            retentionDecay: getVal('retentionDecay'),
            cohortLtvMultiplier: getVal('cohortLtvMultiplier'),
            seriesAMonth: getVal('seriesAMonth'),
            seriesAAmount: getVal('seriesAAmount'),
            seriesAEquity: getVal('seriesAEquity'),
            seriesBMonth: getVal('seriesBMonth'),
            seriesBAmount: getVal('seriesBAmount'),
            seriesBEquity: getVal('seriesBEquity'),
            enableCostEscalation: getChecked('enableCostEscalation'),
            enableMarketingPhases: getChecked('enableMarketingPhases'),
            costEscalations: JSON.parse(JSON.stringify(costEscalations)), // Deep copy
            launchPhaseStart: getVal('launchPhaseStart'),
            launchPhaseEnd: getVal('launchPhaseEnd'),
            launchPhaseBudget: getVal('launchPhaseBudget'),
            launchStrategy: getVal('launchStrategy'),
            growthPhaseStart: getVal('growthPhaseStart'),
            growthPhaseEnd: getVal('growthPhaseEnd'),
            growthPhaseBudget: getVal('growthPhaseBudget'),
            growthStrategy: getVal('growthStrategy'),
            scalePhaseStart: getVal('scalePhaseStart'),
            scalePhaseEnd: getVal('scalePhaseEnd'),
            scalePhaseBudget: getVal('scalePhaseBudget'),
            scaleStrategy: getVal('scaleStrategy'),
            basicPrice: getVal('basicPrice'),
            basicConversion: getVal('basicConversion'),
            proPrice: getVal('proPrice'),
            proConversion: getVal('proConversion'),
            enterprisePrice: getVal('enterprisePrice'),
            enterpriseConversion: getVal('enterpriseConversion'),
            betaUsersM0: getInt('betaUsersM0'),
            betaTeamCostM0: getVal('betaTeamCostM0'),
            betaTechCostM0: getVal('betaTechCostM0'),
            betaMarketingCostM0: getVal('betaMarketingCostM0'),
            betaUsersM1: getInt('betaUsersM1'),
            betaTeamCostM1: getVal('betaTeamCostM1'),
            betaTechCostM1: getVal('betaTechCostM1'),
            betaMarketingCostM1: getVal('betaMarketingCostM1'),
            betaUsersM2: getInt('betaUsersM2'),
            betaTeamCostM2: getVal('betaTeamCostM2'),
            betaTechCostM2: getVal('betaTechCostM2'),
            betaMarketingCostM2: getVal('betaMarketingCostM2'),
        };

        let monthlyData = [];
        let totalRevenue = 0;
        let totalCosts = 0;
        let breakEvenMonth = null;
        let cashBalance = seedInvestment;
        let totalUsersAcquired = 0;
        
        // --- NEW: Beta Period Calculation (Months 0-2) ---
        for (let i = 0; i < 3; i++) {
            const betaUsers = getInt(`betaUsersM${i}`);
            const teamCost = getVal(`betaTeamCostM${i}`);
            const techCost = getVal(`betaTechCostM${i}`);
            const marketingCost = getVal(`betaMarketingCostM${i}`);
            const totalBetaCost = teamCost + techCost + marketingCost;
            
            cashBalance -= totalBetaCost;
            totalCosts += totalBetaCost;

            monthlyData.push({
                month: i,
                isBeta: true,
                mau: betaUsers,
                growthRate: 0,
                freeUsers: betaUsers,
                premiumUsers: 0, basicUsers: 0, proUsers: 0,
                conversionRate: 0,
                monthlyRevenue: 0,
                arr: 0,
                teamCost: teamCost,
                techCost: techCost,
                marketingCost: marketingCost,
                variableCosts: 0,
                monthlyCosts: totalBetaCost,
                netIncome: -totalBetaCost,
            });
        }
        
        // --- Main Projection Calculation (starts after beta) ---

        // Tiered pricing state
        let tierUserCounts = {};
        if (enableTieredPricing) {
            tierUserCounts = { 'Basic': 0, 'Pro': 0 };
        }

        // Initialize mau and freeUsers for the loop
        let currentPremiumUsers = 0;
        // The starting free users for the main projection are the users from the *last* beta month.
        let currentFreeUsers = getInt('betaUsersM2'); 

        for (let month = 1; month <= projectionMonths; month++) {
            const timelineMonth = month + 2; // To account for 3 beta months (0, 1, 2)
            const year = Math.ceil(month / 12);
            const yearsElapsed = (timelineMonth - 1) / 12;

            // 1. CHURN: Apply churn to the existing user base from the START of the month
            const currentPaidChurnRate = Math.max(paidChurnRate * (1 - (churnImprovement * yearsElapsed)), 0.01);
            const currentFreeChurnRate = Math.max(freeChurnRate * (1 - (churnImprovement * yearsElapsed)), 0.02);
            
            const churnedPremium = Math.round(currentPremiumUsers * currentPaidChurnRate);
            const churnedFree = Math.round(currentFreeUsers * currentFreeChurnRate);

            currentPremiumUsers -= churnedPremium;
            currentFreeUsers -= churnedFree;
            
            // 2. GROWTH: Calculate new users based on the post-churn MAU
            const mauBeforeGrowth = currentPremiumUsers + currentFreeUsers;
            const growthRate = growthRates[Math.min(year, 3)] || growthRates[3];
            const newUsers = Math.round(mauBeforeGrowth * growthRate);
            
            // Add new users to the free tier
            currentFreeUsers += newUsers;
            
            // 3. CONVERSION: Convert free users to paid
            let monthlyRevenue = 0;
            const currentConversionRate = Math.min(initialConversion * (1 + (conversionGrowth * yearsElapsed)), 0.50);
            
            if (enableTieredPricing) {
                // Tiered model conversion
                const basicConversion = getVal('basicConversion') / 100;
                const proConversion = getVal('proConversion') / 100;
                
                const newBasic = Math.round(currentFreeUsers * basicConversion);
                tierUserCounts['Basic'] = (tierUserCounts['Basic'] || 0) + newBasic;
                currentPremiumUsers += newBasic;
                currentFreeUsers -= newBasic;
                totalUsersAcquired += newBasic;

                const newPro = Math.round(currentFreeUsers * proConversion);
                tierUserCounts['Pro'] = (tierUserCounts['Pro'] || 0) + newPro;
                currentPremiumUsers += newPro;
                currentFreeUsers -= newPro;
                totalUsersAcquired += newPro;

                const basicPrice = getVal('basicPrice');
                const proPrice = getVal('proPrice');
                monthlyRevenue += (tierUserCounts['Basic'] || 0) * basicPrice;
                monthlyRevenue += (tierUserCounts['Pro'] || 0) * proPrice;

            } else {
                const newPremiumUsers = Math.round(currentFreeUsers * currentConversionRate);
                currentPremiumUsers += newPremiumUsers;
                currentFreeUsers -= newPremiumUsers;
                totalUsersAcquired += newPremiumUsers;
                
                const monthlyUsers = Math.round(currentPremiumUsers * (1 - annualPlanPercentage));
                const annualUsers = currentPremiumUsers - monthlyUsers;
                monthlyRevenue = (monthlyUsers * appPrice) + (annualUsers * (annualPrice / 12));
            }

            // Update total MAU at the end of all movements
            const finalMAUForMonth = currentPremiumUsers + currentFreeUsers;

            // B2B Revenue
            if (timelineMonth >= b2bStartMonth) {
                monthlyRevenue += monthlyRevenue * b2bPercentage;
            }
            
            // Costs
            const baseTeamCost = teamCosts[Math.min(year, 3)] || teamCosts[3];
            const baseTechCost = techCosts[Math.min(year, 3)] || techCosts[3];
            const baseMarketingCost = marketingCosts[Math.min(year, 3)] || marketingCosts[3];

            // Check for monthly overrides from the modal editor
            const customMonthTeamCost = monthlyCustomCosts[`team_${timelineMonth}`];
            const customMonthTechCost = monthlyCustomCosts[`tech_${timelineMonth}`];
            const customMonthMarketingCost = monthlyCustomCosts[`marketing_${timelineMonth}`];

            let monthlyTeamCost = customMonthTeamCost !== undefined ? customMonthTeamCost : baseTeamCost;
            let monthlyTechCost = customMonthTechCost !== undefined ? customMonthTechCost : baseTechCost;
            let monthlyMarketingCost = customMonthMarketingCost !== undefined ? customMonthMarketingCost : baseMarketingCost;
            
            let monthlyVariableCosts = 0;
            if (enableVariableCosts) {
                const costPerUser = getVal('costPerUser');
                const supportCostPerUser = getVal('supportCostPerUser');
                monthlyVariableCosts = (currentFreeUsers * costPerUser) + (currentPremiumUsers * supportCostPerUser);
            }

            const monthlyCosts = monthlyTeamCost + monthlyTechCost + monthlyMarketingCost + monthlyVariableCosts;
            const netIncome = monthlyRevenue - monthlyCosts;

            cashBalance += netIncome;
            totalRevenue += monthlyRevenue;
            totalCosts += monthlyCosts;

            if (netIncome > 0 && breakEvenMonth === null) {
                breakEvenMonth = timelineMonth;
            }

            monthlyData.push({
                month: timelineMonth,
                isBeta: false,
                mau: finalMAUForMonth, growthRate: growthRate, freeUsers: currentFreeUsers,
                premiumUsers: currentPremiumUsers,
                basicUsers: tierUserCounts['Basic'] || 0,
                proUsers: tierUserCounts['Pro'] || 0,
                enterpriseUsers: 0,
                conversionRate: currentConversionRate,
                monthlyRevenue,
                arr: monthlyRevenue * 12,
                teamCost: monthlyTeamCost,
                techCost: monthlyTechCost,
                marketingCost: monthlyMarketingCost,
                variableCosts: monthlyVariableCosts,
                monthlyCosts, netIncome,
            });
        }
        
        console.log("Calculation loop finished. Final month data:", monthlyData[monthlyData.length-1]);

        // Final Metrics Calculation
        const finalData = monthlyData[monthlyData.length - 1] || {};
        const finalARR = finalData.arr || 0;
        const netProfit = totalRevenue - totalCosts;

        const avgPaidChurn = paidChurnRate; 
        const avgLifespan = avgPaidChurn > 0 ? 1 / avgPaidChurn : 0;
        const avgMonthlyRevenue = currentPremiumUsers > 0 ? totalRevenue / monthlyData.reduce((acc, d) => acc + d.premiumUsers, 0) : 0;
        const ltv = avgMonthlyRevenue * avgLifespan;
        const cac = totalUsersAcquired > 0 ? totalCosts / totalUsersAcquired : 0;
        const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(1) + ':1' : 'N/A';
        const exitValuation = finalARR * valuationMultiple;
        const investorReturn = exitValuation * equityOffered;
        const returnMultiple = seedInvestment > 0 ? (investorReturn / seedInvestment).toFixed(1) + 'x' : 'N/A';
        const finalCashBalance = finalData.cashBalance || 0;
        const monthlyBurn = monthlyData.length > 1 ? (monthlyData[monthlyData.length - 2].cashBalance - finalCashBalance) : 0;
        const runway = monthlyBurn > 0 ? Math.floor(finalCashBalance / monthlyBurn) : 'Profitable';

        // NEW: Consolidate all results into a single summary object with REAL data
        const summaryData = {
            finalMAU: finalData?.mau || 0,
            finalARR: finalARR || 0,
            breakEvenMonth: breakEvenMonth ? `Month ${breakEvenMonth}` : 'Not Reached',
            exitValuation: exitValuation || 0,
            investorReturn: `${formatCurrency(investorReturn || 0)} (${returnMultiple})`,
            totalRevenue: totalRevenue || 0,
            totalCosts: totalCosts || 0,
            netProfit: netProfit || 0,
            ltvCacRatio: ltvCacRatio || 'N/A',
            customerLTV: ltv || 0,
            monthlyARPU: avgMonthlyRevenue || 0,
            customerCAC: cac || 0,
            runway: runway || 0,
            currentBurnRate: monthlyBurn || 0,
            parameters: parameters || {},
            costBreakdown: {}, // This can be populated with more detailed year-by-year costs if needed
            cacBreakdown: {
                totalMarketingCosts: totalCosts, // Simplified: using total costs for now
                salesOverhead: 0, // Placeholder
                totalAcquisitionCosts: totalCosts, // Simplified
                totalUsersAcquired: totalUsersAcquired || 0,
                averageCAC: cac || 0
            },
            // Placeholders for future advanced analytics data
            tieredRevenueData: {}, 
            cohortData: {}, 
            variableCostData: {}, 
            fundingData: {}
        };
        
        console.log('📊 Summary data created:', summaryData);

        // NEW: Centralized call to display results
        displayResults(monthlyData, summaryData, isManualTrigger);
        
        console.log('✅ Projections calculated and displayed.');

    } catch (error) {
        console.error("❌ An error occurred during projection calculation:", error);
        const outputSection = document.getElementById('outputSection');
        if (outputSection) {
            outputSection.innerHTML = `<div class="card" style="border-color: #ef4444; color: #ef4444;"><h2>Calculation Error</h2><p>Something went wrong. Please check your inputs or refresh the page. Error: ${error.message}</p></div>`;
            outputSection.style.display = 'block';
        }
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NutriSnap Financial Forecast loading...');
    
    // Set default values and initialize UI components
    document.querySelectorAll('input[type="range"]').forEach(slider => updateSliderValue(slider));
    updateAnnualPrice();
    
    // Add event listeners to all inputs to recalculate on change
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        // Only auto-calculate for specific non-disruptive inputs
        if (input.type === 'range') {
            input.addEventListener('input', () => {
                updateSliderValue(input);
                // Don't auto-calculate to avoid scroll interruption
            });
        }
        // Remove auto-calculation on change to prevent user interruption
        // User must click "Calculate Projections" button to run calculations
    });

    console.log('✅ App initialized. Ready for calculations.');
    // Don't run initial calculation on load - user will click button
});

function updateCostBreakdown(yearCosts) {
    console.log('🏗️ Updating cost breakdown with:', yearCosts);
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
                        ${hasEscalations ? '<span style="color: #667eea; font-size: 0.7rem; margin-left: 5px; background: #1a1a1a; padding: 2px 6px; border-radius: 3px;">📈 Auto-Calculated</span><span class="info-icon" style="color: #667eea;">?</span><span class="tooltip">Includes cost escalations and baseline adjustments</span>' : ''}
                    </span>
                    <span class="cost-value">${formatCurrency(costs.team)} total (avg ${formatCurrency(avgMonthlyTeam)}/mo)</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Tech Costs
                        ${hasEscalations ? '<span style="color: #667eea; font-size: 0.7rem; margin-left: 5px; background: #1a1a1a; padding: 2px 6px; border-radius: 3px;">📈 Auto-Calculated</span><span class="info-icon" style="color: #667eea;">?</span><span class="tooltip">Includes cost escalations and baseline adjustments</span>' : ''}
                    </span>
                    <span class="cost-value">${formatCurrency(costs.tech)} total (avg ${formatCurrency(avgMonthlyTech)}/mo)</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Marketing Costs
                        ${hasMarketingPhases ? 
                            '<span style="color: #667eea; font-size: 0.7rem; margin-left: 5px; background: #1a1a1a; padding: 2px 6px; border-radius: 3px;">📈 Auto-Calculated</span><span class="info-icon" style="color: #f59e0b;">?</span><span class="tooltip">Uses marketing campaign phases instead of baseline costs</span>' : 
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
    const setTxt = (id, text) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
        } else {
            console.warn(`Element with ID '${id}' not found for CAC breakdown.`);
        }
    };

    // Ensure metrics object exists and has defaults
    const safeMetrics = metrics || {};
    const totalMarketing = safeMetrics.totalMarketingCosts || 0;
    const salesOverhead = safeMetrics.salesOverhead || 0;
    const totalAcquisition = safeMetrics.totalAcquisitionCosts || 0;
    const totalUsers = safeMetrics.totalUsersAcquired || 0;
    const averageCAC = safeMetrics.averageCAC || 0;

    setTxt('totalMarketingCosts', formatCurrency(totalMarketing));
    setTxt('salesOverhead', formatCurrency(salesOverhead));
    setTxt('totalAcquisitionCosts', formatCurrency(totalAcquisition));
    setTxt('totalUsersAcquiredDisplay', totalUsers.toLocaleString());
    setTxt('averageCACDisplay', formatCurrency(averageCAC));
    
    const paybackPeriod = avgMonthlyRevenue > 0 ? Math.round(averageCAC / avgMonthlyRevenue) : 0;
    setTxt('paybackPeriod', paybackPeriod + ' months');
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
    if (!s) return;

    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = value;
        } else {
            console.warn(`Element with ID '${id}' not found for scenario loading.`);
        }
    };

    setVal('appPrice', s.appPrice);
    setVal('annualDiscount', s.annualDiscount);
    setVal('annualPlanPercentage', s.annualPlanPercentage);
    setVal('startingMAU', s.startingMAU);
    
    setVal('year1Growth', s.year1Growth);
    setVal('year2Growth', s.year2Growth);
    setVal('year3Growth', s.year3Growth);
    
    setVal('initialConversion', s.initialConversion);
    setVal('conversionGrowth', s.conversionGrowth);
    setVal('churnRate', s.churnRate); // Paid churn
    setVal('freeChurnRate', s.freeChurnRate); // Free churn
    setVal('churnImprovement', s.churnImprovement);
    
    setVal('b2bStartMonth', s.b2bStartMonth);
    setVal('b2bPercentage', s.b2bPercentage);

    setVal('teamCostY1', s.teamCostY1);
    setVal('teamCostY2', s.teamCostY2);
    setVal('teamCostY3', s.teamCostY3);

    setVal('techCostY1', s.techCostY1);
    setVal('techCostY2', s.techCostY2);
    setVal('techCostY3', s.techCostY3);

    setVal('marketingCostY1', s.marketingCostY1);
    setVal('marketingCostY2', s.marketingCostY2);
    setVal('marketingCostY3', s.marketingCostY3);

    setVal('seedInvestment', s.seedInvestment);
    setVal('equityOffered', s.equityOffered);
    setVal('valuationMultiple', s.valuationMultiple);

    // Update all slider display values
    document.querySelectorAll('input[type="range"]').forEach(slider => updateSliderValue(slider));
    
    updateAnnualPrice();
    // Don't auto-calculate to avoid user interruption
    
    console.log(`👍 Loaded '${scenario}' scenario.`);
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
    const projectionPeriodEl = document.getElementById('projectionPeriod');
    if (!projectionPeriodEl) {
        console.warn('⚠️ projectionPeriod element not found, skipping cost structure visibility update');
        return;
    }
    const projectionMonths = parseInt(projectionPeriodEl.value) || 36;
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
        const inputElement = document.querySelector(`#${id}`);
        if (inputElement) {
            const inputGroup = inputElement.closest('.input-group');
            if (inputGroup) {
                inputGroup.style.display = year <= projectionYears ? 'block' : 'none';
            }
        }
    });
}

function populateParametersSummary(params) {
    const container = document.getElementById('parametersSummaryContent');
    if (!container) return;

    // Helper to safely get values and format them
    const getParam = (value, unit = '', decimals = 0) => {
        if (value === undefined || value === null) return 'N/A';
        return `${Number(value).toFixed(decimals)}${unit}`;
    };
    
    const getPercent = (value) => {
        if (value === undefined || value === null) return 'N/A';
        return `${(Number(value) * 100).toFixed(1)}%`;
    };

    // Build growth parameters dynamically
    let growthHTML = '';
    if (params.growthRates) {
        Object.keys(params.growthRates).forEach(year => {
            growthHTML += `<div class="param-item"><span class="param-label">Year ${year} Growth</span><span class="param-value">${getPercent(params.growthRates[year])}/mo</span></div>`;
        });
    }

    // Build pricing section based on tiered vs single pricing
    let pricingHTML = '';
    if (params.enableTieredPricing) {
        pricingHTML = `
            <div class="param-item"><span class="param-label">Pricing Model</span><span class="param-value">Tiered Pricing</span></div>
            <div class="param-item"><span class="param-label">Basic Tier Price</span><span class="param-value">${formatCurrency(params.basicPrice || 0)}</span></div>
            <div class="param-item"><span class="param-label">Basic Conversion</span><span class="param-value">${getParam(params.basicConversion, '%')}</span></div>
            <div class="param-item"><span class="param-label">Pro Tier Price</span><span class="param-value">${formatCurrency(params.proPrice || 0)}</span></div>
            <div class="param-item"><span class="param-label">Pro Conversion</span><span class="param-value">${getParam(params.proConversion, '%')}</span></div>
        `;
    } else {
        pricingHTML = `<div class="param-item"><span class="param-label">Monthly Price</span><span class="param-value">${formatCurrency(params.appPrice || 0)}</span></div>`;
    }

    container.innerHTML = `
        <div class="param-group">
            <h4>Revenue Parameters</h4>
            ${pricingHTML}
            <div class="param-item"><span class="param-label">Annual Discount</span><span class="param-value">${getPercent(params.annualDiscount)}</span></div>
            <div class="param-item"><span class="param-label">Annual Plan Uptake</span><span class="param-value">${getPercent(params.annualPlanPercentage)}</span></div>
            <div class="param-item"><span class="param-label">Launch MAU</span><span class="param-value">${(params.startingMAU || 0).toLocaleString()}</span></div>
            <div class="param-item"><span class="param-label">Projection Period</span><span class="param-value">${getParam(params.projectionMonths, ' months')}</span></div>
        </div>
        <div class="param-group">
            <h4>Growth</h4>
            ${growthHTML}
        </div>
        <div class="param-group">
            <h4>Conversion & Retention</h4>
            ${!params.enableTieredPricing ? `
            <div class="param-item"><span class="param-label">Initial Conversion</span><span class="param-value">${getPercent(params.initialConversion)}</span></div>
            <div class="param-item"><span class="param-label">Conversion Growth</span><span class="param-value">${getPercent(params.conversionGrowth)}/yr</span></div>` : ''}
            <div class="param-item"><span class="param-label">Free User Churn</span><span class="param-value">${getPercent(params.freeChurnRate)}/mo</span></div>
            <div class="param-item"><span class="param-label">Paid User Churn</span><span class="param-value">${getPercent(params.paidChurnRate)}/mo</span></div>
            <div class="param-item"><span class="param-label">Churn Improvement</span><span class="param-value">${getPercent(params.churnImprovement)}/yr</span></div>
        </div>
        <div class="param-group">
            <h4>Investment</h4>
            <div class="param-item"><span class="param-label">Seed Investment</span><span class="param-value">${formatCurrency(params.seedInvestment || 0)}</span></div>
            <div class="param-item"><span class="param-label">Equity Offered</span><span class="param-value">${getPercent(params.equityOffered)}</span></div>
            <div class="param-item"><span class="param-label">Exit Multiple</span><span class="param-value">${getParam(params.valuationMultiple, 'x ARR', 1)}</span></div>
        </div>
        <div class="param-group">
            <h4>Beta Development Period (Months 0-2)</h4>
            <div class="param-item"><span class="param-label">Month 0 Users/Costs</span><span class="param-value">${(params.betaUsersM0 || 0).toLocaleString()} / ${formatCurrency(params.betaTeamCostM0 + params.betaTechCostM0 + params.betaMarketingCostM0)}</span></div>
            <div class="param-item"><span class="param-label">Month 1 Users/Costs</span><span class="param-value">${(params.betaUsersM1 || 0).toLocaleString()} / ${formatCurrency(params.betaTeamCostM1 + params.betaTechCostM1 + params.betaMarketingCostM1)}</span></div>
            <div class="param-item"><span class="param-label">Month 2 Users/Costs</span><span class="param-value">${(params.betaUsersM2 || 0).toLocaleString()} / ${formatCurrency(params.betaTeamCostM2 + params.betaTechCostM2 + params.betaMarketingCostM2)}</span></div>
        </div>
        <div class="param-group">
            <h4>Revenue Parameters (Post-Beta)</h4>
            ${pricingHTML}
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
        const projectionMonths = parseInt(getInputValue('projectionPeriod')) || 36;
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
            
            // Cohort Tracking Parameters (if enabled)
            retentionDecay: getElementValue('retentionDecay', '0.5'),
            cohortLtvMultiplier: getElementValue('cohortLtvMultiplier', '1.1'),
            
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
            launchStrategy: getElementValue('launchStrategy', 'custom'),
            growthPhaseStart: getElementValue('growthPhaseStart', '7'),
            growthPhaseEnd: getElementValue('growthPhaseEnd', '18'),
            growthPhaseBudget: getElementValue('growthPhaseBudget', '3000'),
            growthStrategy: getElementValue('growthStrategy', 'custom'),
            scalePhaseStart: getElementValue('scalePhaseStart', '19'),
            scalePhaseEnd: getElementValue('scalePhaseEnd', '60'),
            scalePhaseBudget: getElementValue('scalePhaseBudget', '5000'),
            scaleStrategy: getElementValue('scaleStrategy', 'custom'),
            betaUsersM0: getInt('betaUsersM0'),
            betaTeamCostM0: getVal('betaTeamCostM0'),
            betaTechCostM0: getVal('betaTechCostM0'),
            betaMarketingCostM0: getVal('betaMarketingCostM0'),
            betaUsersM1: getInt('betaUsersM1'),
            betaTeamCostM1: getVal('betaTeamCostM1'),
            betaTechCostM1: getVal('betaTechCostM1'),
            betaMarketingCostM1: getVal('betaMarketingCostM1'),
            betaUsersM2: getInt('betaUsersM2'),
            betaTeamCostM2: getVal('betaTeamCostM2'),
            betaTechCostM2: getVal('betaTechCostM2'),
            betaMarketingCostM2: getVal('betaMarketingCostM2'),
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
    
    // Load Cohort Tracking Parameters
    if (document.getElementById('retentionDecay')) {
        document.getElementById('retentionDecay').value = data.retentionDecay || '0.5';
    }
    if (document.getElementById('cohortLtvMultiplier')) {
        document.getElementById('cohortLtvMultiplier').value = data.cohortLtvMultiplier || '1.1';
    }
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
    if (document.getElementById('launchStrategy')) {
        document.getElementById('launchStrategy').value = data.launchStrategy || 'custom';
        applyMarketingStrategy('launch');
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
    if (document.getElementById('growthStrategy')) {
        document.getElementById('growthStrategy').value = data.growthStrategy || 'custom';
        applyMarketingStrategy('growth');
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
    if (document.getElementById('scaleStrategy')) {
        document.getElementById('scaleStrategy').value = data.scaleStrategy || 'custom';
        applyMarketingStrategy('scale');
    }

    // Update displays and toggle sections
    updateAnnualPrice();
    updateAnnualCostDisplays();
    
    // Toggle advanced feature sections FIRST (to ensure all elements are visible)
    toggleTieredPricing();
    toggleCohortTracking();
    toggleVariableCosts();
    toggleMultipleRounds();
    toggleCostEscalation();
    toggleMarketingPhases();
    
    // Display loaded cost escalations
    displayCostEscalations();
    
    // Wait for all sections to be visible, then update ALL sliders
    setTimeout(() => {
        const allSliders = document.querySelectorAll('input[type="range"]');
        console.log(`🎚️ Updating ${allSliders.length} sliders after loading projection`);
        
        allSliders.forEach(slider => {
            if (slider && slider.id) {
                console.log(`🔄 Updating slider: ${slider.id} = ${slider.value}`);
                updateSliderValue(slider);
            }
        });
        
        // Force visibility check for growth parameters based on projection period
        updateCostStructureVisibility();
        
        // Final slider update for any newly visible elements
        setTimeout(() => {
            const finalSliders = document.querySelectorAll('input[type="range"]');
            finalSliders.forEach(slider => {
                if (slider && slider.id) {
                    updateSliderValue(slider);
                }
            });
            console.log('✅ All sliders updated after projection load');
        }, 200);
    }, 150);
    
    alert(`Projection "${projection.name}" loaded successfully!`);
    
    // Don't auto-calculate to avoid user interruption
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
    
    if (section) {
        section.style.display = enabled ? 'block' : 'none';
        console.log('Tiered pricing section toggled:', enabled ? 'visible' : 'hidden');
        
        if (enabled) {
            // Initialize tier toggles and grid layout
            updateTiersGridLayout();
        }
    }
    
    // Don't auto-calculate to avoid user interruption
}

function toggleCohortTracking() {
    const enabled = document.getElementById('enableCohortTracking').checked;
    const section = document.getElementById('cohortTrackingSection');
    
    if (section) {
        section.style.display = enabled ? 'block' : 'none';
        console.log('Cohort tracking section toggled:', enabled ? 'visible' : 'hidden');
    }
    
    // Don't auto-calculate to avoid user interruption
}

function toggleVariableCosts() {
    const enabled = document.getElementById('enableVariableCosts').checked;
    const section = document.getElementById('variableCostsSection');
    
    if (section) {
        section.style.display = enabled ? 'block' : 'none';
        console.log('Variable costs section toggled:', enabled ? 'visible' : 'hidden');
    }
    
    // Don't auto-calculate to avoid user interruption
}

function toggleMultipleRounds() {
    const enabled = document.getElementById('enableMultipleRounds').checked;
    const section = document.getElementById('multipleRoundsSection');
    const analysis = document.getElementById('fundingRoundsAnalysis');
    
    if (section) section.style.display = enabled ? 'block' : 'none';
    if (analysis) analysis.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        const advancedAnalytics = document.getElementById('advancedAnalytics');
        if (advancedAnalytics) advancedAnalytics.style.display = 'block';
    } else {
        updateAdvancedAnalyticsVisibility();
    }
    
    // Don't auto-calculate to avoid user interruption
}

function updateAdvancedAnalyticsVisibility() {
    const tieredEl = document.getElementById('enableTieredPricing');
    const cohortEl = document.getElementById('enableCohortTracking');
    const variableEl = document.getElementById('enableVariableCosts');
    const multipleEl = document.getElementById('enableMultipleRounds');
    const analyticsEl = document.getElementById('advancedAnalytics');
    
    const hasTiered = tieredEl ? tieredEl.checked : false;
    const hasCohort = cohortEl ? cohortEl.checked : false;
    const hasVariable = variableEl ? variableEl.checked : false;
    const hasMultiple = multipleEl ? multipleEl.checked : false;
    
    const showAdvanced = hasTiered || hasCohort || hasVariable || hasMultiple;
    if (analyticsEl) {
        analyticsEl.style.display = showAdvanced ? 'block' : 'none';
    }
}

// Individual tier visibility control
function toggleTierVisibility(tier) {
    const checkbox = document.getElementById(`enable${tier.charAt(0).toUpperCase() + tier.slice(1)}Tier`);
    const section = document.getElementById(`${tier}TierSection`);
    
    if (checkbox && section) {
        if (checkbox.checked) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
        
        // Update grid layout based on visible tiers
        updateTiersGridLayout();
    }
    
    // Don't auto-calculate to avoid user interruption
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
    
    // Initialize marketing strategy previews
    setTimeout(() => {
        applyMarketingStrategy('launch');
        applyMarketingStrategy('growth');
        applyMarketingStrategy('scale');
    }, 100);
    
    // Initialize unified cost management
    switchCostTab('base'); // Start with base costs tab
    
    // Auto-populate cost structure if enabled
    if (document.getElementById('enableAutoCostCalculation')?.checked) {
        setTimeout(() => {
            autoPopulateCostStructure();
        }, 100); // Small delay to ensure all elements are loaded
    }
    
    // Don't run initial calculation - user will click button
});

// Initialize on page load (fallback)
window.onload = function() {
    updateAnnualPrice();
    updateAnnualCostDisplays();
    updateCostStructureVisibility();
    displaySavedProjections();
    // Don't auto-calculate - user will click button
    
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
// costEscalations already declared at top of file
let marketingPhases = [];

// Marketing Strategy Templates (already defined above, but with different structure)
// Using the enhanced version for cost management
const enhancedMarketingStrategies = {
    // Launch Phase Strategies
    launch_blitz: {
        name: "Launch Blitz",
        description: "High initial spend for maximum visibility, then taper off",
        pattern: "exponential_decay",
        multipliers: [2.5, 2.0, 1.5, 1.2, 1.0, 0.8],
        bestFor: "New product launches, building initial awareness"
    },
    gradual_ramp: {
        name: "Gradual Ramp-Up", 
        description: "Start conservative, increase as you learn what works",
        pattern: "exponential_growth",
        multipliers: [0.3, 0.5, 0.7, 1.0, 1.3, 1.5],
        bestFor: "Testing markets, budget-conscious startups"
    },
    consistent_burn: {
        name: "Consistent Burn",
        description: "Steady spending for predictable results",
        pattern: "flat",
        multipliers: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        bestFor: "Established channels, predictable ROI"
    },
    viral_focus: {
        name: "Viral Focus",
        description: "Minimal paid spend, focus on viral/organic growth",
        pattern: "viral_curve",
        multipliers: [0.2, 0.3, 0.6, 1.2, 2.0, 1.5],
        bestFor: "Social-first products, community-driven growth"
    },
    event_driven: {
        name: "Event-Driven",
        description: "Spike around events, launches, or seasonal periods",
        pattern: "spike_pattern",
        multipliers: [1.5, 0.8, 2.2, 0.7, 1.8, 1.0],
        bestFor: "Product launches, seasonal businesses"
    },
    
    // Growth Phase Strategies
    performance_scale: {
        name: "Performance Scale",
        description: "Double down on proven channels, data-driven scaling",
        pattern: "compound_growth",
        multipliers: [0.8, 1.0, 1.3, 1.6, 2.0, 2.2],
        bestFor: "Proven PMF, strong unit economics"
    },
    channel_diversify: {
        name: "Channel Diversification",
        description: "Spread budget across multiple channels to reduce risk",
        pattern: "diversified",
        multipliers: [1.0, 1.1, 0.9, 1.2, 0.8, 1.3],
        bestFor: "Reducing channel dependence, testing new channels"
    },
    content_amplify: {
        name: "Content Amplification",
        description: "Heavy investment in content marketing and distribution",
        pattern: "content_curve",
        multipliers: [0.7, 1.0, 1.4, 1.7, 1.9, 1.8],
        bestFor: "B2B SaaS, education platforms, long sales cycles"
    },
    partnership_focus: {
        name: "Partnership Focus",
        description: "Invest in partnerships, integrations, co-marketing",
        pattern: "partnership_ramp",
        multipliers: [0.6, 0.8, 1.2, 1.5, 1.8, 2.1],
        bestFor: "B2B platforms, marketplace businesses"
    },
    retention_boost: {
        name: "Retention + Acquisition",
        description: "Balanced spend on getting and keeping customers",
        pattern: "balanced_growth",
        multipliers: [1.0, 1.2, 1.1, 1.4, 1.3, 1.5],
        bestFor: "High churn businesses, subscription models"
    },
    
    // Scale Phase Strategies
    market_domination: {
        name: "Market Domination",
        description: "Aggressive spending to capture market share",
        pattern: "aggressive_scale",
        multipliers: [1.2, 1.5, 1.8, 2.2, 2.5, 2.8],
        bestFor: "Winner-take-all markets, strong funding"
    },
    efficiency_focus: {
        name: "Efficiency Focus",
        description: "Optimize for lower CAC, focus on profitability",
        pattern: "efficiency_curve",
        multipliers: [1.0, 0.9, 0.8, 0.7, 0.8, 0.9],
        bestFor: "Path to profitability, mature markets"
    },
    brand_building: {
        name: "Brand Building",
        description: "Long-term brand investment, premium positioning",
        pattern: "brand_curve",
        multipliers: [1.1, 1.3, 1.2, 1.4, 1.3, 1.5],
        bestFor: "Premium products, long-term competitive advantage"
    },
    global_expansion: {
        name: "Global Expansion",
        description: "Geographic expansion, localization investment",
        pattern: "expansion_waves",
        multipliers: [1.0, 1.4, 1.1, 1.6, 1.2, 1.8],
        bestFor: "Proven local success, international opportunity"
    },
    lifecycle_optimize: {
        name: "Lifecycle Optimization",
        description: "Focus on customer lifetime value optimization",
        pattern: "lifecycle_curve",
        multipliers: [0.8, 1.0, 1.2, 1.1, 1.3, 1.4],
        bestFor: "High LTV businesses, mature customer base"
    }
};

// Strategic Marketing Journeys - Coherent strategy paths (already defined above)
const enhancedMarketingJourneys = {
    // High-energy launch strategies
    launch_blitz: {
        recommendedGrowth: 'performance_scale',
        recommendedScale: 'market_domination',
        rationale: 'Build on launch momentum with proven channels, then dominate market'
    },
    event_driven: {
        recommendedGrowth: 'channel_diversify', 
        recommendedScale: 'brand_building',
        rationale: 'Diversify beyond events, build sustainable brand presence'
    },
    
    // Conservative launch strategies  
    gradual_ramp: {
        recommendedGrowth: 'channel_diversify',
        recommendedScale: 'efficiency_focus',
        rationale: 'Test multiple channels, optimize for profitability'
    },
    viral_focus: {
        recommendedGrowth: 'content_amplify',
        recommendedScale: 'brand_building', 
        rationale: 'Double down on content, build long-term brand equity'
    },
    
    // Steady launch strategies
    consistent_burn: {
        recommendedGrowth: 'performance_scale',
        recommendedScale: 'lifecycle_optimize',
        rationale: 'Scale proven channels, optimize customer lifetime value'
    }
};

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
    const container = document.getElementById('costEscalationsList');
    
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
    // Update cost previews first
    updateMarketingCostPreviews();
    // Force recalculation to update all displays including cost breakdown
    setTimeout(() => {
        calculateProjections();
    }, 100);
}

function applyMarketingStrategy(phase) {
    const strategySelect = document.getElementById(`${phase}Strategy`);
    const strategy = strategySelect.value;
    const previewDiv = document.getElementById(`${phase}StrategyPreview`);
    
    if (strategy === 'custom') {
        previewDiv.innerHTML = 'Using custom budget amounts';
        if (phase === 'launch') {
            clearJourneyRecommendations();
        }
        return;
    }
    
    const strategyData = marketingStrategies[strategy] || enhancedMarketingStrategies[strategy];
    if (!strategyData) return;
    
    // Auto-populate phase parameters based on strategy
    const phaseTemplates = {
        launch: {
            launch_blitz: { start: 1, end: 6, budget: 2500 },
            gradual_ramp: { start: 1, end: 8, budget: 1200 },
            consistent_burn: { start: 1, end: 6, budget: 1800 },
            viral_focus: { start: 1, end: 9, budget: 800 },
            event_driven: { start: 1, end: 6, budget: 2000 }
        },
        growth: {
            performance_scale: { start: 7, end: 18, budget: 3500 },
            channel_diversify: { start: 7, end: 20, budget: 3000 },
            content_amplify: { start: 7, end: 15, budget: 2800 },
            partnership_focus: { start: 7, end: 18, budget: 3200 },
            retention_acquisition: { start: 7, end: 24, budget: 3800 }
        },
        scale: {
            market_domination: { start: 19, end: 60, budget: 8000 },
            efficiency_focus: { start: 19, end: 48, budget: 6500 },
            brand_building: { start: 19, end: 60, budget: 7500 },
            global_expansion: { start: 19, end: 60, budget: 9500 },
            lifecycle_optimization: { start: 19, end: 48, budget: 7000 }
        }
    };
    
    // Auto-populate input fields if template exists
    const template = phaseTemplates[phase]?.[strategy];
    if (template) {
        const startInput = document.getElementById(`${phase}PhaseStart`);
        const endInput = document.getElementById(`${phase}PhaseEnd`);
        const budgetInput = document.getElementById(`${phase}PhaseBudget`);
        
        if (startInput) startInput.value = template.start;
        if (endInput) endInput.value = template.end;
        if (budgetInput) budgetInput.value = template.budget;
        
        console.log(`📈 Applied ${strategy} template to ${phase} phase:`, template);
    }
    
    // Show strategy description and preview
    previewDiv.innerHTML = `
        <div style="color: #f59e0b; font-weight: 600; margin-bottom: 3px;">${strategyData.name}</div>
        <div style="margin-bottom: 3px;">${strategyData.description}</div>
        <div style="color: #4ade80; font-size: 0.75rem;">Best for: ${strategyData.bestFor}</div>
        ${template ? '<div style="color: #667eea; font-size: 0.7rem; margin-top: 3px;">📅 Auto-updated months & budget</div>' : ''}
    `;
    
    // Auto-suggest follow-up strategies for launch phase changes
    if (phase === 'launch' && (marketingJourneys[strategy] || enhancedMarketingJourneys[strategy])) {
        suggestMarketingJourney(strategy);
    }
    
    // Trigger recalculation and preview updates
    updateMarketingPhases();
    updateMarketingCostPreviews();
    
    // Update unified cost management
    updateUnifiedCostManagement();
}

function suggestMarketingJourney(launchStrategy) {
    const journey = marketingJourneys[launchStrategy] || enhancedMarketingJourneys[launchStrategy];
    if (!journey) return;
    
    const growthSelect = document.getElementById('growthStrategy');
    const scaleSelect = document.getElementById('scaleStrategy');
    const growthPreview = document.getElementById('growthStrategyPreview');
    const scalePreview = document.getElementById('scaleStrategyPreview');
    
    // Only auto-update if they're currently on 'custom' (not overriding user choices)
    if (growthSelect.value === 'custom') {
        growthSelect.value = journey.recommendedGrowth;
        
        // Apply the strategy AND populate input fields
        applyMarketingStrategy('growth');
        
        // Add suggestion indicator
        setTimeout(() => {
            const currentPreview = document.getElementById('growthStrategyPreview');
            if (currentPreview) {
                currentPreview.innerHTML += `
                    <div style="background: #1a1a1a; padding: 6px; border-radius: 3px; margin-top: 5px; border-left: 2px solid #4ade80;">
                        <div style="color: #4ade80; font-size: 0.75rem; font-weight: 600;">✨ Auto-suggested</div>
                        <div style="color: #999; font-size: 0.7rem;">Pairs well with ${marketingStrategies[launchStrategy].name}</div>
                    </div>
                `;
            }
        }, 50);
    }
    
    if (scaleSelect.value === 'custom') {
        scaleSelect.value = journey.recommendedScale;
        
        // Apply the strategy AND populate input fields
        applyMarketingStrategy('scale');
        
        // Add suggestion indicator  
        setTimeout(() => {
            const currentPreview = document.getElementById('scaleStrategyPreview');
            if (currentPreview) {
                currentPreview.innerHTML += `
                    <div style="background: #1a1a1a; padding: 6px; border-radius: 3px; margin-top: 5px; border-left: 2px solid #4ade80;">
                        <div style="color: #4ade80; font-size: 0.75rem; font-weight: 600;">✨ Auto-suggested</div>
                        <div style="color: #999; font-size: 0.7rem;">Completes the journey</div>
                    </div>
                `;
            }
        }, 50);
    }
    
    // Show journey rationale at the bottom of marketing phases section
    showJourneyRationale(launchStrategy, journey.rationale);
    
    console.log(`🧭 Applied marketing journey for ${launchStrategy}:`, {
        growth: journey.recommendedGrowth,
        scale: journey.recommendedScale
    });
}

function clearJourneyRecommendations() {
    // Remove journey rationale if it exists
    const journeyRationale = document.getElementById('journeyRationale');
    if (journeyRationale) {
        journeyRationale.remove();
    }
}

function showJourneyRationale(strategy, rationale) {
    // Remove existing rationale
    clearJourneyRecommendations();
    
    // Add journey explanation
    const marketingSection = document.getElementById('marketingPhasesSection');
    const rationaleDiv = document.createElement('div');
    rationaleDiv.id = 'journeyRationale';
    rationaleDiv.innerHTML = `
        <div style="background: #0f1419; padding: 12px; border-radius: 6px; margin-top: 15px; border: 1px solid #333;">
            <div style="color: #667eea; font-weight: 600; margin-bottom: 5px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">🧭</span>
                Strategic Marketing Journey: ${marketingStrategies[strategy].name}
            </div>
            <div style="color: #ccc; font-size: 0.85rem; margin-bottom: 8px;">${rationale}</div>
            <div style="color: #999; font-size: 0.75rem;">
                💡 These suggestions can be customized at any time using the dropdowns above
            </div>
        </div>
    `;
    marketingSection.appendChild(rationaleDiv);
}

function getMarketingBudgetForMonth(month) {
    if (!document.getElementById('enableMarketingPhases').checked) {
        return null; // Use baseline yearly costs
    }
    
    const launchStart = parseInt(document.getElementById('launchPhaseStart').value) || 1;
    const launchEnd = parseInt(document.getElementById('launchPhaseEnd').value) || 6;
    const launchBudget = parseFloat(document.getElementById('launchPhaseBudget').value) || 0;
    const launchStrategy = document.getElementById('launchStrategy')?.value || 'custom';
    
    const growthStart = parseInt(document.getElementById('growthPhaseStart').value) || 7;
    const growthEnd = parseInt(document.getElementById('growthPhaseEnd').value) || 18;
    const growthBudget = parseFloat(document.getElementById('growthPhaseBudget').value) || 0;
    const growthStrategy = document.getElementById('growthStrategy')?.value || 'custom';
    
    const scaleStart = parseInt(document.getElementById('scalePhaseStart').value) || 19;
    const scaleEnd = parseInt(document.getElementById('scalePhaseEnd').value) || 60;
    const scaleBudget = parseFloat(document.getElementById('scalePhaseBudget').value) || 0;
    const scaleStrategy = document.getElementById('scaleStrategy')?.value || 'custom';
    
    let baseBudget = 0;
    let strategy = 'custom';
    let phaseStart = 0;
    let phaseEnd = 0;
    
    if (month >= launchStart && month <= launchEnd) {
        baseBudget = launchBudget;
        strategy = launchStrategy;
        phaseStart = launchStart;
        phaseEnd = launchEnd;
    } else if (month >= growthStart && month <= growthEnd) {
        baseBudget = growthBudget;
        strategy = growthStrategy;
        phaseStart = growthStart;
        phaseEnd = growthEnd;
    } else if (month >= scaleStart && month <= scaleEnd) {
        baseBudget = scaleBudget;
        strategy = scaleStrategy;
        phaseStart = scaleStart;
        phaseEnd = scaleEnd;
    } else {
        return 0;
    }
    
    // Apply strategy multiplier if not custom
    if (strategy !== 'custom' && marketingStrategies[strategy]) {
        const strategyData = marketingStrategies[strategy];
        const phaseLength = phaseEnd - phaseStart + 1;
        const monthInPhase = month - phaseStart;
        
        // Calculate which multiplier to use based on position in phase
        const multiplierIndex = Math.min(
            Math.floor((monthInPhase / phaseLength) * strategyData.multipliers.length),
            strategyData.multipliers.length - 1
        );
        
        const multiplier = strategyData.multipliers[multiplierIndex];
        return Math.round(baseBudget * multiplier);
    }
    
    return baseBudget;
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

// Add debugging function at the top after updateSliderValue
function debugCostUpdate(source, values) {
    console.log(`🔧 Cost update triggered by: ${source}`, values);
}

// Add immediate cost structure update function
function updateCostStructureRealTime() {
    // Auto-populate cost structure input fields if enabled
    if (document.getElementById('enableAutoCostCalculation')?.checked) {
        autoPopulateCostStructure();
    }
    // Force immediate calculation and update
    setTimeout(() => {
        calculateProjections();
    }, 50); // Small delay to ensure input values are updated
}

// Auto-populate cost structure input fields based on beta period and advanced settings
function autoPopulateCostStructure() {
    // Get beta period costs for baseline calculation
    const betaTeamCostM0 = parseFloat(document.getElementById('betaTeamCostM0').value) || 0;
    const betaTeamCostM1 = parseFloat(document.getElementById('betaTeamCostM1').value) || 0;
    const betaTeamCostM2 = parseFloat(document.getElementById('betaTeamCostM2').value) || 0;
    
    const betaTechCostM0 = parseFloat(document.getElementById('betaTechCostM0').value) || 0;
    const betaTechCostM1 = parseFloat(document.getElementById('betaTechCostM1').value) || 0;
    const betaTechCostM2 = parseFloat(document.getElementById('betaTechCostM2').value) || 0;
    
    const betaMarketingCostM0 = parseFloat(document.getElementById('betaMarketingCostM0').value) || 0;
    const betaMarketingCostM1 = parseFloat(document.getElementById('betaMarketingCostM1').value) || 0;
    const betaMarketingCostM2 = parseFloat(document.getElementById('betaMarketingCostM2').value) || 0;
    
    // Calculate average beta costs as baseline for Year 1
    const avgBetaTeamCost = (betaTeamCostM0 + betaTeamCostM1 + betaTeamCostM2) / 3;
    const avgBetaTechCost = (betaTechCostM0 + betaTechCostM1 + betaTechCostM2) / 3;
    const avgBetaMarketingCost = (betaMarketingCostM0 + betaMarketingCostM1 + betaMarketingCostM2) / 3;
    
    // Auto-populate Year 1 based on beta period with growth factor
    const year1TeamCost = Math.round(avgBetaTeamCost * 1.2); // 20% growth from beta to production
    const year1TechCost = Math.round(avgBetaTechCost * 1.5); // 50% growth for scaling infrastructure
    
    // Marketing cost depends on whether marketing phases are enabled
    let year1MarketingCost;
    if (document.getElementById('enableMarketingPhases')?.checked) {
        // Calculate average marketing cost from launch phase
        const launchStart = parseInt(document.getElementById('launchPhaseStart').value) || 1;
        const launchEnd = parseInt(document.getElementById('launchPhaseEnd').value) || 6;
        const launchBudget = parseFloat(document.getElementById('launchPhaseBudget').value) || 0;
        const launchStrategy = document.getElementById('launchStrategy')?.value || 'custom';
        
        if (launchStrategy !== 'custom' && marketingStrategies[launchStrategy]) {
            // Calculate average cost with strategy multipliers
            let totalCost = 0;
            let monthCount = 0;
            for (let month = launchStart; month <= Math.min(launchEnd, 12); month++) {
                totalCost += getMarketingBudgetForMonth(month);
                monthCount++;
            }
            year1MarketingCost = monthCount > 0 ? Math.round(totalCost / monthCount) : launchBudget;
        } else {
            year1MarketingCost = launchBudget;
        }
    } else {
        year1MarketingCost = Math.round(avgBetaMarketingCost * 2); // 100% growth for marketing scale-up
    }
    
    // Auto-populate Year 2 and Year 3 with scaling factors
    const year2TeamCost = Math.round(year1TeamCost * 1.8); // Team scaling
    const year2TechCost = Math.round(year1TechCost * 4); // Tech infrastructure scaling
    const year2MarketingCost = Math.round(year1MarketingCost * 3.5); // Marketing expansion
    
    const year3TeamCost = Math.round(year2TeamCost * 1.5); // Continued team growth
    const year3TechCost = Math.round(year2TechCost * 2.2); // Advanced tech needs
    const year3MarketingCost = Math.round(year2MarketingCost * 2); // Market expansion
    
    // Update the input fields with auto-calculated values
    updateCostInputWithIndicator('teamCostY1', year1TeamCost);
    updateCostInputWithIndicator('teamCostY2', year2TeamCost);
    updateCostInputWithIndicator('teamCostY3', year3TeamCost);
    
    updateCostInputWithIndicator('techCostY1', year1TechCost);
    updateCostInputWithIndicator('techCostY2', year2TechCost);
    updateCostInputWithIndicator('techCostY3', year3TechCost);
    
    updateCostInputWithIndicator('marketingCostY1', year1MarketingCost);
    updateCostInputWithIndicator('marketingCostY2', year2MarketingCost);
    updateCostInputWithIndicator('marketingCostY3', year3MarketingCost);
    
    // Update annual displays
    updateAnnualCostDisplays();
}

// Update cost input field with auto-calculated indicator
function updateCostInputWithIndicator(inputId, value) {
    const input = document.getElementById(inputId);
    const container = input?.closest('.cost-year-1, .cost-year-2, .cost-year-3');
    
    if (!input || !container) return;
    
    // Update the input value
    input.value = value;
    
    // Add or update auto-calculated indicator
    let indicator = container.querySelector('.auto-calc-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'auto-calc-indicator';
        container.appendChild(indicator);
    }
    
    indicator.innerHTML = `
        <span style="color: #667eea; font-size: 0.7rem; background: #1a1a1a; padding: 2px 6px; border-radius: 3px; margin-top: 3px; display: inline-block;">
            📈 Auto-Calculated
        </span>
    `;
    
    // Add highlighting to the input to show it's auto-calculated
    input.style.borderLeft = '3px solid #667eea';
    input.style.backgroundColor = '#1a1a2e';
}

// Toggle auto-cost calculation
function toggleAutoCostCalculation() {
    const isEnabled = document.getElementById('enableAutoCostCalculation').checked;
    
    if (isEnabled) {
        autoPopulateCostStructure();
        console.log('🎯 Auto-cost calculation enabled - fields updated');
    } else {
        // Remove auto-calculated indicators
        document.querySelectorAll('.auto-calc-indicator').forEach(indicator => {
            indicator.remove();
        });
        
        // Reset input styling
        document.querySelectorAll('#teamCostY1, #teamCostY2, #teamCostY3, #techCostY1, #techCostY2, #techCostY3, #marketingCostY1, #marketingCostY2, #marketingCostY3').forEach(input => {
            input.style.borderLeft = '';
            input.style.backgroundColor = '';
        });
        
        console.log('🎯 Auto-cost calculation disabled - indicators removed');
    }
}

// Unified Cost Management System
function switchCostTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.cost-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.cost-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    let targetTab;
    switch(tabName) {
        case 'base':
            targetTab = document.getElementById('baseCostsTab');
            const baseTabEl = document.getElementById('baseTab');
            if (baseTabEl) baseTabEl.classList.add('active');
            break;
        case 'escalations':
            targetTab = document.getElementById('escalationsTab');
            const escalationsTabEl = document.getElementById('escalationsTab');
            if (escalationsTabEl) escalationsTabEl.classList.add('active');
            if (typeof displayCostEscalations === 'function') displayCostEscalations();
            break;
        case 'marketing':
            targetTab = document.getElementById('marketingCampaignsTab');
            const marketingTabEl = document.getElementById('marketingTab');
            if (marketingTabEl) marketingTabEl.classList.add('active');
            break;
        case 'preview':
            targetTab = document.getElementById('livePreviewTab');
            const previewTabEl = document.getElementById('previewTab');
            if (previewTabEl) previewTabEl.classList.add('active');
            if (typeof updateLivePreview === 'function') updateLivePreview();
            break;
    }
    
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    console.log(`💰 Switched to ${tabName} cost management tab`);
}

function updateUnifiedCostManagement() {
    // Update annual displays
    updateAnnualCostDisplays();
    
    // Auto-populate if enabled
    if (document.getElementById('enableAutoCostCalculation')?.checked) {
        autoPopulateCostStructure();
    }
    
    // Update live preview if it's visible
    if (document.getElementById('livePreviewTab').style.display !== 'none') {
        updateLivePreview();
    }
    
    // Force immediate calculation
    setTimeout(() => {
        calculateProjections();
    }, 50);
}

function updateLivePreview() {
    const previewContainer = document.getElementById('livePreviewContent');
    if (!previewContainer) return;
    
    const projectionMonths = parseInt(document.getElementById('projectionMonths').value) || 36;
    const maxPreviewMonths = Math.min(projectionMonths, 24); // Show first 24 months
    
    let previewHTML = '<h4 style="color: #8b5cf6; margin-bottom: 15px;">📊 Monthly Cost Breakdown (First ' + maxPreviewMonths + ' Months)</h4>';
    
    // Get base costs
    const teamCostY1 = parseFloat(document.getElementById('teamCostY1').value) || 0;
    const techCostY1 = parseFloat(document.getElementById('techCostY1').value) || 0;
    const marketingCostY1 = parseFloat(document.getElementById('marketingCostY1').value) || 0;
    
    for (let month = 1; month <= maxPreviewMonths; month++) {
        // Calculate actual costs with escalations and marketing phases
        const finalCosts = applyCostEscalations(teamCostY1, techCostY1, marketingCostY1, month);
        const totalCost = finalCosts.teamCost + finalCosts.techCost + finalCosts.marketingCost;
        
        // Check if marketing phases override
        const marketingOverride = getMarketingBudgetForMonth(month);
        const finalMarketingCost = marketingOverride !== null ? marketingOverride : finalCosts.marketingCost;
        const adjustedTotal = finalCosts.teamCost + finalCosts.techCost + finalMarketingCost;
        
        previewHTML += `
            <div class="live-preview-month">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #8b5cf6;">Month ${month}</span>
                    <span style="font-weight: 700; color: #fff;">Total: £${adjustedTotal.toLocaleString()}</span>
                </div>
                <div class="live-preview-costs">
                    <div class="live-preview-cost-item">
                        <div class="live-preview-cost-label">Team</div>
                        <div class="live-preview-cost-value">£${finalCosts.teamCost.toLocaleString()}</div>
                    </div>
                    <div class="live-preview-cost-item">
                        <div class="live-preview-cost-label">Tech</div>
                        <div class="live-preview-cost-value">£${finalCosts.techCost.toLocaleString()}</div>
                    </div>
                    <div class="live-preview-cost-item">
                        <div class="live-preview-cost-label">Marketing</div>
                        <div class="live-preview-cost-value" style="color: ${marketingOverride !== null ? '#10b981' : '#fff'}">
                            £${finalMarketingCost.toLocaleString()}
                            ${marketingOverride !== null ? '<div style="font-size: 0.6rem; color: #10b981;">Campaign</div>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (maxPreviewMonths < projectionMonths) {
        previewHTML += `
            <div style="text-align: center; padding: 20px; color: #999; font-style: italic;">
                ... and ${projectionMonths - maxPreviewMonths} more months
            </div>
        `;
    }
    
    previewContainer.innerHTML = previewHTML;
}

// Add function to show marketing campaign cost previews
function updateMarketingCostPreviews() {
    if (!document.getElementById('enableMarketingPhases')?.checked) {
        return;
    }
    
    const phases = [
        { id: 'launch', start: 'launchPhaseStart', end: 'launchPhaseEnd', budget: 'launchPhaseBudget', strategy: 'launchStrategy' },
        { id: 'growth', start: 'growthPhaseStart', end: 'growthPhaseEnd', budget: 'growthPhaseBudget', strategy: 'growthStrategy' },
        { id: 'scale', start: 'scalePhaseStart', end: 'scalePhaseEnd', budget: 'scalePhaseBudget', strategy: 'scaleStrategy' }
    ];
    
    phases.forEach(phase => {
        const previewDiv = document.getElementById(`${phase.id}CostPreview`);
        if (!previewDiv) return;
        
        const startMonth = parseInt(document.getElementById(phase.start)?.value) || 1;
        const endMonth = parseInt(document.getElementById(phase.end)?.value) || 6;
        const baseBudget = parseFloat(document.getElementById(phase.budget)?.value) || 0;
        const strategy = document.getElementById(phase.strategy)?.value || 'custom';
        
        if (strategy === 'custom') {
            previewDiv.innerHTML = `
                <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; margin-top: 5px;">
                    <div style="color: #f59e0b; font-size: 0.75rem; font-weight: 600;">💰 Cost Preview</div>
                    <div style="color: #ccc; font-size: 0.8rem;">£${baseBudget.toLocaleString()}/month for ${endMonth - startMonth + 1} months</div>
                    <div style="color: #4ade80; font-size: 0.75rem;">Total: £${(baseBudget * (endMonth - startMonth + 1)).toLocaleString()}</div>
                </div>
            `;
        } else {
            // Calculate strategy-based costs
            const strategyData = marketingStrategies[strategy];
            if (strategyData) {
                let totalCost = 0;
                let maxCost = 0;
                let minCost = Infinity;
                
                for (let month = startMonth; month <= endMonth; month++) {
                    const cost = getMarketingBudgetForMonth(month);
                    totalCost += cost;
                    maxCost = Math.max(maxCost, cost);
                    minCost = Math.min(minCost, cost);
                }
                
                previewDiv.innerHTML = `
                    <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; margin-top: 5px; border-left: 2px solid #667eea;">
                        <div style="color: #667eea; font-size: 0.75rem; font-weight: 600;">📈 Auto-Calculated Costs</div>
                        <div style="color: #ccc; font-size: 0.8rem;">
                            Range: £${minCost.toLocaleString()} - £${maxCost.toLocaleString()}/month
                        </div>
                        <div style="color: #4ade80; font-size: 0.75rem; font-weight: 600;">
                            Total Phase: £${totalCost.toLocaleString()}
                        </div>
                        <div style="color: #999; font-size: 0.7rem; margin-top: 2px;">
                            ${strategyData.name} multipliers applied
                        </div>
                    </div>
                `;
            }
        }
    });
}

// Granular Cost Management Hub Functions
// monthlyCustomCosts already declared at top of file
let currentEditMonth = 1;

function initializeCostManagementHub() {
    const monthSelector = document.getElementById('monthSelector');
    if (!monthSelector) return;
    
    // Populate month selector
    monthSelector.innerHTML = '';
    for (let i = 1; i <= 36; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Month ${i}`;
        if (i === 1) option.selected = true;
        monthSelector.appendChild(option);
    }
    
    // Initialize first month
    updateMonthEditor();
    updateCostTimeline();
}

function updateMonthEditor() {
    const monthSelector = document.getElementById('monthSelector');
    if (!monthSelector) return;
    
    currentEditMonth = parseInt(monthSelector.value);
    
    // Update month label
    const label = document.getElementById('currentMonthLabel');
    if (label) label.textContent = currentEditMonth;
    
    // Load month data or defaults
    const monthData = monthlyCustomCosts[currentEditMonth] || getDefaultMonthCosts(currentEditMonth);
    
    // Populate inputs
    const inputs = {
        'monthTeamBase': monthData.teamBase,
        'monthTeamEscalation': monthData.teamEscalation,
        'monthTeamBonus': monthData.teamBonus,
        'monthTechBase': monthData.techBase,
        'monthTechEscalation': monthData.techEscalation,
        'monthTechScaling': monthData.techScaling,
        'monthMarketingBase': monthData.marketingBase,
        'monthMarketingMultiplier': monthData.marketingMultiplier,
        'monthMarketingAB': monthData.marketingAB,
        'monthNotes': monthData.notes || ''
    };
    
    for (const [id, value] of Object.entries(inputs)) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }
    
    // Update totals
    updateMonthTotals();
    updateMonthStats();
}

function getDefaultMonthCosts(month) {
    // Get base costs from main inputs with escalations applied
    const teamCost = parseFloat(document.getElementById('teamCost')?.value || 6000);
    const techCost = parseFloat(document.getElementById('techCost')?.value || 400);
    const marketingCost = parseFloat(document.getElementById('marketingCost')?.value || 1200);
    
    // Apply any existing escalations for this month
    const escalated = applyCostEscalations(teamCost, techCost, marketingCost, month);
    
    return {
        teamBase: escalated.teamCost,
        teamEscalation: 0,
        teamBonus: 0,
        techBase: escalated.techCost,
        techEscalation: 0,
        techScaling: 0,
        marketingBase: escalated.marketingCost,
        marketingMultiplier: 1.0,
        marketingAB: 0,
        notes: ''
    };
}

function updateMonthTotals() {
    // Team total
    const teamBase = parseFloat(document.getElementById('monthTeamBase')?.value || 0);
    const teamEscalation = parseFloat(document.getElementById('monthTeamEscalation')?.value || 0);
    const teamBonus = parseFloat(document.getElementById('monthTeamBonus')?.value || 0);
    const teamTotal = teamBase + teamEscalation + teamBonus;
    
    // Tech total
    const techBase = parseFloat(document.getElementById('monthTechBase')?.value || 0);
    const techEscalation = parseFloat(document.getElementById('monthTechEscalation')?.value || 0);
    const techScaling = parseFloat(document.getElementById('monthTechScaling')?.value || 0);
    const techTotal = techBase + techEscalation + techScaling;
    
    // Marketing total
    const marketingBase = parseFloat(document.getElementById('monthMarketingBase')?.value || 0);
    const marketingMultiplier = parseFloat(document.getElementById('monthMarketingMultiplier')?.value || 1);
    const marketingAB = parseFloat(document.getElementById('monthMarketingAB')?.value || 0);
    const marketingTotal = (marketingBase * marketingMultiplier) + marketingAB;
    
    // Update displays
    document.getElementById('monthTeamTotal').textContent = teamTotal.toFixed(0);
    document.getElementById('monthTechTotal').textContent = techTotal.toFixed(0);
    document.getElementById('monthMarketingTotal').textContent = marketingTotal.toFixed(0);
    
    // Save month data
    monthlyCustomCosts[currentEditMonth] = {
        teamBase, teamEscalation, teamBonus,
        techBase, techEscalation, techScaling,
        marketingBase, marketingMultiplier, marketingAB,
        notes: document.getElementById('monthNotes')?.value || ''
    };
    
    // Update timeline
    updateCostTimeline();
}

function updateMonthStats() {
    // Calculate projected stats for this month (simplified)
    const month = currentEditMonth;
    const mauGrowthRate = parseFloat(document.getElementById('mauGrowthRate')?.value || 15) / 100;
    const initialMAU = parseFloat(document.getElementById('initialMAU')?.value || 100);
    const conversionRate = parseFloat(document.getElementById('conversionRate')?.value || 8) / 100;
    const monthlyPrice = parseFloat(document.getElementById('monthlyPrice')?.value || 9.99);
    
    // Basic MAU projection
    const projectedMAU = Math.round(initialMAU * Math.pow(1 + mauGrowthRate, month - 1));
    const projectedRevenue = Math.round(projectedMAU * conversionRate * monthlyPrice);
    
    // Get total costs from current inputs
    const teamTotal = parseFloat(document.getElementById('monthTeamTotal')?.textContent || 0);
    const techTotal = parseFloat(document.getElementById('monthTechTotal')?.textContent || 0);
    const marketingTotal = parseFloat(document.getElementById('monthMarketingTotal')?.textContent || 0);
    const totalCosts = teamTotal + techTotal + marketingTotal;
    
    const netProfit = projectedRevenue - totalCosts;
    
    // Update displays
    document.getElementById('monthMAU').textContent = projectedMAU.toLocaleString();
    document.getElementById('monthRevenue').textContent = projectedRevenue.toLocaleString();
    document.getElementById('monthTotalCosts').textContent = totalCosts.toLocaleString();
    document.getElementById('monthNetProfit').textContent = netProfit.toLocaleString();
    document.getElementById('monthNetProfit').style.color = netProfit >= 0 ? '#4ade80' : '#f87171';
}

function jumpToMonth(month) {
    const monthSelector = document.getElementById('monthSelector');
    if (monthSelector) {
        monthSelector.value = month;
        updateMonthEditor();
    }
}

function copyFromPreviousMonth() {
    if (currentEditMonth <= 1) {
        alert('No previous month to copy from!');
        return;
    }
    
    const previousMonth = monthlyCustomCosts[currentEditMonth - 1];
    if (!previousMonth) {
        alert('Previous month has no custom data to copy!');
        return;
    }
    
    // Copy all values except notes
    monthlyCustomCosts[currentEditMonth] = {
        ...previousMonth,
        notes: monthlyCustomCosts[currentEditMonth]?.notes || ''
    };
    
    updateMonthEditor();
    alert(`Copied costs from Month ${currentEditMonth - 1} to Month ${currentEditMonth}!`);
}

function applyToRange() {
    const startMonth = prompt(`Apply Month ${currentEditMonth} costs to which range? Enter start month:`, currentEditMonth + 1);
    if (!startMonth) return;
    
    const endMonth = prompt(`Enter end month:`, Math.min(parseInt(startMonth) + 11, 36));
    if (!endMonth) return;
    
    const start = parseInt(startMonth);
    const end = parseInt(endMonth);
    
    if (start < 1 || end > 36 || start > end) {
        alert('Invalid range! Please enter values between 1-36 with start ≤ end.');
        return;
    }
    
    const currentData = monthlyCustomCosts[currentEditMonth];
    if (!currentData) {
        alert('Current month has no data to apply!');
        return;
    }
    
    // Apply to range
    for (let month = start; month <= end; month++) {
        monthlyCustomCosts[month] = { ...currentData };
    }
    
    updateCostTimeline();
    alert(`Applied Month ${currentEditMonth} costs to Months ${start}-${end}!`);
}

function resetMonth() {
    if (!confirm(`Reset Month ${currentEditMonth} to default values?`)) return;
    
    delete monthlyCustomCosts[currentEditMonth];
    updateMonthEditor();
    alert(`Month ${currentEditMonth} reset to defaults!`);
}

function saveMonthTemplate() {
    const templateName = prompt('Save this month as a template with name:', `Template-Month${currentEditMonth}`);
    if (!templateName) return;
    
    const currentData = monthlyCustomCosts[currentEditMonth];
    if (!currentData) {
        alert('Current month has no data to save!');
        return;
    }
    
    // Save to localStorage
    const templates = JSON.parse(localStorage.getItem('costTemplates') || '{}');
    templates[templateName] = currentData;
    localStorage.setItem('costTemplates', JSON.stringify(templates));
    
    alert(`Template "${templateName}" saved!`);
}

function updateCostTimeline() {
    const timeline = document.getElementById('costTimeline');
    if (!timeline) return;
    
    let html = '<div style="display: flex; gap: 8px; padding: 10px 0; min-width: 800px;">';
    
    for (let month = 1; month <= 12; month++) {
        const monthData = monthlyCustomCosts[month] || getDefaultMonthCosts(month);
        const totalCost = (monthData.teamBase + monthData.teamEscalation + monthData.teamBonus) +
                         (monthData.techBase + monthData.techEscalation + monthData.techScaling) +
                         ((monthData.marketingBase * monthData.marketingMultiplier) + monthData.marketingAB);
        
        const isCustom = !!monthlyCustomCosts[month];
        const isCurrentMonth = month === currentEditMonth;
        
        html += `
            <div onclick="jumpToMonth(${month})" style="
                min-width: 60px; padding: 8px; text-align: center; border-radius: 4px; cursor: pointer;
                background: ${isCurrentMonth ? '#667eea' : (isCustom ? '#1a1a1a' : '#0a0a0a')};
                border: ${isCurrentMonth ? '2px solid #667eea' : (isCustom ? '1px solid #4ade80' : '1px solid #333')};
                color: ${isCurrentMonth ? '#fff' : '#ccc'};
                font-size: 0.8rem;
            ">
                <div style="font-weight: bold;">M${month}</div>
                <div style="color: ${isCurrentMonth ? '#fff' : '#999'};">£${Math.round(totalCost/1000)}k</div>
                ${isCustom ? '<div style="color: #4ade80; font-size: 0.7rem;">●</div>' : ''}
            </div>
        `;
    }
    
    html += '</div>';
    timeline.innerHTML = html;
}

// Enhanced toggle functions - removed duplicates

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for month editor inputs
    const inputs = [
        'monthTeamBase', 'monthTeamEscalation', 'monthTeamBonus',
        'monthTechBase', 'monthTechEscalation', 'monthTechScaling',
        'monthMarketingBase', 'monthMarketingMultiplier', 'monthMarketingAB'
    ];
    
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                updateMonthTotals();
                updateMonthStats();
            });
        }
    });
    
    // Initialize cost management hub
    setTimeout(() => {
        initializeCostManagementHub();
    }, 100);
});

// New functions for updated features
function updateProjectionPeriod() {
    const period = document.getElementById('projectionPeriod').value;
    console.log('Projection period updated to:', period + ' months');
    // Don't auto-calculate to avoid user interruption
}

function toggleMonthlyTeamCosts() {
    const section = document.getElementById('monthlyTeamCostsSection');
    const checkbox = document.getElementById('enableMonthlyTeamCosts');
    if (section) {
        section.style.display = checkbox.checked ? 'block' : 'none';
    }
}

function toggleMonthlyTechCosts() {
    const section = document.getElementById('monthlyTechCostsSection');
    const checkbox = document.getElementById('enableMonthlyTechCosts');
    if (section) {
        section.style.display = checkbox.checked ? 'block' : 'none';
    }
}

function toggleMonthlyMarketingCosts() {
    const section = document.getElementById('monthlyMarketingCostsSection');
    const checkbox = document.getElementById('enableMonthlyMarketingCosts');
    if (section) {
        section.style.display = checkbox.checked ? 'block' : 'none';
    }
}

function openMonthlyEditor(type) {
    // Create a modal for detailed monthly cost editing
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 1000; 
        display: flex; align-items: center; justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #1a1a1a; padding: 30px; border-radius: 12px; 
        max-width: 80%; max-height: 80%; overflow-y: auto;
        border: 2px solid ${type === 'team' ? '#4ade80' : type === 'tech' ? '#667eea' : '#f59e0b'};
    `;
    
    const projectionPeriod = parseInt(document.getElementById('projectionPeriod')?.value || '36');
    
    content.innerHTML = `
        <h3 style="color: ${type === 'team' ? '#4ade80' : type === 'tech' ? '#667eea' : '#f59e0b'}; margin: 0 0 20px 0;">
            ${type === 'team' ? '👥 Team' : type === 'tech' ? '🔧 Tech' : '📢 Marketing'} Cost Editor
        </h3>
        <p style="color: #ccc; margin-bottom: 20px;">Customize costs for each month (1-${projectionPeriod}):</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; max-height: 400px; overflow-y: auto;">
            ${Array.from({length: projectionPeriod}, (_, i) => `
                <div style="background: #2a2a2a; padding: 10px; border-radius: 6px;">
                    <label style="font-size: 0.8rem; color: #ccc;">Month ${i + 1}</label>
                    <input type="number" id="monthly${type}Cost${i + 1}" 
                           value="${getDefaultMonthlyCost(type, i + 1)}" 
                           min="0" step="100"
                           style="width: 100%; padding: 4px; font-size: 0.9rem; margin-top: 4px;">
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button onclick="saveMonthlyEdits('${type}'); this.closest('.fixed').remove();" 
                    style="background: ${type === 'team' ? '#4ade80' : type === 'tech' ? '#667eea' : '#f59e0b'}; 
                           color: ${type === 'team' ? '#000' : '#fff'}; border: none; padding: 10px 20px; 
                           border-radius: 6px; margin-right: 10px; cursor: pointer;">
                Save Changes
            </button>
            <button onclick="this.closest('.fixed').remove();" 
                    style="background: #666; color: #fff; border: none; padding: 10px 20px; 
                           border-radius: 6px; cursor: pointer;">
                Cancel
            </button>
        </div>
    `;
    
    modal.className = 'fixed';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function getDefaultMonthlyCost(type, month) {
    // Get the yearly baseline and interpolate
    const year = Math.ceil(month / 12);
    const costElement = document.getElementById(`${type}CostY${Math.min(year, 3)}`);
    return costElement ? costElement.value : (type === 'team' ? '5000' : type === 'tech' ? '800' : '1200');
}

function saveMonthlyEdits(type) {
    // Save monthly cost overrides
    console.log(`Saving monthly ${type} cost edits`);
    // Implementation would store the values for use in calculations
}

/**
 * NEW: Centralized function to render all results to the DOM.
 * This function takes the calculated data and updates all relevant UI components,
 * ensuring that if calculation succeeds, the display is updated reliably.
 */
function displayResults(monthlyData, summaryData, isManualTrigger = false) {
    console.log('📊 Rendering results...', { summaryData });

    // Ensure global data is set for other functions like export
    globalMonthlyData = monthlyData;
    globalSummaryData = summaryData;

    // --- 1. Update Key Summary Metrics ---
    const getEl = (id) => document.getElementById(id);
    const setTxt = (id, text) => {
        const el = getEl(id);
        if (el) {
            el.textContent = text || 'N/A';
        } else {
            console.warn(`Element with ID '${id}' not found for display.`);
        }
    };

    // Safe number formatting with fallbacks
    const safeToLocaleString = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '0';
        return Number(value).toLocaleString();
    };

    const safeCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '£0';
        return formatCurrency(Number(value));
    };

    setTxt('finalMAU', safeToLocaleString(summaryData.finalMAU));
    setTxt('finalARR', safeCurrency(summaryData.finalARR));
    setTxt('breakEvenMonth', summaryData.breakEvenMonth || 'Not Reached');
    setTxt('exitValuation', safeCurrency(summaryData.exitValuation));
    setTxt('investorReturn', summaryData.investorReturn || 'N/A');
    
    setTxt('totalRevenue', safeCurrency(summaryData.totalRevenue));
    setTxt('totalCosts', safeCurrency(summaryData.totalCosts));
    setTxt('netProfit', safeCurrency(summaryData.netProfit));
    
    const netProfitEl = getEl('netProfit');
    if(netProfitEl && summaryData.netProfit !== undefined) {
        netProfitEl.classList.toggle('positive', summaryData.netProfit > 0);
        netProfitEl.classList.toggle('negative', summaryData.netProfit < 0);
    }
    
    setTxt('ltvCacRatio', summaryData.ltvCacRatio || 'N/A');
    setTxt('customerLTV', safeCurrency(summaryData.customerLTV));
    setTxt('monthlyARPU', safeCurrency(summaryData.monthlyARPU));
    setTxt('customerCAC', safeCurrency(summaryData.customerCAC));
    setTxt('runway', `${summaryData.runway || 0} months`);
    setTxt('burnRate', safeCurrency(summaryData.currentBurnRate));

    // --- 2. Update Breakdowns and Advanced Analytics ---
    if (summaryData.parameters) {
        populateParametersSummary(summaryData.parameters);
    }
    if (summaryData.costBreakdown) {
        updateCostBreakdown(summaryData.costBreakdown);
    }
    if (summaryData.cacBreakdown) {
        updateCACBreakdown(summaryData.cacBreakdown, summaryData.monthlyARPU || 0);
    }
    
    updateAdvancedAnalyticsVisibility(); // Decides which advanced sections to show

    // Update advanced sections only if they are enabled and data exists
    if (summaryData.parameters && summaryData.parameters.enableTieredPricing && summaryData.tieredRevenueData) {
        updateTieredRevenueAnalysis(summaryData.tieredRevenueData);
    }
    if (summaryData.parameters && summaryData.parameters.enableCohortTracking && summaryData.cohortData) {
        updateCohortAnalysis(summaryData.cohortData);
    }
    if (summaryData.parameters && summaryData.parameters.enableVariableCosts && summaryData.variableCostData) {
        updateVariableCostAnalysis(summaryData.variableCostData);
    }
    if (summaryData.parameters && summaryData.parameters.enableMultipleRounds && summaryData.fundingData) {
        updateFundingRoundsAnalysis(summaryData.fundingData);
    }
    
    // Only run sensitivity analysis if we have the required data
    if (summaryData.cacBreakdown && summaryData.customerLTV && summaryData.parameters) {
        updateSensitivityAnalysis(
            summaryData.cacBreakdown,
            summaryData.customerLTV,
            summaryData.parameters.churnRate || 5,
            summaryData.finalARR,
            summaryData.netProfit,
            summaryData.totalRevenue,
            summaryData.totalCosts
        );
    }

    // --- 3. Update Chart and Monthly Table ---
    if (monthlyData && monthlyData.length > 0) {
        updateChart(monthlyData);
        const enableTieredPricing = summaryData.parameters && summaryData.parameters.enableTieredPricing;
        const enableB2B = summaryData.parameters && summaryData.parameters.b2bStartMonth > 0;
        updateMonthlyTable(monthlyData, enableTieredPricing, enableB2B);
    }

    // --- 4. Make the entire output section visible ---
    const outputSection = getEl('outputSection');
    if (outputSection) {
        outputSection.style.display = 'block';
        console.log('✅ Output section is now visible.');
        // Scroll to the output section ONLY on manual trigger so the user sees the results
        if (isManualTrigger) {
            // Use 'center' instead of 'start' to avoid pushing content off the bottom
            // and add a small delay to ensure content is rendered
            setTimeout(() => {
                outputSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center', 
                    inline: 'nearest' 
                });
            }, 100);
        }
    } else {
        console.error('❌ CRITICAL: outputSection element not found. Cannot display results.');
    }
}


function updateMonthlyTable(monthlyData, tieredPricingEnabled, b2bEnabled) {
    console.log('📊 Updating monthly table...', { 
        dataLength: monthlyData?.length || 0, 
        tieredPricingEnabled, 
        b2bEnabled 
    });
    
    const tbody = document.getElementById('monthlyTableBody');
    if (!tbody) {
        console.error('❌ Monthly table body not found');
        return;
    }
    
    if (!monthlyData || monthlyData.length === 0) {
        console.warn('⚠️ No monthly data to display');
        tbody.innerHTML = '<tr><td colspan="16" style="text-align: center; color: #999;">No data available</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    monthlyData.forEach((data, index) => {
        try {
            const row = tbody.insertRow();
            const safeNumber = (value) => (value || 0).toLocaleString();
            const safePercent = (value) => ((value || 0) * 100).toFixed(1) + '%';
            const safeCurrency = (value) => formatCurrency(value || 0);
            
            row.innerHTML = `
                <td>${data.isBeta ? `Beta ${data.month}` : data.month - 2}</td>
                <td>${safeNumber(data.mau)}</td>
                <td>${safePercent(data.growthRate)}</td>
                <td>${safeNumber(data.freeUsers)}</td>
                <td>${safeNumber(data.basicUsers)}</td>
                <td>${safeNumber(data.proUsers)}</td>
                <td>${safePercent(data.conversionRate)}</td>
                <td>${safeCurrency(data.monthlyRevenue)}</td>
                <td>${safeCurrency(data.arr)}</td>
                <td>${safeCurrency(data.teamCost)}</td>
                <td>${safeCurrency(data.techCost)}</td>
                <td>${safeCurrency(data.marketingCost)}</td>
                <td>${safeCurrency(data.variableCosts)}</td>
                <td>${safeCurrency(data.monthlyCosts)}</td>
                <td class="${(data.netIncome || 0) >= 0 ? 'positive' : 'negative'}">${safeCurrency(data.netIncome)}</td>
            `;
        } catch (error) {
            console.error(`❌ Error creating row ${index + 1}:`, error, data);
        }
    });
    
    console.log('✅ Monthly table updated successfully');
}

