// Export Functionality
// Handles CSV, PDF export, and screenshot features

function exportToCSV() {
    console.log('Exporting to CSV...');
    
    // Get data from the current calculation results
    const tableBody = document.getElementById('monthlyTableBody');
    if (!tableBody || !tableBody.children.length) {
        alert('No data available to export. Please run calculations first.');
        return;
    }
    
    // Get dynamic headers from table
    const tableHeader = document.getElementById('monthlyTableHeader');
    const headers = Array.from(tableHeader.children).map(th => th.textContent.replace(/"/g, '""'));
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add title and metadata
    csvContent += '"NutriSnap Financial Forecast Export"\n';
    csvContent += '"Generated on: ' + new Date().toLocaleDateString() + '"\n';
    csvContent += '""\n'; // Empty line
    
    // Add summary data
    csvContent += '"EXECUTIVE SUMMARY"\n';
    csvContent += '"Final MAU","' + (document.getElementById('finalMAU')?.textContent || '') + '"\n';
    csvContent += '"Final ARR","' + (document.getElementById('finalARR')?.textContent || '') + '"\n';
    csvContent += '"Break-even Month","' + (document.getElementById('breakEvenMonth')?.textContent || '') + '"\n';
    csvContent += '"Exit Valuation","' + (document.getElementById('exitValuation')?.textContent || '') + '"\n';
    csvContent += '"Total Revenue","' + (document.getElementById('totalRevenue')?.textContent || '') + '"\n';
    csvContent += '"Total Costs","' + (document.getElementById('totalCosts')?.textContent || '') + '"\n';
    csvContent += '"Net Profit","' + (document.getElementById('netProfit')?.textContent || '') + '"\n';
    csvContent += '"LTV:CAC Ratio","' + (document.getElementById('ltvCacRatio')?.textContent || '') + '"\n';
    csvContent += '"Customer LTV","' + (document.getElementById('customerLTV')?.textContent || '') + '"\n';
    csvContent += '"Monthly ARPU","' + (document.getElementById('monthlyARPU')?.textContent || '') + '"\n';
    csvContent += '"Customer CAC","' + (document.getElementById('customerCAC')?.textContent || '') + '"\n';
    csvContent += '"Runway","' + (document.getElementById('runway')?.textContent || '') + '"\n';
    csvContent += '""\n'; // Empty line
    
    // Add monthly data headers
    csvContent += '"MONTHLY PROJECTIONS"\n';
    csvContent += '"' + headers.join('","') + '"\n';
    
    // Add monthly data rows
    Array.from(tableBody.children).forEach(row => {
        const cells = Array.from(row.children).map(cell => {
            return cell.textContent.replace(/"/g, '""').replace(/,/g, '');
        });
        csvContent += '"' + cells.join('","') + '"\n';
    });
    
    // Create and download file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nutrisnap-financial-forecast-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ CSV export completed');
}

function exportToPDF() {
    const tableBody = document.getElementById('monthlyTableBody');
    if (!tableBody || !tableBody.children.length) {
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
        
        // Get summary data from the DOM elements
        const getText = (id) => document.getElementById(id)?.textContent || 'N/A';
        
        // Executive Summary
        addSection('Executive Summary');
        addText('Final MAU:', getText('finalMAU'));
        addText('Final ARR:', getText('finalARR'));
        addText('Break-even Month:', getText('breakEvenMonth'));
        addText('Exit Valuation:', getText('exitValuation'));
        addText('Investor Return:', getText('investorReturn'));
        addText('Total Revenue:', getText('totalRevenue'));
        addText('Total Costs:', getText('totalCosts'));
        addText('Net Profit/Loss:', getText('netProfit'));
        addText('LTV:CAC Ratio:', getText('ltvCacRatio'));
        addText('Customer LTV:', getText('customerLTV'));
        addText('Monthly ARPU:', getText('monthlyARPU'));
        addText('Customer CAC:', getText('customerCAC'));
        addText('Runway:', getText('runway'));
        addText('Burn Rate:', getText('burnRate'));
        yPosition += 10;
        
        // Key Parameters
        addSection('Key Parameters');
        addText('App Price:', formatCurrency(globalParams.appPrice || 0) + '/month');
        addText('Initial Conversion Rate:', ((globalParams.initialConversion || 0) * 100).toFixed(1) + '%');
        addText('Year 1 Growth Rate:', ((globalParams.growthRates?.[1] || 0) * 100).toFixed(1) + '%');
        addText('Free User Churn:', ((globalParams.freeChurnRate || 0) * 100).toFixed(1) + '%');
        addText('Paid User Churn:', ((globalParams.paidChurnRate || 0) * 100).toFixed(1) + '%');
        addText('Seed Investment:', formatCurrency(globalParams.seedInvestment || 0));
        addText('Equity Given:', ((globalParams.equityOffered || 0) * 100).toFixed(1) + '%');
        yPosition += 10;
        
        // CAC Breakdown
        addSection('Customer Acquisition Metrics');
        addText('Customer LTV:', formatCurrency(globalSummary.customerLTV || 0));
        addText('Customer CAC:', formatCurrency(globalSummary.customerCAC || 0));
        addText('Monthly ARPU:', formatCurrency(globalSummary.monthlyARPU || 0));
        addText('Total Marketing Costs:', formatCurrency(globalSummary.totalMarketingCosts || 0));
        addText('Sales Overhead (20%):', formatCurrency(globalSummary.salesOverhead || 0));
        addText('Total Users Acquired:', (globalSummary.totalUsersAcquired || 0).toLocaleString());
        addText('Payback Period:', globalSummary.paybackPeriod || 'N/A');
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