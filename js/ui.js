// UI Helper Functions
// Handles DOM manipulation, form updates, and UI state

function updateSliderValue(slider) {
    // Find the display element by ID pattern - most sliders have their display element as sliderID + "Value"
    const displayElementId = slider.id + 'Value';
    const displayElement = document.getElementById(displayElementId);
    
    if (displayElement) {
        const value = parseFloat(slider.value);
        // Format the display value based on the slider type
        if (slider.id.includes('Conversion') || slider.id.includes('Growth') || slider.id.includes('Churn') || 
            slider.id.includes('annualDiscount') || slider.id.includes('Percentage') || 
            slider.id.includes('transactionFees') || slider.id.includes('b2bPercentage')) {
            displayElement.textContent = value + '%';
        } else if (slider.id === 'cohortLtvMultiplier' || slider.id === 'infraScaling' || 
                   slider.id.includes('Multiple') || slider.id.includes('Multiplier')) {
            displayElement.textContent = value + 'x';
        } else {
            displayElement.textContent = value;
        }
        
        // Debug logging for important sliders
        if (['initialConversion', 'marketingCostY1', 'marketingCostY2', 'marketingCostY3', 'transactionFees'].includes(slider.id)) {
            console.log(`🎛️ Slider changed: ${slider.id} = ${value}${displayElement.textContent.includes('%') ? '%' : ''}`);
        }
    } else {
        // Fallback: look for .range-value in the parent element (for any sliders that still use this pattern)
        const rangeValue = slider.parentElement.querySelector('.range-value');
        if (rangeValue) {
            const value = parseFloat(slider.value);
            if (slider.id.includes('Conversion') || slider.id.includes('Growth') || slider.id.includes('Churn') || 
                slider.id.includes('annualDiscount') || slider.id.includes('Percentage') || 
                slider.id.includes('transactionFees') || slider.id.includes('b2bPercentage')) {
                rangeValue.textContent = value + '%';
            } else if (slider.id === 'cohortLtvMultiplier' || slider.id === 'infraScaling' || 
                       slider.id.includes('Multiple') || slider.id.includes('Multiplier')) {
                rangeValue.textContent = value + 'x';
            } else {
                rangeValue.textContent = value;
            }
        } else {
            console.warn(`⚠️ Display element not found for slider: ${slider.id} (looking for ID: ${displayElementId})`);
        }
    }
}

function updateAnnualPrice() {
    const appPrice = parseFloat(document.getElementById('appPrice')?.value) || 9.99;
    const annualDiscount = parseFloat(document.getElementById('annualDiscount')?.value) || 20;
    const annualPlanPercentage = parseFloat(document.getElementById('annualPlanPercentage')?.value) || 30;
    
    const monthlyPrice = appPrice;
    const discountedAnnualPrice = appPrice * 12 * (1 - annualDiscount / 100);
    const effectiveMonthlyPrice = (discountedAnnualPrice / 12 * annualPlanPercentage / 100) + (monthlyPrice * (1 - annualPlanPercentage / 100));
    const effectiveAnnualPrice = effectiveMonthlyPrice * 12;
    
    const displayEl = document.getElementById('annualPriceDisplay');
    if (displayEl) {
        displayEl.innerHTML = `
            <strong>Effective Annual Price: ${formatCurrency(effectiveAnnualPrice)}</strong>
            <small>Blended rate considering discount adoption</small>
        `;
    }
}

