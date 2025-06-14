// Interactive Charts Module
// Advanced chart visualizations for investor presentations

// Chart instances storage
window.interactiveCharts = {};

// Chart navigation functionality
window.showChart = function(chartType) {
    // Hide all chart containers
    const containers = [
        'revenue-waterfall-container',
        'acquisition-funnel-container', 
        'cash-runway-container',
        'unit-economics-container',
        'main-overview-container'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) container.style.display = 'none';
    });
    
    // Show selected container
    const selectedContainer = document.getElementById(`${chartType}-container`);
    if (selectedContainer) selectedContainer.style.display = 'block';
    
    // Update navigation buttons
    document.querySelectorAll('.chart-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#374151';
    });
    
    // Highlight active button
    event.target.classList.add('active');
    event.target.style.background = '#667eea';
    
    // Trigger chart resize for proper display
    setTimeout(() => {
        const activeChart = window.interactiveCharts[chartType];
        if (activeChart) {
            activeChart.resize();
        }
    }, 100);
};

// Enhanced tooltip configuration
const enhancedTooltipConfig = {
    enabled: true,
    mode: 'index',
    intersect: false,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    titleColor: '#fff',
    bodyColor: '#e5e7eb',
    borderColor: '#667eea',
    borderWidth: 2,
    cornerRadius: 8,
    displayColors: true,
    titleFont: { size: 14, weight: 'bold' },
    bodyFont: { size: 12 },
    padding: 12
};

// Animation configuration
const enhancedAnimationConfig = {
    duration: 1500,
    easing: 'easeInOutCubic',
    delay: (context) => context.dataIndex * 50
};

