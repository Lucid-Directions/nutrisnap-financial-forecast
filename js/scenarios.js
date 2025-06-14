// Scenario Management
// Handles quick scenario loading and presets

function loadScenario(scenario) {
    console.log(`Loading scenario: ${scenario}`);
    
    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'range') {
                // For sliders, convert actual value to normalized position (0-100)
                if (typeof getSliderNormalizedValue === 'function') {
                    const normalizedValue = getSliderNormalizedValue(id, value);
                    el.value = normalizedValue;
                } else {
                    // Fallback for direct percentage values
                    el.value = value;
                }
                // Update slider display
                if (typeof updateSliderValue === 'function') {
                    updateSliderValue(el);
                }
            } else {
                el.value = value;
            }
        }
    };
    
    switch(scenario) {
        case 'conservative':
            // Lower growth, higher churn
            document.getElementById('enableTieredPricing').checked = false;
            setVal('appPrice', '7.99');
            setVal('startingMAU', '500');
            setVal('year1Growth', '12');
            setVal('year2Growth', '8');
            setVal('year3Growth', '5');
            setVal('initialConversion', '1.5');
            setVal('conversionGrowth', '10');
            setVal('paidChurnRate', '8');
            setVal('freeChurnRate', '25');
            // Set tiered pricing conversion rates
            setVal('basicConversion', '1.5');
            setVal('proConversion', '0.6');
            setVal('enterpriseConversion', '0.1');
            setVal('teamCostY1', '3500');
            setVal('teamCostY2', '8000');
            setVal('teamCostY3', '18000');
            setVal('marketingCostY1', '800');
            setVal('marketingCostY2', '2500');
            setVal('marketingCostY3', '5000');
            // Advertising parameters - Conservative (Banner only)
            setVal('adRevenueStartMonth', '8');
            document.getElementById('enableAdvertisingRevenue').checked = true;
            document.getElementById('enableBannerAds').checked = true;
            document.getElementById('enableInterstitialAds').checked = false;
            document.getElementById('enableRewardedAds').checked = false;
            setVal('bannerECPM', '2.00');
            setVal('bannerImpressions', '20');
            setVal('adRevenueGrowth', '8');
            break;
            
        case 'realistic':
            // Balanced assumptions
            document.getElementById('enableTieredPricing').checked = false;
            setVal('appPrice', '9.99');
            setVal('startingMAU', '1000');
            setVal('year1Growth', '16');
            setVal('year2Growth', '12');
            setVal('year3Growth', '8');
            setVal('initialConversion', '2.0');
            setVal('conversionGrowth', '20');
            setVal('paidChurnRate', '5');
            setVal('freeChurnRate', '20');
            // Set tiered pricing conversion rates
            setVal('basicConversion', '2');
            setVal('proConversion', '0.8');
            setVal('enterpriseConversion', '0.2');
            setVal('teamCostY1', '4500');
            setVal('teamCostY2', '12000');
            setVal('teamCostY3', '25000');
            setVal('marketingCostY1', '1200');
            setVal('marketingCostY2', '3500');
            setVal('marketingCostY3', '8000');
            // Advertising parameters - Balanced (Banner + Interstitial)
            setVal('adRevenueStartMonth', '6');
            document.getElementById('enableAdvertisingRevenue').checked = true;
            document.getElementById('enableBannerAds').checked = true;
            document.getElementById('enableInterstitialAds').checked = true;
            document.getElementById('enableRewardedAds').checked = false;
            setVal('bannerECPM', '2.50');
            setVal('bannerImpressions', '18');
            setVal('interstitialECPM', '8.00');
            setVal('interstitialImpressions', '4');
            setVal('adRevenueGrowth', '10');
            break;
            
        case 'optimistic':
            // Higher growth, lower churn
            document.getElementById('enableTieredPricing').checked = false;
            setVal('appPrice', '12.99');
            setVal('startingMAU', '2000');
            setVal('year1Growth', '22');
            setVal('year2Growth', '18');
            setVal('year3Growth', '12');
            setVal('initialConversion', '2.8');
            setVal('conversionGrowth', '35');
            setVal('paidChurnRate', '3');
            setVal('freeChurnRate', '15');
            // Set tiered pricing conversion rates
            setVal('basicConversion', '2.5');
            setVal('proConversion', '1.2');
            setVal('enterpriseConversion', '0.3');
            setVal('teamCostY1', '6000');
            setVal('teamCostY2', '15000');
            setVal('teamCostY3', '35000');
            setVal('marketingCostY1', '2000');
            setVal('marketingCostY2', '5000');
            setVal('marketingCostY3', '12000');
            // Advertising parameters - Aggressive (All types)
            setVal('adRevenueStartMonth', '4');
            document.getElementById('enableAdvertisingRevenue').checked = true;
            document.getElementById('enableBannerAds').checked = true;
            document.getElementById('enableInterstitialAds').checked = true;
            document.getElementById('enableRewardedAds').checked = true;
            setVal('bannerECPM', '3.00');
            setVal('bannerImpressions', '15');
            setVal('interstitialECPM', '12.00');
            setVal('interstitialImpressions', '6');
            setVal('rewardedECPM', '25.00');
            setVal('rewardedImpressions', '2');
            setVal('adRevenueGrowth', '15');
            break;
            
        case 'investor':
            // Aggressive but achievable for fundraising
            document.getElementById('enableTieredPricing').checked = false;
            setVal('appPrice', '14.99');
            setVal('startingMAU', '1500');
            setVal('year1Growth', '25');
            setVal('year2Growth', '20');
            setVal('year3Growth', '15');
            setVal('initialConversion', '3.5');
            setVal('conversionGrowth', '30');
            setVal('paidChurnRate', '3.5');
            setVal('freeChurnRate', '18');
            // Set tiered pricing conversion rates  
            setVal('basicConversion', '2');
            setVal('proConversion', '1');
            setVal('enterpriseConversion', '0.2');
            setVal('b2bStartMonth', '4');
            setVal('b2bPercentage', '35');
            setVal('teamCostY1', '8000');
            setVal('teamCostY2', '20000');
            setVal('teamCostY3', '45000');
            setVal('marketingCostY1', '3000');
            setVal('marketingCostY2', '8000');
            setVal('marketingCostY3', '18000');
            setVal('seedInvestment', '500000');
            setVal('equityOffered', '15');
            setVal('valuationMultiple', '6.5');
            // Advertising parameters - Premium (Interstitial + Rewarded)
            setVal('adRevenueStartMonth', '3');
            document.getElementById('enableBannerAds').checked = false;
            document.getElementById('enableInterstitialAds').checked = true;
            document.getElementById('enableRewardedAds').checked = true;
            setVal('interstitialECPM', '15.00');
            setVal('interstitialImpressions', '5');
            setVal('rewardedECPM', '35.00');
            setVal('rewardedImpressions', '2');
            setVal('adRevenueGrowth', '20');
            // Enable advertising for investor scenario
            const enableAdvertisingCheckbox = document.getElementById('enableAdvertisingRevenue');
            if (enableAdvertisingCheckbox) {
                enableAdvertisingCheckbox.checked = true;
                toggleAdvertisingRevenue();
            }
            break;
    }
    
    // Toggle visibility of sections based on loaded scenario data
    if (typeof toggleAdvertisingRevenue === 'function') toggleAdvertisingRevenue();
    if (typeof toggleTieredPricing === 'function') toggleTieredPricing();
    if (typeof toggleVariableCosts === 'function') toggleVariableCosts();

    // Force-disable tiered pricing to ensure single-tier model is the default, which now has correct logic
    const tieredPricingCheckbox = document.getElementById('enableTieredPricing');
    if (tieredPricingCheckbox) {
        tieredPricingCheckbox.checked = false;
        if (typeof toggleTieredPricing === 'function') {
            toggleTieredPricing();
        }
    }
    
    updateAnnualPrice();
    // Don't auto-calculate to avoid user interruption
    
    console.log(`👍 Loaded '${scenario}' scenario.`);
    // Manually trigger a recalculation after loading a scenario so user sees the result
    setTimeout(() => {
        if(typeof calculateProjections === 'function') {
            calculateProjections(true);
        }
    }, 100);
}

