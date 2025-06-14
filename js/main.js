// js/main.js
// Consolidated application logic for the NutriSnap Financial Forecast tool.

// =======================================================================================
// HELPER FUNCTIONS
// =======================================================================================
function formatNumber(n) { return n.toLocaleString(); }

function formatCurrency(value) {
    if (value === null || value === undefined) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
    if (isNaN(numValue)) return value;
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numValue);
}

function updateText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

// =======================================================================================
// TIER MANAGEMENT
// =======================================================================================
let tierCounter = 0;

function createTierElement(tierId, name = '', price = 0, conversion = 0) {
    const tierEl = document.createElement('div');
    tierEl.className = 'tier-input-group';
    tierEl.id = `tier-group-${tierId}`;
    tierEl.innerHTML = `
        <div class="tier-header">
            <input type="checkbox" id="enableTier${tierId}" checked onchange="toggleTierControls(${tierId})">
            <label for="enableTier${tierId}">Tier ${tierId + 1}</label>
            <input type="text" id="tierName${tierId}" value="${name}" class="tier-name-input" placeholder="Tier Name">
            <button class="remove-tier-btn" onclick="removeTier(${tierId})">×</button>
        </div>
        <div id="tierControls${tierId}" class="tier-controls">
            <div class="tier-setting-grid">
                <div class="input-group">
                    <label for="tierPrice${tierId}">Price (£)</label>
                    <input type="number" id="tierPrice${tierId}" value="${price}" min="0" step="0.01">
                </div>
                <div class="input-group">
                    <label for="tierConversion${tierId}">Conversion (%)</label>
                    <input type="range" id="tierConversion${tierId}" min="0" max="100" value="${conversion}" step="1" oninput="updateSliderValue(this)">
                    <span id="tierConversion${tierId}Value">${conversion}%</span>
                </div>
            </div>
        </div>
    `;
    return tierEl;
}

function addTier() {
    const container = document.getElementById('dynamicTierContainer');
    // Default values for new tiers can be set here
    const newTier = createTierElement(tierCounter, `Premium Tier ${tierCounter + 1}`, (tierCounter + 1) * 5, (3 - tierCounter) * 10);
    container.appendChild(newTier);
    tierCounter++;
    // Add event listeners to new inputs
    const newInputs = container.lastElementChild.querySelectorAll('input');
    newInputs.forEach(input => {
        input.addEventListener('input', () => calculateProjectionsWithValidation(false));
    });

    calculateProjectionsWithValidation(false);
}

function removeTier(tierId) {
    const tierEl = document.getElementById(`tier-group-${tierId}`);
    if (tierEl) {
        tierEl.remove();
        calculateProjectionsWithValidation(false);
    }
}

function toggleTierControls(tierId) {
    const controls = document.getElementById(`tierControls${tierId}`);
    const checkbox = document.getElementById(`enableTier${tierId}`);
    const tierGroup = document.getElementById(`tier-group-${tierId}`);
    if (controls && checkbox && tierGroup) {
        if (checkbox.checked) {
            tierGroup.style.opacity = '1';
            controls.style.display = 'block';
        } else {
            tierGroup.style.opacity = '0.5';
            controls.style.display = 'none';
        }
        calculateProjectionsWithValidation(false);
    }
}


// =======================================================================================
// VALIDATION LOGIC
// =======================================================================================
class FinancialValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    reset() {
        this.errors = [];
        this.warnings = [];
    }

    addError(field, message) { this.errors.push({ field, message }); }
    addWarning(field, message) { this.warnings.push({ field, message }); }
    getValue(id) { 
        const element = document.getElementById(id);
        if (!element) return 0;
        
        if (element.type === 'range') {
            return getSliderActualValue(id);
        } else {
            return parseFloat(element.value) || 0;
        }
    }
    isChecked(id) { return document.getElementById(id)?.checked || false; }

    validate() {
        this.reset();
        
        if (this.getValue('startingMAU') <= 0) this.addError('startingMAU', 'Starting MAU must be > 0.');
        
        const y1g = this.getValue('year1Growth'), y2g = this.getValue('year2Growth'), y3g = this.getValue('year3Growth');
        if (y1g > 50 || y2g > 30 || y3g > 20) this.addWarning('growth', 'Growth rates seem very optimistic.');
        if (y1g < y2g || y2g < y3g) this.addWarning('growth', 'Growth rates should typically decrease over time.');

        const tiers = document.querySelectorAll('#dynamicTierContainer .tier-input-group');
        let previousPrice = -1;
        tiers.forEach((tier, index) => {
            const tierId = tier.id.split('-')[2];
            const isEnabled = this.isChecked(`enableTier${tierId}`);
            if (isEnabled) {
                const price = this.getValue(`tierPrice${tierId}`);
                
                // For the very first tier (index 0), allow price to be 0
                if (index === 0) {
                    if (price < 0) { // Still prevent negative prices
                        this.addError(`tierPrice${tierId}`, `Tier ${index + 1} price must be non-negative.`);
                    }
                } else { // For all subsequent tiers, price must be greater than 0
                    if (price <= 0) {
                        this.addError(`tierPrice${tierId}`, `Tier ${index + 1} price must be > £0.`);
                    }
                }

                // Ensure subsequent tiers are more expensive than the previous one
                // This check applies to all tiers after the first one.
                if (index !== 0 && previousPrice !== -1 && price <= previousPrice) {
                    this.addError(`tierPrice${tierId}`, `Tier ${index + 1} price must be higher than the previous tier.`);
                }
                
                previousPrice = price;
            }
        });
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings
        };
    }

    displayResults(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        if (this.errors.length > 0) {
            html += `<div class="results-box error"><h4>❌ Errors (Must Fix):</h4><ul>${this.errors.map(e => `<li><b>${e.field}:</b> ${e.message}</li>`).join('')}</ul></div>`;
        }
        if (this.warnings.length > 0) {
            html += `<div class="results-box warning"><h4>⚠️ Warnings (Review Recommended):</h4><ul>${this.warnings.map(w => `<li><b>${w.field}:</b> ${w.message}</li>`).join('')}</ul></div>`;
        }
        container.innerHTML = html;
    }
}