// 1. Revenue Growth Waterfall Chart
function createRevenueWaterfallChart(monthlyData) {
    const ctx = document.getElementById('revenueWaterfallChart');
    if (!ctx) return;
    
    // Prepare waterfall data
    const waterfallData = prepareWaterfallData(monthlyData);
    
    if (window.interactiveCharts['revenue-waterfall']) {
        window.interactiveCharts['revenue-waterfall'].destroy();
    }
    
    window.interactiveCharts['revenue-waterfall'] = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: waterfallData.labels,
            datasets: [{
                label: 'Revenue Growth',
                data: waterfallData.values,
                backgroundColor: waterfallData.colors,
                borderColor: waterfallData.borderColors,
                borderWidth: 2,
                hoverBackgroundColor: (ctx) => {
                    const value = ctx.raw;
                    return value > 0 ? '#14b8a6' : '#f97316';
                },
                hoverBorderColor: '#667eea',
                hoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
                datalabels: {
                    display: false
                },
                tooltip: {
                    ...enhancedTooltipConfig,
                    callbacks: {
                        title: (items) => `Month ${items[0].label}`,
                        beforeBody: (items) => ['Revenue Breakdown:'],
                        afterBody: (items) => {
                            const monthIndex = items[0].dataIndex;
                            const month = monthlyData[monthIndex];
                            if (!month) return [];
                            
                            return [
                                `Base Revenue: £${formatCurrency(month.baseRevenue || 0)}`,
                                `New Customers: +£${formatCurrency(month.newCustomerRevenue || 0)}`,
                                `Expansion: +£${formatCurrency(month.expansionRevenue || 0)}`,
                                `Churn: -£${formatCurrency(month.churnRevenue || 0)}`,
                                `Growth Rate: ${(month.growthRate || 0).toFixed(1)}%`
                            ];
                        },
                        footer: (items) => ['💡 Click for detailed analysis']
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => '£' + (value/1000).toFixed(0) + 'K',
                        color: '#9ca3af',
                        font: { size: 11 }
                    },
                    grid: { 
                        color: '#333333',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Monthly Revenue (£)',
                        color: '#e5e7eb',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                x: {
                    ticks: { 
                        color: '#9ca3af',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            },
            animation: {
                ...enhancedAnimationConfig,
                onProgress: (animation) => {
                    // Add loading progress indicator
                    const progress = Math.round((animation.currentStep / animation.numSteps) * 100);
                    console.log(`Waterfall Chart Loading: ${progress}%`);
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    showRevenueBreakdown(dataIndex, monthlyData);
                }
            }
        }
    });
}

// 2. Growth Metrics Dashboard (replacing funnel)
function createAcquisitionFunnelChart(monthlyData, params) {
    const ctx = document.getElementById('acquisitionFunnelChart');
    if (!ctx) return;
    
    // Prepare growth metrics data
    const growthData = prepareGrowthMetricsData(monthlyData, params);
    
    if (window.interactiveCharts['acquisition-funnel']) {
        window.interactiveCharts['acquisition-funnel'].destroy();
    }
    
    // Create multi-line chart showing key growth metrics over time
    window.interactiveCharts['acquisition-funnel'] = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: growthData.labels,
            datasets: [
                {
                    label: 'Total MAU',
                    data: growthData.mauData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Premium Users',
                    data: growthData.premiumData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Conversion Rate %',
                    data: growthData.conversionData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                },
                {
                    label: 'Monthly Growth %',
                    data: growthData.growthRateData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
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
                    labels: { color: '#e5e7eb' }
                },
                datalabels: {
                    display: false
                },
                tooltip: {
                    ...enhancedTooltipConfig,
                    callbacks: {
                        title: (items) => `Month ${items[0].label}`,
                        beforeBody: (items) => ['Growth Metrics:'],
                        afterBody: (items) => {
                            const monthIndex = items[0].dataIndex;
                            const monthData = monthlyData.filter(m => !m.isBeta)[monthIndex];
                            if (!monthData) return [];
                            
                            return [
                                `Total MAU: ${monthData.mau.toLocaleString()}`,
                                `Free Users: ${monthData.freeUsers.toLocaleString()}`,
                                `Premium Users: ${monthData.premiumUsers.toLocaleString()}`,
                                `Conversion Rate: ${monthData.conversionRate.toFixed(2)}%`,
                                `Monthly Revenue: £${monthData.monthlyRevenue.toLocaleString()}`,
                                `ARR: £${monthData.arr.toLocaleString()}`
                            ];
                        },
                        footer: () => ['📈 Track user growth and conversion trends']
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => value.toLocaleString(),
                        color: '#9ca3af'
                    },
                    grid: { color: '#333333' },
                    title: {
                        display: true,
                        text: 'Users',
                        color: '#e5e7eb'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    max: Math.max(...growthData.conversionData, ...growthData.growthRateData) + 5,
                    ticks: {
                        callback: (value) => value.toFixed(1) + '%',
                        color: '#9ca3af'
                    },
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: 'Percentage (%)',
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            },
            animation: enhancedAnimationConfig
        }
    });
}

// 3. Cash Flow Runway Chart
function createCashRunwayChart(monthlyData, params) {
    const ctx = document.getElementById('cashRunwayChart');
    if (!ctx) return;
    
    // Prepare cash flow data
    const cashData = prepareCashFlowData(monthlyData, params);
    
    if (window.interactiveCharts['cash-runway']) {
        window.interactiveCharts['cash-runway'].destroy();
    }
    
    window.interactiveCharts['cash-runway'] = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: cashData.labels,
            datasets: [
                {
                    label: 'Cash Balance',
                    data: cashData.cashBalance,
                    borderColor: '#10b981',
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return;
                        
                        // Create gradient from green to red based on runway danger
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)'); // Red (danger)
                        gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.2)'); // Orange (warning)
                        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)'); // Green (safe)
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Monthly Burn Rate',
                    data: cashData.burnRate,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#e5e7eb' }
                },
                datalabels: {
                    display: false
                },
                tooltip: {
                    ...enhancedTooltipConfig,
                    callbacks: {
                        title: (items) => `Month ${items[0].label}`,
                        beforeBody: (items) => ['Cash Flow Analysis:'],
                        afterBody: (items) => {
                            const monthIndex = items[0].dataIndex;
                            const data = cashData.details[monthIndex];
                            
                            return [
                                `Cash Balance: £${data.cashBalance.toLocaleString()}`,
                                `Monthly Burn: £${data.monthlyBurn.toLocaleString()}`,
                                `Revenue: £${data.revenue.toLocaleString()}`,
                                `Runway: ${data.runwayMonths} months`,
                                `Status: ${data.runwayStatus}`
                            ];
                        },
                        footer: () => ['⚠️ Red zone indicates <6 months runway']
                    }
                },
                annotation: {
                    annotations: {
                        dangerLine: {
                            type: 'line',
                            yMin: params.seedInvestment * 0.2, // 20% of initial investment as danger zone
                            yMax: params.seedInvestment * 0.2,
                            borderColor: 'rgba(239, 68, 68, 0.8)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: 'Danger Zone (6 months runway)',
                                position: 'end',
                                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                                color: 'white'
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    ticks: {
                        callback: (value) => '£' + (value/1000).toFixed(0) + 'K',
                        color: '#9ca3af'
                    },
                    grid: { color: '#333333' },
                    title: {
                        display: true,
                        text: 'Cash Balance (£)',
                        color: '#e5e7eb'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        callback: (value) => '£' + (value/1000).toFixed(0) + 'K',
                        color: '#9ca3af'
                    },
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: 'Monthly Burn (£)',
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            },
            animation: enhancedAnimationConfig
        }
    });
}

