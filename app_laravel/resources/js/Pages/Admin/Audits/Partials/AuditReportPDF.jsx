import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Constants for PDF styling
const PDF_STYLES = {
    colors: {
        primary: [39, 174, 96],
        lightGreen: [240, 248, 240],
        grey: [80, 80, 80],
        lightGrey: [150, 150, 150]
    },
    fonts: {
        sizes: {
            title: 18,
            subtitle: 14,
            normal: 10,
            small: 8
        }
    },
    spacing: {
        margin: 14,
        padding: 12
    }
};

// Helper function to generate chart image
const generateChartImage = (trendData) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a container for the chart
            const container = document.createElement('div');
            container.style.width = '600px';
            container.style.height = '300px';
            container.style.position = 'absolute';
            container.style.left = '-9999px';  // Move off-screen
            document.body.appendChild(container);

            // Initialize canvas
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 300;
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            // Ensure we have valid data
            const validData = Array.isArray(trendData) ? trendData : [];

            // Initialize chart configuration
            const chartConfig = {
                type: 'line',
                data: {
                    labels: validData.map(item => item.date || ''),
                    datasets: [{
                        label: 'Compliance Rate (%)',
                        data: validData.map(item => Number(item.complianceRate) || 0),
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false, // Disable animations for PDF
                    plugins: {
                        title: {
                            display: true,
                            text: 'Compliance Rate Trend Analysis',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            display: true,
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20
                            }
                        },
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            };

            // Create the chart
            const chart = new Chart(ctx, chartConfig);

            // Wait for chart to render
            setTimeout(() => {
                // Convert to image and clean up
                const imageData = canvas.toDataURL('image/png');
                document.body.removeChild(container);
                resolve(imageData);
            }, 500);
        } catch (error) {
            console.error('Chart generation error:', error);
            reject(error);
        }
    });
}

// Define page dimensions and margins at the top
const definePageLayout = (doc) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const availableWidth = pageWidth - (2 * margin);
    return { pageWidth, pageHeight, margin, availableWidth };
};

// Helper function to add page header
const addPageHeader = (doc, text, y = 20, margin = 14) => {
    doc.setFontSize(14);
    doc.setTextColor(39, 174, 96);
    doc.text(text, margin, y);
    return y + 15;
};

// Helper function to add page footer
const addPageFooter = (doc, pageNumber, pageHeight, margin = 14) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, margin, pageHeight - 10);
};

// Helper function to format date
const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