// =======================================================================================
// CORE CALCULATION ENGINE
// =======================================================================================
function runFinancialCalculation(params) {
    const monthlyData = [];
    let cashBalance = params.seedInvestment;

    let totalNewUsers = 0, totalConversions = 0, peakConversionRate = 0;
    let totalTeamCost = 0, totalTechCost = 0, totalMarketingSpend = 0;
    let totalVariableCost = 0, totalInfraCost = 0, totalSupportCost = 0, totalTransactionFeeCost = 0;
    let totalAdRevenue = 0, totalBannerAdRevenue = 0, totalInterstitialAdRevenue = 0, totalRewardedAdRevenue = 0;

    for (let i = 0; i < 3; i++) {
        const betaCost = params.betaCosts[i].team + params.betaCosts[i].tech + params.betaCosts[i].marketing;
        cashBalance -= betaCost;
        monthlyData.push({ 
            month: `Beta ${i}`, mau: params.betaUsers[i], growthRate: 0,
            freeUsers: params.betaUsers[i], premiumUsers: 0, conversionRate: 0,
            monthlyRevenue: 0, arr: 0, teamCost: params.betaCosts[i].team,
            techCost: params.betaCosts[i].tech, marketingCost: params.betaCosts[i].marketing,
            variableCosts: 0, monthlyCosts: betaCost, netIncome: -betaCost, isBeta: true,
            tierUsers: {}
        });
    }

    let freeUsers = params.startingMAU;
    let tierUsers = {};
    params.tiers.forEach(t => tierUsers[t.id] = 0);

    for (let month = 1; month <= params.projectionPeriod; month++) {
        const year = Math.ceil(month / 12);
        const totalPremiumUsersLastMonth = Object.values(tierUsers).reduce((a, b) => a + b, 0);
        const lastMonthMAU = freeUsers + totalPremiumUsersLastMonth;
        
        let churnImprovementFactor = Math.pow(1 - params.churnImprovement, year - 1);
        let currentPaidChurnRate = params.paidChurnRate * churnImprovementFactor;
        let currentFreeChurnRate = params.freeChurnRate * churnImprovementFactor;
        
        // Apply cohort tracking if enabled
        if (params.cohortTracking && params.cohortTracking.enabled) {
            const retentionRate = params.cohortTracking.initialRetentionRate;
            const decayRate = params.cohortTracking.retentionDecay;
            const monthlyRetentionDecay = 1 - (decayRate * (month / 12));
            const adjustedRetention = retentionRate * Math.max(0.3, monthlyRetentionDecay);
            currentFreeChurnRate = Math.min(currentFreeChurnRate, (1 - adjustedRetention));
            currentPaidChurnRate = Math.min(currentPaidChurnRate, (1 - adjustedRetention) * 0.5);
        }
        
        const freeChurn = Math.round(freeUsers * currentFreeChurnRate);
        
        let churnedFromTiers = 0;
        params.tiers.forEach(t => {
            const tierChurn = Math.round(tierUsers[t.id] * currentPaidChurnRate);
            tierUsers[t.id] -= tierChurn;
            churnedFromTiers += tierChurn;
        });

        freeUsers -= freeChurn;
        
        const growthRate = params.growthRates[Math.min(year, 3)] || params.growthRates[3];
        const newUsers = Math.round(lastMonthMAU * growthRate);
        freeUsers += newUsers;
        totalNewUsers += newUsers;
        
        const rampProgress = params.projectionPeriod > 1 ? (month - 1) / (params.projectionPeriod - 1) : 1;
        const currentOverallConversionRate = params.initialConversion + (params.finalConversion - params.initialConversion) * rampProgress;
        
        let newConversionsThisMonth = Math.round(freeUsers * currentOverallConversionRate);
        newConversionsThisMonth = Math.min(freeUsers, newConversionsThisMonth);
        
        const newTierConversions = {};
        params.tiers.forEach(t => newTierConversions[t.id] = 0);

        // Improved Documentation: Tier Distribution Logic
        // The 'conversion' field in tiers represents the distribution weight for new premium users
        // This is separate from the overall conversion rate (Premium Users ÷ MAU)
        const enabledPaidTiers = params.tiers.filter(t => t.enabled && t.price > 0 && t.conversion > 0);
        const totalDistributionWeight = enabledPaidTiers.reduce((sum, tier) => sum + tier.conversion, 0);

        if (totalDistributionWeight > 0 && newConversionsThisMonth > 0) {
            let distributedConversions = 0;
            enabledPaidTiers.forEach(tier => {
                // Distribution share: what percentage of new premium users choose this tier
                const distributionShare = tier.conversion / totalDistributionWeight;
                const conversionsForThisTier = Math.round(newConversionsThisMonth * distributionShare);
                newTierConversions[tier.id] = conversionsForThisTier;
                distributedConversions += conversionsForThisTier;
            });
            // Handle rounding differences to ensure exact user count
            const roundingDiff = newConversionsThisMonth - distributedConversions;
            if (roundingDiff !== 0 && enabledPaidTiers.length > 0) newTierConversions[enabledPaidTiers[0].id] += roundingDiff;
        }
        
        let actualConversions = 0;
        params.tiers.forEach(t => {
            const conversions = newTierConversions[t.id] || 0;
            actualConversions += conversions;
            tierUsers[t.id] += conversions;
        });
        totalConversions += actualConversions;

        freeUsers -= actualConversions;
        freeUsers = Math.max(0, freeUsers); // Ensure free users don't go negative

        const totalPremiumUsers = Object.values(tierUsers).reduce((a, b) => a + b, 0);
        const currentMAU = freeUsers + totalPremiumUsers;
        
        // Fix: Correct conversion rate calculation - should be Premium Users ÷ MAU
        const actualConversionRate = currentMAU > 0 ? (totalPremiumUsers / currentMAU) : 0;
        if (actualConversionRate > peakConversionRate) peakConversionRate = actualConversionRate;

        // REVENUE MODEL DOCUMENTATION:
        // Subscription revenue calculation with clear pricing structure
        const subscriptionRevenue = params.tiers.reduce((sum, tier) => {
            // Base tier revenue: users × monthly price
            const tierRevenue = tierUsers[tier.id] * tier.price;
            
            // Annual billing split: percentage of users choosing annual vs monthly billing
            const annualBillingRate = params.annualAdoptionRate || 0.6; // Default 60% choose annual
            
            // Monthly billing revenue: users paying monthly × full price
            const monthlyRevenue = tierRevenue * (1 - annualBillingRate);
            
            // Annual billing revenue: users paying annually × discounted price
            const annualRevenue = tierRevenue * annualBillingRate * (1 - params.annualDiscount);
            
            return sum + monthlyRevenue + annualRevenue;
        }, 0);

        let adRevenue = 0, bannerAdRevenue = 0, interstitialAdRevenue = 0, rewardedAdRevenue = 0;
        if (month >= params.ads.startMonth) {
            if (params.ads.enableBanner) bannerAdRevenue = (freeUsers / 1000) * params.ads.bannerECPM;
            if (params.ads.enableInterstitial) interstitialAdRevenue = (freeUsers / 1000) * params.ads.interstitialECPM;
            if (params.ads.enableRewarded) rewardedAdRevenue = (freeUsers / 1000) * params.ads.rewardedECPM;
            adRevenue = bannerAdRevenue + interstitialAdRevenue + rewardedAdRevenue;
            totalAdRevenue += adRevenue;
            totalBannerAdRevenue += bannerAdRevenue;
            totalInterstitialAdRevenue += interstitialAdRevenue;
            totalRewardedAdRevenue += rewardedAdRevenue;
        }
        
        let b2bRevenue = 0;
        if (month >= params.b2b.startMonth && params.b2b.percentage > 0) {
            b2bRevenue = (subscriptionRevenue + adRevenue) * params.b2b.percentage;
        }
        
        const monthlyRevenue = subscriptionRevenue + adRevenue + b2bRevenue;
        
        // Fix: ARR should reflect only recurring subscription revenue, not ad/B2B revenue
        const arr = subscriptionRevenue * 12;

        const currentTeamCost = params.teamCosts[Math.min(year, 3)] || params.teamCosts[3];
        const currentTechCost = params.techCosts[Math.min(year, 3)] || params.techCosts[3];
        const currentMarketingCost = params.marketingCosts[Math.min(year, 3)] || params.marketingCosts[3];

        let variableCosts = 0;
        let supportCost = 0, infraCost = 0, transactionFees = 0;
        if (params.variableCosts.enabled) {
            supportCost = currentMAU * params.variableCosts.supportCostPerUser;
            infraCost = currentMAU * params.variableCosts.infraCostPerUser;
            transactionFees = subscriptionRevenue * params.variableCosts.transactionFees;
            variableCosts = supportCost + infraCost + transactionFees;
            totalSupportCost += supportCost;
            totalInfraCost += infraCost;
            totalTransactionFeeCost += transactionFees;
        }
        totalVariableCost += variableCosts;
        
        const monthlyCosts = currentTeamCost + currentTechCost + currentMarketingCost + variableCosts;
        totalTeamCost += currentTeamCost;
        totalTechCost += currentTechCost;
        totalMarketingSpend += currentMarketingCost;
        
        const netIncome = monthlyRevenue - monthlyCosts;
        cashBalance += netIncome;

        monthlyData.push({
            month, mau: currentMAU, growthRate: growthRate * 100, freeUsers, 
            premiumUsers: totalPremiumUsers, conversionRate: actualConversionRate * 100,
            subscriptionRevenue, monthlyRevenue, arr, adRevenue, b2bRevenue,
            teamCost: currentTeamCost, techCost: currentTechCost, marketingCost: currentMarketingCost,
            variableCosts, supportCost, infraCost, transactionFees,
            monthlyCosts, netIncome, tierUsers: { ...tierUsers }
        });
    }

    const finalMonthData = monthlyData[monthlyData.length - 1];
    const totalRevenue = monthlyData.reduce((sum, data) => sum + (data.isBeta ? 0 : data.monthlyRevenue), 0);
    const totalCosts = monthlyData.reduce((sum, data) => sum + data.monthlyCosts, 0);

    // Find break-even month
    const breakEvenMonthData = monthlyData.find(m => !m.isBeta && m.netIncome > 0);
    const breakEvenMonth = breakEvenMonthData ? breakEvenMonthData.month : null;

    const projectionMonths = monthlyData.filter(m => !m.isBeta);
    const avgMonthlyRevenue = projectionMonths.length > 0 ? totalRevenue / projectionMonths.length : 0;
    const avgMarketingCost = projectionMonths.length > 0 ? totalMarketingSpend / projectionMonths.length : 0;
    const customerCAC = totalNewUsers > 0 ? totalMarketingSpend / totalNewUsers : 0;
    
    // Fix: Calculate subscription ARPU (Average Revenue Per Premium User) more clearly
    // Using subscription revenue only, not total revenue which includes ads/B2B
    const subscriptionRevenueFinal = finalMonthData.tierUsers ? 
        params.tiers.reduce((sum, tier) => {
            const tierRevenue = (finalMonthData.tierUsers[tier.id] || 0) * tier.price;
            const annualBillingRate = params.annualAdoptionRate || 0.6;
            const monthlyRev = tierRevenue * (1 - annualBillingRate);
            const annualRev = tierRevenue * annualBillingRate * (1 - params.annualDiscount);
            return sum + monthlyRev + annualRev;
        }, 0) : 0;
    
    const monthlyARPU = finalMonthData.premiumUsers > 0 ? subscriptionRevenueFinal / finalMonthData.premiumUsers : 0;
    const customerLTV = params.paidChurnRate > 0 ? monthlyARPU / params.paidChurnRate : 0;
    const ltvCacRatio = customerCAC > 0 ? customerLTV / customerCAC : 0;
    const runway = avgMarketingCost > 0 ? params.seedInvestment / avgMarketingCost : 0;
    const burnRate = projectionMonths.filter(m => m.netIncome < 0).length > 0 ? 
        Math.abs(projectionMonths.filter(m => m.netIncome < 0).reduce((sum, m) => sum + m.netIncome, 0) / projectionMonths.filter(m => m.netIncome < 0).length) : 0;

    // ENHANCED FINANCIAL SUMMARY with calculation transparency
    const summary = {
        // Core User Metrics
        finalMAU: finalMonthData.mau,
        finalPremiumUsers: finalMonthData.premiumUsers,
        finalConversionRate: finalMonthData.premiumUsers > 0 ? ((finalMonthData.premiumUsers / finalMonthData.mau) * 100).toFixed(2) + '%' : '0.00%',
        
        // Revenue Metrics (Fixed Calculations)
        finalARR: finalMonthData.arr, // Now correctly based on subscription revenue only
        totalRevenue: totalRevenue, // Total of all revenue streams over projection period
        totalSubscriptionRevenue: projectionMonths.reduce((sum, m) => sum + (m.subscriptionRevenue || 0), 0),
        totalAdRevenue: totalAdRevenue,
        totalB2BRevenue: projectionMonths.reduce((sum, m) => sum + (m.b2bRevenue || 0), 0),
        
        // Financial Performance
        breakEvenMonth: breakEvenMonth ? `Month ${breakEvenMonth}` : 'N/A',
        exitValuation: finalMonthData.arr * params.valuationMultiple,
        investorReturn: `${((finalMonthData.arr * params.valuationMultiple * params.equityOffered) / params.seedInvestment).toFixed(1)}x`,
        totalCosts: totalCosts,
        netProfit: totalRevenue - totalCosts,
        
        // Unit Economics (Corrected)
        monthlyARPU: monthlyARPU, // Now subscription ARPU only
        customerLTV: customerLTV,
        customerCAC: customerCAC,
        ltvCacRatio: ltvCacRatio > 0 ? `${ltvCacRatio.toFixed(1)}:1` : 'N/A',
        
        // Cash Flow
        runway: runway === Infinity ? 'Infinite' : `${runway.toFixed(1)} mo`,
        burnRate: burnRate,
        
        // Pricing Transparency
        pricingModel: {
            tiers: params.tiers.map(tier => ({
                name: tier.name,
                monthlyPrice: tier.price,
                annualPrice: tier.price * 12 * (1 - params.annualDiscount),
                annualDiscount: `${(params.annualDiscount * 100).toFixed(1)}%`,
                distributionWeight: tier.conversion
            })),
            annualAdoptionRate: `${((params.annualAdoptionRate || 0.6) * 100).toFixed(0)}%`
        },
        
        revenueComposition: { labels: [], data: [] },
    };

    // Build revenue composition data
    params.tiers.forEach(tier => {
        if (tier.enabled && tier.price > 0) {
            const tierRevenue = projectionMonths.reduce((sum, monthData) => {
                return sum + ((monthData.tierUsers && monthData.tierUsers[tier.id]) ? (monthData.tierUsers[tier.id] * tier.price) : 0);
            }, 0);
            if (tierRevenue > 0) {
                summary.revenueComposition.labels.push(tier.name);
                summary.revenueComposition.data.push(tierRevenue);
            }
        }
    });
    
    // Add advertising revenue if enabled and has revenue
    if (totalAdRevenue > 0 && params.ads.startMonth <= params.projectionPeriod) {
        summary.revenueComposition.labels.push('Advertising');
        summary.revenueComposition.data.push(totalAdRevenue);
    }
    
    // Add B2B revenue if enabled
    const totalB2BRevenue = projectionMonths.reduce((sum, m) => sum + (m.b2bRevenue || 0), 0);
    if (totalB2BRevenue > 0) {
        summary.revenueComposition.labels.push('B2B Partnerships');
        summary.revenueComposition.data.push(totalB2BRevenue);
    }

    return { monthlyData, summary, breakEvenMonth, params };
}