// 4. Unit Economics Chart
function createUnitEconomicsChart(monthlyData, params) {
    const ctx = document.getElementById('unitEconomicsChart');
    if (!ctx) {
        console.error('❌ Unit Economics chart canvas not found');
        return;
    }
    
    console.log('🚀 Creating Unit Economics Chart...');
    console.log('Monthly data:', monthlyData.length, 'points');
    console.log('Params available:', !!params);
    
    // Prepare unit economics data
    const unitEconData = prepareUnitEconomicsData(monthlyData, params);
    
    console.log('📊 Unit Economics data prepared:', unitEconData.scatterData.length, 'points');
    
    if (unitEconData.scatterData.length === 0) {
        console.warn('⚠️ No Unit Economics data points generated');
        
        // Create a placeholder chart with message
        const ctx2d = ctx.getContext('2d');
        ctx2d.fillStyle = '#9ca3af';
        ctx2d.font = '16px Arial';
        ctx2d.textAlign = 'center';
        ctx2d.fillText('No data available yet', ctx.width / 2, ctx.height / 2);
        ctx2d.fillText('Add premium users to see unit economics', ctx.width / 2, ctx.height / 2 + 30);
        return;
    }
    
    if (window.interactiveCharts['unit-economics']) {
        window.interactiveCharts['unit-economics'].destroy();
    }
    
    window.interactiveCharts['unit-economics'] = new Chart(ctx.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'LTV vs CAC',
                    data: unitEconData.scatterData,
                    backgroundColor: (context) => {
                        const point = context.raw;
                        if (point.isProjected) return 'rgba(156, 163, 175, 0.6)'; // Gray for projected
                        const ratio = point.ratio;
                        if (ratio >= 3) return 'rgba(16, 185, 129, 0.8)'; // Good (green)
                        if (ratio >= 2) return 'rgba(245, 158, 11, 0.8)'; // Warning (orange)
                        return 'rgba(239, 68, 68, 0.8)'; // Poor (red)
                    },
                    borderColor: '#667eea',
                    pointRadius: (context) => {
                        const point = context.raw;
                        if (point.isProjected) return 4; // Smaller for projected
                        return 8; // Fixed size for actual data
                    },
                    pointHoverRadius: 12
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#e5e7eb' }
                },
                datalabels: {
                    display: false
                },
                tooltip: {
                    ...enhancedTooltipConfig,
                    callbacks: {
                        title: (items) => `Month ${items[0].dataIndex + 1}`,
                        beforeBody: (items) => ['Unit Economics:'],
                        afterBody: (items) => {
                            const point = items[0].raw;
                            return [
                                `Customer LTV: £${point.x.toFixed(2)}`,
                                `Customer CAC: £${point.y.toFixed(2)}`,
                                `LTV:CAC Ratio: ${point.ratio.toFixed(1)}:1`,
                                `Payback Period: ${point.paybackMonths.toFixed(1)} months`,
                                `Status: ${point.status}`
                            ];
                        },
                        footer: () => ['🎯 Target: LTV:CAC > 3:1']
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Customer Lifetime Value (£)',
                        color: '#e5e7eb'
                    },
                    ticks: {
                        callback: (value) => '£' + value.toFixed(0),
                        color: '#9ca3af'
                    },
                    grid: { color: '#333333' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Customer Acquisition Cost (£)',
                        color: '#e5e7eb'
                    },
                    ticks: {
                        callback: (value) => '£' + value.toFixed(0),
                        color: '#9ca3af'
                    },
                    grid: { color: '#333333' }
                }
            },
            animation: enhancedAnimationConfig
        }
    });
}

