// Clean, structured AuditReportPDF implementation
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

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

const EXEC_BOX_PADDING = 20;

const summaryLineHeight = 11; // reduced line height for tighter spacing

const definePageLayout = (doc) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const availableWidth = pageWidth - (2 * margin);
    return { pageWidth, pageHeight, margin, availableWidth };
};

const addPageHeader = (doc, text, y = 20, margin = 14) => {
    doc.setFontSize(14);
    doc.setTextColor(39, 174, 96);
    doc.text(text, margin, y);
    return y + 15;
};

const addPageFooter = (doc, pageNumber, pageHeight, margin = 14) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, margin, pageHeight - 10);
};

const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const drawBarChart = (doc, data, x, y, width, height, options = {}) => {
    const {
        title = 'Chart Title',
        xLabel = 'Categories',
        yLabel = 'Adherence Rate (%)',
        colors = [PDF_STYLES.colors.primary],
        showGrid = true,
        showValues = true
    } = options;

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Layout values for centering and spacing
    const yAxisLabelAreaWidth = 30; // Estimated space needed for Y-axis labels
    const axisTitleSpacing = 12; // Slightly reduced for a tighter, but still balanced, look

    // Adjust chart area to account for the Y-axis labels, ensuring true center alignment
    const chartAreaWidth = Math.min(width, pageWidth - 40 - yAxisLabelAreaWidth, 380);
    const chartAreaHeight = 110; // Reduced height for a more compact appearance
    const chartPadding = 20;

    // Calculate chart position to be visually centered
    const chartX = (pageWidth - chartAreaWidth) / 2 + yAxisLabelAreaWidth / 2;
    const chartY = y + 15; // Reduced top margin to bring chart closer to title

    // Bar width and spacing
    const barCount = data.length;
    const maxBarWidth = 40;
    const minBarSpacing = 24;
    let barWidth = Math.min(maxBarWidth, (chartAreaWidth - (barCount + 1) * minBarSpacing) / barCount);
    if (barWidth < 10) barWidth = 10;
    let barSpacing = (chartAreaWidth - barCount * barWidth) / (barCount + 1);

    const values = data.map(d => d.value);
    const maxValue = 100;
    const minValue = 0;
    const valueRange = maxValue - minValue;

    doc.setFontSize(PDF_STYLES.fonts.sizes.subtitle);
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.setFont(undefined, 'bold');
    doc.text(title, pageWidth / 2, y + 10, { align: 'center' });

    const yAxisLineTop = chartY + chartPadding;
    const yAxisLineBottom = chartY + chartAreaHeight - chartPadding;
    const yAxisLabelCenterY = yAxisLineTop + (yAxisLineBottom - yAxisLineTop) / 2;

    // Draw Y-axis label with symmetrical spacing
    doc.setFontSize(PDF_STYLES.fonts.sizes.small);
    doc.setTextColor(...PDF_STYLES.colors.grey);
    doc.setFont(undefined, 'normal');
    doc.text(yLabel, chartX - axisTitleSpacing, yAxisLabelCenterY, { align: 'center', angle: 90 });

    const tickCount = 5;
    const tickValueStep = maxValue / tickCount;
    doc.setFontSize(PDF_STYLES.fonts.sizes.small);
    doc.setTextColor(...PDF_STYLES.colors.grey);
    for (let i = 0; i <= tickCount; i++) {
        const value = i * tickValueStep;
        const tickY = yAxisLineBottom - ((value - minValue) / valueRange) * (yAxisLineBottom - yAxisLineTop);
        doc.text(value.toString(), chartX - 8, tickY, { align: 'right', baseline: 'middle' });
        if (showGrid && i > 0) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.line(chartX, tickY, chartX + chartAreaWidth, tickY);
        }
    }

    doc.setDrawColor(...PDF_STYLES.colors.grey);
    doc.setLineWidth(0.5);
    doc.line(chartX, yAxisLineTop, chartX, yAxisLineBottom);
    doc.line(chartX, yAxisLineBottom, chartX + chartAreaWidth, yAxisLineBottom);

    const startXForBars = chartX + barSpacing;
    data.forEach((item, index) => {
        const barX = startXForBars + index * (barWidth + barSpacing);
        const barHeight = ((item.value - minValue) / valueRange) * (yAxisLineBottom - yAxisLineTop);
        const barY = yAxisLineBottom - barHeight;
        const colorIndex = index % colors.length;
        doc.setFillColor(...colors[colorIndex]);
        doc.setDrawColor(...colors[colorIndex]);
        doc.rect(barX, barY, barWidth, barHeight, 'F');
        if (showValues && item.value !== undefined && item.value !== null) {
            doc.setFontSize(PDF_STYLES.fonts.sizes.small);
            doc.setTextColor(...PDF_STYLES.colors.grey);
            doc.text(String(item.value), barX + barWidth / 2, barY - 5, { align: 'center' });
        }
        if (item.label) {
            const labelLines = doc.splitTextToSize(item.label, barWidth + barSpacing - 5);
            if (labelLines && labelLines.length > 0 && labelLines[0]) {
                doc.text(labelLines, barX + barWidth / 2, yAxisLineBottom + 4, { align: 'center' });
            }
        }
    });

    // Draw X-axis label, centered relative to the chart area with symmetrical spacing
    doc.setFontSize(PDF_STYLES.fonts.sizes.small);
    doc.setTextColor(...PDF_STYLES.colors.grey);
    const xAxisTitleX = chartX + chartAreaWidth / 2;
    doc.text(xLabel, xAxisTitleX, yAxisLineBottom + axisTitleSpacing, { align: 'center' });
    doc.setFont(undefined, 'normal');

    return yAxisLineBottom + 30;
};

