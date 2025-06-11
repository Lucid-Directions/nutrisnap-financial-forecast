// Scenario Management
// Handles quick scenario loading and presets

function loadScenario(scenario) {
    console.log(`Loading scenario: ${scenario}`);
    
    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = value;
            // Update slider display if it's a range input
            if (el.type === 'range') {
                updateSliderValue(el);
            }
        }
    };
    
    switch(scenario) {
        case 'conservative':
            // Lower growth, higher churn
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
            setVal('basicConversion', '15');
            setVal('proConversion', '6');
            setVal('enterpriseConversion', '1');
            setVal('teamCostY1', '3500');
            setVal('teamCostY2', '8000');
            setVal('teamCostY3', '18000');
            setVal('marketingCostY1', '800');
            setVal('marketingCostY2', '2500');
            setVal('marketingCostY3', '5000');
            break;
            
        case 'realistic':
            // Balanced assumptions
            setVal('appPrice', '9.99');
            setVal('startingMAU', '1000');
            setVal('year1Growth', '16');
            setVal('year2Growth', '12');
            setVal('year3Growth', '8');
            setVal('initialConversion', '2.5');
            setVal('conversionGrowth', '20');
            setVal('paidChurnRate', '5');
            setVal('freeChurnRate', '20');
            // Set tiered pricing conversion rates
            setVal('basicConversion', '20');
            setVal('proConversion', '8');
            setVal('enterpriseConversion', '2');
            setVal('teamCostY1', '4500');
            setVal('teamCostY2', '12000');
            setVal('teamCostY3', '25000');
            setVal('marketingCostY1', '1200');
            setVal('marketingCostY2', '3500');
            setVal('marketingCostY3', '8000');
            break;
            
        case 'optimistic':
            // Higher growth, lower churn
            setVal('appPrice', '12.99');
            setVal('startingMAU', '2000');
            setVal('year1Growth', '22');
            setVal('year2Growth', '18');
            setVal('year3Growth', '12');
            setVal('initialConversion', '4');
            setVal('conversionGrowth', '35');
            setVal('paidChurnRate', '3');
            setVal('freeChurnRate', '15');
            // Set tiered pricing conversion rates
            setVal('basicConversion', '25');
            setVal('proConversion', '12');
            setVal('enterpriseConversion', '3');
            setVal('teamCostY1', '6000');
            setVal('teamCostY2', '15000');
            setVal('teamCostY3', '35000');
            setVal('marketingCostY1', '2000');
            setVal('marketingCostY2', '5000');
            setVal('marketingCostY3', '12000');
            break;
            
        case 'investor':
            // Aggressive but achievable for fundraising
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
            setVal('basicConversion', '20');
            setVal('proConversion', '10');
            setVal('enterpriseConversion', '2');
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
            break;
    }
    
    updateAnnualPrice();
    // Don't auto-calculate to avoid user interruption
    
    console.log(`👍 Loaded '${scenario}' scenario.`);
}

// Save/Load Projection Functionality
function saveCurrentProjection() {
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
}