// Data preparation functions
function prepareWaterfallData(monthlyData) {
    const labels = [];
    const values = [];
    const colors = [];
    const borderColors = [];
    
    monthlyData.forEach((month, index) => {
        if (month.isBeta) return;
        
        labels.push(month.month);
        values.push(month.monthlyRevenue);
        
        // Color based on growth
        const growth = index > 0 ? month.monthlyRevenue - monthlyData[index-1].monthlyRevenue : 0;
        if (growth > 0) {
            colors.push('rgba(16, 185, 129, 0.8)'); // Green for positive growth
            borderColors.push('#10b981');
        } else if (growth < 0) {
            colors.push('rgba(239, 68, 68, 0.8)'); // Red for decline
            borderColors.push('#ef4444');
        } else {
            colors.push('rgba(156, 163, 175, 0.8)'); // Gray for no change
            borderColors.push('#9ca3af');
        }
    });
    
    return { labels, values, colors, borderColors };
}

function prepareGrowthMetricsData(monthlyData, params) {
    const projectionMonths = monthlyData.filter(m => !m.isBeta);
    
    return {
        labels: projectionMonths.map(m => m.month),
        mauData: projectionMonths.map(m => m.mau),
        premiumData: projectionMonths.map(m => m.premiumUsers),
        conversionData: projectionMonths.map(m => m.conversionRate),
        growthRateData: projectionMonths.map(m => m.growthRate)
    };
}

function prepareCashFlowData(monthlyData, params) {
    const labels = [];
    const cashBalance = [];
    const burnRate = [];
    const details = [];
    
    let currentCash = params.seedInvestment;
    
    monthlyData.forEach(month => {
        if (month.isBeta) return;
        
        labels.push(month.month);
        
        const revenue = month.monthlyRevenue || 0;
        const costs = month.monthlyCosts || 0;
        const netCashFlow = revenue - costs;
        
        currentCash += netCashFlow;
        cashBalance.push(Math.max(0, currentCash));
        burnRate.push(Math.abs(costs - revenue));
        
        const runwayMonths = currentCash > 0 ? Math.round(currentCash / Math.abs(costs - revenue)) : 0;
        let runwayStatus = 'Healthy';
        if (runwayMonths < 6) runwayStatus = 'Critical';
        else if (runwayMonths < 12) runwayStatus = 'Warning';
        
        details.push({
            cashBalance: currentCash,
            monthlyBurn: Math.abs(costs - revenue),
            revenue,
            runwayMonths,
            runwayStatus
        });
    });
    
    return { labels, cashBalance, burnRate, details };
}