function displayResults(monthlyData, summaryData, isManualTrigger = false) {
    console.log('📊 Rendering results...', { summaryData });
    
    const getEl = (id) => document.getElementById(id);
    const setTxt = (id, text) => {
        const el = getEl(id);
        if (el) {
            el.textContent = text;
        } else {
            console.warn(`⚠️ Element with ID '${id}' not found`);
        }
    };
    
    const safeToLocaleString = (value) => {
        return (value && typeof value === 'number' && !isNaN(value)) ? value.toLocaleString() : '0';
    };
    
    const safeCurrency = (value) => {
        return (value && typeof value === 'number' && !isNaN(value)) ? formatCurrency(value) : '£0';
    };

    // --- 1. Update Summary Data ---
    if (summaryData) {
        setTxt('finalMAU', safeToLocaleString(summaryData.finalMAU));
        setTxt('finalARR', safeCurrency(summaryData.finalARR));
        setTxt('breakEvenMonth', summaryData.breakEvenMonth);
        setTxt('exitValuation', safeCurrency(summaryData.exitValuation));
        setTxt('investorReturn', summaryData.investorReturn);
        setTxt('totalRevenue', safeCurrency(summaryData.totalRevenue));
        setTxt('totalCosts', safeCurrency(summaryData.totalCosts));
        setTxt('netProfit', safeCurrency(summaryData.netProfit));
        setTxt('ltvCacRatio', summaryData.ltvCacRatio);
        setTxt('customerLTV', safeCurrency(summaryData.customerLTV));
        setTxt('monthlyARPU', safeCurrency(summaryData.monthlyARPU));
        setTxt('customerCAC', safeCurrency(summaryData.customerCAC));
        setTxt('runway', summaryData.runway);
        setTxt('burnRate', summaryData.burnRate);
        
        // Update burn rate label based on value
        const burnRateLabel = document.querySelector('.summary-item:last-child .summary-label');
        if (burnRateLabel && summaryData.burnRate) {
            // Extract the actual value from the burn rate string to check if positive
            const burnValue = summaryData.burnRate.replace(/[£,/month]/g, '').replace('-', '');
            const isPositive = !summaryData.burnRate.includes('-') && parseFloat(burnValue) > 0;
            burnRateLabel.textContent = isPositive ? 'Current Net Profit' : 'Current Burn Rate';
        }

        // Update CAC Breakdown Card
        setTxt('totalMarketingCosts', safeCurrency(summaryData.totalMarketingCosts));
        setTxt('salesOverhead', safeCurrency(summaryData.salesOverhead));
        setTxt('totalAcquisitionCosts', safeCurrency(summaryData.totalAcquisitionSpend));
        setTxt('totalUsersAcquiredDisplay', safeToLocaleString(summaryData.totalUsersAcquired));
        setTxt('averageCACDisplay', safeCurrency(summaryData.customerCAC));
        setTxt('paybackPeriod', summaryData.paybackPeriod);
        
        // Update Variable Costs Breakdown Card
        updateVariableCostsBreakdown(summaryData.variableCostData);
        
        // Update new breakdown cards
        updateConversionRateBreakdown(summaryData.conversionBreakdown);
        updateUserGrowthBreakdown(summaryData.userGrowthBreakdown);
        updateTeamTechBreakdown(summaryData.teamTechBreakdown);
        updateMarketingEfficiencyBreakdown(summaryData.marketingBreakdown);
    }
    
    // --- 2. Update Monthly Table ---
    const tieredPricingEnabled = document.getElementById('enableTieredPricing')?.checked || false;
    const b2bEnabled = true; // For now, always show B2B column
    
    console.log('📊 Updating monthly table...', { dataLength: monthlyData.length, tieredPricingEnabled, b2bEnabled });
    updateMonthlyTable(monthlyData, tieredPricingEnabled, b2bEnabled);
    console.log('✅ Monthly table updated successfully');
    
    // --- 3. Update Charts ---
    if (typeof updateChart === 'function') {
        updateChart(monthlyData);
    }
    
    // --- 4. Make the entire output section visible ---
    const outputSection = getEl('outputSection');
    if (outputSection) {
        outputSection.style.display = 'block';
        console.log('✅ Output section is now visible.');
        // Scroll to the output section ONLY on manual trigger so the user sees the results
        if (isManualTrigger) {
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
    const tbody = document.getElementById('monthlyTableBody');
    if (!tbody) {
        console.error('❌ Monthly table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    try {
        const enterpriseTierEnabled = document.getElementById('enableEnterpriseTier')?.checked || false;
        const showEnterprise = tieredPricingEnabled && enterpriseTierEnabled;
        
        const safeNumber = (value) => (value || 0).toLocaleString();
        const safePercent = (value) => ((value || 0) * 100).toFixed(1) + '%';
        const safeCurrency = (value) => formatCurrency(value || 0);
        
        // Find break-even month (first month where net income becomes positive)
        let breakEvenMonth = null;
        console.log('🔍 Searching for break-even month in', monthlyData.length, 'months');
        
        for (let i = 0; i < monthlyData.length; i++) {
            const netIncome = monthlyData[i].netIncome || 0;
            console.log(`Month ${i + 1}: Net Income = ${formatCurrency(netIncome)}`);
            
            if (netIncome >= 0 && breakEvenMonth === null) {
                breakEvenMonth = i;
                console.log(`🎯 BREAK-EVEN FOUND at index ${i} (Month ${monthlyData[i].month})`);
                break;
            }
        }
        
        if (breakEvenMonth === null) {
            console.log('❌ No break-even month found - all months have negative net income');
        }
        
        monthlyData.forEach((data, index) => {
            const row = document.createElement('tr');
            
            // Add year highlight
            if (data.month % 12 === 1 && data.month > 1) {
                row.classList.add('year-highlight');
            }
            
            // Add break-even highlight
            if (index === breakEvenMonth) {
                row.classList.add('breakeven-highlight');
                row.title = `Break-even achieved! First month with positive net income: ${formatCurrency(data.netIncome)}`;
                console.log(`✅ Applied breakeven-highlight class to row ${index + 1}`);
                
                // Add inline styles as backup in case CSS doesn't load properly
                row.style.background = 'linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)';
                row.style.borderLeft = '4px solid #667eea';
                row.style.borderRight = '4px solid #764ba2';
                row.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.4)';
                row.style.position = 'relative';
                row.style.fontWeight = '600';
            }
            
            // Handle beta months display
            const monthDisplay = data.isBeta ? `Beta ${data.month}` : data.month;
            
            // Use realized growth rate for display instead of target growth rate
            const displayGrowthRate = data.realizedGrowthRate !== undefined ? data.realizedGrowthRate : data.growthRate;
            
            row.innerHTML = `
                <td>${monthDisplay}</td>
                <td>${safeNumber(data.mau)}</td>
                <td>${safePercent(displayGrowthRate)}</td>
                <td>${safeNumber(data.freeUsers)}</td>
                <td style="${tieredPricingEnabled ? '' : 'display: none;'}">${safeNumber(data.basicUsers)}</td>
                <td style="${tieredPricingEnabled ? '' : 'display: none;'}">${safeNumber(data.proUsers)}</td>
                <td style="${showEnterprise ? '' : 'display: none;'}">${safeNumber(data.enterpriseUsers)}</td>
                <td style="${!tieredPricingEnabled ? '' : 'display: none;'}">${safeNumber(data.premiumUsers)}</td>
                <td>${safePercent(data.conversionRate)}</td>
                <td>${safeCurrency(data.monthlyRevenue)}</td>
                <td>${safeCurrency(data.arr)}</td>
                <td>${safeCurrency(data.teamCost)}</td>
                <td>${safeCurrency(data.techCost)}</td>
                <td>${safeCurrency(data.marketingCost)}</td>
                <td>${safeCurrency(data.variableCosts)}</td>
                <td>${safeCurrency(data.monthlyCosts)}</td>
                <td class="${data.netIncome >= 0 ? 'positive' : 'negative'}">${safeCurrency(data.netIncome)}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Update table headers for tiered pricing and enterprise
        const basicHeader = document.querySelector('#monthlyTable thead tr th:nth-child(5)');
        const proHeader = document.querySelector('#monthlyTable thead tr th:nth-child(6)');
        const enterpriseHeader = document.getElementById('enterpriseHeader');
        const premiumHeader = document.querySelector('#monthlyTable thead tr th:nth-child(8)');
        
        if (basicHeader) basicHeader.style.display = tieredPricingEnabled ? '' : 'none';
        if (proHeader) proHeader.style.display = tieredPricingEnabled ? '' : 'none';
        if (enterpriseHeader) enterpriseHeader.style.display = showEnterprise ? '' : 'none';
        if (premiumHeader) premiumHeader.style.display = tieredPricingEnabled ? 'none' : '';
        
        // Log break-even information
        if (breakEvenMonth !== null) {
            console.log(`🎯 Break-even highlighted at row ${breakEvenMonth + 1} (Month ${monthlyData[breakEvenMonth].month})`);
            
            // Double-check that the class was applied
            const highlightedRow = tbody.children[breakEvenMonth];
            if (highlightedRow && highlightedRow.classList.contains('breakeven-highlight')) {
                console.log('✅ CSS class successfully applied to DOM element');
            } else {
                console.error('❌ CSS class NOT found on DOM element');
            }
        }
        
    } catch (error) {
        console.error('❌ Error updating monthly table:', error);
    }
}

// Manual test function for break-even highlighting
function testBreakEvenHighlight() {
    console.log('🧪 Testing break-even highlighting...');
    const tbody = document.getElementById('monthlyTableBody');
    if (!tbody) {
        console.error('❌ Table body not found');
        return;
    }
    
    // Find the first row with positive net income by looking at the last cell (net income)
    const rows = tbody.querySelectorAll('tr');
    let foundBreakEven = false;
    
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        const netIncomeCell = cells[cells.length - 1]; // Last column is net income
        
        if (netIncomeCell && !foundBreakEven) {
            const netIncomeText = netIncomeCell.textContent.replace(/[£$,]/g, '');
            const netIncomeNum = parseFloat(netIncomeText);
            
            console.log(`Row ${index + 1}: Net Income = ${netIncomeText} (${netIncomeNum})`);
            
            if (netIncomeNum >= 0) {
                console.log(`🎯 Manually applying break-even highlight to row ${index + 1}`);
                row.classList.add('breakeven-highlight');
                row.style.backgroundColor = 'rgba(102, 126, 234, 0.4)';
                row.style.border = '2px solid #667eea';
                row.style.fontWeight = 'bold';
                foundBreakEven = true;
            }
        }
    });
    
    if (!foundBreakEven) {
        console.log('❌ No positive net income found in any row');
    }
}

// Toggle functions for advanced features
function toggleTieredPricing() {
    const enabled = document.getElementById('enableTieredPricing')?.checked || false;
    const section = document.getElementById('tieredPricingSection');
    
    if (section) {
        section.style.display = enabled ? 'block' : 'none';
        console.log('Tiered pricing section toggled:', enabled ? 'visible' : 'hidden');
        
        // Initialize tier slider listeners if shown for the first time
        if (enabled && !section.dataset.initialized) {
            initializeTierSliders();
            section.dataset.initialized = 'true';
        }
    }
    
    // Don't auto-calculate to avoid user interruption
}

function initializeTierSliders() {
    const tiers = ['tier1Conversion', 'tier2Conversion', 'tier3Conversion', 'tier4Conversion'];
    
    tiers.forEach(tierId => {
        const slider = document.getElementById(tierId);
        if (slider) {
            const updateDisplay = () => {
                const span = slider.nextElementSibling;
                if (span) {
                    span.textContent = slider.value + '%';
                }
            };
            
            slider.addEventListener('input', updateDisplay);
            updateDisplay(); // Initialize display
        }
    });
}

function toggleCohortTracking() {
    const enabled = document.getElementById('enableCohortTracking')?.checked || false;
    const section = document.getElementById('cohortTrackingSection');
    
    if (section) {
        section.style.display = enabled ? 'block' : 'none';
        console.log('Cohort tracking section toggled:', enabled ? 'visible' : 'hidden');
    }
}

function toggleVariableCosts() {
    const enabled = document.getElementById('enableVariableCosts')?.checked || false;
    const section = document.getElementById('variableCostsSection');
    
    if (section) {
        section.style.display = enabled ? 'block' : 'none';
        console.log('Variable costs section toggled:', enabled ? 'visible' : 'hidden');
    }
}

function toggleEnterpriseTier() {
    const enabled = document.getElementById('enableEnterpriseTier')?.checked || false;
    const section = document.getElementById('enterpriseTierSection');
    
    if (section) {
        section.style.display = enabled ? 'block' : 'none';
        console.log('Enterprise tier section toggled:', enabled ? 'visible' : 'hidden');
    }
}

function toggleMultipleRounds() {
    const enabled = document.getElementById('enableMultipleRounds')?.checked || false;
    const section = document.getElementById('multipleRoundsSection');
    const analysis = document.getElementById('fundingRoundsAnalysis');
    
    if (section) section.style.display = enabled ? 'block' : 'none';
    if (analysis) analysis.style.display = enabled ? 'block' : 'none';
    
    if (enabled) {
        const advancedEl = document.getElementById('advancedAnalytics');
        if (advancedEl) advancedEl.style.display = 'block';
    } else {
        updateAdvancedAnalyticsVisibility();
    }
    
    console.log('Multiple rounds toggled:', enabled ? 'enabled' : 'disabled');
}

// Make toggle functions immediately available globally
window.toggleTieredPricing = toggleTieredPricing;
window.toggleCohortTracking = toggleCohortTracking;
window.toggleVariableCosts = toggleVariableCosts;
window.toggleEnterpriseTier = toggleEnterpriseTier;
window.toggleMultipleRounds = toggleMultipleRounds;

function updateAdvancedAnalyticsVisibility() {
    const tieredEl = document.getElementById('enableTieredPricing');
    const cohortEl = document.getElementById('enableCohortTracking');
    const variableEl = document.getElementById('enableVariableCosts');
    const multipleEl = document.getElementById('enableMultipleRounds');
    const analyticsEl = document.getElementById('advancedAnalytics');
    
    if (!analyticsEl) return;
    
    const hasTiered = tieredEl?.checked || false;
    const hasCohort = cohortEl?.checked || false;
    const hasVariable = variableEl?.checked || false;
    const hasMultiple = multipleEl?.checked || false;
    
    const showAdvanced = hasTiered || hasCohort || hasVariable || hasMultiple;
    analyticsEl.style.display = showAdvanced ? 'block' : 'none';
}

function setVariableCostScenario(scenario) {
    const infraCostInput = document.getElementById('infraCostPerUser');
    const supportCostInput = document.getElementById('supportCostPerUser');
    
    if (!infraCostInput || !supportCostInput) {
        console.warn('Variable cost inputs not found');
        return;
    }
    
    switch(scenario) {
        case 'low':
            infraCostInput.value = '0.65';
            supportCostInput.value = '0.35';
            break;
        case 'medium':
            infraCostInput.value = '1.00';
            supportCostInput.value = '0.50';
            break;
        case 'high':
            infraCostInput.value = '1.35';
            supportCostInput.value = '0.65';
            break;
    }
    
    console.log(`Variable cost scenario set to ${scenario}:`);
    console.log(`Infrastructure: £${infraCostInput.value}/user, Support: £${supportCostInput.value}/user`);
    
    // Auto-calculate to show immediate impact
    if (typeof calculateProjections === 'function') {
        calculateProjections(false);
    }
}

function updateProjectionPeriod() {
    const period = document.getElementById('projectionPeriod')?.value;
    console.log('Projection period updated to:', period + ' months');
    // Don't auto-calculate to avoid user interruption
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NutriSnap Financial Forecast loading...');
    
    // Wait a moment for all scripts to load
    setTimeout(() => {
        // Check if all critical functions are available
        const requiredFunctions = [
            'calculateProjections',
            'saveScenario', 
            'displaySavedProjections',
            'updateSliderValue',
            'formatCurrency'
        ];
        
        const missing = requiredFunctions.filter(fn => typeof window[fn] !== 'function');
        
        if (missing.length > 0) {
            console.error('❌ Missing required functions:', missing);
            const statusEl = document.getElementById('calculationStatus');
            if (statusEl) {
                statusEl.textContent = `Error: Missing functions: ${missing.join(', ')}`;
                statusEl.style.color = '#ef4444';
            }
            return;
        }
        
        console.log('✅ All required functions loaded successfully');
        
        // Initialize UI elements
        updateAnnualPrice();
        displaySavedProjections(); // Show saved projections on load
        
        // Restore monthly detail settings and custom costs
        if (typeof restoreMonthlyDetailSettings === 'function') {
            restoreMonthlyDetailSettings();
        }
        
        // Test app functionality
        if (typeof testApp === 'function') {
            testApp();
        }
        
        // Add event listeners for slider updates AND calculations
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'range') {
                input.addEventListener('input', () => {
                    updateSliderValue(input);
                    // Auto-calculation disabled for performance. User will click the button.
                    // clearTimeout(window.calcTimeout);
                    // window.calcTimeout = setTimeout(() => calculateProjections(false), 300);
                });
            } else if (input.type === 'number' || input.tagName === 'SELECT') {
                input.addEventListener('change', () => {
                    // Auto-calculation disabled for performance. User will click the button.
                    // clearTimeout(window.calcTimeout);
                    // window.calcTimeout = setTimeout(() => calculateProjections(false), 300);
                });
            } else if (input.type === 'checkbox') {
                input.addEventListener('change', () => {
                    // Handle checkbox-specific logic but don't auto-calculate
                    if (input.id === 'enableTieredPricing') toggleTieredPricing();
                    if (input.id === 'enableCohortTracking') toggleCohortTracking();
                    if (input.id === 'enableVariableCosts') toggleVariableCosts();
                    if (input.id === 'enableMultipleRounds') toggleMultipleRounds();
                    
                    // Auto-calculation disabled for performance. User will click the button.
                    // clearTimeout(window.calcTimeout);
                    // window.calcTimeout = setTimeout(() => calculateProjections(false), 300);
                });
            }
        });
        
        // Also add specific listeners for annual price update triggers
        const annualPriceInputs = ['appPrice', 'annualDiscount', 'annualPlanPercentage'];
        annualPriceInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    updateAnnualPrice();
                });
            }
        });
        
        console.log('✅ App initialized with event listeners.');
        
        // Run initial calculation to show default values on first load
        setTimeout(() => {
            if (!sessionStorage.getItem('initialCalcDone')) {
                console.log('🚀 Running initial calculation on first load...');
                calculateProjections(false);
                sessionStorage.setItem('initialCalcDone', 'true');
            }
        }, 500);
        
    }, 200); // Give scripts time to load
});

// Initialize on page load (fallback)
window.onload = function() {
    updateAnnualPrice();
    // Re-enabled initial calculation is handled by DOMContentLoaded
}; 

// Global assignments moved to top of file for immediate availability

// Global variables for the monthly data and summary (declared in core.js)
// let globalMonthlyData = []; // Already declared in core.js
// globalSummaryData already declared in core.js

// Function to populate parameters summary
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
    `;
}

// Function to update cost breakdown
function updateCostBreakdown(costData) {
    // For now, this is a placeholder since the cost breakdown is more complex
    // The main calculations are handled in the core calculation logic
    console.log('📊 Cost breakdown updated:', costData);
}

// Function to update CAC breakdown
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

// Function to update Variable Costs breakdown
function updateVariableCostsBreakdown(variableCostData) {
    const setTxt = (id, text) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
        } else {
            console.warn(`Element with ID '${id}' not found for Variable Costs breakdown.`);
        }
    };

    const variableCostCard = document.getElementById('variableCostBreakdownCard');
    if (!variableCostData) {
        if (variableCostCard) variableCostCard.style.display = 'none';
        return;
    }

    if (variableCostCard) variableCostCard.style.display = 'block';

    setTxt('totalInfraCosts', formatCurrency(variableCostData.totalInfraCosts || 0));
    setTxt('totalSupportCosts', formatCurrency(variableCostData.totalSupportCosts || 0));
    setTxt('totalTransactionFees', formatCurrency(variableCostData.totalTransactionFees || 0));
    setTxt('totalVariableCostsDisplay', formatCurrency(variableCostData.totalVariableCosts || 0));
    setTxt('avgMonthlyVariableCosts', formatCurrency(variableCostData.avgMonthlyVariableCosts || 0));
    setTxt('variableCostPerUser', formatCurrency(variableCostData.variableCostPerUser || 0));
}

// Function to update Conversion Rate breakdown
function updateConversionRateBreakdown(conversionData) {
    const setTxt = (id, text) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
        } else {
            console.warn(`Element with ID '${id}' not found for Conversion Rate breakdown.`);
        }
    };

    if (!conversionData) return;

    setTxt('initialConversionDisplay', `${conversionData.initialConversion?.toFixed(1) || 0}%`);
    setTxt('finalConversionDisplay', `${conversionData.finalConversion?.toFixed(1) || 0}%`);
    setTxt('avgConversionDisplay', `${conversionData.avgConversion?.toFixed(1) || 0}%`);
    setTxt('conversionImprovementDisplay', `${conversionData.conversionImprovement?.toFixed(1) || 0}% annually`);
    setTxt('peakConversionDisplay', `${conversionData.peakConversion?.toFixed(1) || 0}% (Month ${conversionData.peakConversionMonth || 'N/A'})`);
}

// Function to update User Growth breakdown
function updateUserGrowthBreakdown(userGrowthData) {
    const setTxt = (id, text) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
        } else {
            console.warn(`Element with ID '${id}' not found for User Growth breakdown.`);
        }
    };

    if (!userGrowthData) return;

    setTxt('startingMAUDisplay', userGrowthData.startingMAU?.toLocaleString() || '0');
    setTxt('finalMAUDisplay', userGrowthData.finalMAU?.toLocaleString() || '0');
    setTxt('totalGrowthDisplay', `${userGrowthData.totalGrowthPercent?.toFixed(0) || 0}%`);
    setTxt('avgMonthlyGrowthDisplay', `${userGrowthData.avgMonthlyGrowth?.toFixed(1) || 0}%`);
    setTxt('finalPremiumUsersDisplay', userGrowthData.finalPremiumUsers?.toLocaleString() || '0');
    setTxt('premiumUserGrowthDisplay', `${userGrowthData.premiumUserGrowthPercent?.toFixed(0) || 0}%`);
}