function loadProjection(name) {
    const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
    const projection = savedProjections[name];
    
    if (!projection) {
        alert('Projection not found!');
        return;
    }
    
    console.log(`📋 Loading projection "${name}"...`);
    
    // First, load all form values
    Object.keys(projection.data).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = projection.data[id];
            } else {
                input.value = projection.data[id];
            }
        }
    });
    
    // Force update all slider displays with proper delay to ensure DOM is ready
    setTimeout(() => {
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            if (slider.id && projection.data[slider.id] !== undefined) {
                // Ensure the slider value is set correctly
                slider.value = projection.data[slider.id];
                // Force update the display
                updateSliderValue(slider);
                console.log(`🎛️ Restored slider: ${slider.id} = ${slider.value}`);
            }
        });
    }, 100);
    
    // Trigger toggle functions for checkboxes to show/hide sections with delay
    setTimeout(() => {
        const toggleFunctions = [
            { id: 'enableTieredPricing', func: () => toggleTieredPricing() },
            { id: 'enableCohortTracking', func: () => toggleCohortTracking() },
            { id: 'enableVariableCosts', func: () => toggleVariableCosts() },
            { id: 'enableMultipleRounds', func: () => toggleMultipleRounds() },
            { id: 'enableEnterpriseTier', func: () => toggleEnterpriseTier() },
            { id: 'enableMonthlyTeamCosts', func: () => toggleMonthlyTeamCosts() },
            { id: 'enableMonthlyTechCosts', func: () => toggleMonthlyTechCosts() },
            { id: 'enableMonthlyMarketingCosts', func: () => toggleMonthlyMarketingCosts() }
        ];
        
        toggleFunctions.forEach(({ id, func }) => {
            const element = document.getElementById(id);
            if (element && projection.data[id] !== undefined) {
                try {
                    if (typeof func === 'function') {
                        func();
                    } else if (typeof window[func] === 'function') {
                        window[func]();
                    }
                } catch (error) {
                    console.warn(`Warning: Could not trigger ${id} toggle function:`, error);
                }
            }
        });
    }, 150);
    
    // Update annual price calculation with delay
    setTimeout(() => {
        if (typeof updateAnnualPrice === 'function') {
            updateAnnualPrice();
        } else if (typeof window.updateAnnualPrice === 'function') {
            window.updateAnnualPrice();
        }
    }, 200);
    
    // Update advanced analytics visibility with delay
    setTimeout(() => {
        if (typeof updateAdvancedAnalyticsVisibility === 'function') {
            updateAdvancedAnalyticsVisibility();
        } else if (typeof window.updateAdvancedAnalyticsVisibility === 'function') {
            window.updateAdvancedAnalyticsVisibility();
        }
    }, 250);
    
    // Initialize tier sliders if tiered pricing is enabled
    setTimeout(() => {
        if (projection.data.enableTieredPricing && typeof initializeTierSliders === 'function') {
            initializeTierSliders();
        }
    }, 300);
    
    // Restore monthly detail settings if available
    setTimeout(() => {
        if (typeof restoreMonthlyDetailSettings === 'function') {
            restoreMonthlyDetailSettings();
        }
    }, 350);
    
    // Update projection period display
    setTimeout(() => {
        if (typeof updateProjectionPeriod === 'function') {
            updateProjectionPeriod();
        }
    }, 400);
    
    // Clear any previous results to avoid confusion
    const outputSection = document.getElementById('outputSection');
    if (outputSection) {
        outputSection.style.display = 'none';
    }
    
    console.log(`✅ Projection "${name}" loaded successfully with all UI updates`);
    alert(`Projection "${name}" loaded successfully! All sliders and settings have been restored. Click "Calculate Projections" to see updated results.`);
}

function deleteProjection(name) {
    if (!confirm(`Are you sure you want to delete projection "${name}"?`)) {
        return;
    }
    
    const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
    delete savedProjections[name];
    localStorage.setItem('nutriSnapProjections', JSON.stringify(savedProjections));
    
    displaySavedProjections();
    alert(`Projection "${name}" deleted.`);
}

function renameProjection(oldName) {
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
    const container = document.getElementById('savedScenarios');
    if (!container) return;
    
    const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
    const projectionNames = Object.keys(savedProjections);
    
    if (projectionNames.length === 0) {
        container.innerHTML = '<p style="color: #999; font-size: 0.9rem;">No saved projections</p>';
        return;
    }
    
    container.innerHTML = projectionNames.map(name => `
        <div style="background: #1a1a1a; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 3px solid #667eea;">
            <div style="display: flex; justify-content: between; align-items: center; gap: 10px;">
                <div style="flex: 1;">
                    <strong style="color: #fff;">${name}</strong><br>
                    <small style="color: #999;">${savedProjections[name].description}</small>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="loadProjection('${name}')" style="background: #10b981; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Load</button>
                    <button onclick="deleteProjection('${name}')" style="background: #ef4444; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
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