function prepareUnitEconomicsData(monthlyData, params) {
    const scatterData = [];
    
    console.log('📊 Preparing Unit Economics Data...');
    console.log('Monthly data length:', monthlyData.length);
    console.log('Params:', { paidChurnRate: params.paidChurnRate, marketingCosts: params.marketingCosts });
    
    // Start from month 3 to allow for some premium users to accumulate
    monthlyData.forEach((month, index) => {
        if (month.isBeta) return;
        
        // Fix: Use total premium users across all tiers
        const totalPremiumUsers = month.premiumUsers || 0;
        
        // Only include every 3rd month to reduce clutter and show meaningful progression
        if (index % 3 !== 0 && index < 12) return; // Sample data for cleaner visualization
        
        // Generate data even with small numbers of premium users
        if (totalPremiumUsers < 1 && index < 6) {
            // For early months with no premium users, create projected data points
            const projectedPremiumUsers = Math.max(1, Math.round(month.mau * 0.01)); // 1% conversion estimate
            const projectedARPU = params.tiers.length > 0 ? params.tiers[0].price : 10; // Use first tier price or default
            const projectedLTV = params.paidChurnRate > 0 ? projectedARPU / params.paidChurnRate : projectedARPU * 20;
            const projectedCAC = 50 + (index * 10); // Vary CAC slightly to show progression
            
            scatterData.push({
                x: projectedLTV,
                y: projectedCAC,
                ratio: projectedLTV / projectedCAC,
                paybackMonths: projectedCAC / projectedARPU,
                status: 'Projected',
                isProjected: true
            });
            return;
        }
        
        if (totalPremiumUsers === 0) return;
        
        const monthlyARPU = totalPremiumUsers > 0 ? month.monthlyRevenue / totalPremiumUsers : 0;
        const customerLTV = params.paidChurnRate > 0 ? monthlyARPU / (params.paidChurnRate) : monthlyARPU * 20; // Default 20 month LTV if no churn
        
        // Better CAC calculation: cumulative marketing spend / cumulative new users
        const cumulativeMarketingSpend = monthlyData.slice(0, index + 1)
            .filter(m => !m.isBeta)
            .reduce((sum, m) => sum + (m.marketingCost || 0), 0);
        const cumulativeNewUsers = monthlyData.slice(0, index + 1)
            .filter(m => !m.isBeta)
            .reduce((sum, m) => sum + Math.max(0, m.mau - (monthlyData[monthlyData.indexOf(m) - 1]?.mau || 0)), 0);
        
        const customerCAC = cumulativeNewUsers > 0 ? cumulativeMarketingSpend / cumulativeNewUsers : 50; // Default CAC
        const ratio = customerCAC > 0 ? customerLTV / customerCAC : 0;
        const paybackMonths = monthlyARPU > 0 ? customerCAC / monthlyARPU : 0;
        
        let status = 'Poor';
        if (ratio >= 3) status = 'Excellent';
        else if (ratio >= 2) status = 'Good';
        else if (ratio >= 1) status = 'Acceptable';
        
        console.log(`Month ${month.month}:`, {
            premiumUsers: totalPremiumUsers,
            monthlyARPU: monthlyARPU.toFixed(2),
            customerLTV: customerLTV.toFixed(2),
            customerCAC: customerCAC.toFixed(2),
            ratio: ratio.toFixed(2),
            status
        });
        
        scatterData.push({
            x: customerLTV,
            y: customerCAC,
            ratio,
            paybackMonths,
            status,
            isProjected: false
        });
    });
    
    console.log('📊 Unit Economics scatter data points:', scatterData.length);
    return { scatterData };
}

// Interactive drill-down functions
function showRevenueBreakdown(monthIndex, monthlyData) {
    const month = monthlyData[monthIndex];
    if (!month) return;
    
    // Create a detailed breakdown modal or sidebar
    console.log('Revenue Breakdown for Month', month.month, {
        totalRevenue: month.monthlyRevenue,
        growthRate: month.growthRate,
        premiumUsers: month.premiumUsers,
        freeUsers: month.freeUsers
    });
    
    // You could implement a modal here showing detailed revenue analysis
}

function showConversionDetails(stageIndex, funnelData) {
    const stage = funnelData.stages[stageIndex];
    if (!stage) return;
    
    console.log('Conversion Details for', stage.name, {
        users: stage.value,
        conversionRate: stage.conversionRate,
        dropOff: stage.dropOff,
        efficiency: stage.efficiency
    });
    
    // You could implement a detailed conversion analysis modal here
}