const drawLineChart = (doc, data, x, y, width, height, options = {}) => {
    const {
        title = 'Chart Title',
        xLabel = 'Date',
        yLabel = 'Compliance Rate (%)',
        colors = [PDF_STYLES.colors.primary],
        showGrid = true,
        showValues = true
    } = options;

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const yAxisLabelAreaWidth = 30;
    const axisTitleSpacing = 14;
    const chartAreaWidth = Math.min(width, pageWidth - 40 - yAxisLabelAreaWidth, 380);
    const chartAreaHeight = 110; // Reduced height for a more compact appearance
    const chartPadding = 20;
    const chartX = (pageWidth - chartAreaWidth) / 2 + yAxisLabelAreaWidth / 2;
    const chartY = y + 15; // Reduced top margin to bring chart closer to title

    const pointCount = data.length;
    const maxValue = 100;
    const minValue = 0;
    const valueRange = maxValue - minValue;

    doc.setFontSize(PDF_STYLES.fonts.sizes.subtitle);
    doc.setTextColor(...PDF_STYLES.colors.primary);
    doc.setFont(undefined, 'bold');
    doc.text(title, pageWidth / 2, y + 10, { align: 'center' });

    const yAxisLineTop = chartY + chartPadding;
    const yAxisLineBottom = chartY + chartAreaHeight - chartPadding;
    const yAxisLabelCenterY = yAxisLineTop + (yAxisLineBottom - yAxisLineTop) / 2;

    // Y-axis label
    doc.setFontSize(PDF_STYLES.fonts.sizes.small);
    doc.setTextColor(...PDF_STYLES.colors.grey);
    doc.setFont(undefined, 'normal');
    doc.text(yLabel, chartX - axisTitleSpacing, yAxisLabelCenterY, { align: 'center', angle: 90 });

    // Y-axis ticks and grid
    const tickCount = 5;
    const tickValueStep = maxValue / tickCount;
    for (let i = 0; i <= tickCount; i++) {
        const value = i * tickValueStep;
        const tickY = yAxisLineBottom - ((value - minValue) / valueRange) * (yAxisLineBottom - yAxisLineTop);
        doc.text(value.toString(), chartX - 8, tickY, { align: 'right', baseline: 'middle' });
        if (showGrid && i > 0) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.line(chartX, tickY, chartX + chartAreaWidth, tickY);
        }
    }
    doc.setDrawColor(...PDF_STYLES.colors.grey);
    doc.setLineWidth(0.5);
    doc.line(chartX, yAxisLineTop, chartX, yAxisLineBottom);
    doc.line(chartX, yAxisLineBottom, chartX + chartAreaWidth, yAxisLineBottom);

    // Draw line
    if (data.length > 1) {
        doc.setDrawColor(...colors[0]);
        doc.setLineWidth(1.2);
        for (let i = 1; i < data.length; i++) {
            const prev = data[i - 1];
            const curr = data[i];
            const prevX = chartX + ((i - 1) / (data.length - 1)) * chartAreaWidth;
            const prevY = yAxisLineBottom - ((prev.value - minValue) / valueRange) * (yAxisLineBottom - yAxisLineTop);
            const currX = chartX + (i / (data.length - 1)) * chartAreaWidth;
            const currY = yAxisLineBottom - ((curr.value - minValue) / valueRange) * (yAxisLineBottom - yAxisLineTop);
            doc.line(prevX, prevY, currX, currY);
        }
    }
    // Draw points and X labels
    data.forEach((item, i) => {
        const pointX = chartX + (i / (data.length - 1)) * chartAreaWidth;
        const pointY = yAxisLineBottom - ((item.value - minValue) / valueRange) * (yAxisLineBottom - yAxisLineTop);
        doc.setFillColor(...colors[0]);
        doc.circle(pointX, pointY, 2, 'F');
        if (showValues && item.value !== undefined && item.value !== null) {
            doc.setFontSize(PDF_STYLES.fonts.sizes.small);
            doc.setTextColor(...PDF_STYLES.colors.grey);
            doc.text(String(item.value), pointX, pointY - 6, { align: 'center' });
        }
        if (item.label) {
            const labelLines = doc.splitTextToSize(item.label, 40);
            if (labelLines && labelLines.length > 0 && labelLines[0]) {
                doc.text(labelLines, pointX, yAxisLineBottom + 6, { align: 'center' });
            }
        }
    });
    // X-axis label
    const xAxisTitleX = chartX + chartAreaWidth / 2;
    doc.setFontSize(PDF_STYLES.fonts.sizes.small);
    doc.setTextColor(...PDF_STYLES.colors.grey);
    doc.text(xLabel, xAxisTitleX, yAxisLineBottom + axisTitleSpacing, { align: 'center' });
    doc.setFont(undefined, 'normal');
    return yAxisLineBottom + 30;
};

function renderJustifiedDescription(doc, desc, x, y, maxWidth, extraSpace = 10, lineHeightFactor = 1.4) {
    doc.text(desc, x, y, { maxWidth, align: 'justify', lineHeightFactor });
    // Estimate line count for spacing
    const lines = doc.splitTextToSize(desc, maxWidth);
    const fontSize = doc.getFontSize();
    return y + lines.length * fontSize * lineHeightFactor + extraSpace;
}