// Save/Load Projection Functionality
function saveCurrentProjection() {
    try {
        const nameInput = document.getElementById('saveProjectionName');
        const projectionName = nameInput?.value?.trim();
        
        if (!projectionName) {
            alert('Please enter a name for your projection.');
            return;
        }
        
        // Collect all current form values
        const formData = {};
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.id && input.type !== 'button' && input.type !== 'submit') {
                if (input.type === 'checkbox') {
                    formData[input.id] = input.checked;
                } else {
                    formData[input.id] = input.value;
                }
            }
        });
        
        // Get saved projections from localStorage
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        
        // Save current projection
        savedProjections[projectionName] = {
            data: formData,
            timestamp: new Date().toISOString(),
            description: `Saved ${new Date().toLocaleDateString()}`
        };
        
        localStorage.setItem('nutriSnapProjections', JSON.stringify(savedProjections));
        nameInput.value = '';
        
        displaySavedProjections();
        alert(`Projection "${projectionName}" saved successfully!`);
        
    } catch (error) {
        console.error('❌ Error saving projection:', error);
        alert(`Error saving projection: ${error.message}\n\nPlease try again or check browser storage limits.`);
    }
}

function loadProjection(name) {
    try {
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        const projection = savedProjections[name];
        
        if (!projection || !projection.data) {
            alert('Projection not found or corrupted!');
            return;
        }
        
        console.log(`📋 Loading projection "${name}"...`);
        
        // First, load all form values with error handling
        Object.keys(projection.data).forEach(id => {
            try {
                const input = document.getElementById(id);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = projection.data[id];
                    } else {
                        input.value = projection.data[id];
                    }
                }
            } catch (error) {
                console.warn(`Warning: Could not restore value for ${id}:`, error);
            }
        });
        
        // Update all slider displays with error handling
        setTimeout(() => {
            try {
                const sliders = document.querySelectorAll('input[type="range"]');
                sliders.forEach(slider => {
                    if (slider.id && projection.data[slider.id] !== undefined) {
                        try {
                            slider.value = projection.data[slider.id];
                            if (typeof updateSliderValue === 'function') {
                                updateSliderValue(slider);
                            } else if (typeof window.updateSliderValue === 'function') {
                                window.updateSliderValue(slider);
                            }
                            console.log(`🎛️ Restored slider: ${slider.id} = ${slider.value}`);
                        } catch (error) {
                            console.warn(`Warning: Could not update slider ${slider.id}:`, error);
                        }
                    }
                });
            } catch (error) {
                console.warn('Warning: Error updating sliders:', error);
            }
        }, 100);
        
        // Trigger toggle functions with comprehensive error handling
        setTimeout(() => {
            const toggleFunctions = [
                { id: 'enableTieredPricing', funcName: 'toggleTieredPricing' },
                { id: 'enableCohortTracking', funcName: 'toggleCohortTracking' },
                { id: 'enableVariableCosts', funcName: 'toggleVariableCosts' },
                { id: 'enableMultipleRounds', funcName: 'toggleMultipleRounds' },
                { id: 'enableEnterpriseTier', funcName: 'toggleEnterpriseTier' },
                { id: 'enableAdvertisingRevenue', funcName: 'toggleAdvertisingRevenue' },
                { id: 'enableMonthlyTeamCosts', funcName: 'toggleMonthlyTeamCosts' },
                { id: 'enableMonthlyTechCosts', funcName: 'toggleMonthlyTechCosts' },
                { id: 'enableMonthlyMarketingCosts', funcName: 'toggleMonthlyMarketingCosts' }
            ];
            
            toggleFunctions.forEach(({ id, funcName }) => {
                const element = document.getElementById(id);
                if (element && projection.data[id] !== undefined) {
                    try {
                        if (typeof window[funcName] === 'function') {
                            window[funcName]();
                        }
                    } catch (error) {
                        console.warn(`Warning: Could not trigger ${funcName}:`, error);
                    }
                }
            });
        }, 150);
        
        // Update other functions with error handling
        setTimeout(() => {
            try {
                if (typeof window.updateAnnualPrice === 'function') {
                    window.updateAnnualPrice();
                }
            } catch (error) {
                console.warn('Warning: Could not update annual price:', error);
            }
        }, 200);
        
        setTimeout(() => {
            try {
                if (typeof window.updateAdvancedAnalyticsVisibility === 'function') {
                    window.updateAdvancedAnalyticsVisibility();
                }
            } catch (error) {
                console.warn('Warning: Could not update advanced analytics visibility:', error);
            }
        }, 250);
        
        setTimeout(() => {
            try {
                if (projection.data.enableTieredPricing && typeof window.initializeTierSliders === 'function') {
                    window.initializeTierSliders();
                }
            } catch (error) {
                console.warn('Warning: Could not initialize tier sliders:', error);
            }
        }, 300);
        
        setTimeout(() => {
            try {
                if (typeof window.restoreMonthlyDetailSettings === 'function') {
                    window.restoreMonthlyDetailSettings();
                }
            } catch (error) {
                console.warn('Warning: Could not restore monthly detail settings:', error);
            }
        }, 350);
        
        setTimeout(() => {
            try {
                if (typeof window.updateProjectionPeriod === 'function') {
                    window.updateProjectionPeriod();
                }
            } catch (error) {
                console.warn('Warning: Could not update projection period:', error);
            }
        }, 400);
        
        // Clear any previous results to avoid confusion
        const outputSection = document.getElementById('outputSection');
        if (outputSection) {
            outputSection.style.display = 'none';
        }
        
        console.log(`✅ Projection "${name}" loaded successfully with all UI updates`);
        alert(`Projection "${name}" loaded successfully! All sliders and settings have been restored. Click "Calculate Projections" to see updated results.`);
        
    } catch (error) {
        console.error('❌ Error loading projection:', error);
        alert(`Error loading projection "${name}": ${error.message}\n\nThe projection data may be corrupted. Please try a different projection or create a new one.`);
    }
}

