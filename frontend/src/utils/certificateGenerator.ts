import { jsPDF } from 'jspdf';

export interface CertificateData {
  recipientName: string;
  recipientRole?: string;
  awardTitle: string;
  awardCategory?: string;
  awardDescription?: string;
  awardPeriod?: string;
  gymName?: string;
  gymLogo?: string;
  awardDate: string;
  certificateId: string;
  metricAchieved?: string;
  ownerName?: string;
  ownerDesignation?: string;
  ownerSignatureImage?: string;
  signatureType?: 'DIGITAL' | 'MANUAL';
}

/**
 * Normalizes an award + optional backend certificate snapshot into CertificateData.
 */
export const mapAwardToCertificateData = (award: any): CertificateData => {
  const cert = award?.certificate || {};
  const winnerFromPopulated =
    award?.winnerUserId && typeof award.winnerUserId === 'object'
      ? `${award.winnerUserId.firstName || ''} ${award.winnerUserId.lastName || ''}`.trim()
      : '';

  const rawDate =
    cert.achievementDate ||
    award?.publishedAt ||
    award?.certificateIssuedAt ||
    award?.announcementDate ||
    award?.updatedAt ||
    new Date();

  const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const periodFallback =
    award?.startDate && award?.endDate
      ? `${award.awardPeriod || 'Custom'} (${new Date(award.startDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })} - ${new Date(award.endDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })})`
      : award?.awardPeriod || 'Monthly';

  return {
    recipientName: cert.winnerName || award?.winnerName || winnerFromPopulated || 'Award Recipient',
    recipientRole: cert.winnerRole || award?.winnerRole || award?.recipientType,
    awardTitle: cert.awardTitle || award?.title || 'Fitness Champion Award',
    awardCategory: cert.awardCategory || award?.category,
    awardDescription: cert.awardDescription || award?.description,
    awardPeriod: cert.awardPeriod || periodFallback,
    gymName: cert.gymName || award?.gymId?.name || 'Gymora Fitness Center',
    gymLogo: cert.gymLogo || award?.gymId?.logo,
    awardDate: formattedDate,
    certificateId: cert.certificateId || award?.certificateId || 'CERT-VERIFIED',
    metricAchieved: cert.metricAchieved || award?.winnerMetricAchieved || award?.winnerScore,
    ownerName: cert.ownerName || 'Gym Administration',
    ownerDesignation: cert.ownerDesignation || 'Gym Owner',
    ownerSignatureImage: cert.ownerSignatureImage,
    signatureType: cert.signatureType || award?.signatureType || 'DIGITAL'
  };
};

const loadImageAsDataUrl = (src: string): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG'; width: number; height: number } | null> => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    if (src.startsWith('data:image/')) {
      const img = new Image();
      img.onload = () => {
        const format = src.includes('image/jpeg') || src.includes('image/jpg') ? 'JPEG' : 'PNG';
        resolve({ dataUrl: src, format, width: img.naturalWidth || 200, height: img.naturalHeight || 80 });
      };
      img.onerror = () => resolve(null);
      img.src = src;
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          format: 'PNG',
          width: canvas.width,
          height: canvas.height
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