export const generateAuditReportPDF = async (data, options) => {
    try {
        // Initialize PDF document
        const doc = new jsPDF();
        const { pageWidth, pageHeight, margin, availableWidth } = definePageLayout(doc);

        // Draw boxes using simple fills and borders (make available everywhere in this function)
        const drawBox = (x, y, width, height, color, isRounded = false) => {
            doc.setFillColor(...color);
            doc.setDrawColor(...color);
            doc.setLineWidth(0.1);
            if (isRounded) {
                doc.roundedRect(x, y, width, height, 2, 2, 'F');
            } else {
                doc.rect(x, y, width, height, 'F');
            }
        };

        // Helper for consistent separator lines (must be inside to access doc)
        const drawSeparatorLine = (y) => {
            doc.setLineWidth(0.5);
            doc.setDrawColor(39, 174, 96);
            doc.line(margin, y, pageWidth - margin, y);
        };

        // Validate and set default values for summary data
        const summary = {
            totalAudits: data?.summary?.totalAudits ?? 0,
            completedAudits: data?.summary?.completedAudits ?? 0,
            pendingAudits: data?.summary?.pendingAudits ?? 0,
            complianceRate: data?.summary?.complianceRate ?? 0
        };

        const currentDateFormatted = formatDateToYYYYMMDD(new Date());

        // ===== PAGE 1: EXECUTIVE SUMMARY =====

        // Add report header
        doc.setFontSize(18);
        doc.setTextColor(39, 174, 96);
        doc.text(options.reportType, margin, 22);
        drawSeparatorLine(54);

        // Add logo on the right
        const logoUrl = `${window.location.origin}/logo.png`;
        const logoWidth = 20;
        const logoHeight = 20;
        const logoX = pageWidth - margin - logoWidth;
        const logoY = 12;

        try {
            doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (error) {
            console.warn('Failed to load logo:', error);
            doc.setFontSize(16);
            doc.setTextColor(39, 174, 96);
            doc.text("NexusComply", logoX, 22);
        }

        // Add report metadata
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${currentDateFormatted}`, margin, 30);
        doc.text(`Date Range: ${options.dateRange.start} to ${options.dateRange.end}`, margin, 38);

        if (options.filter && options.filter !== 'all') {
            doc.text(`Filter: ${options.filter}`, margin, 46);
        }

        // First page separator
        drawSeparatorLine(54);

        // Add executive summary description
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        if (options.reportType === 'Outlet Non-Compliance Summary') {
            const desc = "This executive summary highlights non-compliance trends across outlets, identifying outlets with the highest and lowest compliance rates.";
            const descLines = doc.splitTextToSize(desc, availableWidth);
            doc.text(descLines, margin, 64, { maxWidth: availableWidth });
        } else if (options.reportType === 'Specific Standard Adherence Report') {
            const desc = "This report provides a detailed overview of adherence to specific compliance categories across all audits within the selected period. It highlights which categories are most and least adhered to, supporting targeted improvement efforts.";
            const descLines = doc.splitTextToSize(desc, availableWidth);
            doc.text(descLines, margin, 64, { maxWidth: availableWidth });
        } else {
            // Overall Compliance Trends Report
            const desc = "This executive summary provides a comprehensive overview of compliance performance across all audited areas, highlighting key trends and identifying areas requiring attention.";
            const descLines = doc.splitTextToSize(desc, availableWidth);
            doc.text(descLines, margin, 64, { maxWidth: availableWidth });
        }

        // Add executive summary box for all reports
        if (options.reportType === 'Specific Standard Adherence Report') {
            // All code that uses 'categories' is inside this block
            const categories = data.tableRows || [];
            const totalCategories = categories.length;
            const avgAdherence = categories.length > 0 ? (categories.reduce((sum, c) => sum + (parseFloat(c.adherenceRate) || 0), 0) / categories.length).toFixed(1) : 0;
            const mostAdhered = categories.reduce((max, c) => (parseFloat(c.adherenceRate) > parseFloat(max.adherenceRate) ? c : max), categories[0] || { categoryName: '', adherenceRate: 0 });
            const leastAdhered = categories.reduce((min, c) => (parseFloat(c.adherenceRate) < parseFloat(min.adherenceRate) ? c : min), categories[0] || { categoryName: '', adherenceRate: 100 });
            // Executive Summary Box (improved alignment)
            const summaryItems = [
                { label: 'Total Compliance Categories', value: totalCategories },
                { label: 'Most Adhered Category', value: mostAdhered ? `${mostAdhered.categoryName} (${mostAdhered.adherenceRate}%)` : '-' },
                { label: 'Least Adhered Category', value: leastAdhered ? `${leastAdhered.categoryName} (${leastAdhered.adherenceRate}%)` : '-' },
                { label: 'Average Adherence Rate', value: `${avgAdherence}%` },
            ];
            const summaryY = 100;
            const summaryLineHeight = 14;
            const summaryBoxPadding = 15;
            const summaryBoxWidth = pageWidth - (2 * margin);
            const summaryBoxHeight = (summaryItems.length * summaryLineHeight) + 2 * summaryBoxPadding + 16;
            drawBox(margin, summaryY - summaryBoxPadding, summaryBoxWidth, summaryBoxHeight, PDF_STYLES.colors.lightGreen);
            doc.setFontSize(16);
            doc.setTextColor(...PDF_STYLES.colors.primary);
            doc.setFont(undefined, 'bold');
            doc.text("Executive Summary", margin + summaryBoxPadding, summaryY);
            // Executive Summary Box (restored style, colon and value moved left)
            const labelX = margin + summaryBoxPadding;
            const maxLabelWidth = Math.max(...summaryItems.map(item => doc.getTextWidth(`• ${item.label}`)));
            const valueStartX = labelX + maxLabelWidth + 16; // 16px gap after the longest label
            const firstItemY = summaryY + 16;
            summaryItems.forEach((item, index) => {
                const yPosition = firstItemY + (index * summaryLineHeight);
                doc.setFont(undefined, 'bold');
                doc.setFontSize(12);
                doc.setTextColor(...PDF_STYLES.colors.grey);
                doc.text(`• ${item.label}`, labelX, yPosition, { baseline: 'middle' });
                doc.setFont(undefined, 'normal');
                doc.setFontSize(12);
                doc.setTextColor(...PDF_STYLES.colors.grey);
                doc.text(':', valueStartX - 8, yPosition, { baseline: 'middle' });
                doc.text(`${item.value}`, valueStartX, yPosition, { baseline: 'middle' });
            });

            // ===== PAGE 2: ADHERENCE CHART =====
            doc.addPage();
            addPageHeader(doc, "Compliance Category Adherence Rates", 30, margin);
            drawSeparatorLine(54);
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            const chartIntro = "The following chart shows adherence rates for each compliance category, making it easy to identify which categories are best and least followed.";
            const chartIntroLines = doc.splitTextToSize(chartIntro, availableWidth);
            doc.text(chartIntroLines, margin, 40, { maxWidth: availableWidth });
            let chartY = 66;
            const chartHeight = 120;
            // Chart debug log
            console.log('Chart data for PDF:', categories);
            const hasValidData = categories.some(
                c => typeof c.adherenceRate === 'number' && !isNaN(c.adherenceRate) && c.adherenceRate > 0
            );
            if (categories.length > 0 && hasValidData) {
                try {
                    const chartImage = await generateStandardBarChartImage(categories, availableWidth, chartHeight, 'y', 20, 'categoryName');
                    doc.addImage(chartImage, 'PNG', margin, chartY, availableWidth, chartHeight);
                    // Chart interpretation
                    const chartEndY = chartY + chartHeight + 20;
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.text("Chart Interpretation:", margin, chartEndY);
                    doc.setFontSize(9);
                    doc.text("• Each bar represents a compliance category's adherence rate.", margin + 5, chartEndY + 8);
                    doc.text("• Longer bars indicate higher adherence.", margin + 5, chartEndY + 16);
                    doc.text("• Compare bar lengths to identify best and worst performing categories.", margin + 5, chartEndY + 24);
                } catch (error) {
                    console.error('Standard Adherence Chart Error:', error, categories);
                    doc.setFontSize(10);
                    doc.setTextColor(150, 150, 150);
                    doc.text("Chart data unavailable for the selected period.", margin, chartY);
                }
            } else {
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text("No valid adherence data to display.", margin, chartY);
            }
            addPageFooter(doc, 2, pageHeight, margin);

            // ===== PAGE 3: DETAILED TABLE =====
            doc.addPage();
            addPageHeader(doc, "Detailed Adherence Data", 30, margin);
            drawSeparatorLine(54);
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            const detailIntro = "Comprehensive breakdown of adherence data for each compliance category, providing detailed insights into performance metrics and compliance status.";
            const detailIntroLines = doc.splitTextToSize(detailIntro, availableWidth);
            doc.text(detailIntroLines, margin, 40, { maxWidth: availableWidth });
            let tableStartY = 62;
            const columns = [
                'Compliance Category',
                'Total Audits',
                'Adhered Audits',
                'Adherence Rate',
                'Status'
            ];
            const colWidths = {
                'Compliance Category': availableWidth * 0.28,
                'Total Audits': availableWidth * 0.16,
                'Adhered Audits': availableWidth * 0.18,
                'Adherence Rate': availableWidth * 0.18,
                'Status': availableWidth * 0.20
            };
            const tableData = categories.map((item) => [
                item.categoryName || '',
                item.totalAudits || 0,
                item.adheredAudits || 0,
                `${item.adherenceRate || 0}%`,
                item.status || ''
            ]);
            autoTable(doc, {
                startY: tableStartY,
                head: [columns],
                body: tableData,
                headStyles: {
                    fillColor: [39, 174, 96],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [240, 248, 240] },
                styles: {
                    fontSize: 10,
                    cellPadding: 2,
                    lineColor: [221, 221, 221],
                    lineWidth: 0.1,
                    overflow: 'linebreak'
                },
                columnStyles: Object.fromEntries(
                    columns.map((col, index) => [
                        index,
                        {
                            cellWidth: colWidths[col],
                            halign: index === 0 ? 'left' : 'left'
                        }
                    ])
                ),
                margin: { left: margin, right: margin },
                didDrawPage: (data) => {
                    addPageFooter(doc, data.pageNumber + 2, pageHeight, margin);
                },
                willDrawCell: (data) => {
                    if (data.section === 'body' && columns[data.column.index] === 'Status') {
                        const value = data.cell.raw?.toLowerCase() || '';
                        let bgColor = [240, 248, 240];
                        let textColor = [39, 174, 96];
                        if (value.includes('low') || value.includes('critical')) {
                            bgColor = [255, 235, 238];
                            textColor = [231, 76, 60];
                        } else if (value.includes('medium') || value.includes('warning')) {
                            bgColor = [255, 249, 196];
                            textColor = [243, 156, 18];
                        }
                        data.cell.styles.fillColor = bgColor;
                        data.cell.styles.textColor = textColor;
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });
            addPageFooter(doc, 3, pageHeight, margin);

            // ===== PAGE 4: CONCLUSION (dynamic box) =====
            doc.addPage();
            addPageHeader(doc, "Conclusion", 30, margin);
            drawSeparatorLine(54);
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            const conclusionDesc = "This report identifies compliance categories with the highest and lowest adherence. Focus improvement efforts on categories with low adherence to enhance overall compliance.";
            const conclusionDescLines = doc.splitTextToSize(conclusionDesc, availableWidth);
            doc.text(conclusionDescLines, margin, 40, { maxWidth: availableWidth, align: 'justify' });
            // Dynamic summary box
            const conclusionBoxY = 62;
            const conclusionBoxPadding = 15;
            const lineHeight = 12;
            const dynamicSummary = `A total of ${totalCategories} compliance categories were evaluated. The most adhered category was ${mostAdhered.categoryName} (${mostAdhered.adherenceRate}%), while the least adhered was ${leastAdhered.categoryName} (${leastAdhered.adherenceRate}%). The average adherence rate was ${avgAdherence}%. Categories with low adherence should be prioritized for improvement.`;
            const dynamicLines = doc.splitTextToSize(dynamicSummary, availableWidth - 2 * conclusionBoxPadding);
            const conclusionBoxHeight = dynamicLines.length * lineHeight + 2 * conclusionBoxPadding;
            drawBox(margin, conclusionBoxY, pageWidth - 2 * margin, conclusionBoxHeight, PDF_STYLES.colors.lightGreen);
            let y = conclusionBoxY + conclusionBoxPadding + 2;
            doc.setFontSize(11);
            doc.setTextColor(...PDF_STYLES.colors.grey);
            dynamicLines.forEach((line, idx) => {
                let cursorX = margin + conclusionBoxPadding;
                const regex = /(\d{4}-\d{2}-\d{2}|\d+%|\d+)/g;
                const isLastLine = idx === dynamicLines.length - 1;
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(line)) !== null) {
                    const before = line.substring(lastIndex, match.index);
                    if (before) {
                        doc.setFont(undefined, 'normal');
                        doc.text(before, cursorX, y, { baseline: 'top' });
                        cursorX += doc.getTextWidth(before);
                    }
                    doc.setFont(undefined, 'bold');
                    doc.text(match[0], cursorX, y, { baseline: 'top' });
                    cursorX += doc.getTextWidth(match[0]);
                    lastIndex = match.index + match[0].length;
                }
                const after = line.substring(lastIndex);
                if (after) {
                    doc.setFont(undefined, 'normal');
                    doc.text(after, cursorX, y, { baseline: 'top' });
                }
                y += lineHeight;
            });
            addPageFooter(doc, 4, pageHeight, margin);
        } else if (options.reportType === 'Outlet Non-Compliance Summary') {
            // Summary Box for Outlet Non-Compliance Summary
            const outletRowsSummary = data.tableRows || [];
            const totalOutlets = outletRowsSummary.length;
            const avgOutletComplianceRateSummary = outletRowsSummary.length > 0 ? (outletRowsSummary.reduce((sum, o) => sum + (parseFloat(o.complianceRate) || 0), 0) / outletRowsSummary.length).toFixed(1) : 0;
            const mostCompliant = outletRowsSummary.reduce((max, o) => (parseFloat(o.complianceRate) > parseFloat(max.complianceRate) ? o : max), outletRowsSummary[0] || { outletName: '', complianceRate: 0 });
            const leastCompliant = outletRowsSummary.reduce((min, o) => (parseFloat(o.complianceRate) < parseFloat(min.complianceRate) ? o : min), outletRowsSummary[0] || { outletName: '', complianceRate: 100 });
            const summaryItems = [
                { label: 'Total Outlets Evaluated', value: totalOutlets },
                { label: 'Most Compliant Outlet', value: mostCompliant ? `${mostCompliant.outletName} (${mostCompliant.complianceRate}%)` : '-' },
                { label: 'Least Compliant Outlet', value: leastCompliant ? `${leastCompliant.outletName} (${leastCompliant.complianceRate}%)` : '-' },
                { label: 'Average Compliance Rate', value: `${avgOutletComplianceRateSummary}%` },
            ];
            const summaryY = 100;
            const summaryLineHeight = 12;
            const summaryBoxPadding = 15;
            const summaryBoxWidth = pageWidth - (2 * margin);
            const summaryBoxHeight = (summaryItems.length * summaryLineHeight) + 2 * summaryBoxPadding + 16;
            drawBox(margin, summaryY - summaryBoxPadding, summaryBoxWidth, summaryBoxHeight, PDF_STYLES.colors.lightGreen);
            doc.setFontSize(16);
            doc.setTextColor(...PDF_STYLES.colors.primary);
            doc.setFont(undefined, 'bold');
            doc.text("Executive Summary", margin + summaryBoxPadding, summaryY);
            // Executive Summary Box (restored style, colon and value moved left)
            const labelX = margin + summaryBoxPadding;
            const maxLabelWidth = Math.max(...summaryItems.map(item => doc.getTextWidth(`• ${item.label}`)));
            const valueStartX = labelX + maxLabelWidth + 16; // 16px gap after the longest label
            const firstItemY = summaryY + 16;
            summaryItems.forEach((item, index) => {
                const yPosition = firstItemY + (index * summaryLineHeight);
                doc.setFont(undefined, 'bold');
                doc.setFontSize(12);
                doc.setTextColor(...PDF_STYLES.colors.grey);
                doc.text(`• ${item.label}`, labelX, yPosition, { baseline: 'middle' });
                doc.setFont(undefined, 'normal');
                doc.setFontSize(12);
                doc.setTextColor(...PDF_STYLES.colors.grey);
                doc.text(':', valueStartX - 8, yPosition, { baseline: 'middle' });
                doc.text(`${item.value}`, valueStartX, yPosition, { baseline: 'middle' });
            });

            // ===== PAGE 2: OUTLET BAR CHART =====
            doc.addPage();
            addPageHeader(doc, "Outlet Compliance Rates", 30, margin);
            drawSeparatorLine(54);
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            const barIntro = "The following chart shows the compliance rates for each outlet, making it easy to identify outlets with the highest and lowest compliance.";
            const barIntroLines = doc.splitTextToSize(barIntro, availableWidth);
            doc.text(barIntroLines, margin, 40, { maxWidth: availableWidth });
            let chartY = 62;
            const outletCount = data.tableRows ? data.tableRows.length : 0;
            const chartHeight = outletCount === 1 ? 60 : 200;
            const indexAxis = 'y';
            const leftPadding = outletCount === 1 ? 20 : 100;
            if (data.tableRows && Array.isArray(data.tableRows) && data.tableRows.length > 0) {
                try {
                    const chartImage = await generateOutletBarChartImage(data.tableRows, availableWidth, chartHeight, indexAxis, leftPadding);
                    doc.addImage(chartImage, 'PNG', margin, chartY, availableWidth, chartHeight);

                    // Add chart interpretation
                    const chartEndY = chartY + chartHeight + 20;
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.text("Chart Interpretation:", margin, chartEndY);
                    doc.setFontSize(9);
                    doc.text("• Each bar represents an outlet's compliance rate.", margin + 5, chartEndY + 8);
                    doc.text("• Longer bars indicate higher compliance.", margin + 5, chartEndY + 16);
                    doc.text("• Compare bar lengths to identify best and worst performers.", margin + 5, chartEndY + 24);
                } catch (error) {
                    console.error('Failed to generate outlet bar chart:', error);
                    doc.setFontSize(10);
                    doc.setTextColor(150, 150, 150);
                    doc.text("Chart data unavailable for the selected period.", margin, chartY);
                }
            } else {
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text("No outlet data available for the selected period.", margin, chartY);
            }
            addPageFooter(doc, 2, pageHeight, margin);

            // ===== PAGE 3: DETAILED TABLE =====
            doc.addPage();
            addPageHeader(doc, "Outlet Non-Compliance Summary", 30, margin);
            drawSeparatorLine(54);
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            const detailIntro = "Summary of non-compliance issues across all outlets, highlighting outlets with the most non-compliance and areas requiring attention.";
            const detailIntroLines = doc.splitTextToSize(detailIntro, availableWidth);
            doc.text(detailIntroLines, margin, 40, { maxWidth: availableWidth });
            let tableStartY = 62;
            const columns = [
                'Outlet Name',
                'Total Audits',
                'Non-Compliant Audits',
                'Compliance Rate',
                'Status'
            ];
            const colWidths = {
                'Outlet Name': availableWidth * 0.28,
                'Total Audits': availableWidth * 0.16,
                'Non-Compliant Audits': availableWidth * 0.18,
                'Compliance Rate': availableWidth * 0.18,
                'Status': availableWidth * 0.20
            };
            const tableData = (data.tableRows || []).map((item) => [
                item.outletName || item.state || '',
                item.totalAudits || 0,
                item.nonCompliantAudits || 0,
                `${item.complianceRate || 0}%`,
                item.status || ''
            ]);
            autoTable(doc, {
                startY: tableStartY,
                head: [columns],
                body: tableData,
                headStyles: {
                    fillColor: [39, 174, 96],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [240, 248, 240] },
                styles: {
                    fontSize: 10,
                    cellPadding: 2,
                    lineColor: [221, 221, 221],
                    lineWidth: 0.1,
                    overflow: 'linebreak'
                },
                columnStyles: Object.fromEntries(
                    columns.map((col, index) => [
                        index,
                        {
                            cellWidth: colWidths[col],
                            halign: index === 0 ? 'left' : 'left'
                        }
                    ])
                ),
                margin: { left: margin, right: margin },
                didDrawPage: (data) => {
                    addPageFooter(doc, data.pageNumber + 2, pageHeight, margin);
                },
                willDrawCell: (data) => {
                    if (data.section === 'body' && columns[data.column.index] === 'Status') {
                        const value = data.cell.raw?.toLowerCase() || '';
                        let bgColor = [240, 248, 240];
                        let textColor = [39, 174, 96];
                        if (value.includes('low') || value.includes('critical')) {
                            bgColor = [255, 235, 238];
                            textColor = [231, 76, 60];
                        } else if (value.includes('medium') || value.includes('warning')) {
                            bgColor = [255, 249, 196];
                            textColor = [243, 156, 18];
                        }
                        data.cell.styles.fillColor = bgColor;
                        data.cell.styles.textColor = textColor;
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });
            addPageFooter(doc, 3, pageHeight, margin);

            // ===== PAGE 4: CONCLUSION =====
            doc.addPage();
            addPageHeader(doc, "Conclusion", 30, margin);
            drawSeparatorLine(54);
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            const conclusionDescription = "This report provides a focused analysis of non-compliance across outlets, highlighting those with the greatest need for improvement and recognizing top performers.";
            const conclusionDescLines = doc.splitTextToSize(conclusionDescription, availableWidth);
            doc.text(conclusionDescLines, margin, 40, { maxWidth: availableWidth, align: 'justify' });

            // Dynamic conclusion for Outlet Non-Compliance Summary
            const outletRowsConclusion = data.tableRows || [];
            const mostNonCompliant = outletRowsConclusion.reduce((min, o) => (parseFloat(o.complianceRate) < parseFloat(min.complianceRate) ? o : min), outletRowsConclusion[0] || { outletName: '', complianceRate: 100 });
            const bestCompliant = outletRowsConclusion.reduce((max, o) => (parseFloat(o.complianceRate) > parseFloat(max.complianceRate) ? o : max), outletRowsConclusion[0] || { outletName: '', complianceRate: 0 });
            const avgOutletComplianceRateConclusion = outletRowsConclusion.length > 0 ? (outletRowsConclusion.reduce((sum, o) => sum + (parseFloat(o.complianceRate) || 0), 0) / outletRowsConclusion.length).toFixed(1) : 0;
            let dynamicConclusion = `A total of ${outletRowsConclusion.length} outlets were audited. The outlet with the lowest compliance rate was ${mostNonCompliant.outletName} (${mostNonCompliant.complianceRate}%), while the best performing outlet was ${bestCompliant.outletName} (${bestCompliant.complianceRate}%). The average compliance rate across all outlets was ${avgOutletComplianceRateConclusion}%. Outlets with low compliance should be prioritized for corrective action and support.`;
            
            const conclusionBoxY = 62;
            const conclusionBoxPadding = 15;
            const lineHeight = 10;
            const dynamicLines = doc.splitTextToSize(dynamicConclusion, availableWidth - 2 * conclusionBoxPadding);
            const conclusionBoxHeight = dynamicLines.length * lineHeight + 2 * conclusionBoxPadding;
            drawBox(margin, conclusionBoxY, pageWidth - 2 * margin, conclusionBoxHeight, PDF_STYLES.colors.lightGreen);
            let y = conclusionBoxY + conclusionBoxPadding + 2;
            doc.setFontSize(11);
            doc.setTextColor(...PDF_STYLES.colors.grey);
            dynamicLines.forEach((line, idx) => {
                let cursorX = margin + conclusionBoxPadding;
                const regex = /(\d{4}-\d{2}-\d{2}|\d+%|\d+)/g;
                const isLastLine = idx === dynamicLines.length - 1;
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(line)) !== null) {
                    const before = line.substring(lastIndex, match.index);
                    if (before) {
                        doc.setFont(undefined, 'normal');
                        doc.text(before, cursorX, y, { baseline: 'top' });
                        cursorX += doc.getTextWidth(before);
                    }
                    doc.setFont(undefined, 'bold');
                    doc.text(match[0], cursorX, y, { baseline: 'top' });
                    cursorX += doc.getTextWidth(match[0]);
                    lastIndex = match.index + match[0].length;
                }
                const after = line.substring(lastIndex);
                if (after) {
                    doc.setFont(undefined, 'normal');
                    doc.text(after, cursorX, y, { baseline: 'top' });
                }
                y += lineHeight;
            });
            addPageFooter(doc, 4, pageHeight, margin);
        } else {
            // Overall Compliance Trends Report
            // Executive Summary Box for Overall Compliance Trends Report
            const tableRows = data.tableRows || [];
            const complianceRates = tableRows.map(row => parseFloat(row.complianceRate) || 0);
            const totalCompliantAudits = tableRows.reduce((sum, row) => sum + (row.compliantAudits || 0), 0);
            const totalNonCompliantAudits = tableRows.reduce((sum, row) => sum + (row.nonCompliantAudits || 0), 0);
        const totalAudits = summary.totalAudits;
        const totalPartiallyCompliantAudits = Math.max(0, totalAudits - totalCompliantAudits - totalNonCompliantAudits);
        const avgComplianceRate = complianceRates.length > 0 ? (complianceRates.reduce((sum, rate) => sum + rate, 0) / complianceRates.length).toFixed(1) : 0;
        const highestComplianceRate = complianceRates.length > 0 ? Math.max(...complianceRates).toFixed(1) : 0;
        const lowestComplianceRate = complianceRates.length > 0 ? Math.min(...complianceRates).toFixed(1) : 0;

        const summaryItems = [
            { label: 'Total Audits', value: totalAudits },
            { label: 'Compliant Audits', value: totalCompliantAudits },
            { label: 'Partially Compliant Audits', value: totalPartiallyCompliantAudits },
            { label: 'Non-Compliant Audits', value: totalNonCompliantAudits },
            { label: 'Average Compliance Rate', value: `${avgComplianceRate}%` },
            { label: 'Highest Compliance Rate', value: `${highestComplianceRate}%` },
            { label: 'Lowest Compliance Rate', value: `${lowestComplianceRate}%` }
        ];

        const summaryY = 100;
        const summaryLineHeight = 12;
        const summaryBoxPadding = 15;
        const summaryBoxWidth = pageWidth - (2 * margin);
        const summaryBoxHeight = (summaryItems.length * summaryLineHeight) + (3 * summaryBoxPadding);
        drawBox(margin, summaryY - summaryBoxPadding, summaryBoxWidth, summaryBoxHeight, PDF_STYLES.colors.lightGreen);
        doc.setFontSize(16);
            doc.setTextColor(...PDF_STYLES.colors.primary);
            doc.setFont(undefined, 'bold');
            doc.text('Executive Summary', margin + summaryBoxPadding, summaryY);
            const labelX = margin + summaryBoxPadding;
            const maxLabelWidth = Math.max(...summaryItems.map(item => doc.getTextWidth(`• ${item.label}`)));
            const valueStartX = labelX + maxLabelWidth + 16; // 16px gap after the longest label
            const firstItemY = summaryY + 16;
        summaryItems.forEach((item, index) => {
                const yPosition = firstItemY + (index * summaryLineHeight);
            doc.setFont(undefined, 'bold');
                doc.setFontSize(12);
                doc.setTextColor(...PDF_STYLES.colors.grey);
                doc.text(`• ${item.label}`, labelX, yPosition, { baseline: 'middle' });
            doc.setFont(undefined, 'normal');
                doc.setFontSize(12);
                doc.setTextColor(...PDF_STYLES.colors.grey);
                doc.text(':', valueStartX - 8, yPosition, { baseline: 'middle' });
                doc.text(`${item.value}`, valueStartX, yPosition, { baseline: 'middle' });
        });

        // ===== PAGE 2: COMPLIANCE TREND ANALYSIS =====
        doc.addPage();
        addPageHeader(doc, "Compliance Trend Analysis", 30, margin);
            drawSeparatorLine(54);
            doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        const trendIntro = "The following chart illustrates the compliance rate trends over the selected period, providing insights into performance patterns and identifying areas that require attention.";
        const trendIntroLines = doc.splitTextToSize(trendIntro, availableWidth);
            doc.text(trendIntroLines, margin, 40, { maxWidth: availableWidth });
            let chartY = 62;

        // Generate and add chart
        if (data.trendData && Array.isArray(data.trendData) && data.trendData.length > 0) {
            try {
                const chartImage = await generateChartImage(data.trendData);
                const chartWidth = pageWidth - (2 * margin);
                const chartHeight = (chartWidth * 0.5);
                doc.addImage(chartImage, 'PNG', margin, chartY, chartWidth, chartHeight);

                // Add chart interpretation
                const chartEndY = chartY + chartHeight + 20;
                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80);
                doc.text("Chart Interpretation:", margin, chartEndY);
                doc.setFontSize(9);
                doc.text("• Trend lines show compliance rate progression over time", margin + 5, chartEndY + 8);
                doc.text("• Peaks indicate periods of high compliance", margin + 5, chartEndY + 16);
                doc.text("• Valleys suggest areas requiring immediate attention", margin + 5, chartEndY + 24);
            } catch (error) {
                console.error('Failed to generate chart:', error);
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text("Chart data unavailable for the selected period.", margin, chartY);
            }
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text("No trend data available for the selected period.", margin, chartY);
        }

        addPageFooter(doc, 2, pageHeight, margin);

        // ===== PAGE 3: DETAILED COMPLIANCE DATA =====
        doc.addPage();
        addPageHeader(doc, "Detailed Compliance Data", 30, margin);
            drawSeparatorLine(54);
            doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        const detailIntro = "Comprehensive breakdown of compliance data across all audited areas, providing detailed insights into specific performance metrics and compliance status.";
        const detailIntroLines = doc.splitTextToSize(detailIntro, availableWidth);
            doc.text(detailIntroLines, margin, 40, { maxWidth: availableWidth });
            let tableStartY = 62;

        const columns = [
            'Date',
            'State',
            'Total Audits',
            'Compliant Audits',
                'Partially Compliant Audits',
            'Non-Compliant Audits',
            'Compliance Rate',
            'Status'
        ];
        const colWidths = {
                'Date': availableWidth * 0.13,
                'State': availableWidth * 0.13,
                'Total Audits': availableWidth * 0.12,
                'Compliant Audits': availableWidth * 0.12,
                'Partially Compliant Audits': availableWidth * 0.12,
                'Non-Compliant Audits': availableWidth * 0.12,
                'Compliance Rate': availableWidth * 0.13,
                'Status': availableWidth * 0.13
            };
            const tableData = tableRows.map((item) => [
                item.date || '',
                item.state || '',
                item.totalAudits || 0,
                item.compliantAudits || 0,
                item.partiallyCompliantAudits || 0,
                item.nonCompliantAudits || 0,
                `${item.complianceRate || 0}%`,
                item.status || ''
            ]);

        autoTable(doc, {
            startY: tableStartY,
            head: [columns],
            body: tableData,
            headStyles: {
                fillColor: [39, 174, 96],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: { fillColor: [240, 248, 240] },
            styles: {
                fontSize: 10,
                cellPadding: 2,
                lineColor: [221, 221, 221],
                lineWidth: 0.1,
                overflow: 'linebreak'
            },
            columnStyles: Object.fromEntries(
                columns.map((col, index) => [
                    index,
                    {
                        cellWidth: colWidths[col],
                        halign: index === 0 ? 'left' : 'left'
                    }
                ])
            ),
            margin: { left: margin, right: margin },
            didDrawPage: (data) => {
                addPageFooter(doc, data.pageNumber + 2, pageHeight, margin);
            },
            willDrawCell: (data) => {
                if (data.section === 'body' && columns[data.column.index] === 'Status') {
                    const value = data.cell.raw?.toLowerCase() || '';
                    let bgColor = [240, 248, 240];
                    let textColor = [39, 174, 96];
                    if (value.includes('low') || value.includes('critical')) {
                        bgColor = [255, 235, 238];
                        textColor = [231, 76, 60];
                    } else if (value.includes('medium') || value.includes('warning')) {
                        bgColor = [255, 249, 196];
                        textColor = [243, 156, 18];
                    }
                    data.cell.styles.fillColor = bgColor;
                    data.cell.styles.textColor = textColor;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

            addPageFooter(doc, 3, pageHeight, margin);

        // ===== PAGE 4: CONCLUSION =====
        doc.addPage();
        addPageHeader(doc, "Conclusion", 30, margin);
            drawSeparatorLine(54);
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
            const conclusionDescription = "This report provides a comprehensive analysis of compliance performance and identifies key areas for improvement. Regular monitoring and implementation of recommended actions will help maintain and improve overall compliance standards.";
            const conclusionDescLines = doc.splitTextToSize(conclusionDescription, availableWidth);
            doc.text(conclusionDescLines, margin, 40, { maxWidth: availableWidth, align: 'justify' });

            // Dynamic conclusion content based on data
            let bestPeriod = '';
            let worstPeriod = '';
            let highestRate = null;
            let lowestRate = null;
            if (tableRows.length > 0) {
                highestRate = Math.max(...tableRows.map(r => parseFloat(r.complianceRate) || 0));
                lowestRate = Math.min(...tableRows.map(r => parseFloat(r.complianceRate) || 0));
                const bestRow = tableRows.find(r => parseFloat(r.complianceRate) === highestRate);
                const worstRow = tableRows.find(r => parseFloat(r.complianceRate) === lowestRate);
                bestPeriod = bestRow ? (bestRow.date || bestRow.state || '') : '';
                worstPeriod = worstRow ? (worstRow.date || worstRow.state || '') : '';
            }
            let recommendation = '';
            if (summary.complianceRate >= 90) {
                recommendation = 'Maintain current best practices and continue regular monitoring to sustain high compliance.';
            } else if (summary.complianceRate >= 70) {
                recommendation = 'Focus on areas with lower compliance and provide targeted training or support.';
            } else {
                recommendation = 'Immediate action is required to address compliance gaps. Implement corrective actions and increase oversight.';
            }
            
            let dynamicConclusion = `During the reporting period, a total of ${summary.totalAudits} audits were conducted, with an overall compliance rate of ${summary.complianceRate}%.`;
            if (bestPeriod && worstPeriod && highestRate !== null && lowestRate !== null) {
                dynamicConclusion += ` The highest compliance was observed in ${bestPeriod} (${highestRate}%), while the lowest was in ${worstPeriod} (${lowestRate}%).`;
            }
            if (summary.pendingAudits > 0) {
                dynamicConclusion += ` There are still ${summary.pendingAudits} pending audits, which may impact the final compliance rate.`;
            }
            dynamicConclusion += `\n${recommendation}`;

            // Render the dynamic conclusion inside a box, with important data bolded and justified
            const conclusionBoxY = 62;
            const conclusionBoxPadding = 15;
            const lineHeight = 10;
            const paragraphs = dynamicConclusion.split('\n');
            let allLines = [];
            paragraphs.forEach(paragraph => {
                const lines = doc.splitTextToSize(paragraph, availableWidth - 2 * conclusionBoxPadding);
                allLines.push(lines);
            });
            const conclusionBoxHeight = allLines.reduce((acc, lines) => acc + lines.length, 0) * lineHeight + 2 * conclusionBoxPadding;
            drawBox(margin, conclusionBoxY, pageWidth - 2 * margin, conclusionBoxHeight, PDF_STYLES.colors.lightGreen);

            let y = conclusionBoxY + conclusionBoxPadding + 2;
        doc.setFontSize(11);
            doc.setTextColor(...PDF_STYLES.colors.grey);
            allLines.forEach(lines => {
                lines.forEach((line, idx) => {
                    let cursorX = margin + conclusionBoxPadding;
                    const regex = /(\d{4}-\d{2}-\d{2}|\d+%|\d+)/g;
                    const isLastLine = idx === lines.length - 1;
                    let lastIndex = 0;
                    let match;
                    while ((match = regex.exec(line)) !== null) {
                        const before = line.substring(lastIndex, match.index);
                        if (before) {
                            doc.setFont(undefined, 'normal');
                            doc.text(before, cursorX, y, { baseline: 'top' });
                            cursorX += doc.getTextWidth(before);
                        }
        doc.setFont(undefined, 'bold');
                        doc.text(match[0], cursorX, y, { baseline: 'top' });
                        cursorX += doc.getTextWidth(match[0]);
                        lastIndex = match.index + match[0].length;
                    }
                    const after = line.substring(lastIndex);
                    if (after) {
        doc.setFont(undefined, 'normal');
                        doc.text(after, cursorX, y, { baseline: 'top' });
                    }
                    y += lineHeight;
                });
            });
            addPageFooter(doc, 4, pageHeight, margin);
        }

        return doc;
    } catch (error) {
        console.error('Error generating audit report PDF:', error);
        throw error;
    }
};

// Add this helper function for the outlet bar chart:
async function generateOutletBarChartImage(outletRows, width, height, indexAxis = 'y', leftPadding = 100) {
    // Higher-DPI rendering for maximum clarity
    const displayWidth = Math.max(width, 400); // Increase width for more space
    const displayHeight = height;
    const scale = 3;
    const canvas = document.createElement('canvas');
    canvas.width = displayWidth * scale;
    canvas.height = displayHeight * scale;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (outletRows.length === 1) {
        leftPadding = 20;
    }
    const labels = outletRows.map(row => row.outletName || '');
    const data = outletRows.map(row => parseFloat(row.complianceRate) || 0);
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Compliance Rate (%)',
                data: data,
                backgroundColor: 'rgba(39, 174, 96, 0.7)',
                borderColor: '#27ae60',
                borderWidth: 1,
                maxBarThickness: 30,
                barPercentage: 0.5,
                categoryPercentage: 0.5
            }]
        },
        options: {
            indexAxis: indexAxis,
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            layout: {
                padding: {
                    left: leftPadding
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 20, font: { size: 10, weight: 'bold' }, maxRotation: 0, minRotation: 0 }
                },
                y: {
                    ticks: { font: { size: 10, weight: 'bold' }, maxRotation: 0, minRotation: 0 }
                }
            }
        }
    });
    return new Promise((resolve, reject) => {
        try {
            setTimeout(() => {
                const imageData = canvas.toDataURL('image/png');
                resolve(imageData);
            }, 500);
        } catch (error) {
            reject(error);
        }
    });
}

// Add a helper function generateStandardBarChartImage similar to generateOutletBarChartImage if needed.

// Add this helper function for the standard bar chart:
async function generateStandardBarChartImage(categoryRows, width, height, indexAxis = 'y', leftPadding = 100, labelField = 'categoryName') {
    let displayHeight;
    if (categoryRows.length <= 2) {
        displayHeight = 100;
    } else if (categoryRows.length <= 4) {
        displayHeight = 140;
    } else {
        displayHeight = Math.min(200, categoryRows.length * 40);
    }
    const displayWidth = Math.max(width, 400);
    const scale = 3;
    // Attach canvas to DOM (off-screen)
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.width = displayWidth * scale;
    canvas.height = displayHeight * scale;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    if (categoryRows.length === 1) leftPadding = 20;

    const labels = categoryRows.map(row => row[labelField] || '');
    const data = categoryRows.map(row => parseFloat(row.adherenceRate) || 0);

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Adherence Rate (%)',
                data: data,
                backgroundColor: 'rgba(39, 174, 96, 0.7)',
                borderColor: 'rgba(39, 174, 96, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: indexAxis,
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 100, ticks: { stepSize: 20, font: { size: 10, weight: 'bold' } } },
                y: { ticks: { font: { size: 10, weight: 'bold' } } }
            },
            layout: { padding: { left: leftPadding } },
            categoryPercentage: 0.7,
            barPercentage: 0.8
        }
    });

    // Wait for Chart.js to finish rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    chart.update();

    const imageData = canvas.toDataURL('image/png');
    document.body.removeChild(container);
    return imageData;
}

export default generateAuditReportPDF;