function deleteProjection(name) {
    try {
        if (!confirm(`Are you sure you want to delete projection "${name}"?`)) {
            return;
        }
        
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        delete savedProjections[name];
        localStorage.setItem('nutriSnapProjections', JSON.stringify(savedProjections));
        
        displaySavedProjections();
        alert(`Projection "${name}" deleted.`);
        
    } catch (error) {
        console.error('❌ Error deleting projection:', error);
        alert(`Error deleting projection "${name}": ${error.message}`);
    }
}

function renameProjection(oldName) {
    try {
        const newName = prompt(`Enter new name for "${oldName}":`, oldName);
        if (!newName || newName === oldName) {
            return;
        }
        
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        if (savedProjections[newName]) {
            alert('A projection with that name already exists!');
            return;
        }
        
        savedProjections[newName] = savedProjections[oldName];
        delete savedProjections[oldName];
        localStorage.setItem('nutriSnapProjections', JSON.stringify(savedProjections));
        
        displaySavedProjections();
        alert(`Projection renamed to "${newName}".`);
        
    } catch (error) {
        console.error('❌ Error renaming projection:', error);
        alert(`Error renaming projection "${oldName}": ${error.message}`);
    }
}

function saveScenario() {
    const nameInput = document.getElementById('projectionName');
    const projectionName = nameInput?.value?.trim();
    
    if (!projectionName) {
        alert('Please enter a name for your projection.');
        return;
    }
    
    // Collect all current form values
    const formData = {};
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.id && input.type !== 'button' && input.type !== 'submit') {
            if (input.type === 'checkbox') {
                formData[input.id] = input.checked;
            } else {
                formData[input.id] = input.value;
            }
        }
    });
    
    // Get saved projections from localStorage
    const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
    
    // Save current projection
    savedProjections[projectionName] = {
        data: formData,
        timestamp: new Date().toISOString(),
        description: `Saved ${new Date().toLocaleDateString()}`
    };
    
    localStorage.setItem('nutriSnapProjections', JSON.stringify(savedProjections));
    nameInput.value = '';
    
    displaySavedProjections();
    alert(`Projection "${projectionName}" saved successfully!`);
}

