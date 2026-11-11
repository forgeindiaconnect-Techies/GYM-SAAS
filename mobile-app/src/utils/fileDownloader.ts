import { Platform, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

// Clean currency formatter
const formatINR = (val: number | string) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate?: string;
  dueDate?: string;
  gymName?: string;
  gymAddress?: string;
  gymPhone?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  membershipId?: string;
  items: Array<{
    description: string;
    quantity?: number;
    amount: number;
  }>;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: 'PAID' | 'PENDING' | 'FAILED' | 'COMPLETED' | string;
  notes?: string;
}

export interface ReportDetails {
  title: string;
  subtitle?: string;
  gymName?: string;
  dateRange?: string;
  generatedAt?: string;
  headers: string[];
  rows: (string | number)[][];
  summaryMetrics?: Array<{ label: string; value: string | number }>;
}

export interface CertificateDetails {
  recipientName: string;
  recipientRole?: string;
  awardTitle: string;
  awardCategory?: string;
  description?: string;
  gymName?: string;
  awardDate?: string;
  certificateId: string;
  metricAchieved?: string;
  conferredBy?: string;
}

/**
 * Generate full HTML for clean, professional PDF Invoices
 */
const generateInvoiceHTML = (inv: InvoiceDetails): string => {
  const dateStr = inv.invoiceDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const isPaid = (inv.paymentStatus || 'PAID').toUpperCase() === 'PAID' || (inv.paymentStatus || '').toUpperCase() === 'COMPLETED';

  const rowsHtml = inv.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 12px 14px; color: #475569; font-size: 13px;">${idx + 1}</td>
      <td style="padding: 12px 14px; font-weight: 600; color: #0f172a; font-size: 13px;">${item.description}</td>
      <td style="padding: 12px 14px; text-align: center; color: #475569; font-size: 13px;">${item.quantity || 1}</td>
      <td style="padding: 12px 14px; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">${formatINR(item.amount)}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Invoice - ${inv.invoiceNumber}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        background: #ffffff;
        margin: 0;
        padding: 32px;
      }
      .card {
        max-width: 780px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #f97316;
        padding-bottom: 20px;
        margin-bottom: 24px;
      }
      .brand-title {
        font-size: 26px;
        font-weight: 800;
        color: #c2410c;
        margin: 0 0 6px 0;
        letter-spacing: -0.5px;
      }
      .brand-sub {
        font-size: 12px;
        color: #64748b;
        margin: 0;
      }
      .badge-paid {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: ${isPaid ? '#dcfce7' : '#fee2e2'};
        color: ${isPaid ? '#15803d' : '#b91c1c'};
      }
      .meta-grid {
        display: flex;
        justify-content: space-between;
        margin-bottom: 28px;
        gap: 20px;
      }
      .meta-box {
        flex: 1;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 14px 16px;
      }
      .meta-box h4 {
        margin: 0 0 6px 0;
        font-size: 11px;
        text-transform: uppercase;
        color: #94a3b8;
        letter-spacing: 0.5px;
      }
      .meta-box p {
        margin: 2px 0;
        font-size: 13px;
        color: #334155;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      th {
        background: #f8fafc;
        color: #475569;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 10px 14px;
        border-bottom: 1px solid #cbd5e1;
        text-align: left;
      }
      .totals-area {
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;
      }
      .totals-table {
        width: 280px;
      }
      .totals-table tr td {
        padding: 6px 10px;
        font-size: 13px;
      }
      .grand-total {
        font-size: 17px !important;
        font-weight: 800 !important;
        color: #c2410c !important;
        border-top: 2px solid #e2e8f0;
      }
      .footer-note {
        margin-top: 36px;
        border-top: 1px dashed #cbd5e1;
        padding-top: 18px;
        text-align: center;
        font-size: 11px;
        color: #94a3b8;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div>
          <h1 class="brand-title">${inv.gymName || 'Perfect Fitness Studio'}</h1>
          <p class="brand-sub">${inv.gymAddress || 'Premier Fitness, Training & Wellness Club'}</p>
          ${inv.gymPhone ? `<p class="brand-sub">Phone: ${inv.gymPhone}</p>` : ''}
        </div>
        <div style="text-align: right;">
          <div class="badge-paid">${inv.paymentStatus || 'PAID'}</div>
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 8px;">${inv.invoiceNumber}</div>
          <div style="font-size: 12px; color: #64748b;">Date: ${dateStr}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-box">
          <h4>Billed To</h4>
          <p style="font-weight: 700; color: #0f172a;">${inv.customerName}</p>
          ${inv.membershipId ? `<p>Member ID: <strong>${inv.membershipId}</strong></p>` : ''}
          ${inv.customerEmail ? `<p>${inv.customerEmail}</p>` : ''}
          ${inv.customerPhone ? `<p>${inv.customerPhone}</p>` : ''}
        </div>
        <div class="meta-box">
          <h4>Payment Summary</h4>
          <p>Method: <strong>${inv.paymentMethod || 'UPI / Online'}</strong></p>
          <p>Status: <strong style="color: ${isPaid ? '#15803d' : '#b91c1c'};">${inv.paymentStatus || 'Paid'}</strong></p>
          <p>Disbursement: <strong>Instant Settlement</strong></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Service / Plan Description</th>
            <th style="text-align: center; width: 60px;">Qty</th>
            <th style="text-align: right; width: 110px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="totals-area">
        <table class="totals-table">
          <tr>
            <td style="color: #64748b;">Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">${formatINR(inv.subtotal)}</td>
          </tr>
          ${inv.discount ? `
          <tr>
            <td style="color: #16a34a;">Discount:</td>
            <td style="text-align: right; color: #16a34a; font-weight: 600;">-${formatINR(inv.discount)}</td>
          </tr>` : ''}
          ${inv.tax ? `
          <tr>
            <td style="color: #64748b;">Taxes & GST (18%):</td>
            <td style="text-align: right; font-weight: 600;">${formatINR(inv.tax)}</td>
          </tr>` : ''}
          <tr>
            <td class="grand-total">Total Amount:</td>
            <td class="grand-total" style="text-align: right;">${formatINR(inv.total)}</td>
          </tr>
        </table>
      </div>

      ${inv.notes ? `
      <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 10px 14px; border-radius: 6px; margin-top: 20px; font-size: 12px; color: #9a3412;">
        <strong>Note:</strong> ${inv.notes}
      </div>` : ''}

      <div class="footer-note">
        This is an official computer-generated receipt from ${inv.gymName || 'Perfect Fitness Studio'}. No physical signature required. Thank you for training with us!
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Generate full HTML for Reports (Financials, Attendance, Metrics)
 */
const generateReportHTML = (rep: ReportDetails): string => {
  const genDate = rep.generatedAt || new Date().toLocaleString('en-IN');
  const metricCards = (rep.summaryMetrics || []).map(m => `
    <div style="flex: 1; min-width: 140px; background: #fff7ed; border: 1px solid #fdba74; border-radius: 10px; padding: 12px 16px;">
      <div style="font-size: 11px; font-weight: 700; color: #c2410c; text-transform: uppercase;">${m.label}</div>
      <div style="font-size: 18px; font-weight: 800; color: #9a3412; margin-top: 4px;">${m.value}</div>
    </div>
  `).join('');

  const tableHead = rep.headers.map(h => `<th style="padding: 10px 12px; background: #f1f5f9; color: #334155; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; text-align: left;">${h}</th>`).join('');

  const tableRows = rep.rows.map((row, rIdx) => `
    <tr style="background: ${rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      ${row.map(cell => `<td style="padding: 10px 12px; font-size: 12px; color: #1e293b;">${cell}</td>`).join('')}
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${rep.title}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
        margin: 0;
        padding: 30px;
      }
      .report-header {
        border-bottom: 2px solid #ea580c;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }
      h1 { font-size: 22px; font-weight: 800; color: #ea580c; margin: 0 0 4px 0; }
      p { font-size: 12px; color: #64748b; margin: 2px 0; }
      .metrics-grid { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    </style>
  </head>
  <body>
    <div class="report-header">
      <h1>${rep.gymName || 'Perfect Fitness Studio'}</h1>
      <p style="font-weight: 700; font-size: 15px; color: #1e293b;">${rep.title}</p>
      ${rep.subtitle ? `<p>${rep.subtitle}</p>` : ''}
      ${rep.dateRange ? `<p>Period: <strong>${rep.dateRange}</strong></p>` : ''}
      <p>Report Generated: ${genDate}</p>
    </div>

    ${rep.summaryMetrics && rep.summaryMetrics.length > 0 ? `
    <div class="metrics-grid">
      ${metricCards}
    </div>` : ''}

    <table>
      <thead>
        <tr>${tableHead}</tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <div class="footer">
      Generated automatically by Gymora Management Platform &bull; Confidential Business Record &bull; ${genDate}
    </div>
  </body>
  </html>
  `;
};

/**
 * Generate full HTML for Official Certificate of Recognition (matching Web PDF generator)
 */
const generateCertificateHTML = (cert: CertificateDetails): string => {
  const esc = (val?: string) =>
    String(val || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const gym = esc(cert.gymName || 'Perfect Fitness Studio').toUpperCase();
  const recipient = esc(cert.recipientName || 'Award Recipient');
  const roleLabel = esc(cert.recipientRole || '');
  const awardTitle = esc(cert.awardTitle || 'Fitness Champion Award');
  const category = esc(cert.awardCategory || '');
  const description = esc(cert.description || '');
  const metric = esc(cert.metricAchieved || '');
  const certId = esc(cert.certificateId || 'CERT-VERIFIED');
  const awardDate = esc(cert.awardDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  const conferredBy = esc(cert.conferredBy || 'Gym Administration');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Official Certificate - ${certId}</title>
    <style>
      @page { size: landscape; margin: 16px; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: #fcfdfc;
        margin: 0;
        padding: 20px;
        color: #1e293b;
      }
      .outer-frame {
        border: 6px solid #167d78;
        padding: 8px;
        background: #fcfdfc;
        border-radius: 6px;
        position: relative;
      }
      .inner-frame {
        border: 2px solid #d9a74a;
        padding: 36px 40px 28px 40px;
        text-align: center;
        position: relative;
      }
      .gym-name {
        font-size: 16px;
        font-weight: 800;
        color: #167d78;
        letter-spacing: 2px;
        margin-bottom: 10px;
      }
      .cert-heading {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 32px;
        font-weight: 700;
        color: #344b4a;
        letter-spacing: 1px;
        margin: 0 0 8px 0;
      }
      .presented-to {
        font-size: 12px;
        color: #697778;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        margin-bottom: 18px;
      }
      .recipient-name {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 36px;
        font-weight: 700;
        color: #167d78;
        margin: 0;
      }
      .recipient-role {
        font-size: 12px;
        font-weight: 700;
        color: #ea580c;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 4px;
      }
      .gold-divider {
        width: 240px;
        height: 2px;
        background: #d9a74a;
        margin: 12px auto 18px auto;
      }
      .body-intro {
        font-size: 13px;
        color: #344b4a;
        margin-bottom: 10px;
      }
      .award-title {
        font-size: 24px;
        font-weight: 800;
        color: #b45309;
        margin: 4px 0;
      }
      .award-category {
        font-size: 13px;
        font-style: italic;
        color: #697778;
        margin-bottom: 8px;
      }
      .award-desc {
        font-size: 13px;
        color: #475569;
        max-width: 560px;
        margin: 6px auto 12px auto;
        line-height: 1.5;
      }
      .metric-text {
        font-size: 12px;
        font-weight: 700;
        color: #344b4a;
        margin-bottom: 14px;
      }
      .cert-id-box {
        display: inline-block;
        background: #f3f7f6;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 8px 22px;
        font-family: "Courier New", Courier, monospace;
        font-size: 12px;
        font-weight: 800;
        color: #167d78;
        margin: 8px auto 26px auto;
      }
      .footer-grid {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 12px;
        padding: 0 20px;
      }
      .sig-col {
        width: 180px;
        text-align: center;
      }
      .sig-val {
        font-size: 13px;
        font-weight: 700;
        color: #344b4a;
        margin-bottom: 4px;
      }
      .sig-cursive {
        font-family: Georgia, "Times New Roman", serif;
        font-style: italic;
        font-size: 15px;
        font-weight: 700;
        color: #167d78;
        margin-bottom: 4px;
      }
      .sig-line {
        border-top: 1px solid #b4bebe;
        padding-top: 5px;
        font-size: 10px;
        color: #697778;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .seal-circle {
        width: 68px;
        height: 68px;
        border-radius: 34px;
        background: #167d78;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.8px;
        border: 3px double #d9a74a;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="outer-frame">
      <div class="inner-frame">
        <div class="gym-name">${gym}</div>
        <h1 class="cert-heading">CERTIFICATE OF RECOGNITION</h1>
        <div class="presented-to">THIS PRESTIGIOUS HONOR IS PROUDLY PRESENTED TO</div>

        <h2 class="recipient-name">${recipient}</h2>
        ${roleLabel ? `<div class="recipient-role">${roleLabel}</div>` : ''}
        <div class="gold-divider"></div>

        <div class="body-intro">
          In recognition of exemplary fitness dedication, outstanding performance, and milestone achievement in:
        </div>

        <div class="award-title">${awardTitle}</div>
        ${category ? `<div class="award-category">Category: ${category}</div>` : ''}
        ${description ? `<div class="award-desc">&ldquo;${description}&rdquo;</div>` : ''}
        ${metric ? `<div class="metric-text">Milestone Record: ${metric}</div>` : ''}

        <div class="cert-id-box">Certificate ID: ${certId}</div>

        <div class="footer-grid">
          <div class="sig-col">
            <div class="sig-val">${awardDate}</div>
            <div class="sig-line">DATE OF CONFERMENT</div>
          </div>

          <div class="seal-circle">
            <span>OFFICIAL</span>
            <span>SEAL</span>
          </div>

          <div class="sig-col">
            <div class="sig-cursive">${conferredBy}</div>
            <div class="sig-line">AUTHORIZED SIGNATURE</div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Universal Mobile & Web PDF Saver / Downloader
 * Saves or downloads the PDF directly to device storage / Downloads folder!
 */
async function savePDFFile(html: string, safeFilename: string, dialogTitle: string): Promise<void> {
  // 1. Web: Browser print or download
  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    } else {
      Alert.alert('Download Ready', `${safeFilename} rendered successfully.`);
    }
    return;
  }

  // 2. Native Mobile (Android & iOS):
  try {
    // Generate valid PDF file with in-memory base64 to avoid unreadable cache file IO exceptions
    const { uri: tempUri, base64 } = await Print.printToFileAsync({ html, base64: true });

    // Target permanent file path with proper .pdf extension in documentDirectory
    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const cleanDir = baseDir.endsWith('/') ? baseDir : `${baseDir}/`;
    const permanentUri = `${cleanDir}${safeFilename}`;

    if (base64) {
      await FileSystem.writeAsStringAsync(permanentUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    const fileInfo = await FileSystem.getInfoAsync(permanentUri).catch(() => null);
    const validUri = fileInfo && fileInfo.exists ? permanentUri : tempUri;
    const finalFileUri = validUri.startsWith('file://') ? validUri : `file://${validUri}`;

    // On Android & iOS, ExpoSharing requires a local 'file://' URI (NEVER a 'content://' URI).
    // It automatically invokes the native system Save & Share sheet, allowing users to:
    // - Save directly to Downloads / Internal Storage / Files
    // - Save to Google Drive
    // - Open directly with any PDF Reader (Drive PDF, Adobe Acrobat, Mi/Samsung PDF)
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(finalFileUri, {
        UTI: 'com.adobe.pdf',
        mimeType: 'application/pdf',
        dialogTitle: dialogTitle || `Download ${safeFilename}`,
      });
    } else {
      Alert.alert(
        'PDF Saved Successfully! ✅',
        `"${safeFilename}" has been saved to your device storage.`
      );
    }
  } catch (fileErr: any) {
    console.error('[FileDownloader] Failed to save PDF:', fileErr);
    Alert.alert('Download Error', fileErr?.message || 'Unable to download PDF.');
  }
}

/**
 * Universal Mobile & Web Downloader / Exporter
 */
export const FileDownloader = {
  /**
   * Download or Print / Share PDF Invoice
   */
  async downloadInvoicePDF(invoice: InvoiceDetails): Promise<void> {
    try {
      const html = generateInvoiceHTML(invoice);
      const safeFilename = `Invoice_${invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      await savePDFFile(html, safeFilename, `Download Invoice ${invoice.invoiceNumber}`);
    } catch (err: any) {
      console.error('[FileDownloader] Failed to generate invoice:', err);
      Alert.alert('Download Error', err?.message || 'Unable to download PDF invoice.');
    }
  },

  /**
   * Download Report as PDF
   */
  async downloadReportPDF(report: ReportDetails, filenamePrefix = 'Report'): Promise<void> {
    try {
      const html = generateReportHTML(report);
      const safeName = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.pdf`;
      await savePDFFile(html, safeName, `Download ${report.title}`);
    } catch (err: any) {
      console.error('[FileDownloader] Failed to generate report PDF:', err);
      Alert.alert('Download Error', err?.message || 'Unable to download PDF report.');
    }
  },

  /**
   * Download CSV / Excel Data File
   */
  async downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): Promise<void> {
    try {
      const escapeCell = (cell: string | number) => {
        const str = String(cell ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvLines = [
        headers.map(escapeCell).join(','),
        ...rows.map(row => row.map(escapeCell).join(','))
      ];
      const csvString = '\uFEFF' + csvLines.join('\r\n'); // UTF-8 BOM for Excel compatibility

      const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

      if (Platform.OS === 'web') {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', cleanFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Downloaded', `${cleanFilename} downloaded to your device.`);
        return;
      }

      // Native mobile: Save to FileSystem document or cache directory and Share
      const fileUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}${cleanFilename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `Save / Export ${cleanFilename}`,
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('CSV Exported', `Saved to ${fileUri}`);
      }
    } catch (err: any) {
      console.error('[FileDownloader] Failed to export CSV:', err);
      Alert.alert('Export Failed', err?.message || 'Unable to download CSV file.');
    }
  },

  /**
   * Download Trainer Payslip / Fee Receipt
   */
  async downloadPayslipPDF(payout: {
    transactionId: string;
    trainerName: string;
    gymName?: string;
    amount: number;
    billingCycle?: string;
    paymentMethod?: string;
    paymentDate?: string;
    trainingType?: string;
    notes?: string;
  }): Promise<void> {
    const inv: InvoiceDetails = {
      invoiceNumber: `PAY-${payout.transactionId.slice(-8).toUpperCase()}`,
      invoiceDate: payout.paymentDate || new Date().toLocaleDateString('en-IN'),
      gymName: payout.gymName || 'Perfect Fitness Studio',
      customerName: payout.trainerName,
      membershipId: `COACH-${payout.trainerName.replace(/\s+/g, '').toUpperCase().slice(0, 8)}`,
      paymentMethod: payout.paymentMethod || 'Bank Transfer / UPI',
      paymentStatus: 'PAID',
      items: [
        {
          description: `Trainer Coaching Fee Disbursement (${payout.trainingType || 'Hybrid Coaching'})`,
          quantity: 1,
          amount: payout.amount,
        }
      ],
      subtotal: payout.amount,
      total: payout.amount,
      notes: payout.notes || `Disbursed for ${payout.billingCycle || 'Monthly'} coaching period.`,
    };

    return this.downloadInvoicePDF(inv);
  },

  /**
   * Download Official Customer Membership Receipt as real PDF file
   */
  async downloadReceiptPDF(receipt: {
    receiptNumber: string;
    gymName?: string;
    gymAddress?: string;
    gymPhone?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    membershipId?: string;
    planName: string;
    duration?: string;
    amount: number;
    subtotal?: number;
    discount?: number;
    tax?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    validFrom?: string;
    validTo?: string;
  }): Promise<void> {
    const inv: InvoiceDetails = {
      invoiceNumber: receipt.receiptNumber,
      invoiceDate: receipt.validFrom || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      gymName: receipt.gymName || 'Perfect Fitness Studio',
      gymAddress: receipt.gymAddress || 'Premier Fitness, Training & Wellness Club',
      gymPhone: receipt.gymPhone || '+91 98765 43210',
      customerName: receipt.customerName,
      customerEmail: receipt.customerEmail,
      customerPhone: receipt.customerPhone,
      membershipId: receipt.membershipId || 'MEM-428ACD',
      items: [
        {
          description: `${receipt.planName} Package (${receipt.duration || '1 Month'})`,
          quantity: 1,
          amount: receipt.amount,
        }
      ],
      subtotal: receipt.subtotal || receipt.amount,
      discount: receipt.discount || 0,
      tax: receipt.tax || 0,
      total: receipt.amount,
      paymentMethod: receipt.paymentMethod || 'UPI',
      paymentStatus: (receipt.paymentStatus || 'ACTIVE').toUpperCase(),
      notes: `Validity: ${receipt.validFrom || '21 Oct 2026'} to ${receipt.validTo || '21 Nov 2026'}. Thank you for being a valued member at ${receipt.gymName || 'Perfect Fitness Studio'}. This is an electronically verified payment receipt generated by Gymora AI Gym Platform.`
    };

    try {
      const html = generateInvoiceHTML(inv);
      const cleanRecId = receipt.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFilename = `Receipt_${cleanRecId}.pdf`;
      await savePDFFile(html, safeFilename, `Download Receipt - ${receipt.receiptNumber}`);
    } catch (err: any) {
      console.error('[FileDownloader] Failed to generate receipt PDF:', err);
      Alert.alert('Download Error', err?.message || 'Unable to generate receipt PDF.');
    }
  },

  /**
   * Download Official Gym Store Order / Payment Receipt as real PDF file
   */
  async downloadStoreReceiptPDF(order: {
    orderNumber: string;
    gymName?: string;
    gymAddress?: string;
    gymPhone?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    dateDisplay?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    fulfilmentType?: string;
    items?: Array<{ name: string; quantity: number; price: number; attributes?: string }>;
    subtotal?: number;
    discount?: number;
    tax?: number;
    total: number;
    shippingAddress?: string;
  }): Promise<void> {
    const rawItems = order.items && order.items.length > 0 
      ? order.items.map(it => ({
          description: it.attributes ? `${it.name} (${it.attributes})` : it.name,
          quantity: it.quantity || 1,
          amount: (it.price || 0) * (it.quantity || 1),
        }))
      : [
          {
            description: `Store Order Items (${order.fulfilmentType || 'Delivery'})`,
            quantity: 1,
            amount: order.total,
          }
        ];

    const inv: InvoiceDetails = {
      invoiceNumber: order.orderNumber,
      invoiceDate: order.dateDisplay || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      gymName: order.gymName || 'AI Gym Store',
      gymAddress: order.gymAddress || 'Premier Fitness, Training & Wellness Club',
      gymPhone: order.gymPhone || '+91 98765 43210',
      customerName: order.customerName || 'Valued Member',
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: rawItems,
      subtotal: order.subtotal || order.total,
      discount: order.discount || 0,
      tax: order.tax || 0,
      total: order.total,
      paymentMethod: order.paymentMethod || 'UPI',
      paymentStatus: (order.paymentStatus || 'PAID').toUpperCase(),
      notes: `Fulfilment: ${order.fulfilmentType || 'Store Delivery'}. ${order.shippingAddress ? `Address: ${order.shippingAddress}. ` : ''}Thank you for your purchase from Gym Store! Generated electronically via Gymora Platform.`
    };

    try {
      const html = generateInvoiceHTML(inv);
      const cleanNum = order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFilename = `Invoice_${cleanNum}.pdf`;
      await savePDFFile(html, safeFilename, `Download Invoice - ${order.orderNumber}`);
    } catch (err: any) {
      console.error('[FileDownloader] Failed to generate store invoice PDF:', err);
      Alert.alert('Download Error', err?.message || 'Unable to generate store invoice PDF.');
    }
  },

  /**
   * Download Official Award / Recognition Certificate as a real PDF file
   */
  async downloadCertificatePDF(cert: CertificateDetails): Promise<void> {
    try {
      const html = generateCertificateHTML(cert);
      const cleanId = (cert.certificateId || 'CERT').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanTitle = (cert.awardTitle || 'Award').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 24);
      const safeFilename = `Certificate_${cleanTitle}_${cleanId}.pdf`;
      await savePDFFile(html, safeFilename, `Download Official Certificate - ${cert.certificateId}`);
    } catch (err: any) {
      console.error('[FileDownloader] Failed to generate certificate PDF:', err);
      Alert.alert('Download Error', err?.message || 'Unable to generate certificate PDF.');
    }
  }
};