// =======================================================================================
// INPUT GATHERING
// =======================================================================================
function gatherInputs() {
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        if (el.type === 'range') return getSliderActualValue(id);
        return parseFloat(el.value) || 0;
    };
    const getInt = (id) => parseInt(document.getElementById(id)?.value) || 0;
    const getChecked = (id) => document.getElementById(id)?.checked || false;

    const tiers = [];
    const tierElements = document.querySelectorAll('#dynamicTierContainer .tier-input-group');
    tierElements.forEach(tierEl => {
        const tierId = parseInt(tierEl.id.split('-')[2]);
        const isEnabled = getChecked(`enableTier${tierId}`);
        if (isEnabled) {
            tiers.push({
                id: tierId,
                name: document.getElementById(`tierName${tierId}`).value || `Tier ${tierId + 1}`,
                price: getVal(`tierPrice${tierId}`),
                conversion: getVal(`tierConversion${tierId}`) / 100, // Convert percentage for calculation
                enabled: isEnabled
            });
        }
    });

    return {
        startingMAU: getVal('startingMAU'),
        projectionPeriod: getInt('projectionPeriod'),
        seedInvestment: getVal('seedInvestment'),
        
        tiers: tiers,
        annualDiscount: getVal('annualDiscount') / 100,
        annualAdoptionRate: getVal('annualAdoptionRate') / 100,

        initialConversion: getVal('initialConversion') / 100,
        finalConversion: getVal('finalConversion') / 100,
        freeChurnRate: getVal('freeChurnRate') / 100,
        paidChurnRate: getVal('paidChurnRate') / 100,
        churnImprovement: getVal('churnImprovement') / 100,
        growthRates: {
            1: getVal('year1Growth') / 100,
            2: getVal('year2Growth') / 100,
            3: getVal('year3Growth') / 100
        },
        teamCosts: { 1: getVal('teamCostY1'), 2: getVal('teamCostY2'), 3: getVal('teamCostY3') },
        techCosts: { 1: getVal('techCostY1'), 2: getVal('techCostY2'), 3: getVal('techCostY3') },
        marketingCosts: { 1: getVal('marketingCostY1'), 2: getVal('marketingCostY2'), 3: getVal('marketingCostY3') },
        
        betaUsers: [getVal('betaUsersM0'), getVal('betaUsersM1'), getVal('betaUsersM2')],
        betaCosts: [
            { team: getVal('betaTeamCostM0'), tech: getVal('betaTechCostM0'), marketing: getVal('betaMarketingCostM0') },
            { team: getVal('betaTeamCostM1'), tech: getVal('betaTechCostM1'), marketing: getVal('betaMarketingCostM1') },
            { team: getVal('betaTeamCostM2'), tech: getVal('betaTechCostM2'), marketing: getVal('betaMarketingCostM2') }
        ],
        equityOffered: getVal('equityOffered') / 100,
        valuationMultiple: getVal('valuationMultiple'),

        ads: {
            startMonth: getVal('adRevenueStartMonth'),
            enableBanner: getChecked('enableBannerAds'),
            enableInterstitial: getChecked('enableInterstitialAds'),
            enableRewarded: getChecked('enableRewardedAds'),
            bannerECPM: getVal('bannerECPM'),
            interstitialECPM: getVal('interstitialECPM'),
            rewardedECPM: getVal('rewardedECPM'),
        },
        b2b: {
            startMonth: getVal('b2bStartMonth'),
            percentage: getVal('b2bPercentage') / 100,
        },
        variableCosts: {
            enabled: getChecked('enableVariableCosts'),
            supportCostPerUser: getVal('supportCostPerUser'),
            infraCostPerUser: getVal('infraCostPerUser'),
            transactionFees: getVal('transactionFees') / 100
        },
        cohortTracking: {
            enabled: getChecked('enableCohortTracking'),
            initialRetentionRate: getVal('initialRetentionRate') / 100,
            retentionDecay: getVal('retentionDecay') / 100,
            analysisPeriod: getVal('cohortAnalysisPeriod')
        }
    };
}

