import { jsPDF } from 'jspdf';

export interface CertificateData {
  recipientName: string;
  recipientRole?: string;
  awardTitle: string;
  awardCategory?: string;
  gymName?: string;
  awardDate: string;
  certificateId: string;
  metricAchieved?: string;
}

export const generateAwardCertificatePDF = (data: CertificateData): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background subtle cream fill
  doc.setFillColor(252, 253, 252);
  doc.rect(0, 0, width, height, 'F');

  // Outer Decorative Border - Emerald #F97316
  doc.setDrawColor(22, 125, 120);
  doc.setLineWidth(3);
  doc.rect(10, 10, width - 20, height - 20);

  // Inner Fine Border - Gold #D9A74A
  doc.setDrawColor(217, 167, 74);
  doc.setLineWidth(1);
  doc.rect(14, 14, width - 28, height - 28);

  // Corner Accents
  const cornerSize = 12;
  doc.setFillColor(22, 125, 120);
  doc.rect(10, 10, cornerSize, 3, 'F');
  doc.rect(10, 10, 3, cornerSize, 'F');
  doc.rect(width - 10 - cornerSize, 10, cornerSize, 3, 'F');
  doc.rect(width - 13, 10, 3, cornerSize, 'F');
  doc.rect(10, height - 13, cornerSize, 3, 'F');
  doc.rect(10, height - 10 - cornerSize, 3, cornerSize, 'F');
  doc.rect(width - 10 - cornerSize, height - 13, cornerSize, 3, 'F');
  doc.rect(width - 13, height - 10 - cornerSize, 3, cornerSize, 'F');

  // Gym Name / Top Brand
  const gym = data.gymName || 'FITNESS & PERFORMANCE CENTER';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(22, 125, 120);
  doc.text(gym.toUpperCase(), width / 2, 28, { align: 'center' });

  // Certificate Header
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(52, 75, 74);
  doc.text('CERTIFICATE OF RECOGNITION', width / 2, 44, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(105, 119, 120);
  doc.text('THIS PRESTIGIOUS HONOR IS PROUDLY PRESENTED TO', width / 2, 54, { align: 'center' });

  // Recipient Name
  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(22, 125, 120);
  doc.text(data.recipientName || 'Award Recipient', width / 2, 72, { align: 'center' });

  // Decorative Line below name
  doc.setDrawColor(217, 167, 74);
  doc.setLineWidth(0.8);
  doc.line(width / 2 - 60, 77, width / 2 + 60, 77);

  // Recognition Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(52, 75, 74);
  doc.text('In recognition of exemplary fitness dedication, outstanding performance, and milestone achievement in:', width / 2, 88, { align: 'center' });

  // Award Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(180, 83, 9); // Gold/Amber accent
  doc.text(data.awardTitle || 'Fitness Champion Award', width / 2, 102, { align: 'center' });

  if (data.awardCategory) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(105, 119, 120);
    doc.text(`Category: ${data.awardCategory}`, width / 2, 111, { align: 'center' });
  }

  if (data.metricAchieved) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(52, 75, 74);
    doc.text(`Milestone Record: ${data.metricAchieved}`, width / 2, 120, { align: 'center' });
  }

  // Verification & ID Box
  doc.setFillColor(243, 247, 246);
  doc.roundedRect(width / 2 - 50, 132, 100, 14, 2, 2, 'F');
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 125, 120);
  doc.text(`Certificate ID: ${data.certificateId || 'CERT-VERIFIED'}`, width / 2, 141, { align: 'center' });

  // Signatures & Date Footer
  const footerY = 175;

  // Left: Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(52, 75, 74);
  doc.text(data.awardDate || new Date().toLocaleDateString(), 55, footerY, { align: 'center' });
  doc.setDrawColor(180, 190, 190);
  doc.setLineWidth(0.5);
  doc.line(30, footerY + 3, 80, footerY + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(105, 119, 120);
  doc.text('DATE OF CONFERMENT', 55, footerY + 8, { align: 'center' });

  // Center: Gym Seal Emblem
  doc.setFillColor(22, 125, 120);
  doc.circle(width / 2, footerY - 5, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL', width / 2, footerY - 7, { align: 'center' });
  doc.text('SEAL', width / 2, footerY - 3, { align: 'center' });

  // Right: Authorized Signature
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(22, 125, 120);
  doc.text('Gym Administration', width - 55, footerY, { align: 'center' });
  doc.setDrawColor(180, 190, 190);
  doc.setLineWidth(0.5);
  doc.line(width - 80, footerY + 3, width - 30, footerY + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(105, 119, 120);
  doc.text('AUTHORIZED SIGNATURE', width - 55, footerY + 8, { align: 'center' });

  // Clean filename and trigger download
  const cleanName = (data.recipientName || 'Award_Recipient').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanId = (data.certificateId || 'CERT').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Certificate_${cleanName}_${cleanId}.pdf`);
};
