import React from 'react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const generateActivityLogPDF = (data, dateRange) => {
    const doc = new jsPDF(); // Set orientation back to default A4 portrait
    
    // Page dimensions for A4 Portrait (210mm x 297mm)
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14; // All margins (left, right, top, bottom)

    // Helper function to format date to YYYY-MM-DD
    const formatDateToYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const currentDateFormatted = formatDateToYYYYMMDD(new Date());

    // Always calculate report date range from actual data
    let reportDateRangeStart = '';
    let reportDateRangeEnd = '';

    if (data.length > 0) {
        const dates = data.map(item => new Date(item.created_at));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        reportDateRangeStart = formatDateToYYYYMMDD(minDate);
        reportDateRangeEnd = formatDateToYYYYMMDD(maxDate);
    } else {
        // Fallback if no data is present
        reportDateRangeStart = currentDateFormatted;
        reportDateRangeEnd = currentDateFormatted;
    }

    // Add report header
    doc.setFontSize(18);
    doc.setTextColor(39, 174, 96); // Green color
    doc.text("System Activity Log", margin, 22); // Aligned with logo Y position
    
    // Add logo on the right
    const logoUrl = `${window.location.origin}/logo.png`;
    const logoWidth = 20;
    const logoHeight = 20;
    const logoX = pageWidth - margin - logoWidth; // Position at the most right
    const logoY = 12; // Adjust to align with title's Y-position more precisely

    try {
        doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
        console.warn('Failed to load logo:', error);
        // If logo fails to load, just show the company name
        doc.setFontSize(16);
        doc.setTextColor(39, 174, 96);
        doc.text("NexusComply", logoX, 22); // Text fallback aligned with title Y
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${currentDateFormatted}`, margin, 30); // Consistent format for generated date
    doc.text(`Date Range: ${reportDateRangeStart} to ${reportDateRangeEnd}`, margin, 38); // Consistent format for date range
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(39, 174, 96);
    doc.line(margin, 50, pageWidth - margin, 50);
    
    // Add description
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("This report provides a detailed overview of all system activities within the specified date range.", margin, 60);
    
    // Calculate available table width for A4 Portrait
    const availableTableWidth = pageWidth - (2 * margin); // 210 - 28 = 182mm

    // Define column widths to exactly fit available width for A4 Portrait
    const colWidth_No = 20; 
    const colWidth_DateTime = 30;
    const colWidth_ActionType = 30;
    const colWidth_TargetType = 30;
    const colWidth_User = 40;
    const colWidth_Details = availableTableWidth - (colWidth_No + colWidth_DateTime + colWidth_ActionType + colWidth_TargetType + colWidth_User); // 182 - (20+30+30+30+40) = 182 - 150 = 32mm

    const colWidths = {
        'No.': colWidth_No,
        'Date/Time': colWidth_DateTime,
        'Action Type': colWidth_ActionType,
        'Target Type': colWidth_TargetType,
        'Details': colWidth_Details,
        'User': colWidth_User
    };

    // Add table
    autoTable(doc, {
        startY: 70,
        head: [['No.', 'Date/Time', 'Action Type', 'Target Type', 'Details', 'User']],
        body: data.map((item, index) => [
            index + 1,
            item.created_at,
            item.action_type,
            item.target_type,
            item.details,
            item.user ? `${item.user.name} (${item.user.email})` : 'System'
        ]),
        headStyles: {
            fillColor: [39, 174, 96], // Green header background from ReportsContent
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: { fillColor: [240, 248, 240] }, // Light green alternating rows from ReportsContent
        styles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: [221, 221, 221],
            lineWidth: 0.1,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { cellWidth: colWidths['No.'], halign: 'center' },
            1: { cellWidth: colWidths['Date/Time'] },
            2: { cellWidth: colWidths['Action Type'] },
            3: { cellWidth: colWidths['Target Type'] },
            4: { cellWidth: colWidths['Details'] },
            5: { cellWidth: colWidths['User'] },
        },
        margin: { right: margin, bottom: 30, left: margin }, // Removed top margin
        didDrawPage: function(data) {
            // Add footer on each page
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const pageInfo = data.pageCount ? `Page ${data.pageNumber} of ${data.pageCount}` : `Page ${data.pageNumber}`;
            doc.text(
                pageInfo,
                data.settings.margin.left,
                pageHeight - 10 // Position from bottom
            );
        }
    });
    
    // Add a separating line before the summary
    doc.setLineWidth(0.5);
    doc.setDrawColor(39, 174, 96); // Green color
    doc.line(margin, doc.lastAutoTable.finalY + 10, pageWidth - margin, doc.lastAutoTable.finalY + 10);

    // Add summary section with more spacing
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(39, 174, 96);
    doc.text("Summary", margin, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    // Calculate summary statistics
    const totalActivities = data.length;
    const userCounts = {};
    const actionTypeCounts = {};
    
    data.forEach(item => {
        const userName = item.user ? item.user.name : 'System';
        userCounts[userName] = (userCounts[userName] || 0) + 1;
        actionTypeCounts[item.action_type] = (actionTypeCounts[item.action_type] || 0) + 1;
    });
    
    const mostActiveUser = Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
    const mostCommonAction = Object.entries(actionTypeCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
    
    // Bold summary items
    doc.setFont('helvetica', 'bold');
    const bulletX = margin + 6;
    const labelX = bulletX + 5; // Space after bullet point

    doc.text(`• Total Activities`, labelX, finalY + 10);
    doc.text(`• Most Active User`, labelX, finalY + 20);
    doc.text(`• Most Common Action`, labelX, finalY + 30);
    
    doc.setFont('helvetica', 'normal');
    
    // Use a fixed, very generous offset for the value text to absolutely prevent any overlap
    // This value is chosen to be larger than any possible bold label width
    const valueXOffset = labelX + 75; // Significantly increased offset

    doc.text(`: ${totalActivities}`, valueXOffset, finalY + 10);
    doc.text(`: ${mostActiveUser}`, valueXOffset, finalY + 20);
    doc.text(`: ${mostCommonAction}`, valueXOffset, finalY + 30);
    
    return doc;
};

export default generateActivityLogPDF; 