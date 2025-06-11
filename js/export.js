// Export Functionality
// Handles CSV, PDF export, and screenshot features

function exportToCSV() {
    if (!globalMonthlyData || globalMonthlyData.length === 0) {
        alert('No data available to export. Please run calculations first.');
        return;
    }

    try {
        // Get summary data with proper null checking
        const summary = globalSummaryData || {};
        const params = summary.parameters || {};
        
        let csv = 'NUTRISNAP FINANCIAL FORECAST\n';
        csv += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
        
        // Parameters Section with safe access
        csv += 'INPUT PARAMETERS\n';
        csv += 'Parameter,Value\n';
        csv += `Projection Period,${params.projectionMonths || 36} months\n`;
        csv += `Starting MAU,${(params.startingMAU || 0).toLocaleString()}\n`;
        csv += `App Price,${formatCurrency(params.appPrice || 0)}/month\n`;
        csv += `Annual Discount,${((params.annualDiscount || 0) * 100).toFixed(1)}%\n`;
        csv += `Annual Plan %,${((params.annualPlanPercentage || 0) * 100).toFixed(1)}%\n`;
        csv += `Initial Conversion,${((params.initialConversion || 0) * 100).toFixed(1)}%\n`;
        csv += `Conversion Growth,${((params.conversionGrowth || 0) * 100).toFixed(1)}% annually\n`;
        csv += `Free User Churn,${((params.freeChurnRate || 0) * 100).toFixed(1)}%\n`;
        csv += `Paid User Churn,${((params.paidChurnRate || 0) * 100).toFixed(1)}%\n`;
        csv += `Churn Improvement,${((params.churnImprovement || 0) * 100).toFixed(1)}%\n`;
        csv += `Year 1 Growth,${((params.growthRates?.[1] || 0) * 100).toFixed(1)}%\n`;
        csv += `Year 2 Growth,${((params.growthRates?.[2] || 0) * 100).toFixed(1)}%\n`;
        csv += `Year 3 Growth,${((params.growthRates?.[3] || 0) * 100).toFixed(1)}%\n`;
        csv += `Team Cost Y1,${formatCurrency(params.teamCosts?.[1] || 0)}\n`;
        csv += `Team Cost Y2,${formatCurrency(params.teamCosts?.[2] || 0)}\n`;
        csv += `Team Cost Y3,${formatCurrency(params.teamCosts?.[3] || 0)}\n`;
        csv += `Tech Cost Y1,${formatCurrency(params.techCosts?.[1] || 0)}\n`;
        csv += `Tech Cost Y2,${formatCurrency(params.techCosts?.[2] || 0)}\n`;
        csv += `Tech Cost Y3,${formatCurrency(params.techCosts?.[3] || 0)}\n`;
        csv += `Marketing Cost Y1,${formatCurrency(params.marketingCosts?.[1] || 0)}\n`;
        csv += `Marketing Cost Y2,${formatCurrency(params.marketingCosts?.[2] || 0)}\n`;
        csv += `Marketing Cost Y3,${formatCurrency(params.marketingCosts?.[3] || 0)}\n`;
        csv += `B2B Start Month,${params.b2bStartMonth || 'N/A'}\n`;
        csv += `B2B Revenue %,${((params.b2bPercentage || 0) * 100).toFixed(0)}%\n`;
        csv += `Seed Investment,${formatCurrency(params.seedInvestment || 0)}\n`;
        csv += `Equity Offered,${((params.equityOffered || 0) * 100).toFixed(1)}%\n`;
        csv += `Exit Multiple,${params.valuationMultiple || 0}x ARR\n\n`;
        
        // Financial Summary Section with null checks
        csv += 'FINANCIAL SUMMARY\n';
        csv += 'Metric,Value\n';
        csv += `Final MAU,${(summary.finalMAU || 0).toLocaleString()}\n`;
        csv += `Final ARR,${formatCurrency(summary.finalARR || 0)}\n`;
        csv += `Break-even Month,${summary.breakEvenMonth || 'Not reached'}\n`;
        csv += `Exit Valuation,${formatCurrency(summary.exitValuation || 0)}\n`;
        csv += `Investor Return,${formatCurrency(summary.investorReturn || 0)} (${(summary.returnMultiple || 0).toFixed(1)}x)\n`;
        csv += `Total Revenue,${formatCurrency(summary.totalRevenue || 0)}\n`;
        csv += `Total Costs,${formatCurrency(summary.totalCosts || 0)}\n`;
        csv += `Net Profit/Loss,${formatCurrency(summary.netProfit || 0)}\n`;
        csv += `LTV:CAC Ratio,${summary.ltvCacRatio || 'N/A'}:1\n`;
        csv += `Monthly ARPU,${formatCurrency(summary.monthlyARPU || 0)}\n`;
        csv += `Runway,${summary.runway || 'N/A'} months\n`;
        csv += `Current Burn Rate,${(summary.currentBurnRate || 0) > 0 ? formatCurrency(summary.currentBurnRate) : 'Profitable'}\n\n`;
        
        // Monthly Data Section
        csv += 'MONTHLY BREAKDOWN\n';
        
        // Dynamic headers based on whether Enterprise tier is enabled
        const isEnterpriseEnabled = document.getElementById('enableEnterpriseTier')?.checked || false;
        const enterpriseHeader = isEnterpriseEnabled ? ',Enterprise Users' : '';
        csv += `Month,Total MAU,Growth Rate,Free Users,Basic Users,Pro Users${enterpriseHeader},Conversion Rate,Monthly Revenue,ARR,Team Costs,Tech Costs,Marketing Costs,Variable Costs,Total Costs,Net Income,Cash Balance\n`;
        
        let cashBalance = params.seedInvestment || 0;
        globalMonthlyData.forEach(row => {
            cashBalance += (row.netIncome || 0);
            const monthDisplay = row.isBeta ? `Beta ${row.month}` : row.month;
            const enterpriseData = isEnterpriseEnabled ? `,${(row.enterpriseUsers || 0).toLocaleString()}` : '';
            
            csv += `${monthDisplay},${(row.mau || 0).toLocaleString()},${(((row.realizedGrowthRate !== undefined ? row.realizedGrowthRate : row.growthRate) || 0) * 100).toFixed(1)}%,${(row.freeUsers || 0).toLocaleString()},${(row.basicUsers || 0).toLocaleString()},${(row.proUsers || 0).toLocaleString()}${enterpriseData},${((row.conversionRate || 0) * 100).toFixed(1)}%,${formatCurrency(row.monthlyRevenue || 0)},${formatCurrency(row.arr || 0)},${formatCurrency(row.teamCost || 0)},${formatCurrency(row.techCost || 0)},${formatCurrency(row.marketingCost || 0)},${formatCurrency(row.variableCosts || 0)},${formatCurrency(row.monthlyCosts || 0)},${formatCurrency(row.netIncome || 0)},${formatCurrency(cashBalance)}\n`;
        });

        // Create and download the CSV file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `nutrisnap-financial-forecast-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the object URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
            // Fallback for older browsers
            window.open(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
        }

        console.log('✅ CSV export completed successfully');
        
    } catch (error) {
        console.error('❌ CSV export error:', error);
        alert(`Error exporting CSV: ${error.message}. Please check console for details and try again.`);
    }
}

