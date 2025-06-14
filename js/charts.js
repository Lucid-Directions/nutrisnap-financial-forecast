// Charts and Visualization
// Handles Chart.js integration and data visualization

let revenueChart = null;
let revenueCompositionChart = null;

function updateRevenueCompositionChart(summaryData) {
    const ctx = document.getElementById('revenueCompositionChart');
    const card = document.getElementById('revenueCompositionCard');
    if (!ctx || !card) {
        console.warn('⚠️ Revenue composition chart canvas or card not found');
        return;
    }

    if (revenueCompositionChart) {
        revenueCompositionChart.destroy();
    }

    const adData = summaryData?.advertisingRevenueData;
    
    console.log('📊 Revenue Composition Chart Data:', {
        adData: adData,
        totalRevenue: summaryData?.totalRevenue,
        hasAdvertising: !!adData && adData.totalAdvertisingRevenue > 0
    });

    // Calculate subscription revenue (total revenue minus advertising revenue)
    const totalRevenue = summaryData?.totalRevenue || 0;
    const totalAdvertisingRevenue = adData?.totalAdvertisingRevenue || 0;
    const subscriptionRevenue = totalRevenue - totalAdvertisingRevenue;

    // Hide card if no revenue at all
    if (totalRevenue <= 0) {
        card.style.display = 'none';
        console.log('📊 Hiding revenue composition chart - no revenue');
        return;
    }
    
    card.style.display = 'block';

    const labels = [];
    const data = [];
    const backgroundColors = [];

    // Always show subscription revenue if it exists
    if (subscriptionRevenue > 0) {
        labels.push('Subscription');
        data.push(subscriptionRevenue);
        backgroundColors.push('#667eea');
    }
    
    // Show advertising revenue breakdown if enabled and has revenue
    if (adData && totalAdvertisingRevenue > 0) {
        if (adData.totalBannerRevenue > 0) {
            labels.push('Banner Ads');
            data.push(adData.totalBannerRevenue);
            backgroundColors.push('#34d399');
        }
        if (adData.totalInterstitialRevenue > 0) {
            labels.push('Interstitial Ads');
            data.push(adData.totalInterstitialRevenue);
            backgroundColors.push('#fbbf24');
        }
        if (adData.totalRewardedRevenue > 0) {
            labels.push('Rewarded Ads');
            data.push(adData.totalRewardedRevenue);
            backgroundColors.push('#f472b6');
        }
    }

    console.log('📊 Chart data prepared:', { labels, data, backgroundColors });

    revenueCompositionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue Source',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: '#1f2937',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#9ca3af',
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                title: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#e5e7eb',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatCurrency(context.parsed);
                                // Add percentage
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                label += ` (${percentage}%)`;
                            }
                            return label;
                        }
                    }
                },
                // Disable data labels to keep chart clean
                datalabels: {
                    display: false
                }
            },
            // Remove any data label plugins that might show numbers on chart
            layout: {
                padding: 20
            }
        }
    });
}

function updateChart(data) {
    const ctx = document.getElementById('projectionChart');
    if (!ctx) {
        console.warn('⚠️ Chart canvas not found');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js not loaded');
        return;
    }
    
    console.log('📊 Updating chart with data:', data?.length || 0, 'data points');
    
    // Ensure we have valid data
    if (!data || data.length === 0) {
        console.warn('⚠️ No data provided to chart');
        return;
    }

    // Destroy existing chart
    if (revenueChart) {
        revenueChart.destroy();
    }

    const labels = data.map(d => d.isBeta ? `Beta ${d.month}` : `Month ${d.month}`);
    const revenueData = data.map(d => d.monthlyRevenue || 0);
    const costData = data.map(d => d.monthlyCosts || 0);
    const netIncomeData = data.map(d => d.netIncome || 0);

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Monthly Revenue',
                    data: revenueData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Monthly Costs',
                    data: costData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Net Income',
                    data: netIncomeData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue, Costs & Net Income Over Time',
                    color: '#fff'
                },
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#374151'
                    },
                    ticks: {
                        color: '#9ca3af',
                        maxTicksLimit: 12 // Limit ticks for readability
                    }
                },
                y: {
                    grid: {
                        color: '#374151'
                    },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    radius: 3,
                    hoverRadius: 6
                }
            }
        }
    });
} 