const drawBox = (doc, x, y, width, height, color, isRounded = false) => {
            doc.setFillColor(...color);
            doc.setDrawColor(...color);
            doc.setLineWidth(0.1);
            if (isRounded) {
                doc.roundedRect(x, y, width, height, 2, 2, 'F');
            } else {
                doc.rect(x, y, width, height, 'F');
            }
        };

const drawSeparatorLine = (doc, y, margin, pageWidth) => {
            doc.setLineWidth(0.5);
            doc.setDrawColor(39, 174, 96);
            doc.line(margin, y, pageWidth - margin, y);
        };

export default function generateAuditReportPDF(data, options) {
    const doc = new jsPDF();
    const { pageWidth, pageHeight, margin, availableWidth } = definePageLayout(doc);
        const currentDateFormatted = formatDateToYYYYMMDD(new Date());

        // ===== PAGE 1: EXECUTIVE SUMMARY =====
        doc.setFontSize(18);
        doc.setTextColor(39, 174, 96);
        doc.text(options.reportType, margin, 22);
    drawSeparatorLine(doc, 54, margin, pageWidth);

        // Add logo on the right
        const logoUrl = `${window.location.origin}/logo.png`;
        const logoWidth = 20;
        const logoHeight = 20;
        const logoX = pageWidth - margin - logoWidth;
        const logoY = 12;
        try {
            doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (error) {
            doc.setFontSize(16);
            doc.setTextColor(39, 174, 96);
            doc.text("NexusComply", logoX, 22);
        }

        // Add report metadata
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${currentDateFormatted}`, margin, 30);
    if (options.dateRange) {
        doc.text(`Date Range: ${options.dateRange.start} to ${options.dateRange.end}`, margin, 38);
    }
        if (options.filter && options.filter !== 'all') {
            doc.text(`Filter: ${options.filter}`, margin, 46);
        }

    // First page separator (again, for spacing)
    drawSeparatorLine(doc, 54, margin, pageWidth);

    // Add executive summary description (dynamic by report type)
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
    let desc = "";
        if (options.reportType === 'Outlet Non-Compliance Summary') {
        desc = "This executive summary highlights non-compliance trends across outlets, identifying outlets with the highest and lowest compliance rates.";
        } else if (options.reportType === 'Specific Standard Adherence Report') {
        desc = "This report provides a detailed overview of adherence to specific compliance categories across all audits within the selected period. It highlights which categories are most and least adhered to, supporting targeted improvement efforts.";
        } else {
        desc = "This executive summary highlights key compliance trends and areas requiring attention.";
        }
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    let descY = renderJustifiedDescription(doc, desc, margin, 64, availableWidth, -8, 1.4);
    

    // === REPORT TYPE: SPECIFIC STANDARD ADHERENCE REPORT ===
        if (options.reportType === 'Specific Standard Adherence Report') {
        // Executive Summary
            const categories = data.tableRows || [];
            const totalCategories = categories.length;
            const avgAdherence = categories.length > 0 ? (categories.reduce((sum, c) => sum + (parseFloat(c.adherenceRate) || 0), 0) / categories.length).toFixed(1) : 0;
            const mostAdhered = categories.reduce((max, c) => (parseFloat(c.adherenceRate) > parseFloat(max.adherenceRate) ? c : max), categories[0] || { categoryName: '', adherenceRate: 0 });
            const leastAdhered = categories.reduce((min, c) => (parseFloat(c.adherenceRate) < parseFloat(min.adherenceRate) ? c : min), categories[0] || { categoryName: '', adherenceRate: 100 });
        // Executive Summary Box
            const summaryItems = [
                { label: 'Total Compliance Categories', value: totalCategories },
                { label: 'Most Adhered Category', value: mostAdhered ? `${mostAdhered.categoryName} (${mostAdhered.adherenceRate}%)` : '-' },
                { label: 'Least Adhered Category', value: leastAdhered ? `${leastAdhered.categoryName} (${leastAdhered.adherenceRate}%)` : '-' },
                { label: 'Average Adherence Rate', value: `${avgAdherence}%` },
            ];
            const summaryY = 100;
            const execBoxHeight = summaryItems.length * summaryLineHeight + EXEC_BOX_PADDING + (EXEC_BOX_PADDING * 1.5);
            const execBoxY = summaryY - EXEC_BOX_PADDING;
            drawBox(doc, margin, execBoxY, pageWidth - (2 * margin), execBoxHeight, PDF_STYLES.colors.lightGreen);
            // Start content at top padding, extra space is at the bottom
            let execY = execBoxY + EXEC_BOX_PADDING;
            doc.setFontSize(16);
            doc.setTextColor(...PDF_STYLES.colors.primary);
            doc.setFont(undefined, 'bold');
            doc.text("Executive Summary", margin + 14, execY);
            const labelX = margin + 14;
            const maxLabelWidth = Math.max(...summaryItems.map(item => doc.getTextWidth(`• ${item.label}`)));
            const valueStartX = labelX + maxLabelWidth + 16;
            const firstItemY = execY + 16;
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

            addPageFooter(doc, 1, pageHeight, margin);
        // Page 2: Chart
            doc.addPage();
            addPageHeader(doc, "Compliance Category Adherence Rates", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
            const chartIntro = "The following chart shows adherence rates for each compliance category, making it easy to identify which categories are best and least followed.";
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
        renderJustifiedDescription(doc, chartIntro, margin, 40, availableWidth, -8, 1.4);
        if (categories.length > 0) {
            const chartData = categories.map(category => ({
                label: category.categoryName || '',
                value: parseFloat(category.adherenceRate) || 0
            }));
            const nextY = drawBarChart(doc, chartData, margin, 62, availableWidth, 120, {
                title: 'Compliance Category Adherence Rates',
                xLabel: 'Categories',
                yLabel: 'Adherence Rate (%)',
                showGrid: true,
                showValues: true
            });
            
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            doc.text('Chart Interpretation:', margin, nextY + 8);
            doc.setTextColor(80, 80, 80);
            const chartInterpPoints = [
                '• Each bar represents a compliance category\'s adherence rate.',
                '• Longer bars indicate higher adherence.',
                '• Compare bar lengths to identify best and worst performing categories.'
            ];
            chartInterpPoints.forEach((point, i) => {
                doc.text(point, margin + 5, nextY + 16 + i * 8);
            });
            }
            addPageFooter(doc, 2, pageHeight, margin);
        // Page 3: Table
            doc.addPage();
            addPageHeader(doc, "Detailed Adherence Data", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
            const detailIntro = "Comprehensive breakdown of adherence data for each compliance category, providing detailed insights into performance metrics and compliance status.";
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
        renderJustifiedDescription(doc, detailIntro, margin, 40, availableWidth, -8, 1.4);
        const columns = ['Compliance Category', 'Total Audits', 'Adhered Audits', 'Adherence Rate', 'Status'];
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
            startY: 62,
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
                        halign: 'left'
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
        // Page 4: Conclusion (Specific Standard Adherence Report)
            doc.addPage();
            addPageHeader(doc, "Conclusion", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
        const conclusionDesc = "This section provides targeted recommendations to improve compliance performance based on the latest audit results.";
        const conclusionPoints = [
            `Focus on improving ${leastAdhered.categoryName} (currently at ${leastAdhered.adherenceRate}%)`,
            `Maintain high performance in ${mostAdhered.categoryName} (currently at ${mostAdhered.adherenceRate}%)`,
            `Review low-performing categories in the next management meeting`,
            `Average adherence rate across all categories: ${avgAdherence}%`
        ];
        const descY = renderJustifiedDescription(doc, conclusionDesc, margin, 40, availableWidth, -8, 1.4);
        const boxWidth = pageWidth - 2 * margin;
        const maxBulletWidth = boxWidth - 2 * EXEC_BOX_PADDING;
        const pointsCount = conclusionPoints.length;
        const pointsHeight = pointsCount * summaryLineHeight;
        const boxHeight = pointsHeight + EXEC_BOX_PADDING + (EXEC_BOX_PADDING * 1.5);
        const boxY = descY + 0.5;
        drawBox(doc, margin, boxY, boxWidth, boxHeight, PDF_STYLES.colors.lightGreen);
        let lineY = boxY + EXEC_BOX_PADDING;
        conclusionPoints.forEach((point) => {
            const x = margin + EXEC_BOX_PADDING;
            const highlights = [
                { regex: /low/gi, bold: true },
                { regex: /high/gi, bold: true },
                { regex: /compliance trends/gi, bold: true },
                { regex: /\d{4}-\d{2}-\d{2}/g, bold: true },
                { regex: /\d+[.,]?\d*%/g, bold: true },
            ];
            // Additional: Bold category/outlet name in points like 'Focus on improving [X] (currently at ...)' or 'Maintain high performance in [X] (currently at ...)' 
            const outletCategoryMatch = point.match(/(?:Focus on improving|Maintain high performance in) ([^(]+) \(currently at/);
            if (outletCategoryMatch) {
                const name = outletCategoryMatch[1].trim();
                if (name) {
                    highlights.push({ regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), bold: true });
                }
            }
            const lines = doc.splitTextToSize(point, maxBulletWidth);
            lines.forEach((line, lineIdx) => {
                let cursorX = x;
                let idx = 0;
                let matches = [];
                highlights.forEach(h => {
                    let m;
                    while ((m = h.regex.exec(line)) !== null) {
                        matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], bold: h.bold });
                    }
                });
                matches.sort((a, b) => a.start - b.start);
                if (lineIdx === 0) {
                    doc.setFont(undefined, 'normal');
                    doc.text('• ', cursorX, lineY, { baseline: 'top' });
                    cursorX += doc.getTextWidth('• ');
                }
                for (let m = 0; m < matches.length; m++) {
                    let match = matches[m];
                    if (match.start > idx) {
                        doc.setFont(undefined, 'normal');
                        let normalText = line.slice(idx, match.start);
                        doc.text(normalText, cursorX, lineY, { baseline: 'top' });
                        cursorX += doc.getTextWidth(normalText);
                    }
                    doc.setFont(undefined, 'bold');
                    doc.text(match.text, cursorX, lineY, { baseline: 'top' });
                    cursorX += doc.getTextWidth(match.text);
                    idx = match.end;
                }
                if (idx < line.length) {
                    doc.setFont(undefined, 'normal');
                    let normalText = line.slice(idx);
                    doc.text(normalText, cursorX, lineY, { baseline: 'top' });
                }
                lineY += summaryLineHeight;
            });
        });
        addPageFooter(doc, 4, pageHeight, margin);
        return doc;
    }
    // === REPORT TYPE: OUTLET NON-COMPLIANCE SUMMARY ===
    else if (options.reportType === 'Outlet Non-Compliance Summary') {
        // Executive Summary
        const outletRows = data.tableRows || [];
        const totalOutlets = outletRows.length;
        const avgOutletComplianceRate = outletRows.length > 0 ? (outletRows.reduce((sum, o) => sum + (parseFloat(o.complianceRate) || 0), 0) / outletRows.length).toFixed(1) : 0;
        const mostCompliant = outletRows.reduce((max, o) => (parseFloat(o.complianceRate) > parseFloat(max.complianceRate) ? o : max), outletRows[0] || { outletName: '', complianceRate: 0 });
        const leastCompliant = outletRows.reduce((min, o) => (parseFloat(o.complianceRate) < parseFloat(min.complianceRate) ? o : min), outletRows[0] || { outletName: '', complianceRate: 100 });
        // Executive Summary Box
            const summaryItems = [
                { label: 'Total Outlets Evaluated', value: totalOutlets },
                { label: 'Most Compliant Outlet', value: mostCompliant ? `${mostCompliant.outletName} (${mostCompliant.complianceRate}%)` : '-' },
                { label: 'Least Compliant Outlet', value: leastCompliant ? `${leastCompliant.outletName} (${leastCompliant.complianceRate}%)` : '-' },
            { label: 'Average Compliance Rate', value: `${avgOutletComplianceRate}%` },
            ];
            const summaryY = 100;
            const execBoxHeight = summaryItems.length * summaryLineHeight + EXEC_BOX_PADDING + (EXEC_BOX_PADDING * 1.5);
            const execBoxY = summaryY - EXEC_BOX_PADDING;
            let execY = execBoxY + EXEC_BOX_PADDING;
        drawBox(doc, margin, execBoxY, pageWidth - (2 * margin), execBoxHeight, PDF_STYLES.colors.lightGreen);
            doc.setFontSize(16);
            doc.setTextColor(...PDF_STYLES.colors.primary);
            doc.setFont(undefined, 'bold');
            doc.text("Executive Summary", margin + 14, execY);
            const labelX = margin + 14;
            const maxLabelWidth = Math.max(...summaryItems.map(item => doc.getTextWidth(`• ${item.label}`)));
        const valueStartX = labelX + maxLabelWidth + 16;
            const firstItemY = execY + 16;
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
        addPageFooter(doc, 1, pageHeight, margin);
        // Page 2: Chart
            doc.addPage();
            addPageHeader(doc, "Outlet Compliance Rates", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
            const barIntro = "The following chart shows the compliance rates for each outlet, making it easy to identify outlets with the highest and lowest compliance.";
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
        renderJustifiedDescription(doc, barIntro, margin, 40, availableWidth, -8, 1.4);
        if (outletRows.length > 0) {
            const chartData = outletRows.map(row => ({
                label: row.outletName || '',
                value: parseFloat(row.complianceRate) || 0
            }));
            const nextY = drawBarChart(doc, chartData, margin, 62, availableWidth, 200, {
                title: 'Outlet Compliance Rates',
                xLabel: 'Outlets',
                yLabel: 'Compliance Rate (%)',
                showGrid: true,
                showValues: true
            });

            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            doc.text('Chart Interpretation:', margin, nextY + 8);
            doc.setTextColor(80, 80, 80);
            const chartInterpPoints = [
                '• Each bar represents an outlet\'s compliance rate.',
                '• Longer bars indicate higher compliance.',
                '• Compare bar lengths to identify best and worst performers.'
            ];
            chartInterpPoints.forEach((point, i) => {
                doc.text(point, margin + 5, nextY + 16 + i * 8);
            });
            }
            addPageFooter(doc, 2, pageHeight, margin);
        // Page 3: Table
            doc.addPage();
            addPageHeader(doc, "Outlet Non-Compliance Summary", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
            const detailIntro = "Summary of non-compliance issues across all outlets, highlighting outlets with the most non-compliance and areas requiring attention.";
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
        renderJustifiedDescription(doc, detailIntro, margin, 40, availableWidth, -8, 1.4);
        const columns = ['Outlet Name', 'Total Audits', 'Non-Compliant Audits', 'Compliance Rate', 'Status'];
            const colWidths = {
                'Outlet Name': availableWidth * 0.28,
                'Total Audits': availableWidth * 0.16,
                'Non-Compliant Audits': availableWidth * 0.18,
                'Compliance Rate': availableWidth * 0.18,
                'Status': availableWidth * 0.20
            };
        const tableData = outletRows.map((item) => [
                item.outletName || item.state || '',
                item.totalAudits || 0,
                item.nonCompliantAudits || 0,
                `${item.complianceRate || 0}%`,
                item.status || ''
            ]);
            autoTable(doc, {
            startY: 62,
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
                        halign: 'left'
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
        // Page 4: Conclusion
            doc.addPage();
            addPageHeader(doc, "Conclusion", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
        const conclusionDesc = "This section provides targeted recommendations to address non-compliance and support continuous improvement across all outlets.";
        const conclusionPoints = [
            `Focus on improving ${leastCompliant.outletName} (currently at ${leastCompliant.complianceRate}%)`,
            `Maintain high performance in ${mostCompliant.outletName} (currently at ${mostCompliant.complianceRate}%)`,
            `Review low-performing outlets in the next management meeting`,
            `Average compliance rate across all outlets: ${avgOutletComplianceRate}%`
        ];
        const descY = renderJustifiedDescription(doc, conclusionDesc, margin, 40, availableWidth, -8, 1.4);
        const boxWidth = pageWidth - 2 * margin;
        const maxBulletWidth = boxWidth - 2 * EXEC_BOX_PADDING;
        const pointsCount = conclusionPoints.length;
        const pointsHeight = pointsCount * summaryLineHeight;
        const boxHeight = pointsHeight + EXEC_BOX_PADDING + (EXEC_BOX_PADDING * 1.5);
        const boxY = descY + 0.5;
        
        drawBox(doc, margin, boxY, boxWidth, boxHeight, PDF_STYLES.colors.lightGreen);
        // === Render bullet points inside the green box ===
        let lineY = boxY + EXEC_BOX_PADDING;
        conclusionPoints.forEach((point) => {
            const x = margin + EXEC_BOX_PADDING;
            const highlights = [
                { regex: /low/gi, bold: true },
                { regex: /high/gi, bold: true },
                { regex: /compliance trends/gi, bold: true },
                { regex: /\d{4}-\d{2}-\d{2}/g, bold: true },
                { regex: /\d+[.,]?\d*%/g, bold: true },
            ];
            // Additional: Bold category/outlet name in points like 'Focus on improving [X] (currently at ...)' or 'Maintain high performance in [X] (currently at ...)' 
            const outletCategoryMatch = point.match(/(?:Focus on improving|Maintain high performance in) ([^(]+) \(currently at/);
            if (outletCategoryMatch) {
                const name = outletCategoryMatch[1].trim();
                if (name) {
                    highlights.push({ regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), bold: true });
                }
            }
            const lines = doc.splitTextToSize(point, maxBulletWidth);
            lines.forEach((line, lineIdx) => {
                let cursorX = x;
                let idx = 0;
                let matches = [];
                highlights.forEach(h => {
                    let m;
                    while ((m = h.regex.exec(line)) !== null) {
                        matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], bold: h.bold });
                    }
                });
                matches.sort((a, b) => a.start - b.start);
                if (lineIdx === 0) {
                    doc.setFont(undefined, 'normal');
                    doc.text('• ', cursorX, lineY, { baseline: 'top' });
                    cursorX += doc.getTextWidth('• ');
                }
                for (let m = 0; m < matches.length; m++) {
                    let match = matches[m];
                    if (match.start > idx) {
                        doc.setFont(undefined, 'normal');
                        let normalText = line.slice(idx, match.start);
                        doc.text(normalText, cursorX, lineY, { baseline: 'top' });
                        cursorX += doc.getTextWidth(normalText);
                    }
                    doc.setFont(undefined, 'bold');
                    doc.text(match.text, cursorX, lineY, { baseline: 'top' });
                    cursorX += doc.getTextWidth(match.text);
                    idx = match.end;
                }
                if (idx < line.length) {
                    doc.setFont(undefined, 'normal');
                    let normalText = line.slice(idx);
                    doc.text(normalText, cursorX, lineY, { baseline: 'top' });
                }
                lineY += summaryLineHeight;
            });
        });
        addPageFooter(doc, 4, pageHeight, margin);
        return doc;
    }
    // === REPORT TYPE: OVERALL COMPLIANCE TRENDS REPORT ===
    else {
            // Overall Compliance Trends Report
            const tableRows = data.tableRows || [];
            const complianceRates = tableRows.map(row => parseFloat(row.complianceRate) || 0);
            const totalCompliantAudits = tableRows.reduce((sum, row) => sum + (row.compliantAudits || 0), 0);
            const totalNonCompliantAudits = tableRows.reduce((sum, row) => sum + (row.nonCompliantAudits || 0), 0);
        const totalAudits = data?.summary?.totalAudits ?? 0;
        const totalPartiallyCompliantAudits = Math.max(0, totalAudits - totalCompliantAudits - totalNonCompliantAudits);
        const avgComplianceRate = complianceRates.length > 0 ? (complianceRates.reduce((sum, rate) => sum + rate, 0) / complianceRates.length).toFixed(1) : null;
        const highestComplianceRate = complianceRates.length > 0 ? Math.max(...complianceRates).toFixed(1) : null;
        const lowestComplianceRate = complianceRates.length > 0 ? Math.min(...complianceRates).toFixed(1) : null;

        const summaryItems = [
            { label: 'Total Audits', value: totalAudits },
            { label: 'Compliant Audits', value: totalCompliantAudits },
            { label: 'Partially Compliant Audits', value: totalPartiallyCompliantAudits },
            { label: 'Non-Compliant Audits', value: totalNonCompliantAudits },
            { label: 'Average Compliance Rate', value: avgComplianceRate ? `${avgComplianceRate}%` : '-' },
            { label: 'Highest Compliance Rate', value: highestComplianceRate ? `${highestComplianceRate}%` : '-' },
            { label: 'Lowest Compliance Rate', value: lowestComplianceRate ? `${lowestComplianceRate}%` : '-' }
        ];

        const summaryY = 100;
        const execBoxHeight = summaryItems.length * summaryLineHeight + EXEC_BOX_PADDING + (EXEC_BOX_PADDING * 1.5);
        const execBoxY = summaryY - EXEC_BOX_PADDING;
        let execY = execBoxY + EXEC_BOX_PADDING;
        drawBox(doc, margin, execBoxY, pageWidth - (2 * margin), execBoxHeight, PDF_STYLES.colors.lightGreen);
        doc.setFontSize(16);
            doc.setTextColor(...PDF_STYLES.colors.primary);
            doc.setFont(undefined, 'bold');
            doc.text("Executive Summary", margin + 14, execY);
            const labelX = margin + 14;
            const maxLabelWidth = Math.max(...summaryItems.map(item => doc.getTextWidth(`• ${item.label}`)));
            const valueStartX = labelX + maxLabelWidth + 16;
            const firstItemY = execY + 16;
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
        addPageFooter(doc, 1, pageHeight, margin);
        // ===== PAGE 2: COMPLIANCE TREND ANALYSIS =====
        doc.addPage();
        addPageHeader(doc, "Compliance Trend Analysis", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
            doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        const trendIntro = "The following chart illustrates the compliance rate trends over the selected period, providing insights into performance patterns and identifying areas that require attention.";
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        renderJustifiedDescription(doc, trendIntro, margin, 40, availableWidth, -8, 1.4);
            let chartY = 62;

        // Debug log for trendData
        console.log("PDF trendData:", data.trendData);

        // Generate and add chart
        if (data.trendData && Array.isArray(data.trendData) && data.trendData.length > 0) {
            try {
                // Convert data to the format expected by drawLineChart
                const chartData = data.trendData.map(item => ({
                    label: item.date || '',
                    value: parseFloat(item.complianceRate) || 0
                }));
                
                const chartWidth = pageWidth - (2 * margin);
                const chartHeight = chartWidth * 0.5;
                
                // Draw line chart directly using jsPDF
                const nextY = drawLineChart(doc, chartData, margin, chartY, chartWidth, chartHeight, {
                    title: 'Compliance Rate Trend Analysis',
                    xLabel: 'Date',
                    yLabel: 'Compliance Rate (%)',
                    colors: [PDF_STYLES.colors.primary],
                    showGrid: true,
                    showValues: true
                });

                // Restore original font size and style for Chart Interpretation
                doc.setFontSize(11);
                doc.setTextColor(80, 80, 80);
                doc.text('Chart Interpretation:', margin, nextY + 8);
                const chartInterpPoints = [
                    '• Trend lines show compliance rate progression over time',
                    '• Peaks indicate periods of high compliance',
                    '• Valleys suggest areas requiring immediate attention'
                ];
                chartInterpPoints.forEach((point, i) => {
                    doc.text(point, margin + 5, nextY + 16 + i * 8);
                });
            } catch (error) {
                console.error('Failed to generate chart:', error);
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text("Chart data unavailable for the selected period.", margin, chartY);
            }
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text("No trend data available for the selected period.", chartY);
        }

        addPageFooter(doc, 2, pageHeight, margin);

        // ===== PAGE 3: DETAILED COMPLIANCE DATA =====
        doc.addPage();
        addPageHeader(doc, "Detailed Compliance Data", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
            doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        const detailIntro = "Comprehensive breakdown of compliance data across all audited areas, providing detailed insights into specific performance metrics and compliance status.";
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        renderJustifiedDescription(doc, detailIntro, margin, 40, availableWidth, -8, 1.4);
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

        // ===== PAGE 4: CONCLUSION (Unified for all report types) =====
        doc.addPage();
        addPageHeader(doc, "Conclusion", 30, margin);
        drawSeparatorLine(doc, 54, margin, pageWidth);
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);

        // Determine dynamic content for the conclusion based on report type
        let conclusionDesc = "";
        let conclusionPoints = [];
        
        if (options.reportType === 'Specific Standard Adherence Report') {
            // Category adherence
            const categories = data.tableRows || [];
            const mostAdhered = categories.reduce((max, c) => (parseFloat(c.adherenceRate) > parseFloat(max.adherenceRate) ? c : max), categories[0] || { categoryName: '', adherenceRate: 0 });
            const leastAdhered = categories.reduce((min, c) => (parseFloat(c.adherenceRate) < parseFloat(min.adherenceRate) ? c : min), categories[0] || { categoryName: '', adherenceRate: 100 });
            const avgAdherence = categories.length > 0 ? (categories.reduce((sum, c) => sum + (parseFloat(c.adherenceRate) || 0), 0) / categories.length).toFixed(1) : 0;
            conclusionDesc = "This section provides targeted recommendations to improve compliance performance based on the latest audit results.";
            conclusionPoints = [
                `Focus on improving ${leastAdhered.categoryName} (currently at ${leastAdhered.adherenceRate}%)`,
                `Maintain high performance in ${mostAdhered.categoryName} (currently at ${mostAdhered.adherenceRate}%)`,
                `Review low-performing categories in the next management meeting`,
                `Average adherence rate across all categories: ${avgAdherence}%`
            ];
        } else if (options.reportType === 'Outlet Non-Compliance Summary') {
            // Outlet compliance
            const outletRows = data.tableRows || [];
            const mostNonCompliant = outletRows.reduce((min, o) => (parseFloat(o.complianceRate) < parseFloat(min.complianceRate) ? o : min), outletRows[0] || { outletName: '', complianceRate: 100 });
            const bestCompliant = outletRows.reduce((max, o) => (parseFloat(o.complianceRate) > parseFloat(max.complianceRate) ? o : max), outletRows[0] || { outletName: '', complianceRate: 0 });
            const avgOutletComplianceRate = outletRows.length > 0 ? (outletRows.reduce((sum, o) => sum + (parseFloat(o.complianceRate) || 0), 0) / outletRows.length).toFixed(1) : 0;
            conclusionDesc = "This section provides targeted recommendations to address non-compliance and support continuous improvement across all outlets.";
            conclusionPoints = [
                `Focus on improving ${mostNonCompliant.outletName} (currently at ${mostNonCompliant.complianceRate}%)`,
                `Maintain high performance in ${bestCompliant.outletName} (currently at ${bestCompliant.complianceRate}%)`,
                `Review low-performing outlets in the next management meeting`,
                `Average compliance rate across all outlets: ${avgOutletComplianceRate}%`
            ];
        } else {
            // Overall Compliance Trends Report
            const tableRows = data.tableRows || [];
            const complianceRates = tableRows.map(row => parseFloat(row.complianceRate) || 0);
            const avgComplianceRate = complianceRates.length > 0 ? (complianceRates.reduce((sum, rate) => sum + rate, 0) / complianceRates.length).toFixed(1) : null;
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
            const today = new Date().toISOString().slice(0, 10);
            function isPast(dateStr) {
                return dateStr && dateStr < today;
            }
            conclusionDesc = "The section provides targeted recommendations based on compliance trends observed during the reporting period.";
            conclusionPoints = [];
            if (worstPeriod && lowestRate !== null) {
                if (isPast(worstPeriod)) {
                    conclusionPoints.push(`Review the factors that led to low compliance during ${worstPeriod} and implement corrective actions for future audits.`);
                } else {
                    conclusionPoints.push(`Focus on improving compliance in the current/next period: ${worstPeriod} (${lowestRate}%)`);
                }
            }
            if (bestPeriod && highestRate !== null) {
                if (isPast(bestPeriod)) {
                    conclusionPoints.push(`Analyze the practices that led to high compliance during ${bestPeriod} and replicate them in future periods.`);
                } else {
                    conclusionPoints.push(`Maintain best practices in the current/next period: ${bestPeriod} (${highestRate}%)`);
                }
            }
            conclusionPoints.push("Review compliance trends regularly to identify and address emerging issues");
            if (avgComplianceRate !== null) {
                conclusionPoints.push(`Average compliance rate for the period: ${avgComplianceRate}%`);
            }
        }
        
        // Render the description with spacing
        const descY = renderJustifiedDescription(doc, conclusionDesc, margin, 40, availableWidth, -8, 1.4);
        const boxWidth = pageWidth - 2 * margin;
        const maxBulletWidth = boxWidth - 2 * EXEC_BOX_PADDING;
        const pointsCount = conclusionPoints.length;
        const pointsHeight = pointsCount * summaryLineHeight;
        const boxHeight = pointsHeight + EXEC_BOX_PADDING + (EXEC_BOX_PADDING * 2);
        const boxY = descY + 0.5;
        
        drawBox(doc, margin, boxY, boxWidth, boxHeight, PDF_STYLES.colors.lightGreen);
        // === Render bullet points inside the green box ===
        let lineY = boxY + EXEC_BOX_PADDING;
        conclusionPoints.forEach((point) => {
            const x = margin + EXEC_BOX_PADDING;
            const highlights = [
                { regex: /low/gi, bold: true },
                { regex: /high/gi, bold: true },
                { regex: /compliance trends/gi, bold: true },
                { regex: /\d{4}-\d{2}-\d{2}/g, bold: true },
                { regex: /\d+[.,]?\d*%/g, bold: true },
            ];
            // Additional: Bold category/outlet name in points like 'Focus on improving [X] (currently at ...)' or 'Maintain high performance in [X] (currently at ...)' 
            const outletCategoryMatch = point.match(/(?:Focus on improving|Maintain high performance in) ([^(]+) \(currently at/);
            if (outletCategoryMatch) {
                const name = outletCategoryMatch[1].trim();
                if (name) {
                    highlights.push({ regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), bold: true });
                }
            }
            const lines = doc.splitTextToSize(point, maxBulletWidth);
            lines.forEach((line, lineIdx) => {
                let cursorX = x;
                let idx = 0;
                let matches = [];
                highlights.forEach(h => {
                    let m;
                    while ((m = h.regex.exec(line)) !== null) {
                        matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], bold: h.bold });
                    }
                });
                matches.sort((a, b) => a.start - b.start);
                if (lineIdx === 0) {
                    doc.setFont(undefined, 'normal');
                    doc.text('• ', cursorX, lineY, { baseline: 'top' });
                    cursorX += doc.getTextWidth('• ');
                }
                for (let m = 0; m < matches.length; m++) {
                    let match = matches[m];
                    if (match.start > idx) {
                        doc.setFont(undefined, 'normal');
                        let normalText = line.slice(idx, match.start);
                        doc.text(normalText, cursorX, lineY, { baseline: 'top' });
                        cursorX += doc.getTextWidth(normalText);
                    }
                    doc.setFont(undefined, 'bold');
                    doc.text(match.text, cursorX, lineY, { baseline: 'top' });
                    cursorX += doc.getTextWidth(match.text);
                    idx = match.end;
                }
                if (idx < line.length) {
                    doc.setFont(undefined, 'normal');
                    let normalText = line.slice(idx);
                    doc.text(normalText, cursorX, lineY, { baseline: 'top' });
                }
                lineY += summaryLineHeight;
            });
        });
        addPageFooter(doc, 4, pageHeight, margin);
        addPageFooter(doc, 1, pageHeight, margin);
        return doc;
        }
        return doc;
}

function getReportFileName(reportTitle) {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    return reportTitle.replace(/\s+/g, '_') + '_' + dateStr + '.pdf';
}

export { generateAuditReportPDF, getReportFileName };