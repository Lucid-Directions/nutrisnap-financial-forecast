// Core Financial Calculation Engine
// Handles the main projection calculations

// Global state
let globalMonthlyData = [];
let monthlyCustomCosts = {};
let globalSummaryData = null;

// Helper functions for calculations
// formatCurrency moved to utils.js

// Main calculation function
function calculateProjections(isManualTrigger = false) {
    console.log(`🚀 Starting calculateProjections... (Manual Trigger: ${isManualTrigger})`);
    
    // Add debugging to see if function is actually being called
    const statusEl = document.getElementById('calculationStatus');
    if (statusEl) {
        statusEl.textContent = 'Starting calculations...';
        statusEl.style.color = '#10b981';
    }
    
    try {
        const getEl = (id) => document.getElementById(id);
        const getVal = (id) => parseFloat(getEl(id)?.value) || 0;
        const getInt = (id) => parseInt(getEl(id)?.value) || 0;
        const getChecked = (id) => getEl(id)?.checked || false;

        console.log('🔍 Starting calculation with parameters...');
        
        // Test if basic elements exist
        const appPriceEl = getEl('appPrice');
        console.log('🔍 App price element:', appPriceEl?.value);
        
        if (!appPriceEl) {
            console.error('❌ Critical input elements missing - calculation cannot proceed');
            if (statusEl) {
                statusEl.textContent = 'Error: Input elements not found';
                statusEl.style.color = '#ef4444';
            }
            return;
        }
        
        // Core Parameters
        const appPrice = getVal('appPrice');
        const annualDiscount = getVal('annualDiscount') / 100;
        const annualPlanPercentage = getVal('annualPlanPercentage') / 100;
        const annualPrice = appPrice * 12 * (1 - annualDiscount);
        const startingMAU = getInt('startingMAU');
        const projectionMonths = getInt('projectionPeriod');
        
        // Growth Parameters
        const year1Growth = getVal('year1Growth') / 100;
        const year2Growth = getVal('year2Growth') / 100;
        const year3Growth = getVal('year3Growth') / 100;
        
        // Conversion & Churn Parameters
        const initialConversion = getVal('initialConversion') / 100;
        const conversionGrowth = getVal('conversionGrowth') / 100;
        const freeChurnRate = getVal('freeChurnRate') / 100;
        const paidChurnRate = getVal('paidChurnRate') / 100;
        const churnImprovement = getVal('churnImprovement') / 100; // Now using percentage format from slider
        
        const growthRates = {
            1: year1Growth,
            2: year2Growth,
            3: year3Growth,
        };
        
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
        const enableVariableCosts = getChecked('enableVariableCosts');
        const enableEnterpriseTier = getChecked('enableEnterpriseTier');
        
        const parameters = {
            appPrice, annualDiscount, annualPlanPercentage, projectionMonths, startingMAU,
            growthRates, initialConversion, conversionGrowth, freeChurnRate, paidChurnRate, churnImprovement,
            b2bStartMonth, b2bPercentage, teamCosts, techCosts, marketingCosts,
            seedInvestment, equityOffered, valuationMultiple,
            enableTieredPricing, enableVariableCosts,
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
        // Track cumulative revenue/costs from operational phase only (not beta)
        let operationalRevenue = 0;
        let operationalCosts = 0;
        
        // --- Beta Period Calculation (Months 0-2) ---
        for (let i = 0; i < 3; i++) {
            const betaUsers = getInt(`betaUsersM${i}`);
            const teamCost = getVal(`betaTeamCostM${i}`);
            const techCost = getVal(`betaTechCostM${i}`);
            const marketingCost = getVal(`betaMarketingCostM${i}`);
            const totalBetaCost = teamCost + techCost + marketingCost;
            
            cashBalance -= totalBetaCost;
            totalCosts += totalBetaCost;
            // Don't include beta costs in operational break-even calculation

            monthlyData.push({
                month: `Beta ${i}`,
                isBeta: true,
                mau: betaUsers,
                growthRate: 0,
                realizedGrowthRate: 0, // Add this for the audit table
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
        
        // --- Main Projection Calculation ---
        let currentPremiumUsers = 0;
        let currentBasicUsers = 0;
        let currentProUsers = 0;
        let currentEnterpriseUsers = 0;
        let currentFreeUsers = getInt('startingMAU') || getInt('betaUsersM2'); // Use starting MAU or final beta users
        let lastMonthMAU = currentFreeUsers;

        for (let month = 1; month <= projectionMonths; month++) {
            const timelineMonth = month + 2; // Offset for beta months
            const year = Math.ceil(month / 12);
            
            // Growth should be based on LAST month's total MAU, not just the free user pool.
            // This represents new users entering the top of the funnel.
            const growthRate = growthRates[Math.min(year, 3)] || growthRates[3];
            const newUsersThisMonth = Math.round(lastMonthMAU * growthRate);
            
            // Calculate the REALIZED growth rate for display (actual MAU change)
            const previousTotalMAU = lastMonthMAU;
            
            // Add new users to the free pool
            currentFreeUsers += newUsersThisMonth;
            
            // Apply churn to existing free users BEFORE conversion
            const freeChurnRateToApply = freeChurnRate * (1 - (churnImprovement * (year - 1)));
            currentFreeUsers = Math.round(currentFreeUsers * (1 - freeChurnRateToApply));
            
            // --- Fixed Conversion Calculation ---
            // Calculate conversion rate that increases ONLY annually, not continuously
            let currentConversionRate = initialConversion;
            if (year > 1) {
                // Apply conversion growth only once per year, not continuously
                const yearsElapsed = year - 1;
                currentConversionRate = Math.min(initialConversion * Math.pow((1 + conversionGrowth), yearsElapsed), 0.75); // Cap conversion at 75%
            }
            
            // DEBUG: Log conversion rate calculation
            if (month <= 3 || month === 36) {
                console.log(`🔍 CONVERSION DEBUG Month ${month}:`);
                console.log(`  - Initial Conversion Rate: ${(initialConversion * 100).toFixed(1)}%`);
                console.log(`  - Current Conversion Rate: ${(currentConversionRate * 100).toFixed(1)}%`);
                console.log(`  - Year: ${year}, Conversion Growth: ${(conversionGrowth * 100).toFixed(1)}%`);
                console.log(`  - Tiered Pricing Enabled: ${enableTieredPricing}`);
            }
            
            // Stop calculation if single-tier pricing is selected but no price is set
            if (!enableTieredPricing && appPrice <= 0) {
                console.error("Calculation stopped: App Price must be greater than £0 for single-tier model.");
                alert("Please set a 'Monthly Price (£)' for the app before calculating projections.");
                return; // Halt the function
            }
            
            // Calculate conversions and revenue
            let monthlyRevenue = 0;
            let newConversions = 0;
            let displayConversionRate = currentConversionRate; // Default for single pricing
            
            // Conversion and User Dynamics
            if (enableTieredPricing) {
                const basicConversion = getVal('basicConversion') / 100;
                const proConversion = getVal('proConversion') / 100;
                const enterpriseConversion = enableEnterpriseTier ? getVal('enterpriseConversion') / 100 : 0;
                displayConversionRate = basicConversion + proConversion + enterpriseConversion;
                
                // DEBUG: Log tiered conversion rates
                if (month <= 3 || month === 36) {
                    console.log(`  - Tiered Pricing Enabled:`);
                    console.log(`    * Basic Conversion: ${(basicConversion * 100).toFixed(1)}%`);
                    console.log(`    * Pro Conversion: ${(proConversion * 100).toFixed(1)}%`);
                    console.log(`    * Enterprise Conversion: ${(enterpriseConversion * 100).toFixed(1)}%`);
                    console.log(`    * Total Display Rate: ${(displayConversionRate * 100).toFixed(1)}%`);
                    console.log(`    ⚠️  NOTE: Tiered rates override the 'Initial Conversion Rate' setting!`);
                }
                
                // Calculate tiered conversions
                const newBasicUsers = Math.round(currentFreeUsers * basicConversion);
                const newProUsers = Math.round(currentFreeUsers * proConversion);
                const newEnterpriseUsers = Math.round(currentFreeUsers * enterpriseConversion);
                
                currentBasicUsers += newBasicUsers;
                currentProUsers += newProUsers;
                currentEnterpriseUsers += newEnterpriseUsers;
                
                // Apply churn to paid users
                const paidChurnToApply = paidChurnRate * (1 - (churnImprovement * (year - 1)));
                currentBasicUsers = Math.round(currentBasicUsers * (1 - paidChurnToApply));
                currentProUsers = Math.round(currentProUsers * (1 - paidChurnToApply));
                currentEnterpriseUsers = Math.round(currentEnterpriseUsers * (1 - paidChurnToApply));
                
                currentPremiumUsers = currentBasicUsers + currentProUsers + currentEnterpriseUsers;
                
                // Calculate tiered revenue
                const basicPrice = getVal('basicPrice');
                const proPrice = getVal('proPrice'); 
                const enterprisePrice = getVal('enterprisePrice');
                
                monthlyRevenue = (currentBasicUsers * basicPrice) + (currentProUsers * proPrice) + (currentEnterpriseUsers * enterprisePrice);
                
                // DEBUG: Log tiered revenue calculation
                if (month <= 3 || month === 36) {
                    console.log(`  - Revenue Calculation:`);
                    console.log(`    * Basic: ${currentBasicUsers} users × £${basicPrice} = £${(currentBasicUsers * basicPrice).toLocaleString()}`);
                    console.log(`    * Pro: ${currentProUsers} users × £${proPrice} = £${(currentProUsers * proPrice).toLocaleString()}`);
                    console.log(`    * Enterprise: ${currentEnterpriseUsers} users × £${enterprisePrice} = £${(currentEnterpriseUsers * enterprisePrice).toLocaleString()}`);
                    console.log(`    * Total Monthly Revenue: £${monthlyRevenue.toLocaleString()}`);
                }
                
                // Track new user acquisitions for CAC
                totalUsersAcquired += (newBasicUsers + newProUsers + newEnterpriseUsers);
                
            } else {
                // Single pricing tier - Use the calculated conversion rate, not tiered rates
                const newPremiumUsers = Math.round(currentFreeUsers * currentConversionRate);
                currentPremiumUsers += newPremiumUsers;
                
                // Apply churn to premium users
                const paidChurnToApply = paidChurnRate * (1 - (churnImprovement * (year - 1)));
                currentPremiumUsers = Math.round(currentPremiumUsers * (1 - paidChurnToApply));
                
                // Calculate revenue with annual pricing mix
                const monthlyPrice = appPrice;
                const annualPrice = monthlyPrice * 12 * (1 - annualDiscount);
                const monthlyUsers = Math.round(currentPremiumUsers * (1 - annualPlanPercentage));
                const annualUsers = Math.round(currentPremiumUsers * annualPlanPercentage);
                
                monthlyRevenue = (monthlyUsers * monthlyPrice) + (annualUsers * annualPrice / 12);
                
                // Calculate effective ARPU for transparency
                const effectiveARPU = currentPremiumUsers > 0 ? (monthlyRevenue / currentPremiumUsers) : 0;
                
                // DEBUG: Log single pricing revenue calculation
                if (month <= 3 || month === 36) {
                    console.log(`  - Single Pricing Revenue Calculation:`);
                    console.log(`    * Free Users Available: ${currentFreeUsers.toLocaleString()}`);
                    console.log(`    * New Premium Users: ${newPremiumUsers.toLocaleString()}`);
                    console.log(`    * Total Premium Users (after churn): ${currentPremiumUsers.toLocaleString()}`);
                    console.log(`    * Monthly Price: £${monthlyPrice}`);
                    console.log(`    * Annual Discount: ${(annualDiscount * 100).toFixed(1)}%`);
                    console.log(`    * Annual Plan %: ${(annualPlanPercentage * 100).toFixed(1)}%`);
                    console.log(`    * Monthly Users: ${monthlyUsers.toLocaleString()} × £${monthlyPrice} = £${(monthlyUsers * monthlyPrice).toLocaleString()}`);
                    console.log(`    * Annual Users: ${annualUsers.toLocaleString()} × £${(annualPrice/12).toFixed(2)} = £${(annualUsers * annualPrice / 12).toLocaleString()}`);
                    console.log(`    * Total Monthly Revenue: £${monthlyRevenue.toLocaleString()}`);
                    console.log(`    * Effective ARPU: £${effectiveARPU.toFixed(2)}`);
                    
                    // Transparency check
                    const simpleRevenue = currentPremiumUsers * monthlyPrice;
                    const difference = Math.abs(monthlyRevenue - simpleRevenue);
                    if (difference > simpleRevenue * 0.1) { // More than 10% difference
                        console.log(`    ⚠️  Revenue differs from simple calculation by £${difference.toLocaleString()} due to annual pricing mix`);
                    }
                }
                
                // Track new user acquisitions for CAC (track all new premium users)
                totalUsersAcquired += newPremiumUsers;
            }
            
            // Remove converted users from free pool
            const totalConversions = enableTieredPricing ? 
                Math.round(currentFreeUsers * displayConversionRate) : 
                Math.round(currentFreeUsers * currentConversionRate);
            currentFreeUsers = Math.max(0, currentFreeUsers - totalConversions);
            
            // VALIDATION: Check if revenue calculation matches expectation
            if (month <= 3 || month === 36) {
                console.log(`📊 VALIDATION Month ${month}:`);
                
                // Calculate actual conversion percentage from total users
                const totalMAU = currentFreeUsers + currentPremiumUsers;
                const actualConversionPct = totalMAU > 0 ? (currentPremiumUsers / totalMAU) : 0;
                
                console.log(`  - Total MAU: ${totalMAU.toLocaleString()}`);
                console.log(`  - Premium Users: ${currentPremiumUsers.toLocaleString()}`);
                console.log(`  - Free Users: ${currentFreeUsers.toLocaleString()}`);
                console.log(`  - Displayed Conversion Rate: ${(displayConversionRate * 100).toFixed(1)}%`);
                console.log(`  - Actual Conversion Rate: ${(actualConversionPct * 100).toFixed(1)}%`);
                console.log(`  - Monthly Revenue: £${monthlyRevenue.toLocaleString()}`);
                
                if (!enableTieredPricing) {
                    console.log(`  - Expected Simple Revenue (Premium × App Price): £${(currentPremiumUsers * appPrice).toLocaleString()}`);
                    console.log(`  - Difference: £${Math.abs(monthlyRevenue - (currentPremiumUsers * appPrice)).toLocaleString()}`);
                }
                
                // Check for unrealistic metrics
                if (displayConversionRate > 0.4) {
                    console.warn(`  ⚠️  WARNING: Conversion rate ${(displayConversionRate * 100).toFixed(1)}% is very high for industry standards (typically 2-10%)`);
                }
                if (actualConversionPct > 0.5) {
                    console.warn(`  ⚠️  WARNING: Actual conversion rate ${(actualConversionPct * 100).toFixed(1)}% is extremely high`);
                }
            }
            
            // B2B revenue (simplified)
            if (month >= b2bStartMonth) {
                const b2bRevenue = monthlyRevenue * b2bPercentage;
                monthlyRevenue += b2bRevenue;
            }
            
            const finalMAUForMonth = currentFreeUsers + currentPremiumUsers;
            
            // Calculate the REALIZED growth rate for this month
            const realizedGrowthRate = previousTotalMAU > 0 ? ((finalMAUForMonth - previousTotalMAU) / previousTotalMAU) : 0;
            
            // --- Monthly Costs Calculation ---
            const teamCostField = `teamCostY${Math.min(year, 3)}`;
            const techCostField = `techCostY${Math.min(year, 3)}`;
            const marketingCostField = `marketingCostY${Math.min(year, 3)}`;
            
            // Use custom monthly costs if available, otherwise use yearly defaults
            let teamCost, techCost, marketingCost;
            
            if (window.monthlyCustomCosts && window.monthlyCustomCosts.team && window.monthlyCustomCosts.team[month]) {
                teamCost = window.monthlyCustomCosts.team[month];
            } else {
                teamCost = getVal(teamCostField);
            }
            
            if (window.monthlyCustomCosts && window.monthlyCustomCosts.tech && window.monthlyCustomCosts.tech[month]) {
                techCost = window.monthlyCustomCosts.tech[month];
            } else {
                techCost = getVal(techCostField);
            }
            
            if (window.monthlyCustomCosts && window.monthlyCustomCosts.marketing && window.monthlyCustomCosts.marketing[month]) {
                marketingCost = window.monthlyCustomCosts.marketing[month];
            } else {
                marketingCost = getVal(marketingCostField);
            }

            let monthlyVariableCosts = 0;
            if (enableVariableCosts) {
                const infraCostPerUser = getVal('infraCostPerUser');
                const supportCostPerUser = getVal('supportCostPerUser');
                const transactionFees = getVal('transactionFees') / 100;
                
                // Infrastructure costs scale with all users
                const infraCosts = finalMAUForMonth * infraCostPerUser;
                // Support costs scale with paid users  
                const supportCosts = currentPremiumUsers * supportCostPerUser;
                // Transaction fees are percentage of revenue
                const transactionCosts = monthlyRevenue * transactionFees;
                
                monthlyVariableCosts = infraCosts + supportCosts + transactionCosts;
            }
            
            // Enhanced debugging for marketing costs specifically
            if (month <= 3) {
                console.log(`🔍 ENHANCED DEBUG Month ${month}:`);
                console.log(`  - Marketing Cost Field: ${marketingCostField}`);
                console.log(`  - Raw Marketing Cost Value: ${getVal(marketingCostField)}`);
                console.log(`  - Monthly Custom Costs Available: ${!!(window.monthlyCustomCosts && window.monthlyCustomCosts.marketing)}`);
                if (window.monthlyCustomCosts && window.monthlyCustomCosts.marketing) {
                    console.log(`  - Custom Marketing Cost for Month ${month}: ${window.monthlyCustomCosts.marketing[month] || 'Not Set'}`);
                }
                console.log(`  - Final Marketing Cost: £${marketingCost.toLocaleString()}`);
                console.log(`  - Team Cost: £${teamCost.toLocaleString()}, Tech Cost: £${techCost.toLocaleString()}`);
            }

            const monthlyCosts = teamCost + techCost + marketingCost + monthlyVariableCosts;
            const netIncome = monthlyRevenue - monthlyCosts;

            cashBalance += netIncome;
            totalRevenue += monthlyRevenue;
            totalCosts += monthlyCosts;
            operationalRevenue += monthlyRevenue;
            operationalCosts += monthlyCosts;

            // Fixed Break-even: Find the FIRST month where net income becomes >= 0
            if (netIncome >= 0 && breakEvenMonth === null) {
                breakEvenMonth = month; // Use operational month number (not timeline month)
                console.log(`🎯 BREAK-EVEN REACHED at Month ${month}! Monthly Net Income: £${netIncome.toLocaleString()} (Revenue: £${monthlyRevenue.toLocaleString()}, Costs: £${monthlyCosts.toLocaleString()})`);
            }
            
            // Debug logging for break-even tracking
            if (month <= 5 || month % 6 === 0) {
                console.log(`📊 Month ${month}: Net Income=£${netIncome.toLocaleString()}, Monthly Revenue=£${monthlyRevenue.toLocaleString()}, Premium Users=${currentPremiumUsers}, Marketing Cost=£${marketingCost.toLocaleString()}`);
            }

            // --- Consolidate Monthly Data ---
            monthlyData.push({
                month: month,
                isBeta: false,
                mau: finalMAUForMonth, 
                growthRate: growthRate, // Target growth rate
                realizedGrowthRate: realizedGrowthRate, // Actual growth achieved
                freeUsers: currentFreeUsers,
                premiumUsers: currentPremiumUsers,
                basicUsers: enableTieredPricing ? currentBasicUsers : 0,
                proUsers: enableTieredPricing ? currentProUsers : 0,
                enterpriseUsers: enableTieredPricing && enableEnterpriseTier ? currentEnterpriseUsers : 0,
                conversionRate: displayConversionRate,
                monthlyRevenue,
                arr: monthlyRevenue * 12,
                teamCost: teamCost,
                techCost: techCost,
                marketingCost: marketingCost,
                variableCosts: monthlyVariableCosts,
                monthlyCosts, 
                netIncome,
            });

            // Update lastMonthMAU for the next iteration's growth calculation
            lastMonthMAU = finalMAUForMonth;
        }
        
        console.log("Calculation loop finished. Final month data:", monthlyData[monthlyData.length-1]);
        
        // Add verification logging
        console.log("📊 CALCULATION VERIFICATION:");
        console.log(`  - Total months calculated: ${monthlyData.length}`);
        console.log(`  - Total users acquired: ${totalUsersAcquired.toLocaleString()}`);
        console.log(`  - Total revenue: £${totalRevenue.toLocaleString()}`);
        console.log(`  - Total costs: £${totalCosts.toLocaleString()}`);
        console.log(`  - Final MAU: ${monthlyData[monthlyData.length-1].mau?.toLocaleString() || 'N/A'}`);
        
        // Check marketing costs specifically
        const totalOperationalMarketingCosts = monthlyData.filter(d => !d.isBeta).reduce((acc, d) => acc + (d.marketingCost || 0), 0);
        console.log(`  - Total marketing costs (operational): £${totalOperationalMarketingCosts.toLocaleString()}`);
        console.log(`  - Sample marketing costs: Month 1: £${monthlyData[0]?.marketingCost || 'N/A'}, Month 6: £${monthlyData[5]?.marketingCost || 'N/A'}, Month 12: £${monthlyData[11]?.marketingCost || 'N/A'}`);

        // Final Metrics Calculation
        const finalData = monthlyData.slice().pop() || {};
        const operationalData = monthlyData.filter(d => !d.isBeta);
        const finalARR = finalData.arr || 0;
        const netProfit = totalRevenue - totalCosts;

        // Validate Key Assumptions and Metrics
        console.log("🔍 ASSUMPTIONS VALIDATION:");
        
        // Calculate Customer LTV and CAC more transparently
        const avgMonthlyChurn = paidChurnRate * (1 - (churnImprovement * 2)); // Average over projection
        const avgCustomerLifetimeMonths = avgMonthlyChurn > 0 ? (1 / avgMonthlyChurn) : 60; // Default to 5 years if no churn
        const avgARPU = finalData.premiumUsers > 0 ? (finalData.monthlyRevenue / finalData.premiumUsers) : (appPrice || 10);
        const customerLTV = avgCustomerLifetimeMonths * avgARPU;
        
        // Calculate CAC more accurately
        const customerCAC = totalUsersAcquired > 0 ? (totalOperationalMarketingCosts / totalUsersAcquired) : 0;
        const salesOverhead = totalOperationalMarketingCosts * 0.2; // 20% overhead
        const totalCAC = customerCAC + (salesOverhead / Math.max(totalUsersAcquired, 1));
        
        const ltvCacRatio = totalCAC > 0 ? (customerLTV / totalCAC) : 0;
        
        console.log(`  - Customer LTV Calculation:`);
        console.log(`    * Average Customer Lifetime: ${avgCustomerLifetimeMonths.toFixed(1)} months`);
        console.log(`    * Average Monthly Churn: ${(avgMonthlyChurn * 100).toFixed(2)}%`);
        console.log(`    * Average ARPU: £${avgARPU.toFixed(2)}`);
        console.log(`    * Customer LTV: £${customerLTV.toFixed(2)}`);
        console.log(`  - Customer CAC Calculation:`);
        console.log(`    * Total Marketing Costs: £${totalOperationalMarketingCosts.toLocaleString()}`);
        console.log(`    * Total Users Acquired: ${totalUsersAcquired.toLocaleString()}`);
        console.log(`    * Marketing CAC: £${customerCAC.toFixed(2)}`);
        console.log(`    * Sales Overhead (20%): £${(salesOverhead / Math.max(totalUsersAcquired, 1)).toFixed(2)}`);
        console.log(`    * Total CAC: £${totalCAC.toFixed(2)}`);
        console.log(`  - LTV:CAC Ratio: ${ltvCacRatio.toFixed(1)}:1`);
        
        // Validate assumptions against industry standards
        const validationWarnings = [];
        
        if (ltvCacRatio > 10) {
            validationWarnings.push(`🚨 LTV:CAC ratio (${ltvCacRatio.toFixed(1)}:1) is extremely high. Industry good: 3:1, excellent: 5:1+`);
        }
        
        if (avgMonthlyChurn < 0.005) { // Less than 0.5% monthly churn
            validationWarnings.push(`🚨 Monthly churn rate (${(avgMonthlyChurn * 100).toFixed(2)}%) is unrealistically low for mobile apps`);
        }
        
        if (ltvCacRatio > 30) {
            validationWarnings.push(`🚨 LTV:CAC ratio suggests acquisition costs may be too low or lifetime value too high`);
        }
        
        const finalConversionRate = finalData.conversionRate || 0;
        if (finalConversionRate > 0.3) { // More than 30%
            validationWarnings.push(`🚨 Final conversion rate (${(finalConversionRate * 100).toFixed(1)}%) is very high for industry standards`);
        }
        
        // Check revenue calculation transparency
        if (!enableTieredPricing) {
            const expectedSimpleRevenue = finalData.premiumUsers * appPrice;
            const actualRevenue = finalData.monthlyRevenue;
            const revenueDiff = Math.abs(expectedSimpleRevenue - actualRevenue) / expectedSimpleRevenue;
            
            if (revenueDiff > 0.15) { // More than 15% difference
                validationWarnings.push(`🚨 Revenue calculation differs significantly from simple Premium Users × Price formula`);
            }
        }
        
        if (validationWarnings.length > 0) {
            console.warn("⚠️  VALIDATION WARNINGS:");
            validationWarnings.forEach(warning => console.warn(`    ${warning}`));
            console.warn("    💡 Consider reviewing assumptions for investor credibility");
        } else {
            console.log("✅ All key metrics appear within reasonable industry ranges");
        }
        
        // Complete metric calculations for display
        const ltv = customerLTV;
        const cac = totalCAC;
        const ltvCacRatioDisplay = `${ltvCacRatio.toFixed(1)}:1`;
        const paybackPeriod = (avgARPU > 0 && cac > 0) ? Math.ceil(cac / avgARPU) : 0;
        
        // Valuation & Investor Return
        const exitValuation = finalARR * valuationMultiple;
        const investorReturn = exitValuation * equityOffered;
        const returnMultiple = seedInvestment > 0 ? (investorReturn / seedInvestment) : 0;
        const returnMultipleDisplay = `${returnMultiple.toFixed(1)}x`;
        
        // Fixed Runway & Burn Rate Calculation
        const operationalMonths = monthlyData.filter(d => !d.isBeta);
        let runway, burnRateDisplay;
        
        if (operationalMonths.length > 0) {
            const latestMonth = operationalMonths[operationalMonths.length - 1];
            const lastMonthNetIncome = latestMonth.netIncome;
            const lastMonthTotalCosts = latestMonth.monthlyCosts;
            
            // Always show the last month's net income (positive = profit, negative = burn)
            burnRateDisplay = lastMonthNetIncome;
            
            // Calculate runway based on cash balance and monthly costs
            if (cashBalance > 0 && lastMonthTotalCosts > 0) {
                // Calculate a "zero-revenue" runway scenario
                runway = Math.floor(cashBalance / lastMonthTotalCosts);
            } else {
                runway = 0;
            }
            
            // If profitable, show a large but finite number
            if (lastMonthNetIncome > 0) {
                runway = 999; // Represents effectively infinite runway
            }
        } else {
            burnRateDisplay = 0;
            runway = 0;
        }
        
        // Variable Costs Breakdown Calculation
        let variableCostData = null;
        if (enableVariableCosts) {
            const infraCostPerUser = getVal('infraCostPerUser');
            const supportCostPerUser = getVal('supportCostPerUser');
            const transactionFees = getVal('transactionFees') / 100;
            
            let totalInfraCosts = 0;
            let totalSupportCosts = 0;
            let totalTransactionFees = 0;
            let totalVariableCosts = 0;
            
            operationalData.forEach(monthData => {
                const infraCosts = monthData.mau * infraCostPerUser;
                const supportCosts = monthData.premiumUsers * supportCostPerUser;
                const transactionCosts = monthData.monthlyRevenue * transactionFees;
                
                totalInfraCosts += infraCosts;
                totalSupportCosts += supportCosts;
                totalTransactionFees += transactionCosts;
                totalVariableCosts += (infraCosts + supportCosts + transactionCosts);
            });
            
            const avgMonthlyVariableCosts = totalVariableCosts / operationalData.length;
            const finalTotalUsers = finalData.mau || 0;
            const variableCostPerUser = finalTotalUsers > 0 ? avgMonthlyVariableCosts / finalTotalUsers : 0;
            
            variableCostData = {
                totalInfraCosts,
                totalSupportCosts,
                totalTransactionFees,
                totalVariableCosts,
                avgMonthlyVariableCosts,
                variableCostPerUser,
                infraCostPerUser,
                supportCostPerUser,
                transactionFeePercentage: transactionFees * 100
            };
        }
        
        // Calculate total operational revenue for breakdown calculations
        const totalOperationalRevenue = operationalData.reduce((acc, d) => acc + (d.monthlyRevenue || 0), 0);

        const summaryData = {
            finalMAU: finalData.mau || 0,
            finalARR,
            breakEvenMonth: breakEvenMonth ? `Month ${breakEvenMonth}` : 'Not Reached',
            exitValuation,
            investorReturn: `${formatCurrency(investorReturn)} (${returnMultipleDisplay})`,
            totalRevenue,
            totalCosts,
            netProfit,
            ltvCacRatio: ltvCacRatioDisplay,
            customerLTV: ltv,
            monthlyARPU: avgARPU,
            customerCAC: cac,
            runway: runway === 999 ? '999+ months' : `${runway} months`,
            // Fixed burn rate display - show as "Current Net Profit" when positive
            burnRate: burnRateDisplay >= 0 ? `${formatCurrency(burnRateDisplay)}/month` : `${formatCurrency(Math.abs(burnRateDisplay))}/month`,
            
            // Numeric values for exports
            returnMultiple: returnMultiple,
            currentBurnRate: Math.abs(burnRateDisplay),
            
            // For CAC Breakdown Card
            totalMarketingCosts: totalOperationalMarketingCosts,
            salesOverhead,
            totalAcquisitionSpend: totalOperationalMarketingCosts + salesOverhead,
            totalUsersAcquired,
            paybackPeriod: `${paybackPeriod} months`,
            
            // --- New Breakdown Data ---
            
            // Conversion Rate Breakdown
            conversionBreakdown: {
                initialConversion: getVal('initialConversion'),
                finalConversion: finalData.conversionRate ? (finalData.conversionRate * 100) : 0,
                avgConversion: operationalData.length > 0 ? (operationalData.reduce((acc, d) => acc + (d.conversionRate || 0), 0) / operationalData.length) * 100 : 0,
                conversionImprovement: getVal('conversionGrowth'),
                peakConversion: Math.max(...operationalData.map(d => (d.conversionRate || 0) * 100)),
                peakConversionMonth: operationalData.findIndex(d => (d.conversionRate || 0) * 100 === Math.max(...operationalData.map(d => (d.conversionRate || 0) * 100))) + 1
            },
            
            // User Growth Breakdown
            userGrowthBreakdown: {
                startingMAU: getVal('startingMAU'),
                finalMAU: finalData.mau || 0,
                totalGrowthPercent: getVal('startingMAU') > 0 ? (((finalData.mau || 0) - getVal('startingMAU')) / getVal('startingMAU')) * 100 : 0,
                avgMonthlyGrowth: operationalData.length > 1 ? (operationalData.reduce((acc, d) => acc + (d.realizedGrowthRate || d.growthRate || 0), 0) / operationalData.length) * 100 : 0,
                finalPremiumUsers: finalData.premiumUsers || 0,
                initialPremiumUsers: operationalData[0]?.premiumUsers || 0,
                premiumUserGrowthPercent: (operationalData[0]?.premiumUsers || 0) > 0 ? (((finalData.premiumUsers || 0) - (operationalData[0]?.premiumUsers || 0)) / (operationalData[0]?.premiumUsers || 0)) * 100 : 0
            },
            
            // Team & Tech Costs Breakdown
            teamTechBreakdown: {
                totalTeamCosts: operationalData.reduce((acc, d) => acc + (d.teamCost || 0), 0),
                totalTechCosts: operationalData.reduce((acc, d) => acc + (d.techCost || 0), 0),
                avgMonthlyTeamCost: operationalData.length > 0 ? operationalData.reduce((acc, d) => acc + (d.teamCost || 0), 0) / operationalData.length : 0,
                avgMonthlyTechCost: operationalData.length > 0 ? operationalData.reduce((acc, d) => acc + (d.techCost || 0), 0) / operationalData.length : 0,
                teamCostPerUser: operationalData.length > 0 ? 
                    (operationalData.reduce((acc, d) => acc + (d.teamCost || 0), 0) / operationalData.length) / 
                    (operationalData.reduce((acc, d) => acc + (d.mau || 0), 0) / operationalData.length || 1) : 0,
                techCostPerUser: operationalData.length > 0 ? 
                    (operationalData.reduce((acc, d) => acc + (d.techCost || 0), 0) / operationalData.length) / 
                    (operationalData.reduce((acc, d) => acc + (d.mau || 0), 0) / operationalData.length || 1) : 0
            },
            
            // Marketing Efficiency Breakdown
            marketingBreakdown: {
                totalMarketingSpend: totalOperationalMarketingCosts,
                avgMonthlyMarketing: operationalData.length > 0 ? totalOperationalMarketingCosts / operationalData.length : 0,
                marketingPerUser: totalUsersAcquired > 0 ? totalOperationalMarketingCosts / totalUsersAcquired : 0,
                marketingROI: totalOperationalMarketingCosts > 0 ? ((totalOperationalRevenue - totalOperationalMarketingCosts) / totalOperationalMarketingCosts) * 100 : 0,
                revenuePerMarketingPound: totalOperationalMarketingCosts > 0 ? totalOperationalRevenue / totalOperationalMarketingCosts : 0,
                marketingEfficiencyTrend: operationalData.length > 6 ? 
                    (operationalData.slice(-6).reduce((acc, d) => acc + (d.monthlyRevenue || 0), 0) / operationalData.slice(-6).reduce((acc, d) => acc + (d.marketingCost || 0), 0)) > 
                    (operationalData.slice(0, 6).reduce((acc, d) => acc + (d.monthlyRevenue || 0), 0) / operationalData.slice(0, 6).reduce((acc, d) => acc + (d.marketingCost || 0), 0)) 
                    ? 'Improving' : 'Declining' : 'Stable'
            },
            
            // Parameters object for advanced analytics
            parameters: parameters,
            
            // Placeholder data for advanced analytics (can be enhanced later)
            costBreakdown: {},
            cacBreakdown: {
                totalMarketingCosts: totalOperationalMarketingCosts,
                salesOverhead,
                totalAcquisitionCosts: totalOperationalMarketingCosts + salesOverhead,
                totalUsersAcquired,
                averageCAC: cac
            },
            tieredRevenueData: null,
            cohortData: null,
            variableCostData: variableCostData,
            fundingData: null
        };

        console.log('📊 Final Summary Data (Post-Overhaul):', summaryData);

        // Store global data for other functions
        globalMonthlyData = monthlyData;
        globalSummaryData = summaryData;

        // Call display function
        if (typeof displayResults === 'function') {
            displayResults(monthlyData, summaryData, isManualTrigger);
        } else if (typeof window.displayResults === 'function') {
            window.displayResults(monthlyData, summaryData, isManualTrigger);
        } else {
            console.error('❌ displayResults function not found. Calling basic display fallback.');
            // Basic fallback display
            const outputSection = document.getElementById('outputSection');
            if (outputSection) {
                outputSection.style.display = 'block';
                outputSection.innerHTML = `
                    <h2>📊 Financial Projections</h2>
                    <div class="summary-card">
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-label">Final MAU</div>
                                <div class="summary-value">${summaryData.finalMAU.toLocaleString()}</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Final ARR</div>
                                <div class="summary-value">${formatCurrency(summaryData.finalARR)}</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Break-even Month</div>
                                <div class="summary-value">${summaryData.breakEvenMonth}</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Net Profit/Loss</div>
                                <div class="summary-value">${formatCurrency(summaryData.netProfit)}</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h3>Results calculated successfully!</h3>
                        <p>Monthly data: ${monthlyData.length} months calculated</p>
                        <p>The full UI will load once all JavaScript modules are properly initialized.</p>
                    </div>
                `;
                console.log('✅ Basic fallback display shown');
            } else {
                console.error('❌ outputSection not found');
            }
        }
        
        console.log('✅ Projections calculated and displayed.');
        
    } catch (error) {
        console.error('❌ An error occurred during projection calculation:', error);
    }
}

// Make calculateProjections globally available
window.calculateProjections = calculateProjections;

// Simple test function to verify JavaScript is working
function testApp() {
    console.log('🧪 Testing app functionality...');
    console.log('- calculateProjections function available:', typeof calculateProjections);
    console.log('- saveScenario function available:', typeof window.saveScenario);
    console.log('- displayResults function available:', typeof window.displayResults);
    
    const appPriceEl = document.getElementById('appPrice');
    console.log('- App price input found:', !!appPriceEl, 'value:', appPriceEl?.value);
    
    const calcBtn = document.getElementById('calculateBtn');
    console.log('- Calculate button found:', !!calcBtn);
    
    if (calcBtn && appPriceEl) {
        console.log('✅ Basic elements found - app should be functional');
    } else {
        console.log('❌ Missing critical elements');
    }
}

// Make test function available globally
window.testApp = testApp; 