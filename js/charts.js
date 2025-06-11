// Charts and Visualization
// Handles Chart.js integration and data visualization

let revenueChart = null;

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