// Function to update Team & Tech Costs breakdown
function updateTeamTechBreakdown(teamTechData) {
    const setTxt = (id, text) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
        } else {
            console.warn(`Element with ID '${id}' not found for Team & Tech breakdown.`);
        }
    };

    if (!teamTechData) return;

    setTxt('totalTeamCostsDisplay', formatCurrency(teamTechData.totalTeamCosts || 0));
    setTxt('totalTechCostsDisplay', formatCurrency(teamTechData.totalTechCosts || 0));
    setTxt('avgMonthlyTeamCostDisplay', formatCurrency(teamTechData.avgMonthlyTeamCost || 0));
    setTxt('avgMonthlyTechCostDisplay', formatCurrency(teamTechData.avgMonthlyTechCost || 0));
    setTxt('teamCostPerUserDisplay', formatCurrency(teamTechData.teamCostPerUser || 0));
    setTxt('techCostPerUserDisplay', formatCurrency(teamTechData.techCostPerUser || 0));
}

// Function to update Marketing Efficiency breakdown
function updateMarketingEfficiencyBreakdown(marketingData) {
    const setTxt = (id, text) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
        } else {
            console.warn(`Element with ID '${id}' not found for Marketing Efficiency breakdown.`);
        }
    };

    if (!marketingData) return;

    setTxt('totalMarketingSpendDisplay', formatCurrency(marketingData.totalMarketingSpend || 0));
    setTxt('avgMonthlyMarketingDisplay', formatCurrency(marketingData.avgMonthlyMarketing || 0));
    setTxt('marketingPerUserDisplay', formatCurrency(marketingData.marketingPerUser || 0));
    setTxt('marketingROIDisplay', `${marketingData.marketingROI?.toFixed(0) || 0}%`);
    setTxt('revenuePerMarketingDisplay', `£${marketingData.revenuePerMarketingPound?.toFixed(2) || 0}`);
    setTxt('marketingEfficiencyTrendDisplay', marketingData.marketingEfficiencyTrend || 'N/A');
}

// Make remaining functions globally available
window.updateSliderValue = updateSliderValue;
window.updateAnnualPrice = updateAnnualPrice;
window.updateProjectionPeriod = updateProjectionPeriod;
window.displayResults = displayResults;
window.updateMonthlyTable = updateMonthlyTable;
window.testBreakEvenHighlight = testBreakEvenHighlight;
window.populateParametersSummary = populateParametersSummary;
window.updateCostBreakdown = updateCostBreakdown;
window.updateCACBreakdown = updateCACBreakdown;
window.updateAdvancedAnalyticsVisibility = updateAdvancedAnalyticsVisibility;
window.setVariableCostScenario = setVariableCostScenario;
window.updateVariableCostsBreakdown = updateVariableCostsBreakdown;
window.updateConversionRateBreakdown = updateConversionRateBreakdown;
window.updateUserGrowthBreakdown = updateUserGrowthBreakdown;
window.updateTeamTechBreakdown = updateTeamTechBreakdown;
window.updateMarketingEfficiencyBreakdown = updateMarketingEfficiencyBreakdown;

console.log('✅ UI functions made globally available'); 