// Initialize all interactive charts
window.initializeInteractiveCharts = function(monthlyData, params) {
    console.log('🎨 Initializing Interactive Charts...');
    
    // Register Chart.js plugins if available
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }
    
    // Ensure we have valid data
    if (!monthlyData || monthlyData.length === 0) {
        console.warn('No monthly data available for charts');
        return;
    }
    
    setTimeout(() => {
        try {
            createRevenueWaterfallChart(monthlyData);
            createAcquisitionFunnelChart(monthlyData, params);
            createCashRunwayChart(monthlyData, params);
            createUnitEconomicsChart(monthlyData, params);
            
            console.log('✅ All interactive charts initialized');
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }, 100);
};

// Presentation Mode functionality
let presentationMode = {
    active: false,
    currentChart: 0,
    charts: ['revenue-waterfall', 'acquisition-funnel', 'cash-runway', 'unit-economics', 'main-overview']
};

window.enterPresentationMode = function() {
    if (presentationMode.active) return;
    
    presentationMode.active = true;
    presentationMode.currentChart = 0;
    
    // Add presentation mode class to body
    document.body.classList.add('presentation-mode');
    
    // Hide all other content
    const mainContent = document.querySelector('.main-content');
    const outputSection = document.getElementById('outputSection');
    
    if (mainContent) mainContent.style.display = 'none';
    
    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.id = 'presentation-overlay';
    overlay.innerHTML = `
        <div class="presentation-container">
            <div class="presentation-header">
                <h1>🥗 NutriSnap Financial Forecast</h1>
                <div class="presentation-controls">
                    <span class="chart-counter">${presentationMode.currentChart + 1} / ${presentationMode.charts.length}</span>
                    <button onclick="exitPresentationMode()" class="exit-btn">✕ Exit</button>
                </div>
            </div>
            <div class="presentation-chart-area">
                <div id="presentation-chart-container"></div>
            </div>
            <div class="presentation-footer">
                <div class="navigation-hint">
                    <span>← Previous</span>
                    <span>Space: Next Chart</span>
                    <span>Next →</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Enable keyboard navigation
    document.addEventListener('keydown', handlePresentationKeyboard);
    
    // Show first chart
    showPresentationChart(0);
    
    console.log('🎥 Presentation mode activated');
};

window.exitPresentationMode = function() {
    if (!presentationMode.active) return;
    
    presentationMode.active = false;
    
    // Remove presentation mode class
    document.body.classList.remove('presentation-mode');
    
    // Show main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.display = 'grid';
    
    // Remove overlay
    const overlay = document.getElementById('presentation-overlay');
    if (overlay) overlay.remove();
    
    // Remove keyboard listener
    document.removeEventListener('keydown', handlePresentationKeyboard);
    
    console.log('📊 Presentation mode deactivated');
};

function handlePresentationKeyboard(event) {
    if (!presentationMode.active) return;
    
    switch(event.key) {
        case 'Escape':
            exitPresentationMode();
            break;
        case 'ArrowRight':
        case ' ':
            nextPresentationChart();
            break;
        case 'ArrowLeft':
            previousPresentationChart();
            break;
    }
}

function nextPresentationChart() {
    if (presentationMode.currentChart < presentationMode.charts.length - 1) {
        presentationMode.currentChart++;
        showPresentationChart(presentationMode.currentChart);
    }
}

function previousPresentationChart() {
    if (presentationMode.currentChart > 0) {
        presentationMode.currentChart--;
        showPresentationChart(presentationMode.currentChart);
    }
}

function showPresentationChart(index) {
    const chartType = presentationMode.charts[index];
    const container = document.getElementById('presentation-chart-container');
    const counter = document.querySelector('.chart-counter');
    
    if (counter) {
        counter.textContent = `${index + 1} / ${presentationMode.charts.length}`;
    }
    
    // Get the chart title and description
    const chartInfo = getChartInfo(chartType);
    
    if (container) {
        container.innerHTML = `
            <div class="presentation-chart-header">
                <h2>${chartInfo.title}</h2>
                <p>${chartInfo.description}</p>
            </div>
            <div class="presentation-chart">
                <canvas id="presentation-${chartType}-chart"></canvas>
            </div>
        `;
        
        // Clone the chart to presentation mode
        setTimeout(() => {
            cloneChartToPresentation(chartType);
        }, 100);
    }
}

function getChartInfo(chartType) {
    const info = {
        'revenue-waterfall': {
            title: '💰 Revenue Growth Waterfall',
            description: 'Month-over-month revenue growth breakdown showing how each component contributes to total revenue growth.'
        },
        'acquisition-funnel': {
            title: '📈 Growth Metrics Dashboard',
            description: 'Track key growth indicators: MAU growth, premium user acquisition, conversion rates, and monthly growth trends over time.'
        },
        'cash-runway': {
            title: '🏃 Cash Flow & Runway Analysis',
            description: 'Cash burn analysis and runway projection with scenario planning and danger zone indicators.'
        },
        'unit-economics': {
            title: '📈 Unit Economics Analysis',
            description: 'LTV:CAC analysis showing customer lifetime value vs acquisition cost over time with profitability metrics.'
        },
        'main-overview': {
            title: '📊 Financial Overview',
            description: 'Comprehensive financial dashboard showing revenue, costs, user growth, and net income trends.'
        }
    };
    
    return info[chartType] || { title: 'Chart', description: 'Financial analysis chart' };
}

function cloneChartToPresentation(chartType) {
    // Handle main overview chart separately as it's in window.mainChart, not interactiveCharts
    let originalChart;
    if (chartType === 'main-overview') {
        originalChart = window.mainChart;
    } else {
        originalChart = window.interactiveCharts[chartType];
    }
    
    if (!originalChart) {
        console.warn(`No chart found for type: ${chartType}`);
        return;
    }
    
    const newCtx = document.getElementById(`presentation-${chartType}-chart`);
    if (!newCtx) {
        console.warn(`No presentation canvas found for: presentation-${chartType}-chart`);
        return;
    }
    
    try {
        // Get the chart data and options directly instead of cloning config
        const originalData = originalChart.data;
        const originalOptions = originalChart.options;
        
        // Create a deep copy of the data
        const presentationData = JSON.parse(JSON.stringify(originalData));
        
        // Create enhanced options for presentation
        const presentationOptions = {
            ...originalOptions,
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                ...originalOptions.plugins,
                datalabels: {
                    display: false
                },
                legend: {
                    ...originalOptions.plugins?.legend,
                    labels: {
                        ...originalOptions.plugins?.legend?.labels,
                        color: '#e5e7eb',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                tooltip: {
                    ...originalOptions.plugins?.tooltip,
                    titleFont: { size: 16, weight: 'bold' },
                    bodyFont: { size: 14 }
                }
            },
            scales: originalOptions.scales ? Object.keys(originalOptions.scales).reduce((acc, scaleKey) => {
                const scale = originalOptions.scales[scaleKey];
                acc[scaleKey] = {
                    ...scale,
                    ticks: {
                        ...scale.ticks,
                        font: { size: 14 },
                        color: '#e5e7eb'
                    },
                    title: scale.title ? {
                        ...scale.title,
                        font: { size: 16, weight: 'bold' },
                        color: '#e5e7eb'
                    } : scale.title
                };
                return acc;
            }, {}) : undefined
        };
        
        // Create new chart instance
        const presentationChart = new Chart(newCtx.getContext('2d'), {
            type: originalChart.config.type,
            data: presentationData,
            options: presentationOptions
        });
        
        console.log(`✅ Successfully cloned ${chartType} chart to presentation mode`);
        
    } catch (error) {
        console.error(`Error cloning chart ${chartType} to presentation:`, error);
        
        // Fallback: create a simple error message chart
        const ctx = newCtx.getContext('2d');
        ctx.fillStyle = '#ef4444';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Chart Loading Error', newCtx.width / 2, newCtx.height / 2);
    }
}

// Utility function for currency formatting (reuse existing one)
function formatCurrency(value) {
    if (value === null || value === undefined) return '0';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString();
}