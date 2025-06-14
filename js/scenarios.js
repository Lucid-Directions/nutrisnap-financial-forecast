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

// Enhanced Save/Load Projection Functionality with Persistent Storage
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
        
        // Create comprehensive projection data
        const projectionData = {
            name: projectionName,
            data: formData,
            timestamp: new Date().toISOString(),
            description: `Saved ${new Date().toLocaleDateString()}`,
            version: '2.0',
            metadata: {
                userAgent: navigator.userAgent,
                savedFrom: window.location.href,
                projectionPeriod: formData.projectionPeriod || 36,
                tiersCount: document.querySelectorAll('#dynamicTierContainer .tier-input-group').length
            }
        };
        
        // Save to multiple storage methods for persistence
        saveToLocalStorage(projectionName, projectionData);
        saveToIndexedDB(projectionName, projectionData);
        
        // Also create downloadable backup
        createProjectionBackup(projectionData);
        
        nameInput.value = '';
        displaySavedProjections();
        alert(`Projection "${projectionName}" saved successfully!\n\nSaved to multiple storage locations for persistence.\nA backup file has also been created for download.`);
        
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
        
        // Check version compatibility and migrate if needed
        const projectionVersion = projection.version || '1.0';
        console.log(`📋 Loading projection "${name}" (version ${projectionVersion})...`);
        
        // Migration for older projections (if needed in the future)
        if (projectionVersion === '1.0') {
            console.log('🔄 Migrating v1.0 projection to current format...');
            // Add any migration logic here if needed
        }
        
        // First, load all form values with error handling and backwards compatibility
        Object.keys(projection.data).forEach(id => {
            try {
                const input = document.getElementById(id);
                if (input) {
                    const value = projection.data[id];
                    
                    // Handle different input types safely
                    if (input.type === 'checkbox') {
                        input.checked = Boolean(value);
                    } else if (input.type === 'number') {
                        // Ensure numeric values are valid
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                            input.value = numValue;
                        }
                    } else if (input.type === 'range') {
                        // Handle slider values carefully
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                            input.value = numValue;
                        }
                    } else {
                        // Handle text, select, and other inputs
                        input.value = value;
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
        if (!container) {
            console.warn('⚠️ savedScenarios container not found');
            return;
        }
        
        // Get projections from localStorage (immediate display)
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        const projectionNames = Object.keys(savedProjections);
        
        console.log(`📊 Found ${projectionNames.length} saved projections:`, projectionNames);
        
        if (projectionNames.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #999; font-style: italic;">
                    <p style="margin: 0 0 10px 0;">No saved projections yet</p>
                    <small style="color: #666;">Create your first projection and save it above!</small>
                </div>
            `;
            return;
        }
        
        // Sort projections by timestamp (newest first)
        const sortedProjections = projectionNames
            .map(name => ({ name, ...savedProjections[name] }))
            .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        
        // Build the HTML
        let html = `
            <div style="background: #0f0f0f; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #333; text-align: center;">
                <small style="color: #667eea; font-weight: 600;">
                    📊 ${projectionNames.length} saved projection${projectionNames.length !== 1 ? 's' : ''} available
                </small>
            </div>
        `;
        
        html += sortedProjections.map(projection => {
            const name = projection.name;
            const description = projection.description || 'No description';
            const timestamp = projection.timestamp ? new Date(projection.timestamp).toLocaleDateString() : 'Unknown date';
            const version = projection.version || '1.0';
            const tiersCount = projection.metadata?.tiersCount || 'Unknown';
            
            return `
                <div style="background: #1a1a1a; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #667eea; transition: all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="color: #fff; font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">${name}</div>
                            <div style="color: #9ca3af; font-size: 0.8rem; margin-bottom: 6px;">${description}</div>
                            <div style="display: flex; gap: 12px; font-size: 0.75rem; color: #666;">
                                <span>📅 ${timestamp}</span>
                                <span>🎯 ${tiersCount} tiers</span>
                                <span>🔧 v${version}</span>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; min-width: 80px;">
                            <button onclick="loadProjection('${name}')" style="background: #10b981; color: #fff; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.2s ease;">
                                📂 Load
                            </button>
                            <button onclick="exportSingleProjection('${name}')" style="background: #f59e0b; color: #fff; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.2s ease;">
                                💾 Export
                            </button>
                            <button onclick="deleteProjection('${name}')" style="background: #ef4444; color: #fff; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.2s ease;">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        console.log('✅ Saved projections displayed successfully');
        
    } catch (error) {
        console.error('❌ Error displaying saved projections:', error);
        const container = document.getElementById('savedScenarios');
        if (container) {
            container.innerHTML = `
                <div style="background: #2a1a1a; border: 1px solid #ef4444; border-radius: 6px; padding: 12px; color: #ef4444;">
                    <strong>⚠️ Error loading saved projections</strong><br>
                    <small style="color: #999;">Please check browser console for details.</small>
                </div>
            `;
        }
    }
}

// Enhanced storage functions
function saveToLocalStorage(name, data) {
    try {
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        savedProjections[name] = data;
        localStorage.setItem('nutriSnapProjections', JSON.stringify(savedProjections));
        console.log(`✅ Saved "${name}" to localStorage`);
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

function saveToIndexedDB(name, data) {
    try {
        // Open IndexedDB
        const request = indexedDB.open('NutriSnapProjections', 1);
        
        request.onerror = () => {
            console.warn('⚠️ IndexedDB not available, using localStorage only');
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('projections')) {
                db.createObjectStore('projections', { keyPath: 'name' });
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['projections'], 'readwrite');
            const store = transaction.objectStore('projections');
            
            store.put(data);
            
            transaction.oncomplete = () => {
                console.log(`✅ Saved "${name}" to IndexedDB`);
            };
            
            transaction.onerror = (error) => {
                console.warn('⚠️ Error saving to IndexedDB:', error);
            };
        };
    } catch (error) {
        console.warn('⚠️ IndexedDB not supported:', error);
    }
}

function createProjectionBackup(data) {
    try {
        // Create a comprehensive backup file
        const backupData = {
            exportType: 'NutriSnap Financial Projection Backup',
            exportDate: new Date().toISOString(),
            version: '2.0',
            projection: data,
            instructions: {
                howToRestore: 'Use the "Import Projection" feature in NutriSnap Financial Forecast',
                compatibility: 'Compatible with NutriSnap Financial Forecast v2.0+',
                format: 'JSON'
            }
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `nutrisnap-projection-${data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        
        // Automatically download the backup
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`📥 Created backup file for projection "${data.name}"`);
    } catch (error) {
        console.warn('⚠️ Error creating backup file:', error);
    }
}

function loadFromIndexedDB(name, callback) {
    try {
        const request = indexedDB.open('NutriSnapProjections', 1);
        
        request.onerror = () => {
            callback(null);
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['projections'], 'readonly');
            const store = transaction.objectStore('projections');
            const getRequest = store.get(name);
            
            getRequest.onsuccess = () => {
                callback(getRequest.result);
            };
            
            getRequest.onerror = () => {
                callback(null);
            };
        };
    } catch (error) {
        callback(null);
    }
}

function getAllProjectionsFromIndexedDB(callback) {
    try {
        const request = indexedDB.open('NutriSnapProjections', 1);
        
        request.onerror = () => {
            callback({});
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['projections'], 'readonly');
            const store = transaction.objectStore('projections');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                const projections = {};
                getAllRequest.result.forEach(proj => {
                    projections[proj.name] = proj;
                });
                callback(projections);
            };
            
            getAllRequest.onerror = () => {
                callback({});
            };
        };
    } catch (error) {
        callback({});
    }
}

function importProjectionFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate import format
                if (!importData.projection || !importData.projection.name || !importData.projection.data) {
                    alert('Invalid backup file format. Please select a valid NutriSnap projection backup file.');
                    return;
                }
                
                const projectionName = importData.projection.name;
                
                // Check if projection already exists
                const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
                if (savedProjections[projectionName]) {
                    if (!confirm(`A projection named "${projectionName}" already exists. Do you want to overwrite it?`)) {
                        return;
                    }
                }
                
                // Save imported projection
                saveToLocalStorage(projectionName, importData.projection);
                saveToIndexedDB(projectionName, importData.projection);
                
                displaySavedProjections();
                alert(`Projection "${projectionName}" imported successfully!\n\nYou can now load it from your saved projections.`);
                
            } catch (error) {
                console.error('❌ Error importing projection:', error);
                alert('Error importing projection file. Please check that the file is a valid NutriSnap projection backup.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function exportSingleProjection(name) {
    try {
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        const projection = savedProjections[name];
        
        if (!projection) {
            alert(`Projection "${name}" not found.`);
            return;
        }
        
        createProjectionBackup(projection);
        console.log(`📥 Exported single projection: ${name}`);
        
    } catch (error) {
        console.error('❌ Error exporting single projection:', error);
        alert(`Error exporting projection "${name}". Please try again.`);
    }
}

function exportAllProjections() {
    try {
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        
        if (Object.keys(savedProjections).length === 0) {
            alert('No saved projections to export.');
            return;
        }
        
        const exportData = {
            exportType: 'NutriSnap Financial Projections Backup Collection',
            exportDate: new Date().toISOString(),
            version: '2.0',
            totalProjections: Object.keys(savedProjections).length,
            projections: savedProjections,
            instructions: {
                howToRestore: 'Use the "Import All Projections" feature in NutriSnap Financial Forecast',
                compatibility: 'Compatible with NutriSnap Financial Forecast v2.0+',
                format: 'JSON Collection'
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `nutrisnap-all-projections-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`📥 Exported ${Object.keys(savedProjections).length} projections`);
        alert(`Successfully exported ${Object.keys(savedProjections).length} projections to a backup file.`);
        
    } catch (error) {
        console.error('❌ Error exporting all projections:', error);
        alert('Error exporting projections. Please try again.');
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
window.importProjectionFromFile = importProjectionFromFile;
window.exportAllProjections = exportAllProjections;
window.exportSingleProjection = exportSingleProjection;
window.saveToLocalStorage = saveToLocalStorage;
window.saveToIndexedDB = saveToIndexedDB;
window.createProjectionBackup = createProjectionBackup;

// Debug function to force refresh saved projections list
window.refreshSavedProjections = function() {
    console.log('🔄 Manually refreshing saved projections...');
    displaySavedProjections();
};

// Automatic backup system
function createAutomaticBackup() {
    try {
        const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
        const projectionCount = Object.keys(savedProjections).length;
        
        if (projectionCount > 0) {
            // Store a timestamped backup
            const backupKey = `nutriSnapProjections_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(savedProjections));
            console.log(`🔄 Automatic backup created: ${projectionCount} projections backed up`);
            
            // Keep only the last 5 backups to avoid storage bloat
            const allKeys = Object.keys(localStorage).filter(key => key.startsWith('nutriSnapProjections_backup_'));
            if (allKeys.length > 5) {
                const sortedKeys = allKeys.sort();
                const keysToRemove = sortedKeys.slice(0, -5);
                keysToRemove.forEach(key => localStorage.removeItem(key));
                console.log(`🧹 Cleaned up ${keysToRemove.length} old backups`);
            }
        }
    } catch (error) {
        console.warn('⚠️ Could not create automatic backup:', error);
    }
}

// Function to restore from backup if needed
function restoreFromBackup() {
    try {
        const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('nutriSnapProjections_backup_'));
        
        if (backupKeys.length === 0) {
            alert('No backups found.');
            return;
        }
        
        // Get the most recent backup
        const latestBackupKey = backupKeys.sort().pop();
        const backupData = JSON.parse(localStorage.getItem(latestBackupKey) || '{}');
        const projectionCount = Object.keys(backupData).length;
        
        if (projectionCount > 0) {
            if (confirm(`Found a backup with ${projectionCount} projections from ${new Date(parseInt(latestBackupKey.split('_').pop())).toLocaleString()}.\n\nRestore this backup? This will overwrite current projections.`)) {
                localStorage.setItem('nutriSnapProjections', JSON.stringify(backupData));
                displaySavedProjections();
                alert(`Successfully restored ${projectionCount} projections from backup!`);
            }
        } else {
            alert('Backup found but contains no projections.');
        }
    } catch (error) {
        console.error('❌ Error restoring from backup:', error);
        alert('Error restoring from backup: ' + error.message);
    }
}

// Initialize saved projections display on page load
document.addEventListener('DOMContentLoaded', function() {
    // Create automatic backup first
    createAutomaticBackup();
    
    setTimeout(() => {
        displaySavedProjections();
    }, 100); // Small delay to ensure DOM is ready
});

// Make backup functions globally available
window.createAutomaticBackup = createAutomaticBackup;
window.restoreFromBackup = restoreFromBackup;