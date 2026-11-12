import { useState } from 'react';
import { Award, Download, Loader2, ShieldCheck, X } from 'lucide-react';
import { type CertificateData, generateAwardCertificatePDF } from '../utils/certificateGenerator';

interface CertificatePreviewModalProps {
  certificate: CertificateData | null;
  onClose: () => void;
}

const CertificatePreviewModal = ({ certificate, onClose }: CertificatePreviewModalProps) => {
  const [downloading, setDownloading] = useState(false);

  if (!certificate) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await generateAwardCertificatePDF(certificate);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] rounded-3xl max-w-4xl w-full shadow-2xl border border-[#E2E8F0] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#EA580C]" />
            <span className="font-bold text-sm text-[#111827]">Official Certificate Preview</span>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]">
              {certificate.certificateId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C2410C] hover:bg-[#9A3412] transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {downloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#111827] hover:bg-[#E2E8F0]/50 transition cursor-pointer"
              aria-label="Close certificate preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="p-4 sm:p-8 bg-[#F1F5F9]">
          <div className="relative bg-[#FDFCFA] border-[6px] border-[#1E293B] p-1.5 shadow-xl rounded-sm">
            <div className="relative border-2 border-[#D97706] px-6 sm:px-12 py-8 sm:py-10 text-center">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-7 h-1.5 bg-[#C2410C]" />
              <div className="absolute top-0 left-0 w-1.5 h-7 bg-[#C2410C]" />
              <div className="absolute top-0 right-0 w-7 h-1.5 bg-[#C2410C]" />
              <div className="absolute top-0 right-0 w-1.5 h-7 bg-[#C2410C]" />
              <div className="absolute bottom-0 left-0 w-7 h-1.5 bg-[#C2410C]" />
              <div className="absolute bottom-0 left-0 w-1.5 h-7 bg-[#C2410C]" />
              <div className="absolute bottom-0 right-0 w-7 h-1.5 bg-[#C2410C]" />
              <div className="absolute bottom-0 right-0 w-1.5 h-7 bg-[#C2410C]" />

              {/* Gym Logo & Name */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {certificate.gymLogo && (
                  <img
                    src={certificate.gymLogo}
                    alt={certificate.gymName || 'Gym Logo'}
                    className="w-10 h-10 rounded-lg object-cover border border-[#E2E8F0]"
                  />
                )}
                <span className="text-sm sm:text-base font-extrabold tracking-[0.2em] uppercase text-[#1E293B]">
                  {certificate.gymName || 'GYMORA FITNESS CENTER'}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-wide text-[#C2410C] mb-2">
                CERTIFICATE OF ACHIEVEMENT
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-[#64748B] mb-5">
                THIS PRESTIGIOUS HONOR IS PROUDLY PRESENTED TO
              </p>

              {/* Winner Name */}
              <div className="inline-block border-b-2 border-[#D97706] pb-1.5 px-8 mb-5">
                <p className="text-2xl sm:text-4xl font-serif font-bold text-[#111827]">
                  {certificate.recipientName}
                </p>
              </div>

              {/* Award Title & Category */}
              <div className="space-y-1.5 mb-4">
                <p className="text-lg sm:text-2xl font-extrabold text-[#C2410C]">
                  {certificate.awardTitle}
                </p>
                {certificate.awardCategory && (
                  <p className="text-xs sm:text-sm font-semibold text-[#475569]">
                    Category: {certificate.awardCategory}
                  </p>
                )}
              </div>

              {/* Award Description */}
              {certificate.awardDescription && (
                <p className="text-xs sm:text-sm text-[#334155] max-w-2xl mx-auto leading-relaxed mb-4">
                  {certificate.awardDescription}
                </p>
              )}

              {/* Period & Metric */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-[#64748B] italic mb-8">
                {certificate.awardPeriod && <span>Award Period: {certificate.awardPeriod}</span>}
                {certificate.metricAchieved && <span>Achievement: {certificate.metricAchieved}</span>}
              </div>

              {/* Footer: Date | Seal & ID | Digital Signature */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-4">
                {/* Date */}
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#111827] mb-1.5">
                    {certificate.awardDate}
                  </span>
                  <div className="w-40 border-t border-[#94A3B8] pt-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#64748B]">
                      Achievement Date
                    </span>
                  </div>
                </div>

                {/* Official Seal & Unique Certificate ID */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[#C2410C] border-2 border-[#D97706] flex flex-col items-center justify-center text-white shadow-md">
                    <ShieldCheck className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-extrabold leading-tight tracking-wider">OFFICIAL</span>
                  </div>
                  <div className="px-3 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[11px] font-bold text-[#1E293B]">
                    ID: {certificate.certificateId}
                  </div>
                </div>

                {/* Owner Signature */}
                <div className="flex flex-col items-center">
                  <div className="h-14 flex items-end justify-center mb-1">
                    {certificate.signatureType === 'MANUAL' ? (
                      <span className="text-[10px] italic text-[#94A3B8] pb-1">
                        Authorized Physical Signature
                      </span>
                    ) : certificate.ownerSignatureImage ? (
                      <img
                        src={certificate.ownerSignatureImage}
                        alt="Owner Digital Signature"
                        className="max-h-14 max-w-[160px] object-contain"
                      />
                    ) : (
                      <span className="font-serif italic text-base text-[#1E293B] pb-1">
                        {certificate.ownerName || 'Gym Administration'}
                      </span>
                    )}
                  </div>
                  <div className="w-44 border-t border-[#94A3B8] pt-1">
                    <p className="text-xs font-bold text-[#111827] leading-tight">
                      {certificate.ownerName || 'Gym Owner'}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                      {certificate.ownerDesignation || 'Gym Owner'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreviewModal;