function exportToPDF() {
    if (!globalMonthlyData || globalMonthlyData.length === 0) {
        alert('No data available to export. Please run calculations first.');
        return;
    }

    try {
        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            console.error('jsPDF not loaded');
            alert('PDF export library not loaded. Please refresh the page and try again.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Document settings
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPosition = margin;
        
        // Helper functions
        const addSection = (title, fontSize = 16) => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = margin;
            }
            doc.setFontSize(fontSize);
            doc.setFont(undefined, 'bold');
            doc.text(title, margin, yPosition);
            yPosition += 10;
        };
        
        const addText = (text, value = '', fontSize = 10) => {
            if (yPosition > pageHeight - 10) {
                doc.addPage();
                yPosition = margin;
            }
            doc.setFontSize(fontSize);
            doc.setFont(undefined, 'normal');
            doc.text(text, margin, yPosition);
            if (value) {
                doc.text(value, margin + 80, yPosition);
            }
            yPosition += 6;
        };
        
        // Title Page
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('NutriSnap Financial Forecast', margin, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += 20;
        
        // Get summary data from the displayed results or global data
        const summary = globalSummaryData || {};
        const params = summary.parameters || {};
        
        // Executive Summary
        addSection('Executive Summary');
        addText('Final MAU:', (summary.finalMAU || 0).toLocaleString());
        addText('Final ARR:', formatCurrency(summary.finalARR || 0));
        addText('Break-even Month:', summary.breakEvenMonth || 'Not Reached');
        addText('Total Revenue:', formatCurrency(summary.totalRevenue || 0));
        addText('Total Costs:', formatCurrency(summary.totalCosts || 0));
        addText('Net Profit/Loss:', formatCurrency(summary.netProfit || 0));
        addText('LTV:CAC Ratio:', summary.ltvCacRatio || 'N/A');
        addText('Exit Valuation:', formatCurrency(summary.exitValuation || 0));
        addText('Runway:', summary.runway || 'N/A');
        yPosition += 10;
        
        // Key Parameters
        addSection('Key Parameters');
        addText('App Price:', formatCurrency(params.appPrice || 0) + '/month');
        addText('Initial Conversion Rate:', ((params.initialConversion || 0) * 100).toFixed(1) + '%');
        addText('Year 1 Growth Rate:', ((params.growthRates?.[1] || 0) * 100).toFixed(1) + '%');
        addText('Free User Churn:', ((params.freeChurnRate || 0) * 100).toFixed(1) + '%');
        addText('Paid User Churn:', ((params.paidChurnRate || 0) * 100).toFixed(1) + '%');
        addText('Seed Investment:', formatCurrency(params.seedInvestment || 0));
        addText('Equity Given:', ((params.equityOffered || 0) * 100).toFixed(1) + '%');
        yPosition += 10;
        
        // CAC Breakdown
        addSection('Customer Acquisition Metrics');
        addText('Customer LTV:', formatCurrency(summary.customerLTV || 0));
        addText('Customer CAC:', formatCurrency(summary.customerCAC || 0));
        addText('Monthly ARPU:', formatCurrency(summary.monthlyARPU || 0));
        addText('Total Marketing Costs:', formatCurrency(summary.totalMarketingCosts || 0));
        addText('Sales Overhead (20%):', formatCurrency(summary.salesOverhead || 0));
        addText('Total Users Acquired:', (summary.totalUsersAcquired || 0).toLocaleString());
        addText('Payback Period:', summary.paybackPeriod || 'N/A');
        yPosition += 10;
        
        // Monthly Data Table (if autoTable is available)
        if (typeof window.jsPDFAutoTable !== 'undefined' || doc.autoTable) {
            addSection('Monthly Projections Summary');
            
            // Show first 12 months + key milestones
            const keyMonths = globalMonthlyData.filter((row, index) => {
                return index < 12 || row.month % 6 === 0 || (row.netIncome >= 0 && globalMonthlyData[index-1]?.netIncome < 0);
            }).slice(0, 24); // Limit to prevent table overflow
            
            const tableData = keyMonths.map(row => [
                row.isBeta ? `Beta ${row.month}` : `M${row.month}`,
                (row.mau || 0).toLocaleString(),
                `${(((row.realizedGrowthRate !== undefined ? row.realizedGrowthRate : row.growthRate) || 0) * 100).toFixed(1)}%`,
                (row.premiumUsers || 0).toLocaleString(),
                `${((row.conversionRate || 0) * 100).toFixed(1)}%`,
                formatCurrency(row.monthlyRevenue || 0),
                formatCurrency(row.monthlyCosts || 0),
                formatCurrency(row.netIncome || 0)
            ]);
            
            try {
                doc.autoTable({
                    head: [['Month', 'MAU', 'Growth', 'Premium', 'Conv.', 'Revenue', 'Costs', 'Net Income']],
                    body: tableData,
                    startY: yPosition,
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [102, 126, 234], fontSize: 9 },
                    alternateRowStyles: { fillColor: [248, 249, 250] },
                    margin: { left: margin, right: margin },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 20 },
                        2: { cellWidth: 15 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 15 },
                        5: { cellWidth: 25 },
                        6: { cellWidth: 25 },
                        7: { cellWidth: 25 }
                    }
                });
                
                yPosition = doc.lastAutoTable.finalY + 10;
            } catch (tableError) {
                console.warn('AutoTable failed, skipping table:', tableError);
                addText('Monthly table data available in CSV export.');
            }
        } else {
            addText('For detailed monthly breakdown, please use the CSV export option.');
        }
        
        // Footer
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.text('Generated by NutriSnap Financial Forecast Tool', margin, pageHeight - 10);
        
        // Save the PDF
        const fileName = `nutrisnap-financial-forecast-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        console.log('✅ PDF export completed:', fileName);
        
    } catch (error) {
        console.error('❌ PDF export error:', error);
        alert('Error generating PDF. Please try again or use CSV export.');
    }
}

function exportScreenshot() {
    if (typeof html2canvas === 'undefined') {
        alert('Screenshot library not loaded. Please refresh the page and try again.');
        return;
    }
    
    const outputSection = document.getElementById('outputSection');
    if (!outputSection) {
        alert('No results to screenshot. Please run calculations first.');
        return;
    }
    
    // Show loading state
    const originalButton = event.target;
    const originalText = originalButton.textContent;
    originalButton.textContent = '📸 Capturing...';
    originalButton.disabled = true;
    
    html2canvas(outputSection, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: outputSection.scrollWidth,
        height: outputSection.scrollHeight
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `nutrisnap-forecast-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log('✅ Screenshot saved');
        
        // Restore button
        originalButton.textContent = originalText;
        originalButton.disabled = false;
    }).catch(error => {
        console.error('❌ Screenshot error:', error);
        alert('Error taking screenshot. Please try again.');
        
        // Restore button
        originalButton.textContent = originalText;
        originalButton.disabled = false;
    });
}

// Alias for compatibility (HTML calls exportScreenshot, but function is named takeScreenshot)
function takeScreenshot() {
    exportScreenshot();
}

// Make functions globally available
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.exportScreenshot = exportScreenshot;
window.takeScreenshot = takeScreenshot;

console.log('✅ Export functions loaded and made globally available'); 