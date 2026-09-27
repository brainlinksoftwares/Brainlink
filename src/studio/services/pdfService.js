import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR, numberToWordsINR, formatDate } from '../utils/formatters';

export function generateInvoicePDF(invoice, companySettings = {}) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor = [49, 92, 255]; // #315CFF Brainlink Blue
  const darkTextColor = [17, 24, 39];
  const mutedTextColor = [100, 116, 139];
  const borderColor = [226, 232, 240];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Company Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text(companySettings.companyName || 'Brainlink Softwares', 40, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedTextColor);
  doc.text(companySettings.tagline || 'Modern Digital Engineering & AI Solutions', 40, 65);
  doc.text(companySettings.address || 'India', 40, 78);
  doc.text(`GSTIN: ${companySettings.gstin || '07AAAAA0000A1Z5'}  |  PAN: ${companySettings.pan || 'ABCDE1234F'}`, 40, 91);
  doc.text(`Email: ${companySettings.primaryEmail || 'vishnoiaaditya29@gmail.com'}  |  Web: ${companySettings.website || 'https://brainlink.in'}`, 40, 104);

  // Invoice Title & Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...darkTextColor);
  doc.text('TAX INVOICE', pageWidth - 40, 50, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoiceNumber || 'INV-2026-0001'}`, pageWidth - 40, 70, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.invoiceDate || new Date())}`, pageWidth - 40, 85, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.dueDate || new Date())}`, pageWidth - 40, 100, { align: 'right' });
  doc.text(`Status: ${(invoice.status || 'Sent').toUpperCase()}`, pageWidth - 40, 115, { align: 'right' });

  // Divider
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(1);
  doc.line(40, 130, pageWidth - 40, 130);

  // Bill To / Client Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('BILLED TO:', 40, 150);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkTextColor);
  doc.text(invoice.clientName || 'Valued Client', 40, 166);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedTextColor);
  doc.text(invoice.clientCompany || '', 40, 180);
  doc.text(invoice.billingAddress || 'India', 40, 193);
  if (invoice.clientGstin) {
    doc.text(`Client GSTIN: ${invoice.clientGstin}`, 40, 206);
  }
  if (invoice.clientEmail) {
    doc.text(`Email: ${invoice.clientEmail}`, 40, 219);
  }

  // Items Table
  const items = Array.isArray(invoice.items) && invoice.items.length > 0
    ? invoice.items
    : [{ description: 'Software Development & Technical Consulting', hsn: '998314', quantity: 1, rate: invoice.total || 0 }];

  const tableRows = items.map((it, idx) => [
    idx + 1,
    it.description || 'Service',
    it.hsn || '998314',
    Number(it.quantity) || 1,
    formatINR(it.rate || 0, false),
    formatINR((Number(it.quantity) || 1) * (Number(it.rate) || 0), false),
  ]);

  autoTable(doc, {
    startY: 235,
    margin: { left: 40, right: 40 },
    head: [['#', 'Item & Description', 'HSN/SAC', 'Qty', 'Rate (INR)', 'Amount (INR)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: darkTextColor,
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 70, halign: 'center' },
      3: { cellWidth: 45, halign: 'center' },
      4: { cellWidth: 75, halign: 'right' },
      5: { cellWidth: 85, halign: 'right' },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 20;

  // Calculation Summary Box (Right aligned)
  const summaryX = pageWidth - 220;
  let curY = finalY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);

  doc.text('Subtotal:', summaryX, curY);
  doc.text(formatINR(invoice.subtotal || invoice.total, true), pageWidth - 40, curY, { align: 'right' });
  curY += 15;

  if (invoice.discount > 0) {
    doc.text('Discount:', summaryX, curY);
    doc.text(`- ${formatINR(invoice.discount, true)}`, pageWidth - 40, curY, { align: 'right' });
    curY += 15;
  }

  doc.text('Taxable Amount:', summaryX, curY);
  doc.text(formatINR(invoice.taxableAmount || invoice.subtotal || invoice.total, true), pageWidth - 40, curY, { align: 'right' });
  curY += 15;

  if (invoice.taxType === 'intra' || !invoice.taxType) {
    doc.text(`CGST (${((invoice.taxRate || 18) / 2)}%):`, summaryX, curY);
    doc.text(formatINR(invoice.cgst || (invoice.totalTax ? invoice.totalTax / 2 : 0), true), pageWidth - 40, curY, { align: 'right' });
    curY += 15;

    doc.text(`SGST (${((invoice.taxRate || 18) / 2)}%):`, summaryX, curY);
    doc.text(formatINR(invoice.sgst || (invoice.totalTax ? invoice.totalTax / 2 : 0), true), pageWidth - 40, curY, { align: 'right' });
    curY += 15;
  } else {
    doc.text(`IGST (${invoice.taxRate || 18}%):`, summaryX, curY);
    doc.text(formatINR(invoice.igst || invoice.totalTax || 0, true), pageWidth - 40, curY, { align: 'right' });
    curY += 15;
  }

  // Total Line
  doc.setFillColor(243, 244, 246);
  doc.rect(summaryX - 10, curY - 2, 190, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Total Invoice Value:', summaryX, curY + 14);
  doc.text(formatINR(invoice.total, true), pageWidth - 40, curY + 14, { align: 'right' });
  curY += 35;

  // Amount in words
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...mutedTextColor);
  doc.text(`Amount in Words: ${numberToWordsINR(invoice.total)}`, 40, finalY);

  // Bank & Payment Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('BANK & PAYMENT DETAILS', 40, finalY + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkTextColor);
  doc.text(`Account Name: ${companySettings.companyName || 'Brainlink Softwares'}`, 40, finalY + 45);
  doc.text(`Bank: ${companySettings.bankName || 'HDFC Bank Ltd'}`, 40, finalY + 58);
  doc.text(`Account No: ${companySettings.accountNumber || '50200012345678'}`, 40, finalY + 71);
  doc.text(`IFSC Code: ${companySettings.ifscCode || 'HDFC0001234'}`, 40, finalY + 84);
  doc.text(`UPI ID: ${companySettings.upiId || 'brainlink@upi'}`, 40, finalY + 97);

  // Terms and Authorized Signatory
  const footerY = Math.max(curY + 30, finalY + 130);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);
  doc.text('Terms & Conditions:', 40, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  const terms = companySettings.invoiceTerms || 'Payment due within 15 days of issue date.';
  doc.text(doc.splitTextToSize(terms, 300), 40, footerY + 14);

  // Signatory
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);
  doc.text(`For ${companySettings.companyName || 'Brainlink Softwares'}`, pageWidth - 40, footerY, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text('Authorized Signatory', pageWidth - 40, footerY + 45, { align: 'right' });

  // Save PDF
  const filename = `${invoice.invoiceNumber || 'Invoice'}.pdf`;
  doc.save(filename);
}

export function generateQuotationPDF(quotation, companySettings = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(49, 92, 255);
  doc.rect(0, 0, pageWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(49, 92, 255);
  doc.text(companySettings.companyName || 'Brainlink Softwares', 40, 50);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text('FORMAL QUOTATION', pageWidth - 40, 50, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Quotation No: ${quotation.quotationNumber || 'QUOT-2026-0001'}`, pageWidth - 40, 70, { align: 'right' });
  doc.text(`Valid Until: ${formatDate(quotation.validUntil || new Date())}`, pageWidth - 40, 85, { align: 'right' });

  doc.text(`Prepared For: ${quotation.clientName || 'Client'}`, 40, 90);
  doc.text(`Project: ${quotation.projectName || 'Software Development'}`, 40, 105);

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const rows = items.map((it, idx) => [
    idx + 1,
    it.description,
    it.quantity,
    formatINR(it.unitPrice, false),
    formatINR(it.quantity * it.unitPrice, false),
  ]);

  autoTable(doc, {
    startY: 130,
    margin: { left: 40, right: 40 },
    head: [['#', 'Scope of Deliverables', 'Qty', 'Unit Price (INR)', 'Subtotal (INR)']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [49, 92, 255] },
  });

  const finalY = doc.lastAutoTable.finalY + 25;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total Estimated Cost: ${formatINR(quotation.total, true)}`, pageWidth - 40, finalY, { align: 'right' });

  doc.save(`${quotation.quotationNumber || 'Quotation'}.pdf`);
}