function displaySavedProjections() {
    try {
        const container = document.getElementById('savedScenarios');
        if (!container) return;
        
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        const projectionNames = Object.keys(savedProjections);
        
        if (projectionNames.length === 0) {
            container.innerHTML = '<p style="color: #999; font-size: 0.9rem;">No saved projections</p>';
            return;
        }
        
        container.innerHTML = projectionNames.map(name => {
            const projection = savedProjections[name];
            const description = projection?.description || 'No description';
            return `
                <div style="background: #1a1a1a; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 3px solid #667eea;">
                    <div style="display: flex; justify-content: between; align-items: center; gap: 10px;">
                        <div style="flex: 1;">
                            <strong style="color: #fff;">${name}</strong><br>
                            <small style="color: #999;">${description}</small>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button onclick="loadProjection('${name}')" style="background: #10b981; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Load</button>
                            <button onclick="deleteProjection('${name}')" style="background: #ef4444; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('❌ Error displaying saved projections:', error);
        const container = document.getElementById('savedScenarios');
        if (container) {
            container.innerHTML = '<p style="color: #ef4444; font-size: 0.9rem;">Error loading saved projections. Please check console.</p>';
        }
    }
}

// Make functions globally available
window.saveCurrentProjection = saveCurrentProjection;
window.saveScenario = saveScenario;
window.displaySavedProjections = displaySavedProjections;
window.loadProjection = loadProjection;
window.deleteProjection = deleteProjection;
window.renameProjection = renameProjection;
window.loadScenario = loadScenario;

// Initialize saved projections display on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        displaySavedProjections();
    }, 100); // Small delay to ensure DOM is ready
});