export const generateAwardCertificatePDF = async (data: CertificateData): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth(); // 297mm
  const height = doc.internal.pageSize.getHeight(); // 210mm

  // Load gym logo & signature concurrently
  const [logoImg, sigImg] = await Promise.all([
    data.gymLogo ? loadImageAsDataUrl(data.gymLogo) : Promise.resolve(null),
    data.ownerSignatureImage ? loadImageAsDataUrl(data.ownerSignatureImage) : Promise.resolve(null)
  ]);

  // Background warm ivory fill
  doc.setFillColor(253, 252, 250);
  doc.rect(0, 0, width, height, 'F');

  // Outer Decorative Border - Deep Slate #1E293B
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(2.6);
  doc.rect(9, 9, width - 18, height - 18);

  // Inner Fine Border - Warm Gold/Amber #D97706
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.9);
  doc.rect(13.5, 13.5, width - 27, height - 27);

  // Corner Accents - Burnt Orange #C2410C
  const cornerSize = 11;
  doc.setFillColor(194, 65, 12);
  doc.rect(9, 9, cornerSize, 2.6, 'F');
  doc.rect(9, 9, 2.6, cornerSize, 'F');
  doc.rect(width - 9 - cornerSize, 9, cornerSize, 2.6, 'F');
  doc.rect(width - 11.6, 9, 2.6, cornerSize, 'F');
  doc.rect(9, height - 11.6, cornerSize, 2.6, 'F');
  doc.rect(9, height - 9 - cornerSize, 2.6, cornerSize, 'F');
  doc.rect(width - 9 - cornerSize, height - 11.6, cornerSize, 2.6, 'F');
  doc.rect(width - 11.6, height - 9 - cornerSize, 2.6, cornerSize, 'F');

  // Top Gym Brand Header (Logo + Name)
  let headerY = 25;
  const gymTitle = (data.gymName || 'GYMORA FITNESS CENTER').toUpperCase();
  if (logoImg) {
    const logoSize = 11;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const textWidth = doc.getTextWidth(gymTitle);
    const totalWidth = logoSize + 4 + textWidth;
    const startX = (width - totalWidth) / 2;
    doc.addImage(logoImg.dataUrl, logoImg.format, startX, 18.5, logoSize, logoSize);
    doc.setTextColor(30, 41, 59);
    doc.text(gymTitle, startX + logoSize + 4, 25.5);
    headerY = 31;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text(gymTitle, width / 2, 26, { align: 'center' });
    headerY = 29;
  }

  // Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(27);
  doc.setTextColor(194, 65, 12);
  doc.text('CERTIFICATE OF ACHIEVEMENT', width / 2, headerY + 13, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text('THIS PRESTIGIOUS HONOR IS PROUDLY PRESENTED TO', width / 2, headerY + 21, { align: 'center' });

  // Recipient Name
  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(17, 24, 39);
  doc.text(data.recipientName || 'Award Recipient', width / 2, headerY + 36, { align: 'center' });

  // Decorative Gold Line below name
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.line(width / 2 - 62, headerY + 40, width / 2 + 62, headerY + 40);

  // Award Title & Category
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(194, 65, 12);
  doc.text(data.awardTitle || 'Fitness Champion Award', width / 2, headerY + 51, { align: 'center' });

  if (data.awardCategory) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Category: ${data.awardCategory}`, width / 2, headerY + 58, { align: 'center' });
  }

  // Award Description (wrapped cleanly)
  let nextY = headerY + 66;
  if (data.awardDescription) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const wrapped = doc.splitTextToSize(data.awardDescription, width - 80).slice(0, 2);
    doc.text(wrapped, width / 2, nextY, { align: 'center' });
    nextY += wrapped.length * 5 + 3;
  }

  // Award Period & Milestone
  const metaParts: string[] = [];
  if (data.awardPeriod) metaParts.push(`Award Period: ${data.awardPeriod}`);
  if (data.metricAchieved) metaParts.push(`Achievement: ${data.metricAchieved}`);
  if (metaParts.length > 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(metaParts.join('   •   '), width / 2, Math.min(nextY + 1, 140), { align: 'center' });
  }

  // Footer: Date | Certificate ID & Seal | Owner Digital Signature
  const footerLineY = 175;

  // Left Column: Achievement Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(17, 24, 39);
  doc.text(data.awardDate || new Date().toLocaleDateString(), 58, footerLineY - 3, { align: 'center' });
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(30, footerLineY, 86, footerLineY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ACHIEVEMENT DATE', 58, footerLineY + 5.5, { align: 'center' });

  // Center Column: Seal & Certificate ID
  doc.setFillColor(194, 65, 12);
  doc.circle(width / 2, footerLineY - 12, 10.5, 'F');
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.circle(width / 2, footerLineY - 12, 8.8, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL', width / 2, footerLineY - 13.5, { align: 'center' });
  doc.text('SEAL', width / 2, footerLineY - 9.5, { align: 'center' });

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(width / 2 - 38, footerLineY + 1, 76, 9, 2, 2, 'FD');
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`ID: ${data.certificateId || 'CERT-VERIFIED'}`, width / 2, footerLineY + 7, { align: 'center' });

  // Right Column: Gym Owner Digital Signature + Name & Designation
  const sigCenterX = width - 58;
  if (data.signatureType !== 'MANUAL') {
    if (sigImg) {
      const maxW = 44;
      const maxH = 16;
      const ratio = Math.min(maxW / sigImg.width, maxH / sigImg.height);
      const drawW = sigImg.width * ratio;
      const drawH = sigImg.height * ratio;
      doc.addImage(sigImg.dataUrl, sigImg.format, sigCenterX - drawW / 2, footerLineY - drawH - 1.5, drawW, drawH);
    } else {
      doc.setFont('times', 'italic');
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text(data.ownerName || 'Gym Administration', sigCenterX, footerLineY - 3, { align: 'center' });
    }
  }

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(width - 86, footerLineY, width - 30, footerLineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(data.ownerName || 'Gym Owner', sigCenterX, footerLineY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text((data.ownerDesignation || 'Gym Owner').toUpperCase(), sigCenterX, footerLineY + 9.5, { align: 'center' });

  const safeName = (data.recipientName || 'Award').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeId = (data.certificateId || 'CERT').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${safeName}_${safeId}_Certificate.pdf`);
};