// =======================================================================================
// UI & SLIDERS
// =======================================================================================
const sliderConfig = {
    // All sliders now 0-100 range
    'year1Growth': { min: 0, max: 100, step: 1, unit: '%' },
    'year2Growth': { min: 0, max: 100, step: 1, unit: '%' },
    'year3Growth': { min: 0, max: 100, step: 1, unit: '%' },
    'initialConversion': { min: 0, max: 100, step: 0.1, unit: '%' },
    'finalConversion': { min: 0, max: 100, step: 0.1, unit: '%' },
    'freeChurnRate': { min: 0, max: 100, step: 1, unit: '%' },
    'paidChurnRate': { min: 0, max: 100, step: 1, unit: '%' },
    'churnImprovement': { min: 0, max: 100, step: 1, unit: '%' },
    'bannerECPM': {min: 0, max: 100, step: 0.1, unit: '£'},
    'interstitialECPM': {min: 0, max: 100, step: 0.5, unit: '£'},
    'rewardedECPM': {min: 0, max: 100, step: 1, unit: '£'},
    'transactionFees': { min: 0, max: 100, step: 0.1, unit: '%' },
    'equityOffered': { min: 0, max: 100, step: 1, unit: '%' },
    'valuationMultiple': { min: 0, max: 100, step: 0.1, unit: 'x' },
    'b2bPercentage': { min: 0, max: 100, step: 1, unit: '%' },
    'annualDiscount': { min: 0, max: 50, step: 0.5, unit: '%' },
    'annualAdoptionRate': { min: 0, max: 100, step: 1, unit: '%' },
    'initialRetentionRate': { min: 0, max: 100, step: 1, unit: '%' },
    'retentionDecay': { min: 0, max: 100, step: 1, unit: '%' },
};

