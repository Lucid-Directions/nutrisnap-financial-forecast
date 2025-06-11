// Utility Functions
// Helper functions and shared utilities

// Currency formatting function - used across multiple files
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Cost management placeholders for future implementation
function updateCostBreakdown(yearCosts) {
    console.log('🏗️ Updating cost breakdown with:', yearCosts);
    // Placeholder for cost breakdown display
}

// Placeholder functions for advanced features
function updateCostStructureVisibility() {
    const projectionPeriodEl = document.getElementById('projectionPeriod');
    if (!projectionPeriodEl) {
        console.warn('⚠️ projectionPeriod element not found, skipping cost structure visibility update');
        return;
    }
    // Placeholder for cost structure visibility logic
}

function updateAnnualCostDisplays() {
    // Placeholder for annual cost display updates
}

// Placeholder for saving/loading functionality
function displaySavedProjections() {
    const container = document.getElementById('savedProjectionsList');
    const noSavedEl = document.getElementById('noSavedProjections');
    
    if (!container) return;
    
    const savedProjections = JSON.parse(localStorage.getItem('nutriSnapProjections') || '{}');
    const projectionNames = Object.keys(savedProjections);
    
    if (projectionNames.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px; font-style: italic;" id="noSavedProjections">No saved projections yet.</div>';
        return;
    }
    
    container.innerHTML = projectionNames.map(name => {
        const projection = savedProjections[name];
        return `
            <div class="saved-projection-item">
                <div>
                    <div class="saved-projection-name">${name}</div>
                    <div class="saved-projection-details">${projection.description}</div>
                </div>
                <div class="saved-projection-actions">
                    <button class="saved-projection-btn load-btn" onclick="loadProjection('${name}')">Load</button>
                    <button class="saved-projection-btn rename-btn" onclick="renameProjection('${name}')">Rename</button>
                    <button class="saved-projection-btn delete-btn" onclick="deleteProjection('${name}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Cost management tab functions (placeholders)
function switchCostTab(tabName) {
    console.log(`Switching to cost tab: ${tabName}`);
    // Placeholder for tab switching logic
}

function applyMarketingStrategy(phase) {
    console.log(`Applying marketing strategy: ${phase}`);
    // Placeholder for marketing strategy logic
}

// Monthly cost editor functions
function toggleMonthlyTeamCosts() {
    const checkbox = document.getElementById('enableMonthlyTeamCosts');
    const section = document.getElementById('monthlyTeamCostsSection');
    
    if (checkbox && section) {
        section.style.display = checkbox.checked ? 'block' : 'none';
        console.log('Monthly team costs section toggled:', checkbox.checked ? 'visible' : 'hidden');
        saveMonthlyDetailCheckboxStates();
        
        // If unchecked, clear the custom costs for this type
        if (!checkbox.checked) {
            clearMonthlyCustomCosts('team');
        }
        
        // Automatically recalculate to reflect changes
        triggerRecalculation();
    }
}

function toggleMonthlyTechCosts() {
    const checkbox = document.getElementById('enableMonthlyTechCosts');
    const section = document.getElementById('monthlyTechCostsSection');
    
    if (checkbox && section) {
        section.style.display = checkbox.checked ? 'block' : 'none';
        console.log('Monthly tech costs section toggled:', checkbox.checked ? 'visible' : 'hidden');
        saveMonthlyDetailCheckboxStates();
        
        // If unchecked, clear the custom costs for this type
        if (!checkbox.checked) {
            clearMonthlyCustomCosts('tech');
        }
        
        // Automatically recalculate to reflect changes
        triggerRecalculation();
    }
}

function toggleMonthlyMarketingCosts() {
    const checkbox = document.getElementById('enableMonthlyMarketingCosts');
    const section = document.getElementById('monthlyMarketingCostsSection');
    
    if (checkbox && section) {
        section.style.display = checkbox.checked ? 'block' : 'none';
        console.log('Monthly marketing costs section toggled:', checkbox.checked ? 'visible' : 'hidden');
        saveMonthlyDetailCheckboxStates();
        
        // If unchecked, clear the custom costs for this type
        if (!checkbox.checked) {
            clearMonthlyCustomCosts('marketing');
        }
        
        // Automatically recalculate to reflect changes
        triggerRecalculation();
    }
}

function openMonthlyEditor(type) {
    const projectionMonths = parseInt(document.getElementById('projectionPeriod')?.value) || 36;
    const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);
    
    // Create modal HTML
    const modalHTML = `
        <div id="monthlyEditorModal" style="
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        ">
            <div style="
                background: #1a1a1a; border-radius: 12px; padding: 30px; 
                max-width: 800px; max-height: 80vh; overflow-y: auto;
                border: 1px solid #333; width: 90%;
            ">
                <h3 style="color: #667eea; margin-bottom: 20px;">Monthly ${typeTitle} Cost Editor</h3>
                <p style="color: #999; margin-bottom: 20px;">
                    Customize ${type} costs for each month of your projection period.
                </p>
                
                <div id="monthlyEditor" style="
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 15px; margin-bottom: 20px; max-height: 400px; overflow-y: auto;
                ">
                    ${Array.from({length: projectionMonths}, (_, i) => {
                        const month = i + 1;
                        const year = Math.ceil(month / 12);
                        const defaultCost = getDefaultCost(type, year);
                        
                        // Check if there's a saved monthly cost for this month
                        const savedCost = window.monthlyCustomCosts?.[type]?.[month];
                        const currentCost = savedCost !== undefined ? savedCost : defaultCost;
                        
                        return `
                            <div style="background: #0a0a0a; padding: 12px; border-radius: 6px; border: 1px solid #333;">
                                <label style="color: #999; font-size: 0.9rem; display: block; margin-bottom: 5px;">
                                    Month ${month} (Year ${year})
                                </label>
                                <input 
                                    type="number" 
                                    id="${type}CostMonth${month}" 
                                    value="${currentCost}" 
                                    min="0" 
                                    step="100"
                                    style="width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; color: #fff;"
                                >
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="closeMonthlyEditor()" style="
                        background: #666; color: white; border: none; padding: 10px 20px; 
                        border-radius: 6px; cursor: pointer;
                    ">Cancel</button>
                    <button onclick="saveMonthlyEditor('${type}')" style="
                        background: #667eea; color: white; border: none; padding: 10px 20px; 
                        border-radius: 6px; cursor: pointer;
                    ">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function getDefaultCost(type, year) {
    const costMappings = {
        'team': { 1: 4500, 2: 12000, 3: 25000 },
        'tech': { 1: 800, 2: 1800, 3: 4000 },
        'marketing': { 1: 1200, 2: 3500, 3: 8000 }
    };
    
    const costs = costMappings[type];
    if (!costs) return 1000;
    
    return costs[Math.min(year, 3)] || costs[3];
}

function closeMonthlyEditor() {
    const modal = document.getElementById('monthlyEditorModal');
    if (modal) {
        modal.remove();
    }
}

function saveMonthlyEditor(type) {
    const projectionMonths = parseInt(document.getElementById('projectionPeriod')?.value) || 36;
    const monthlyCosts = {};
    
    for (let month = 1; month <= projectionMonths; month++) {
        const input = document.getElementById(`${type}CostMonth${month}`);
        if (input) {
            monthlyCosts[month] = parseFloat(input.value) || 0;
        }
    }
    
    // Store in global state for use in calculations
    if (!window.monthlyCustomCosts) {
        window.monthlyCustomCosts = {};
    }
    window.monthlyCustomCosts[type] = monthlyCosts;
    
    // Save to localStorage for persistence
    localStorage.setItem('monthlyCustomCosts', JSON.stringify(window.monthlyCustomCosts));
    
    closeMonthlyEditor();
    alert(`Monthly ${type} costs saved! They will be used in the next calculation.`);
    
    // Trigger recalculation
    if (typeof calculateProjections === 'function') {
        calculateProjections(false);
    }
}

// Load monthly costs from localStorage
function loadMonthlyCustomCosts() {
    try {
        const saved = localStorage.getItem('monthlyCustomCosts');
        if (saved) {
            window.monthlyCustomCosts = JSON.parse(saved);
            console.log('Monthly custom costs loaded from localStorage');
        }
    } catch (error) {
        console.warn('Failed to load monthly custom costs:', error);
        window.monthlyCustomCosts = {};
    }
}

// Load monthly costs and checkbox states on page load
function restoreMonthlyDetailSettings() {
    loadMonthlyCustomCosts();
    
    // Restore checkbox states
    const checkboxStates = JSON.parse(localStorage.getItem('monthlyDetailCheckboxes') || '{}');
    
    ['Team', 'Tech', 'Marketing'].forEach(type => {
        const checkbox = document.getElementById(`enableMonthly${type}Costs`);
        const section = document.getElementById(`monthly${type}CostsSection`);
        
        if (checkbox && checkboxStates[type]) {
            checkbox.checked = true;
            if (section) {
                section.style.display = 'block';
            }
        }
    });
}

// Save checkbox states
function saveMonthlyDetailCheckboxStates() {
    const states = {};
    ['Team', 'Tech', 'Marketing'].forEach(type => {
        const checkbox = document.getElementById(`enableMonthly${type}Costs`);
        if (checkbox) {
            states[type] = checkbox.checked;
        }
    });
    localStorage.setItem('monthlyDetailCheckboxes', JSON.stringify(states));
}

// Helper function to clean up monthly custom costs when disabled
function clearMonthlyCustomCosts(type) {
    if (!window.monthlyCustomCosts) {
        window.monthlyCustomCosts = {};
        return;
    }
    
    const lowerType = type.toLowerCase();
    if (window.monthlyCustomCosts[lowerType]) {
        delete window.monthlyCustomCosts[lowerType];
        localStorage.setItem('monthlyCustomCosts', JSON.stringify(window.monthlyCustomCosts));
        console.log(`✅ Monthly ${lowerType} custom costs cleared and saved`);
    }
}

// Helper function to trigger recalculation with proper timing
function triggerRecalculation() {
    // Small delay to ensure DOM updates are complete
    setTimeout(() => {
        if (typeof calculateProjections === 'function') {
            calculateProjections(false);
            console.log('📊 Projections recalculated due to monthly cost toggle');
        } else {
            console.warn('⚠️ calculateProjections function not available');
        }
    }, 100);
}

// Make functions globally available
window.toggleMonthlyTeamCosts = toggleMonthlyTeamCosts;
window.toggleMonthlyTechCosts = toggleMonthlyTechCosts;
window.toggleMonthlyMarketingCosts = toggleMonthlyMarketingCosts;
window.openMonthlyEditor = openMonthlyEditor;
window.closeMonthlyEditor = closeMonthlyEditor;
window.saveMonthlyEditor = saveMonthlyEditor;
window.loadMonthlyCustomCosts = loadMonthlyCustomCosts;
window.restoreMonthlyDetailSettings = restoreMonthlyDetailSettings;
window.saveMonthlyDetailCheckboxStates = saveMonthlyDetailCheckboxStates;
window.clearMonthlyCustomCosts = clearMonthlyCustomCosts;
window.triggerRecalculation = triggerRecalculation; 