function getSliderActualValue(sliderId) {
    const slider = document.getElementById(sliderId);
    // Tier sliders are dynamic, so their config is not in the main object
    if (sliderId.startsWith('tierConversion')) {
        const min = 0;
        const max = 100;
        const val = parseFloat(slider.value);
        return min + (val / 100) * (max - min);
    }
    const config = sliderConfig[sliderId] || {};
    if (!slider) return 0;
    const min = config.min || 0;
    const max = config.max || 100;
    const val = parseFloat(slider.value);
    return min + (val / 100) * (max - min);
}

function updateSliderValue(slider) {
    const actualValue = getSliderActualValue(slider.id);
    const valueSpan = document.getElementById(`${slider.id}Value`);
    if (valueSpan) {
        let config = sliderConfig[slider.id];
        if (slider.id.startsWith('tierConversion')) {
            config = { step: 1, unit: '%' };
        }
        valueSpan.textContent = `${actualValue.toFixed(config?.step < 1 ? 1 : 0)}${config?.unit || ''}`;
    }
}

function initializeSliders() {
    Object.keys(sliderConfig).forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            updateSliderValue(slider);
        }
    });
}

// =======================================================================================
// PROJECTION LOGIC
// =======================================================================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function displayResults(results, params) {
    if (!results || !results.summary) {
        console.error("displayResults called with invalid data.");
        return;
    }
    const { summary, monthlyData } = results;
    
    // Calculate totals for breakdown cards
    const projectionMonths = monthlyData.filter(m => !m.isBeta);
    const totalMarketingSpend = projectionMonths.reduce((sum, m) => sum + (m.marketingCost || 0), 0);
    const totalNewUsers = projectionMonths.reduce((sum, m) => sum + (m.newUsers || 0), 0) || 1000; // Fallback
    const totalInfraCost = projectionMonths.reduce((sum, m) => sum + (m.infraCost || 0), 0);
    const totalSupportCost = projectionMonths.reduce((sum, m) => sum + (m.supportCost || 0), 0);
    const totalTransactionFeeCost = projectionMonths.reduce((sum, m) => sum + (m.transactionFees || 0), 0);
    const totalVariableCost = projectionMonths.reduce((sum, m) => sum + (m.variableCosts || 0), 0);
    const totalAdRevenue = projectionMonths.reduce((sum, m) => sum + (m.adRevenue || 0), 0);
    const totalBannerAdRevenue = totalAdRevenue * 0.3; // Estimate
    const totalInterstitialAdRevenue = totalAdRevenue * 0.5; // Estimate  
    const totalRewardedAdRevenue = totalAdRevenue * 0.2; // Estimate
    const avgMonthlyRevenue = projectionMonths.length > 0 ? projectionMonths.reduce((sum, m) => sum + m.monthlyRevenue, 0) / projectionMonths.length : 0;
    const finalMonthData = monthlyData[monthlyData.length - 1] || {};
    
    // Update all summary metrics with comprehensive mapping
    const summaryMapping = {
        // Top summary grid
        'finalMAU': formatNumber(summary.finalMAU),
        'finalARR': formatCurrency(summary.finalARR),
        'breakEvenMonth': summary.breakEvenMonth,
        'exitValuation': formatCurrency(summary.exitValuation),
        'investorReturn': summary.investorReturn,
        'totalRevenue': formatCurrency(summary.totalRevenue),
        'totalCosts': formatCurrency(summary.totalCosts),
        'netProfit': formatCurrency(summary.netProfit),
        'ltvCacRatio': summary.ltvCacRatio,
        'customerLTV': formatCurrency(summary.customerLTV),
        'monthlyARPU': formatCurrency(summary.monthlyARPU),
        'customerCAC': formatCurrency(summary.customerCAC),
        'runway': summary.runway,
        'burnRate': formatCurrency(summary.burnRate),
        
        // CAC breakdown card
        'totalMarketingCosts': formatCurrency(totalMarketingSpend),
        'salesOverhead': formatCurrency(0),
        'totalAcquisitionCosts': formatCurrency(totalMarketingSpend),
        'totalUsersAcquiredDisplay': formatNumber(totalNewUsers),
        'averageCACDisplay': formatCurrency(summary.customerCAC),
        'paybackPeriod': summary.customerLTV > 0 ? `${(summary.customerCAC / summary.monthlyARPU).toFixed(1)} mo` : 'N/A',
        
        // Variable costs (if enabled)
        'totalInfraCosts': formatCurrency(totalInfraCost),
        'totalSupportCosts': formatCurrency(totalSupportCost),
        'totalTransactionFees': formatCurrency(totalTransactionFeeCost),
        'totalVariableCostsDisplay': formatCurrency(totalVariableCost),
        'avgMonthlyVariableCosts': formatCurrency(projectionMonths.length > 0 ? totalVariableCost / projectionMonths.length : 0),
        'variableCostPerUser': formatCurrency(finalMonthData.mau > 0 ? totalVariableCost / finalMonthData.mau : 0),
        
        // Ad revenue breakdown
        'totalAdvertisingRevenueDisplay': formatCurrency(totalAdRevenue),
        'adRevenuePercentageDisplay': totalRevenue > 0 ? `${((totalAdRevenue / totalRevenue) * 100).toFixed(1)}%` : '0%',
        'bannerRevenueDisplay': formatCurrency(totalBannerAdRevenue),
        'interstitialRevenueDisplay': formatCurrency(totalInterstitialAdRevenue),
        'rewardedRevenueDisplay': formatCurrency(totalRewardedAdRevenue),
        'effectiveECPMDisplay': formatCurrency(projectionMonths.length > 0 ? totalAdRevenue / (avgMonthlyRevenue * projectionMonths.length) * 1000 : 0),
        'avgFreeUsersWithAdsDisplay': formatNumber(Math.round(projectionMonths.reduce((sum, m) => sum + m.freeUsers, 0) / projectionMonths.length)),
        'adRevenueStartMonthDisplay': `Month ${params.ads.startMonth}`,
        
        // Conversion Rates Card
        'initialConversionDisplay': `${(params.initialConversion * 100).toFixed(2)}%`,
        'finalConversionDisplay': `${(params.finalConversion * 100).toFixed(2)}%`,
        'avgConversionDisplay': `${(projectionMonths.length > 0 ? projectionMonths.reduce((sum, m) => sum + (m.conversionRate || 0), 0) / projectionMonths.length : 0).toFixed(2)}%`,
        'peakConversionDisplay': `${Math.max(...projectionMonths.map(m => m.conversionRate || 0)).toFixed(2)}%`,
        
        // User Growth Card
        'startingMAUDisplay': formatNumber(params.startingMAU),
        'finalMAUDisplay': formatNumber(finalMonthData.mau || 0),
        'totalGrowthDisplay': params.startingMAU > 0 ? `${(((finalMonthData.mau - params.startingMAU) / params.startingMAU) * 100).toFixed(0)}%` : '0%',
        'avgMonthlyGrowthDisplay': projectionMonths.length > 0 ? `${(projectionMonths.reduce((sum, m) => sum + (m.growthRate || 0), 0) / projectionMonths.length).toFixed(2)}%` : '0%',
        'finalPremiumUsersDisplay': formatNumber(finalMonthData.premiumUsers || 0),
        'premiumUserGrowthDisplay': formatNumber((finalMonthData.premiumUsers || 0) - (projectionMonths[0]?.premiumUsers || 0)),
        
        // Team & Tech Costs Card
        'totalTeamCostsDisplay': formatCurrency(projectionMonths.reduce((sum, m) => sum + (m.teamCost || 0), 0)),
        'totalTechCostsDisplay': formatCurrency(projectionMonths.reduce((sum, m) => sum + (m.techCost || 0), 0)),
        'avgMonthlyTeamCostDisplay': formatCurrency(projectionMonths.length > 0 ? projectionMonths.reduce((sum, m) => sum + (m.teamCost || 0), 0) / projectionMonths.length : 0),
        'avgMonthlyTechCostDisplay': formatCurrency(projectionMonths.length > 0 ? projectionMonths.reduce((sum, m) => sum + (m.techCost || 0), 0) / projectionMonths.length : 0),
        'teamCostPerUserDisplay': formatCurrency(finalMonthData.mau > 0 ? projectionMonths.reduce((sum, m) => sum + (m.teamCost || 0), 0) / finalMonthData.mau : 0),
        'techCostPerUserDisplay': formatCurrency(finalMonthData.mau > 0 ? projectionMonths.reduce((sum, m) => sum + (m.techCost || 0), 0) / finalMonthData.mau : 0),
        
        // Marketing Efficiency Card
        'totalMarketingSpendDisplay': formatCurrency(totalMarketingSpend),
        'avgMonthlyMarketingDisplay': formatCurrency(projectionMonths.length > 0 ? totalMarketingSpend / projectionMonths.length : 0),
        'marketingPerUserDisplay': formatCurrency(finalMonthData.mau > 0 ? totalMarketingSpend / finalMonthData.mau : 0),
        'marketingROIDisplay': totalMarketingSpend > 0 ? `${(((summary.totalRevenue - totalMarketingSpend) / totalMarketingSpend) * 100).toFixed(0)}%` : '0%',
        'revenuePerMarketingDisplay': totalMarketingSpend > 0 ? `£${(summary.totalRevenue / totalMarketingSpend).toFixed(2)}` : '£0',
        'marketingEfficiencyTrendDisplay': 'Stable',
    };
    
    // Apply all mappings
    Object.entries(summaryMapping).forEach(([id, value]) => {
        updateText(id, value);
    });
    
    // Update pricing model transparency section
    const pricingDetails = document.getElementById('pricingDetails');
    if (pricingDetails && summary.pricingModel) {
        const tierInfo = summary.pricingModel.tiers.map(tier => 
            `${tier.name}: £${tier.monthlyPrice}/mo (£${(tier.annualPrice || 0).toFixed(0)}/year with ${tier.annualDiscount} discount)`
        ).join(' | ');
        
        pricingDetails.innerHTML = `
            <div style="margin-bottom: 8px;">
                <strong>Tiers:</strong> ${tierInfo}
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 0.8rem;">
                <span><strong>Annual Adoption Rate:</strong> ${summary.pricingModel.annualAdoptionRate}</span>
                <span><strong>Final Conversion Rate:</strong> ${summary.finalConversionRate}</span>
                <span><strong>Subscription ARPU:</strong> ${formatCurrency(summary.monthlyARPU)}</span>
            </div>
        `;
    }
    
    // Update financial validation summary (separate from monthly data)
    const validationSummary = document.getElementById('validationSummary');
    if (validationSummary) {
        const finalMonth = finalMonthData;
        const calculatedConversionRate = finalMonth.mau > 0 ? ((finalMonth.premiumUsers / finalMonth.mau) * 100).toFixed(2) : '0.00';
        const calculatedARR = (summary.finalARR / 1000000).toFixed(2); // In millions
        const revenueBreakdown = {
            subscription: summary.totalSubscriptionRevenue || 0,
            ads: summary.totalAdRevenue || 0,
            b2b: summary.totalB2BRevenue || 0
        };
        const totalCalculated = revenueBreakdown.subscription + revenueBreakdown.ads + revenueBreakdown.b2b;
        
        validationSummary.innerHTML = `
            <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; border: 1px solid #333;">
                <h4 style="color: #4ade80; margin: 0 0 10px 0; font-size: 0.95rem;">✅ Conversion Rate Validation</h4>
                <div style="font-size: 0.8rem; color: #9ca3af; line-height: 1.5;">
                    <strong>Formula:</strong> Premium Users ÷ MAU × 100%<br>
                    <strong>Calculation:</strong> ${formatNumber(finalMonth.premiumUsers)} ÷ ${formatNumber(finalMonth.mau)} × 100% = ${calculatedConversionRate}%<br>
                    <strong>Result:</strong> <span style="color: #4ade80;">${summary.finalConversionRate}</span>
                </div>
            </div>
            
            <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; border: 1px solid #333;">
                <h4 style="color: #60a5fa; margin: 0 0 10px 0; font-size: 0.95rem;">✅ ARR Calculation Validation</h4>
                <div style="font-size: 0.8rem; color: #9ca3af; line-height: 1.5;">
                    <strong>Formula:</strong> Subscription Revenue × 12<br>
                    <strong>Excludes:</strong> Ad revenue, B2B revenue (non-recurring)<br>
                    <strong>Final Month Subscription:</strong> ${formatCurrency(finalMonth.subscriptionRevenue || 0)}<br>
                    <strong>ARR:</strong> <span style="color: #60a5fa;">${formatCurrency(summary.finalARR)}</span>
                </div>
            </div>
            
            <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; border: 1px solid #333;">
                <h4 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 0.95rem;">✅ Revenue Model Breakdown</h4>
                <div style="font-size: 0.8rem; color: #9ca3af; line-height: 1.5;">
                    <strong>Subscription:</strong> ${formatCurrency(revenueBreakdown.subscription)} (${((revenueBreakdown.subscription/totalCalculated)*100).toFixed(1)}%)<br>
                    <strong>Advertising:</strong> ${formatCurrency(revenueBreakdown.ads)} (${((revenueBreakdown.ads/totalCalculated)*100).toFixed(1)}%)<br>
                    <strong>B2B Partnerships:</strong> ${formatCurrency(revenueBreakdown.b2b)} (${((revenueBreakdown.b2b/totalCalculated)*100).toFixed(1)}%)<br>
                    <strong>Total Validated:</strong> <span style="color: #f59e0b;">${formatCurrency(totalCalculated)}</span>
                </div>
            </div>
            
            <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; border: 1px solid #333;">
                <h4 style="color: #8b5cf6; margin: 0 0 10px 0; font-size: 0.95rem;">✅ Unit Economics Validation</h4>
                <div style="font-size: 0.8rem; color: #9ca3af; line-height: 1.5;">
                    <strong>ARPU Formula:</strong> Subscription Revenue ÷ Premium Users<br>
                    <strong>Calculation:</strong> ${formatCurrency(finalMonth.subscriptionRevenue || 0)} ÷ ${formatNumber(finalMonth.premiumUsers)} = ${formatCurrency(summary.monthlyARPU)}<br>
                    <strong>LTV:CAC Ratio:</strong> <span style="color: #8b5cf6;">${summary.ltvCacRatio}</span><br>
                    <strong>Status:</strong> ${parseFloat(summary.ltvCacRatio?.split(':')[0] || '0') > 3 ? '🟢 Excellent' : parseFloat(summary.ltvCacRatio?.split(':')[0] || '0') > 2 ? '🟡 Good' : '🔴 Needs Improvement'}
                </div>
            </div>
        `;
    }
    
    // Show/hide breakdown cards based on features enabled
    const variableCostCard = document.getElementById('variableCostBreakdownCard');
    if (variableCostCard) {
        variableCostCard.style.display = params.variableCosts.enabled ? 'block' : 'none';
    }
    
    const adRevenueCard = document.getElementById('advertisingRevenueBreakdownCard');
    if (adRevenueCard) {
        const hasAdRevenue = params.ads.enableBanner || params.ads.enableInterstitial || params.ads.enableRewarded;
        adRevenueCard.style.display = hasAdRevenue ? 'block' : 'none';
    }
    
    // Show revenue composition chart if there's data
    const revenueCompositionCard = document.getElementById('revenueCompositionCard');
    if (revenueCompositionCard && summary.revenueComposition.data.length > 0) {
        revenueCompositionCard.style.display = 'block';
        
        // Update revenue composition chart
        const ctx = document.getElementById('revenueCompositionChart');
        if (ctx) {
            if (window.revCompChart) window.revCompChart.destroy();
            
            window.revCompChart = new Chart(ctx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: summary.revenueComposition.labels,
                    datasets: [{
                        data: summary.revenueComposition.data,
                        backgroundColor: ['#34d399', '#60a5fa', '#a78bfa', '#facc15', '#f87171', '#fb923c']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } },
                        datalabels: {
                            display: false
                        }
                    }
                }
            });
        }
    } else if (revenueCompositionCard) {
        revenueCompositionCard.style.display = 'none';
    }

    // Update main financial chart
    const chartCtx = document.getElementById('projectionChart');
    if (chartCtx) {
        if (window.mainChart) window.mainChart.destroy();
        
        const chartData = monthlyData.filter(d => !d.isBeta);
        
        window.mainChart = new Chart(chartCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.map(d => `Month ${d.month}`),
                datasets: [
                    {
                        label: 'Monthly Revenue',
                        data: chartData.map(d => d.monthlyRevenue || 0),
                        borderColor: '#4ade80',
                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                        yAxisID: 'y',
                        tension: 0.1
                    },
                    {
                        label: 'Monthly Costs',
                        data: chartData.map(d => d.monthlyCosts || 0),
                        borderColor: '#f87171',
                        backgroundColor: 'rgba(248, 113, 113, 0.1)',
                        yAxisID: 'y',
                        tension: 0.1
                    },
                    {
                        label: 'Net Income',
                        data: chartData.map(d => d.netIncome || 0),
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        yAxisID: 'y',
                        tension: 0.1
                    },
                    {
                        label: 'MAU',
                        data: chartData.map(d => d.mau || 0),
                        borderColor: '#60a5fa',
                        backgroundColor: 'rgba(96, 165, 250, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Amount (£)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return '£' + value.toLocaleString();
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Users (MAU)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e5e7eb'
                        }
                    },
                    datalabels: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                if (context.datasetIndex === 3) { // MAU dataset
                                    return label + ': ' + context.parsed.y.toLocaleString() + ' users';
                                } else {
                                    return label + ': £' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Update table headers based on active tiers with tooltips
    const tableHeader = document.getElementById('monthlyTableHeader');
    if (tableHeader) {
        let headers = `
            <th title="Month of the projection period">Month</th>
            <th title="Total Monthly Active Users (Free + Premium)">MAU</th>
            <th title="Percentage growth in users from previous month">Growth Rate (%)</th>
            <th title="Users on the free tier of your app">Free Users</th>`;
        
        // Add headers for each active PAID tier only (exclude free tier since it's already shown)
        if (params.tiers && params.tiers.length > 0) {
            const paidTiers = params.tiers.filter(tier => tier.enabled && tier.price > 0);
            paidTiers.forEach(tier => {
                if (tier.name) {
                    headers += `<th title="${tier.name} users paying ${formatCurrency(tier.price)}/month">${tier.name}</th>`;
                }
            });
        }
        
        headers += `
            <th title="Sum of all premium tier users">Total Paid Users</th>
            <th title="Percentage of free users converting to premium each month">Conversion Rate</th>
            <th title="Total subscription revenue for this month">Monthly Revenue</th>`;
        
        // Add Ad Revenue column if advertising is enabled - exact same logic as table body
        const hasAdRevenue = params.ads && (params.ads.enableBanner || params.ads.enableInterstitial || params.ads.enableRewarded);
        if (hasAdRevenue) {
            headers += `<th title="Revenue from advertising shown to free users">Ad Revenue</th>`;
        }
        
        headers += `
            <th title="Annual Recurring Revenue (Monthly Revenue × 12)">ARR</th>
            <th title="Monthly team salaries and benefits">Team Cost</th>
            <th title="Monthly technology and infrastructure costs">Tech Cost</th>
            <th title="Monthly marketing and user acquisition spend">Marketing Cost</th>`;
            
        // Add Variable Costs column only if enabled - exact same logic as table body
        if (params.variableCosts && params.variableCosts.enabled) {
            headers += `<th title="Variable costs that scale with users (support, infrastructure, transaction fees)">Variable Costs</th>`;
        }
        
        headers += `
            <th title="Sum of all monthly operating costs">Total Costs</th>
            <th title="Monthly Revenue minus Total Costs (profit/loss for the month)">Net Income</th>
        `;
        tableHeader.innerHTML = headers;
    }

    // Update table with dynamic tier columns
    const tableBody = document.getElementById('monthlyTableBody');
    if (tableBody) {
        tableBody.innerHTML = monthlyData.map((d, index) => {
            // Fix break-even detection - check against month number not object
            const breakEvenMonthNumber = results.breakEvenMonth ? parseInt(results.breakEvenMonth.toString().replace('Month ', '')) : null;
            const isBreakEven = !d.isBeta && breakEvenMonthNumber && d.month === breakEvenMonthNumber;
            
            let row = `
                <tr class="${isBreakEven ? 'break-even-row' : ''}">
                    <td>${d.isBeta ? d.month : 'Month ' + d.month}</td>
                    <td>${formatNumber(d.mau || 0)}</td>
                    <td>${d.growthRate ? d.growthRate.toFixed(1) + '%' : '0%'}</td>
                    <td>${formatNumber(d.freeUsers || 0)}</td>`;
            
            // Add tier user columns with proper data checking - only show PAID tiers (not free tier)
            if (params.tiers && params.tiers.length > 0) {
                const paidTiers = params.tiers.filter(tier => tier.enabled && tier.price > 0);
                paidTiers.forEach(tier => {
                    let tierUserCount = 0;
                    if (d.tierUsers && typeof d.tierUsers === 'object' && tier.id !== undefined) {
                        tierUserCount = d.tierUsers[tier.id] || 0;
                    }
                    row += `<td>${formatNumber(tierUserCount)}</td>`;
                });
            }
            
            row += `
                    <td>${formatNumber(d.premiumUsers || 0)}</td>
                    <td>${d.conversionRate ? d.conversionRate.toFixed(2) + '%' : '0.00%'}</td>
                    <td>${formatCurrency(d.monthlyRevenue || 0)}</td>`;
            
            // Add Ad Revenue column if advertising is enabled - must match header logic exactly
            const hasAdRevenue = params.ads && (params.ads.enableBanner || params.ads.enableInterstitial || params.ads.enableRewarded);
            if (hasAdRevenue) {
                row += `<td>${formatCurrency(d.adRevenue || 0)}</td>`;
            }
            
            row += `
                    <td>${formatCurrency(d.arr || 0)}</td>
                    <td>${formatCurrency(d.teamCost || 0)}</td>
                    <td>${formatCurrency(d.techCost || 0)}</td>
                    <td>${formatCurrency(d.marketingCost || 0)}</td>`;
                    
            // Add Variable Costs column only if enabled - must match header logic exactly
            if (params.variableCosts && params.variableCosts.enabled) {
                row += `<td>${formatCurrency(d.variableCosts || 0)}</td>`;
            }
            
            row += `
                    <td>${formatCurrency(d.monthlyCosts || 0)}</td>
                    <td class="${(d.netIncome || 0) > 0 ? 'profit' : 'loss'}">${formatCurrency(d.netIncome || 0)}</td>
                </tr>`;
            return row;
        }).join('');
    }

    // Initialize interactive charts
    if (typeof window.initializeInteractiveCharts === 'function') {
        window.initializeInteractiveCharts(monthlyData, params);
    }

    // Show output section
    document.getElementById('outputSection').style.display = 'block';
}

function calculateProjectionsWithValidation(showStatus = false) {
    const statusEl = document.getElementById('calculationStatus');
    if (showStatus && statusEl) {
        statusEl.textContent = '🔄 Calculating...';
        statusEl.style.display = 'block';
    }

    const validator = new FinancialValidator();
    const validation = validator.validate();
    validator.displayResults('validationResults');

    if (!validation.isValid) {
        if (showStatus && statusEl) {
            statusEl.textContent = '❌ Errors found. Please fix them before calculating.';
        }
        return;
    }
    
    try {
        const params = gatherInputs();
        const results = runFinancialCalculation(params);
        
        // Update global variables
        globalParams = params;
        globalMonthlyData = results.monthlyData;
        globalSummary = results.summary;

        displayResults(results, params);

        if (showStatus && statusEl) {
            statusEl.textContent = '✅ Projections calculated successfully!';
            setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
        }
    } catch (error) {
        console.error('Error in calculateProjectionsWithValidation:', error);
        if (showStatus && statusEl) {
            statusEl.textContent = '🔥 An unexpected error occurred. Check console for details.';
        }
    }
}

window.applyAdPreset = function() {
    const preset = document.getElementById('adPreset').value;
    if (!preset) return;
    
    const presets = {
        conservative: { 
            banner: { enabled: true, ecpm: 1.5 },
            interstitial: { enabled: false, ecpm: 0 },
            rewarded: { enabled: false, ecpm: 0 }
        },
        balanced: { 
            banner: { enabled: true, ecpm: 2.0 },
            interstitial: { enabled: true, ecpm: 8.0 },
            rewarded: { enabled: false, ecpm: 0 }
        },
        aggressive: { 
            banner: { enabled: true, ecpm: 3.0 },
            interstitial: { enabled: true, ecpm: 12.0 },
            rewarded: { enabled: true, ecpm: 25.0 }
        },
        premium: { 
            banner: { enabled: false, ecpm: 0 },
            interstitial: { enabled: true, ecpm: 15.0 },
            rewarded: { enabled: true, ecpm: 35.0 }
        }
    };
    
    const config = presets[preset];
    if (!config) return;
    
    // Update checkboxes and sliders
    document.getElementById('enableBannerAds').checked = config.banner.enabled;
    document.getElementById('enableInterstitialAds').checked = config.interstitial.enabled;
    document.getElementById('enableRewardedAds').checked = config.rewarded.enabled;
    
    setSliderValue('bannerECPM', config.banner.ecpm);
    setSliderValue('interstitialECPM', config.interstitial.ecpm);
    setSliderValue('rewardedECPM', config.rewarded.ecpm);
    
    calculateProjectionsWithValidation(false);
};

function setSliderValue(sliderId, actualValue) {
    const slider = document.getElementById(sliderId);
    const config = sliderConfig[sliderId];
    if (slider && config) {
        const min = config.min || 0;
        const max = config.max || 100;
        const rawValue = ((actualValue - min) / (max - min)) * 100;
        slider.value = rawValue;
        updateSliderValue(slider);
    }
}


// Advanced feature toggles
window.toggleAdvancedSection = function(sectionId, checkboxId) {
    const section = document.getElementById(sectionId);
    const checkbox = document.getElementById(checkboxId);
    if (section && checkbox) {
        section.style.display = checkbox.checked ? 'block' : 'none';
        calculateProjectionsWithValidation(false);
    }
};

window.toggleVariableCosts = function() {
    toggleAdvancedSection('variableCostsSection', 'enableVariableCosts');
};

window.toggleMultipleRounds = function() {
    toggleAdvancedSection('multipleRoundsSection', 'enableMultipleRounds');
};

function initializeUI() {
    initializeSliders();
    
    document.getElementById('addTierBtn').addEventListener('click', addTier);
    document.getElementById('calculateBtn').addEventListener('click', () => calculateProjectionsWithValidation(true));
    
    // Initialize advanced feature toggles
    const advancedFeatures = [
        { checkbox: 'enableCohortTracking', section: 'cohortTrackingSection' },
        { checkbox: 'enableVariableCosts', section: 'variableCostsSection' },
        { checkbox: 'enableMultipleRounds', section: 'multipleRoundsSection' }
    ];
    
    advancedFeatures.forEach(feature => {
        const checkbox = document.getElementById(feature.checkbox);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                toggleAdvancedSection(feature.section, feature.checkbox);
            });
            // Initialize visibility
            toggleAdvancedSection(feature.section, feature.checkbox);
        }
    });
    
    const debouncedCalculate = debounce(() => calculateProjectionsWithValidation(false), 250);
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', (e) => {
            if (e.target.type === 'range') {
                updateSliderValue(e.target);
            }
            debouncedCalculate();
        });
    });

    addTier();
    
    calculateProjectionsWithValidation(false);
}

// =======================================================================================
// INITIALIZATION
// =======================================================================================
document.addEventListener('DOMContentLoaded', initializeUI);